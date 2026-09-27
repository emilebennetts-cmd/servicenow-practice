import { T, gr, val, bool, num, each, count, getRecord, safeJson, logHistory } from './common.ts';
import { LIB_VERSION } from './libdata.ts';
function terms(json) {
    const list = safeJson(json, []) || [];
    const out = [];
    list.forEach((t) => {
        try {
            out.push(new RegExp(t.re, t.flags || ''));
        }
        catch (e) {
            /* ignore invalid pattern term */
        }
    });
    return out;
}
export function detect(text) {
    const s = String(text || '');
    const results = [];
    each(T.pattern, 'active=true', (p) => {
        const trig = terms(val(p, 'triggers'));
        const strong = terms(val(p, 'strong_terms'));
        const excl = terms(val(p, 'exclude_terms'));
        const hitTerms = trig.filter((r) => r.test(s)).map((r) => r.source);
        const strongHits = strong.filter((r) => r.test(s)).map((r) => r.source);
        const excluded = excl.some((r) => r.test(s));
        const score = hitTerms.length + 2 * strongHits.length - (excluded ? 3 : 0);
        const minHits = num(p, 'min_hits') || 2;
        if (score >= 3 || (hitTerms.length >= minHits && !excluded)) {
            results.push({
                key: val(p, 'key'),
                name: val(p, 'name'),
                summary: val(p, 'summary'),
                score,
                confidence: score >= 6 ? 'High' : score >= 4 ? 'Medium' : 'Possible',
                matched: hitTerms.concat(strongHits.map((x) => `${x} (strong)`)),
                licence: val(p, 'licence_products'),
                requires: val(p, 'requires'),
                verified: bool(p, 'verified'),
                indicativeCases: num(p, 'indicative_cases'),
            });
        }
    });
    results.sort((a, b) => b.score - a.score);
    if (!results.length && /\b(app|application|register|track|form|approval|onboard|request|portal)\b/i.test(s)) {
        const p = gr(T.pattern);
        if (p.get('key', 'app-engine-greenfield'))
            results.push({ key: 'app-engine-greenfield', name: val(p, 'name'), summary: val(p, 'summary'), score: 0, confidence: 'Fallback', matched: [], licence: val(p, 'licence_products'), requires: '', verified: bool(p, 'verified'), indicativeCases: 0 });
    }
    return results;
}
/* ================= Apply / remove ================= */
const REQ_TYPE = { Process: 'process', Data: 'data', Integration: 'integration', 'UI / Experience': 'ui', Reporting: 'reporting', 'Security / Access': 'security', 'Non-functional': 'nfr' };
const MOSCOW = { Must: 'must', Should: 'should', Could: 'could', "Won't": 'wont' };
const PERSONA = { 'End user': 'end_user', Fulfiller: 'fulfiller', Approver: 'approver', Manager: 'manager', Administrator: 'administrator', 'Integration / system': 'integration' };
const CLS = { 'Out of the box': 'oob', Configuration: 'configuration', Customisation: 'customisation' };
const UPG = { Low: 'low', Medium: 'medium', High: 'high' };
function items(patternId, kind) {
    const out = [];
    each(T.patternItem, `pattern=${patternId}^kind=${kind}`, (i) => {
        out.push({ sysId: i.getUniqueValue(), title: val(i, 'title'), body: val(i, 'body'), share: val(i, 'share_key'), seq: num(i, 'seq'), modifies: bool(i, 'modifies_data'), data: safeJson(val(i, 'data'), {}) || {} });
    }, 'seq');
    return out;
}
function componentTypeId(name) {
    const t = gr(T.componentType);
    if (t.get('name', name))
        return t.getUniqueValue();
    const o = gr(T.componentType);
    return o.get('name', 'Other') ? o.getUniqueValue() : '';
}
function ensureEntitlements(engId, keys) {
    const status = {};
    keys.forEach((k) => {
        const prod = gr(T.licenceProduct);
        if (!prod.get('key', k))
            return;
        const ent = gr(T.entitlement);
        ent.addQuery('engagement', engId);
        ent.addQuery('product', prod.getUniqueValue());
        ent.query();
        if (ent.next()) {
            if (!bool(ent, 'needed_by_pattern')) {
                ent.setValue('needed_by_pattern', true);
                ent.update();
            }
            status[k] = val(ent, 'status');
        }
        else {
            const n = gr(T.entitlement);
            n.initialize();
            n.setValue('engagement', engId);
            n.setValue('product', prod.getUniqueValue());
            n.setValue('status', 'unknown');
            n.setValue('needed_by_pattern', true);
            n.insert();
            status[k] = 'unknown';
        }
    });
    return status;
}
function licensingFor(status) {
    const v = Object.keys(status).map((k) => status[k]);
    if (!v.length)
        return 'none';
    if (v.indexOf('not_entitled') >= 0)
        return 'required';
    if (v.indexOf('unknown') >= 0)
        return 'confirm';
    return 'none';
}
function insert(table, fields) {
    const r = gr(table);
    r.initialize();
    Object.keys(fields).forEach((k) => {
        if (fields[k] !== undefined && fields[k] !== null && fields[k] !== '')
            r.setValue(k, fields[k]);
    });
    return r.insert() || '';
}
function findShared(table, engId, share) {
    if (!share)
        return null;
    const r = gr(table);
    r.addQuery('engagement', engId);
    r.addQuery('share_key', share);
    r.query();
    return r.next() ? r : null;
}
/**
 * Apply a pattern: seeds requirements (Unassessed; licensing from entitlements), evidence scripts,
 * components, decisions, RAID items, update-set plans and ATF outlines. Shared keys merge overlaps.
 * `selected` = requirement seq numbers to take (null = all).
 */
