import Constants from './pollingConstants';

export function startIsLoggingInCount() {
    return {
        type: Constants.START_ISLOGGINGIN_COUNT
    };
}

export function stopIsLoggingInCount() {
    return {
        type: Constants.STOP_ISLOGGINGIN_COUNT
    };
}

export function startPolling() {
    return {
        type: Constants.START_POLLING,
    };
}

export function stopPolling() {
    return {
        type: Constants.STOP_POLLING,
    };
}

export function restartPolling() {
    return {
        type: Constants.RESTART_POLLING,
    };
}

export function updatePollingInterval(interval) {
    return {
        type: Constants.UPDATE_POLLING_INTERVAL,
        interval,
    };
}

export function updateDataOnce() {
    return {
        type: Constants.UPDATE_ONCE,
    };
}

export function pauseWebsocket() {
    return {
        type: Constants.PAUSE_WEBSOCKET
    };
}

export function resumeWebsocket() {
    return {
        type: Constants.RESUME_WEBSOCKET
    };
}

export function abortPolling() {
    return {
        type: Constants.ABORT_POLLING,
    };
}

export function resumePolling() {
    return {
        type: Constants.RESUME_POLLING,
    };
}
