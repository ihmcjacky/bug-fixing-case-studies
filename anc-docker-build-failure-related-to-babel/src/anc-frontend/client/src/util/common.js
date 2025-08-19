/**
 * @ Author: Kyle Suen
 * @ Create Time: 2019-09-06 11:56:01
 * @ Modified by: Kyle Suen
 * @ Modified time: 2020-08-25 16:47:01
 * @ Description:
 */

import CommonConstants from '../constants/common';
import store from '../redux/store';
import cookies from 'js-cookie'

export function get(p, o) {
    return (p.reduce(
        (xs, x) => ((xs && xs[x]) ? xs[x] : null), o)
    );
}

/**
 * Deep diff between two object, using underscore
 * @param  {Object} object Object compared
 * @param  {Object} base   Object to compare with
 * @return {Object}        Return a new object who represent the diff
 */
export const difference = (object, base) => {
    const changes = (object1, base1) => (
        window.__.pick(
            window.__.mapObject(object1, (value, key) => (
                // eslint-disable-next-line no-nested-ternary
                (!window.__.isEqual(value, base1[key])) ?
                    ((window.__.isObject(value) && window.__.isObject(base1[key])) ? changes(value, base1[key]) : value) :
                    null
            )),
            value => (value !== null)
        )
    );
    return changes(object, base);
};

export const wrapper = promise => (
    promise
        .then(data => ({data, error: null}))
        .catch(error => ({error, data: null}))
);

export function seriesDeterminer(model) {
    if (!model) {
        return false;
    }
    if (/^AX5*/g.test(model)) {
        return 'ax50';
    } else if (/^[X][3]/g.test(model)) {
        return 'x30';
    } else if (/^[X][2]/g.test(model)) {
        return 'x20';
    } else if (/^[X][1]/g.test(model)) {
        return 'x10';
    } else if (/^[Z][5][0][0]/g.test(model)) {
        return 'z500';
    }

    return false;
}

export function isFwSupport(fwVersion, anmVersion) {
    const fwVerArr = fwVersion.replace('v', '').split('.').map(i => parseInt(i, 10));
    const anmVerArr = anmVersion.replace('v', '').split('.').map(i => parseInt(i, 10));

    if (fwVerArr[0] <= anmVerArr[0] && fwVerArr[1] <= anmVerArr[1]) return true;
    return false;
    // return fwVersionRegexp.test(fwVersion);
}

// check firmware version equals until first d.p
export function isFwLTE(fwVersion, checkVersion) {
    const fwVerArr = fwVersion.replace('v', '').split('.').map(i => parseInt(i, 10));
    const checkVerArr = checkVersion.replace('v', '').split('.').map(i => parseInt(i, 10));
    // no need to check 2nd d.p. if first d.p is already newer than the required version limit
    if (fwVerArr[0] > checkVerArr[0]) return true;
    if (fwVerArr[0] >= checkVerArr[0] && fwVerArr[1] >= checkVerArr[1]) return true;
    return false;
    // return fwVersionRegexp.test(fwVersion);
}

/**
 * Check whether the node's firmware version is newer than or equal to the
 * feature supported version
 */
export function checkFwLTEDetail(fwVersion, featureSupportedVersion) {
    if (!fwVersion) {
        return false;
    }

    const fwVerArr = fwVersion.replace('v', '').split('.').map(i => parseInt(i, 10));
    const featureSupportedVersionArr = featureSupportedVersion.replace('v', '').split('.').map(i => parseInt(i, 10));

    // no need to check 1st d.p. if first digit is already newer than the required version limit
    // check most significant digit
    if (fwVerArr[0] > featureSupportedVersionArr[0])  {
        return true;
    } else if (fwVerArr[0] < featureSupportedVersionArr[0]) {
        return false;
    }
    
    // check 1st d.p
    if (fwVerArr[0] === featureSupportedVersionArr[0] && fwVerArr[1] > featureSupportedVersionArr[1]) return true;
    
    // check 2nd d.p.
    if (fwVerArr[0] >= featureSupportedVersionArr[0] && fwVerArr[1] >= featureSupportedVersionArr[1] && fwVerArr[2] >= featureSupportedVersionArr[2]) return true;
    return false;
}

