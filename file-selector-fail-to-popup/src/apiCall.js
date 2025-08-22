import store from '../redux/store';
import i18n from '../I18n';
import {openLogoutDialog} from '../redux/common/commonActions';
import {restfulUiApiCall, restfulApiCall, fetchCall} from './common';

export function isSessionExpired(res, ctx, cb, notDirect) {
    if (res.status === 403 &&
        ctx.errors[0].type === 'session.authenticateerror') {
        if (!notDirect) {
            cb();
        }
        return true;
    }
    return false;
}

export function isNotLoggedIn(res, ctx, cb, notDirect) {
    let notLoggedIn = false;
    if (res.status === 200 && typeof ctx.errors !== 'undefined') {
        ctx.errors.some((error) => {
            if (typeof error.type !== 'undefined') {
                if (error.type === 'auth.notloggedin') {
                    notLoggedIn = true;
                    if (!notDirect) {
                        cb();
                    }
                    return true;
                }
            }
            return false;
        });
    }
    return notLoggedIn;
}

function handleSessionExpied(
    title = 'sessionExpiredDialogTitle',
    content = 'sessionExpiredDialogContent',
    actionLabel = 'sessionExpiredDialogActionBtnLabel'
) {
    
    store.dispatch(openLogoutDialog(
        i18n.t(title),
        i18n.t(content),
        i18n.t(actionLabel)
    ));
}
/**
 * general response handler
 * @param {object} res restful api response obj
 * @param {objec} ctx object after api reponse json()
 * @param {boolean} notDirect Should it re-direct to logout page when is session expired or is not logged in
 * @param {(string|string[])} [returnKey] default is return ctx.data, But some api has other structure
 */
function generalResponseHandler(res, ctx, notDirect = false, returnKey = false) {
    const err = new Error('P2Error');
    
    if (isSessionExpired(res, ctx, handleSessionExpied, notDirect) ||
        isNotLoggedIn(res, ctx, handleSessionExpied, notDirect)) {
        err.data = {type: 'errors', data: ctx.errors};
        return Promise.reject(err);
    } else if (res.status >= 400) {
        throw new Error('Bad response from server');
    } else if (ctx.success) {
        if (returnKey) {
            if (typeof returnKey === 'string') {
                return {[returnKey]: ctx[returnKey]};
            }
            const returnObj = {};
            returnKey.forEach((key) => { returnObj[key] = ctx[key]; });
            return returnObj
        }
        return ctx.data;
    } else if (typeof ctx.specific !== 'undefined') {
        err.data = {type: 'specific', data: ctx.specific};
        return Promise.reject(err);
    } else if (typeof ctx.errors !== 'undefined') {
        err.data = {type: 'errors', data: ctx.errors};
        return Promise.reject(err);
    }
    throw new Error('Bad response from server');
}

function mockGeneralResponseHandler(res, ctx, notDirect = false, returnKey = false) {
    const err = new Error('P2Error');
    if (isSessionExpired(res, ctx, handleSessionExpied, notDirect) ||
        isNotLoggedIn(res, ctx, handleSessionExpied, notDirect)) {
        err.data = {type: 'errors', data: ctx.errors};
        return Promise.reject(err);
    } else if (res.status >= 400) {
        throw new Error('Bad response from server');
    } else if (ctx.success) {
        if (returnKey) {
            if (typeof returnKey === 'string') {
                return {[returnKey]: ctx[returnKey]};
            }
            const returnObj = {};
            returnKey.forEach((key) => { returnObj[key] = ctx[key]; });
            return returnObj
        }
        return {data: ctx.data, seq: ctx.seq};
    } else if (typeof ctx.specific !== 'undefined') {
        err.data = {type: 'specific', data: ctx.specific};
        return Promise.reject(err);
    } else if (typeof ctx.errors !== 'undefined') {
        err.data = {type: 'errors', data: ctx.errors};
        return Promise.reject(err);
    }
    throw new Error('Bad response from server');
}

