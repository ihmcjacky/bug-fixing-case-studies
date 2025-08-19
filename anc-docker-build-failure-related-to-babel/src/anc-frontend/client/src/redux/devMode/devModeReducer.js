import Constants from './devModeConstants';

const INITIAL_STATE = {
    enableBoundlessConfig: false,
    enableDebugCountry: false,
    enableBatchFwUpgrade: true,
    enableWatchdogConfig: false,
    enableExportAnmRawLog: false,
    enableGraphicSettings: false,
};

function devModeReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.INIT_DEV_SETTINGS: {
            return {
                ...state,
                ...action.init,
            };
        }
        case Constants.SWITCH_BOUNDLESS_CONFIG_ON_OFF: {
            return {
                ...state,
                enableBoundlessConfig: action.enable,
            };
        }
        case Constants.SWITCH_DEBUG_COUNTRY_ON_OFF: {
            return {
                ...state,
                enableDebugCountry: action.enable,
            };
        }
        case Constants.SWITCH_BATCH_FW_UPGRADE: {
            return {
                ...state,
                enableBatchFwUpgrade: action.enable,
            };
        }
        case Constants.SWITCH_WATCHDOG_CONFIG: {
            return {
                ...state,
                enableWatchdogConfig: action.enable,
            };
        }
        case Constants.SWITCH_EXPORT_AMM_RAW_LOG: {
            return {
                ...state,
                enableExportAnmRawLog: action.enable,
            };
        }
        case Constants.SWITCH_GRAPHIC_SETTINGS: {
            return {
                ...state,
                enableGraphicSettings: action.enable,
            };
        }
        default: {
            return state;
        }
    }
}

export default devModeReducer;
