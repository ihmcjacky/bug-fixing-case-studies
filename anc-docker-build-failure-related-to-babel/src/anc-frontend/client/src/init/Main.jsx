import React, {useEffect, useState} from 'react';
import {useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import Cookies from 'js-cookie';
import MainRouter from './MainRouter';
import InitFailPage from './InitFailPage';
import InitLoading from './InitLoading';
import {setInitData, setHostInfo} from '../redux/common/commonActions';
import {initDevSettings} from '../redux/devMode/devModeActions';
import {getInitData, logoutAnm} from '../util/apiCall';
import {initI18n, changeLang} from '../I18n';

/**
 * Main componment. All the ANM componments will render under this wrapper.
 *
 * The main feature of this componment is to settup init data and check the path is valid.
 * Render the following ANM componments only 'get-init-data' success.
 */
function Main() {
    const dispatch = useDispatch();
    const history = useHistory();

    const [state, setState] = useState({
        init: true,
        success: false,
        error: '',
    });

    /**
     * Check the entry path is valid or not
     * After checking, the path must be `/login` or `/mesh/...`
     * @param {bool} loggedin bool reponse from django server
     */
    const pathChecker = (loggedin) => {
        console.log('window.location');
        console.log(window.location.href);

        const pathname = window.location.hash;
        console.log(pathname);
        // const pathOfLogin = pathname === '/login' || (/^[/]login[/]/).test(pathname);
        // const pathOfMesh = pathname === '/mesh' || (/^[/]mesh[/]/).test(pathname)

        const pathOfLogin = pathname === '/login' || (/^[/]login[/]/).test(pathname);
        const pathOfMesh = pathname === '/mesh' || (/^[/]mesh[/]/).test(pathname);

        const quickStagingLoginRequest = Cookies.get('quickStagingLoginRequest');

        if (pathOfLogin && loggedin) {
            console.log('pathOfLogin && loggedin');
            history.replace('/mesh');
            // history.replace({
            //     pathname: '/index.html',
            //     hash: '/mesh'
            // });
        } else if (pathOfMesh && loggedin && quickStagingLoginRequest === 'true') {
            console.log('pathOfMesh && loggedin && quickStagingLoginRequest === true');
            history.replace('/mesh');
            // history.replace({
            //     pathname: '/index.html',
            //     hash: '/mesh'
            // });
        } else if (pathOfMesh && !loggedin) {
            console.log('pathOfMesh && !loggedin');
            history.push('/login');
            // history.replace({
            //     pathname: '/index.html',
            //     hash: '/login'
            // });
        } else if (!pathOfLogin && !pathOfMesh) {
            console.log('!pathOfLogin && !pathOfMesh');
            if (loggedin) {
                history.replace('/mesh');
                // history.replace({
                //     pathname: '/index.html',
                //     hash: '/mesh'
                // });
            } else {
                history.push('/login');
                // history.replace({
                //     pathname: '/index.html',
                //     hash: '/login'
                // });
            }
        } else if (pathOfMesh) {
            console.log('pathOfMesh');
            if (pathname !== '/mesh/config' &&
                pathname !== '/mesh/maintenance' &&
                pathname !== '/mesh') {
                console.log('not all');
                history.replace('/mesh');
                // history.replace({
                //     pathname: '/index.html',
                //     hash: '/mesh'
                // });
            }
        }
        console.log('window.location check');
        console.log(window.location.href);
    };

    const removeAllNodeDataInCookies = () => {
        const allCookies = Cookies.get();
        Object.keys(allCookies).forEach((key) => {
            if (key.includes('allRecognizeNodes') || key.includes('unrecognizeNodes') || key.includes('newUmanagedDeviceNotiList')) {
                Cookies.remove(key);
            }
        });
    };

    const initDevModeSettings = (loggedin) => {
        let enableBoundlessConfig = false;
        let enableDebugCountry = false;
        let enableBatchFwUpgrade = true;
        let enableWatchdogConfig = false;
        let enableExportAnmRawLog = false;
        let enableGraphicSettings = false;

        if (loggedin) {
            enableBoundlessConfig = Cookies.get('enableBoundlessConfigDev') === 'true';
            enableDebugCountry = Cookies.get('enableDebugCountryDev') === 'true';
            enableWatchdogConfig = Cookies.get('enableWatchdogConfigDev') === 'true';
            enableExportAnmRawLog = Cookies.get('enableExportAnmRawLogTitle') === 'true';
            enableGraphicSettings = Cookies.get('enableGraphicSettingsDev') === 'true';

            const batchFwUpgradeCookie = Cookies.get('enableBatchFwUpgradeDev');
            enableBatchFwUpgrade = typeof batchFwUpgradeCookie === 'undefined' ? true : batchFwUpgradeCookie === 'true';
        }

        dispatch(initDevSettings({
            enableBoundlessConfig,
            enableDebugCountry,
            enableBatchFwUpgrade,
            enableWatchdogConfig,
            enableExportAnmRawLog,
            enableGraphicSettings,
        }));
    };

    const loadInitData = () => {
        setState({
            ...state,
            init: true,
        });
        getInitData().then((res) => {
            const {
                hasUser,
                loggedinAnm,
                lang,
                env,
                fullAppName,
                companyName,
                appLabel,
                fwLabel,
            } = res;
            const csrfToken = Cookies.get('csrftoken');
            initI18n(lang);
            // if (lang !== 'en') {
            //     console.log('changeLang');
            //     changeLang(lang);
            // }
            const needLogin = Cookies.get('needLoginAfterRegister');
            const loggedin = needLogin ? false : loggedinAnm;

            pathChecker(loggedin);
            if (!loggedin) {
                Cookies.remove('quickStagingLoginRequest');
                Cookies.remove('projectId');
                Cookies.remove('enableBoundlessConfigDev');
                Cookies.remove('enableDebugCountryDev');
                Cookies.remove('enableBatchFwUpgradeDev');
                Cookies.remove('enableWatchdogConfig');
                Cookies.remove('enableExportAnmRawLog');
                Cookies.remove('enableGraphicSettingsDev');
                Cookies.set('newSession', true);
                removeAllNodeDataInCookies();
            }
            dispatch(setInitData({
                csrf: csrfToken,
                lang,
                anm: {
                    hasUser,
                    loggedin,
                },
                location: res.location,
                env,
                labels: {
                    fullAppName,
                    companyName,
                    appLabel,
                    fwLabel,
                },
            }));
            initDevModeSettings(loggedin);

            setState({
                init: false,
                success: true,
            });
        }).catch((e) => {
            if (e?.data?.type === 'errors') {
                setState({
                    init: false,
                    success: false,
                    error: e.data.data[0].type,
                });
            } else {
                setState({
                    init: false,
                    success: false,
                    error: 'unexpected error',
                });
            }
        });
    };

    const didMountFunc = () => {
        // initI18n('en');
        let hostname = process.env.REACT_APP_FRONTEND_HOSTNAME || 'localhost';
        // Use the port from environment variable, default to 3000 if not set
        console.log('process.env.REACT_APP_FRONTEND_HOSTNAME', process.env.REACT_APP_FRONTEND_HOSTNAME);
        console.log('process.env.FRONTEND_PORT', process.env.REACT_APP_FRONTEND_PORT);
        let port = parseInt(process.env.REACT_APP_FRONTEND_PORT, 10) || 3000;

        dispatch(setHostInfo(hostname, port));
        loadInitData();
    };

    useEffect(didMountFunc, []);

    if (state.success) {
        return <MainRouter />;
    } else if (!state.init && !state.success) {
        let debugFunc = () => {};
        if (process.env.NODE_ENV !== 'production') {
            debugFunc = (hostname, port) => {
                dispatch(setHostInfo(hostname, port));
            }
        }
        return (
            <InitFailPage
                loadInitData={loadInitData}
                debugFunc={debugFunc}
            />
        );
    } else {
        return (<InitLoading />);
    }
};

Main.whyDidYouRender = false;

export default Main;
