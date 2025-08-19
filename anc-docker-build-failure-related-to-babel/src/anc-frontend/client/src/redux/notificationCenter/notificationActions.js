import moment from 'moment';
import Cookies from 'js-cookie';
import Constants from './notificationConstants';
import store from '../store';
import NotificationConstants from '../../constants/notificationCenter';

const {notificationType, notificationIconType} = NotificationConstants;

export function openNotificCenter() {
    return {
        type: Constants.OPEN_NOTIFIC_CENTER,
    };
}
export function closeNotificCenter() {
    return {
        type: Constants.CLOSE_NOTIFTIC_CENTER,
    };
}

export function changeTab(tab) {
    return {
        type: Constants.CHANGE_TAB,
        tab
    };
}

export function initNotificCenter(center) {
    return {
        type: Constants.INIT_NOTIFIC_CENTER,
        center,
    };
}

export function changeRebootDialogStatus(status, deviceInfo) {
    return {
        type: Constants.CHANGE_REBOOT_DIALOG_STATUS,
        status,
        deviceInfo,
    };
}

export function clearAllByType(type) {
    const {notifyArr} = store.getState().notificationCenter;
    const targetBool = type === 'unread';
    const newNotifyArr = notifyArr.filter(noti => noti.new !== targetBool || noti.cannotRemove);
    const newUnread = [];
    const newRead = [];
    newNotifyArr.forEach((noti, index) => {
        if (noti.new) newUnread.push(index);
        else newRead.push(index);
    });
    return {
        type: Constants.CLEAR_ALL_BY_TYPE,
        newNotifyArr,
        newUnread: newUnread.reverse(),
        newRead: newRead.reverse(),
    };
}

export function refreshNotificationCenter() {
    const {notificationCenter, meshTopology: {graph: {nodes}}} = store.getState();
    const newCenter = {};
    newCenter.notifyArr = notificationCenter.notifyArr.flatMap((noti) => {
        let updatedNoti = null;
        // if ((noti.type === notificationType.newUnmanagedDevice || noti.type === notificationType.deviceRebootRequired) &&
        if (noti.type === notificationType.newUnmanagedDevice &&
            noti.iconType !== notificationIconType.success) {
            const {info: {deviceList}} = noti;
            const newDeviceList = [];
            let success = true;
            deviceList.forEach((ip) => {
                const node = nodes.find(e => e.id === ip);
                if (node) {
                    if (!node.isManaged) success = false;
                    newDeviceList.push(ip);
                }
            });
            updatedNoti = {
                info: {deviceList: newDeviceList},
            };
            if (success) updatedNoti.iconType = notificationIconType.success;

            if (newDeviceList.length) {
                return [{
                    ...noti,
                    ...updatedNoti,
                }];
            }
            return [];
        }
        return [noti];
    });
    newCenter.read = [];
    newCenter.unread = [];
    newCenter.notifyArr.forEach((noti, index) => {
        if (noti.new) newCenter.unread.push(index);
        else newCenter.read.push(index);
    });
    newCenter.read.reverse();
    newCenter.unread.reverse();
    return {
        type: Constants.REFRESH_NOTIFICATION_CENTER,
        updatedCenter: newCenter,
    };
}

export function markAllAsRead() {
    const {notifyArr} = store.getState().notificationCenter;
    const newNotifyArr = [...notifyArr];
    const newRead = [];
    newNotifyArr.forEach((noti, index) => {
        noti.new = false; // eslint-disable-line
        newRead.push(index);
    });
    return {
        type: Constants.MARK_ALL_NOTIFIC_AS_READ,
        newNotifyArr,
        newRead: newRead.reverse(),
    };
}

export function markAsRead(list) {
    const {notifyArr} = store.getState().notificationCenter;
    const newRead = [];
    const newUnread = [];
    const newNotifyArr = [...notifyArr];
    if (newNotifyArr.length !== 0) {
        list.forEach((index) => {
            notifyArr[index].new = false;
        });
        newNotifyArr.forEach((noti, index) => {
            if (noti.new) newUnread.push(index);
            else newRead.push(index);
        });
    }
    return {
        type: Constants.MARK_NOTIFIC_AS_READ,
        newRead: newRead.reverse(),
        newUnread: newUnread.reverse(),
        newNotifyArr,
    };
}

export function removeNotify(id) {
    const {notifyArr} = store.getState().notificationCenter;
    const newNotifyArr = notifyArr.filter(noti => noti.id !== id);
    const newRead = [];
    const newUnread = [];
    newNotifyArr.forEach((noti, index) => {
        if (noti.new) newUnread.push(index);
        else newRead.push(index);
    });
    return {
        type: Constants.REMOVE_NOTIFY,
        newNotifyArr,
        newUnread: newUnread.reverse(),
        newRead: newRead.reverse(),
    };
}