export async function getInitData() {
    try {
        return new Promise((resolve, reject) => {
            const {hostname, port} = store.getState().common.hostInfo;
            const request = new XMLHttpRequest();
            request.open('GET', `http://${hostname}:${port}`);
            request.withCredentials = true; // required for web version
            request.onerror = function () {
                const error = new Error();
                error.data = {
                    success: false,
                    data: [{type: 'uiServer.djangoServerNotFound'}],
                };
                reject(error);
            };
            request.onload = function () {
                const emulateDom = new DOMParser().parseFromString(this.responseText, 'text/html');
                
                const container = emulateDom.getElementById('container');
                const dataUserName = container.getAttribute('data-username');
                let loggedinAnm = false;
                let hasUser = false;
                if (dataUserName) {
                    loggedinAnm = true;
                    hasUser = true;
                } else {
                    hasUser = container.getAttribute('data-has-user') === 'true';
                }
                const lang = container.getAttribute('data-language');
                const fullAppName = container.getAttribute('data-full-app-name');
                const companyName = container.getAttribute('data-company-name');
                const appLabel = container.getAttribute('data-app-label');
                const fwLabel = container.getAttribute('data-fw-label');
                const csrfToken = emulateDom.getElementsByTagName('input')[0].value;
                const returnObj = {
                    loggedinAnm,
                    hasUser,
                    lang,
                    csrfToken,
                    fullAppName,
                    companyName,
                    appLabel,
                    fwLabel,
                    // env,
                };
                getSelectedLocation(csrfToken).then((res) => {
                    returnObj.location = res.selectedLocation;
                    resolve(returnObj);
                }).catch(() => {
                    returnObj.location = 'error';
                    const error = new Error();

                    error.data = {
                        success: false,
                        data: [{type: 'uiServer.djangoServerNotFound'}],
                        domData: returnObj,
                    };
                    reject(error);
                });
            };
            request.onreadystatechange  = () => {
                if (request.readyState === 4 && request.status !== 200) {
                    reject();
                }
            }
            request.send();
        });
    } catch (e) {
        throw e;
    }
}

export async function linkAlignmentExportXLS(csrf, bodyMsg) {
    try {
        const res = await restfulUiApiCall('/linkAlignmentExportXLS', csrf, bodyMsg);
        
        const ctx = await res.blob();
        

        return ctx;
    } catch (e) {
        throw e;
    }
}

export async function loginAmn(csrf, bodyMsg, notDirect = false) {
    try {
        const res = await fetchCall('login', csrf, bodyMsg);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx, notDirect);
    } catch (e) {
        throw e;
    }
}

export async function logoutAnm(csrf, notDirect = false) {
    try {
        const res = await fetchCall('logout', csrf, {});
        const ctx = await res.json();

        return generalResponseHandler(res, ctx, notDirect);
    } catch (e) {
        throw e;
    }
}

export async function getProjectList(notDirect = false) {
    try {
        const res = await restfulApiCall('project-list');
        const ctx = await res.json();

        return generalResponseHandler(res, ctx, notDirect);
    } catch (e) {
        throw e;
    }
}

