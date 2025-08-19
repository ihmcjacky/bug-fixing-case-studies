import Constants from './firmwareUpgradeConstants';

const INITIAL_STATE = {
    hasNodeUpgrading: false,
    devices: {},
};

function firmwareUpgradeReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.SETUP_UPGRADE_PROCESS: {
            return {
                ...state,
                devices: {
                    ...state.devices,
                    ...action.data,
                },
            };
        }
        case Constants.UPDATE_DEVICES_STATUS: {
            return {
                ...state,
                devices: action.data.devices,
                hasNodeUpgrading: action.data.hasNodeUpgrading,
            };
        }
        case Constants.UPDATE_ALL_STATUS: {
            return {
                ...state,
                devices: action.data.devices,
                hasNodeUpgrading: action.data.hasNodeUpgrading,
            };
        }
        case Constants.CLEAR_ALL_STATUS: {
            return INITIAL_STATE;
        }
        default:
            return state;
    }
}

export default firmwareUpgradeReducer;