export function applyPattern(engId, key, selected) {
    const e = getRecord(T.engagement, engId);
    const p = gr(T.pattern);
    if (!e || !p.get('key', key))
        throw new Error(`Pattern ${key} or engagement not found.`);
    if (count(T.appliedPattern, `engagement=${engId}^pattern=${p.getUniqueValue()}`) > 0)
        throw new Error(`Pattern ${key} is already applied. Remove it first to re-apply.`);
    const pid = p.getUniqueValue();
    const created = { requirements: 0, merged: 0, evidence: 0, components: 0, decisions: 0, raid: 0, updateSets: 0, atf: 0 };
    const licKeys = val(p, 'licence_products').split(',').filter(Boolean);
    const lic = licensingFor(ensureEntitlements(engId, licKeys));
    const client = val(e, 'client').replace(/[^A-Za-z0-9]+/g, '').slice(0, 20) || 'Client';
    // Requirements
    const reqMap = {};
    items(pid, 'requirement').forEach((it) => {
        if (selected && selected.indexOf(it.seq) < 0)
            return;
        const shared = findShared(T.requirement, engId, it.share);
        if (shared) {
            reqMap[it.seq] = shared.getUniqueValue();
            created.merged++;
            return;
        }
        reqMap[it.seq] = insert(T.requirement, {
            engagement: engId,
            title: it.title,
            req_type: REQ_TYPE[it.data.type] || 'process',
            moscow: MOSCOW[it.data.moscow] || 'should',
            persona: PERSONA[it.data.persona] || '',
            acceptance_criteria: it.body,
            fit: 'unassessed',
            licensing: lic,
            pattern_key: key,
            share_key: it.share,
            seeded: true,
        });
        created.requirements++;
    });
    // Evidence scripts (read only)
    items(pid, 'evidence_script').forEach((it) => {
        if (it.data.key && count(T.evidence, `engagement=${engId}^script_key=${it.data.key}`) > 0)
            return;
        insert(T.evidence, { engagement: engId, item: it.title, why: it.data.why, unblocks: it.data.unblocks, script: it.body, script_key: it.data.key, status: 'requested', pattern_key: key, seeded: true });
        created.evidence++;
    });
    // Components
    items(pid, 'component').forEach((it) => {
        const idx = Array.isArray(it.data.req) ? it.data.req : [];
        const reqIds = idx.map((i) => reqMap[i]).filter(Boolean);
        if (idx.length && !reqIds.length)
            return; // none of its requirements were selected
        const shared = findShared(T.component, engId, it.share);
        if (shared) {
            const cur = val(shared, 'requirements').split(',').filter(Boolean);
            reqIds.forEach((r) => {
                if (cur.indexOf(r) < 0)
                    cur.push(r);
            });
            shared.setValue('requirements', cur.join(','));
            shared.update();
            created.merged++;
            return;
        }
        insert(T.component, {
            engagement: engId,
            name: it.title,
            component_type: componentTypeId(it.data.type || 'Other'),
            build_class: CLS[it.data.cls] || 'configuration',
            target_scope: String(it.data.scope || '').toLowerCase() === 'global' ? 'global' : 'application',
            description: it.body,
            justification: it.data.justification,
            upgrade_impact: UPG[it.data.upgrade] || 'low',
            requirements: reqIds.join(','),
            pattern_key: key,
            share_key: it.share,
            seeded: true,
        });
        created.components++;
    });
    items(pid, 'decision').forEach((it) => {
        insert(T.decision, { engagement: engId, title: it.title, context: it.body, status: 'proposed', pattern_key: key, seeded: true });
        created.decisions++;
    });
    items(pid, 'risk').forEach((it) => {
        insert(T.rad, { engagement: engId, kind: 'risk', title: it.title, description: it.body, category: String(it.data.cat || '').toLowerCase(), likelihood: it.data.l || 3, impact: it.data.i || 3, treatment: it.data.treat, status: 'open', pattern_key: key, seeded: true });
        created.raid++;
    });
    items(pid, 'assumption').forEach((it) => {
        insert(T.rad, { engagement: engId, kind: 'assumption', title: it.title, description: it.body, treatment: it.data.validate, status: 'open', pattern_key: key, seeded: true });
        created.raid++;
    });
    items(pid, 'dependency').forEach((it) => {
        insert(T.rad, { engagement: engId, kind: 'dependency', title: it.title, category: String(it.data.type || '').toLowerCase().replace(' ', '_'), status: 'open', pattern_key: key, seeded: true });
        created.raid++;
    });
    items(pid, 'update_set').forEach((it) => {
        const name = it.title.replace(/<client>/gi, client);
        if (count(T.updateSet, `engagement=${engId}^name=${name}`) > 0)
            return;
        insert(T.updateSet, { engagement: engId, name, target_scope: it.data.scope || 'global', contents: it.body, status: 'planned', commit_order: (it.seq + 1) * 10, pattern_key: key, seeded: true });
        created.updateSets++;
    });
    items(pid, 'atf').forEach((it) => {
        const reqId = typeof it.data.req === 'number' ? reqMap[it.data.req] : '';
        if (typeof it.data.req === 'number' && !reqId)
            return;
        insert(T.test, { engagement: engId, kind: 'atf', title: it.title, requirement: reqId, steps: it.body, expected: it.data.note, atf_status: 'not_built', environment: 'test', pattern_key: key, seeded: true });
        created.atf++;
    });
    const total = Object.keys(created).reduce((s, k) => s + (k === 'merged' ? 0 : created[k]), 0);
    insert(T.appliedPattern, { engagement: engId, pattern: pid, library_version: val(p, 'library_version') || LIB_VERSION, pattern_verified: bool(p, 'verified'), records_created: total });
    e.setValue('library_version', val(p, 'library_version') || LIB_VERSION);
    e.update();
    const missing = val(p, 'requires')
        .split(',')
        .filter(Boolean)
        .filter((k) => {
        const q = gr(T.pattern);
        return q.get('key', k) ? count(T.appliedPattern, `engagement=${engId}^pattern=${q.getUniqueValue()}`) === 0 : false;
    });
    logHistory(engId, 'Pattern applied', `${key}: ${JSON.stringify(created)}${missing.length ? '; prerequisite not applied: ' + missing.join(', ') : ''}`, T.appliedPattern, key, 'intake');
    return { created, missingPrerequisites: missing, verified: bool(p, 'verified') };
}
/** Remove a pattern: deletes records it seeded that nobody has edited, and keeps anything shared with another applied pattern. */
export function removePattern(engId, key) {
    const p = gr(T.pattern);
    if (!p.get('key', key))
        throw new Error(`Pattern ${key} not found.`);
    const otherShares = [];
    each(T.appliedPattern, `engagement=${engId}^pattern!=${p.getUniqueValue()}`, (ap) => {
        each(T.patternItem, `pattern=${val(ap, 'pattern')}^share_keyISNOTEMPTY`, (i) => otherShares.push(val(i, 'share_key')));
    });
    let deleted = 0;
    let kept = 0;
    for (const table of [T.test, T.component, T.requirement, T.evidence, T.rad, T.decision, T.updateSet]) {
        const r = gr(table);
        r.addEncodedQuery(`engagement=${engId}^pattern_key=${key}`);
        r.query();
        while (r.next()) {
            const shared = r.isValidField('share_key') && val(r, 'share_key') && otherShares.indexOf(val(r, 'share_key')) >= 0;
            if (bool(r, 'seeded') && !shared) {
                r.deleteRecord();
                deleted++;
            }
            else
                kept++;
        }
    }
    const ap = gr(T.appliedPattern);
    ap.addEncodedQuery(`engagement=${engId}^pattern=${p.getUniqueValue()}`);
    ap.query();
    while (ap.next())
        ap.deleteRecord();
    logHistory(engId, 'Pattern removed', `${key}: ${deleted} unedited record(s) deleted, ${kept} edited or shared record(s) kept.`, T.appliedPattern, key, 'intake');
    return { deleted, kept };
}
export function patternDetail(key) {
    const p = gr(T.pattern);
    if (!p.get('key', key))
        return null;
    const pid = p.getUniqueValue();
    const kinds = ['requirement', 'evidence_script', 'component', 'decision', 'risk', 'assumption', 'dependency', 'implementation', 'update_set', 'atf'];
    const out = {
        key,
        name: val(p, 'name'),
        summary: val(p, 'summary'),
        pain: val(p, 'pain').split('\n').filter(Boolean),
        overview: val(p, 'overview'),
        licence: val(p, 'licence_products'),
        requires: val(p, 'requires'),
        verified: bool(p, 'verified'),
        verifiedRelease: val(p, 'verified_release'),
        version: val(p, 'library_version'),
        indicativeCases: num(p, 'indicative_cases'),
        items: {},
    };
    kinds.forEach((k) => {
        out.items[k] = items(pid, k).map((i) => ({ sysId: i.sysId, seq: i.seq, title: i.title, modifies: i.modifies, data: i.data, body: k === 'requirement' || k === 'implementation' ? i.body : undefined }));
    });
    return out;
}
