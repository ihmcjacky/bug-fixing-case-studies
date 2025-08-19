import Constants from './projectConstants';
import {getProjectList, logoutProject} from '../../util/apiCall';
import ProjectConstants from '../../constants/project';
import Cookies from 'js-cookie';

const {project: {quickStagingName}} = ProjectConstants;

export function setProjectId(id) {
    return {
        type: Constants.SET_PROJECT_ID,
        id,
    };
}

export function setProjectInfo(info) {
    return {
        type: Constants.SET_PROJECT_INFO,
        info,
    };
}

export function updateProjectList() {
    return async (dispatch) => {
        return getProjectList().then((res) => {
            const idToNameMap = {};
            res.forEach((project) => {
                if (project.projectName === quickStagingName) return;
                idToNameMap[project.projectId] = project.projectName;
            });
            dispatch({
                type: Constants.UDPATE_PROJECT_LIST,
                list: res,
                idToNameMap,
            });
            return res;
        }).catch((err) => {
            throw err;
        });
    };
}

export function changeOnView(view) {
    return {
        type: Constants.PROJECT_DIALOG_CHANGE_VIEW,
        view,
    };
}

export function logoutProjectAndChangeView() {
    Cookies.remove('projectId');
    Cookies.remove('quickStagingLoginRequest');
    window.location.reload();

    return ({
        type: Constants.LOGOUT_PROJECT,
    });
}

export function openProjectBackupRestore() {
    return {
        type: Constants.OPEN_PROJECT_BACKUP_RESTORE,
    };
}

export function closeProjectBackupRestore() {
    return {
        type: Constants.CLOSE_PROJECT_BACKUP_RESTORE,
    };
}

export function changeToStaging() {
    return {
        type: Constants.CHANGE_TO_STAGING,
    };
}