export function isUnreachedNode(error) {
    let unreachedNode = '';
    const errData = error.data;
    if (errData.type === 'errors') {
        const errorArr = errData.data;
        errorArr.forEach((err) => {
            if (err.type === 'unreachable.headnodeunreachable' ||
                err.type === 'headnodeunreachable') {
                unreachedNode = 'headNodeUnreachable';
            }
        });
    } else if (errData.type === 'specific') {
        const errorObj = errData.data;
        if (typeof errorObj.checksums !== 'undefined') {
            const checksumsObj = errorObj.checksums;
            Object.keys(checksumsObj).forEach((ipv4) => {
                if (!checksumsObj[ipv4].success &&
                    typeof checksumsObj[ipv4].errors !== 'undefined') {
                    checksumsObj[ipv4].errors.forEach((err) => {
                        if (err.type === 'unreachable' ||
                            err.type === 'unreachable.managednodeunreachable') {
                            unreachedNode = 'unreachable';
                        }
                    });
                }
            });
        } else {
            Object.keys(errorObj).forEach((nodeIp) => {
                if (typeof errorObj[nodeIp].success !== 'undefined' &&
                    !errorObj[nodeIp].success &&
                    typeof errorObj[nodeIp].errors !== 'undefined'
                ) {
                    errorObj[nodeIp].errors.forEach((err) => {
                        if (err.type === 'unreachable' ||
                            err.type === 'unreachable.managednodeunreachable') {
                            unreachedNode = 'unreachable';
                        }
                    });
                }
            });
        }
    }
    return unreachedNode;
}

export default function isMismatchSecret(error, api = 'getnodeinfo') {
    let mismatchSecret = '';
    const errData = error.data;
    if (errData.type === 'errors') {
        const errorArr = errData.data;
        errorArr.forEach((err) => {
            if (err.type === 'auth.password') {
                mismatchSecret = 'logout';
            }
        });
    } else if (errData.type === 'specific') {
        if (api === 'getconfig') {
            const errorObj = errData.data;
            if (typeof errorObj.checksums !== 'undefined') {
                const checksumsObj = errorObj.checksums;
                Object.keys(checksumsObj).forEach((ipv4) => {
                    if (!checksumsObj[ipv4].success &&
                        typeof checksumsObj[ipv4].errors !== 'undefined') {
                        checksumsObj[ipv4].errors.forEach((err) => {
                            if (err.type === 'auth.password') {
                                mismatchSecret = 'mismatch';
                            }
                        });
                    }
                });
            }
        }
        if (api === 'getnodeinfo') {
            const errorObj = errData.data;
            Object.keys(errorObj).forEach((nodeIp) => {
                if (typeof errorObj[nodeIp].success !== 'undefined' &&
                    !errorObj[nodeIp].success &&
                    typeof errorObj[nodeIp].errors !== 'undefined'
                ) {
                    errorObj[nodeIp].errors.forEach((err) => {
                        if (err.type === 'auth.password') {
                            mismatchSecret = 'mismatch';
                        }
                    });
                }
            });
        }
    }
    return mismatchSecret;
}

export function beep(amp, vol, duration = 200, delay = 0) {
    const audioContext = new AudioContext();
    const oscillator = audioContext.createOscillator();
    const gain = audioContext.createGain();
    oscillator.frequency.value = amp;
    oscillator.type = 'square';
    gain.gain.setValueAtTime(0, audioContext.currentTime);
    gain.gain.setValueAtTime(vol * 0.01, audioContext.currentTime + (delay * 0.001));

    gain.connect(audioContext.destination);
    oscillator.connect(gain);
    oscillator.start();
    oscillator.stop(audioContext.currentTime + (delay * 0.001) + (duration * 0.001));
}


const {apiVersion} = CommonConstants;

export async function restfulUiApiCall(endPoint, csrf, body) {
    const apiPath = `/api/ui${endPoint}/`;
    let options = {
        method: 'GET',
        credentials: 'include',
    };
    if (body) {
        options = {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrf,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
            credentials: 'include',
        }
    }

    return fetch(apiPath, options);
}

export async function fetchCall(endPoint, csrfToken, body, signal) {
    const {hostname, port} = store.getState().common.hostInfo;
    const apiPath = `http://${hostname}:${port}/${endPoint}/`;

    let options = {};
    csrfToken = cookies.get('csrftoken');
    if (body === null) {
        options = {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            credentials: 'include',
            signal,
        };
    } else if (body instanceof FormData) {
        options = {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            body,
            credentials: 'include',
            signal,
        };
    } else if (body) {
        options = {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body), // determine file upload or not
            credentials: 'include',
            signal,
        };
    } else if (csrfToken) {
        options = {
            method: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            credentials: 'include',
            signal,
        };
    } else {
        options = {
            method: 'GET',
            credentials: 'include',
            signal,
        };
    }

    return fetch(apiPath, options);
}

