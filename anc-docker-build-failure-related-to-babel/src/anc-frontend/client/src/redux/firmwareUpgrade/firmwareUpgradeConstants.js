const ret = {};

// App specific constants
const events = [
    'SETUP_UPGRADE_PROCESS',
    'UPDATE_DEVICES_STATUS',
    'UPDATE_ALL_STATUS',
    'CLEAR_ALL_STATUS',
];
events.forEach((e) => {
    ret[e] = e;
});

export default ret;
