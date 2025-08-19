import Constants from './notificationConstants';
import {RebootDialogStatus} from '../../constants/common';

const INITIAL_STATE = {
    notifyArr: [],
    read: [], // array of read notify id
    unread: [], // array of unread notify id
    nextNotifyID: 0,
    open: false,
    maxNoOfNotify: 1000,
    curTab: 'unread',
    rebootDialog: {
        status: RebootDialogStatus.CLOSE,
        deviceInfo: {},
    },
    init: false,
};

function commonReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.OPEN_NOTIFIC_CENTER: {
            return {
                ...state,
                open: true,
                curTab: 'unread',
            };
        }
        case Constants.CLOSE_NOTIFTIC_CENTER: {
            return {
                ...state,
                open: false,
            };
        }
        case Constants.CHANGE_TAB: {
            return {
                ...state,
                curTab: action.tab,
            };
        }
        case Constants.INIT_NOTIFIC_CENTER: {
            return {
                ...state,
                ...action.center,
                init: true,
            };
        }
        case Constants.CHANGE_REBOOT_DIALOG_STATUS: {
            return {
                ...state,
                rebootDialog: {
                    status: action.status,
                    deviceInfo: action.deviceInfo,
                },
            };
        }
        case Constants.CLEAR_ALL_BY_TYPE: {
            return {
                ...state,
                notifyArr: action.newNotifyArr,
                read: action.newRead,
                unread: action.newUnread,
            };
        }
        case Constants.REFRESH_NOTIFICATION_CENTER: {
            return {
                ...state,
                ...action.updatedCenter,
            };
        }
        case Constants.MARK_ALL_NOTIFIC_AS_READ: {
            return {
                ...state,
                notifyArr: action.newNotifyArr,
                read: action.newRead,
                unread: [],
            };
        }
        case Constants.MARK_NOTIFIC_AS_READ: {
            return {
                ...state,
                notifyArr: action.newNotifyArr,
                read: action.newRead,
                unread: action.newUnread,
            };
        }
        case Constants.REMOVE_NOTIFY: {
            return {
                ...state,
                notifyArr: action.newNotifyArr,
                read: action.newRead,
                unread: action.newUnread,
            };
        }
        case Constants.ADD_NEW_NOTIFIC: {
            return {
                ...state,
                notifyArr: action.newNotifyArr,
                read: action.newRead,
                unread: action.newUnread,
                nextNotifyID: action.nextNotifyID,
            };
        }
        case Constants.UPDATE_NEW_DEVICE_NOTI: {
            return {
                ...state,
                notifyArr: action.updatedNoti,
            };
        }
        case Constants.UPDATE_NOTIFY: {
            return {
                ...state,
                notifyArr: action.newNotifyArr,
            };
        }
        default: {
            return state;
        }
    }
}

export default commonReducer;
