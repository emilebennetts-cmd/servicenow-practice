import '@servicenow/sdk/global'
import { RestApi } from '@servicenow/sdk/core'
import { catalog, run, upload } from '../server/workbench-api'

RestApi({
    $id: Now.ID['diagnostic-workbench-automation-api'],
    name: 'Diagnostic Workbench Automation API',
    serviceId: 'workbench',
    active: true,
    consumes: 'application/json',
    produces: 'application/json',
    shortDescription: 'Admin-only, static-allowlist execution of bundled diagnostic collectors and PLAN-only remediation templates.',
    routes: [
        {
            $id: Now.ID['diagnostic-workbench-automation-catalog'],
            name: 'List automated scripts',
            method: 'GET',
            path: '/catalog',
            active: true,
            authentication: true,
            authorization: false,
            internalRole: true,
            produces: 'application/json',
            script: catalog,
        },
        {
            $id: Now.ID['diagnostic-workbench-automation-run'],
            name: 'Run one allowlisted script',
            method: 'POST',
            path: '/run/{id}',
            active: true,
            authentication: true,
            authorization: false,
            internalRole: true,
            consumes: 'application/json',
            produces: 'application/json',
            script: run,
        },
        {
            $id: Now.ID['diagnostic-workbench-automation-upload'],
            name: 'Upload diagnostic output',
            method: 'POST',
            path: '/upload',
            active: true,
            authentication: true,
            authorization: false,
            internalRole: true,
            consumes: 'application/json',
            produces: 'application/json',
            script: upload,
        },
    ],
})