export async function getSelectedLocation(csrf) {
    try {
        const res = await restfulApiCall('settings/selected-location', csrf, null);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getVersion() {
    try {
        const res = await restfulApiCall('get-version');
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getInternalSettings(csrf, projectId) {
    try {
        const res = await restfulApiCall('internal-settings', csrf, projectId);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function setInternalSettings(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('set-internal-settings', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}


export async function getUiSettings(csrf) {
    try {
        const res = await restfulApiCall('ui-settings', csrf);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getProjectUiSettings(csrf, projectId) {
    try {
        const res = await restfulApiCall('project-ui-settings', csrf, projectId);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function setUiSettings(csrf, body) {
    try {
        const res = await restfulApiCall('set-ui-settings', csrf, null, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function setProjectUiSetting(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('set-project-ui-settings', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function deleteProject(csrf, projectId) {
    try {
        const res = await restfulApiCall('delete', csrf, projectId, {});
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function updateProject(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('update', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function createProject(csrf, body) {
    try {
        const res = await restfulApiCall('create-project', csrf, null, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function pingHostNode(csrf, projectId) {
    try {
        const res = await restfulApiCall('ping-host-node', csrf, projectId, {});
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function loginProject(csrf, body, projectId, signal = null) {
    try {
        const res = await restfulApiCall('login-project', csrf, projectId, body, signal);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function logoutProject(csrf, body, projectId, signal = null) {
    try {
        const res = await restfulApiCall('logout-project', csrf, projectId, body, signal);
        
        
        const ctx = await res.json();
        
        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getConfig(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('get-config', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getCachedConfig(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('cached-get-config', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function restartCNPipe(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('restart-cnpipe1', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getFilteredConfigOptions(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('cached-get-filtered-config-options', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getCachedFilteredConfigOptions(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('cached-get-filtered-config-options', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function setConfig(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('set-config', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getEthLinkSegments(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('ethernet-link-segments', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getMeshTopology(csrf, projectId) {
    try {
        const res = await restfulApiCall('mesh-topology', csrf, projectId);
        const ctx = await res.json();
        
        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getCachedEthLinkSegments(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('cached-ethernet-link-segments', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getCachedMeshTopology(csrf, projectId) {
    try {
        const res = await restfulApiCall('cached-mesh-topology', csrf, projectId);
        const ctx = await res.json();
        
        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getCachedNodeInfo(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('cached-node-info', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getCachedLinkInfo(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('cached-link-info', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getCachedNetworkDeviceStat(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('cached-network-device-stat', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function mockGetMeshTopology(csrf, projectId) {
    try {
        const res = await restfulApiCall('mesh-topology', csrf, projectId);
        const ctx = await res.json();

        return mockGeneralResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getNodeInfo(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('node-info', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getNetworkDeviceStat(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('get-network-device-stat', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getLinkInfo(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('link-info', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function userRestore(csrf, body) {
    try {
        const res = await restfulApiCall('user-restore', csrf, null, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}


export async function userBackup(csrf) {
    const err = new Error('P2Error');
    try {
        const res = await restfulApiCall('user-backup', csrf, null, {});
        let ctx = '';
        const contentType = res.headers.get('content-type');
        if (res.status >= 400) {
            throw new Error('Bad response from server');
        } else if (
            contentType === 'application/zip' ||
            contentType === 'application/x-zip-compressed'
        ) {
            ctx = await res.blob();
            return ctx;
        } else if (contentType === 'application/json') {
            ctx = await res.json();
            if (isSessionExpired(res, ctx, openLogoutDialog, false) ||
                isNotLoggedIn(res, ctx, openLogoutDialog, false)) {
                err.data = {type: 'errors', data: ctx.errors};
                return Promise.reject(err);
            }
            err.data = {type: 'errors', data: ctx.errors};
            return Promise.reject(err);
        } else {
            throw new Error('invalid mime type');
        }
    } catch (e) {
        err.data = {type: 'runtime', data: e.message};
        throw err;
    }
}

export async function updateUserPassword(csrf, body) {
    try {
        const res = await fetchCall('login/update-user-password', csrf, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function validateUserCredential(csrf, body) {
    try {
        const res = await restfulApiCall('validate-user-credential', csrf, null, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function setNtpServer(csrf, body, projectId) {
    try {
        const res = await restfulApiCall('set-ntp-server', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function setLanguage(csrf, body) {
    try {
        const res = await restfulApiCall('set-language', csrf, null, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function updateManagementSecret(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('update-management-secret', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function resetManagementSecret(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('reset-management-secret', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function updateManagedDevList(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('update-managed-dev-list', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function uploadProjectImage(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('upload-project-image', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function deleteProjectImage(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('delete-project-image', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getProjectDebugInfo(csrf, projectId, body) {
        try {
        const _body = {
            ...body,
            uiVersion: process.env.REACT_APP_UI_DISPLAY_VER ?? 'dev',
        };
        const res = await restfulApiCall('project-debug-info', csrf, projectId, _body);

        if (res.status === 200) {
            
            const ctx = await res.blob();
            

            // Debug: Log all response headers
            
            for (let [key, value] of res.headers.entries()) {
                
            }

            // Safely extract filename from Content-Disposition header
            const contentDisposition = res.headers.get('Content-Disposition');
            

            let filename = 'debug_info.tar.gz'; // Default filename

            if (contentDisposition) {
                // Try multiple regex patterns for filename extraction
                const patterns = [
                    /filename="([^"]+)"/,           // filename="file.tar.gz"
                    /filename=([^;]+)/,             // filename=file.tar.gz
                    /filename\*=UTF-8''([^;]+)/,    // RFC 5987 format
                ];

                for (const pattern of patterns) {
                    const match = contentDisposition.match(pattern);
                    if (match && match[1]) {
                        filename = decodeURIComponent(match[1].trim());
                        break;
                    }
                }
            } else {
                console.warn('DEBUG: No Content-Disposition header found, using default filename');
            }

            const result = {
                success: true,
                data: {
                    filename,
                    file: ctx,
                },
            };
            // code for kyle
            return result;
        }
        const failObj = {
            success: false,
            errors: [{type: 'Server error'}],
        };
        return Promise.reject(failObj);
    } catch (e) {
        throw e;
    }
}

export async function getDebugInfo(csrf) {
    try {
        const param = {
            uiVersion: process.env.REACT_APP_UI_DISPLAY_VER ?? 'dev',
        };
        const res = await restfulApiCall('debug-info', null, null, null, null, param);
        if (res.status === 200) {
            const ctx = await res.blob();

            // Safely extract filename from Content-Disposition header
            const contentDisposition = res.headers.get('Content-Disposition');

            let filename = 'debug_info.tar.gz'; // Default filename

            if (contentDisposition) {
                // Try multiple regex patterns for filename extraction
                const patterns = [
                    /filename="([^"]+)"/,           // filename="file.tar.gz"
                    /filename=([^;]+)/,             // filename=file.tar.gz
                    /filename\*=UTF-8''([^;]+)/,    // RFC 5987 format
                ];

                for (const pattern of patterns) {
                    const match = contentDisposition.match(pattern);
                    if (match && match[1]) {
                        filename = decodeURIComponent(match[1].trim());
                        break;
                    }
                }
            } else {
                console.warn('DEBUG: getDebugInfo - No Content-Disposition header found, using default filename');
            }

            const result = {
                success: true,
                data: {
                    filename,
                    file: ctx,
                },
            };
            // code for kyle
            return result;
        }
        const failObj = {
            success: false,
            errors: [{type: 'Server error'}],
        };
        return Promise.reject(failObj);
    } catch (e) {
        throw e;
    }
}

export async function factoryReset(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('factory-reset', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function downgradePtosFirmware(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('downgrade-ptos-firmware', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function uploadPtosFirmware(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('upload-ptos-firmware', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx, false, 'binVer');
    } catch (e) {
        throw e;
    }
}

export async function upgradeFirmware(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('upgrade-firmware', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function clearStorage(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('clear-storage', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx, false);
    } catch (e) {
        throw e;
    }
}

export async function uploadFirmware(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('upload-firmware', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx, false, 'binVer');
    } catch (e) {
        throw e;
    }
}

export async function reboot(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('reboot', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getRadioInfo(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('get-radio-info', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getCachedRadioInfo(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('cached-get-radio-info', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function linkAlignment(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('link-alignment', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function spectrumScan(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('spectrum-scan', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function analysisSpectrumData(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('analysis-spectrum-data', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function scanNearbyNeighbor(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('scan-nearby-neighbor', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function cancelScanNearbyNeighbor(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('cancel-scan-nearby-neighbor', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function nodeRecovery(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('node-recovery', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function cancelRecovery(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('cancel-recovery', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function extendRecoveryTimeout(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('extend-recovery-timeout', csrf, projectId, body);
        const ctx = await res.json();

        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getHistoricalData(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('historical-data', csrf, projectId, body);
        const ctx = await res.json();
        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function exportHistoricalData(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('export-historical-data', csrf, projectId, body);
        const ctx = await res.json();
        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function getNetworkEvent(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('network-event', csrf, projectId, body);
        const ctx = await res.json();
        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}

export async function setDataPolling(csrf, projectId, body) {
    try {
        const res = await restfulApiCall('set-data-polling', csrf, projectId, body);
        const ctx = await res.json();
        return generalResponseHandler(res, ctx);
    } catch (e) {
        throw e;
    }
}