const ret = {};

// App specific constants
const events = [
    'START_POLLING',
    'STOP_POLLING',
    'RESTART_POLLING',
    'UPDATE_POLLING_INTERVAL',
    'UPDATE_ONCE',
    'PAUSE_WEBSOCKET',
    'RESUME_WEBSOCKET',
    'ABORT_POLLING',
    'RESUME_POLLING',
    'START_ISLOGGINGIN_COUNT',
    'STOP_ISLOGGINGIN_COUNT'
];

events.forEach((e) => {
    ret[e] = e;
});

export default ret;
