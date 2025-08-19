const ret = {};

// App specific constants
const events = [
    'OPEN_NETWORK_EVENT_CENTER',
    'CLOSE_NETWORK_EVENT_CENTER',
    'SET_NETWORK_EVENT_TABLE_DATA',
    'SET_NETWORK_EVENT_TABLE_META_DATA',
    'SET_NETWORK_EVENT_TABLE_SORT',
    'SET_NETWORK_EVENT_SEARCH_KEYWORD',
    'OPEN_EXPORT_NETWORK_EVENT_DIALOG',
    'CLOSE_EXPORT_NETWORK_EVENT_DIALOG',
];
events.forEach((e) => {
    ret[e] = e;
});

export default ret;
