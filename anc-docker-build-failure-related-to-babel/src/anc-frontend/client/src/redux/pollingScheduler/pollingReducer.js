import Constants from './pollingConstants';

const INITIAL_STATE = {
    isPolling: false,
    interval: 10,
    restart: 0,
    updateOnce: 0,
    websocketPaused: false,
    abortPolling: false,
    isNodeLoggingInCounterStart: false
};

function pollingReducer(state = INITIAL_STATE, action) {
    switch (action.type) {
        case Constants.START_ISLOGGINGIN_COUNT:
            return {
                ...state,
                isNodeLoggingInCounterStart: true
            }
        case Constants.STOP_ISLOGGINGIN_COUNT:
            return {
                ...state,
                isNodeLoggingInCounterStart: false
            }
        case Constants.START_POLLING: {
            return {
                ...state,
                isPolling: true,
            };
        }
        case Constants.STOP_POLLING: {
            return {
                ...state,
                isPolling: false,
            };
        }
        case Constants.RESTART_POLLING: {
            return {
                ...state,
                isPolling: true,
                restart: state.restart + 1,
            };
        }
        case Constants.UPDATE_POLLING_INTERVAL: {
            return {
                ...state,
                interval: action.interval,
            }
        }
        case Constants.UPDATE_ONCE: {
            return {
                ...state,
                updateOnce: state.updateOnce + 1,
            };
        }
        case Constants.RESUME_WEBSOCKET: {
            return {
                ...state,
                websocketPaused: false,
            };
        }
        case Constants.PAUSE_WEBSOCKET: {
            return {
                ...state,
                websocketPaused: true,
            };
        }
        case Constants.ABORT_POLLING: {
            return {
                ...state,
                abortPolling: true,
            };
        }
        case Constants.RESUME_POLLING: {
            return {
                ...state,
                abortPolling: false,
            };
        }
        default: {
            return state;
        }
    }
}

export default pollingReducer;
