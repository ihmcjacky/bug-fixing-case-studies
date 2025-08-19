import Cookies from 'js-cookie';
import {
    getConfig,
    getFilteredConfigOptions,
} from '../../util/apiCall';

export const searchDisplayValue = (actualValue, displayEnum) => {
    const target = displayEnum.data.find(obj => obj.actualValue === actualValue);
    if (target) return target.displayValue;
    return '-';
};

// const displayKeys = ['band', 'centralFreq', 'channelBandwidth', 'txpower'];

export async function getNodeRecoveryFilteredConfig(csrf, body, ip) {
    const projectId = Cookies.get('projectId');
    return getFilteredConfigOptions(csrf, projectId, body).then((filteredConfig) => {
        const radioSettings = {
            actualValue: body.sourceConfig.radioSettings[ip],
            displayValue: filteredConfig.radioSettings[ip],
        };
        return {
            success: true,
            data: {
                ...radioSettings,
                encKeyRegex: filteredConfig.meshSettings.encKey.data,
            },
        };
    }).catch((e) => {
        if ((e.data && e.data.type === 'specific' && e.data.data.meshSettings.success) ||
            (e.data && e.data.type === 'specific' && e.data.data.meshSettings?.errors[0]?.data?.encKey?.data)) {
            const radioSettings = {
                actualValue: body.sourceConfig.radioSettings[ip],
                displayValue: e.data.data.radioSettings.data[ip],
            };
            return {
                success: true,
                data: {
                    ...radioSettings,
                    encKeyRegex: e.data.data.meshSettings?.errors[0]?.data?.encKey?.data,
                },
            };
        }
        return e;
    });
}

export async function getNodeRecoveryConfig(csrf, radioSettings, body, ip) {
    return new Promise((resolve, reject) => {
        const projectId = Cookies.get('projectId');
        getConfig(csrf, projectId, body).then(async (config) => {
            const {checksums, ...sourceConfig} = config;
            const getFilteredConfigBodyMsg = {
                options: {
                    meshSettings: ['encKey'],
                    radioSettings,
                },
                sourceConfig,
            };
            getNodeRecoveryFilteredConfig(csrf, getFilteredConfigBodyMsg, ip).then((res) => {
                if (res.success) {
                    resolve({
                        ...res.data,
                        config,
                    });
                } else {
                    reject();
                }
            });
        }).catch(async (e) => {
            if (e.data && e.data.type === 'specific' && e.data.data.radioSettings.success && e.data.data.meshSettings.success) {
                const getFilteredConfigBodyMsg = {
                    sourceConfig: {
                        ethernetSettings: {},
                        meshSettings: e.data.data.meshSettings.data,
                        nodeSettings: {},
                        radioSettings: e.data.data.radioSettings.data,
                    },
                };
                getNodeRecoveryFilteredConfig(csrf, getFilteredConfigBodyMsg, ip).then((res) => {
                    if (res.success) {
                        resolve({
                            ...res.data,
                            config: e.data.data,
                        });
                    } else {
                        reject(e);
                    }
                });
            } else {
                reject(e);
            }
        });
    });
}

export const scanNearbyNeiErrHandler = (err, t) => {
    const titleStringObj = t('scanNearbyErrorTitle', {returnObjects: true});
    const contentStringObj = t('scanNearbyErrorContent', {returnObjects: true});
    let title = titleStringObj.unexpected;
    let content = contentStringObj.unexpected;

    if (err.data && err.data.type === 'errors') {
        const error = err.data.data[0];
        content = contentStringObj[error.type] || error.type;
    }
    return {
        title,
        content,
    };
}

/**
 * if isExtend error, methold will return nodeRecoveryExtendErrorTitle and nodeRecoveryExtendErrorContent
 * otherwise, return nodeRecoveryErrorTitle and nodeRecoveryErrorContent
 * @param {*} err error object
 * @param {*} t t function
 * @param {*} isExtend is handle extend timeout error
 * @returns object contains title and content
 */
export const nodeRecoveryErrHandler = (err, t, isExtend = false) => {
    const strKey = isExtend ? 'nodeRecoveryExtend' : 'nodeRecovery';
    const titleStringObj = t(`${strKey}ErrorTitle`, {returnObjects: true});
    const contentStringObj = t(`${strKey}ErrorContent`, {returnObjects: true});
    let title = titleStringObj.unexpected;
    let content = contentStringObj.unexpected;

    if (err?.data && err.data.type === 'errors') {
        const error = err.data.data[0];
        content = contentStringObj[error.type] || error.type;
    }
    return {
        title,
        content,
    };
}
