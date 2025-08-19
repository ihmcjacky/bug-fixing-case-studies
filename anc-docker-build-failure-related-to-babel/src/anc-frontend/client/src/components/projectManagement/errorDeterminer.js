export function loginErrDeterminer(err, t) {
    switch (err) {
        case 'unreachable.headnodeunreachable':
            return 'Host node unreachable';
        case 'auth.password':
            return 'Incorrect management secret';
        case 'nodebusy.headnodebusy':
            return 'Node unreachable';
        case 'appIsBusy':
            return 'Node unreachable';
        case 'timelimitreached':
            return 'Node response timeout';
        case 'zmq.ca.connectionisnotready':
            return 'Host node unreachable';
        default:
            return 'Unexpected Error';
    }
}