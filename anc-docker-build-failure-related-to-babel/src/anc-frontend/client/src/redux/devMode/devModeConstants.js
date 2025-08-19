const ret = {};

// App specific constants
const events = [
    'INIT_DEV_SETTINGS',
    'SWITCH_BOUNDLESS_CONFIG_ON_OFF',
    'SWITCH_DEBUG_COUNTRY_ON_OFF',
    'SWITCH_BATCH_FW_UPGRADE',
    'SWITCH_WATCHDOG_CONFIG',
    'SWITCH_EXPORT_AMM_RAW_LOG',
    'SWITCH_GRAPHIC_SETTINGS',
];
events.forEach((e) => {
    ret[e] = e;
});

export default ret;
