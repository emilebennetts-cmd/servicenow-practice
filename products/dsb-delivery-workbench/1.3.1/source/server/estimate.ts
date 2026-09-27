import { T, each, val, num, propNum, roundQuarter, getRecord, count } from './common.ts';
/*
 * Effort model v2 (assessment DSB-04).
 * v1.6 covered build + design/test/deploy overheads only. v2 adds the engagement
 * activities a SOW needs: discovery and workshops, project management, UAT support,
 * data remediation, hypercare and contingency. All factors are system properties.
 */
const CLASS_FACTOR = { oob: 0.5, configuration: 1.0, customisation: 1.6 };
export function componentHours(c) {
    const override = num(c, 'hours_override');
    if (override > 0)
        return roundQuarter(override);
    let base = 2;
    const typeId = val(c, 'component_type');
    if (typeId) {
        const t = getRecord(T.componentType, typeId);
        if (t)
            base = num(t, 'base_hours') || 2;
    }
    const factor = CLASS_FACTOR[val(c, 'build_class')] ?? 1;
    const upgrade = val(c, 'upgrade_impact') === 'high' ? 1.2 : 1;
    return roundQuarter(base * factor * upgrade);
}
export function estimate(engagementId) {
    const q = `engagement=${engagementId}`;
    let build = 0;
    const byPhase = {};
    each(T.component, q, (c) => {
        const h = componentHours(c);
        build += h;
        const phase = c.component_type ? String(c.component_type.build_phase || 'Other') : 'Other';
        byPhase[phase] = (byPhase[phase] || 0) + h;
    });
    const reqs = count(T.requirement, q + '^moscow!=wont');
    const musts = count(T.requirement, q + '^moscow=must');
    const atf = count(T.test, q + '^kind=atf');
    const sets = count(T.updateSet, q + '^status!=backed_out');
    const dataComps = count(T.component, q + '^capture=data');
    const eng = getRecord(T.engagement, engagementId);
    const path = eng ? val(eng, 'delivery_path') : 'standard';
    const lines = [];
    const add = (line, basis, hours) => lines.push({ line, basis, hours: roundQuarter(hours) });
    const discovery = path === 'express' || path === 'emergency' ? 0 : propNum('effort.discovery_base_hours', 8) + reqs * propNum('effort.discovery_hours_per_requirement', 0.5);
    add('Discovery and requirements workshops', `${reqs} requirements`, discovery);
    add('Build', 'Sum of component hours (type base x class factor x upgrade impact)', build);
    add('Solution and technical design', `${propNum('effort.pct_design', 0.1) * 100}% of build`, build * propNum('effort.pct_design', 0.1));
    add('Testing (SIT, PVT) and ATF', `${propNum('effort.pct_test', 0.15) * 100}% of build + ${propNum('effort.hours_per_atf', 1)} h per ATF test (${atf})`, build * propNum('effort.pct_test', 0.15) + atf * propNum('effort.hours_per_atf', 1));
    add('UAT support', `${propNum('effort.hours_uat_per_must', 0.5)} h per Must requirement (${musts})`, path === 'express' ? 0 : musts * propNum('effort.hours_uat_per_must', 0.5));
    add('Data remediation / loads', `${propNum('effort.hours_per_data_component', 2)} h per data-captured component (${dataComps})`, dataComps * propNum('effort.hours_per_data_component', 2));
    add('Deployment', `${propNum('effort.pct_deploy', 0.05) * 100}% of build + ${propNum('effort.hours_per_update_set', 0.5)} h per update set (${sets})`, build * propNum('effort.pct_deploy', 0.05) + sets * propNum('effort.hours_per_update_set', 0.5));
    add('Hypercare', path === 'complex' ? 'Complex path' : path === 'standard' ? 'Standard path' : 'Not planned', path === 'complex' ? propNum('effort.hypercare_complex_hours', 16) : path === 'standard' ? propNum('effort.hypercare_standard_hours', 8) : 0);
    const subtotal = lines.reduce((s, l) => s + l.hours, 0);
    add('Project management and governance', `${propNum('effort.pct_pm', 0.12) * 100}% of subtotal`, path === 'express' ? 0 : subtotal * propNum('effort.pct_pm', 0.12));
    const withPm = lines.reduce((s, l) => s + l.hours, 0);
    const contPct = path === 'complex' ? propNum('effort.pct_contingency_complex', 0.2) : propNum('effort.pct_contingency', 0.1);
    add('Contingency', `${Math.round(contPct * 100)}% (${path} path)`, withPm * contPct);
    const total = roundQuarter(lines.reduce((s, l) => s + l.hours, 0));
    return { lines, total, build: roundQuarter(build), byPhase };
}
