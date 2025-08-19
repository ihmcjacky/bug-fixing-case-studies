/**
 * @ Author: Kyle Suen
 * @ Create Time: 2019-07-23 11:57:22
 * @ Modified by: Kyle Suen
 * @ Modified time: 2020-11-11 14:25:22
 * @ Description:
 */

import Constants from './dashboardConstants';
import {getConfig, getCachedConfig, getFilteredConfigOptions} from '../../util/apiCall';

const get = (o, p) =>
    p.reduce(
        (xs, x) =>
            ((xs && xs[x]) ?
                xs[x] : null), o);

export const updateStatusKey = data => dispatch =>
    dispatch({
        type: Constants.DASHBOARD_UPDATE_STATUS_KEY,
        data,
    });

export const updateSearchKey = data => dispatch =>
    dispatch({
        type: Constants.DASHBOARD_UPDATE_SEARCH_KEY,
        data,
    });

export const toggleSearch = (reset = false) => (dispatch, getState) => {
    const {dashboard: {nodeInformation: {enableSearch}}} = getState();
    dispatch({
        type: Constants.DASHBOARD_TOGGLE_SEARCH,
        data: !reset && !enableSearch,
    });
};
export function getClusterInformation(radioSettings = {}, nodeIp = '') {
    // eslint-disable-next-line no-debugger
    return function (dispatch, getState) {
        const {
            common: {csrf},
            projectManagement: {projectId},
        } = getState();

        const bodyMsg = nodeIp ? {nodes: [nodeIp]} : {allNodes: true};

        return getCachedConfig(csrf, projectId, bodyMsg).then((config) => {
            console.log(config)
            const {checksums, ...sourceConfig} = config;
            const bodyMsg2 = !radioSettings ?
                {
                    options: {
                        meshSettings: ['country'],
                    },
                    sourceConfig,
                } :
                {
                    options: {
                        meshSettings: ['country'],
                        radioSettings,
                    },
                    sourceConfig,
                };
            return getFilteredConfigOptions(csrf, projectId, bodyMsg2)
                .then((data) => {
                    let countryObj = {};
                    let hasCountryDiscrepancies = '';
                    if (!nodeIp) {
                        countryObj = data.meshSettings.country.data.filter(c =>
                            c.actualValue === config.meshSettings.country);
                    } else if (get(config, ['meshSettings', 'discrepancies', nodeIp, 'country'])) {
                        countryObj = data.meshSettings.country.data.filter(c =>
                            c.actualValue === config.meshSettings.discrepancies[nodeIp].country.value);
                        hasCountryDiscrepancies = nodeIp;
                    } else {
                        countryObj = data.meshSettings.country.data.filter(c =>
                            c.actualValue === config.meshSettings.country);
                    }

                    const clusterInformation = {
                        config: config.meshSettings,
                        country: {
                            actualValue: countryObj[0].actualValue.toLowerCase(),
                            displayValue: countryObj[0].displayValue,
                        },
                        radioSettings: {
                            actualValue: config.radioSettings,
                            displayValue: data.radioSettings,
                        },
                        hasCountryDiscrepancies,
                        getConfigFwversionFail: false,
                    };

                    dispatch({
                        type: Constants.DASHBOARD_GET_CLUSTER_INFORMATION,
                        data: clusterInformation,
                    });
                    return {config, options: data, type: 'success'};
                }).catch((getFilteredConfigErr) => {
                    let errorType = '';
                    try {
                        if (typeof getFilteredConfigErr.data !== 'undefined' &&
                            getFilteredConfigErr.data.type === 'specific') {
                            const {errors} = getFilteredConfigErr.data.data.meshSettings;
                            if (errors) {
                                errors.forEach((errObj) => {
                                    if (errObj.type === 'partialretrieve') {
                                        errorType = 'partialretrieve';
                                        let countryObj = {};
                                        let hasCountryDiscrepancies = '';
                                        if (!nodeIp) {
                                            countryObj = errObj.data.country.data.filter(c =>
                                                c.actualValue === config.meshSettings.country);
                                        } else if (get(config, ['meshSettings', 'discrepancies', nodeIp, 'country'])) {
                                            countryObj = errObj.data.country.data.filter(c =>
                                                c.actualValue ===
                                                config.meshSettings.discrepancies[nodeIp].country.value);
                                            hasCountryDiscrepancies = nodeIp;
                                        } else {
                                            countryObj = errObj.data.country.data.filter(c =>
                                                c.actualValue === config.meshSettings.country);
                                        }
                                        let radioSettingsObj = {
                                            actualValue: {},
                                            displayValue: {},
                                        };
                                        if (getFilteredConfigErr.data.data.radioSettings.success) {
                                            radioSettingsObj = {
                                                actualValue: config.radioSettings,
                                                displayValue: getFilteredConfigErr.data.data.radioSettings.data,
                                            };
                                        }
                                        const clusterInformation = {
                                            config: {
                                                ...getState().dashboard.clusterInformation.config,
                                                ...config.meshSettings,
                                            },
                                            radioSettings: radioSettingsObj,
                                            country: {
                                                ...getState().dashboard.clusterInformation.country,
                                                actualValue: countryObj[0].actualValue.toLowerCase(),
                                                displayValue: countryObj[0].displayValue,
                                            },
                                            hasCountryDiscrepancies,
                                            getConfigFwversionFail: false,
                                        };
                                        dispatch({
                                            type: Constants.DASHBOARD_GET_CLUSTER_INFORMATION,
                                            data: clusterInformation,
                                        });
                                    }
                                });
                            }
                        }
                    } catch (e) {
                        console.log('Cluster manager timeout!');
                    }
                    return {config, options: getFilteredConfigErr.data.data, type: errorType};
                });
        }).catch((e) => {
            console.log('Failed to get cluster information: ', e)
            try {
                let meshSettingsPayload = {};
                let getConfigFwversionFail = false;

                if (e.data && e.data.type === 'specific') {
                    if (!e.data.data.meshSettings.success) {
                        e.data.data.meshSettings.errors.forEach((obj) => {
                            if (obj.type === 'getconfig_fwversion_fail') {
                                meshSettingsPayload = obj.data;
                                getConfigFwversionFail = true;
                            }
                        });
                    } else {
                        meshSettingsPayload = e.data.data.meshSettings.data;
                    }
                }

                const bodyMsg2 = {
                    options: {
                        meshSettings: ['country'],
                    },
                    sourceConfig: {
                        ethernetSettings: e.data.data.ethernetSettings,
                        meshSettings: meshSettingsPayload,
                        nodeSettings: e.data.data.nodeSettings,
                        radioSettings: e.data.data.radioSettings,
                    },
                };
                getFilteredConfigOptions(csrf, projectId, bodyMsg2).then((data) => {
                    try {
                        let countryObj = {};
                        let hasCountryDiscrepancies = '';
                        if (!nodeIp) {
                            countryObj = data.meshSettings.country.data.filter(c =>
                                c.actualValue === meshSettingsPayload.country);
                        } else if (get(meshSettingsPayload, ['discrepancies', nodeIp, 'country'])) {
                            countryObj = data.meshSettings.country.data.filter(c =>
                                c.actualValue === meshSettingsPayload.discrepancies[nodeIp].country.value);
                            hasCountryDiscrepancies = nodeIp;
                        } else {
                            countryObj = data.meshSettings.country.data.filter(c =>
                                c.actualValue === meshSettingsPayload.country);
                        }
                        const clusterInformation = {
                            config: {
                                ...getState().dashboard.clusterInformation.config,
                                ...meshSettingsPayload,
                            },
                            country: {
                                ...getState().dashboard.clusterInformation.country,
                                actualValue: countryObj[0].actualValue.toLowerCase(),
                                displayValue: countryObj[0].displayValue,
                            },
                            hasCountryDiscrepancies,
                            getConfigFwversionFail,
                        };
                        dispatch({
                            type: Constants.DASHBOARD_GET_CLUSTER_INFORMATION,
                            data: clusterInformation,
                        });
                    } catch (error) {
                        console.log('clusterInfoErr obj: ', error);
                    }
                }).catch((getFilterConfigErr) => {
                    if (typeof getFilterConfigErr.data !== 'undefined' &&
                        getFilterConfigErr.data.type === 'specific') {
                        const {errors} = getFilterConfigErr.data.data.meshSettings;
                        if (errors) {
                            errors.forEach((errObj) => {
                                if (errObj.type === 'partialretrieve') {
                                    let countryObj = {};
                                    let hasCountryDiscrepancies = '';
                                    if (!nodeIp) {
                                        countryObj = errObj.data.country.data.filter(c =>
                                            c.actualValue === meshSettingsPayload.country);
                                    } else if (get(meshSettingsPayload, ['discrepancies', nodeIp, 'country'])) {
                                        countryObj = errObj.data.country.data.filter(c =>
                                            c.actualValue === meshSettingsPayload.discrepancies[nodeIp].country.value);
                                        hasCountryDiscrepancies = nodeIp;
                                    } else {
                                        countryObj = errObj.data.country.data.filter(c =>
                                            c.actualValue === meshSettingsPayload.country);
                                    }
                                    const clusterInformation = {
                                        config: {
                                            ...getState().dashboard.clusterInformation.config,
                                            ...meshSettingsPayload,
                                        },
                                        country: {
                                            ...getState().dashboard.clusterInformation.country,
                                            actualValue: countryObj[0].actualValue.toLowerCase(),
                                            displayValue: countryObj[0].displayValue,
                                        },
                                        hasCountryDiscrepancies,
                                        getConfigFwversionFail,
                                    };
                                    dispatch({
                                        type: Constants.DASHBOARD_GET_CLUSTER_INFORMATION,
                                        data: clusterInformation,
                                    });
                                }
                            });
                        }
                    }
                });
            } catch (er) {
                console.log('Cluster manager timeout!');
            }
        });
    };
}

