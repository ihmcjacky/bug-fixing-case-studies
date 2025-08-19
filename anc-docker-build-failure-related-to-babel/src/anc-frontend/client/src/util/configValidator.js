/**
 * @ Author: Kyle Suen
 * @ Create Time: 2020-03-16 12:15:16
 * @ Modified by: Kyle Suen
 * @ Modified time: 2021-03-18 15:15:32
 * @ Description:
 */

import {formValidator} from './inputValidator';
import i18n from '../I18n';


export const getOptionsFromGetConfigObj = (Config) => {
    let options = {};
    if (Config.meshSettings) {
        options.meshSettings = Object.keys(Config.meshSettings)
        .filter(key => key !== 'encType' && key !== 'rtscts' && key !== 'discrepancies')
    }
    if (Config.nodeSettings) {
        options.nodeSettings = {};
        Object.keys(Config.nodeSettings).forEach((nodeIp) => {
            options.nodeSettings[nodeIp] = Object.keys(Config.nodeSettings[nodeIp]).filter(key => key !== 'acl');
        });
    }
    if (Config.radioSettings) {
        options.radioSettings = {};

        Object.keys(Config.radioSettings).forEach((nodeIp) => {
            options.radioSettings[nodeIp] = {};
            Object.keys(Config.radioSettings[nodeIp]).forEach((radioName) => {
                options.radioSettings[nodeIp][radioName] = Object.keys(Config.radioSettings[nodeIp][radioName])
                    .filter(key => key !== 'acl');
            });
        });
    }
    if (Config.ethernetSettings) {
        options.ethernetSettings = {};

        Object.keys(Config.ethernetSettings).forEach((nodeIp) => {
            options.ethernetSettings[nodeIp] = {};
            Object.keys(Config.ethernetSettings[nodeIp]).forEach((ethName) => {
                options.ethernetSettings[nodeIp][ethName] = Object.keys(Config.ethernetSettings[nodeIp][ethName]);
            });
        });
    }
    if (Config.profileSettings) {
        options.profileSettings = {};

        Object.keys(Config.profileSettings).forEach((nodeIp) => {
            options.profileSettings[nodeIp] = {};
            Object.keys(Config.profileSettings[nodeIp]).forEach((profileOpt) => {
                options.profileSettings[nodeIp][profileOpt] = {};
                Object.keys(Config.profileSettings[nodeIp][profileOpt]).forEach((profileId) => {
                    options.profileSettings[nodeIp][profileOpt][profileId] =
                    Object.keys(Config.profileSettings[nodeIp][profileOpt][profileId]);
                });
            });
        });
    }
    return options;
}

const validateRegex = (inputValue, regex) => {
    const regexPattern = new RegExp(regex);
    const isValidObj = formValidator('matchRegex', inputValue, regexPattern);
    if (!isValidObj.result) {
        isValidObj.text = i18n.t('wrongRegex');
    }
    return isValidObj;
};

const validateEnum = (inputValue, enumArray) => {
    const isValidObj = {
        result: false,
        text: '',
    };
    isValidObj.result = enumArray.some((enumObj) => {
        if (enumObj.actualValue === inputValue.toString()) {
            return true;
        }
        return false;
    });
    if (!isValidObj.result) {
        isValidObj.text = i18n.t('wrongEnum');
    }
    return isValidObj;
};

// inputArray is filtered configuration, enumArray is actual node settings
const validateMultipleEnum = (inputArray, enumArray, opt, country='DB') => {
    const enumArrayValue = enumArray.map(enumObj => enumObj.actualValue);
    console.log(enumArray)
    console.log(inputArray)
    const isValidObj = {
        result: false,
        text: '',
    };

    if (enumArrayValue.length === 0) {
        return {
            result: true,
            text: '',
        };
    }

    if (!inputArray.every(selectedVal => enumArrayValue.includes(selectedVal))) {
        isValidObj.result = false; 
        if (opt === 'acsChannelList') {
            isValidObj.text = i18n.t('invalidACS');
        } else {
            isValidObj.text = i18n.t('wrongEnum');
        }
    } else {
        isValidObj.result = true;
    }

    return isValidObj;
}

const validateInt = (inputValue, int) => {
    const isValidObj = {
        result: false,
        text: '',
    };
    const {max, min} = int;
    isValidObj.result = inputValue <= max && inputValue >= min;
    if (!isValidObj.result) {
        isValidObj.text = i18n.t('wrongInt');
    }
    return isValidObj;
};

