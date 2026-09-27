/*
CMDB-CSDM-001 - CSDM alignment (READ ONLY)
================================================================================
Module   : CMDB & CSDM  ·  Category: CSDM
Purpose  : Baselines the CSDM population - business applications, application services, technical services and offerings - and emits the service entities and edges for the relationship map.

Safety   : Read-only. Aggregate counts, ratios and configuration metadata only.
           No consumer record content is read or exported. Every table access
           is guarded - a missing table becomes a note and the affected
           metrics report -1 (treated as Not Applicable by the Workbench).
Run from : System Definition > Scripts - Background · scope Global
Output   : One JSON envelope between DIAG_ENVELOPE_BEGIN / DIAG_ENVELOPE_END.
           Paste the complete output into the Workbench via Load Result.
*/
(function () {
    var envelope = {
        collector: 'CMDB_CSDM_001',
        version: '1.0',
        instance: gs.getProperty('instance_name'),
        captured_at: new GlideDateTime().getValue(),
        module: 'CMDB & CSDM',
        category: 'CSDM',
        schema_version: '1.0',
        read_only: true,
        classification: 'Internal',
        contains_pii: false,
        record_count: 0,
        metrics: {},
        results: [],
        entities: [],
        relationships: [],
        notes: []
    };

    function tableAvailable(tableName) {
        try { return new GlideRecord(tableName).isValid(); } catch (availabilityError) { return false; }
    }

    function countRecords(tableName, encodedQuery) {
        if (!tableAvailable(tableName)) {
            envelope.notes.push(tableName + ' is not available on this instance.');
            return -1;
        }
        var aggregateQuery = new GlideAggregate(tableName);
        if (encodedQuery) { aggregateQuery.addEncodedQuery(encodedQuery); }
        aggregateQuery.addAggregate('COUNT');
        aggregateQuery.query();
        return aggregateQuery.next() ? parseInt(aggregateQuery.getAggregate('COUNT'), 10) : 0;
    }

    // Groups are capped and sorted in JS - no orderByAggregate / addHaving,
    // which vary across releases.
    function groupCounts(tableName, fieldName, encodedQuery, cap) {
        var groups = [];
        if (!tableAvailable(tableName)) { return groups; }
        var aggregateQuery = new GlideAggregate(tableName);
        if (encodedQuery) { aggregateQuery.addEncodedQuery(encodedQuery); }
        aggregateQuery.addAggregate('COUNT');
        aggregateQuery.groupBy(fieldName);
        aggregateQuery.query();
        var iterations = 0;
        var hardCap = cap || 400;
        while (aggregateQuery.next()) {
            iterations++;
            if (iterations > hardCap) {
                envelope.notes.push(tableName + '.' + fieldName + ' grouping capped at ' + hardCap + ' groups.');
                break;
            }
            groups.push({
                value: String(aggregateQuery.getDisplayValue(fieldName) || '(empty)').substring(0, 80),
                count: parseInt(aggregateQuery.getAggregate('COUNT'), 10)
            });
        }
        groups.sort(function (left, right) { return right.count - left.count; });
        return groups;
    }

    function topGroups(kind, tableName, fieldName, encodedQuery, topN) {
        var groups = groupCounts(tableName, fieldName, encodedQuery);
        var limit = Math.min(groups.length, topN || 15);
        for (var index = 0; index < limit; index++) {
            envelope.results.push({ kind: kind, field: fieldName, value: groups[index].value, count: groups[index].count });
        }
        return groups;
    }

    function duplicateClusters(kind, tableName, fieldName, encodedQuery, topN) {
        var groups = groupCounts(tableName, fieldName, encodedQuery);
        var clusterCount = 0;
        var recordCount = 0;
        var emitted = 0;
        for (var index = 0; index < groups.length; index++) {
            if (groups[index].count > 1) {
                clusterCount++;
                recordCount += groups[index].count;
                if (emitted < (topN || 10)) {
                    envelope.results.push({ kind: kind, field: fieldName, value: groups[index].value, count: groups[index].count });
                    emitted++;
                }
            }
        }
        return { clusters: clusterCount, records: recordCount };
    }

    function ratio(part, whole) {
        if (part < 0 || whole <= 0) { return part < 0 ? -1 : 0; }
        return Math.round(part * 1000 / whole) / 10;
    }

    function collect() {
        envelope.metrics.business_apps = countRecords('cmdb_ci_business_app', '');
        var appServiceCount = countRecords('cmdb_ci_service_auto', '');
        if (appServiceCount < 0) { appServiceCount = countRecords('cmdb_ci_service_discovered', ''); }
        envelope.metrics.app_services = appServiceCount;
        envelope.metrics.tech_services = countRecords('cmdb_ci_service', '');
        envelope.metrics.service_offerings = countRecords('service_offering', '');
        if (tableAvailable('cmdb_ci_business_app')) {
            var businessAppRecord = new GlideRecord('cmdb_ci_business_app');
            businessAppRecord.orderByDesc('sys_updated_on');
            businessAppRecord.setLimit(20);
            businessAppRecord.query();
            while (businessAppRecord.next()) {
                envelope.entities.push({ type: 'Business Application',
                    name: String(businessAppRecord.getValue('name') || '').substring(0, 80),
                    key: String(businessAppRecord.getUniqueValue()) });
            }
        }
        if (tableAvailable('cmdb_rel_ci')) {
            var relationshipRecord = new GlideRecord('cmdb_rel_ci');
            relationshipRecord.addEncodedQuery('parent.sys_class_name=cmdb_ci_business_app');
            relationshipRecord.setLimit(25);
            relationshipRecord.query();
            while (relationshipRecord.next()) {
                envelope.relationships.push({
                    parent: String(relationshipRecord.parent.getDisplayValue()).substring(0, 80),
                    parent_type: 'Business Application',
                    child: String(relationshipRecord.child.getDisplayValue()).substring(0, 80),
                    child_type: String(relationshipRecord.child.sys_class_name.getDisplayValue()).substring(0, 60),
                    rel_type: String(relationshipRecord.type.getDisplayValue()).substring(0, 60)
                });
            }
        }
    }

    try {
        collect();
    } catch (collectError) {
        envelope.notes.push('Collector error: ' + collectError);
    }
    envelope.record_count = envelope.results.length;
    gs.info('DIAG_ENVELOPE_BEGIN');
    gs.info(JSON.stringify(envelope));
    gs.info('DIAG_ENVELOPE_END');
})();
