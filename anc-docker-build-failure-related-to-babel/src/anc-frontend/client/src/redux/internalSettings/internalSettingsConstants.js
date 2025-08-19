const ret = {};

// App specific constants
const events = [
    'UPDATE_INTERNAL_SETTINGS',
];
events.forEach((e) => {
    ret[e] = e;
});

export default ret;
