

export const locationCountryCodeChecking = (location, countryCode) => {
    // if (location) {
    //     return false;
    // }
    if ((location === 'US') &&
        !(countryCode === 'US' || countryCode === 'DB')) {
        return false;
    }
    return true;
};

export function checkFwVersion(fwVersion) {
    const regex = /.0$/;
    if (regex.test(fwVersion)) {
        return fwVersion.replace(regex, '');
    }
    return fwVersion;
}

export function iff(condition, successCase, failureCase) {
    return condition ? successCase : failureCase;
}

// function to load the image with url and return Image object
export async function loadImage(url) {
    return new Promise((resolve, reject) => {
        const temp = new Image();
        temp.onload = () => {
            resolve(temp);
        };
        temp.onerror = (err) => {
            console.log(err);
            reject('loadImageFail');
        };
        temp.src = url;
    });
}

export function sortByNum(numA, numB, sortOrder) {
    let returnNum;
    if (typeof numA === 'string' && typeof numB === 'string') {
        if (numA === numB) returnNum = 0;
        else if (numA === '-') returnNum = -1;
        else returnNum = 1;
    } else if (typeof numA === 'string') {
        returnNum = 1;
    } else if (typeof numB === 'string') {
        returnNum = -1;
    } else returnNum = (numB - numA);
    if (sortOrder === 'desc') returnNum *= -1;
    return returnNum;
}

export function sortByString(stringA, stringB, sortOrder) {
    let returnNum;
    if (stringA === stringB) returnNum = 0;
    else if (stringA > stringB) returnNum = 1;
    else returnNum = -1;
    if (sortOrder === 'desc') returnNum *= -1;
    return returnNum;
}

export function sortByType(typeA, typeB, sortOrder) {
    let returnNum;
    if (typeA === typeB) returnNum = 0;
    if (typeA === 'radio') returnNum = 1;
    else returnNum = -1;
    if (sortOrder === 'desc') returnNum *= -1;
    return returnNum;
}

// compare two rssi level and returen the lowest
export function rssiLevelCompare(lvA, lvB) {
    if (lvA === '') return parseInt(lvB.replace(' dBm', ''), 10);
    else if (lvB === '') return parseInt(lvA.replace(' dBm', ''), 10);

    const nodeALevel = parseInt(lvA.replace(' dBm', ''), 10);
    const nodeBLevel = parseInt(lvB.replace(' dBm', ''), 10);
    if (nodeALevel < nodeBLevel) return nodeALevel;
    return nodeBLevel;
}

export function is49GHz(frequency) {
    if (typeof frequency === 'number') {
        return (parseInt(frequency / 100, 10) === 49);
    } else if (typeof frequency === 'string') {
        if (frequency === '') return false;
        return (parseInt(frequency.replace('MHz', '') / 100, 10)) === 49;
    }
    return false;
}

export function getOptionsFromGetConfigObj(Config) {
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

export const wrapper = promise => (
    promise
        .then(data => ({data, error: null}))
        .catch(error => ({error, data: null}))
);

export const isObjectEmpty = obj => obj && Object.keys(obj).length === 0 && obj.constructor === Object;
export const isEmpty = o => Object.keys(o).length === 0;
export const isObject = o => o != null && typeof o === 'object';

export const calDiff = (original, updated) => {
    if (original === updated) return {};

    if (!isObject(original) || !isObject(updated)) return updated;

    return Object.keys(updated).reduce((acc, key) => {
        if (original.hasOwnProperty(key)) {
            const diff = calDiff(original[key], updated[key]);
            if (isObject(diff) && isEmpty(diff)) return acc;
            return { ...acc, [key]: diff };
        }
        return acc;
    }, {});
};

export function validateAtpcRange(atpcTargetRssi, atpcRangeUpper, atpcRangeLower) {
    if (atpcTargetRssi <= atpcRangeUpper && atpcTargetRssi >= atpcRangeLower) {
        return {result: true, text: ''};
    }
    return {result: false, text: 'This field contains invalid value.'};
}