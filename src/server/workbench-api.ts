import { gs, GlideDateTime, GlideRecord, GlideSysAttachment } from '@servicenow/glide'
import { executeWhitelistedScript, WORKBENCH_SCRIPT_IDS } from './generated-runners.ts'

function setBody(response: any, status: number, body: any) {
  response.setStatus(status)
  response.setHeader('Content-Type', 'application/json')
  response.setBody(body)
}

function requireAdmin(response: any) {
  if (gs.hasRole('admin')) return true
  setBody(response, 403, { ok: false, error: 'Diagnostic collection requires the admin role.' })
  return false
}

function requestData(request: any) {
  if (request.body && request.body.data && typeof request.body.data === 'object') return request.body.data
  var text = request.body && request.body.dataString ? String(request.body.dataString) : ''
  if (!text) return {}
  try { return JSON.parse(text) } catch (error) { return {} }
}

function safeList(value: any) {
  if (!Array.isArray(value)) return []
  return value.map(function (entry) { return String(entry || '').trim() })
    .filter(function (entry) { return /^[A-Za-z0-9_]+$/.test(entry) })
    .slice(0, 25)
}

function safeText(value: any, max: number) {
  return String(value || '').replace(/[\r\n\u0000-\u001f]/g, ' ').trim().substring(0, max)
}

function normaliseProfile(input: any) {
  input = input || {}
  return {
    schema: 'servicenow-diagnostic-profile/1',
    customerName: safeText(input.customerName, 120),
    applicationName: safeText(input.applicationName, 120),
    approvedInstance: safeText(input.approvedInstance, 200),
    changeReference: safeText(input.changeReference, 80),
    scopes: safeList(input.scopes),
    tablePrefixes: safeList(input.tablePrefixes),
    includeInactive: input.includeInactive === true,
    maxRowsPerTable: Math.min(Math.max(Number(input.maxRowsPerTable || 5000), 1), 5000),
  }
}

function safeFileName(value: any) {
  return safeText(value, 120).replace(/[^A-Za-z0-9_.-]/g, '_') || 'diagnostic-output.json'
}

function storeForCurrentUser(fileName: string, content: string) {
  var user = new GlideRecord('sys_user')
  if (!user.get(gs.getUserID())) throw new Error('The current user record could not be resolved.')
  var sysId = new GlideSysAttachment().write(user, safeFileName(fileName), 'application/json', content)
  return { sysId: String(sysId), fileName: safeFileName(fileName), downloadUrl: '/sys_attachment.do?sys_id=' + String(sysId) }
}

export function catalog(request: any, response: any) {
  if (!requireAdmin(response)) return
  setBody(response, 200, {
    ok: true,
    executionBoundary: 'Static allowlist; read-only collectors and PLAN-only remediation templates.',
    scripts: WORKBENCH_SCRIPT_IDS,
  })
}

export function run(request: any, response: any) {
  if (!requireAdmin(response)) return
  var started = new Date().getTime()
  var scriptId = safeText(request.pathParams && request.pathParams.id, 80)
  var body = requestData(request)
  try {
    var result = executeWhitelistedScript(scriptId, normaliseProfile(body.profile))
    var attachment = null
    if (body.persist !== false) {
      var timestamp = new GlideDateTime().getNumericValue()
      attachment = storeForCurrentUser(scriptId + '_automated_' + timestamp + '.json', JSON.stringify(result.payload, null, 2))
    }
    setBody(response, 200, { ok: true, elapsedMs: new Date().getTime() - started, result: result, attachment: attachment })
  } catch (error: any) {
    setBody(response, 400, { ok: false, scriptId: scriptId, elapsedMs: new Date().getTime() - started, error: String(error && error.message ? error.message : error) })
  }
}

export function upload(request: any, response: any) {
  if (!requireAdmin(response)) return
  var body = requestData(request)
  var content = String(body.content || '')
  if (!content || content.length > 2000000) {
    setBody(response, 400, { ok: false, error: 'Output must contain between 1 byte and 2 MB of JSON or DIAG text.' })
    return
  }
  var trimmed = content.trim()
  if (trimmed.charAt(0) !== '{' && trimmed.charAt(0) !== '[' && content.indexOf('DIAG_ENVELOPE_BEGIN') < 0) {
    setBody(response, 400, { ok: false, error: 'Only JSON or DIAG envelope output can be uploaded.' })
    return
  }
  try {
    var stored = storeForCurrentUser(body.fileName || 'uploaded-diagnostic-output.json', content)
    setBody(response, 201, { ok: true, attachment: stored })
  } catch (error: any) {
    setBody(response, 400, { ok: false, error: String(error && error.message ? error.message : error) })
  }
}
