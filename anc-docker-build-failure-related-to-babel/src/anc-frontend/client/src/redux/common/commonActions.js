import Constants from './commonConstants';

export function setAutoLoginFlag(flag) {
    return {
        type: Constants.SET_AUTO_LOGIN_FLAG,
        isAutoLogin: flag
    }
}

export function setAutoLoginDialogData(
    projectAppDialogTitle, projectAppDialogContent, projectAppDialogOpen
) {
    return {
        type: Constants.SET_AUTO_LOGIN_DIALOG_DATA,
        projectAppDialogTitle,
        projectAppDialogContent,
        projectAppDialogOpen
    }
}

export function setCsrfToken(csrf) {
    return {
        type: Constants.SET_CSRF_TOKEN,
        csrf,
    };
}

export function setLang(lang) {
    return {
        type: Constants.SET_LANG,
        lang,
    };
}

export function setHasUser(hasUser) {
    return {
        type: Constants.SET_HAS_USER,
        hasUser,
    };
}

export function setLoggedinAmn(loggedIn) {
    return {
        type: Constants.SET_LOGGEDIN_AMN,
        loggedIn,
    };
}

export function setLoginStatus(status) {
    return {
        type: Constants.SET_LOGIN_STATUS,
        status,
    };
}

export function setSelectedLocation(location) {
    return {
        type: Constants.SET_SELECTED_LOCATION,
        location,
    };
}

export function setEnv(env) {
    return {
        type: Constants.SET_ENV,
        env,
    };
}

export function openLogoutDialog(title, content, actionTitle, cancelTitle = null) {
    return {
        type: Constants.OPEN_LOGOUT_DIALOG,
        dialog: {
            title,
            content,
            actionTitle,
            cancelTitle,
        },
    };
}

export function closeLogoutDialog(title, content, actionTitle, cancelTitle = null) {
    return {
        type: Constants.CLOSE_LOGOUT_DIALOG,
        dialog: {
            title,
            content,
            actionTitle,
            cancelTitle,
        },
    };
}

export function toggleLockLayer(show) {
    return {
        type: Constants.LOCK_PAGE_CHANGE,
        show
    };
}

export function changeMeshView(meshView) {
    return {
        type: Constants.CHANGE_MESH_VIEW,
        meshView: meshView === 'dashBoard' ? 'dashboard' : meshView,
    };
}

export function toggleSnackBar(messages, duration = 3000) {
    return {
        type: Constants.TOGGLE_SNACK_BAR,
        messages,
        duration,
    };
}

export function closeSnackbar() {
    return {
        type: Constants.CLOSE_SNACK_BAR,
    };
}

export function setInitData(data) {
    return {
        type: Constants.SET_ALL_INIT_DATA,
        data,
    };
}

export function updateProgressBar(active) {
    return {
        type: Constants.UPDATE_PROGRESS_BAR,
        active,
    };
}

export function openSettingsDialog() {
    return {
        type: Constants.OPEN_SETTINGS_DIALOG,
    };
}

export function closeSettingsDialog() {
    return {
        type: Constants.CLOSE_SETTINGS_DIALOG,
    };
}

export function openDeviceListDialog() {
    return {
        type: Constants.OPEN_DEVICE_LIST_DIALOG,
    };
}

export function closeDeviceListDialog() {
    return {
        type: Constants.CLOSE_DEVICE_LIST_DIALOG,
    };
}

export function openGuidelineDialog() {
    return {
        type: Constants.OPEN_GUIDELINE_DIALOG,
    };
}

export function closeGuidelineDialog() {
    return {
        type: Constants.CLOSE_GUIDELINE_DIALOG,
    };
}

export function setHostInfo(hostname, port) {
    return {
        type: Constants.SET_HOST_INFO,
        data: {hostname, port},
    };
}

export function setLabels(labels) {
    return {
        type: Constants.SET_LABELS,
        labels,
    };
}