const validateMix = (inputValue, ruleSetArray) => {
    let isValidObj = {
        result: false,
        text: '',
    };

    isValidObj.result = !ruleSetArray.every((ruleSet) => {
        if (isValidObj.result) {
            return false;
        }
        switch (ruleSet.type) {
            case 'int':
                isValidObj = validateInt(inputValue, ruleSet.data);
                if (!isValidObj.result) {
                    isValidObj.text = i18n.t('wrongInt');
                }
                break;
            case 'enum':
                isValidObj = validateEnum(inputValue, ruleSet.data);
                if (!isValidObj.result) {
                    isValidObj.text = i18n.t('wrongEnum');
                }
                break;
            case 'regex':
                isValidObj = validateRegex(inputValue, ruleSet.data);
                if (!isValidObj.result) {
                    isValidObj.text = i18n.t('wrongRegex');
                }
                break;
            default:
        }
        return true;
    });
    return isValidObj;
};

const validateMeshSettings = (configMeshSettings, meshSettings) => {
    const invalidMeshSettings = {};
    if (Object.keys(meshSettings) !== 0) {
        Object.keys(meshSettings).forEach((opt) => {
            if (meshSettings[opt].type === 'invalid' || meshSettings[opt].type === 'notSupport') {
                if (meshSettings[opt]?.data === 'countryCode') {
                    invalidMeshSettings[opt] = meshSettings[opt]?.data;
                } else {
                    invalidMeshSettings[opt] = meshSettings[opt].type;
                }
            } else if (meshSettings[opt].type === 'regex') {
                const {result, text} = validateRegex(configMeshSettings[opt], meshSettings[opt].data);
                if (!result) {
                    invalidMeshSettings[opt] = text;
                }
            } else if (meshSettings[opt].type === 'enum') {
                const {result, text} = validateEnum(configMeshSettings[opt], meshSettings[opt].data);
                if (!result) {
                    invalidMeshSettings[opt] = text;
                }
            }
        });
    }

    return {
        isMeshFilterConfigValid: Object.keys(invalidMeshSettings).length === 0,
        invalidMeshSettings,
        meshExpand: Object.keys(invalidMeshSettings).length !== 0,
    };
};

const getValueFromNodeConfig = (configNodeSettings, configPathArr) => {
    try {
        return configPathArr.reduce((accumulator, key) => {
            return accumulator && accumulator[key] !== undefined ? accumulator[key] : undefined;
        }, configNodeSettings);
    } catch(e) {
        return null;
    }
}

const validateNodeSettings = (configNodeSettings, nodeSettings, nodeArr, getConfigValue) => {
    const invalidNodeSettings = {};
    const expanded = {};
    if (Object.keys(nodeSettings) !== 0) {
        nodeArr.forEach((nodeIp) => {
            invalidNodeSettings[nodeIp] = {};
            Object.keys(nodeSettings[nodeIp]).forEach((opt) => {
                if (
                    nodeSettings[nodeIp][opt].type === 'invalid' ||
                    nodeSettings[nodeIp][opt].type === 'notSupport'
                ) {
                    if (nodeSettings[nodeIp][opt]?.data === 'countryCode') {
                        invalidNodeSettings[nodeIp][opt] = nodeSettings[nodeIp][opt]?.data;
                    } else {
                        invalidNodeSettings[nodeIp][opt] = nodeSettings[nodeIp][opt].type;
                    }
                } else if (nodeSettings[nodeIp][opt].type === 'regex') {
                    const {result, text} = validateRegex(configNodeSettings[nodeIp][opt],
                        nodeSettings[nodeIp][opt].data);
                    if (!result) {
                        invalidNodeSettings[nodeIp][opt] = text;
                    }
                } else if (nodeSettings[nodeIp][opt].type === 'enum') {
                    if (opt !== 'acsChannelList') {
                        const { result, text } = validateEnum(configNodeSettings[nodeIp][opt].toString(),
                            nodeSettings[nodeIp][opt].data);
                        if (!result) {
                            invalidNodeSettings[nodeIp][opt] = text;
                        }
                    } else {
                        // for multiple selection validation, we pass config values directly as an array
                        const country = getValueFromNodeConfig(
                            getConfigValue, ['meshSettings', 'country']
                        );
                        const { result, text } = validateMultipleEnum(
                            configNodeSettings[nodeIp][opt],
                            nodeSettings[nodeIp][opt].data,
                            opt,
                            country
                        );

                        console.warn(result, text)

                        if (!result) {
                            invalidNodeSettings[nodeIp][opt] = text;
                        }
                    }
                }
            });
            
            if (Object.keys(invalidNodeSettings[nodeIp]).length === 0) {
                delete invalidNodeSettings[nodeIp];
            } else {
                expanded[nodeIp] = true;
            }
        });
    }

    return {
        isNodeFilterConfigValid: Object.keys(invalidNodeSettings).length === 0,
        invalidNodeSettings,
        nodeExpand: expanded,
    };
};

