import '@servicenow/sdk/global'

declare global {
    namespace Now {
        namespace Internal {
            interface Keys extends KeysRegistry {
                explicit: {
                    bom_json: {
                        table: 'sys_module'
                        id: '609ca9d4a2a64df8bf3147930fd39345'
                    }
                    'diagnostic-workbench-automation-api': {
                        table: 'sys_ws_definition'
                        id: '429930164f3f4668b85ce2d5986d1c4c'
                    }
                    'diagnostic-workbench-automation-catalog': {
                        table: 'sys_ws_operation'
                        id: 'dacd4e5601e8493384aa868ad4ead64d'
                    }
                    'diagnostic-workbench-automation-run': {
                        table: 'sys_ws_operation'
                        id: 'aed495f92f2f4a5cbbf69ede6b857eca'
                    }
                    'diagnostic-workbench-automation-upload': {
                        table: 'sys_ws_operation'
                        id: '8864fd32e4a94c16a8cd96bdde38c440'
                    }
                    package_json: {
                        table: 'sys_module'
                        id: '564f5cf1429948d1b10f15deda89c255'
                    }
                    'src_server_generated-runners_ts': {
                        table: 'sys_module'
                        id: '0551a177973b4287a7f71d82fe64125b'
                    }
                    'src_server_workbench-api_ts': {
                        table: 'sys_module'
                        id: '6c9ac70785884ccb82122b1282b11574'
                    }
                }
                composite: [
                    {
                        table: 'sys_ui_page'
                        id: '668697ee2cd34534b24acf53172b53a8'
                        key: {
                            endpoint: 'x_bahs_dw2_diagnostic_workbench.do'
                        }
                    },
                ]
            }
        }
    }
}
