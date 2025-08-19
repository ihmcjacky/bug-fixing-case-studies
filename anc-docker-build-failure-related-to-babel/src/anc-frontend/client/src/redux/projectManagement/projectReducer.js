import Constants from './projectConstants';

const INITIAL_STATE = {
    projectId: '',
    projectName: '',
    projectList: [],
    projectDialog: {
        onView: '',
    },
    hasLogin: false,
    projectIdToNameMap: {},
    backupRestoreDialog: false,
    changeToStaging: false,
};

function projectReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.SET_PROJECT_ID: {
            return {
                ...state,
                projectId: action.id,
            };
        }
        case Constants.SET_PROJECT_INFO: {
            return {
                ...state,
                ...action.info,
            };
        }
        case Constants.UDPATE_PROJECT_LIST: {
            return {
                ...state,
                projectList: action.list,
                projectIdToNameMap: action.idToNameMap,
            };
        }
        case Constants.PROJECT_DIALOG_CHANGE_VIEW: {
            return {
                ...state,
                projectDialog: {
                    ...state.projectDialog,
                    onView: action.view,
                },
            };
        }
        case Constants.OPEN_PROJECT_BACKUP_RESTORE: {
            return {
                ...state,
                backupRestoreDialog: true,
            }
        }
        case Constants.CLOSE_PROJECT_BACKUP_RESTORE: {
            return {
                ...state,
                backupRestoreDialog: false,
            }
        }
        case Constants.CHANGE_TO_STAGING: {
            return {
                ...state,
                changeToStaging: true,
            };
        }
        case Constants.LOGOUT_PROJECT: {
            return {
                ...INITIAL_STATE
            };
        }
        default: {
            return state;
        }
    }
}

export default projectReducer;
