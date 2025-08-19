import notificationConstants from '../../constants/notificationCenter';
import {convertIpToMac} from '../../util/formatConvertor';
import {addNewNotific} from '../../redux/notificationCenter/notificationActions';
import {syncProjectUiSettings} from '../../redux/uiProjectSettings/uiProjectSettingsActions';
import {updateOverallStatus} from '../../redux/firmwareUpgrade/firmwareUpgradeActions';
import {handleRadioInfoWebsocketRes} from '../../redux/linkAlignment/linkAlignmentActions';
import {handleSpectrumScanWebsocket} from '../../redux/spectrumScan/spectrumScanActions';
import {
    pushScanningResult,
    endOfScanning,
    updateRecoverNodeResult,
} from '../../redux/nodeRecovery/nodeRecoveryActions';
import store from '../../redux/store';

const {notificationType, notificationIconType, notificationActionType} = notificationConstants;

export function firmwareUpgradeHandler(data) {
    const status = {
        status: 'onUpgrade',
        detail: {
            percentage: data.percentage,
        },
    };
    store.dispatch(updateOverallStatus(status));
};

export function radioInfoHandler(data) {
    const {isPolling, radioData} = store.getState().linkAlignment;
    if (isPolling && radioData.length > 0) {
        store.dispatch(handleRadioInfoWebsocketRes(data));
    }
};

export function generalInfoHandler(message) {
    // if (message.subtype === 'NODE_REBOOT') {
    //     const {data: {ipv4}} = message;
    //     const {nodeInfo} = store.getState().meshTopology;
    //     const node = nodeInfo[ipv4];
    //     const notiftyObj = {
    //         type: notificationType.deviceRebootRequired,
    //         iconType: notificationIconType.notify,
    //         info: {
    //             deviceList: [ipv4],
    //             status: 'pending',
    //             hostname: node?.hostname ?? '-',
    //             mac: node?.mac ?? convertIpToMac(ipv4),
    //         },
    //         onClickAction: notificationActionType.reboot,
    //         cannotRemove: true,
    //     };
    //     store.dispatch(addNewNotific([notiftyObj]));
    //     store.dispatch(syncProjectUiSettings());
    // }
};

export function spectrumScanHandler(data) {
    const {
        spectrumScan: {open},
    } = store.getState();
    if (!open) return;

    store.dispatch(handleSpectrumScanWebsocket(data));
};

function filterNodeRecoveryScanningData(data, nodes, nodeInfo, currentResults) {
    const ipList = Object.keys(nodeInfo);

    const filteredData = {};

    Object.keys(data).forEach((mac) => {
        let isConnectedNode = false;
        let isDuplicateNode = false;
        ipList.some((ip, index) => {
            if (nodeInfo[ip].mac === mac) {
                const nodeInTopology = nodes.find((node) => node.id === ip);
                if (nodeInTopology && nodeInTopology.isReachable) {
                    isConnectedNode = true;
                    ipList.splice(index, 1);
                    return true;
                }
                ipList.splice(index, 1);
                return true;
            }
            return false;
        });

        const id = `${mac}-${data[mac].radio}-${data[mac].clusterId}-${data[mac].channel}-${data[mac].channelBandwidth}`;

        currentResults.forEach((node) => {
            if (node.id === id) {
                isDuplicateNode = true;
            }
            return isDuplicateNode;
        });
        if (!isConnectedNode && !isDuplicateNode) {
            filteredData[mac] = {
                id,
                ...data[mac],
                channel: parseInt(data[mac].channel, 10),
            };
        }
    });
    console.log(filteredData)
    return filteredData;
}

export function nodeRecoveryScanningResultHandler(data) {
    const {
        meshTopology: {
            graph: {nodes},
            nodeInfo,
        },
        nodeRecovery: {
            open,
            scanningState: {
                scanningStatus,
                scanningResults,
            },
        },
    } = store.getState();
    if (!open || scanningStatus !== 'scanning') return;

    const filteredData = filterNodeRecoveryScanningData(data,nodes, nodeInfo, scanningResults);

    store.dispatch(pushScanningResult(filteredData));
}

export function nodeRecoveryScanningEnded(data) {
    const {
        meshTopology: {
            graph: {nodes},
            nodeInfo,
        },
        nodeRecovery: {
            open,
            scanningState: {
                scanningStatus,
                scanningResults,
            },
        },
    } = store.getState();
    if (!open || scanningStatus !== 'scanning') return;

    const filteredData = filterNodeRecoveryScanningData(data, nodes, nodeInfo, scanningResults);

    store.dispatch(endOfScanning(filteredData));
}

export function recoverNodeResultHanding(data) {
    const {
        nodeRecovery: {open}
    } = store.getState();
    if (!open) return;

    store.dispatch(updateRecoverNodeResult(data));
}
