/**
 * @ Author: Kyle Suen
 * @ Create Time: 2020-01-16 16:47:55
 * @ Modified by: Kyle Suen
 * @ Modified time: 2020-06-10 17:58:05
 * @ Description:
 */


import i18n from '../I18n';

const check = ({data: error}) => {
    console.log('kyle_debug: check -> error', error);
    const res = {
        title: '',
        content: '',
    };
    console.log(error);
    if (error.type === 'errors') {
        const errorArr = error.data;
        errorArr.forEach((errorCtx) => {
            switch (errorCtx.type) {
                case 'timelimitreached':
                    res.title = i18n.t('timeLimitReachedTitle');
                    res.content = i18n.t('timeLimitReachedContent');
                    break;
                default:
            }
        });
    }
    return res;
};

export default check;

export function firmwareUpgradeErrorDeterminer(errObj, t) {
    if (errObj.is('fwupgrade.upgrade.ftpsdownloaderror')) {
        return t('ftpsdownloadErr');
    } else if (errObj.is('fwupgrade.upgrade.mismatchchecksum')) {
        return t('mismatchchecksumErr');
    } else if (errObj.is('fwupgrade.upgrade.nodeinsufficientspace')) {
        return t('nodeinsufficientspaceErr');
    } else if (errObj.is('fwupgrade.upgrade.mismatchmodel')) {
        return t('mismatchmodelErr');
    } else if (errObj.is('fwupgrade.magicbit')) {
        return t('magicbitErr');
    } else if (errObj.is('stopprocess')) {
        return t('stopprocessErr');
    } else if (errObj.is('fwupgrade.upgrade.nofirmwareimage')) {
        return t('nofirmwareimageErr');
    } else if (errObj.is('headnodeunreachable')) {
        return t('headnodeunreachableErr');
    } else if (errObj.is('headnodebusy')) {
        return t('headnodebusyErr');
    } else if (errObj.is('fwupgrade.upgrade.ftpsuploaderror')) {
        return t('ftpsuploadErr');
    } else if (errObj.is('badargument')) {
        return t('badargumentErr');
    } else if (errObj.is('fwupgrade.upload.filesize')) {
        return t('filesizeErr');
    } else if (errObj.is('nodebusy')) {
        return t('nodebusyErr');
    } else if (errObj.is('unreachable')) {
        return t('unreachableErr');
    } else if (errObj.is('nodiskspace')) {
        return t('nodiskspaceErr');
    } else if (errObj.is('fwupgrade.upload.badimage')) {
        return t('badimageErr');
    } else if (errObj.is('fwdowngradeToPtos.downgrade.nofirmwareimage')) {
        return t('nofirmwareimageErr');
    } else if (errObj.is('nodenotfound')) {
        return t('nodenotfoundErr');
    } else if (errObj.is('fwupgrade.upload.headnodebusy')) {
        return t('headnodebusyErr');
    } else if (errObj.is('fwupgrade.upload.badargument')) {
        return t('badargumentErr');
    } else if (errObj.is('fwupgrade.upload.headnodeunreachable')) {
        return t('headnodeunreachableErr');
    } else if (errObj.is('fwdowngradeToPtos.downgrade.ftpsuploaderror')) {
        return t('ftpsuploadErr');
    } else if (errObj.is('fwdowngradeToPtos.downgrade.ftpsdownloaderror')) {
        return t('ftpsdownloadErr');
    } else if (errObj.is('fwdowngradeToPtos.downgrade.mismatchchecksum')) {
        return t('mismatchchecksumErr');
    } else if (errObj.is('fwdowngradeToPtos.downgrade.mismatchmodel')) {
        return t('mismatchmodelErr');
    } else if (errObj.is('fwdowngradeToPtos.downgrade.invalidfirmwareimage')) {
        return t('invalidfirmwareimageErr');
    } else if (errObj.is('ui.uploadDifferentVerBin')) {
        return t('uploadDifferentVerBinErr');
    }
    return t('runtimeErr');
}

export function rebootErrorDeterminer(errorType, t) {
    if (errorType === 'badargument') {
        return t('badargument');
    } else if (errorType === 'unreachable.headnodeunreachable' || errorType === 'headnodeunreachable') {
        return t('headnodeunreachable');
    } else if (errorType === 'nodebusy.headnodebusy' || errorType === 'nodebusy') {
        return t('nodebusyheadnodebusy');
    } else if (errorType.includes('unreachable')) {
        return t('unreachableNode');
    } else if (errorType === 'stopprocess') {
        return t('stopProcessStatus');
    } else if (errorType === 'timelimitreached') {
        return t('timeLimitReachedContent');
    }
    return t('runtime');
}
