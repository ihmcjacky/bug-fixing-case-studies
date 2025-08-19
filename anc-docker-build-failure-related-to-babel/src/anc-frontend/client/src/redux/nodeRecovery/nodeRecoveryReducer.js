import Constants from './nodeRecoveryConstants';

const INITIAL_STATE = {
    open: false,
    ip: '',
    settings: {
        timeout: 60, // const, not allow to change
        resumeWhenTimeout: true,
    },
    scanningState: {
        recoverSettings: {
            isSet: false,
            controlNodeRadio: '',
        },
        /*
            pending: waiting for scan nearby neighbour api call
            scanning: scan nearby neighbour api called success, waiting for END_OF_SCANNING websocket
            ended: END_OF_SCANNING websocket messages is back
        */
        scanningStatus: 'pending', // pending, scanning or ended
        scanningResults: [],
    },
    recoverState: {
        /*
            pending: waiting for recover node api call
            processing: recover node api call success, waiting for temp connection websocket
            tempConnected: temp connection websocket return success true
            error: temp connection websocket return success error
            closed: recover node timeout or extend recover node api call failed
            completed: every things is done
         */
        recoveryStatus: 'pending',
        recoveryResult: {},
        recoveryInfo: {
            controlNode: {},
            lostNode: {},
        },
    },
    saveState: {
        status: false,
    },
    changedSecret: false
};

function nodeRecoveryReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.OPEN_NODE_RECOVERY_DIALOG: {
            return {
                ...state,
                open: true,
                ip: action.ip,
            };
        }
        case Constants.CLOSE_NODE_RECOVERY_DIALOG: {
            return {
                ...state,
                open: false,
            };
        }
        case Constants.RESET_NODE_RECOVERY_DATA: {
            return {
                ...state,
                ...(!action.preserveNodeIp && {ip: ''}),
                settings: {
                    timeout: 60,
                    resumeWhenTimeout: true,
                },
                scanningState: {
                    recoverSettings: {
                        isSet: false,
                        controlNodeRadio: '',
                    },
                    scanningStatus: 'pending',
                    scanningResults: [],
                },
                recoverState: {
                    recoveryStatus: 'pending',
                    recoveryResult: {},
                    recoveryInfo: {
                        controlNode: {},
                        lostNode: {},
                    },
                },
                changedSecret: false,
            };
        }
        case Constants.SET_NODE_RECOVERY_SETTINS: {
            return {
                ...state,
                settings: {
                    ...state.settings,
                    ...action.settingsObj,
                },
            };
        }
        case Constants.SET_NODE_RECOVERY_TYPE: {
            return {
                ...state,
                scanningState: {
                    ...state.scanningState,
                    recoverSettings: {
                        ...state.recoverSettings,
                        ...action.recoverSettingsObj,
                    },
                },
            };
        }
        case Constants.END_OF_SCANNING: {
            return {
                ...state,
                scanningState: {
                    ...state.scanningState,
                    scanningStatus: 'ended',
                    scanningResults: [
                        ...state.scanningState.scanningResults,
                        ...action.tableRow,
                    ],
                }
            };
        }
        case Constants.START_NODE_SCANNING: {
            return {
                ...state,
                scanningState: {
                    ...state.scanningState,
                    scanningStatus: 'scanning',
                }
            }
        }
        case Constants.PUSH_SCANNING_RESULT: {
            return {
                ...state,
                scanningState: {
                    ...state.scanningState,
                    scanningResults: [
                        ...state.scanningState.scanningResults,
                        ...action.tableRow,
                    ],
                },
            };
        }
        case Constants.CLEAR_SCANNING_RESULT: {
            return {
                ...state,
                scanningState: {
                    ...state.scanningState,
                    scanningStatus: 'pending',
                    scanningResults: [],
                },
            };
        }
        case Constants.START_NODE_RECOVERY: {
            return {
                ...state,
                recoverState: {
                    ...state.recoverState,
                    recoveryStatus: 'processing',
                    recoveryResult: {},
                    recoveryInfo: action.info,
                },
            };
        }
        case Constants.UPDATE_RECOVER_NODE_STATUS: {
            return {
                ...state,
                recoverState: {
                    ...state.recoverState,
                    recoveryStatus: action.status,
                },
            };
        }
        case Constants.UPDATE_RECOVER_NODE_RESULT: {
            return {
                ...state,
                recoverState: {
                    ...state.recoverState,
                    recoveryStatus: action.status,
                    recoveryResult: action.result,
                },
            };
        }
        case Constants.NODE_RECOVERY_COMPLETED: {
            return {
                ...state,
                recoverState: {
                    ...state.recoverState,
                    recoveryStatus: 'completed',
                },
            };
        }
        case Constants.NODE_RECOVERY_CLOSED: {
            return {
                ...state,
                recoverState: {
                    ...state.recoverState,
                    recoveryStatus: 'closed',
                },
            };
        }
        case Constants.NODE_RECOVERY_STOP_RECOVERY: {
            return {
                ...state,
                recoverState: {
                    ...state.recoverState,
                    recoveryStatus: 'pending',
                    recoveryResult: {},
                },
            };
        }
        case Constants.NODE_RECOVERY_CHANGE_SECRET: {
            return {
                ...state,
                changedSecret: true,
            };
        }
        case Constants.NODE_RECOVERY_SAVE_RECOVERY: {
            return {
                ...state,
                saveState: {
                    ...state.saveState,
                    status: action.result,
                }
            }
        }
        case Constants.CLEAR_CURRENT_RECOVERY_DATA: {
            return {
                ...state,
                scanningState: INITIAL_STATE.scanningState,
                recoverState: INITIAL_STATE.recoverState,
            }
        }
        default:
            return state;
    }
}

export default nodeRecoveryReducer;
