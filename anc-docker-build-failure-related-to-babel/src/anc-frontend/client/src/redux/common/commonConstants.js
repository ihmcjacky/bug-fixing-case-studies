const ret = {};

// App specific constants
const events = [
    'SET_AUTO_LOGIN_DIALOG_DATA',
    'SET_AUTO_LOGIN_FLAG',
    'SET_CSRF_TOKEN',
    'SET_LANG',
    'SET_LOGIN_STATUS',
    'SET_HAS_USER',
    'SET_LOGGEDIN_AMN',
    'SET_SELECTED_LOCATION',
    'SET_ENV',
    'SET_ALL_INIT_DATA',
    'OPEN_LOGOUT_DIALOG',
    'CLOSE_LOGOUT_DIALOG',
    'LOCK_PAGE_CHANGE',
    'CHANGE_MESH_VIEW',
    'TOGGLE_SNACK_BAR',
    'CLOSE_SNACK_BAR',
    'UPDATE_PROGRESS_BAR',
    'OPEN_SETTINGS_DIALOG',
    'CLOSE_SETTINGS_DIALOG',
    'OPEN_DEVICE_LIST_DIALOG',
    'CLOSE_DEVICE_LIST_DIALOG',
    'OPEN_GUIDELINE_DIALOG',
    'CLOSE_GUIDELINE_DIALOG',
    'SET_HOST_INFO',
    'SET_LABELS',
];
events.forEach((e) => {
    ret[e] = e;
});

export default ret;
