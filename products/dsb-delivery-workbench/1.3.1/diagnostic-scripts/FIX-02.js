/**
 * FIX-02 - Client-callable ACL generator
 * Reusable client-callable acl generator pattern from the authoritative remediation library.
 *
 * CUSTOMER TEMPLATE - REQUIRED CONFIGURATION
 * Generate the customer profile in Diagnostic Workbench and replace every CUSTOMER_* value.
 * Review targets, encoded queries, fields and limits. Run read-only/PLAN first and import the
 * generated servicenow-diagnostic-result/1 JSON attachment back into the Workbench.
 */
(function () {
  var CUSTOMER_PROFILE = { schema: "servicenow-diagnostic-profile/1", customerName: "CUSTOMER_NAME", applicationName: "CUSTOMER_APP", approvedInstance: "CUSTOMER_INSTANCE", changeReference: "CUSTOMER_CHANGE_REFERENCE" };
  var CONFIGURATION = { runMode: "PLAN", maxWrites: 25, requireNamedUpdateSet: true, actions: [] };
  var result = { schema: "servicenow-diagnostic-result/1", scriptId: "FIX-02", version: "2.0.0", mode: CONFIGURATION.runMode, startedAt: new GlideDateTime().getDisplayValueInternal(), profile: CUSTOMER_PROFILE, records: [], snapshots: [], rollback: [], counts: { planned: 0, applied: 0, skipped: 0 }, warnings: [], errors: [] };
  function value(gr, field) { return gr.isValidField(field) ? String(gr.getValue(field) || "") : ""; }
  function stop(message) { result.errors.push(message); gs.error("FIX-02 STOPPED: " + message); }
  function preflight() {
    if (CONFIGURATION.runMode !== "APPLY") return true;
    if (/CUSTOMER_/.test(JSON.stringify(CUSTOMER_PROFILE)) || /CUSTOMER_/.test(JSON.stringify(CONFIGURATION.actions))) { stop("Unresolved CUSTOMER_* placeholder."); return false; }
    var actual = String(gs.getProperty("glide.servlet.uri", "")).replace(/\/$/, "").toLowerCase();
    var approved = String(CUSTOMER_PROFILE.approvedInstance || "").replace(/\/$/, "").toLowerCase();
    if (!approved || actual.indexOf(approved) < 0) { stop("Instance does not match the approved customer profile."); return false; }
    if (!CUSTOMER_PROFILE.changeReference || /^CUSTOMER_/.test(CUSTOMER_PROFILE.changeReference)) { stop("A change reference is required."); return false; }
    if (!CONFIGURATION.actions.length || CONFIGURATION.actions.length > CONFIGURATION.maxWrites) { stop("Action count is zero or exceeds maxWrites."); return false; }
    if (CONFIGURATION.requireNamedUpdateSet) { var pref = String(gs.getPreference("sys_update_set") || ""); var us = new GlideRecord("sys_update_set"); if (!pref || !us.get(pref) || value(us, "name") === "Default") { stop("Select a named update set before APPLY."); return false; } }
    return true;
  }
  function emit() { result.completedAt = new GlideDateTime().getDisplayValueInternal(); result.ok = result.errors.length === 0; var json = JSON.stringify(result, null, 2), user = new GlideRecord("sys_user"); if (user.get(gs.getUserID())) { try { var name = "FIX-02_snapshot_" + new GlideDateTime().getNumericValue() + ".json"; var id = new GlideSysAttachment().write(user, name, "application/json", json); gs.print("WORKBENCH_RESULT=" + JSON.stringify({ schema: result.schema, scriptId: result.scriptId, mode: result.mode, ok: result.ok, attachmentSysId: String(id), fileName: name, counts: result.counts })); return; } catch (e) { result.errors.push(String(e.message || e)); } } gs.print(JSON.stringify(result)); }
  if (!preflight()) { emit(); return; }
  for (var i = 0; i < CONFIGURATION.actions.length; i += 1) {
    var action = CONFIGURATION.actions[i]; result.counts.planned += 1;
    try {
      var gr = new GlideRecord(action.table); if (!gr.isValid() || !gr.get(action.sys_id)) { result.warnings.push("Record not found: " + action.table + "/" + action.sys_id); result.counts.skipped += 1; continue; }
      var before = {}, mismatch = false, key;
      for (key in action.changes) if (Object.prototype.hasOwnProperty.call(action.changes, key)) before[key] = value(gr, key);
      for (key in (action.expected || {})) if (Object.prototype.hasOwnProperty.call(action.expected, key) && value(gr, key) !== String(action.expected[key])) mismatch = true;
      result.snapshots.push({ table: action.table, sys_id: action.sys_id, before: before, intended: action.changes });
      if (mismatch) { result.warnings.push("Expected-state mismatch: " + action.table + "/" + action.sys_id); result.counts.skipped += 1; continue; }
      result.rollback.push({ table: action.table, sys_id: action.sys_id, changes: before });
      if (CONFIGURATION.runMode === "APPLY") { for (key in action.changes) if (Object.prototype.hasOwnProperty.call(action.changes, key) && gr.isValidField(key)) gr.setValue(key, String(action.changes[key])); gr.update(); result.counts.applied += 1; }
    } catch (error) { result.errors.push(action.table + "/" + action.sys_id + ": " + String(error.message || error)); }
  }
  emit();
}());
