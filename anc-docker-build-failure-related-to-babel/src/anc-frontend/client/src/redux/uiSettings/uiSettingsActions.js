import Constants from './uiSettingsConstants';
import { getUiSettings, setUiSettings } from '../../util/apiCall';
import cookies from 'js-cookie'


export function updateUiSettings(newSession = false) {
    return (dispatch, getState) => {
        const {
            common: {csrf},
        } = getState();
        return getUiSettings(csrf).then((res) => {
            if (newSession) {
                dispatch({
                    type: Constants.UPDATE_UI_SETTINGS,
                    data: {...res, enableFwDowngrade: false},
                });
                dispatch(syncUiSettings());
            } else {
                dispatch({
                    type: Constants.UPDATE_UI_SETTINGS,
                    data: res,
                });
            }
            return res;
        }).catch(err => err);
    };
}

export function syncUiSettings() {
    return function (dispatch, getState) {
        const {
            uiSettings,
        } = getState();
        const csrf = cookies.get('csrftoken')
        return setUiSettings(csrf, {auxData: uiSettings})
            .then(res => res);
    };
}

export function updateShouldHelpDialogPopUp(type, show) {
    return {
        type: Constants.UPDATE_SHOULD_POPUP_HELP_DIALOG,
        data: {
            type,
            show,
        },
    };
}

export function updateRememberSecret(projectSecret) {
    return {
        type: Constants.UPDATE_REMEMBER_SECRET,
        projectSecret,
    };
}

export function setUiSettingsItem(key, data) {
    return {
        type: Constants.SET_UI_SETTINGS,
        key,
        data,
    };
}

export function updateTrafficLoadSettings(data) {
    return function (dispatch) {
        dispatch({
            type: Constants.DASHBOARD_UPDATE_TRAFFIC_LOAD_SETTINGS,
            data,
        });
    };
}
