import {useCallback} from 'react';
import {useImmer} from 'use-immer';
import {convertIpToMac} from './formatConvertor';

const checkLegacy = ({meshSettings}) => {
    let isLegacy = false;
    const legacySyncValue = {};
    const discrepanciesValue = {};
    Object.keys(meshSettings.discrepancies).forEach((nodeIp) => {
        if (typeof meshSettings.discrepancies[nodeIp] !== 'undefined') {
            Object.keys(meshSettings.discrepancies[nodeIp]).forEach((key) => {
                if (meshSettings.discrepancies[nodeIp][key].isLegacy) {
                    isLegacy = true;
                    legacySyncValue[key] = meshSettings.discrepancies[nodeIp][key].value;
                } else {
                    discrepanciesValue[key] = meshSettings[key];
                }
            });
        }
    });
    return {
        isLegacy,
        legacySyncValue,
        discrepanciesValue,
    };
};

const parseLegacyDiscrepancyList = ({nodeSettings, meshSettings: {
    hostname, clusterId, country, managementIp,
    managementNetmask, encKey, bpduFilter, e2eEnc,
    e2eEncKey, globalDiscoveryInterval, globalHeartbeatInterval,
    globalHeartbeatTimeout, globalRoamingRSSIMargin, globalStaleTimeout,
    globalTimezone, discrepancies,
}}, controlNodeIp) => {
    const expectedConfig = {
        nodeIp: 'expectedConfig',
        discrepancies: false,
        hostNode: true,
        mac: 'expectedConfig',
        hostname: nodeSettings[controlNodeIp].hostname,
        clusterId,
        country,
        managementIp,
        managementNetmask,
        encKey,
        bpduFilter,
        e2eEnc,
        e2eEncKey,
        globalDiscoveryInterval,
        globalHeartbeatInterval,
        globalHeartbeatTimeout,
        globalStaleTimeout,
        globalRoamingRSSIMargin,
        globalTimezone,
        isLegacy: {},
    };
    Object.keys(discrepancies).forEach((nodeIp) => {
        if (typeof discrepancies[nodeIp] !== 'undefined') {
            Object.keys(discrepancies[nodeIp]).forEach((key) => {
                if (discrepancies[nodeIp][key].isLegacy) {
                    expectedConfig[key] = discrepancies[nodeIp][key].value;
                    expectedConfig.isLegacy[key] = nodeIp;
                }
            });
        }
    });
    const legacyArray = Object.keys(nodeSettings).flatMap((nodeIp) => {
        const discrepancy = {
            nodeIp,
            discrepancies: true,
            hostNode: nodeIp === controlNodeIp,
            mac: convertIpToMac(nodeIp),
            hostname: nodeSettings[nodeIp].hostname,
        };
        if (discrepancies[nodeIp]) {
            Object.keys(discrepancies[nodeIp]).forEach((key) => {
                discrepancy[key] = discrepancies[nodeIp][key].value;
            });
        }
        Object.keys(expectedConfig.isLegacy).forEach((key) => {
            if (expectedConfig.isLegacy[key] !== nodeIp) {
                discrepancy[key] = 'notSupported';
            }
        });
        const coreKey = ['nodeIp', 'discrepancies', 'hostNode', 'mac', 'hostname'];
        Object.keys(discrepancy).forEach((key) => {
            if (!coreKey.includes(key)) {
                if (discrepancy[key] === expectedConfig[key]) {
                    delete discrepancy[key];
                }
            }
        });
        return Object.keys(discrepancy).length > 5 ? discrepancy : [];
    });

    return [expectedConfig, ...legacyArray];
};

const parseDiscrepancyList = ({nodeSettings, meshSettings: {
    hostname, clusterId, country, managementIp,
    managementNetmask, encKey, bpduFilter, e2eEnc,
    e2eEncKey, globalDiscoveryInterval, globalHeartbeatInterval,
    globalHeartbeatTimeout, globalRoamingRSSIMargin, globalStaleTimeout,
    globalTimezone, discrepancies,
}}, controlNodeIp) => {
    const discrepanciesList = [];
    discrepanciesList.push({
        nodeIp: controlNodeIp,
        discrepancies: false,
        hostNode: true,
        mac: '-',
        hostname:  nodeSettings[controlNodeIp].hostname,
        clusterId,
        country,
        managementIp,
        managementNetmask,
        encKey,
        bpduFilter,
        e2eEnc,
        e2eEncKey,
        globalDiscoveryInterval,
        globalHeartbeatInterval,
        globalHeartbeatTimeout,
        globalStaleTimeout,
        globalRoamingRSSIMargin,
        globalTimezone,
    });

    Object.keys(discrepancies).forEach((nodeIp) => {
        const discrepancy = {};
        if (typeof discrepancies[nodeIp] !== 'undefined') {
            discrepancy.nodeIp = nodeIp;
            discrepancy.discrepancies = true;
            discrepancy.mac = convertIpToMac(nodeIp);
            discrepancy.hostname = nodeSettings[nodeIp].hostname;
            discrepancy.hostNode = nodeIp === controlNodeIp;
            Object.keys(discrepancies[nodeIp]).forEach((key) => {
                if (!discrepancies[nodeIp][key].isLegacy) {
                    discrepancy[key] = discrepancies[nodeIp][key].value;
                }
            });
        }
        if (Object.keys(discrepancy).length > 5) {
            discrepanciesList.push(discrepancy);
        }
    });

    return discrepanciesList;
};

const useDiscrepancy = () => {
    const [discrepanciesList, updateDiscrepanciesList] = useImmer([]);

    const updateDiscrepancies = useCallback((config, controlNodeIp) => {
        let discrepanciesList = [];
        if ('discrepancies' in config.meshSettings) {
            const {isLegacy, legacySyncValue, discrepanciesValue} = checkLegacy(config);
            if (isLegacy) {
                discrepanciesList = parseLegacyDiscrepancyList(config, controlNodeIp);
            } else {
                discrepanciesList = parseDiscrepancyList(config, controlNodeIp);
            }

            updateDiscrepanciesList(draft => discrepanciesList);
            return {legacySyncValue, discrepanciesValue};
        }
        return {
            legacySyncValue: {},
            discrepanciesValue: {},
        }
    }, [updateDiscrepanciesList])

    return [discrepanciesList, updateDiscrepancies];
}

export default useDiscrepancy
