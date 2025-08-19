import {useEffect, useState, useRef} from 'react';
import Cookies from 'js-cookie';
import {useSelector, useDispatch} from 'react-redux';
import {
    logoutAnm,
    deleteProject,
    updateProject,
    createProject,
    pingHostNode,
    loginProject,
    getMeshTopology,
    getCachedMeshTopology,
    getCachedConfig,
    getConfig,
} from '../../util/apiCall';
import {locationCountryCodeChecking} from '../../util/commonFunc';
import {
    openSettingsDialog,
    openGuidelineDialog,
} from '../../redux/common/commonActions';
import {
    toggleLockLayer,
    changeMeshView,
    toggleSnackBar,
    setAutoLoginDialogData
} from '../../redux/common/commonActions';
import {
    initNotificCenter,
} from '../../redux/notificationCenter/notificationActions';
import {
    initBackground,
} from '../../redux/meshTopology/meshTopologyActions';
import {
    updateProjectList,
    setProjectInfo,
    changeOnView,
    openProjectBackupRestore,
} from '../../redux/projectManagement/projectActions';
import {
    updateUiSettings,
    syncUiSettings,
    updateShouldHelpDialogPopUp,
    updateRememberSecret,
    setUiSettingsItem
} from '../../redux/uiSettings/uiSettingsActions';
import {
    updateProjectUiSettings,
} from '../../redux/uiProjectSettings/uiProjectSettingsActions';
import ProjectConstants from '../../constants/project';
import {loginErrDeterminer} from './errorDeterminer';
import {useHistory} from 'react-router-dom';

const {
    project: {
        quickStagingIp,
        quickStagingName,
        defaultManagementSecret,
    },
} = ProjectConstants;

/**
 * Component to controll all the project relacted events
 *
 * Two main purposes of this component is to handle all the project related lifecycle events
 * and component logic (data flow, non ui logic, resful api, redux action)
 *
 * This component will returns all the event handling function and react state
 * so all the project dialog components will be a simple react component
 */
