import { useEffect, useRef, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useHistory } from 'react-router-dom';
import useProjectManager from '../projectManagement/useProjectManager';
import Cookies from 'js-cookie';
import {
    // fetchMeshTopology,
    // fetchNodeInfo,
    // fetchNetworkStat,
    // fetchLinkInfo,
    stopGraphUpdate,
    resumeGraphUpdate,
    // fetchConfig,
    // fetchEthLinkSegments
} from '../../redux/meshTopology/meshTopologyActions';
import {
    fetchCachedLinkInfo,
    fetchCachedNodeInfo,
    fetchCachedNetworkStat,
    fetchCachedEthLinkSegments,
    fetchCachedConfig,
    fetchCachedMeshTopology,
} from '../../redux/meshTopology/cachedMeshTopologyActions';
import {
    updatePollingInterval,
    stopPolling,
    startPolling,
    // updateDataOnce,
} from '../../redux/pollingScheduler/pollingActions';
import { getClusterInformation } from '../../redux/dashboard/dashboardActions';
import { addNewNotific } from '../../redux/notificationCenter/notificationActions';
import {
    toggleLockLayer,
    toggleSnackBar,
    openDeviceListDialog,
    setAutoLoginFlag,
    setAutoLoginDialogData,
    openLogoutDialog
} from '../../redux/common/commonActions';
import { syncProjectUiSettings } from '../../redux/uiProjectSettings/uiProjectSettingsActions';
import { meshTopologyErrDeterminer } from './errorDeterminer';
import store from '../../redux/store';
import { logoutProject } from '../../util/apiCall'

let pollConfig;
/**
 * Component to control all the polling relacted events
 * such as when to start / stop, change state handling, reponse handling and error handling
 *
 * polling controlled by the `isPolling` bool in redux store `store -> polling -> isPolling`
 *
 * The polling action should auto stop or resume (ref to `pollingTriggerPoint` and `pollingTriggerCondition`)
 * so no need to call stop polling or start polling on other component's didMount and unmount state
 */
