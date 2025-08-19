import Constants from './commonConstants';

const INITIAL_STATE = {
    csrf: '',
    lang: '',
    misc: {
        isAutoLogin: false,
        projectAppDialogTitle: '',
        projectAppDialogContent: '',
        projectAppDialogOpen: false
    },
    anm: {
        username: 'admin',
        hasUser: false,
        loggedin: false,
    },
    hostInfo: {
        hostname: '',
        port: 0,
    },
    location: '',
    meshView: 'topology',
    logoutDialog: {
        open: false,
        title: '',
        content: '',
        actionTitle: '',
        cancelTitle: null,
    },
    env: {
        UI_DISPLAY_VER:'',
        AOS_SUPPORTED_VER:'',
        NTP_SERVER_VER:'',
        CM_VER:'',
        CA_VER:'',
    },
    lock: false,
    snackBar: {
        open: false,
        messages: '',
        duration: 3000,
    },
    progressBar: {
        isActive: false,
    },
    settingsDialog: {
        open: false,
    },
    deviceListDialog: {
        open: false,
    },
    guidelineDialog: {
        open: false,
    },
    labels: {
        fullAppName: '',
        companyName: '',
        appLabel: '',
        fwLabel: '',
    },
};

function commonReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.SET_AUTO_LOGIN_FLAG: {
            return {
                ...state,
                misc: {
                    ...state.misc,
                    isAutoLogin: action.isAutoLogin
                }
            }
        }
        case Constants.SET_AUTO_LOGIN_DIALOG_DATA: {
            return {
                ...state,
                misc: {
                    ...state.misc,
                    projectAppDialogTitle: action.projectAppDialogTitle,
                    projectAppDialogContent: action.projectAppDialogContent,
                    projectAppDialogOpen: action.projectAppDialogOpen
                }
            }
        }
        case Constants.SET_CSRF_TOKEN: {
            return {
                ...state,
                csrf: action.csrf,
            };
        }
        case Constants.SET_LANG: {
            return {
                ...state,
                lang: action.lang,
            };
        }
        case Constants.SET_LOGIN_STATUS: {
            return {
                ...state,
                anm: {
                    ...state.anm,
                    ...action.status.anm,
                },
            }
        }
        case Constants.SET_HAS_USER: {
            return {
                ...state,
                anm: {
                    ...state.anm,
                    hasUser: action.hasUser,
                },
            };
        }
        case Constants.SET_LOGGEDIN_AMN: {
            return {
                ...state,
                anm: {
                    ...state.anm,
                    loggedin: action.loggedin,
                },
            };
        }
        case Constants.SET_SELECTED_LOCATION: {
            return {
                ...state,
                location: action.location,
            };
        }
        case Constants.SET_ALL_INIT_DATA: {
            return {
                ...state,
                csrf: action.data.csrf,
                lang: action.data.lang,
                anm: {
                    ...state.anm,
                    ...action.data.anm,
                },
                location: action.data.location,
                env: action.data.env,
                labels: action.data.labels,
            };
        }
        case Constants.SET_ENV: {
            return {
                ...state,
                env: action.env,
            };
        }
        case Constants.OPEN_LOGOUT_DIALOG: {
            return {
                ...state,
                logoutDialog: {
                    ...action.dialog,
                    open: true,
                },
            }
        }
        case Constants.CLOSE_LOGOUT_DIALOG: {
            return {
                ...state,
                logoutDialog: {
                    ...state.logoutDialog,
                    cancelTitle: null,
                    open: false,
                },
            };
        }
        case Constants.LOCK_PAGE_CHANGE: {
            return {
                ...state,
                lock: action.show,
            };
        }
        case Constants.CHANGE_MESH_VIEW: {
            return {
                ...state,
                meshView: action.meshView,
            };
        }
        case Constants.TOGGLE_SNACK_BAR: {
            return {
                ...state,
                snackBar: {
                    ...state.snackBar,
                    open: true,
                    messages: action.messages,
                    duration: action.duration,
                },
            };
        }
        case Constants.CLOSE_SNACK_BAR: {
            return {
                ...state,
                snackBar: {
                    ...state.snackBar,
                    open: false,
                    messages: '',
                },
            };
        }
        case Constants.UPDATE_PROGRESS_BAR: {
            return {
                ...state,
                progressBar: {
                    isActive: action.active,
                },
            };
        }
        case Constants.OPEN_SETTINGS_DIALOG: {
            return {
                ...state,
                settingsDialog: {
                    open: true,
                },
            };
        }
        case Constants.CLOSE_SETTINGS_DIALOG: {
            return {
                ...state,
                settingsDialog: {
                    open: false,
                },
            };
        }
        case Constants.OPEN_DEVICE_LIST_DIALOG: {
            return {
                ...state,
                deviceListDialog: {
                    open: true,
                },
            };
        }
        case Constants.CLOSE_DEVICE_LIST_DIALOG: {
            return {
                ...state,
                deviceListDialog: {
                    open: false,
                },
            };
        }
        case Constants.OPEN_GUIDELINE_DIALOG: {
            return {
                ...state,
                guidelineDialog: {
                    open: true,
                },
            };
        }
        case Constants.CLOSE_GUIDELINE_DIALOG: {
            return {
                ...state,
                guidelineDialog: {
                    open: false,
                },
            };
        }
        case Constants.SET_HOST_INFO: {
            return {
                ...state,
                hostInfo: {
                    ...action.data
                },
            };
        }
        case Constants.SET_LABELS: {
            return {
                ...state,
                label: {
                    ...action.data
                },
            };
        }
        default: {
            return state;
        }
    }
}

export default commonReducer;