const useProjectManager = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const csrf = Cookies.get('csrftoken');
    const {
        common: {location, meshView},
        uiSettings: {shouldHelpDialogPopUp, secret},
        projectManagement: {
            projectList,
            projectId,
            projectDialog: {onView},
            backupRestoreDialog,
            changeToStaging,
            hasLogin,
        },
    } = useSelector(store => store);

    const loginTimeoutRef = useRef();
    const loginControllerRef = useRef();

    const [dialog, setDialog] = useState({
        open: false,
    });
    const [init, setInit] = useState(true);
    const [dontShow, setDontShow] = useState(false);
    const [rememberSecret, setRememberSecret] = useState(false);
    const [loginStatus, setLoginStatus] = useState({
        loginProjectId: '',
        loginProjectName: '',
        savedSecret: '',
    });

    // ---- lifecycle events in here ----
    const checkProjectCountry = async (targetId, successAct) => {
        return getCachedMeshTopology(csrf, targetId).then((res) => {
            const hostnodeIp = Object.keys(res).find(node => res[node].isHostNode);
            
            return getCachedConfig(csrf, targetId, {nodes: [hostnodeIp]}, targetId).then((config) => {
                const {meshSettings: {country}} = config;
                // return;

                if (locationCountryCodeChecking(location, country)) {
                    successAct();
                    return true;
                } else {
                    const err = new Error('uiError');
                    err.data = {
                        type: 'errors',
                        data: [{type: 'locationNotCompatible'}],
                    };
                    err.state = 'location';
                    throw err;
                }
            }).catch((e) => {
                if (!e.state) e.state = 'getConfig';
                throw  e;
            });
        }).catch((e) => {
            if (!e.state) e.state = 'getMeshTopology';
            throw  e;
        });
    };

    const stopLoginTimeout = () => {
        if (loginTimeoutRef.current) {
            clearTimeout(loginTimeoutRef.current);
            loginTimeoutRef.current = null;
        }
        if (loginControllerRef.current) {
            loginControllerRef.current.abort();
            loginControllerRef.current = null;
        }
    };

    const handleUiSettingsInit = (settings) => {
        // handle landing page
        if (typeof settings.landingView === 'undefined') {
            dispatch(changeMeshView('topology'));
        } else if (meshView !== settings.landingView) {
            dispatch(changeMeshView(settings.landingView));
        }

        // handle welcome page initial settings pop up parameter
        if (typeof settings.needInitialSetup === 'undefined') {
            dispatch(setUiSettingsItem('needInitialSetup', true));
        }
    };

    const handleProjectUiSettingsInit = (settings) => {
        if (settings?.notificationCenter) {
            dispatch(initNotificCenter(settings.notificationCenter));
        }
    };

    const quickStagingLoginFunc = (projectInfo) => {
        stopLoginTimeout();
        
        const controller = new AbortController();
        loginControllerRef.current = controller;
        const signal = controller.signal;
        const currentProjectId = Cookies.get('projectId');
        
        pingHostNode(csrf, projectInfo.projectId).then(() => {
            return loginProject(csrf, {managementSecret: defaultManagementSecret}, currentProjectId, signal).then(() => {
                const successAct = () => {
                    Cookies.remove('quickStagingLoginRequest');
                    dispatch(updateProjectUiSettings(currentProjectId)).then(() => {
                        dispatch(setProjectInfo({
                            ...projectInfo,
                            hasLogin: true,
                        }));
                        handleProjectUiSettingsInit();
                    }).catch(e => {
                        console.log(e);
                        dispatch(setProjectInfo({
                            ...projectInfo,
                            hasLogin: true,
                        }));
                    });
                    dispatch(toggleLockLayer(true));
                };
                checkProjectCountry(currentProjectId, successAct)
                    .catch(() => { setDialog({open: true}); });
            }).catch((e) => { throw e; });
        }).catch((e) => {
            if (e.name === 'AbortError') return;

            if (e?.data?.data) {
                const messages = loginErrDeterminer(e.data.data[0].type);
                dispatch(toggleSnackBar(messages));
            }
            loginTimeoutRef.current = setTimeout(() => {
                quickStagingLoginFunc(projectInfo);
            }, 10000);
        });
    };

    const didmountFunc = () => {
        const newSession = Cookies.get('newSession');
        dispatch(updateUiSettings(newSession)).then((settings) => {
            console.warn(settings)
            handleUiSettingsInit(settings);
            dispatch(toggleLockLayer(true));
            dispatch(updateProjectList()).then((list) => {
                const currentProjectId = Cookies.get('projectId');
                const currentProject = list.find(proj => proj.projectId === currentProjectId);
                const loggedinProject = currentProjectId && currentProject;
                if (loggedinProject) {
                    const quickStagingLoginRequest = Cookies.get('quickStagingLoginRequest');
                    const projectInfo = {
                        projectId: currentProjectId,
                        projectName: currentProject.projectName,
                    };
                    if (quickStagingLoginRequest !== 'true') {
                        const proj = list.find((proj) => proj.projectId === currentProjectId);
                        const imgArr = Object.keys(proj.projectImages);
                        const set = imgArr.length > 0;
                        const id = imgArr[0] || '';
                        dispatch(initBackground({set, id}));
                        dispatch(updateProjectUiSettings(currentProjectId)).then(() => {
                            dispatch(setProjectInfo({
                                ...projectInfo,
                                hasLogin: true,
                            }));
                            handleProjectUiSettingsInit();
                        }).catch(e => {
                            console.log(e);
                            dispatch(setProjectInfo({
                                ...projectInfo,
                                hasLogin: true,
                            }));
                        });
                        if (settings.shouldHelpDialogPopUp.meshTopology || typeof settings.shouldHelpDialogPopUp === 'undefined') {
                            dispatch(openGuidelineDialog());
                        }
                    } else {
                        // if (history.location.pathname !== '/') {
                        //     history.replace('/');
                        // }

                        if (settings.shouldHelpDialogPopUp.quickStaging || typeof settings.shouldHelpDialogPopUp === 'undefined') {
                            dispatch(openGuidelineDialog());
                        }
                        dispatch(setProjectInfo({
                            ...projectInfo,
                            hasLogin: false,
                        }));
                        quickStagingLoginFunc(projectInfo);
                    }
                } else {
                    Cookies.remove('projectId');
                    Cookies.remove('quickStagingLoginRequest');
                    dispatch(toggleLockLayer(false));
                    const landingViewOnCookie =  Cookies.get('landingView');
                    if (landingViewOnCookie) {
                        dispatch(changeOnView(landingViewOnCookie));
                    } else {
                        dispatch(changeOnView('welcome'));
                        Cookies.remove('landingView');
                    }
                }
                setInit(false);
            }).catch((e) => { console.log(e); });
        }).catch(e => console.log(e));

        Cookies.remove('newSession');
    };

    const handleOnViewChanges = () => {
        if (init) return;

        const quickStagingLoginRequest = Cookies.get('quickStagingLoginRequest');
        if (quickStagingLoginRequest === 'true') {
            if (onView === '') {
                quickStagingLoginFunc({projectId});
            } else {
                stopLoginTimeout();
            }
        }
        if (onView === 'list') {
            dispatch(updateProjectList()).catch(e => console.log(e) );
        }
    };

    const setInitShowTour = () => {
        setDontShow(!shouldHelpDialogPopUp.project);
    };

    const handleChangeToStaging = () => {
        dispatch(updateProjectList()).then((res) => {
            const stagingProj = res.find(proj => proj.projectName === quickStagingName);
            const createStagingProj = () => {
                createProject(csrf, {managementIp: quickStagingIp, projectName: quickStagingName}).then((res) => {
                    Cookies.set('projectId', res.projectId);
                    Cookies.set('quickStagingLoginRequest', true);

                    // history.push('/');
                    // window.location.reload();
                    // window.nw.Window.get().reloadIgnoringCache();
                    window.location.assign(`${window.location.origin}/index.html`);
                });
            }
            if (stagingProj) {
                deleteProject(csrf, stagingProj.projectId).then(() => {
                    createStagingProj();
                }).catch(e => console.log(e));
            } else {
                createStagingProj();
            }
        }).catch(e => console.log(e) );
    };

    const handleChangeToStagingAction = () => {
        if (changeToStaging) {
            handleChangeToStaging();
        }
    }

    useEffect(didmountFunc, []);
    useEffect(handleOnViewChanges, [onView]);
    useEffect(setInitShowTour, [shouldHelpDialogPopUp.project]);
    useEffect(handleChangeToStagingAction, [changeToStaging]);

    // ---- welcome dialog handling function ----
    const welcomeHandleLogout = () => {
        logoutAnm(csrf).then(() => {
            // Cookies.remove('projectId');
            // Cookies.remove('quickStagingLoginRequest');

            // window.location.reload();
            // window.nw.Window.get().reloadIgnoringCache();
            history.push('/login');
            window.location.assign(`${window.location.origin}/index.html`);
            // history.replace('/index.html/login');
        }).catch(() => { /* handled in apiCall */ });
    }

    const welcomeHandleClose = () => {
        dispatch(changeOnView(''));
    };

    const welcomeHandleClickToManagement = () => {
        if (shouldHelpDialogPopUp.project) {
            dispatch(changeOnView('tour'));
        } else {
            dispatch(changeOnView('list'));
        }
    };

    const welcomeHandleClickQuickStaging = () => {
        handleChangeToStaging();
    };

    const welcomeHandleSettingsOnClick = () => {
        dispatch(openSettingsDialog());
    };

    // ---- tour dialog handling function ----
    const tourHandleCheckboxOnClick = () => {
        setDontShow(!dontShow);
    };

    const tourHandleOnClose = () => {
        if (dontShow === shouldHelpDialogPopUp.project) {
            dispatch(updateShouldHelpDialogPopUp('project', !dontShow));
            dispatch(syncUiSettings());
        }
        dispatch(changeOnView('list'));
    };

    // ---- project list dialog handling function ----
    const listHandleBackOnClick = () => {
        Cookies.remove('landingView')
        dispatch(changeOnView('welcome'));
    };

    const getProjectNameFromProjectId = (projectId) => {
        const targetProjObj = projectList.find(proj => projectId === proj.projectId);
        console.warn(targetProjObj)
        return targetProjObj ? targetProjObj.projectName : null;
    }

    const listHandleConnectOnClick = (targetProjectId) => {
        const projObj = projectList.find(proj => proj.projectId === targetProjectId);
        let savedSecret = ''
        if (secret[targetProjectId]) {
            savedSecret = secret[targetProjectId];
            setRememberSecret(true);
        } else {
            setRememberSecret(false);
        }
        setLoginStatus({
            loginProjectId: targetProjectId,
            loginProjectName: projObj.projectName,
            savedSecret,
        });
        dispatch(changeOnView('login'));
    };

    const listHandleOnClose = () => {
        dispatch(changeOnView(''));
    };

    const listHandleGuideOnClick = () => {
        dispatch(changeOnView('tour'));
    };

    const listHandleProjectRemove = (projectId) => {
        deleteProject(csrf, projectId).then(() => {
            dispatch(updateProjectList());
        }).catch(e => console.log(e));
    };

    const listHandleProjectEdit = (projectId, body) => {
        updateProject(csrf, projectId, body).then(() => {
            dispatch(updateProjectList());
        }).catch(e => console.log(e));
    };

    const listHandleProjectAdd = (body) => {
        createProject(csrf, body).then(() => {
            dispatch(updateProjectList());
        }).catch(e => console.log(e));
    };

    const listHandleProjectBackupRestoreOpen = () => {
        dispatch(openProjectBackupRestore());
    };

    // ---- login dialog handling function ----
    const loginHandleRememberOnClick = () => {
        setRememberSecret(!rememberSecret);
    };

    const loginHandleBackOnClick = () => {
        dispatch(changeOnView('list'));
        setRememberSecret(false);
        setLoginStatus({
            loginProjectId: '',
            loginProjectName: '',
            savedSecret: '',
        });
    };

    const loginSuccessAction = (targetId, targetName, secret) => {
        Cookies.remove('quickStagingLoginRequest');
       
        // if (rememberSecret) { always remember secret #8539
        dispatch(updateRememberSecret({[targetId]: secret}));
        dispatch(syncUiSettings());
        // }
        Cookies.set('projectId', targetId);
        // Save anyway for auto login (#8539)
        Cookies.set('projectHimitsu', secret);
        // change arbitrary view to close the dialog (ProjectEleWrapper)
        dispatch(changeOnView('mesh'));
        // update redux state variable
        dispatch(setProjectInfo({
            projectId: targetId,
            projectName: targetName,
            hasLogin: true,
        }));
        return;
    };

    const loginHandleLoginOnClick = async (loginSecret, manualLoginProjectId = null, manualLoginProjectName = null) => {
        dispatch(toggleLockLayer(true));
        let { loginProjectId, loginProjectName } = loginStatus;
        
        if (manualLoginProjectId && manualLoginProjectName) {
            // For node is logging in auto login #8539
            loginProjectId = manualLoginProjectId;
            loginProjectName = manualLoginProjectName;
        }

        let retryPing = 0;
        const pingHostNodeFn = (retryPing) => {
            return pingHostNode(csrf, loginProjectId).then(() => {
                // return;
                return loginProject(csrf, {managementSecret: loginSecret}, loginProjectId).then(() => {
                    Cookies.remove('projectId');
                    dispatch(setProjectInfo({
                        projectId: '',
                        projectName: '',
                        hasLogin: false,
                    }));
                    if (location === 'US') {
                        const successAct = () => {
                            loginSuccessAction(loginProjectId, loginProjectName, loginSecret);
                        };
                        return checkProjectCountry(loginProjectId, successAct);
                    } else {
                        console.warn(loginProjectId)
                        console.warn(loginProjectName);
                        loginSuccessAction(loginProjectId, loginProjectName, loginSecret);
                        return true;
                    }
                }).catch((e) => {
                    if (!e.state) e.state = 'login';
                    throw  e;
                }).finally(() => {
                    dispatch(toggleLockLayer(false));
                })
            }).catch((e) => {
                retryPing++;
                if (retryPing > 1) {
                    if (!e.state) e.state = 'ping';
                        dispatch(toggleLockLayer(false));
                        throw e;
                } else {
                    return pingHostNodeFn(retryPing);
                }
            });
        }
        return pingHostNodeFn(retryPing);
    };

    // ---- save project dialog handling function ----
    const saveHandleSaveAs = async (name) => {
        const body = {newProjectName: name};
        return updateProject(csrf, projectId, body).then(() => {
            return loginProject(csrf, {managementSecret: defaultManagementSecret}, projectId).then(() => {
                // debugger;
                dispatch(updateProjectList());
                dispatch(changeOnView(''));
                dispatch(setProjectInfo({projectName: name}));
            }).catch((e) => { throw e; });
        }).catch((e) => { throw e; });
    };

    const saveHandleCancel = () => {
        dispatch(changeOnView(''));
    };

    const saveHandleLoginFail = () => {
        Cookies.remove('projectId');
        Cookies.remove('quickStagingLoginRequest');
        dispatch(setProjectInfo({
            projectName: '',
            projectId: '',
            hasLogin: false,
        }));
        dispatch(changeOnView('list'));
        dispatch(toggleLockLayer(false));
    };

    return {
        state: {
            onView,
            hasLogin: projectId !== '',
            dontShow,
            projectList,
            currentProjectId: projectId,
            rememberSecret,
            projectName: loginStatus.loginProjectName,
            savedSecret: loginStatus.savedSecret,
        },
        handler: {
            welcome: {
                welcomeHandleLogout,
                welcomeHandleClose,
                welcomeHandleClickToManagement,
                welcomeHandleClickQuickStaging,
                welcomeHandleSettingsOnClick,
            },
            tour: {
                tourHandleCheckboxOnClick,
                tourHandleOnClose,
            },
            list: {
                listHandleBackOnClick,
                listHandleConnectOnClick,
                listHandleGuideOnClick,
                listHandleProjectRemove,
                listHandleProjectEdit,
                listHandleProjectAdd,
                listHandleOnClose,
                listHandleProjectBackupRestoreOpen,
            },
            login: {
                loginHandleRememberOnClick,
                loginHandleBackOnClick,
                loginHandleLoginOnClick,
            },
            save: {
                saveHandleSaveAs,
                saveHandleCancel,
                saveHandleLoginFail,
            },
            common: {
                getProjectNameFromProjectId,
            }
        },
        backupRestoreDialog,
        dialog: {
            open: dialog.open,
            actionFn: () => {
                saveHandleLoginFail();
                setDialog({open: false});
                dispatch(setAutoLoginDialogData('', '', false));
            },
        },
    };
};

export default useProjectManager;