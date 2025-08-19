import Constants from './devModeConstants';

export function initDevSettings(init) {
    return {
        type: Constants.INIT_DEV_SETTINGS,
        init,
    };
}

export function switchBoundlessConfigOnOff(enable) {
    return {
        type: Constants.SWITCH_BOUNDLESS_CONFIG_ON_OFF,
        enable,
    };
}

export function switchDebugCountryOnOff(enable) {
    return {
        type: Constants.SWITCH_DEBUG_COUNTRY_ON_OFF,
        enable,
    };
}

export function switchBatchFwUpgradeOnOff(enable) {
    return {
        type: Constants.SWITCH_BATCH_FW_UPGRADE,
        enable,
    };
}

export function switchWatchdogConfigOnOff(enable) {
    return {
        type: Constants.SWITCH_WATCHDOG_CONFIG,
        enable,
    };
}

export function switchExportAnmRawLogOnOff(enable) {
    return {
        type: Constants.SWITCH_EXPORT_AMM_RAW_LOG,
        enable,
    };
}

export function switchGraphicSettingsOnOff(enable) {
    return {
        type: Constants.SWITCH_GRAPHIC_SETTINGS,
        enable,
    };
}