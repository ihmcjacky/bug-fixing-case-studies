import Constants from './firmwareUpgradeConstants';
import store from '../store';

export function setUpFwStatus(data) {
    return {
        type: Constants.SETUP_UPGRADE_PROCESS,
        data,
    };
}

export function updateDeviceFwStatus(data) {
    const currentDevices = {...store.getState().firmwareUpgrade.devices};
    let hasNodeUpgrading = store.getState().firmwareUpgrade.hasNodeUpgrading;

    data.forEach((update) => {
        Object.keys(update).forEach((nodeIp) => {
            currentDevices[nodeIp] = {
                ...currentDevices[nodeIp],
                ...update[nodeIp],
            };
            if (update[nodeIp].status === 'onUpgrade') hasNodeUpgrading = true;
            if (update[nodeIp].detail?.percentage === 100) hasNodeUpgrading = false;
        });
    });

    return {
        type: Constants.UPDATE_DEVICES_STATUS,
        data: {
            devices: currentDevices,
            hasNodeUpgrading,
        },
    };
}

export function updateOverallStatus(data) {
    const currentDevices = {...store.getState().firmwareUpgrade.devices};
    let hasNodeUpgrading = store.getState().firmwareUpgrade.hasNodeUpgrading;

    Object.keys(currentDevices).forEach((ip) => {
        if (data.status === 'onUpgrade' && currentDevices[ip].status === 'onUpgrade') {
            currentDevices[ip].status = data.status;
            currentDevices[ip].detail = data.detail;
        }
        if (data.detail.percentage === 100 || data.status === 'errors') {
            hasNodeUpgrading = false;
        }
    });
    return {
        type: Constants.UPDATE_ALL_STATUS,
        data: {
            devices: currentDevices,
            hasNodeUpgrading,
        },
    };
}

export function clearAllStatus() {
    return {
        type: Constants.CLEAR_ALL_STATUS,
    };
}