const usePolling = () => {
    const intervalRef = useRef(null);
    // setTimeout id
    let nodeLoggingInTimeoutRef = useRef(null)
    // 120s counter for node is logging in self healing
    let nodeLoggingInCounterLimitRef = useRef(120);
    const dispatch = useDispatch();
    const history = useHistory();
    const [nwWindowIsVisible, setNwWindowIsVisible] = useState(true);
    const { handler } = useProjectManager();
    const {
        polling: {
            interval,
            isPolling,
            restart,
            updateOnce,
            abortPolling,
            isNodeLoggingInCounterStart,
        },
        common: {
            csrf,
            meshView,
            logoutDialog,
            settingsDialog,
            deviceListDialog,
            labels,
            isAutoLogin
        },
        meshTopology: {
            initState,
            adjustMode,
        },
        projectManagement: {
            projectId,
            projectDialog: { onView },
            hasLogin,
        },
        nodeRecovery,
        linkAlignment,
        spectrumScan,
        uiProjectSettings: {
            pollingIntervalOnDashboardView,
            pollingIntervalOnTopologyView,
        }
    } = useSelector(store => store);

    const { t: _t, ready } = useTranslation('cluster-topology');
    const t = (tKey, options) => _t(tKey, { ...labels, ...options });
    const pollingAction = () => {
        if (projectId === '') return;
        if (meshView === 'dashboard') {
            if (pollConfig) {
                dispatch(getClusterInformation());
            }
            pollConfig = !pollConfig;
        }
        console.log('************************* checkpoint 1 *************************')
        dispatch(fetchCachedMeshTopology()).then((res) => {
            // fetch success, remove re-login timeout ID
            clearNodeLoggingInTimeoutRef();
            dispatch(fetchCachedEthLinkSegments()).catch(
                (e) => {
                    console.log(e);
                    console.log(e.data);
                }
            );

            if (typeof res.status.lock !== 'undefined') {
                dispatch(toggleLockLayer(res.status.lock));
            }

            if (res.status.unmanagedHostnode) {
                dispatch(openDeviceListDialog());
            } else {
                dispatch(fetchCachedNodeInfo()).then(() => {
                    if (meshView === 'dashboard' || meshView === 'topology') {
                        dispatch(fetchCachedNetworkStat()).then(() => {
                            // console.log('kenny_debug_3');
                            dispatch(fetchCachedConfig()).catch((e) => {
                                console.log('----config error', e.data);
                            });
                        }).catch((e) => {
                            console.log('----stat error', e.data);
                            // console.log('kenny_debug_3');
                            dispatch(fetchCachedConfig()).catch((e) => {
                                console.log('----config error', e.data);
                            });
                        });
                    } else {
                        // console.log('kenny_debug_2');
                        dispatch(fetchCachedConfig()).catch((e) => {
                            console.log('----config error', e.data);
                        });
                    }
                }).catch((e) => {
                    if (e.data.type && e.data.type === 'specific') {
                        // fetch statistics #8749 though all node info cannot be gathered successfully
                        dispatch(fetchCachedNetworkStat()).catch(e => console.warn('Fetch stat error in cath of node info (normal)', e))

                        dispatch(fetchCachedConfig()).catch((e) => {
                            console.log('----config error', e.data);
                        });
                    }
                });
                dispatch(fetchCachedLinkInfo()).catch((e) => {
                    console.error(e)
                    console.log('----link info error', e.data);
                });
            }

            if (res.status.newUnmanagedNode) {
                dispatch(addNewNotific([{
                    type: 'NEW_UNMANAGED_DEVICE',
                    iconType: 'NOTIFY',
                    info: {
                        deviceList: res.status.notiftyDeviceList,
                    },
                    onClickAction: 'openManagedDeviceList',
                    actionConfirmBtn: false,
                    cannotRemove: false,
                }]));
                dispatch(syncProjectUiSettings());
            }
        }).catch((e) => {
            console.log('----topology error', e);
            if (e?.data?.type === 'errors') {
                const { type, message } = e?.data?.data[0];

                if (type === 'unreachable.headnodeunreachable' ||
                    type === 'nodebusy.headnodebusy' ||
                    type === 'auth.password' ||
                    (type === 'runtime' && message === 'Unknown error')) {
                    dispatch(toggleLockLayer(true));
                }

                // Detection of node is logging in #8539
                if (type === 'runtime' && /^NODE_IS_LOGGING_IN.*/.test(message)) {
                    const projectIdToRelogin = Cookies.get('projectId');
                    const projectSecretToRelogin = Cookies.get('projectHimitsu')
                    const projectNameToRelogin = handler.common.getProjectNameFromProjectId(projectIdToRelogin);
                    // Check if there is existing counting interval
                    if (nodeLoggingInTimeoutRef.current == null) {
                        // Make sure all required items and condition exists / pass before re-login
                        if (isPolling && projectIdToRelogin && projectNameToRelogin && projectSecretToRelogin) {
                            dispatch(toggleLockLayer(true));
                            nodeLoggingInTimeoutRef.current = setTimeout(async () => {
                                try {
                                    // Logout the project
                                    // Cookies.set('projectId', null);
                                    const logoutRes = await logoutProject(csrf, {}, projectId);
                                    // Perform re-login
                                    handler.list.listHandleConnectOnClick(projectIdToRelogin);
                                    // Ensure loading screen appears during the whole auto login process
                                    dispatch(setAutoLoginFlag(true));
                                    const reLoginRes = await handler.login.loginHandleLoginOnClick(
                                        projectSecretToRelogin, projectIdToRelogin, projectNameToRelogin
                                    );
                                } catch (e) {
                                    // Error handling when auto login fails (e.g. ping-host-node)
                                    console.error('Error while auto logging in carries out, reaseon:' + e)
                                    // hide loading layer
                                    dispatch(toggleLockLayer(false));
                                    // set back auto login flag to default
                                    dispatch(setAutoLoginFlag(false));
                                    // popup dialog
                                    dispatch(setAutoLoginDialogData(t('autoLoginFailTitle'), t('autoLoginFailCtx'), true))
                                } finally {
                                    // Hide the lock layer (always)
                                    dispatch(toggleLockLayer(false));
                                    // reset timeout counter (always)
                                    clearNodeLoggingInTimeoutRef();
                                    // no need to set flag as we already set flag off when fail above
                                }
                            }, (nodeLoggingInCounterLimitRef.current) * 1000); // Start 120s tolerance counting, see if controller can recover itself
                        }
                    }
                }

                const messages = meshTopologyErrDeterminer(type, t, message);
                dispatch(toggleSnackBar(messages));
            } else if (e.message === 'Bad response from server') {
                dispatch(toggleLockLayer(true));
                dispatch(toggleSnackBar(e.message));
            } else if (e.message === 'hostNodeNotAuth') {
                const hostnodeUnreachableCount = e.hostnodeUnreachableCount;
                const shouldShowHostnodeUnreachableDialog = e.shouldShowHostnodeUnreachableDialog;
                if (hostnodeUnreachableCount >= 2 && shouldShowHostnodeUnreachableDialog) {
                    // dispatch(setAutoLoginFlag(true));
                    dispatch(openLogoutDialog(t('hostNodeNotAuthTitle'), t('hostNodeNotAuthCtx'), t('hostNodeNotAuthReturnBtn'), t('hostNodeNotAuthStayBtn')));
                }
                dispatch(toggleLockLayer(true));
                dispatch(toggleSnackBar(t('hostNodeNotAuthTitle')));
            }

        });
    };

    const clearIntervalRef = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const clearNodeLoggingInTimeoutRef = () => {
        if (nodeLoggingInTimeoutRef.current) {
            clearTimeout(nodeLoggingInTimeoutRef.current);
            nodeLoggingInTimeoutRef.current = null;
        }
    };

    const startPollingAct = () => {
        pollConfig = true;
        pollingAction();
        // intervalRef.current = setInterval(pollingAction, interval * 1000000);
        intervalRef.current = setInterval(pollingAction, interval * 1000);
    };

    /**
     * event listener on Pathname change under '/mesh'
     * start polling when user switch back to '/mesh'
     *
     * stop polling and update store once when user change to '/maintenance' or '/config'
     * for data rendering
     *
     * @param {string} location
     */
    const handlePathOnChange = (location) => {
        console.log('location');
        console.log(location);
        const { pathname } = location;
        if (pathname === '/config' || pathname === '/maintenance') {
            if (store.getState().polling.isPolling) {
                dispatch(toggleLockLayer(false));
                dispatch(stopPolling());
                dispatch(stopGraphUpdate());
            }
            // dispatch(updateDataOnce());
        } else {
            const quickStagingLoginRequest = Cookies.get('quickStagingLoginRequest');
            if (quickStagingLoginRequest !== 'true') {
                if (!store.getState().meshTopology.initState.graph) {
                    dispatch(toggleLockLayer(true));
                }
                dispatch(startPolling());
                dispatch(resumeGraphUpdate());
            }
        }
    };

    const addNwWindowEventListener = () => {
        const win = window.nw.Window.get();
        win.on('minimize', () => {
            setNwWindowIsVisible(false);
        });
        win.on('restore', () => {
            setNwWindowIsVisible(true);
        });
        // win.on('blur', () => {
        //     setNwWindowIsVisible(false);
        // });
        // win.on('focus', () => {
        //     setNwWindowIsVisible(true);
        // });
    };

    const didMountFunc = () => {
        history.listen(handlePathOnChange);
        window.addEventListener('beforeunload', () => {
            clearIntervalRef();
            history.listen(null);
            const win = window.nw.Window.get();
            win.removeAllListeners('minimize');
            win.removeAllListeners('restore');
        });

        return () => {
            clearIntervalRef();
            history.listen(null);
            const win = window.nw.Window.get();
            win.removeAllListeners('minimize');
            win.removeAllListeners('restore');
            // win.removeAllListeners('blur');
            // win.removeAllListeners('focus');
        };
    };

    const handlePollingValueChange = () => {
        clearIntervalRef();
        if (isPolling) {
            startPollingAct();
        }
    };

    const handleViewOnChange = () => {
        if (meshView === 'dashboard') {
            if (interval !== pollingIntervalOnDashboardView) dispatch(updatePollingInterval(pollingIntervalOnDashboardView));
        } else {
            if (interval !== pollingIntervalOnTopologyView) dispatch(updatePollingInterval(pollingIntervalOnTopologyView));
        }
    };

    // handle uiSettings polling interval change
    useEffect(
        () => {
            handleViewOnChange();
        }, [pollingIntervalOnDashboardView, pollingIntervalOnTopologyView]
    );

    /**
     * The array stored all the value that may affect the polling should stop or resume
     *
     * e.g. stop polling when projectId is empty
     */
    const pollingTriggerPoint = [
        projectId, onView, logoutDialog.open, settingsDialog.open, deviceListDialog.open, hasLogin,
        abortPolling, adjustMode, linkAlignment.open, spectrumScan.open,
        // nwWindowIsVisible,
        nodeRecovery.open,
    ];

    /**
     * Function should return true if polling is desired
     */
    const pollingTriggerCondition = [
        () => projectId !== '',
        () => onView === '',
        () => !logoutDialog.open,
        () => !settingsDialog.open,
        () => !deviceListDialog.open,
        () => !abortPolling,
        () => !adjustMode,
        () => !linkAlignment.open,
        () => !spectrumScan.open,
        // () => nwWindowIsVisible,
        () => hasLogin,
        () => !nodeRecovery.open,
    ];

    const shouldStartPolling = () => {
        let shouldPolling = true;
        pollingTriggerCondition.some((condition, index) => {
            if (!condition()) {
                shouldPolling = false;
                return true;
            }
            return false;
        });

        return shouldPolling;
    }

    const handleTriggerPolling = () => {
        const quickStagingLoginRequest = Cookies.get('quickStagingLoginRequest');
        if (quickStagingLoginRequest !== 'true' &&
            (history.location.pathname === '/' || history.location.pathname === '/mesh')) {
            let shouldPolling = true;
            pollingTriggerCondition.some((condition, index) => {
                if (!condition()) {
                    shouldPolling = false;
                    return true;
                }
                return false;
            });
            if (shouldPolling !== isPolling) {
                if (shouldPolling) {
                    dispatch(startPolling());
                    dispatch(resumeGraphUpdate());
                } else {
                    dispatch(stopPolling());
                    dispatch(stopGraphUpdate());
                }
            }
        } else if (quickStagingLoginRequest !== 'true' &&
            (history.location.pathname === '/config' || history.location.pathname === '/maintenance') &&
            !initState.graph) {
            if (isPolling) {
                dispatch(stopPolling());
            }
            dispatch(toggleLockLayer(false));
            // dispatch(updateDataOnce());
        } else {
            if (isPolling) {
                dispatch(stopPolling());
            }
        }
    };

    const handleUpdateOnce = () => {
        pollingAction();
    };

    useEffect(didMountFunc, []);
    useEffect(handlePollingValueChange, [isPolling, interval, restart]);
    useEffect(handleViewOnChange, [meshView]);
    useEffect(handleTriggerPolling, pollingTriggerPoint);
    useEffect(handleUpdateOnce, [updateOnce]);
};

export default usePolling;
