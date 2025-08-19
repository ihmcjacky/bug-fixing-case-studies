const ret = {};

// App specific constants
const events = [
    'SET_PROJECT_ID',
    'SET_PROJECT_INFO',
    'UDPATE_PROJECT_LIST',
    'PROJECT_DIALOG_CHANGE_VIEW',
    'OPEN_PROJECT_BACKUP_RESTORE',
    'CLOSE_PROJECT_BACKUP_RESTORE',
    'CHANGE_TO_STAGING',
    'LOGOUT_PROJECT',
];
events.forEach((e) => {
    ret[e] = e;
});

export default ret;
