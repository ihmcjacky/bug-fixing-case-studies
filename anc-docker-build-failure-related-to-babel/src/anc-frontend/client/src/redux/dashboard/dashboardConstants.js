/**
 * @ Author: Kyle Suen
 * @ Create Time: 2019-07-23 11:31:02
 * @ Modified by: Kyle Suen
 * @ Modified time: 2019-08-01 15:18:50
 * @ Description:
 */


const ret = {};

// App specific constants
const events = [
    'DASHBOARD_UPDATE_STATUS_KEY',
    'DASHBOARD_UPDATE_SEARCH_KEY',
    'DASHBOARD_TOGGLE_SEARCH',
    'DASHBOARD_GET_CLUSTER_INFORMATION',
    'DASHBOARD_SET_RSSI_FLITER',
    'DASHBOARD_SET_TEMP_NODE_CONFIG',
    'DASHBOARD_RESET_CLUSTER_INFORMATION',
    'DASHBOARD_SET_CLUSTER_INFORMATION',
];
events.forEach((e) => {
    ret[e] = e;
});

export default ret;

export const filterRange = {
    channel: {
        unit: 'CH',
        min: 36,
        max: 165,
    },
    centralFreq: {
        unit: 'MHz',
        min: 4940,
        max: 4990,
    },
    rssi: {
        unit: 'dBm',
        min: -95,
        max: 0,
    },
};
