import { T, each, count, val, bool, getRecord, gr, nowValue } from './common.ts';
import { estimate } from './estimate.ts';
/*
 * Gate engine. Every check belongs to a gate (G0-G6) and a stage. A check is "High"
 * (blocks approval of its gate) or "Medium" (warning). Severity can depend on the
 * delivery path so Express work is not forced through a full project process, while
 * the six non-negotiable controls stay on every path.
 */
export const GATES = ['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6'];
export const GATE_LABEL = {
    g0: 'G0 Qualified',
    g1: 'G1 Requirements agreed',
    g2: 'G2 Design signed off',
    g3: 'G3 Built and tested',
    g4: 'G4 UAT accepted',
    g5: 'G5 Production PVT passed',
    g6: 'G6 Handover accepted',
};
export const GATE_STATE = {
    g0: 'qualified',
    g1: 'requirements_agreed',
    g2: 'design_signed_off',
    g3: 'built',
    g4: 'uat_accepted',
    g5: 'live',
    g6: 'handed_over',
};
/** Gates each path must pass. Express skips G1/G2 approvals as separate events (checks still run at G3) and G6. */
export const PATH_GATES = {
    express: ['g0', 'g3', 'g5'],
    standard: ['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6'],
    complex: ['g0', 'g1', 'g2', 'g3', 'g4', 'g5', 'g6'],
    emergency: ['g0', 'g3', 'g5'],
};
const HIGH = 'High';
const MED = 'Medium';
function list(engId, table, extra) {
    const nums = [];
    const n = each(table, `engagement=${engId}^${extra}`, (r) => {
        if (nums.length < 8)
            nums.push(val(r, 'number') || val(r, 'title') || val(r, 'name'));
    });
    return { n, nums };
}
/** One pass over child tables so per-requirement checks do not issue a query per requirement. */
function reqIndex(engId) {
    const covered = {};
    const adr = {};
    const atf = {};
    const uat = {};
    each(T.component, `engagement=${engId}^requirementsISNOTEMPTY`, (c) => val(c, 'requirements').split(',').forEach((r) => (covered[r] = true)));
    each(T.decision, `engagement=${engId}^requirementsISNOTEMPTY`, (d) => val(d, 'requirements').split(',').forEach((r) => (adr[r] = true)));
    each(T.test, `engagement=${engId}^kind=atf^atf_statusINbuilt,pass^requirementISNOTEMPTY`, (t) => (atf[val(t, 'requirement')] = true));
    each(T.test, `engagement=${engId}^kind=uat^result=pass^requirementISNOTEMPTY`, (t) => (uat[val(t, 'requirement')] = true));
    return { covered, adr, atf, uat };
}
export function evaluate(engId) {
    const e = getRecord(T.engagement, engId);
    if (!e)
        return [];
    const path = val(e, 'delivery_path') || 'standard';
    const heavy = path === 'standard' || path === 'complex';
    const F = [];
    const idx = reqIndex(engId);
    const add = (gate, sev, stage, text, table, extra, n) => F.push({ gate, sev, stage, text, table, query: table ? `engagement=${engId}^${extra || ''}` : undefined, count: n });
    const chk = (gate, sev, stage, table, extra, text) => {
        const r = list(engId, table, extra);
        if (r.n > 0)
            add(gate, sev, stage, text(r.n, r.nums), table, extra, r.n);
    };
    /* ---------- G0 Qualified ---------- */
    if (!val(e, 'name') || !val(e, 'client') || !val(e, 'problem'))
        add('g0', HIGH, 'intake', 'Intake incomplete: engagement name, client and problem statement are required.');
    const suggested = val(e, 'path_suggested');
    const order = ['express', 'standard', 'complex'];
    if (suggested && path !== 'emergency' && order.indexOf(path) < order.indexOf(suggested))
        add('g0', heavy ? MED : HIGH, 'intake', `Delivery path "${path}" is below what the criteria suggest ("${suggested}"). Move the path up or record a delivery-lead waiver.`);
    chk('g0', path === 'express' ? HIGH : MED, 'intake', T.entitlement, 'needed_by_pattern=true^status=unknown', (n) => `${n} licence product(s) needed by applied patterns are still "Unknown".`);
    if (val(e, 'ai_consent') === 'not_asked')
        add('g0', MED, 'intake', 'Client has not been asked about AI-assisted design. The Build Brief export stays blocked until it is approved.');
    /* ---------- G1 Requirements agreed ---------- */
    const reqs = count(T.requirement, `engagement=${engId}`);
    if (reqs === 0)
        add('g1', HIGH, 'requirements', 'No requirements captured.');
    if (!val(e, 'instance_name'))
        add('g1', HIGH, 'intake', 'Target sub-production instance name is not set. Evidence and deployment scripts cannot be generated without it.');
    if (heavy && count(T.outcome, `engagement=${engId}`) === 0)
        add('g1', HIGH, 'intake', 'No business outcomes recorded (outcome, measure, target).');
    chk('g1', HIGH, 'requirements', T.requirement, 'acceptance_criteriaLIKE<', (n, x) => `${n} requirement(s) still have placeholders such as <target %> in acceptance criteria: ${x.join(', ')}.`);
    chk('g1', HIGH, 'requirements', T.requirement, 'moscow=must^acceptance_criteriaISEMPTY', (n, x) => `${n} Must requirement(s) have no acceptance criteria: ${x.join(', ')}.`);
    chk('g1', MED, 'requirements', T.requirement, 'moscow!=must^acceptance_criteriaISEMPTY', (n) => `${n} other requirement(s) have no acceptance criteria.`);
    if (heavy)
        chk('g1', MED, 'requirements', T.requirement, 'outcomeISEMPTY', (n) => `${n} requirement(s) are not linked to a business outcome.`);
    chk('g1', path === 'complex' ? HIGH : MED, 'evidence', T.evidence, 'statusINrequested,outstanding', (n) => `${n} evidence item(s) are still requested or outstanding.`);
    chk('g1', MED, 'evidence', T.evidence, 'scriptISNOTEMPTY^reviewed_by_second=false^status=received', (n) => `${n} evidence script(s) were run without a second-person review.`);
    /* ---------- G2 Design signed off ---------- */
    const g2 = heavy ? 'g2' : 'g3';
    chk(g2, HIGH, 'fitgap', T.requirement, 'fit=unassessed^moscow!=wont', (n, x) => `${n} requirement(s) not yet assessed for fit: ${x.join(', ')}.`);
    chk(g2, HIGH, 'fitgap', T.requirement, 'fit=customisation^justificationISEMPTY', (n, x) => `Customisation without justification: ${x.join(', ')}.`);
    chk(g2, HIGH, 'fitgap', T.requirement, 'fitINcustomisation,integration^architect_reviewed=false', (n, x) => `${n} customisation / integration requirement(s) need architect review: ${x.join(', ')}.`);
    chk(g2, HIGH, 'fitgap', T.requirement, 'licensingINconfirm,required^moscow!=wont', (n, x) => `${n} requirement(s) have licensing Confirm or Required: ${x.join(', ')}.`);
    chk(g2, HIGH, 'intake', T.entitlement, 'needed_by_pattern=true^status=unknown', (n) => `${n} licence product(s) needed by applied patterns are "Unknown". Confirm entitlements in writing.`);
    chk(g2, HIGH, 'rad', T.rad, 'kindINrisk,issue^rag=red^status=open', (n, x) => `${n} red risk(s)/issue(s) still open: ${x.join(', ')}. Treat, or accept with an owner role and reference.`);
    chk(g2, HIGH, 'rad', T.rad, 'status=accepted^owner_roleISEMPTY^ORaccepted_refISEMPTY', (n) => `${n} accepted risk(s) lack an owner role or acceptance reference.`);
    chk(g2, MED, 'rad', T.rad, 'kind=assumption^status=open', (n) => `${n} assumption(s) still open (validate or convert to a decision).`);
    if (reqs > 0 && count(T.component, `engagement=${engId}`) === 0)
        add(g2, HIGH, 'design', 'Requirements exist but no components are defined.');
    const uncovered = (moscow) => {
        const nums = [];
        each(T.requirement, `engagement=${engId}^moscow=${moscow}`, (r) => {
            if (!idx.covered[r.getUniqueValue()])
                nums.push(val(r, 'number'));
        });
        return nums;
    };
    const mustGap = uncovered('must');
    if (mustGap.length)
        add(g2, HIGH, 'design', `${mustGap.length} Must requirement(s) have no component: ${mustGap.slice(0, 8).join(', ')}.`);
    const shouldGap = uncovered('should');
    if (shouldGap.length)
        add(g2, MED, 'design', `${shouldGap.length} Should requirement(s) have no component.`);
    chk(g2, HIGH, 'design', T.component, 'build_class=customisation^justificationISEMPTY', (n, x) => `Custom components without justification: ${x.join(', ')}.`);
    if (heavy) {
        const noAdr = [];
        each(T.requirement, `engagement=${engId}^fit=customisation`, (r) => {
            if (!idx.adr[r.getUniqueValue()])
                noAdr.push(val(r, 'number'));
        });
        if (noAdr.length)
            add(g2, path === 'complex' ? HIGH : MED, 'design', `${noAdr.length} customisation(s) have no architecture decision record: ${noAdr.slice(0, 8).join(', ')}.`);
    }
    /* ---------- G3 Built, reviewed and tested ---------- */
    chk('g3', HIGH, 'build', T.component, 'build_status!=reviewed^ORreview_refISEMPTY', (n, x) => `${n} component(s) not peer reviewed with a reference (reviewer is not the author): ${x.join(', ')}.`);
    chk('g3', HIGH, 'updatesets', T.component, 'capture=captured^update_setISEMPTY', (n, x) => `${n} captured component(s) not assigned to an update set: ${x.join(', ')}.`);
    chk('g3', heavy ? HIGH : MED, 'tests', T.test, 'kindINpvt,sit^environment!=prod^result!=pass', (n) => `${n} SIT / PVT test(s) in non-production have not passed.`);
    if (heavy) {
        const noAtf = [];
        each(T.requirement, `engagement=${engId}^moscow=must`, (r) => {
            if (!idx.atf[r.getUniqueValue()])
                noAtf.push(val(r, 'number'));
        });
        if (noAtf.length)
            add('g3', path === 'complex' ? HIGH : MED, 'tests', `${noAtf.length} Must requirement(s) have no built or passing ATF test: ${noAtf.slice(0, 8).join(', ')}.`);
    }
    chk('g3', HIGH, 'tests', T.defect, 'severityIN1,2^stateINopen,in_progress,fixed', (n, x) => `${n} open severity 1-2 defect(s): ${x.join(', ')}.`);
    /* ---------- G4 UAT accepted ---------- */
    if (heavy) {
        const noUat = [];
        each(T.requirement, `engagement=${engId}^moscow=must`, (r) => {
            if (!idx.uat[r.getUniqueValue()])
                noUat.push(val(r, 'number'));
        });
        if (noUat.length)
            add('g4', HIGH, 'tests', `${noUat.length} Must requirement(s) have no passed UAT test: ${noUat.slice(0, 8).join(', ')}.`);
        chk('g4', HIGH, 'tests', T.requirement, 'moscow=must^acceptance!=accepted', (n) => `${n} Must requirement(s) not yet accepted by the client (with a reference).`);
        chk('g4', HIGH, 'tests', T.requirement, 'acceptance=accepted^acceptance_refISEMPTY', (n) => `${n} accepted requirement(s) have no acceptance reference.`);
    }
    if (count(T.release, `engagement=${engId}^rollback_planISNOTEMPTY`) === 0)
        add(heavy ? 'g4' : 'g5', HIGH, 'release', 'No release record with a rollback plan.');
    /* ---------- G5 Production PVT ---------- */
    if (count(T.release, `engagement=${engId}^statusINdeployed,verified^change_refISNOTEMPTY^cab_refISNOTEMPTY`) === 0)
        add('g5', HIGH, 'release', 'No release deployed with a change record and CAB approval reference.');
    chk('g5', path === 'complex' ? HIGH : MED, 'release', T.release, 'rollback_tested=false^status!=backed_out', (n) => `${n} release(s) have an untested rollback plan.`);
    if (count(T.test, `engagement=${engId}^kind=pvt^environment=prod`) === 0)
        add('g5', HIGH, 'tests', 'No production PVT tests recorded.');
    chk('g5', HIGH, 'tests', T.test, 'kind=pvt^environment=prod^result!=pass', (n) => `${n} production PVT test(s) have not passed.`);
    chk('g5', HIGH, 'updatesets', T.updateSet, 'status!=production^status!=backed_out', (n, x) => `${n} update set(s) not yet deployed to production: ${x.join(', ')}.`);
    /* ---------- G6 Handover ---------- */
    if (!val(e, 'support_owner_role'))
        add('g6', HIGH, 'handover', 'Support owner (role) not recorded.');
    chk('g6', MED, 'handover', T.defect, 'state=deferred^known_error=false', (n) => `${n} deferred defect(s) not published as known errors.`);
    if (!val(e, 'design_notes'))
        add('g6', MED, 'handover', 'Solution design / as-built notes are empty.');
    chk('g6', MED, 'handover', T.outcome, 'achievedISEMPTY', (n) => `${n} outcome(s) have no achieved value recorded.`);
    return F;
}
export function gateApproved(engId, gate) {
    return count(T.gate, `engagement=${engId}^gate=${gate}^statusINapproved,waived`) > 0;
}
/** Previous gate that must be approved or waived before `gate` can be. */
export function previousRequiredGate(path, gate) {
    const seq = PATH_GATES[path] || PATH_GATES.standard;
    const i = seq.indexOf(gate);
    if (i <= 0)
        return null;
    return seq[i - 1];
}
/** Blocking findings for a gate: that gate's own High findings plus any earlier gate's High findings
 *  that the path folds into it (e.g. Express folds G1/G2 checks into G3). */