const validateRadioSettings = (configRadioSettings, radioSettings, nodeArr) => {
    const invalidRadioSettings = {};
    const expanded = {};
    if (Object.keys(radioSettings) !== 0) {
        nodeArr.forEach((nodeIp) => {
            invalidRadioSettings[nodeIp] = {};
            Object.keys(radioSettings[nodeIp]).forEach((radioName) => {
                invalidRadioSettings[nodeIp][radioName] = {};
                Object.keys(radioSettings[nodeIp][radioName]).forEach((opt) => {
                    if (
                        radioSettings[nodeIp][radioName][opt].type === 'invalid' ||
                        radioSettings[nodeIp][radioName][opt].type === 'notSupport'
                    ) {
                        if (radioSettings[nodeIp][radioName][opt]?.data === 'countryCode') {
                            invalidRadioSettings[nodeIp][radioName][opt] = radioSettings[nodeIp][radioName][opt]?.data;
                        } else {
                            invalidRadioSettings[nodeIp][radioName][opt] = radioSettings[nodeIp][radioName][opt].type;
                        }
                    } else if (radioSettings[nodeIp][radioName][opt].type === 'regex') {
                        const {result, text} = validateRegex(configRadioSettings[nodeIp][radioName][opt],
                            radioSettings[nodeIp][radioName][opt].data);
                        if (!result) {
                            invalidRadioSettings[nodeIp][radioName][opt] = text;
                        }
                    } else if (radioSettings[nodeIp][radioName][opt].type === 'enum') {
                        if (opt === 'maxNbr') {
                            console.warn("nodeIp:", nodeIp);
                            console.warn("configRadioSettings:", configRadioSettings[nodeIp][radioName][opt]);
                            console.warn("radioSettings:", radioSettings[nodeIp][radioName][opt])
                        }
                        const {result, text} = validateEnum(
                            configRadioSettings[nodeIp][radioName][opt].toString(),
                            radioSettings[nodeIp][radioName][opt].data);
                        if (!result) {
                            invalidRadioSettings[nodeIp][radioName][opt] = text;
                        }
                    } else if (radioSettings[nodeIp][radioName][opt].type === 'mixed') {
                        const {result, text} = validateMix(
                            configRadioSettings[nodeIp][radioName][opt],
                            radioSettings[nodeIp][radioName][opt].data);
                        if (!result) {
                            invalidRadioSettings[nodeIp][radioName][opt] = text;
                        }
                    }
                });
                if (Object.keys(invalidRadioSettings[nodeIp][radioName]).length === 0) {
                    delete invalidRadioSettings[nodeIp][radioName];
                }
            });
            if (Object.keys(invalidRadioSettings[nodeIp]).length === 0) {
                delete invalidRadioSettings[nodeIp];
            } else {
                expanded[nodeIp] = true;
            }
        });
    }

    return {
        isRadioFilterConfigValid: Object.keys(invalidRadioSettings).length === 0,
        invalidRadioSettings,
        radioExpand: expanded,
    };
};

