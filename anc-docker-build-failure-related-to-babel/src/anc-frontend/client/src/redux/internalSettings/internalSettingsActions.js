import Constants from './internalSettingsConstants';
import {getInternalSettings, setInternalSettings} from '../../util/apiCall';

export function updateInternalSettingsFromDB() {
    return (dispatch, getState) => {
        const {
            common: {csrf},
            projectManagement: {projectId},
        } = getState();
        return getInternalSettings(csrf, projectId).then((res) => {
            dispatch({
                type: Constants.UPDATE_INTERNAL_SETTINGS,
                data: res,
            });
            return res;
        }).catch(err => err);
    };
}

export function syncInternalSettings() {
    return function (dispatch, getState) {
        const {
            common: {csrf},
            internalSettings: {settingsValue},
            projectManagement: {projectId},
        } = getState();


        return setInternalSettings(csrf, projectId, {auxData: settingsValue})
            .then(res => res)
            .catch(err => err);
    };
}

export function updateInternalSettings(data) {
    return {
        type: Constants.UPDATE_INTERNAL_SETTINGS,
        data,
    };
}