export function blockersFor(engId, gate, findings) {
    const all = findings || evaluate(engId);
    const e = getRecord(T.engagement, engId);
    const path = e ? val(e, 'delivery_path') : 'standard';
    const seq = PATH_GATES[path] || PATH_GATES.standard;
    const idx = GATES.indexOf(gate);
    const prevIdx = (() => {
        const i = seq.indexOf(gate);
        return i > 0 ? GATES.indexOf(seq[i - 1]) : -1;
    })();
    return all.filter((f) => {
        const fi = GATES.indexOf(f.gate);
        return f.sev === HIGH && fi <= idx && fi > prevIdx;
    });
}
export function lifecycleFor(engId) {
    const e = getRecord(T.engagement, engId);
    if (!e)
        return 'draft';
    const path = val(e, 'delivery_path') || 'standard';
    const seq = PATH_GATES[path] || PATH_GATES.standard;
    let state = 'draft';
    for (const g of seq) {
        if (!gateApproved(engId, g))
            break;
        state = GATE_STATE[g];
    }
    if (state === 'live' && seq[seq.length - 1] === 'g5')
        state = 'handed_over';
    return state;
}
const STAGES = [
    { key: 'intake', label: 'Intake & licensing', phase: 'Define' },
    { key: 'requirements', label: 'Requirements', phase: 'Define' },
    { key: 'evidence', label: 'Evidence', phase: 'Analyse' },
    { key: 'fitgap', label: 'Fit-gap', phase: 'Analyse' },
    { key: 'rad', label: 'Risks, assumptions, dependencies', phase: 'Analyse' },
    { key: 'design', label: 'Solution design', phase: 'Design & build' },
    { key: 'build', label: 'Build plan & review', phase: 'Design & build' },
    { key: 'updatesets', label: 'Update sets', phase: 'Design & build' },
    { key: 'tests', label: 'UAT, PVT & ATF', phase: 'Test & hand over' },
    { key: 'release', label: 'Release', phase: 'Test & hand over' },
    { key: 'handover', label: 'Handover', phase: 'Test & hand over' },
];
/** Full cockpit payload: gates, findings, stage status, metrics, next best action. Also persists summary fields. */
export function cockpit(engId, persist = true) {
    const e = getRecord(T.engagement, engId);
    if (!e)
        return null;
    const path = val(e, 'delivery_path') || 'standard';
    const seq = PATH_GATES[path] || PATH_GATES.standard;
    const findings = evaluate(engId);
    const gates = GATES.map((g) => {
        const rec = gr(T.gate);
        rec.addQuery('engagement', engId);
        rec.addQuery('gate', g);
        rec.orderByDesc('sys_created_on');
        rec.setLimit(1);
        rec.query();
        const has = rec.next();
        return {
            gate: g,
            label: GATE_LABEL[g],
            inPath: seq.indexOf(g) >= 0,
            status: has ? val(rec, 'status') : 'not_requested',
            sysId: has ? rec.getUniqueValue() : '',
            approvalRef: has ? val(rec, 'approval_ref') : '',
            approverRole: has ? val(rec, 'approver_role') : '',
            decidedOn: has ? val(rec, 'decided_on') : '',
            blockers: blockersFor(engId, g, findings).length,
            previous: previousRequiredGate(path, g),
        };
    });
    const q = `engagement=${engId}`;
    const metrics = {
        outcomes: count(T.outcome, q),
        requirements: count(T.requirement, q),
        musts: count(T.requirement, q + '^moscow=must'),
        unassessed: count(T.requirement, q + '^fit=unassessed'),
        evidenceOpen: count(T.evidence, q + '^statusINrequested,outstanding'),
        evidence: count(T.evidence, q),
        risksOpen: count(T.rad, q + '^kindINrisk,issue^status=open'),
        redRisks: count(T.rad, q + '^kindINrisk,issue^status=open^rag=red'),
        components: count(T.component, q),
        custom: count(T.component, q + '^build_class=customisation'),
        buildTasks: count(T.buildTask, q),
        buildDone: count(T.buildTask, q + '^status=done'),
        updateSets: count(T.updateSet, q),
        tests: count(T.test, q),
        testsPassed: count(T.test, q + '^result=pass'),
        atf: count(T.test, q + '^kind=atf'),
        defectsOpen: count(T.defect, q + '^stateINopen,in_progress,fixed'),
        licenceUnknown: count(T.entitlement, q + '^needed_by_pattern=true^status=unknown'),
        releases: count(T.release, q),
    };
    const est = estimate(engId);
    const stages = STAGES.map((s) => {
        const mine = findings.filter((f) => f.stage === s.key);
        const high = mine.filter((f) => f.sev === HIGH).length;
        return { ...s, high, medium: mine.length - high, status: high ? 'attention' : mine.length ? 'in_progress' : 'ok' };
    });
    const firstOpenGate = gates.find((g) => g.inPath && g.status !== 'approved' && g.status !== 'waived');
    let next = { text: 'All gates in this path are approved. Close the engagement after warranty.', stage: 'handover' };
    if (firstOpenGate) {
        const b = blockersFor(engId, firstOpenGate.gate, findings);
        next = b.length
            ? { text: `${firstOpenGate.label}: ${b[0].text}`, stage: b[0].stage }
            : { text: `${firstOpenGate.label} has no blockers. Record the approval with its reference.`, stage: 'gates' };
    }
    // Readiness: share of stages with no findings (complete = 1, warnings only = 0.5, High findings = 0).
    const readiness = Math.round((stages.reduce((sum, s) => sum + (s.status === 'ok' ? 1 : s.status === 'in_progress' ? 0.5 : 0), 0) / stages.length) * 100);
    const highOpen = firstOpenGate ? blockersFor(engId, firstOpenGate.gate, findings).length : 0;
    const lifecycle = lifecycleFor(engId);
    if (persist) {
        e.setValue('estimate_hours', est.total);
        e.setValue('readiness', readiness);
        e.setValue('high_blockers', highOpen);
        e.setValue('next_action', next.text.slice(0, 400));
        e.setValue('gate_evaluated_on', nowValue());
        e.setValue('lifecycle_state', lifecycle);
        e.update();
    }
    return {
        engagement: {
            sysId: engId,
            number: val(e, 'number'),
            name: val(e, 'name'),
            client: val(e, 'client'),
            path,
            pathSuggested: val(e, 'path_suggested'),
            lifecycle,
            aiConsent: val(e, 'ai_consent'),
            instance: val(e, 'instance_name'),
            release: val(e, 'family_release'),
            libraryVersion: val(e, 'library_version'),
            greenfield: bool(e, 'greenfield'),
            problem: val(e, 'problem'),
        },
        gates,
        findings,
        stages,
        metrics,
        estimate: est,
        readiness,
        next,
    };
}
