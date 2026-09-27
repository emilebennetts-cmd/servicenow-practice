import { gs, GlideRecord, GlideAggregate } from '@servicenow/glide';
import { T, gr, val, getRecord, logHistory, propStr } from './common.ts';
const D = (days) => `sys_created_onRELATIVEGT@dayofweek@ago@${days}`;
const OLDER = (days) => `sys_created_onRELATIVELT@dayofweek@ago@${days}`;
const MAX_ROWS = 5000;
export const COLLECTORS = [
    {
        key: 'ev.version',
        title: 'Instance release, patch and build',
        metrics: [
            { n: 'instance_name', op: 'prop', name: 'instance_name' },
            { n: 'build_name', op: 'prop', name: 'glide.buildname' },
            { n: 'build_tag', op: 'prop', name: 'glide.buildtag' },
            { n: 'build_date', op: 'prop', name: 'glide.builddate' },
            { n: 'history_by_type_365d', op: 'group', t: 'sys_upgrade_history', f: 'history_type', q: D(365) },
            { n: 'recent_history', op: 'rows', t: 'sys_upgrade_history', fields: ['history_type', 'from_version', 'to_version', 'upgrade_finished'], lim: 10, order: '-sys_created_on' },
            { n: 'skipped_upgrade_records_open', op: 'count', t: 'sys_upgrade_history_log', q: 'dispositionIN4,104^resolution_status=not_reviewed' },
        ],
    },
    {
        key: 'ev.plugins',
        title: 'Active plugin list',
        metrics: [
            { n: 'plugins_active', op: 'count', t: 'sys_plugins', q: 'active=true' },
            { n: 'store_apps_active', op: 'count', t: 'sys_store_app', q: 'active=true' },
            { n: 'active_plugin_ids', op: 'distinct', t: 'sys_plugins', f: 'source', q: 'active=true' },
            { n: 'integrationhub', op: 'plugin', id: 'com.glide.hub.integration.runtime' },
            { n: 'flow_designer', op: 'plugin', id: 'com.glide.hub.flow_engine' },
            { n: 'atf', op: 'table', t: 'sys_atf_test' },
            { n: 'performance_analytics', op: 'plugin', id: 'com.snc.pa.premium' },
            { n: 'service_portal', op: 'plugin', id: 'com.glide.service-portal' },
            { n: 'cicd_api', op: 'plugin', id: 'com.glide.continuousdelivery' },
            { n: 'instance_scan', op: 'plugin', id: 'com.glide.instance_scan' },
            { n: 'employee_center', op: 'plugin', id: 'sn_ex_sp' },
            { n: 'note', op: 'note', text: 'Capabilities: 1 = active, 0 = not active or not installed. Plugin IDs vary by release; confirm any 0 in System Applications.' },
        ],
    },
    {
        key: 'ev.apps',
        title: 'Installed store and custom applications',
        metrics: [
            { n: 'store_apps_active', op: 'count', t: 'sys_store_app', q: 'active=true' },
            { n: 'store_apps_update_available', op: 'count', t: 'sys_store_app', q: 'active=true^update_available=true' },
            { n: 'custom_apps', op: 'count', t: 'sys_app', q: 'active=true' },
            { n: 'store_apps', op: 'rows', t: 'sys_store_app', q: 'active=true', fields: ['scope', 'version', 'latest_version'], lim: 1000, order: 'scope' },
            { n: 'custom_apps_list', op: 'rows', t: 'sys_app', q: 'active=true', fields: ['scope', 'name', 'version', 'vendor_prefix'], lim: 500, order: 'scope' },
            { n: 'global_custom_tables', op: 'count', t: 'sys_db_object', q: 'nameSTARTSWITHu_' },
        ],
    },
    {
        key: 'ev.licence',
        title: 'Licence entitlements and subscriptions',
        metrics: [
            { n: 'licence_records', op: 'count', t: 'license_details' },
            { n: 'subscription_entitlements', op: 'count', t: 'subscription_entitlement' },
            { n: 'licences', op: 'rows', t: 'license_details', fields: ['name', 'count', 'allocated', 'start_date', 'end_date'], lim: 200, order: 'name' },
            { n: 'custom_tables_scoped', op: 'count', t: 'sys_db_object', q: 'nameSTARTSWITHx_' },
            { n: 'custom_tables_global', op: 'count', t: 'sys_db_object', q: 'nameSTARTSWITHu_' },
            { n: 'integrationhub_spokes_installed', op: 'count', t: 'sys_store_app', q: 'active=true^nameLIKESpoke' },
            { n: 'workspaces_configured', op: 'count', t: 'sys_ux_page_registry', q: 'active=true' },
            { n: 'note', op: 'note', text: 'An empty licence list is normal on a PDI or without Subscription Management. Licensing is contractual: technical availability does not prove entitlement.' },
        ],
    },
    {
        key: 'ev.updatesets',
        title: 'Update sets in progress and recent releases',
        metrics: [
            { n: 'local_in_progress', op: 'count', t: 'sys_update_set', q: 'state=in progress' },
            { n: 'local_in_progress_by_application', op: 'group', t: 'sys_update_set', f: 'application', q: 'state=in progress', lim: 40 },
            { n: 'local_in_progress_older_90d', op: 'count', t: 'sys_update_set', q: 'state=in progress^' + OLDER(90) },
            { n: 'local_completed_last_90d', op: 'count', t: 'sys_update_set', q: 'state=complete^' + D(90) },
            { n: 'remote_by_state', op: 'group', t: 'sys_remote_update_set', f: 'state' },
            { n: 'remote_committed_last_90d', op: 'count', t: 'sys_remote_update_set', q: 'state=committed^' + D(90) },
            { n: 'in_progress_sets', op: 'rows', t: 'sys_update_set', q: 'state=in progress', fields: ['sys_id', 'application', 'sys_updated_on'], lim: 100, order: '-sys_updated_on' },
        ],
    },
    {
        key: 'ev.envs',
        title: 'Environment landscape and clone cadence',
        metrics: [
            { n: 'instance_name', op: 'prop', name: 'instance_name' },
            { n: 'clone_requests_365d', op: 'count', t: 'clone_instance', q: D(365) },
            { n: 'clone_requests_by_state', op: 'group', t: 'clone_instance', f: 'state' },
            { n: 'last_clones', op: 'rows', t: 'clone_instance', fields: ['target_instance', 'state', 'scheduled', 'completed'], lim: 5, order: '-sys_created_on' },
            { n: 'clone_targets', op: 'rows', t: 'instance', fields: ['instance_name', 'instance_url'], lim: 20, order: 'instance_name' },
            { n: 'clone_exclusions', op: 'count', t: 'clone_data_exclude', q: 'include_in_system_clone=true' },
            { n: 'clone_data_preservers', op: 'count', t: 'clone_data_preserver', q: 'include_in_system_clone=true' },
            { n: 'remote_instances', op: 'rows', t: 'sys_update_set_source', q: 'active=true', fields: ['name', 'url', 'type'], lim: 20, order: 'name' },
        ],
    },
    {
        key: 'ev.integrations',
        title: 'Existing integration inventory',
        metrics: [
            { n: 'rest_messages', op: 'count', t: 'sys_rest_message' },
            { n: 'rest_message_methods', op: 'count', t: 'sys_rest_message_fn' },
            { n: 'soap_messages', op: 'count', t: 'sys_soap_message' },
            { n: 'scripted_rest_apis', op: 'count', t: 'sys_ws_definition', q: 'active=true' },
            { n: 'scripted_rest_by_scope', op: 'group', t: 'sys_ws_definition', f: 'sys_scope', q: 'active=true', lim: 30 },
            { n: 'import_data_sources_by_type', op: 'group', t: 'sys_data_source', f: 'type' },
            { n: 'scheduled_imports_active', op: 'count', t: 'scheduled_import_set', q: 'active=true' },
            { n: 'transform_maps_active', op: 'count', t: 'sys_transform_map', q: 'active=true' },
            { n: 'connection_aliases', op: 'count', t: 'sys_alias' },
            { n: 'oauth_profiles', op: 'count', t: 'oauth_entity' },
            { n: 'mid_servers_by_status', op: 'group', t: 'ecc_agent', f: 'status' },
            { n: 'mid_servers_not_validated', op: 'count', t: 'ecc_agent', q: 'validated!=true' },
            { n: 'ecc_errors_last_7d', op: 'count', t: 'ecc_queue', q: 'state=error^' + D(7) },
            { n: 'outbound_http_errors_last_7d', op: 'count', t: 'sys_outbound_http_log', q: 'response_status>=400^' + D(7) },
            { n: 'inbound_email_accounts', op: 'count', t: 'sys_email_account', q: 'active=true' },
        ],
    },
    {
        key: 'ev.roles',
        title: 'Roles and groups',
        metrics: [
            { n: 'roles_total', op: 'count', t: 'sys_user_role' },
            { n: 'roles_custom_global', op: 'count', t: 'sys_user_role', q: 'nameSTARTSWITHu_' },
            { n: 'roles_elevated', op: 'count', t: 'sys_user_role', q: 'elevated_privilege=true' },
            { n: 'groups_active', op: 'count', t: 'sys_user_group', q: 'active=true' },
            { n: 'groups_by_type', op: 'group', t: 'sys_user_group', f: 'type', q: 'active=true', lim: 20 },
            { n: 'groups_without_active_members', op: 'withoutChild', t: 'sys_user_group', q: 'active=true', child: 'sys_user_grmember', ref: 'group', childQ: 'user.active=true' },
            { n: 'groups_without_manager', op: 'count', t: 'sys_user_group', q: 'active=true^managerISEMPTY' },
            { n: 'active_users_by_role_top', op: 'group', t: 'sys_user_has_role', f: 'role', q: 'user.active=true', lim: 40 },
            { n: 'admins_active', op: 'count', t: 'sys_user_has_role', q: 'role.name=admin^user.active=true' },
            { n: 'roles_granted_directly_not_via_group', op: 'count', t: 'sys_user_has_role', q: 'inherited=false^user.active=true' },
        ],
    },
    {
        key: 'ev.customisations',
        title: 'Existing customisations',
        metrics: [
            { n: 'business_rules_active', op: 'count', t: 'sys_script', q: 'active=true' },
            { n: 'business_rules_by_table_top', op: 'group', t: 'sys_script', f: 'collection', q: 'active=true', lim: 30 },
            { n: 'client_scripts_active', op: 'count', t: 'sys_script_client', q: 'active=true' },
            { n: 'ui_policies_active', op: 'count', t: 'sys_ui_policy', q: 'active=true' },
            { n: 'ui_actions_active', op: 'count', t: 'sys_ui_action', q: 'active=true' },
            { n: 'acls_active', op: 'count', t: 'sys_security_acl', q: 'active=true' },
            { n: 'script_includes_by_scope', op: 'group', t: 'sys_script_include', f: 'sys_scope', q: 'active=true', lim: 30 },
            { n: 'global_custom_fields_total', op: 'count', t: 'sys_dictionary', q: 'elementSTARTSWITHu_^nameNOT LIKEu_' },
            { n: 'risk_setworkflow_false', op: 'count', t: 'sys_script', q: 'active=true^scriptLIKEsetWorkflow(false)' },
            { n: 'risk_current_update_in_before_rule', op: 'count', t: 'sys_script', q: 'active=true^when=before^scriptLIKEcurrent.update()' },
            { n: 'risk_gs_sleep', op: 'count', t: 'sys_script', q: 'active=true^scriptLIKEgs.sleep' },
            { n: 'risk_dom_manipulation_client', op: 'count', t: 'sys_script_client', q: 'active=true^scriptLIKEdocument.getElement' },
            { n: 'risk_client_getreference_calls', op: 'count', t: 'sys_script_client', q: 'active=true^scriptLIKEg_form.getReference(' },
            { n: 'risk_hardcoded_sys_ids_in_rules', op: 'count', t: 'sys_script', q: 'active=true^scriptLIKEsys_id=' },
            { n: 'instance_scan_findings_unmuted', op: 'count', t: 'scan_finding', q: 'muted=false' },
            { n: 'note', op: 'note', text: 'risk_* are indicators for review, not defects. Run Instance Scan for a full health check.' },
        ],
    },
    {
        key: 'ev.process',
        title: 'Current process configuration',
        metrics: [
            { n: 'knowledge_bases_active', op: 'count', t: 'kb_knowledge_base', q: 'active=true' },
            { n: 'articles_published', op: 'count', t: 'kb_knowledge', q: 'workflow_state=published' },
            { n: 'catalog_items_active', op: 'count', t: 'sc_cat_item', q: 'active=true' },
            { n: 'record_producers_active', op: 'count', t: 'sc_cat_item_producer', q: 'active=true' },
            { n: 'flows_active_by_type', op: 'group', t: 'sys_hub_flow', f: 'type', q: 'active=true' },
            { n: 'legacy_workflows_published', op: 'count', t: 'wf_workflow_version', q: 'published=true^active=true' },
            { n: 'assignment_rules_active', op: 'count', t: 'sysrule_assignment', q: 'active=true' },
            { n: 'sla_definitions_active', op: 'group', t: 'contract_sla', f: 'collection', q: 'active=true', lim: 20 },
            { n: 'approval_rules_active', op: 'count', t: 'sysrule_approvals', q: 'active=true' },
            { n: 'note', op: 'note', text: 'SOPs and RACI held outside ServiceNow must come from the process owner.' },
        ],
    },
    {
        key: 'ev.volumes',
        title: 'Data volumes and growth',
        metrics: [{ n: 'tables', op: 'ages', tables: ['task', 'incident', 'problem', 'change_request', 'sc_request', 'sc_req_item', 'sc_task', 'kb_knowledge', 'cmdb_ci', 'cmdb_rel_ci', 'alm_asset', 'sys_user', 'sys_user_group', 'sys_attachment', 'sys_email'] }],
    },
    {
        key: 'ev.people',
        title: 'Stakeholder counts (roles, not names)',
        metrics: [
            { n: 'active_users', op: 'count', t: 'sys_user', q: 'active=true' },
            { n: 'approvers_approver_user_role', op: 'count', t: 'sys_user_has_role', q: 'role.name=approver_user^user.active=true' },
            { n: 'fulfillers_itil_role', op: 'count', t: 'sys_user_has_role', q: 'role.name=itil^user.active=true' },
            { n: 'admins', op: 'count', t: 'sys_user_has_role', q: 'role.name=admin^user.active=true' },
            { n: 'approvals_pending', op: 'count', t: 'sysapproval_approver', q: 'state=requested' },
            { n: 'approvals_pending_older_14d', op: 'count', t: 'sysapproval_approver', q: 'state=requested^' + OLDER(14) },
            { n: 'note', op: 'note', text: 'Confirm the sponsor, process owner, approvers and UAT testers (as roles) with the client project lead.' },
        ],
    },
    {
        key: 'ev.access',
        title: 'Build access for the running account',
        metrics: [
            { n: 'instance_name', op: 'prop', name: 'instance_name' },
            { n: 'granted_admin', op: 'role', role: 'admin' },
            { n: 'granted_delegated_developer', op: 'role', role: 'delegated_developer' },
            { n: 'granted_app_creator', op: 'role', role: 'sn_g_app_creator.app_creator' },
            { n: 'granted_import_admin', op: 'role', role: 'import_admin' },
            { n: 'granted_atf_test_designer', op: 'role', role: 'atf_test_designer' },
            { n: 'company_code', op: 'prop', name: 'glide.appcreator.company.code' },
            { n: 'source_control_repos', op: 'count', t: 'sys_repo_config' },
            { n: 'cicd_plugin_active', op: 'plugin', id: 'com.glide.continuousdelivery' },
        ],
    },
    {
        key: 'gf.name',
        title: 'Application name and scope prefix',
        metrics: [
            { n: 'company_code', op: 'prop', name: 'glide.appcreator.company.code' },
            { n: 'custom_scopes', op: 'rows', t: 'sys_app', fields: ['scope', 'name', 'version'], lim: 300, order: 'scope' },
            { n: 'note', op: 'note', text: 'Scoped table names are limited to 30 characters in total, so keep the scope short.' },
        ],
    },
    {
        key: 'gf.engine',
        title: 'App Engine and custom table allowance',
        metrics: [
            { n: 'custom_tables_scoped', op: 'count', t: 'sys_db_object', q: 'nameSTARTSWITHx_' },
            { n: 'custom_tables_global', op: 'count', t: 'sys_db_object', q: 'nameSTARTSWITHu_' },
            { n: 'custom_tables_by_scope', op: 'group', t: 'sys_db_object', f: 'sys_scope', q: 'nameSTARTSWITHx_', lim: 40 },
            { n: 'app_engine_licences', op: 'rows', t: 'license_details', q: 'nameLIKEApp Engine^ORnameLIKECreator', fields: ['name', 'count', 'allocated', 'end_date'], lim: 20, order: 'name' },
        ],
    },
    {
        key: 'gf.extendtask',
        title: 'Extend Task decision inputs',
        metrics: [
            { n: 'task_rows', op: 'count', t: 'task' },
            { n: 'task_children_total', op: 'count', t: 'sys_db_object', q: 'super_class.name=task' },
            { n: 'task_children_custom', op: 'rows', t: 'sys_db_object', q: 'super_class.name=task^nameSTARTSWITHx_^ORnameSTARTSWITHu_', fields: ['name', 'label'], lim: 100, order: 'name' },
            { n: 'task_sla_definitions', op: 'count', t: 'contract_sla', q: 'active=true' },
            { n: 'task_business_rules_global', op: 'count', t: 'sys_script', q: 'collection=task^active=true' },
        ],
    },
    {
        key: 'gf.numbering',
        title: 'Record number prefixes',
        metrics: [
            { n: 'number_records', op: 'count', t: 'sys_number' },
            { n: 'prefixes', op: 'rows', t: 'sys_number', fields: ['category', 'prefix', 'maximum_digits'], lim: 500, order: 'prefix' },
        ],
    },
    {
        key: 'gf.personas',
        title: 'Personas and user counts',
        metrics: [
            { n: 'active_users', op: 'count', t: 'sys_user', q: 'active=true' },
            { n: 'active_users_with_roles_by_role_top', op: 'group', t: 'sys_user_has_role', f: 'role', q: 'user.active=true', lim: 30 },
            { n: 'groups_by_type', op: 'group', t: 'sys_user_group', f: 'type', q: 'active=true', lim: 20 },
            { n: 'departments', op: 'count', t: 'cmn_department' },
            { n: 'locations', op: 'count', t: 'cmn_location' },
        ],
    },
    {
        key: 'gf.standards',
        title: 'Development standards the platform enforces',
        metrics: [
            { n: 'atf_tests_active', op: 'count', t: 'sys_atf_test', q: 'active=true' },
            { n: 'atf_suites_active', op: 'count', t: 'sys_atf_test_suite', q: 'active=true' },
            { n: 'atf_results_last_90d_by_status', op: 'group', t: 'sys_atf_test_result', f: 'status', q: D(90) },
            { n: 'instance_scan_checks_active', op: 'count', t: 'scan_check', q: 'active=true' },
            { n: 'instance_scan_findings_unmuted', op: 'count', t: 'scan_finding', q: 'muted=false' },
            { n: 'source_control_repos', op: 'count', t: 'sys_repo_config' },
            { n: 'custom_apps_by_vendor_prefix', op: 'group', t: 'sys_app', f: 'vendor_prefix', lim: 20 },
        ],
    },
    {
        key: 'gf.refdata',
        title: 'Reference data sources',
        metrics: [
            { n: 'companies', op: 'count', t: 'core_company' },
            { n: 'vendors', op: 'count', t: 'core_company', q: 'vendor=true' },
            { n: 'manufacturers', op: 'count', t: 'core_company', q: 'manufacturer=true' },
            { n: 'locations', op: 'count', t: 'cmn_location' },
            { n: 'departments', op: 'count', t: 'cmn_department' },
            { n: 'cost_centers', op: 'count', t: 'cmn_cost_center' },
            { n: 'data_sources_by_type', op: 'group', t: 'sys_data_source', f: 'type' },
            { n: 'decision_tables', op: 'count', t: 'sys_decision', q: 'active=true' },
        ],
    },
    {
        key: 'gf.ui',
        title: 'Target user experience',
        metrics: [
            { n: 'next_experience_enabled', op: 'prop', name: 'glide.ui.polaris.experience' },
            { n: 'workspaces', op: 'rows', t: 'sys_ux_page_registry', q: 'active=true', fields: ['title', 'path'], lim: 60, order: 'title' },
            { n: 'service_portals', op: 'rows', t: 'sp_portal', fields: ['title', 'url_suffix'], lim: 30, order: 'title' },
            { n: 'employee_center_active', op: 'plugin', id: 'sn_ex_sp' },
            { n: 'sp_widgets_total', op: 'count', t: 'sp_widget' },
        ],
    },
    {
        key: 'gf.reporting',
        title: 'Reporting and KPI configuration',
        metrics: [
            { n: 'reports', op: 'count', t: 'sys_report' },
            { n: 'reports_by_table_top', op: 'group', t: 'sys_report', f: 'table', lim: 20 },
            { n: 'scheduled_reports_active', op: 'count', t: 'sysauto_report', q: 'active=true' },
            { n: 'pa_plugin_active', op: 'plugin', id: 'com.snc.pa' },
            { n: 'pa_indicators', op: 'count', t: 'pa_indicators' },
            { n: 'dashboards_next_experience', op: 'count', t: 'par_dashboard' },
        ],
    },
    {
        key: 'gf.sourcecontrol',
        title: 'Source control',
        metrics: [
            { n: 'repos_configured', op: 'count', t: 'sys_repo_config' },
            { n: 'repo_hosts', op: 'hosts', t: 'sys_repo_config', f: 'url' },
            { n: 'cicd_plugin_active', op: 'plugin', id: 'com.glide.continuousdelivery' },
        ],
    },
];
const BY_KEY = {};
COLLECTORS.forEach((c) => (BY_KEY[c.key] = c));
export function hasCollector(key) {
    return !!BY_KEY[key];
}
// ---- read-only helpers ------------------------------------------------------------------------------------
function tableOk(t) {
    try {
        return !!gs.tableExists(t);
    }
    catch (e) {
        return false;
    }
}
function fieldOk(t, path) {
    let g = new GlideRecord(t);
    const parts = path.split('.');
    for (let i = 0; i < parts.length; i++) {
        if (!g.isValidField(parts[i]))
            return false;
        if (i < parts.length - 1) {
            const ref = g.getElement(parts[i]).getReferenceTable();
            if (!ref)
                return false;
            g = new GlideRecord(ref);
        }
    }
    return true;
}
function badField(t, q) {
    if (!q)
        return '';
    const conds = String(q).split(/\^NQ|\^OR|\^/);
    for (const c of conds) {
        const m = c.match(/^([a-z0-9_.]+)/);
        if (!m)
            continue;
        const f = m[1].replace(/\.$/, '');
        if (f === 'sys_id')
            continue;
        if (!fieldOk(t, f))
            return f;
    }
    return '';
}
function precheck(t, q, f) {
    if (!tableOk(t))
        return 'table not found';
    const bad = badField(t, q) || (f && !fieldOk(t, f) ? f : '');
    return bad ? `field not found: ${bad}` : '';
}
function count(t, q) {
    const p = precheck(t, q);
    if (p)
        return p;
    const ga = new GlideAggregate(t);
    if (q)
        ga.addEncodedQuery(q);
    ga.addAggregate('COUNT');
    ga.query();
    return ga.next() ? parseInt(ga.getAggregate('COUNT'), 10) : 0;
}
function group(t, f, q, lim = 50) {
    const p = precheck(t, q, f);
    if (p)
        return p;
    const rows = [];
    const ga = new GlideAggregate(t);
    if (q)
        ga.addEncodedQuery(q);
    ga.addAggregate('COUNT');
    ga.groupBy(f);
    ga.query();
    let guard = 0;
    while (ga.next() && guard++ < MAX_ROWS)
        rows.push([String(ga.getDisplayValue(f) || '(blank)'), parseInt(ga.getAggregate('COUNT'), 10)]);
    rows.sort((a, b) => b[1] - a[1]);
    const o = {};
    rows.slice(0, lim).forEach((r) => (o[r[0]] = r[1]));
    if (rows.length > lim)
        o['(other groups)'] = rows.length - lim;
    return o;
}
function rows(t, fields, q, lim = 200, order) {
    const p = precheck(t, q);
    if (p)
        return p;
    const ok = fields.filter((f) => f === 'sys_id' || fieldOk(t, f));
    const out = [];
    const g = new GlideRecord(t);
    if (q)
        g.addEncodedQuery(q);
    if (order)
        order.charAt(0) === '-' ? g.orderByDesc(order.slice(1)) : g.orderBy(order);
    g.setLimit(Math.min(lim, MAX_ROWS));
    g.query();
    while (g.next()) {
        const r = {};
        ok.forEach((f) => (r[f] = f === 'sys_id' ? g.getUniqueValue() : String(g.getDisplayValue(f) || g.getValue(f) || '')));
        out.push(r);
    }
    return out;
}
function plugin(id) {
    if (tableOk('sys_plugins')) {
        const p = new GlideRecord('sys_plugins');
        p.addQuery('source', id);
        p.addQuery('active', true);
        p.setLimit(1);
        p.query();
        if (p.hasNext())
            return 1;
    }
    const a = new GlideRecord('sys_store_app');
    a.addQuery('scope', id);
    a.addQuery('active', true);
    a.setLimit(1);
    a.query();
    return a.hasNext() ? 1 : 0;
}
function distinct(t, f, q) {
    const p = precheck(t, q, f);
    if (p)
        return p;
    const out = [];
    const g = new GlideRecord(t);
    if (q)
        g.addEncodedQuery(q);
    g.orderBy(f);
    g.setLimit(MAX_ROWS);
    g.query();
    while (g.next())
        out.push(String(g.getValue(f) || ''));
    return out;
}
function withoutChild(t, q, child, ref, childQ) {
    const p = precheck(t, q) || precheck(child, childQ, ref);
    if (p)
        return p;
    const have = {};
    const ga = new GlideAggregate(child);
    if (childQ)
        ga.addEncodedQuery(childQ);
    ga.addAggregate('COUNT');
    ga.groupBy(ref);
    ga.query();
    while (ga.next())
        have[String(ga.getValue(ref))] = true;
    let n = 0;
    const g = new GlideRecord(t);
    if (q)
        g.addEncodedQuery(q);
    g.setLimit(MAX_ROWS);
    g.query();
    while (g.next())
        if (!have[g.getUniqueValue()])
            n++;
    return n;
}
/** Host names only: credentials and paths in URLs are never returned. */
function hosts(t, f) {
    const p = precheck(t, '', f);
    if (p)
        return p;
    const out = [];
    const g = new GlideRecord(t);
    g.setLimit(50);
    g.query();
    while (g.next()) {
        const m = String(g.getValue(f) || '').match(/^[a-z]+:\/\/(?:[^@/]*@)?([^/:]+)/i);
        out.push(m ? m[1] : '(unparsed)');
    }
    return out;
}
function userHasRole(role) {
    return count('sys_user_has_role', `user=${gs.getUserID()}^role.name=${role}`) > 0;
}
function ages(t) {
    const p = precheck(t);
    if (p)
        return p;
    const a = { total: count(t), last_30d: count(t, D(30)), last_90d: count(t, D(90)), last_365d: count(t, D(365)) };
    if (typeof a.last_365d === 'number')
        a.avg_per_month_12m = Math.round(a.last_365d / 12);
    a.open_active = fieldOk(t, 'active') ? count(t, 'active=true') : 'n/a';
    return a;
}
function one(m) {
    switch (m.op) {
        case 'count':
            return count(m.t, m.q);
        case 'group':
            return group(m.t, m.f, m.q, m.lim);
        case 'rows':
            return rows(m.t, m.fields, m.q, m.lim, m.order);
        case 'prop':
            return String(gs.getProperty(m.name, 'not set'));
        case 'plugin':
            return plugin(m.id);
        case 'table':
            return tableOk(m.t) ? 1 : 0;
        case 'role':
            return userHasRole(m.role);
        case 'ages': {
            const o = {};
            m.tables.forEach((t) => (o[t] = ages(t)));
            return o;
        }
        case 'distinct':
            return distinct(m.t, m.f, m.q);
        case 'withoutChild':
            return withoutChild(m.t, m.q, m.child, m.ref, m.childQ);
        case 'hosts':
            return hosts(m.t, m.f);
        case 'note':
            return m.text;
    }
    return null;
}
/** Keeps the block under 60,000 characters (the output field holds 64,000): halve the largest list, else omit the largest object. */
export function fit(out, limit = 60000) {
    let s = JSON.stringify(out, null, 1);
    if (s.length > limit)
        s = JSON.stringify(out);
    const cut = [];
    let loops = 0;
    while (s.length > limit && loops++ < 60) {
        let bigK = '';
        let bigL = 0;
        Object.keys(out).forEach((k) => {
            if (k === 'key' || k === 'dsb_truncated' || !out[k] || typeof out[k] !== 'object')
                return;
            const l = JSON.stringify(out[k]).length;
            if (l > bigL) {
                bigL = l;
                bigK = k;
            }
        });
        if (!bigK)
            break;
        const v = out[bigK];
        if (Array.isArray(v) && v.length > 10) {
            out[bigK] = v.slice(0, Math.floor(v.length / 2));
            cut.push(`${bigK} kept ${out[bigK].length} of ${v.length}`);
        }
        else {
            out[bigK] = `omitted: ${bigL} characters`;
            cut.push(`${bigK} omitted`);
        }
        out.dsb_truncated = cut;
        s = JSON.stringify(out);
    }
    return s;
}
export function collect(key) {
    const c = BY_KEY[key];
    if (!c)
        throw new Error(`No built-in collector for ${key}. Use Copy script and paste the output instead.`);
    const started = Date.now();
    const out = { key, collector: 'built-in', collected_on: String(gs.getProperty('instance_name', '')) };
    let errors = 0;
    c.metrics.forEach((m) => {
        try {
            out[m.n] = one(m);
        }
        catch (e) {
            // Platform (Java) exceptions block access to .message from a scoped app, so only String(e) is safe here.
            errors++;
            let why = '';
            try {
                why = String(e);
            }
            catch (x) {
                why = 'access denied';
            }
            out[m.n] = `not readable from the app scope: ${why.replace(/^java\.lang\.\w+:\s*/, '').slice(0, 120)}`;
        }
    });
    return { key, block: `=== DSB-EVIDENCE ${key} ===\n${fit(out)}`, errors, ms: Date.now() - started };
}
// ---- running against an engagement ------------------------------------------------------------------------
/** Built-in collection runs only on the instance the engagement targets, when enabled, for architects or admins. */
export function canCollect(engId) {
    const e = getRecord(T.engagement, engId);
    const here = String(gs.getProperty('instance_name', ''));
    if (!e)
        return { ok: false, reason: 'Engagement not found.', here };
    if (propStr('run.backend_enabled', 'true') !== 'true')
        return { ok: false, reason: 'Built-in collection is switched off (x_1577958_dsb.run.backend_enabled).', here };
    if (!(gs.hasRole('x_1577958_dsb.architect') || gs.hasRole('admin')))
        return { ok: false, reason: 'Built-in collection needs the Workbench architect role.', here };
    const target = val(e, 'instance_name');
    if (!target)
        return { ok: false, reason: 'Set the target instance name in Scope & context first.', here };
    if (target.toLowerCase() !== here.toLowerCase())
        return { ok: false, reason: `This engagement targets ${target}, but the Workbench is running on ${here}. Use Copy script on ${target} and paste the output, or install the Workbench there.`, here };
    return { ok: true, reason: '', here };
}
/** Collects one evidence item and saves the result on it (the evidence rule redacts, parses and marks it Received). */
export function collectEvidence(engId, evidenceId) {
    const gate = canCollect(engId);
    if (!gate.ok)
        throw Object.assign(new Error(gate.reason), { status: 409 });
    const ev = getRecord(T.evidence, evidenceId);
    if (!ev || val(ev, 'engagement') !== engId)
        throw Object.assign(new Error('Evidence item not found on this engagement.'), { status: 404 });
    const key = val(ev, 'script_key');
    const r = collect(key);
    const g = gr(T.evidence);
    g.get(evidenceId);
    g.setValue('output', r.block);
    g.update();
    const after = getRecord(T.evidence, evidenceId);
    logHistory(engId, 'Evidence collected', `${key} collected on ${gate.here} (${r.ms} ms${r.errors ? `, ${r.errors} metric(s) unreadable` : ''})`, T.evidence, val(ev, 'number'), 'evidence');
    return { key, number: val(ev, 'number'), status: after ? val(after, 'status') : '', flagged: after ? parseInt(val(after, 'flagged') || '0', 10) : 0, errors: r.errors, ms: r.ms };
}
export function collectableItems(engId) {
    const out = [];
    const g = gr(T.evidence);
    g.addQuery('engagement', engId);
    g.addQuery('status', '!=', 'not_applicable');
    g.orderBy('number');
    g.query();
    while (g.next())
        if (hasCollector(val(g, 'script_key')))
            out.push({ sysId: g.getUniqueValue(), key: val(g, 'script_key'), number: val(g, 'number') });
    return out;
}