export const setClusterInformation = data => (dispatch, getState) => {
    const originalClusterInformation = getState().dashboard.clusterInformation;
    dispatch({
        type: Constants.DASHBOARD_SET_CLUSTER_INFORMATION,
        data: {
            ...originalClusterInformation,
            config: {
                ...originalClusterInformation.config,
                country: data.country,
            },
            country: {
                ...originalClusterInformation.country,
                actualValue: data.actualValue,
                displayValue: data.displayValue,
            },
            getConfigFwversionFail: false,
        },
    });
};

export const resetClusterInformation = () => (dispatch) => {
    const clusterInformation = {
        config: {
            clusterId: '-',
            managementIp: '-',
        },
        country: {
            actualValue: '',
            displayValue: '-',
        },
        hasCountryDiscrepancies: '',
        getConfigFwversionFail: false,
    };
    dispatch({
        type: Constants.DASHBOARD_GET_CLUSTER_INFORMATION,
        data: clusterInformation,
    });
};

export function setRssiFliter(target, data) {
    return {
        type: Constants.DASHBOARD_SET_RSSI_FLITER,
        target,
        data,
    };
}

export function setTempNodeConfig(data) {
    return function (dispatch, getState) {
        const tempNodeConfig = {
            ...getState().dashboard.tempNodeConfig,
            ...data,
        };
        dispatch({
            type: Constants.DASHBOARD_SET_TEMP_NODE_CONFIG,
            data: tempNodeConfig,
        });
    };
}

