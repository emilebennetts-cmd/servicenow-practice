import { gs, GlideRecord, GlideDateTime } from '@servicenow/glide';
/* Shared helpers for DSB Workbench server logic (ES2021 module). */
export const SCOPE = 'x_1577958_dsb';
export const T = {
    engagement: 'x_1577958_dsb_engagement',
    outcome: 'x_1577958_dsb_outcome',
    entitlement: 'x_1577958_dsb_entitlement',
    requirement: 'x_1577958_dsb_requirement',
    evidence: 'x_1577958_dsb_evidence',
    rad: 'x_1577958_dsb_rad',
    decision: 'x_1577958_dsb_decision',
    updateSet: 'x_1577958_dsb_update_set',
    component: 'x_1577958_dsb_component',
    buildTask: 'x_1577958_dsb_build_task',
    release: 'x_1577958_dsb_release',
    test: 'x_1577958_dsb_test',
    defect: 'x_1577958_dsb_defect',
    gate: 'x_1577958_dsb_gate',
    history: 'x_1577958_dsb_history',
    appliedPattern: 'x_1577958_dsb_applied_pattern',
    pattern: 'x_1577958_dsb_pattern',
    patternItem: 'x_1577958_dsb_pattern_item',
    componentType: 'x_1577958_dsb_component_type',
    licenceProduct: 'x_1577958_dsb_licence_product',
    evidenceTemplate: 'x_1577958_dsb_evidence_tmpl',
    diagScript: 'x_1577958_dsb_diag_script',
    diagRun: 'x_1577958_dsb_diag_run',
};
/** Loosely typed GlideRecord factory (table types are generated on the instance, not locally). */
export function gr(table) {
    return new GlideRecord(table);
}
export function nowValue() {
    return new GlideDateTime().getValue();
}
export function val(rec, field) {
    const v = rec.getValue(field);
    return v === null || v === undefined ? '' : String(v);
}
export function bool(rec, field) {
    const v = val(rec, field);
    return v === '1' || v === 'true';
}
export function num(rec, field) {
    const n = parseFloat(val(rec, field));
    return isNaN(n) ? 0 : n;
}
/** Iterate records of `table` matching an encoded query. */
export function each(table, query, fn, orderBy) {
    const g = gr(table);
    if (query)
        g.addEncodedQuery(query);
    if (orderBy)
        g.orderBy(orderBy);
    g.query();
    let n = 0;
    while (g.next()) {
        n++;
        fn(g);
    }
    return n;
}
export function count(table, query) {
    const g = gr(table);
    if (query)
        g.addEncodedQuery(query);
    g.query();
    return g.getRowCount();
}
export function getRecord(table, sysId) {
    if (!sysId)
        return null;
    const g = gr(table);
    return g.get(sysId) ? g : null;
}
/** Personal-information redaction: emails and AU / international phone numbers. Names are handled by role-only fields. */
export function redact(s) {
    return String(s === null || s === undefined ? '' : s)
        .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email removed]')
        .replace(/(\+?61[\s-]?|\b0)4\d{2}[\s-]?\d{3}[\s-]?\d{3}\b/g, '[phone removed]')
        .replace(/(\+?61[\s-]?|\(0|\b0)[2378]\)?[\s-]?\d{4}[\s-]?\d{4}\b/g, '[phone removed]')
        .replace(/\+\d{1,3}[\s-]?\d{2,4}[\s-]?\d{3,4}[\s-]?\d{3,4}\b/g, '[phone removed]');
}
export function propNum(name, fallback) {
    const n = parseFloat(gs.getProperty(`${SCOPE}.${name}`, String(fallback)));
    return isNaN(n) ? fallback : n;
}
export function propStr(name, fallback) {
    return String(gs.getProperty(`${SCOPE}.${name}`, fallback));
}
/** Append-only engagement history. Never stores field values (only names), so no personal data is copied. */
export function logHistory(engagementId, action, detail, recordTable = '', recordNumber = '', stage = '') {
    if (!engagementId)
        return;
    const h = gr(T.history);
    h.initialize();
    h.setValue('engagement', engagementId);
    h.setValue('action', action.slice(0, 60));
    h.setValue('record_table', recordTable);
    h.setValue('record_number', recordNumber);
    h.setValue('stage', stage);
    h.setValue('detail', redact(detail).slice(0, 3900));
    const e = getRecord(T.engagement, engagementId);
    if (e)
        h.setValue('lifecycle_state', val(e, 'lifecycle_state'));
    h.insert();
}
export function roundQuarter(n) {
    return Math.round(n * 4) / 4;
}
export function safeJson(s, fallback = null) {
    try {
        return s ? JSON.parse(s) : fallback;
    }
    catch (e) {
        return fallback;
    }
}
export function hasRole(role) {
    return gs.hasRole(`${SCOPE}.${role}`);
}