const validateEthernetSettings = (configEthernetSettings, ethernetSettings, nodeArr) => {
    const invalidEthernetSettings = {};
    const expanded = {};
    if (Object.keys(ethernetSettings) !== 0) {
        nodeArr.forEach((nodeIp) => {
            invalidEthernetSettings[nodeIp] = {};
            Object.keys(ethernetSettings[nodeIp]).forEach((ethName) => {
                invalidEthernetSettings[nodeIp][ethName] = {};
                Object.keys(ethernetSettings[nodeIp][ethName]).forEach((opt) => {
                    if (
                        ethernetSettings[nodeIp][ethName][opt].type === 'invalid' ||
                        ethernetSettings[nodeIp][ethName][opt].type === 'notSupport'
                    ) {
                        if (ethernetSettings[nodeIp][ethName][opt]?.data === 'countryCode') {
                            invalidEthernetSettings[nodeIp][ethName][opt] =
                                ethernetSettings[nodeIp][ethName][opt]?.data;
                        } else {
                            invalidEthernetSettings[nodeIp][ethName][opt] =
                                ethernetSettings[nodeIp][ethName][opt].type;
                        }
                    } else if (ethernetSettings[nodeIp][ethName][opt].type === 'regex') {
                        const {result, text} = validateRegex(configEthernetSettings[nodeIp][ethName][opt],
                            ethernetSettings[nodeIp][ethName][opt].data);
                        if (!result) {
                            invalidEthernetSettings[nodeIp][ethName][opt] = text;
                        }
                    } else if (ethernetSettings[nodeIp][ethName][opt].type === 'enum') {
                        const {result, text} = validateEnum(
                            configEthernetSettings[nodeIp][ethName][opt].toString(),
                            ethernetSettings[nodeIp][ethName][opt].data);
                        if (!result) {
                            invalidEthernetSettings[nodeIp][ethName][opt] = text;
                        }
                    } else if (ethernetSettings[nodeIp][ethName][opt].type === 'int') {
                        const {result, text} = validateInt(
                            configEthernetSettings[nodeIp][ethName][opt],
                            ethernetSettings[nodeIp][ethName][opt].data);
                        if (!result) {
                            invalidEthernetSettings[nodeIp][ethName][opt] = text;
                        }
                    }
                });
                if (Object.keys(invalidEthernetSettings[nodeIp][ethName]).length === 0) {
                    delete invalidEthernetSettings[nodeIp][ethName];
                }
            });
            if (Object.keys(invalidEthernetSettings[nodeIp]).length === 0) {
                delete invalidEthernetSettings[nodeIp];
            } else {
                expanded[nodeIp] = true;
            }
        });
    }

    return {
        isEthernetFilterConfigValid: Object.keys(invalidEthernetSettings).length === 0,
        invalidEthernetSettings,
        ethernetExpand: expanded,
    };
};

const validateProfileSettings = (configProfileSettings, profileSettings, nodeArr) => {
    const invalidProfileSettings = {};
    const expanded = {};
    if (Object.keys(profileSettings) !== 0) {
        nodeArr.forEach((nodeIp) => {
            invalidProfileSettings[nodeIp] = {};
            Object.keys(profileSettings[nodeIp]).forEach((profileOpt) => {
                invalidProfileSettings[nodeIp][profileOpt] = {};
                Object.keys(profileSettings[nodeIp][profileOpt]).forEach((profileId) => {
                    invalidProfileSettings[nodeIp][profileOpt][profileId] = {};
                    Object.keys(profileSettings[nodeIp][profileOpt][profileId]).forEach((opt) => {
                        if (
                            profileSettings[nodeIp][profileOpt][profileId][opt].type === 'invalid' ||
                            profileSettings[nodeIp][profileOpt][profileId][opt].type === 'notSupport'
                        ) {
                            if (profileSettings[nodeIp][profileOpt][profileId][opt]?.data === 'countryCode'){
                                invalidProfileSettings[nodeIp][profileOpt][profileId][opt] =
                                    profileSettings[nodeIp][profileOpt][profileId][opt]?.data;
                            } else {
                                invalidProfileSettings[nodeIp][profileOpt][profileId][opt] =
                                    profileSettings[nodeIp][profileOpt][profileId][opt].type;
                            }
                            invalidProfileSettings[nodeIp][profileOpt][profileId][opt] =
                                profileSettings[nodeIp][profileOpt][profileId][opt].type;
                        } else if (profileSettings[nodeIp][profileOpt][profileId][opt].type === 'regex') {
                            const {result, text} = validateRegex(configProfileSettings[nodeIp][profileOpt][profileId][opt],
                                profileSettings[nodeIp][profileOpt][profileId][opt].data);
                            if (!result) {
                                invalidProfileSettings[nodeIp][profileOpt][profileId][opt] = text;
                            }
                        } else if (profileSettings[nodeIp][profileOpt][profileId][opt].type === 'enum') {
                            const {result, text} = validateEnum(
                                configProfileSettings[nodeIp][profileOpt][profileId][opt].toString(),
                                profileSettings[nodeIp][profileOpt][profileId][opt].data);
                            if (!result) {
                                invalidProfileSettings[nodeIp][profileOpt][profileId][opt] = text;
                            }
                        } else if (profileSettings[nodeIp][profileOpt][profileId][opt].type === 'int') {
                            const {result, text} = validateInt(
                                configProfileSettings[nodeIp][profileOpt][profileId][opt],
                                profileSettings[nodeIp][profileOpt][profileId][opt].data);
                            if (!result) {
                                invalidProfileSettings[nodeIp][profileOpt][profileId][opt] = text;
                            }
                        }
                    });
                    if (Object.keys(invalidProfileSettings[nodeIp][profileOpt][profileId]).length === 0) {
                        delete invalidProfileSettings[nodeIp][profileOpt][profileId];
                    }
                });
                if (Object.keys(invalidProfileSettings[nodeIp][profileOpt]).length === 0) {
                    delete invalidProfileSettings[nodeIp][profileOpt];
                }
            });
            if (Object.keys(invalidProfileSettings[nodeIp]).length === 0) {
                delete invalidProfileSettings[nodeIp];
            } else {
                expanded[nodeIp] = true;
            }
        });
    }

    return {
        isProfileFilterConfigValid: Object.keys(invalidProfileSettings).length === 0,
        invalidProfileSettings,
        profileExpand: expanded,
    };
};

