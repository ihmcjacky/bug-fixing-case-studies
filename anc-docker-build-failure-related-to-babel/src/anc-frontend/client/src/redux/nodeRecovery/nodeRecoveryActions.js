import Constants from './nodeRecoveryConstants';

export function openNodeRecoveryDialog(ip) {
    return {
        type: Constants.OPEN_NODE_RECOVERY_DIALOG,
        ip,
    };
}

export function closeNodeRecoveryDialog() {
    return {
        type: Constants.CLOSE_NODE_RECOVERY_DIALOG,
    };
}

export function updateSettings(settingsObj) {
    return {
        type: Constants.SET_NODE_RECOVERY_SETTINS,
        settingsObj,
    }
}

export function updateSelectedType(recoverSettingsObj) {
    return {
        type: Constants.SET_NODE_RECOVERY_TYPE,
        recoverSettingsObj: {
            ...recoverSettingsObj,
            isSet: true,
        },
    };
}

export function resetNodeRecoveryData(preserveNodeIp = false) {
    return {
        type: Constants.RESET_NODE_RECOVERY_DATA,
        preserveNodeIp,
    };
}

export function startScanning() {
    return {
        type: Constants.START_NODE_SCANNING,
    };
}

export function pushScanningResult(results) {
    const tableRow = [];
    Object.keys(results).forEach((mac) => {
        const temp = {
            mac,
            id: `${mac}-${results[mac].radio}-${ results[mac].channel}`,
            ...results[mac],
        };
        tableRow.push(temp);
    });
    return {
        type: Constants.PUSH_SCANNING_RESULT,
        tableRow,
    };
}

export function endOfScanning(results) {
    const tableRow = [];
    Object.keys(results).forEach((mac) => {
        const temp = {
            mac,
            id: `${mac}-${results[mac].radio}-${ results[mac].channel}`,
            ...results[mac],
        };
        tableRow.push(temp);
    });
    return {
        type: Constants.END_OF_SCANNING,
        tableRow,
    };
}

export function clearScanningResult() {
    return {
        type: Constants.CLEAR_SCANNING_RESULT,
    };
}

export function startNodeRecovery(info) {
    return {
        type: Constants.START_NODE_RECOVERY,
        info
    };
}

export function updateRecoverNodeStatus(status) {
    return {
        type: Constants.UPDATE_RECOVER_NODE_STATUS,
        status,
    };
}

export function updateRecoverNodeResult(result) {
    let status = 'tempConnected';
    if (!result.success) {
        status = 'error';
    }

    console.log('-----updateRecoverNodeResult', result);
    return {
        type: Constants.UPDATE_RECOVER_NODE_RESULT,
        result,
        status,
    };
}

export function recoverNodeClosed() {
    return {
        type: Constants.NODE_RECOVERY_CLOSED,
    };
}

export function nodeRecoveryCompleted() {
    return {
        type: Constants.NODE_RECOVERY_COMPLETED,
    };
}

export function stopNodeRecovery() {
    return {
        type: Constants.NODE_RECOVERY_STOP_RECOVERY,
    };
}

export function notifyChangeSecret() {
    return {
        type: Constants.NODE_RECOVERY_CHANGE_SECRET,
    };
}

export function saveRecoveryResult(result) {
    return {
        type: Constants.NODE_RECOVERY_SAVE_RECOVERY,
        result,
    };
}

export function clearCurrentRecoveryData() {
    return {
        type: Constants.CLEAR_CURRENT_RECOVERY_DATA,
    };
}
