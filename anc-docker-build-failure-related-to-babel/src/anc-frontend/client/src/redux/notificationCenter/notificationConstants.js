const ret = {};

// App specific constants
const events = [
    'INIT_NOTIFIC_CENTER',
    'OPEN_NOTIFIC_CENTER',
    'CLOSE_NOTIFTIC_CENTER',
    'CHANGE_TAB',
    'CHANGE_REBOOT_DIALOG_STATUS',
    'CLEAR_ALL_BY_TYPE',
    'REFRESH_NOTIFICATION_CENTER',
    'MARK_ALL_NOTIFIC_AS_READ',
    'MARK_NOTIFIC_AS_READ',
    'REMOVE_NOTIFY',
    'ADD_NEW_NOTIFIC',
    'UPDATE_NEW_DEVICE_NOTI',
    'UPDATE_NOTIFY',
];
events.forEach((e) => {
    ret[e] = e;
});

export default ret;