/**
 * Validates various configurations including mesh, radio, node, ethernet, and profile settings.
 *
 * @param {Object} invalidFilterConfig - An object containing the default configuration. Used for returning invalid configuration details if any.
 * @param {Object} Object - An object that contains meshSettings, radioSettings, nodeSettings, ethernetSettings, profileSettings.
 * @param {Object} getConfigValue - An object that contains methods to validate the above settings.
 * @param {Array} nodeArr - An array that is passed to the settings validation functions.
 *
 * @returns {Object} Returns an object with a 'success' property indicating if all configurations are valid. 
 * If not, it also includes 'invalidFilterConfigRes' property with details of the invalid configurations and the settings to be expanded.
 */
const checkConfigValue = (
    invalidFilterConfig = {
            expanded: {
            node: {},
        }
    },
    {
        meshSettings, radioSettings, nodeSettings, ethernetSettings, profileSettings,
    },
    getConfigValue,
    nodeArr
) => {
    const {isMeshFilterConfigValid, invalidMeshSettings, meshExpand} =
        validateMeshSettings(
            getConfigValue.meshSettings, meshSettings);
    const {isRadioFilterConfigValid, invalidRadioSettings, radioExpand} =
        validateRadioSettings(
            getConfigValue.radioSettings, radioSettings, nodeArr);
    const {isNodeFilterConfigValid, invalidNodeSettings, nodeExpand} =
        validateNodeSettings(
            getConfigValue.nodeSettings, nodeSettings, nodeArr, getConfigValue);
    const {isEthernetFilterConfigValid, invalidEthernetSettings, ethernetExpand} =
        validateEthernetSettings(
            getConfigValue.ethernetSettings, ethernetSettings, nodeArr);
    const {isProfileFilterConfigValid, invalidProfileSettings, profileExpand} =
        validateProfileSettings(
            getConfigValue.profileSettings, profileSettings, nodeArr);

    if (isMeshFilterConfigValid &&
        isRadioFilterConfigValid &&
        isNodeFilterConfigValid &&
        isEthernetFilterConfigValid &&
        isProfileFilterConfigValid) {

        return {
            success: true,
            invalidFilterConfigRes: null,
        };
    }
    
    return {
        success: false,
        invalidFilterConfigRes: {
            ...invalidFilterConfig,
            ...(!isMeshFilterConfigValid && {meshSettings: invalidMeshSettings}),
            ...(!isRadioFilterConfigValid && {radioSettings: invalidRadioSettings}),
            ...(!isNodeFilterConfigValid && {nodeSettings: invalidNodeSettings}),
            ...(!isEthernetFilterConfigValid && {ethernetSettings: invalidEthernetSettings}),
            ...(!isProfileFilterConfigValid && {profileSettings: invalidProfileSettings}),
            expanded: {
                ...invalidFilterConfig.expanded,
                node: {
                    ...invalidFilterConfig.expanded.node,
                    ...radioExpand,
                    ...nodeExpand,
                    ...ethernetExpand,
                    ...profileExpand,
                },
                meshSettings: meshExpand,
            },
        },
    };
};

export default checkConfigValue;
