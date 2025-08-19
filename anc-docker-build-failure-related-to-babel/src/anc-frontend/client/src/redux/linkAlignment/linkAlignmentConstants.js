const ret = {};

// App specific constants
const events = [
    'TOGGLE_LINK_ALIGNMENT_DIALOG',
    'UPDATE_RADIO_INFO_RES',
    'CLEAR_RADIO_INFO_ARRAY',
    'SET_RADIO',
    'SET_RADIOINFO_POLLING_STATUS',
    'UPDATE_FOCUSED_LINK',
    'UPDATE_SELECTED_LINK',
    'SET_SORTING',
    'SET_FILTER',
    'SET_SEARCH_KEY',
    'TOGGLE_SEARCH',
    'TOGGLE_COLUMN',
    'RESTART_RADIO_INFO',
    'UPDATE_RSSI_GRAPH_CHART_DATA',
    'CONFIG_IN_PROCESS',
];
events.forEach((e) => {
    ret[e] = e;
});

export default ret;