/**
 * Function to add new notification to notification center
 *
 * @param {Array} notifications array of all new notifications
 *
 * notification examples:
 * [
 *  {
 *      type: 'NEW_UNMANAGED_DEVICE',
 *      iconType: 'NOTIFY',
 *      info: {
 *          deviceList: ['1.1.1.1', '2.2.2.2'],
 *      },
 *      onClickAction: 'openManagedDeviceList',
 *      actionConfirmBtn: false, // does the action need confirm btn
 *      cannotRemove: false // does the notification can remove when it is not done
 *  },
 *  ...
 * ]
 *
 */
export function addNewNotific(notifications) {
    let {nextNotifyID} = store.getState().notificationCenter;
    const {maxNoOfNotify, notifyArr} = store.getState().notificationCenter;
    const projectId = Cookies.get('projectId');
    const updatedUnread = [];
    notifications.forEach((notific) => {
        const temp = updatedUnread.find((v) => {
            if (v.type === notific.type) {
                return v;
            }
            return false;
        });
        if (temp) {
            temp.info.deviceList.push(...notific.info.deviceList);
        } else if (notific.type === notificationType.newUnmanagedDevice) {
            const {deviceList} = notific.info;
            const newUmanagedDeviceNotiList = Cookies.get(`newUmanagedDeviceNotiList-${projectId}`) ?
                JSON.parse(Cookies.get(`newUmanagedDeviceNotiList-${projectId}`)) : [];
            let alreadyShow = false;
            const listString = JSON.stringify(deviceList.sort());
            newUmanagedDeviceNotiList.some((history) => {
                const historyString = JSON.stringify(history.sort());
                if (historyString === listString) alreadyShow = true;

                return historyString === listString;
            });
            if (!alreadyShow) {
                const newNotific = {
                    ...notific,
                    time: moment().format(),
                    id: nextNotifyID,
                    new: true,
                };
                nextNotifyID += 1;
                newUmanagedDeviceNotiList.push(deviceList);
                Cookies.set(`newUmanagedDeviceNotiList-${projectId}`, newUmanagedDeviceNotiList);
                updatedUnread.push(newNotific);
                if (nextNotifyID > maxNoOfNotify) {
                    nextNotifyID = 0;
                }
            }
        } else {
            const newNotific = {
                ...notific,
                time: moment().format(),
                id: nextNotifyID,
                new: true,
            };
            nextNotifyID += 1;
            updatedUnread.push(newNotific);
            if (nextNotifyID > maxNoOfNotify) {
                nextNotifyID = 0;
            }
        }
    });
    let newNotifyArr = [...notifyArr, ...updatedUnread];
    if (newNotifyArr.length > maxNoOfNotify) {
        newNotifyArr = newNotifyArr.slice(newNotifyArr.length - maxNoOfNotify, newNotifyArr.length);
    }
    const newRead = [];
    const newUnread = [];
    newNotifyArr.forEach((noti, index) => {
        if (noti.new) newUnread.push(index);
        else newRead.push(index);
    });
    return {
        type: Constants.ADD_NEW_NOTIFIC,
        newUnread: newUnread.reverse(),
        newRead: newRead.reverse(),
        newNotifyArr,
        nextNotifyID,
    };
}

export function updateAllUnmanagedDeviceNotify(ipList) {
    const {notificationCenter: {notifyArr}, meshTopology: {graph: {nodes}}} = store.getState();

    const updatedNoti = notifyArr.map((noti) => {
        if (noti.type === 'NEW_UNMANAGED_DEVICE' && noti.iconType !== 'SUCCESS') {
            let success = true;
            noti.info.deviceList.forEach((ip) => {
                if (ipList.includes(ip)) return;
                const node = nodes.find(e => e.id === ip);
                if (!node || !node.isManaged) success = false;
            });
            if (success) {
                return {
                    ...noti,
                    iconType: 'SUCCESS',
                };
            }
            return noti;
        }
        return noti;
    });
    return {
        type: Constants.UPDATE_NEW_DEVICE_NOTI,
        updatedNoti,
    };
}

export function updateNotify(id, update) {
    const {notifyArr} = store.getState().notificationCenter;
    const newNotifyArr = notifyArr.map((noti) => {
        if (noti.id === id) {
            return {
                ...noti,
                ...update,
            };
        }
        return noti;
    });
    return {
        type: Constants.UPDATE_NOTIFY,
        newNotifyArr,
    };
}
