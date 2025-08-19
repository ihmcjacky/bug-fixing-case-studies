const ret = {};

// App specific constants
const events = [
    'UPDATE_UI_PROJECT_SETTINGS',
    'SET_UI_PROJECT_SETTINGS',
    'SET_BACKGROUND_SETTINGS',
    'SET_UI_PROJECT_BACKGROUND_OBJ',
];
events.forEach((e) => {
    ret[e] = e;
});

export default ret;
