import i18n from '../../I18n';

export function meshTopologyErrDeterminer(err, t, message) {
    switch (err) {
        case 'unreachable.headnodeunreachable':
            return i18n.t('hostNodeUnreachable');
        case 'auth.password':
            return i18n.t('mismatchManagementSecret');
        case 'nodebusy.headnodebusy':
            return i18n.t('nodeUnreachable');
        case 'appIsBusy':
            return i18n.t('nodeUnreachable');
        case 'timelimitreached':
            return i18n.t('nodeResponseTimeout');
        default:
            const nilnRegex = /^NODE_IS_LOGGING_IN.*/;
            const nodeIsLoggingInRegex = new RegExp(nilnRegex);

            if (message && nodeIsLoggingInRegex.test(message)) {
                return i18n.t('nodeIsLoggingIn');
            }

            // return i18n.t('unexpectedErr');
            // show Host node is unreachable at this moment. for all unexpected error.
            return i18n.t('hostnodeUnreachable');
    }
}