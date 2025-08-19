const ret = {};

// App specific constants
const events = [
    'UPDATE_UI_SETTINGS',
    'UPDATE_SHOULD_POPUP_HELP_DIALOG',
    'UPDATE_REMEMBER_SECRET',
    'SET_UI_SETTINGS',
    'DASHBOARD_UPDATE_TRAFFIC_LOAD_SETTINGS',
];
events.forEach((e) => {
    ret[e] = e;
});

export default ret;
