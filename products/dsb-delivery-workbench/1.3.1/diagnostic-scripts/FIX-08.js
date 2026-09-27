/**
 * FIX-08 - Public reports upgrade
 * Reusable public reports upgrade pattern from the authoritative remediation library.
 *
 * CUSTOMER TEMPLATE - REQUIRED CONFIGURATION
 * Generate the customer profile in Diagnostic Workbench and replace every CUSTOMER_* value.
 * Review targets, encoded queries, fields and limits. Run read-only/PLAN first and import the
 * generated servicenow-diagnostic-result/1 JSON attachment back into the Workbench.
 */
(function () {
  var CUSTOMER_PROFILE = { schema: "servicenow-diagnostic-profile/1", customerName: "CUSTOMER_NAME", applicationName: "CUSTOMER_APP", approvedInstance: "CUSTOMER_INSTANCE", scopes: ["CUSTOMER_SCOPE"], tablePrefixes: ["CUSTOMER_TABLE_PREFIX"] };
  var CONFIGURATION = {
  "maxRowsPerTarget": 5000,
  "targets": [
    {
      "table": "sys_report",
      "query": "active=true",
      "fields": [
        "title",
        "table",
        "roles",
        "user",
        "group",
        "sys_scope"
      ],
      "limit": 5000
    }
  ]
};
  var result = { schema: "servicenow-diagnostic-result/1", scriptId: "FIX-08", version: "2.0.0", mode: "READ_ONLY", startedAt: new GlideDateTime().getDisplayValueInternal(), profile: CUSTOMER_PROFILE, records: [], counts: {}, warnings: [], errors: [] };
  function value(gr, field) { return gr.isValidField(field) ? String(gr.getValue(field) || "") : ""; }
  function emit() {
    result.completedAt = new GlideDateTime().getDisplayValueInternal(); result.ok = result.errors.length === 0;
    var json = JSON.stringify(result, null, 2), user = new GlideRecord("sys_user");
    if (user.get(gs.getUserID())) { try { var name = "FIX-08_result_" + new GlideDateTime().getNumericValue() + ".json"; var id = new GlideSysAttachment().write(user, name, "application/json", json); gs.print("WORKBENCH_RESULT=" + JSON.stringify({ schema: result.schema, scriptId: result.scriptId, ok: result.ok, attachmentSysId: String(id), fileName: name, counts: result.counts })); return; } catch (e) { result.errors.push(String(e.message || e)); } }
    gs.print(JSON.stringify(result));
  }
  for (var i = 0; i < CONFIGURATION.targets.length; i += 1) {
    var target = CONFIGURATION.targets[i];
    try {
      if (/CUSTOMER_/.test(JSON.stringify(target))) { result.warnings.push("Skipped unconfigured target " + target.table); continue; }
      var gr = new GlideRecord(target.table);
      if (!gr.isValid()) { result.warnings.push("Table unavailable: " + target.table); continue; }
      if (target.query) gr.addEncodedQuery(target.query);
      gr.setLimit(Math.min(Number(target.limit || CONFIGURATION.maxRowsPerTarget), CONFIGURATION.maxRowsPerTarget));
      gr.query(); var count = 0;
      while (gr.next()) { var row = { table: target.table, sys_id: value(gr, "sys_id"), values: {} }; for (var f = 0; f < target.fields.length; f += 1) row.values[target.fields[f]] = value(gr, target.fields[f]); result.records.push(row); count += 1; }
      result.counts[target.table] = (result.counts[target.table] || 0) + count;
    } catch (error) { result.errors.push(target.table + ": " + String(error.message || error)); }
  }
  emit();
}());
