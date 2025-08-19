import Constants from './uiProjectSettingsConstants';

const INITIAL_STATE = {
    topology: {
        nodes: {},
        background: {
            show: false,
            wrapperStyle: {
                scale: null,
                translate: {
                    x: null,
                    y: null,
                },
            },
            image: {
                set: false,
                id: '',
            },
            color: '#e5e5e5',
            opacity: 1,
            imgSize: {
                width: 0,
                height: 0,
            },
            viewSize: {
                width: 0,
                height: 0,
            },
            fixWidth: false,
            fixHeight: false,
            pos: {
                x: 0,
                y: 0,
            },
        },
    },
    dashboard: {
        trafficLoadSettings: {
            device: 'radio',
            dataType: 'tx+rx',
        },
    },
    notificationCenter: {
        notifyArr: [],
        read: [], // array of read notify id
        unread: [], // array of unread notify id
        nextNotifyID: 0,
        convertDeviceRebootKey: false,
    },
    ntpServerLastSyncTime: '---',
    pollingIntervalOnTopologyView: 30,
    pollingIntervalOnDashboardView: 60,
};

function projectUiSettingsReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.UPDATE_UI_PROJECT_SETTINGS: {
            return {
                ...state,
                ...action.data,
                topology: {
                    ...INITIAL_STATE.topology,
                    ...action.data.topology,
                },
            };
        }
        case Constants.SET_UI_PROJECT_SETTINGS: {
            return {
                ...state,
                [action.key]: action.data,
            };
        }
        case Constants.SET_BACKGROUND_SETTINGS: {
            return {
                ...state,
                topology: {
                    ...state.topology,
                    background: {
                        ...state.topology.background,
                        [action.key]: action.data,
                    },
                },
            };
        }
        case Constants.SET_UI_PROJECT_BACKGROUND_OBJ: {
            return {
                ...state,
                topology: {
                    ...state.topology,
                    background: {
                        ...state.topology.background,
                        ...action.data,
                    },
                },
            };
        }
        default: {
            return state;
        }
    }
}

export default projectUiSettingsReducer;
