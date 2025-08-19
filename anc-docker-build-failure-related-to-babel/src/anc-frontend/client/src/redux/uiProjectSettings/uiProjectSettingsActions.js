import Constants from './uiProjectSettingsConstants';
import {getProjectUiSettings, setProjectUiSetting} from '../../util/apiCall';

export function updateProjectUiSettings(initId = undefined) {
    return (dispatch, getState) => {
        const {
            common: {csrf},
            projectManagement: {projectId},
        } = getState();
        return getProjectUiSettings(csrf, initId || projectId).then((res) => {
            dispatch({
                type: Constants.UPDATE_UI_PROJECT_SETTINGS,
                data: res,
            });
            return res;
        }).catch(err => err);
    };
}

export function syncProjectUiSettings() {
    return function (dispatch, getState) {
        const {
            common: {csrf},
            uiProjectSettings,
            projectManagement: {projectId},
            notificationCenter,
        } = getState();

        const {
            curTab, open, init,
            ...backupCenter
        } = notificationCenter;

        const updateObj = {
            ...uiProjectSettings,
            notificationCenter: backupCenter,
        };
        return setProjectUiSetting(csrf, projectId, {auxData: updateObj})
            .then(res => res)
            .catch(err => err);
    };
}

export function setUiProjectSettingsItem(key, data) {
    return {
        type: Constants.SET_UI_PROJECT_SETTINGS,
        key,
        data,
    };
}

export function setProjectUIBackgroundSettings(key, data) {
    return {
        type: Constants.SET_BACKGROUND_SETTINGS,
        key,
        data,
    }
}

export function setProjectUIBackgroundObj(data) {
    return ({
        type: Constants.SET_UI_PROJECT_BACKGROUND_OBJ,
        data,
    });
}
