import Constants from './uiSettingsConstants';

const INITIAL_STATE = {
    landingView: 'topology',
    enableFwDowngrade: false,
    projectBackgroundIdList: {},
    secret: {},
    shouldHelpDialogPopUp: {
        meshTopology: true,
        project: true,
        quickStaging: true,
    },
    showLinkLabel: true,
    showEthLink: true,
    rssiColor: {
        enable: false,
        color: {
            max: -60,
            min: -75,
        },
    },
    pixiSettings: {
        performanceMode: 'balanced', // 'balanced', 'quality', 'performance', 'custom'
        antialias: false,
        resolution: 1,
        maxFPS: 30,
        minFPS: 10,
        clearBeforeRender: true,
        preference: 'webgl', // 'webgl' or 'webgpu'
    },
    dashboard: {
        trafficLoadSettings: {
            device: 'radio',
            dataType: 'tx+rx',
        },
    }
};

function uiSettingsReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.UPDATE_UI_SETTINGS: {
            return {
                ...state,
                ...action.data,
            };
        }
        case Constants.UPDATE_SHOULD_POPUP_HELP_DIALOG: {
            return {
                ...state,
                shouldHelpDialogPopUp: {
                    ...state.shouldHelpDialogPopUp,
                    [action.data.type]: action.data.show,
                },
            };
        }
        case Constants.UPDATE_REMEMBER_SECRET: {
            return {
                ...state,
                secret: {
                    ...state.secret,
                    ...action.projectSecret,
                },
            };
        }
        case Constants.SET_UI_SETTINGS: {
            return {
                ...state,
                [action.key]: action.data,
            };
        }
        case Constants.DASHBOARD_UPDATE_TRAFFIC_LOAD_SETTINGS:
            return {
                ...state,
                dashboard: {
                    trafficLoadSettings: action.data,
                },
            };
        default: {
            return state;
        }
    }
}

export default uiSettingsReducer;
