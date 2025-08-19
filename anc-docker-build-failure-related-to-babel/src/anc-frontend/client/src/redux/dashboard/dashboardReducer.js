import Constants from './dashboardConstants';

const INITIAL_STATE = {
    nodeInformation: {
        statusKey: 'all',
        searchKey: '',
        enableSearch: false,
    },
    clusterInformation: {
        config: {
            clusterId: '-',
            managementIp: '-',
            managementNetmask: '-',
        },
        country: {
            actualValue: '',
            displayValue: '-',
        },
        hasCountryDiscrepancies: '',
        getConfigFwversionFail: false,
        radioSettings: {
            actualValue: {},
            displayValue: {},
        },
    },
    linkInfoRssiFliter: {
        channel: {
            min: 36,
            max: 165,
        },
        centralFreq: {
            min: 4940,
            max: 4990,
        },
        rssi: {
            min: -95,
            max: 0,
        },
        selectedLinkType: 'both',
    },
    linkDistRssiFliter: {
        channel: {
            min: 36,
            max: 165,
        },
        centralFreq: {
            min: 4940,
            max: 4990,
        },
        rssi: {
            min: -95,
            max: 0,
        },
        selectedLinkType: 'both',
    },
    tempNodeConfig: {},
};

function dashboardReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.DASHBOARD_UPDATE_STATUS_KEY:
            return {
                ...state,
                nodeInformation: {
                    ...state.nodeInformation,
                    statusKey: action.data,
                    searchKey: '',
                    enableSearch: false,
                },
            };
        case Constants.DASHBOARD_UPDATE_SEARCH_KEY:
            return {
                ...state,
                nodeInformation: {
                    ...state.nodeInformation,
                    searchKey: action.data,
                    statusKey: 'all',
                    enableSearch: true,
                },
            };
        case Constants.DASHBOARD_TOGGLE_SEARCH:
            return {
                ...state,
                nodeInformation: {
                    ...state.nodeInformation,
                    enableSearch: action.data,
                    ...(!action.data ? {searchKey: ''} : {}),
                },
            };
        case Constants.DASHBOARD_GET_CLUSTER_INFORMATION:
            return {
                ...state,
                clusterInformation: {
                    ...state.clusterInformation,
                    ...action.data,
                },
            };
        case Constants.DASHBOARD_RESET_CLUSTER_INFORMATION:
            return {
                ...state,
                clusterInformation: action.data,
            };
        case Constants.DASHBOARD_SET_RSSI_FLITER: {
            return {
                ...state,
                [action.target]: {
                    ...state[action.target],
                    ...action.data,
                },
            };
        }
        case Constants.DASHBOARD_SET_TEMP_NODE_CONFIG: {
            return {
                ...state,
                tempNodeConfig: action.data,
            };
        }
        case Constants.DASHBOARD_SET_CLUSTER_INFORMATION: {
            return {
                ...state,
                clusterInformation: action.data,
            };
        }
        case Constants.DASHBOARD_UPDATE_PARENT_INFO: {
            return {
                ...state,
                isNodeConfigUpdated: action.data,
            };
        }
        default:
            return state;
    }
}

export default dashboardReducer;
