import Constants from './internalSettingsConstants';

const INITIAL_STATE = {
    settingsValue: {},
};

function internalSettingsReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.UPDATE_INTERNAL_SETTINGS: {
            return {
                ...state,
                settingsValue: {
                    ...action.data,
                }
            };
        }
        default: {
            return state;
        }
    }
}

export default internalSettingsReducer;
