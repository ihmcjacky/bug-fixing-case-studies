import Cookies from 'js-cookie';
import {
    getConfig,
    getFilteredConfigOptions,
} from '../../util/apiCall';
import Constant from '../../constants/common';

export const searchDisplayValue = (actualValue, displayEnum) => {
    const target = displayEnum.data.find(obj => obj.actualValue === actualValue);
    if (target) return target.displayValue;
    return '-';
};

// const displayKeys = ['band', 'centralFreq', 'channelBandwidth', 'txpower'];

export async function getSpectrumScanFilteredConfig(csrf, body, ip) {
    const projectId = Cookies.get('projectId');
    return getFilteredConfigOptions(csrf, projectId, body).then((filteredConfig) => {
        const radioSettings = {
            actualValue: body.sourceConfig.radioSettings[ip],
            displayValue: filteredConfig.radioSettings[ip],
        };
        return {
            success: true,
            data: radioSettings,
        };
    }).catch((e) => {
        if (e.data && e.data.type === 'specific' && e.data.data.radioSettings.success) {
            const radioSettings = {
                actualValue: body.sourceConfig.radioSettings[ip],
                displayValue: e.data.data.radioSettings.data[ip],
            };
            return {
                success: true,
                data: radioSettings,
            };
        }
        return e;
    });
}

export async function getSpectrumScanConfig(csrf, radioSettings, body, ip) {
    return new Promise((resolve, reject) => {
        const projectId = Cookies.get('projectId');
        getConfig(csrf, projectId, body).then((config) => {
            const {checksums, ...sourceConfig} = config;
            const getFilteredConfigBodyMsg = {
                options: {
                    meshSettings: ['country'],
                    radioSettings,
                },
                sourceConfig,
            };
            getSpectrumScanFilteredConfig(csrf, getFilteredConfigBodyMsg, ip).then((res) => {
                if (res.success) {
                    resolve({
                        ...res.data,
                        config,
                    });
                } else {
                    reject();
                }
            });
        }).catch((e) => {
            if (e.data && e.data.type === 'specific' && e.data.data.radioSettings.success) {
                const getFilteredConfigBodyMsg = {
                    options: {
                        meshSettings: ['country'],
                    },
                    sourceConfig: {
                        ethernetSettings: {},
                        meshSettings: {},
                        nodeSettings: {},
                        radioSettings: e.data.data.radioSettings.data,
                    },
                };
                getSpectrumScanFilteredConfig(csrf, getFilteredConfigBodyMsg, ip).then((res) => {
                    if (res.success) {
                        resolve({
                            ...res.data,
                            config: e.data.data,
                        });
                    } else {
                        reject();
                    }
                });
            } else {
                reject();
            }
        });
    });
}

export const getErrorDialogContent = (errObj, t) => {
    const {type, message} = errObj;
    if (type === 'headnodeunreachable' || type === 'unreachable' ||
        type === 'unreachable.headnodeunreachable') {
        return t('nodeunreachableErr');
    } else if (type === 'nodebusy' || type === 'headnodebusy' ||
        type === 'spectrumscan.devicebusy' || type === 'nodebusy.headnodebusy') {
        return t('nodebusyErr');
    } else if (type === 'spectrumscan.scanninginprogress') {
        return t('scanningInProgress');
    } else if (type === 'timelimitreached') {
        return t('timelimitreachedErr');
    } else if (type === 'runtime' && message === 'Radio is disabled!') {
        return t('radioIsDisabled');
    } else if (type === 'runtime') {
        return t('runtimeErr');
    } else if (type === 'analysisspectrum.filename') {
        return t('analysisFilenameErr');
    } else if (type === 'analysisspectrum.filestructure') {
        return t('analysisFileStructureErr');
    } else if (type === 'analysisspectrum.imagetype') {
        return t('analysisImagetypeErr');
    } else if (type === 'analysisspectrum.filetype') {
        return t('analysisFiletypeErr');
    } else if (type === 'analysisspectrum.datastructure') {
        return t('analysisDataStructureErr');
    } else if (type === 'spectrumscan.radiodisabled') {
        return t('analysisRadiodisabledErr');
    }
    return t('unexpectedErr');
};


export const getChannelFromFreq = (freq) => {
    const channelBounds = Constant.channelBounds;
    for (var i = 0; i < channelBounds.length; i++) {
        if (freq >= channelBounds[i].start && freq <= channelBounds[i].end) {
            return channelBounds[i].channel;
        }
    }
    return null;  // Return null if no channel found for the given frequency
}