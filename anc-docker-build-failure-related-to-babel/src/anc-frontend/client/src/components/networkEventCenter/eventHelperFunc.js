import {convertIpToMac, isValidIP} from '../../util/formatConvertor';

const retrieveHostname = (nodeInfo, nodeIp) => {
    if (nodeInfo[nodeIp]) {
        return nodeInfo[nodeIp].hostname;
    }
     else if (isValidIP(nodeIp)) {
        return convertIpToMac(nodeIp);
    }
    return nodeIp;
}

const getEventCell = (data, nodeInfo, t) => {
    switch (data.eventType) {
        case 'Host node unreachable': {
            if (data.targetDevices && data.targetDevices.devices && data.targetDevices.devices.length > 0) {
                const hostname = retrieveHostname(nodeInfo, data.targetDevices.devices[0]);
                return `${t('hostNodeUnreachableEventSubString1')} ${hostname} ${t('hostNodeUnreachableEventSubString2')}`;
            }
            return '-';
        }
        case 'Host node reachable': {
            if (data.targetDevices && data.targetDevices.devices && data.targetDevices.devices.length > 0) {
                const hostname = retrieveHostname(nodeInfo, data.targetDevices.devices[0]);
                return `${t('hostNodeReachableEventSubString1')} ${hostname} ${t('hostNodeReachableEventSubString2')}`;
            }
            return '-';
        }
        case 'Node reachable': {
            if (data.targetDevices && data.targetDevices.devices && data.targetDevices.devices.length > 0) {
                const hostname = retrieveHostname(nodeInfo, data.targetDevices.devices[0]);
                return `${hostname} ${t('nodeReachableEventSubString')}`;
            }
            return '-';
        }
        case 'Node unreachable': {
            if (data.targetDevices && data.targetDevices.devices && data.targetDevices.devices.length > 0) {
                const hostname = retrieveHostname(nodeInfo, data.targetDevices.devices[0]);
                return `${hostname} ${t('nodeUnreachableEventSubString')}`;
            }
            return '-';
        }
        case 'Wireless link up': {
            if (data.targetDevices && data.targetDevices.devices && data.targetDevices.devices.length > 1) {
                const auxInfo = data.auxInfo;
                const linkInfo = auxInfo.linkInfo;
                const {ip1, ip2, interface1, interface2} = linkInfo;
                const hostname1 = retrieveHostname(nodeInfo, ip1);
                const hostname2 = retrieveHostname(nodeInfo, ip2);

                return ` ${t('wirelessLinkUpEventSubString1')} ${hostname1}.${interface1} ${t('wirelessLinkUpEventSubString2')} ${hostname2}.${interface2}`;
            }
            return '-';
        }
        case 'Wireless link down': {
            if (data.targetDevices && data.targetDevices.devices && data.targetDevices.devices.length > 1) {
                const auxInfo = data.auxInfo;
                const linkInfo = auxInfo.linkInfo;
                const {ip1, ip2, interface1, interface2} = linkInfo;
                const hostname1 = retrieveHostname(nodeInfo, ip1);
                const hostname2 = retrieveHostname(nodeInfo, ip2);
                return ` ${t('wirelessLinkDownEventSubString1')} ${hostname1}.${interface1} ${t('wirelessLinkDownEventSubString2')} ${hostname2}.${interface2}`;
            }
            return '-';
        }
        case 'Ethernet direct link up': {
            if (data.targetDevices && data.targetDevices.devices && data.targetDevices.devices.length > 1) {
                const auxInfo = data.auxInfo;
                const linkInfo = auxInfo.linkInfo;
                const {ip1, ip2, interface1, interface2} = linkInfo;
                const hostname1 = retrieveHostname(nodeInfo, ip1);
                const hostname2 = retrieveHostname(nodeInfo, ip2);
                return ` ${t('ethernetDirectLinkUpEventSubString1')} ${hostname1}.${interface1} ${t('ethernetDirectLinkUpEventSubString2')} ${hostname2}.${interface2}`;
            }
            return '-';
        }
        case 'Ethernet direct link down': {
            if (data.targetDevices && data.targetDevices.devices && data.targetDevices.devices.length > 1) {
                const auxInfo = data.auxInfo;
                const linkInfo = auxInfo.linkInfo;
                const {ip1, ip2, interface1, interface2} = linkInfo;
                const hostname1 = retrieveHostname(nodeInfo, ip1);
                const hostname2 = retrieveHostname(nodeInfo, ip2);
                return ` ${t('ethernetDirectLinkDownEventSubString1')} ${hostname1}.${interface1} ${t('ethernetDirectLinkDownEventSubString2')} ${hostname2}.${interface2}`;
            }
            return '-';
        }
        case 'Host node changed': {
            if (data.targetDevices && data.targetDevices.devices && data.targetDevices.devices.length > 1) {
                const hostname1 = retrieveHostname(nodeInfo, data.targetDevices.devices[0]);
                const hostname2 = retrieveHostname(nodeInfo, data.targetDevices.devices[1]);
                return ` ${t('hostNodeChangedEventSubString1')} ${hostname1} ${t('hostNodeChangedEventSubString2')} ${hostname2}`;
            }
            return '-';
        }
        default:
            return data.eventType;
    }
}


export {getEventCell, retrieveHostname};