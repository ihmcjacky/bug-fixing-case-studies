const ret = {};

// App specific constants
const events = [
    'UPDATE_ETH_LINK_SEGMENTS',
    'UPDATE_GRAPH',
    'UPDATE_OPERATION_MODE',
    'UPDATE_NODE_INFO',
    'UPDATE_NETWORK_DEVICE_STAT',
    'UPDATE_LINK_INFO',
    'STOP_GRAPH_UPDATE',
    'RESUME_GRAPH_UPDATE',
    'INIT_BACKGROUND',
    'UPDATE_BACKGROUND_ID',
    'ADJUST_MODE_ONOFF',
    'UPDATE_SHOULD_SHOW_HOSTNODE_UNREACHABLE_DIALOG',
];
events.forEach((e) => {
    ret[e] = e;
});

export default ret;