export async function restfulApiCall(apiAct, csrfToken, projectId = null, body, signal, getParam) {
    const {hostname, port} = store.getState().common.hostInfo;
    let apiPath;
    const isMock = false;
    const targetPort = isMock ? 3001 : port;
    if (apiAct === 'set-language') {
        apiPath = `http://${hostname}:${targetPort}/api/${apiVersion}/settings/${apiAct}/`;
    } else if (projectId) {
        apiPath = `http://${hostname}:${targetPort}/api/${apiVersion}/projects/${projectId}/${apiAct}/`;
    } else if (getParam) {
        apiPath = `http://${hostname}:${targetPort}/api/${apiVersion}/${apiAct}?${new URLSearchParams(getParam)}`;
    } else {
        apiPath = `http://${hostname}:${targetPort}/api/${apiVersion}/${apiAct}/`;
    }

    // mock data start
    // let projectName = '';
    // switch (projectId) {
    //     case '45e56a56-df59-40ba-b4c2-e6816a988681': { projectName = 222; break; }
    //     case '4c92d9e5-dd5a-4759-b38f-4db152557ba7': { projectName = 224; break; }
    //     default:
    // }

    // let apiMockPath = projectId ? `${window.location.protocol}//${window.location.hostname}:3001/api` +
    // `/v2/projects/${projectName}/${apiAct}/` :
    //     `${window.location.protocol}//${window.location.hostname}:3001/api/v2/${apiAct}/`;

    // switch (apiAct) {
    //     case 'get-config': {
    //         if (body.nodes && body.nodes.length < 2) {
    //             apiMockPath = `${window.location.protocol}//${window.location.hostname}:3001/api` +
    //                 `/v2/projects/${projectName}/${apiAct}/${body.nodes[0]}`;
    //         } break;
    //     }
    //     case 'get-network-device-stat': {
    //         apiMockPath = `${window.location.protocol}//${window.location.hostname}:3001/api` +
    //             `/v2/projects/${projectName}/${apiAct}/${body.nodes[0]}`; break;
    //     }
    //     case 'get-filtered-config-options': {
    //         if (!body.options.meshSettings ||
    //             (body.options.meshSettings && body.options.radioSettings && !body.options.nodeSettings)) {
    //             let nodeIp = '';
    //             const bodyContainIp = body.sourceConfig.nodeSettings;
    //             Object.keys(bodyContainIp).forEach((key) => {
    //                 nodeIp = key;
    //             });
    //             apiMockPath = `${window.location.protocol}//${window.location.hostname}:3001/api` +
    //                 `/v2/projects/${projectName}/${apiAct}/${nodeIp}`;
    //         }
    //         break;
    //     }
    //     case 'get-radio-info': {
    //         let nodeIp = '';
    //         const bodyContainIp = body.targets;
    //         Object.keys(bodyContainIp).forEach((key) => {
    //             nodeIp = key;
    //         });
    //         apiMockPath = `${window.location.protocol}//${window.location.hostname}:3001/api` +
    //             `/v2/projects/${projectName}/${apiAct}/${nodeIp}`;
    //         break;
    //     }
    //     default:
    // }
    // apiPath = apiMockPath;
    // mock data end

    let options = {};
    if (body === null) {
        options = {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            credentials: 'include',
            signal,
        };
    } else if (body instanceof FormData) {
        options = {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            body,
            credentials: 'include',
            signal,
        };
    } else if (body) {
        options = {
            method: 'POST',
            headers: {
                'X-CSRFToken': csrfToken,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body), // determine file upload or not
            credentials: 'include',
            signal,
        };
    } else if (csrfToken) {
        options = {
            method: 'GET',
            headers: {
                'X-CSRFToken': csrfToken,
            },
            credentials: 'include',
            signal,
        };
    } else {
        options = {
            method: 'GET',
            credentials: 'include',
            signal,
        };
    }

    return fetch(apiPath, options);
}

export function isOem(nwManifestName) {
    const kw = 'Generic';
    if (typeof nwManifestName === 'undefined' || !nwManifestName) {
        return false;
    }

    if (nwManifestName.includes(kw)) {
        return false;
    }

    return true;
}

export function getOemNameOrAnm(nwManifestName) {
    if (isOem(nwManifestName)) {
        return nwManifestName;
    } else {
        return 'G-NM';
    }
}

export function formatDate(date, display = false) {
    const d = new Date(date);
    let month = (d.getMonth() + 1).toString();
    let day = d.getDate().toString();
    const year = d.getFullYear();
    const hour = d.getHours();
    let minute = d.getMinutes();
    let second = d.getSeconds();

    minute = minute < 10 ? `0${minute}` : minute;
    second = second < 10 ? `0${second}` : second;

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;

    return display ?
        `${year}-${month}-${day} ${hour}:${minute}:${second}`
        :
        [year, month, day, hour, minute, second].join('-');
};

export function searchNodeStatus(nodeIp, nodeStatus) {
    if (nodeStatus.find(node => node.id === nodeIp)) {
        const {isManaged, isReachable} = nodeStatus.find(node => node.id === nodeIp);
        return isManaged ? (() => (isReachable ? 'reachable' : 'unreachable'))() : 'unmanaged';
    }
    return 'unmanaged';
}