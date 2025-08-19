/**
 * @Author: mango
 * @Date:   2018-12-12T17:14:08+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-12-12T17:15:36+08:00
 */
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Trans} from 'react-i18next';
import {withRouter} from 'react-router-dom';
import Cookies from 'js-cookie';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
// import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import {
    getConfig,
    setConfig,
    getFilteredConfigOptions,
    getCachedConfig
} from '../../../util/apiCall';
import {toggleSnackBar, closeSnackbar, updateProgressBar} from '../../../redux/common/commonActions';
import {convertIpToMac} from '../../../util/formatConvertor';
import P2Dialog from '../../../components/common/P2Dialog';
import P2Tooltip from '../../../components/common/P2Tooltip';
import FormSelectCreator from '../../../components/common/FormSelectCreator';
import FormInputCreator from '../../../components/common/FormInputCreator';
import LockLayer from '../../../components/common/LockLayer';
// import BpduSettings from './BpduSettings';
import Constant from '../../../constants/common';
import {formValidator} from '../../../util/inputValidator';
import isMismatchSecret, {isUnreachedNode} from '../../../util/common';
import check from '../../../util/errorValidator';
import {openDeviceListDialog} from '../../../redux/common/commonActions';

const {timeout, colors, themeObj} = Constant;

const get = (o, p) =>
    p.reduce(
        (xs, x) =>
            ((xs && xs[x]) ?
                xs[x] : null), o);

// const deepClone = object => JSON.parse(JSON.stringify(object));

function getMeshConfigErrorData(errorArr) {
    let meshTopoObj = {};
    errorArr.some((error) => {
        if (error.type === 'getconfig_fwversion_fail') {
            meshTopoObj = {...error.data};
            return true;
        }
        return false;
    });
    return meshTopoObj;
}

function extractSourceConfig(Config) {
    const newConfig = JSON.parse(JSON.stringify(Config));


    if ('success' in Config.meshSettings) {
        if (Config.meshSettings.success) {
            newConfig.meshSettings = Config.meshSettings.data;
        } else {
            newConfig.meshSettings = getMeshConfigErrorData(Config.meshSettings.errors);
        }
    }

    Object.keys(Config.radioSettings).forEach((nodeIp) => {
        if ('success' in Config.radioSettings[nodeIp]) {
            if (Config.radioSettings[nodeIp].success) {
                newConfig.radioSettings[nodeIp] = Config.radioSettings[nodeIp].data;
            } else {
                newConfig.radioSettings[nodeIp] = {};
            }
        }
    });
    Object.keys(Config.nodeSettings).forEach((nodeIp) => {
        if ('success' in Config.nodeSettings[nodeIp]) {
            if (Config.nodeSettings[nodeIp].success) {
                newConfig.nodeSettings[nodeIp] = Config.nodeSettings[nodeIp].data;
            } else {
                newConfig.nodeSettings[nodeIp] = {};
            }
        }
    });

    return newConfig;
}

function isSupportedIntOption(option, filteredConfig) {
    if (!filteredConfig[option].data) {
        return false;
    }
    return filteredConfig[option].data.max - filteredConfig[option].data.min >= 1;
}

function createTooltip(title, tooltip1, tooltip2) {
    return (
        <span style={{
            display: 'flex',
            alignItems: 'center',
        }}
        >
            <span>{title}</span>
            <P2Tooltip
                direction="right"
                title={<span style={{
                    fontSize: '12px',
                    padding: '2px',
                    display: 'flex',
                    flexDirection: 'column',
                }}
                >
                    {tooltip1 ?
                        <span style={{display: 'flex'}}>
                            {tooltip1}
                        </span> : <span />
                    }
                    {tooltip1 ?
                        <span style={{display: 'flex', paddingTop: '10px', fontStyle: 'italic'}}>
                            {tooltip2}
                        </span> :
                        <span style={{display: 'flex'}}>
                            {tooltip2}
                        </span>
                    }
                </span>}
                content={(<i
                    className="material-icons"
                    style={{
                        color: themeObj.primary.light,
                        fontSize: '20px',
                        marginLeft: '5px',
                        marginTop: '-1px',
                    }}
                >help</i>)}
            // key={radioName}
            />
        </span>
    );
}

class AdvancedSettings extends React.Component {
    constructor(props) {
        super(props);
        this.t = this.props.t;
        this.state = {
            dialog: {
                open: false,
                title: '',
                content: '',
                submitButton: this.props.t('dialogSubmitLbl'),
                submitAction: this.handleDialogOnClose,
                cancelButton: '',
                cancelAction: this.handleDialogOnClose,
            },
            filteredConfig: {
                bpduFilter: {
                    type: '',
                    data: [],
                },
                country: [],
                globalDiscoveryInterval: {},
                globalHeartbeatInterval: {},
                globalHeartbeatTimeout: {},
                globalStaleTimeout: {},
                globalRoamingRSSIMargin: {},
                globalAllowActiveLinkDrop: {
                    type: '',
                    data: [],
                },
                globalLinkMetric: {
                    type: '',
                    data: [],
                },
            },
            loadData: {
                encryptKey: '',
                clusterId: '',
                managementIp: '',
                managementNetmask: '',
                country: 'HK',
                bpduFilter: 'disable',
                globalDiscoveryInterval: 0,
                globalHeartbeatInterval: 0,
                globalHeartbeatTimeout: 0,
                globalStaleTimeout: 0,
                globalRoamingRSSIMargin: 0,
                e2eEnc: '',
                e2eEncKey: '',
                globalTimezone: '',
                globalAllowActiveLinkDrop: 'disable',
                globalLinkMetric: 'rssi',
            },
            formData: {
                encryptKey: '',
                clusterId: '',
                managementIp: '',
                managementNetmask: '',
                country: 'HK',
                bpduFilter: 'disable',
                globalDiscoveryInterval: 0,
                globalHeartbeatInterval: 0,
                globalHeartbeatTimeout: 0,
                globalStaleTimeout: 0,
                globalRoamingRSSIMargin: 0,
                e2eEnc: '',
                e2eEncKey: '',
                globalTimezone: '',
                globalAllowActiveLinkDrop: 'disable',
                globalLinkMetric: 'rssi',
            },
            errorStatus: {
                bpduFilter: false,
                globalRoamingRSSIMargin: false,
                globalDiscoveryInterval: false,
                globalHeartbeatInterval: false,
                globalHeartbeatTimeout: false,
                globalStaleTimeout: false,
                globalAllowActiveLinkDrop: false,
                globalLinkMetric: false,
            },
            statusText: {
                // bpduFilter: this.t('inputObj.', {returnObjects: true}).bpduFilter.helperText,
                // globalRoamingRSSIMargin: this.t('inputObj', {returnObjects: true}).globalRoamingRSSIMargin.helperText,
                // globalDiscoveryInterval: this.t('inputObj', {returnObjects: true}).globalDiscoveryInterval.helperText,
                // globalHeartbeatInterval: this.t('inputObj', {returnObjects: true}).globalHeartbeatInterval.helperText,
                // globalHeartbeatTimeout: this.t('inputObj', {returnObjects: true}).globalHeartbeatTimeout.helperText,
                // globalStaleTimeout: this.t('inputObj', {returnObjects: true}).globalStaleTimeout.helperText,
                bpduFilter: this.t('inputObj.bpduFilter.helperText'),
                globalRoamingRSSIMargin: this.t('inputObj.globalRoamingRSSIMargin.helperText'),
                globalDiscoveryInterval: this.t('inputObj.globalDiscoveryInterval.helperText'),
                globalHeartbeatInterval: this.t('inputObj.globalHeartbeatInterval.helperText'),
                globalHeartbeatTimeout: this.t('inputObj.globalHeartbeatTimeout.helperText'),
                globalStaleTimeout: this.t('inputObj.globalStaleTimeout.helperText'),
                globalAllowActiveLinkDrop: this.t('inputObj.globalAllowActiveLinkDrop.helperText'),
                globalLinkMetric: this.t('inputObj.globalLinkMetric.helperText'),
            },
            formStatus: {
                bpduFilter: true,
                globalRoamingRSSIMargin: true,
                globalDiscoveryInterval: true,
                globalHeartbeatInterval: true,
                globalHeartbeatTimeout: true,
                globalStaleTimeout: true,
                globalAllowActiveLinkDrop: true,
                globalLinkMetric: true,
            },
            hash: {},
            discrepancies: [],
            isLock: true,
            isPartialLock: true,
            legacySyncValue: {},
            // showBanner: false,
        };

        const fnNames = [
            'handleDialogOnClose',
            'handlePartialLock',
            'handleLock',
            'notLoggedInHandle',
            'getMeshConfig',
            'updateFilterConfig',
            'validateEnumOption',
            'validateIntOption',
            'validateHeartbeatTimeout',
            'validateHeartbeatInterval',
            'validateStaleTimeout',
            'updateMeshForm',
            'updateDiscrepancies',
            'clickSync',
            'handleGetMeshError',
            'handleSecretMismatch',
            'onLogout',
            'onReturn',
            'onFailReturn',
            'onFail',
            'setDialog',
            'handleChange',
            'triggerFormStatus',
            'clickReset',
            'clickSave',
            'saveProcess',
            'saveSuccessHandler',
            'saveProcessError',
            'checkLegacy',
            'parseDiscrepacyList',
            'parseLegacyDiscrepancyList',
            'getDiffObj',
        ];

        window.__.each(fnNames, (fnName) => {
            this[fnName] = this[fnName].bind(this);
        });
    }

    componentDidMount() {
        Cookies.set('meshConfigActiveTab', 3);
        this.mounted = true;
        const notLoggedIn = Cookies.get('notLoggedinToMeshTopology');
        const projectID = Cookies.get('projectID');

        if (projectID === '__staging' && notLoggedIn === 'true') {
            this.notLoggedInHandle();
        } else {
            this.getMeshConfig(true, false);
            this.props.handleLock(this.handleLock);
            this.props.handleSync(this.clickSync);
            // this.props.onLoadingAct(false);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
        this.props.dispatch(closeSnackbar());
    }

    onLogout() {
        const dialog = {
            open: true,
            title: this.t('invalidMgmtSecretTitle'),
            content: this.t('invalidMgmtSecretContent'),
            submitButton: this.t('invalidMgmtSecretAction'),
            submitAction: () => {
                Cookies.remove('projectId');
                // const currentOrigin = window.location.origin;
                // window.location.replace(`${currentOrigin}/mesh/`);
                window.location.assign(`${window.location.origin}/index.html`);
            },
            cancelButton: '',
            cancelAction: this.handleDialogOnClose,
        };
        this.setState({
            ...this.state,
            dialog,
        });
    }

    onReturn() {
        const dialog = {
            open: true,
            title: this.t('headNodeUnreachableTitle'),
            content: this.t('headNodeUnreachableCtx'),
            submitButton: this.t('backClusterTopo'),
            submitAction: () => {
                // const currentOrigin = window.location.origin;
                // window.location.replace(`${currentOrigin}/mesh/`);
                // this.props.history.push('/mesh');
                window.location.assign(`${window.location.origin}/index.html`);
                // this.props.history.push({
                //     pathname: '/index.html',
                //     hash: '/'
                // });
            },
            cancelButton: '',
            cancelAction: this.handleDialogOnClose,
        };
        this.setState({
            ...this.state,
            dialog,
        });
    }

    onFailReturn() {
        const dialog = {
            open: true,
            title: this.t('headNodeUnreachableFailTitle'),
            content: this.t('headNodeUnreachableFailCtx'),
            submitButton: this.t('backClusterTopo'),
            submitAction: () => {
                // const currentOrigin = window.location.origin;
                // window.location.replace(`${currentOrigin}/mesh/`);
                window.location.assign(`${window.location.origin}/index.html`);
                // this.props.history.push('/');
                // this.props.history.push({
                //     pathname: '/index.html',
                //     hash: '/'
                // });
            },
            cancelButton: '',
            cancelAction: this.handleDialogOnClose,
        };
        this.setState({
            ...this.state,
            dialog,
        });
    }

    onFail() {
        const dialog = {
            open: true,
            title: this.t('remoteNodeUnreachableFailTitle'),
            content: this.t('remoteNodeUnreachableFailCtx'),
            submitButton: this.t('dialogSubmitLbl'),
            submitAction: () => {
                this.setState({
                    ...this.state,
                    dialog: {
                        ...this.state.dialog,
                        open: false,
                    },
                    isPartialLock: false,
                },
                () => {
                    this.getMeshConfig(true, false);
                }
                );
            },
            cancelButton: '',
            cancelAction: this.handleDialogOnClose,
        };
        this.setState({
            ...this.state,
            dialog,
        });
    }

    getDiffObj() {
        const diffObj = {};
        Object.keys(this.state.loadData).forEach((optName) => {
            if (optName === 'encryptKey') {
                if (this.state.loadData[optName] !== this.state.formData[optName]) {
                    diffObj.encKey = this.state.formData[optName];
                }
            } else if (this.state.loadData[optName] !== this.state.formData[optName]) {
                if (
                    optName === 'globalDiscoveryInterval' ||
                    optName === 'globalHeartbeatInterval' ||
                    optName === 'globalHeartbeatTimeout' ||
                    optName === 'globalStaleTimeout' ||
                    optName === 'globalRoamingRSSIMargin') {
                    diffObj[optName] = Number(this.state.formData[optName]);
                } else if (optName !== 'globalLinkMetric'){
                    diffObj[optName] = this.state.formData[optName];
                }
            }
        });
        return Object.keys(diffObj).length === 0 ? false : diffObj;
    }

    setDialog(dialog) {
        this.setState({
            ...this.state,
            dialog,
        });
    }

    async getMeshConfig(needPopup, partial) {
        const {csrf, dispatch, projectId} = this.props;
        const bodyMsg1 = {allNodes: true};
        const bodyMsg2 = {
            options: {
                meshSettings: [
                    'bpduFilter',
                    'country',
                    'encKey',
                    'e2eEnc',
                    'e2eEncKey',
                    'globalDiscoveryInterval',
                    'globalHeartbeatInterval',
                    'globalHeartbeatTimeout',
                    'globalStaleTimeout',
                    'globalRoamingRSSIMargin',
                    'globalTimezone',
                    'globalAllowActiveLinkDrop',
                    'globalLinkMetric',
                ],
            },
            sourceConfig: {},
        };
        if (!partial) {
            dispatch(toggleSnackBar(this.t('retrieveMeshObjSnackbar')));
        }
        try {
            const {
                allNodesReachable,
                hostNodesReachable,
            } = await this.props.checkIfAllNodesReachable(false);
            const remoteNodeUnreachable = !allNodesReachable && hostNodesReachable
            const value = await getCachedConfig(csrf, projectId === '' ? Cookies.get('projectId') : projectId, bodyMsg1);
            if (this.mounted) {
                const {checksums, ...Setting} = value;
                bodyMsg2.sourceConfig = extractSourceConfig(JSON.parse(JSON.stringify(Setting)));
                try {
                    const filterConfig = await getFilteredConfigOptions(csrf,
                        projectId === '' ? Cookies.get('projectId') : projectId, bodyMsg2);
                    console.log('-----filterConfig-----');
                    console.log(filterConfig);
                    if (!this.mounted) {
                        return;
                    }
                    this.updateFilterConfig(filterConfig.meshSettings);
                    this.updateMeshForm(value, false);
                    if (remoteNodeUnreachable) {
                        this.timer = setTimeout(() => {
                            this.getMeshConfig(false, true);
                        }, timeout.error);
                    }
                } catch (err) {
                    if (!this.mounted) {
                        return;
                    }
                    if (err.message === 'P2Error') {
                        console.log('getFilteredConfigOptionsError', err.data);
                        const {title, content} = check(err);
                        const dialog = title !== '' ?
                            {
                                open: true,
                                title,
                                content,
                                submitButton: this.t('getOptionFailBtnLbl1'),
                                submitAction: () => {
                                    // const currentOrigin = window.location.origin;
                                    // window.location.replace(`${currentOrigin}/mesh/`);
                                    // this.props.history.push('/');
                                    window.location.assign(`${window.location.origin}/index.html`);
                                    // this.props.history.push({
                                    //     pathname: '/index.html',
                                    //     hash: '/'
                                    // });
                                },
                                cancelButton: this.t('getOptionFailBtnLbl2'),
                                cancelAction: () => {
                                    this.handleDialogOnClose();
                                    this.getMeshConfig(true, false);
                                },
                            } :
                            {
                                open: true,
                                title: this.t('getOptionFailTitle'),
                                content: this.t('getOptionFailContent'),
                                submitButton: this.t('getOptionFailBtnLbl1'),
                                submitAction: () => {
                                    // const currentOrigin = window.location.origin;
                                    // window.location.replace(`${currentOrigin}/mesh/`);
                                    // this.props.history.push('/');
                                    window.location.assign(`${window.location.origin}/index.html`);
                                    // this.props.history.push({
                                    //     pathname: '/index.html',
                                    //     hash: '/'
                                    // });
                                },
                                cancelButton: this.t('getOptionFailBtnLbl2'),
                                cancelAction: () => {
                                    this.handleDialogOnClose();
                                    this.getMeshConfig(true, false);
                                },
                            };
                        if (err.data.type === 'specific') {
                            const filterConfigErrors = get(err.data.data, ['meshSettings', 'errors', 0, 'type']);
                            if (filterConfigErrors === 'partialretrieve') {
                                this.updateFilterConfig(get(err.data.data, ['meshSettings', 'errors', 0, 'data']));
                                this.updateMeshForm(value, false);
                            } else {
                                this.setState({
                                    ...this.state,
                                    isPartialLock: false,
                                    dialog,
                                });
                            }
                        } else {
                            this.setState({
                                ...this.state,
                                isPartialLock: false,
                                dialog,
                            });
                        }
                    }
                }
            }
        } catch (err) {
            if (this.mounted) {
                this.handleGetMeshError(err, needPopup);
            }
        }
    }

    async handleGetMeshError(error, needPopup) {
        const {csrf, dispatch, projectId} = this.props;
        const mismatchSecret = isMismatchSecret(error, 'getconfig');
        const unreachedNode = isUnreachedNode(error);
        const bodyMsg2 = {
            options: {
                meshSettings: [
                    'bpduFilter',
                    'country',
                    'encKey',
                    'e2eEnc',
                    'e2eEncKey',
                    'globalDiscoveryInterval',
                    'globalHeartbeatInterval',
                    'globalHeartbeatTimeout',
                    'globalStaleTimeout',
                    'globalRoamingRSSIMargin',
                    'globalTimezone',
                    'globalAllowActiveLinkDrop',
                    'globalLinkMetric',
                ],
            },
            sourceConfig: {},
        };
        // show finish message and hide
        if (mismatchSecret === 'mismatch') {
            dispatch(toggleSnackBar(this.t('retrieveMeshObjFailSnackbar')));
            this.handleSecretMismatch();
            if (this.mounted) {
                this.timer = setTimeout(() => {
                    dispatch(closeSnackbar());
                    if (!mismatchSecret) {
                        this.getMeshConfig();
                    }
                }, timeout.error);
            }
        } else if (mismatchSecret === 'logout') {
            dispatch(toggleSnackBar(this.t('retrieveMeshObjFailSnackbar')));
            this.onLogout();
            if (this.mounted) {
                this.timer = setTimeout(() => {
                    dispatch(closeSnackbar());
                    if (!mismatchSecret) {
                        this.getMeshConfig();
                    }
                }, timeout.error);
            }
        } else if (unreachedNode === 'headNodeUnreachable') {
            this.onReturn();
        } else {
            dispatch(toggleSnackBar(this.t('retrieveMeshObjPartialSnackbar')));
            // hide the notification
            if (error.message === 'P2Error' &&
            typeof error.data.data.checksums !== 'undefined') {
                console.log(error.data.data);
                const {checksums, ...Setting} = error.data.data;
                if (Object.keys(Setting.meshSettings).length === 0) {
                    throw new Error('Host Node is unmanaged');
                }
                bodyMsg2.sourceConfig = extractSourceConfig(JSON.parse(JSON.stringify(Setting)));
                try {
                    const filterConfig = await getFilteredConfigOptions(csrf,
                        projectId === '' ? Cookies.get('projectId') : projectId, bodyMsg2);
                    if (!this.mounted) {
                        return;
                    }
                    if (needPopup) {
                        const {title, content} = check(error);
                        const dialog = title !== '' ?
                            {
                                open: true,
                                title,
                                content,
                                nonTextContent: <span />,
                                submitButton: this.t('dialogSubmitLbl'),
                                submitAction: this.handleDialogOnClose,
                                cancelButton: '',
                                cancelAction: this.handleDialogOnClose,
                            } :
                            {
                                open: true,
                                title: this.t('getMeshFailTitle'),
                                content: this.t('getMeshFailContent', this.props.labels),
                                nonTextContent: <span />,
                                submitButton: this.t('dialogSubmitLbl'),
                                submitAction: this.handleDialogOnClose,
                                cancelButton: '',
                                cancelAction: this.handleDialogOnClose,
                            };
                        this.setState({
                            ...this.state,
                            dialog,
                        });
                    }
                    console.log('-----filterConfig(success)-----');
                    this.updateFilterConfig(filterConfig.meshSettings);
                    let meshTopoObj = {};
                    if (error.data.data.meshSettings.success) {
                        meshTopoObj = {
                            meshSettings: {...error.data.data.meshSettings.data},
                        };
                    } else {
                        meshTopoObj = {
                            meshSettings: getMeshConfigErrorData([...error.data.data.meshSettings.errors]),
                        };
                    }
                    this.updateMeshForm(meshTopoObj, true);
                } catch (err) {
                    if (!this.mounted) {
                        return;
                    }
                    const dialog = {
                        open: true,
                        title: this.t('getOptionFailTitle'),
                        content: this.t('getOptionFailContent'),
                        submitButton: this.t('getOptionFailBtnLbl1'),
                        submitAction: () => {
                            // const currentOrigin = window.location.origin;
                            // window.location.replace(`${currentOrigin}/mesh/`);
                            // this.props.history.push('/');
                            window.location.assign(`${window.location.origin}/index.html`);
                            // this.props.history.push({
                            //     pathname: '/index.html',
                            //     hash: '/'
                            // });
                        },
                        cancelButton: this.t('getOptionFailBtnLbl2'),
                        cancelAction: () => {
                            this.handleDialogOnClose();
                            this.getMeshConfig(true, false);
                        },
                    };
                    if (err.message === 'P2Error') {
                        if (err.data.type === 'specific') {
                            const filterConfigErrors = get(err.data.data, ['meshSettings', 'errors', 0, 'type']);
                            if (filterConfigErrors === 'partialretrieve') {
                                if (needPopup) {
                                    const popUpDialog = {
                                        open: true,
                                        title: this.t('getMeshFailTitle'),
                                        content: this.t('getMeshFailContent', this.props.labels),
                                        nonTextContent: <span />,
                                        submitButton: this.t('dialogSubmitLbl'),
                                        submitAction: this.handleDialogOnClose,
                                        cancelButton: '',
                                        cancelAction: this.handleDialogOnClose,
                                    };
                                    this.setState({
                                        ...this.state,
                                        dialog: popUpDialog,
                                    });
                                }
                                this.updateFilterConfig(get(err.data.data, ['meshSettings', 'errors', 0, 'data']));
                                let meshTopoObj = {};
                                if (error.data.data.meshSettings.success) {
                                    meshTopoObj = {
                                        meshSettings: {...error.data.data.meshSettings.data},
                                    };
                                } else {
                                    meshTopoObj = {
                                        meshSettings: getMeshConfigErrorData([...error.data.data.meshSettings.errors]),
                                    };
                                }
                                this.updateMeshForm(meshTopoObj, true);
                            } else {
                                this.setState({
                                    ...this.state,
                                    isLock: false,
                                    dialog,
                                    isPartialLock: false,
                                });
                            }
                        } else {
                            this.setState({
                                ...this.state,
                                isLock: false,
                                dialog,
                                isPartialLock: false,
                            });
                        }
                    }
                }
            } else {
                if (needPopup) {
                    const {title, content} = check(error);
                    const dialog = title !== '' ?
                        {
                            open: true,
                            title,
                            content,
                            nonTextContent: <span />,
                            submitButton: this.t('dialogSubmitLbl'),
                            submitAction: this.handleDialogOnClose,
                            cancelButton: '',
                            cancelAction: this.handleDialogOnClose,
                        } :
                        {
                            open: true,
                            title: this.t('getMeshFailTitle'),
                            content: this.t('getMeshFailContent', this.props.labels),
                            nonTextContent: <span />,
                            submitButton: this.t('dialogSubmitLbl'),
                            submitAction: this.handleDialogOnClose,
                            cancelButton: '',
                            cancelAction: this.handleDialogOnClose,
                        };
                    this.setState({
                        ...this.state,
                        dialog,
                    });
                }
                this.timer = setTimeout(() => {
                    this.getMeshConfig(false, true);
                }, timeout.error);
            }
        }
    }

    handleSecretMismatch() {
        const dialog = {
            open: true,
            title: this.t('invalidSecretTitle'),
            content: this.t('invalidSecretContent'),
            submitButton: this.t('invalidSubmitLbl'),
            submitAction: () => {
                // Cookies.set('openManagedDeviceList', true);
                // const currentOrigin = window.location.origin;
                // window.location.replace(`${currentOrigin}/mesh/`);
                this.props.dispatch(openDeviceListDialog());
                // this.props.history.push('/');
                window.location.assign(`${window.location.origin}/index.html`);
                // this.props.history.push({
                //     pathname: '/index.html',
                //     hash: '/'
                // });
            },
            cancelButton: '',
            cancelAction: this.handleDialogOnClose,
        };
        this.setState({
            ...this.state,
            dialog,
        });
    }

    clickReset() {
        this.setState({
            ...this.state,
            errorStatus: {
                ...this.state.errorStatus,
                bpduFilter: false,
                globalRoamingRSSIMargin: false,
                globalDiscoveryInterval: false,
                globalHeartbeatInterval: false,
                globalHeartbeatTimeout: false,
                globalStaleTimeout: false,
                globalAllowActiveLinkDrop: false,
                globalLinkMetric: false,
            },
            formData: this.state.loadData,
            statusText: {
                ...this.state.statusText,
                // bpduFilter: this.t('inputObj', {returnObjects: true}).bpduFilter.helperText,
                // globalRoamingRSSIMargin: this.t('inputObj', {returnObjects: true}).globalRoamingRSSIMargin.helperText,
                // globalDiscoveryInterval: this.t('inputObj', {returnObjects: true}).globalDiscoveryInterval.helperText,
                // globalHeartbeatInterval: this.t('inputObj', {returnObjects: true}).globalHeartbeatInterval.helperText,
                // globalHeartbeatTimeout: this.t('inputObj', {returnObjects: true}).globalHeartbeatTimeout.helperText,
                // globalStaleTimeout: this.t('inputObj', {returnObjects: true}).globalStaleTimeout.helperText,
                bpduFilter: this.t('inputObj.bpduFilter.helperText'),
                globalRoamingRSSIMargin: this.t('inputObj.globalRoamingRSSIMargin.helperText'),
                globalDiscoveryInterval: this.t('inputObj.globalDiscoveryInterval.helperText'),
                globalHeartbeatInterval: this.t('inputObj.globalHeartbeatInterval.helperText'),
                globalHeartbeatTimeout: this.t('inputObj.globalHeartbeatTimeout.helperText'),
                globalStaleTimeout: this.t('inputObj.globalStaleTimeout.helperText'),
                globalAllowActiveLinkDrop: '',
                globalLinkMetric: '',
            },
            formStatus: {
                ...this.state.formStatus,
                bpduFilter: true,
                globalRoamingRSSIMargin: true,
                globalDiscoveryInterval: true,
                globalHeartbeatInterval: true,
                globalHeartbeatTimeout: true,
                globalStaleTimeout: true,
                globalAllowActiveLinkDrop: true,
                globalLinkMetric: true,
            },
        });
    }

    clickSave() {
        if (!this.getDiffObj()) {
            const dialog = {
                open: true,
                title: this.t('noChangesWarningTitle'),
                content: this.t('noChangesWarningContent'),
                nonTextContent: <span />,
                submitButton: this.t('dialogSubmitLbl'),
                submitAction: this.handleDialogOnClose,
                cancelButton: '',
                cancelAction: this.handleDialogOnClose,
            };
            this.setState({dialog});
        } else {
            console.log('-----clickSave-----');
            const saveConfigObj = {};
            saveConfigObj.checksums = this.state.hash;
            saveConfigObj.diff = {
                meshSettings: this.getDiffObj(),
            };

            const dialog = {};
            dialog.open = true;
            dialog.title = this.t('confirmSaveTitle');
            dialog.content =
                (
                    <span>
                        <span style={{marginBottom: '15px', display: 'block'}}>
                            <Trans
                                defaults={this.t('confirmSaveContent')}
                                components={{ bold: <strong /> }}
                            />
                        </span>
                        {this.t('confirmSaveContent2')}
                    </span>
                );
            dialog.nonTextContent = (<span />);
            dialog.submitButton = this.t('confirmSubmitLbl');
            dialog.submitAction = () => {
                this.handleDialogOnClose();
                this.saveProcess(saveConfigObj);
            };
            dialog.cancelButton = this.t('confirmCancelLbl');
            dialog.cancelAction = () => { this.handleDialogOnClose(); };
            this.setState({
                ...this.state,
                dialog,
            });
        }
    }

    updateFilterConfig(Config) {
        console.log('-----updateFilterConfig-----');
        console.log(Config);
        const filteredConfig = {};

        if (Config.encKey !== 'undefined' && Config.encKey.type === 'regex') {
            filteredConfig.encKey = Config.encKey.data;
        }
        if (Config.country !== 'undefined' && Config.country.type === 'enum') {
            filteredConfig.country = Config.country.data;
        }
        if (Config.bpduFilter !== 'undefined') {
            filteredConfig.bpduFilter = Config.bpduFilter;
        }
        if (Config.globalDiscoveryInterval !== 'undefined' && Config.globalDiscoveryInterval.type === 'int') {
            filteredConfig.globalDiscoveryInterval = Config.globalDiscoveryInterval.data;
        }
        if (Config.globalHeartbeatInterval !== 'undefined' && Config.globalHeartbeatInterval.type === 'int') {
            filteredConfig.globalHeartbeatInterval = Config.globalHeartbeatInterval.data;
        }
        if (Config.globalHeartbeatTimeout !== 'undefined' && Config.globalHeartbeatTimeout.type === 'int') {
            filteredConfig.globalHeartbeatTimeout = Config.globalHeartbeatTimeout.data;
        }
        if (Config.globalStaleTimeout !== 'undefined' && Config.globalStaleTimeout.type === 'int') {
            filteredConfig.globalStaleTimeout = Config.globalStaleTimeout.data;
        }
        if (Config.globalRoamingRSSIMargin !== 'undefined' && Config.globalRoamingRSSIMargin.type === 'int') {
            filteredConfig.globalRoamingRSSIMargin = Config.globalRoamingRSSIMargin.data;
        }
        if (Config.e2eEnc !== 'undefined' && Config.e2eEnc.type === 'enum') {
            filteredConfig.e2eEnc = Config.e2eEnc.data;
        }
        if (Config.globalAllowActiveLinkDrop !== 'undefined' && Config.globalAllowActiveLinkDrop.type === 'enum') {
            filteredConfig.globalAllowActiveLinkDrop = Config.globalAllowActiveLinkDrop.data;
        }
        if (Config.globalLinkMetric !== 'undefined' && Config.globalLinkMetric.type === 'enum') {
            filteredConfig.globalLinkMetric = Config.globalLinkMetric.data;
        }
        if (Config.e2eEncKey !== 'undefined' && Config.e2eEncKey.type === 'regex') {
            filteredConfig.e2eEncKey = Config.e2eEncKey.data;
        }
        if (Config.globalTimezone !== 'undefined' && Config.globalTimezone.type === 'enum') {
            filteredConfig.globalTimezone = Config.globalTimezone.data;
        }
        // filteredConfig.bpduFilter = {
        //     type: 'enum',
        //     data: [
        //         {
        //             actualValue: 'enable',
        //             displaValue: 'Enable',
        //         },
        //         {
        //             actualValue: 'disable',
        //             displaValue: 'Disable',
        //     ],
        //         },
        // };
        console.log('filtered config: ', filteredConfig);
        if (Object.keys(filteredConfig).length === 13) {
            this.setState({
                ...this.state,
                filteredConfig: {
                    ...this.filterConfig,
                    country: Config.country,
                    bpduFilter: Config.bpduFilter,
                    globalDiscoveryInterval: Config.globalDiscoveryInterval,
                    globalHeartbeatInterval: Config.globalHeartbeatInterval,
                    globalHeartbeatTimeout: Config.globalHeartbeatTimeout,
                    globalStaleTimeout: Config.globalStaleTimeout,
                    globalRoamingRSSIMargin: Config.globalRoamingRSSIMargin,
                    globalAllowActiveLinkDrop: Config.globalAllowActiveLinkDrop,
                    globalLinkMetric: Config.globalLinkMetric,
                },
            }, () => {
                this.props.setFilteredConfig(filteredConfig);
            });
        } else {
            const dialog = {
                open: true,
                title: this.t('getOptionFailTitle'),
                content: this.t('getOptionFailContent'),
                submitButton: this.t('getOptionFailBtnLbl1'),
                submitAction: () => {
                    // const currentOrigin = window.location.origin;
                    // window.location.replace(`${currentOrigin}/mesh/`);
                    // this.props.history.push('/');
                    window.location.assign(`${window.location.origin}/index.html`);
                    // this.props.history.push({
                    //     pathname: '/index.html',
                    //     hash: '/'
                    // });
                },
                cancelButton: this.t('getOptionFailBtnLbl2'),
                cancelAction: () => {
                    this.handleDialogOnClose();
                    this.getMeshConfig(true);
                },
            };
            this.setState({
                ...this.state,
                isPartialLock: false,
                dialog,
                isLock: false,
            });
        }
    }

    handleChange(event) {
        const inputID = event.target.id || event.target.name;
        const inputValue = event.target.value;
        const helperText = this.t(`inputObj.${inputID}.helperText`);
        const {filteredConfig} = this.state;

        let isValidObj = {};

        switch (inputID) {
            case 'bpduFilter':
                isValidObj = this.validateEnumOption(inputValue, helperText,
                    filteredConfig.bpduFilter.type,
                    filteredConfig.bpduFilter.data);
                break;
            case 'globalAllowActiveLinkDrop':
                isValidObj = this.validateEnumOption(inputValue, helperText,
                    filteredConfig.globalAllowActiveLinkDrop.type,
                    filteredConfig.globalAllowActiveLinkDrop.data);
                break;
            case 'globalLinkMetric':
                isValidObj = this.validateEnumOption(inputValue, helperText,
                    filteredConfig.globalLinkMetric.type,
                    filteredConfig.globalLinkMetric.data);
                break;
            case 'globalRoamingRSSIMargin':
                isValidObj = this.validateIntOption(inputValue, helperText,
                    filteredConfig.globalRoamingRSSIMargin.type,
                    filteredConfig.globalRoamingRSSIMargin.data);
                break;
            case 'globalDiscoveryInterval':
                isValidObj = this.validateIntOption(inputValue, helperText,
                    filteredConfig.globalDiscoveryInterval.type,
                    filteredConfig.globalDiscoveryInterval.data);
                break;
            case 'globalHeartbeatInterval':
                isValidObj = this.validateIntOption(inputValue, helperText,
                    filteredConfig.globalHeartbeatInterval.type,
                    filteredConfig.globalHeartbeatInterval.data,
                    {optionName: 'globalHeartbeatInterval'}
                );
                break;
            case 'globalHeartbeatTimeout':
                isValidObj = this.validateIntOption(inputValue, helperText,
                    filteredConfig.globalHeartbeatTimeout.type,
                    filteredConfig.globalHeartbeatTimeout.data,
                    {optionName: 'globalHeartbeatTimeout'}
                );
                break;
            case 'globalStaleTimeout':
                isValidObj = this.validateIntOption(inputValue, helperText,
                    filteredConfig.globalStaleTimeout.type,
                    filteredConfig.globalStaleTimeout.data,
                    {optionName: 'globalStaleTimeout'}
                );
                break;
            default:
                isValidObj = formValidator('isRequired', inputValue, null, helperText);
        }

        this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text, inputValue);
    }

    triggerFormStatus(field, status, text, inputValue) {
        this.setState({
            ...this.state,
            formStatus: {...this.state.formStatus, [field]: status},
            errorStatus: {...this.state.errorStatus, [field]: !status},
            statusText: {...this.state.statusText, [field]: text},
            formData: {...this.state.formData, [field]: inputValue},
        }, () => {
            let isValidObj = {};
            let heartbeatIntervalValidObj = {};
            let staleTimeoutValidObj = {};
            const {globalHeartbeatInterval, globalHeartbeatTimeout, globalStaleTimeout} = this.state.formData;
            const {filteredConfig} = this.state;
            switch (field) {
                case 'globalHeartbeatInterval':
                    isValidObj = this.validateIntOption(
                        globalHeartbeatTimeout,
                        // this.t('inputObj', {returnObjects: true}).globalHeartbeatTimeout.helperText,
                        this.t('inputObj.globalHeartbeatTimeout.helperText'),
                        filteredConfig.globalHeartbeatTimeout.type,
                        filteredConfig.globalHeartbeatTimeout.data,
                        {
                            optionName: 'globalHeartbeatTimeout',
                            globalStaleTimeout,
                            globalHeartbeatInterval,
                        }
                    );
                    this.setState({
                        ...this.state,
                        formStatus: {...this.state.formStatus, globalHeartbeatTimeout: isValidObj.result},
                        errorStatus: {...this.state.errorStatus, globalHeartbeatTimeout: !isValidObj.result},
                        statusText: {...this.state.statusText, globalHeartbeatTimeout: isValidObj.text},
                    });
                    break;
                case 'globalHeartbeatTimeout':
                    heartbeatIntervalValidObj = this.validateIntOption(
                        globalHeartbeatInterval,
                        // this.t('inputObj', {returnObjects: true}).globalHeartbeatInterval.helperText,
                        this.t('inputObj.globalHeartbeatInterval.helperText'),
                        filteredConfig.globalHeartbeatInterval.type,
                        filteredConfig.globalHeartbeatInterval.data,
                        {
                            optionName: 'globalHeartbeatInterval',
                            globalHeartbeatTimeout,
                        }
                    );
                    staleTimeoutValidObj = this.validateIntOption(
                        globalStaleTimeout,
                        this.t('inputObj.globalStaleTimeout.helperText'),
                        // this.t('inputObj', {returnObjects: true}).globalStaleTimeout.helperText,
                        filteredConfig.globalStaleTimeout.type,
                        filteredConfig.globalStaleTimeout.data,
                        {
                            optionName: 'globalStaleTimeout',
                            globalHeartbeatTimeout,
                        }
                    );
                    this.setState({
                        ...this.state,
                        formStatus: {
                            ...this.state.formStatus,
                            globalHeartbeatInterval: heartbeatIntervalValidObj.result,
                            globalStaleTimeout: staleTimeoutValidObj.result,
                        },
                        errorStatus: {
                            ...this.state.errorStatus,
                            globalHeartbeatInterval: !heartbeatIntervalValidObj.result,
                            globalStaleTimeout: !staleTimeoutValidObj.result,
                        },
                        statusText: {
                            ...this.state.statusText,
                            globalHeartbeatInterval: heartbeatIntervalValidObj.text,
                            globalStaleTimeout: staleTimeoutValidObj.text,
                        },
                    });
                    break;
                case 'globalStaleTimeout':
                    isValidObj = this.validateIntOption(
                        globalHeartbeatTimeout,
                        // this.t('inputObj', {returnObjects: true}).globalHeartbeatTimeout.helperText,
                        this.t('inputObj.globalHeartbeatTimeout.helperText'),
                        filteredConfig.globalHeartbeatTimeout.type,
                        filteredConfig.globalHeartbeatTimeout.data,
                        {
                            optionName: 'globalHeartbeatTimeout',
                            globalStaleTimeout,
                            globalHeartbeatInterval,
                        }
                    );
                    this.setState({
                        ...this.state,
                        formStatus: {...this.state.formStatus, globalHeartbeatTimeout: isValidObj.result},
                        errorStatus: {...this.state.errorStatus, globalHeartbeatTimeout: !isValidObj.result},
                        statusText: {...this.state.statusText, globalHeartbeatTimeout: isValidObj.text},
                    });
                    break;
                default:
            }
        });
    }

    validateEnumOption(inputValue, inputHelperText, optionType, configOption) {
        let isValidObj = formValidator('isRequired', inputValue, inputHelperText);
        if (optionType !== 'enum') {
            isValidObj.result = false;
            isValidObj.text = this.t('retrieveTypeFail');
        } else if (isValidObj.result) {
            isValidObj = formValidator('enum', inputValue, configOption, inputHelperText);
            if (!isValidObj.result) {
                isValidObj.text = this.t('invalidEnumVal');
            }
        }
        return isValidObj;
    }

    validateIntOption(inputValue, inputHelperText, optionType, configOption, {
        optionName,
        globalHeartbeatInterval = this.state.formData.globalHeartbeatInterval,
        globalStaleTimeout = this.state.formData.globalStaleTimeout,
        globalHeartbeatTimeout = this.state.formData.globalHeartbeatTimeout,
    } = {optionName: ''}) {
        const distanceReg = /^[0-9]+$/;
        let isValidObj = formValidator('isRequired', inputValue, inputHelperText);
        if (optionType !== 'int') {
            isValidObj.result = false;
            isValidObj.text = this.t('retrieveTypeFail');
        } else if (isValidObj.result) {
            isValidObj = formValidator('matchRegex', inputValue, distanceReg, inputHelperText);
            if (!isValidObj.result) {
                isValidObj.text = this.t('invalidIntRegex');
            } else {
                isValidObj = formValidator('checkRange', inputValue, configOption, inputHelperText);
                if (!isValidObj.result) {
                    isValidObj.text =
                        `Only numbers within the range of ${configOption.min} to ${configOption.max} are allowed.`;
                } else {
                    switch (optionName) {
                        case 'globalHeartbeatTimeout':
                            isValidObj = this.validateHeartbeatTimeout(inputValue, inputHelperText, {
                                globalHeartbeatInterval, globalStaleTimeout,
                            });
                            break;
                        case 'globalHeartbeatInterval':
                            isValidObj = this.validateHeartbeatInterval(inputValue, inputHelperText, {
                                globalHeartbeatTimeout,
                            });
                            break;
                        case 'globalStaleTimeout':
                            isValidObj = this.validateStaleTimeout(inputValue, inputHelperText, {
                                globalHeartbeatTimeout,
                            });
                            break;
                        default:
                    }
                }
            }
        }
        return isValidObj;
    }

    validateHeartbeatTimeout(heartbeatTimeout, helperText, {
        globalHeartbeatInterval, globalStaleTimeout,
    }) {
        if (Number(heartbeatTimeout) <= Number(globalHeartbeatInterval)) {
            return {result: false, text: this.t('invalidHeartbeatTimeout')};
        }
        if (Number(heartbeatTimeout) >= Number(globalStaleTimeout)) {
            return {result: false, text: this.t('invalidHeartbeatTimeout2')};
        }
        return {result: true, text: helperText};
    }

    validateHeartbeatInterval(heartbeatInterval, helperText, {globalHeartbeatTimeout}) {
        if (Number(heartbeatInterval) >= Number(globalHeartbeatTimeout)) {
            return {result: false, text: this.t('invalidHeartbeatInterval')};
        }
        return {result: true, text: helperText};
    }

    validateStaleTimeout(staleTimeout, helperText, {globalHeartbeatTimeout}) {
        if (Number(staleTimeout) <= Number(globalHeartbeatTimeout)) {
            return {result: false, text: this.t('invalidStaleTimeout')};
        }
        return {result: true, text: helperText};
    }

    updateMeshForm(meshTopoObj, partial) {
        const {dispatch} = this.props;
        // console.log(this.state);
        // console.log(partial);
        // this.setState({
        //     isLock: false,
        // });
        // if (!partial) {
        //     dispatch(toggleSnackBar(this.t('retrieveMeshObjSuccessSnackbar')));
        //     this.setState({
        //         isPartialLock: false,
        //     });
        //     // hide the notification
        //     if (this.mounted) {
        //         this.timer = setTimeout(() => {
        //             dispatch(closeSnackbar());
        //         }, timeout.success);
        //     }
        // } else if (this.mounted) {
        //     this.timer = setTimeout(() => {
        //         this.getMeshConfig(false, true);
        //     }, timeout.error);
        // }

        const bpduFilterValidateObj = this.validateEnumOption(
            meshTopoObj.meshSettings.bpduFilter,
            // this.t('inputObj', {returnObjects: true}).bpduFilter.helperText,
            this.t('inputObj.bpduFilter.helperText'),
            this.state.filteredConfig.bpduFilter.type,
            this.state.filteredConfig.bpduFilter.data);
        const globalAllowActiveLinkDropValidateObj = this.validateEnumOption(
            meshTopoObj.meshSettings.globalAllowActiveLinkDrop,
            // this.t('inputObj', {returnObjects: true}).bpduFilter.helperText,
            this.t('inputObj.globalAllowActiveLinkDrop.helperText'),
            this.state.filteredConfig.globalAllowActiveLinkDrop.type,
            this.state.filteredConfig.globalAllowActiveLinkDrop.data);
        const globalLinkMetricValidateObj = this.validateEnumOption(
            meshTopoObj.meshSettings.globalLinkMetric,
            // this.t('inputObj', {returnObjects: true}).bpduFilter.helperText,
            this.t('inputObj.globalLinkMetric.helperText'),
            this.state.filteredConfig.globalLinkMetric.type,
            this.state.filteredConfig.globalLinkMetric.data);
        const globalRoamingRssiMarginValidateObj = this.validateIntOption(
            meshTopoObj.meshSettings.globalRoamingRSSIMargin,
            // this.t('inputObj', {returnObjects: true}).globalRoamingRSSIMargin.helperText,
            this.t('inputObj.globalRoamingRSSIMargin.helperText'),
            this.state.filteredConfig.globalRoamingRSSIMargin.type,
            this.state.filteredConfig.globalRoamingRSSIMargin.data);
        const globalDiscoveryIntervalValidateObj = this.validateIntOption(
            meshTopoObj.meshSettings.globalDiscoveryInterval,
            // this.t('inputObj', {returnObjects: true}).globalDiscoveryInterval.helperText,
            this.t('inputObj.globalDiscoveryInterval.helperText'),
            this.state.filteredConfig.globalDiscoveryInterval.type,
            this.state.filteredConfig.globalDiscoveryInterval.data);
        const globalHeartbeatIntervalValidateObj = this.validateIntOption(
            meshTopoObj.meshSettings.globalHeartbeatInterval,
            // this.t('inputObj', {returnObjects: true}).globalHeartbeatInterval.helperText,
            this.t('inputObj.globalHeartbeatInterval.helperText'),
            this.state.filteredConfig.globalHeartbeatInterval.type,
            this.state.filteredConfig.globalHeartbeatInterval.data,
            {
                optionName: 'globalHeartbeatInterval',
                globalHeartbeatTimeout: meshTopoObj.meshSettings.globalHeartbeatTimeout,
            });
        const globalHeartbeatTimeoutValidateObj = this.validateIntOption(
            meshTopoObj.meshSettings.globalHeartbeatTimeout,
            // this.t('inputObj', {returnObjects: true}).globalHeartbeatTimeout.helperText,
            this.t('inputObj.globalHeartbeatTimeout.helperText'),
            this.state.filteredConfig.globalHeartbeatTimeout.type,
            this.state.filteredConfig.globalHeartbeatTimeout.data,
            {
                optionName: 'globalHeartbeatTimeout',
                globalHeartbeatInterval: meshTopoObj.meshSettings.globalHeartbeatInterval,
                globalStaleTimeout: meshTopoObj.meshSettings.globalStaleTimeout,
            });
        const globalStaleTimeoutValidateObj = this.validateIntOption(
            meshTopoObj.meshSettings.globalStaleTimeout,
            // this.t('inputObj', {returnObjects: true}).globalStaleTimeout.helperText,
            this.t('inputObj.globalStaleTimeout.helperText'),
            this.state.filteredConfig.globalStaleTimeout.type,
            this.state.filteredConfig.globalStaleTimeout.data,
            {
                optionName: 'globalStaleTimeout',
                globalHeartbeatTimeout: meshTopoObj.meshSettings.globalHeartbeatTimeout,
            });

        this.setState({
            ...this.state,
            loadData: {
                ...this.state.loadData,
                encryptKey: meshTopoObj.meshSettings.encKey,
                clusterId: meshTopoObj.meshSettings.clusterId,
                country: meshTopoObj.meshSettings.country,
                managementIp: meshTopoObj.meshSettings.managementIp,
                managementNetmask: meshTopoObj.meshSettings.managementNetmask,
                bpduFilter: meshTopoObj.meshSettings.bpduFilter,
                globalAllowActiveLinkDrop: meshTopoObj.meshSettings.globalAllowActiveLinkDrop,
                globalLinkMetric: meshTopoObj.meshSettings.globalLinkMetric,
                globalRoamingRSSIMargin: meshTopoObj.meshSettings.globalRoamingRSSIMargin,
                globalDiscoveryInterval: meshTopoObj.meshSettings.globalDiscoveryInterval,
                globalHeartbeatInterval: meshTopoObj.meshSettings.globalHeartbeatInterval,
                globalHeartbeatTimeout: meshTopoObj.meshSettings.globalHeartbeatTimeout,
                globalStaleTimeout: meshTopoObj.meshSettings.globalStaleTimeout,
                e2eEnc: meshTopoObj.meshSettings.e2eEnc,
                e2eEncKey: meshTopoObj.meshSettings.e2eEncKey,
                globalTimezone: meshTopoObj.meshSettings.globalTimezone,
            },
            formData: {
                ...this.state.formData,
                encryptKey: meshTopoObj.meshSettings.encKey,
                clusterId: meshTopoObj.meshSettings.clusterId,
                country: meshTopoObj.meshSettings.country,
                managementIp: meshTopoObj.meshSettings.managementIp,
                managementNetmask: meshTopoObj.meshSettings.managementNetmask,
                bpduFilter: meshTopoObj.meshSettings.bpduFilter,
                globalAllowActiveLinkDrop: meshTopoObj.meshSettings.globalAllowActiveLinkDrop,
                globalLinkMetric: meshTopoObj.meshSettings.globalLinkMetric,
                globalRoamingRSSIMargin: meshTopoObj.meshSettings.globalRoamingRSSIMargin,
                globalDiscoveryInterval: meshTopoObj.meshSettings.globalDiscoveryInterval,
                globalHeartbeatInterval: meshTopoObj.meshSettings.globalHeartbeatInterval,
                globalHeartbeatTimeout: meshTopoObj.meshSettings.globalHeartbeatTimeout,
                globalStaleTimeout: meshTopoObj.meshSettings.globalStaleTimeout,
                e2eEnc: meshTopoObj.meshSettings.e2eEnc,
                e2eEncKey: meshTopoObj.meshSettings.e2eEncKey,
                globalTimezone: meshTopoObj.meshSettings.globalTimezone,
            },
            formStatus: {
                ...this.state.formStatus,
                bpduFilter: bpduFilterValidateObj.result,
                globalAllowActiveLinkDrop: globalAllowActiveLinkDropValidateObj.result,
                globalLinkMetric: globalLinkMetricValidateObj.result,
                globalRoamingRSSIMargin: globalRoamingRssiMarginValidateObj.result,
                globalDiscoveryInterval: globalDiscoveryIntervalValidateObj.result,
                globalHeartbeatInterval: globalHeartbeatIntervalValidateObj.result,
                globalHeartbeatTimeout: globalHeartbeatTimeoutValidateObj.result,
                globalStaleTimeout: globalStaleTimeoutValidateObj.result,
            },
            errorStatus: {
                ...this.state.errorStatus,
                bpduFilter: !bpduFilterValidateObj.result,
                globalAllowActiveLinkDrop: !globalAllowActiveLinkDropValidateObj.result,
                globalLinkMetric: !globalLinkMetricValidateObj.result,
                globalRoamingRSSIMargin: !globalRoamingRssiMarginValidateObj.result,
                globalDiscoveryInterval: !globalDiscoveryIntervalValidateObj.result,
                globalHeartbeatInterval: !globalHeartbeatIntervalValidateObj.result,
                globalHeartbeatTimeout: !globalHeartbeatTimeoutValidateObj.result,
                globalStaleTimeout: !globalStaleTimeoutValidateObj.result,
            },
            statusText: {
                ...this.state.statusText,
                bpduFilter: bpduFilterValidateObj.text,
                globalAllowActiveLinkDrop: globalAllowActiveLinkDropValidateObj.text,
                globalLinkMetric: globalLinkMetricValidateObj.text,
                globalRoamingRSSIMargin: globalRoamingRssiMarginValidateObj.text,
                globalDiscoveryInterval: globalDiscoveryIntervalValidateObj.text,
                globalHeartbeatInterval: globalHeartbeatIntervalValidateObj.text,
                globalHeartbeatTimeout: globalHeartbeatTimeoutValidateObj.text,
                globalStaleTimeout: globalStaleTimeoutValidateObj.text,
            },
            hash: meshTopoObj.checksums,
        });


        if ('discrepancies' in meshTopoObj.meshSettings && !partial) {
            this.updateDiscrepancies(meshTopoObj);
        } else {
            this.setState({
                isLock: false,
            });
            if (!partial) {
                dispatch(toggleSnackBar(this.t('retrieveMeshObjSuccessSnackbar')));
                this.setState({
                    isPartialLock: false,
                });
                // hide the notification
                if (this.mounted) {
                    this.timer = setTimeout(() => {
                        dispatch(closeSnackbar());
                    }, timeout.success);
                }
            } else if (this.mounted) {
                this.timer = setTimeout(() => {
                    this.getMeshConfig(false, true);
                }, timeout.error);
            }
        }
    }

    checkLegacy(config) {
        let isLegacy = false;
        const legacySyncValue = {};
        const discrepanciesValue = {};

        Object.keys(config.meshSettings.discrepancies).forEach((nodeIp) => {
            if (typeof config.meshSettings.discrepancies[nodeIp] !== 'undefined') {
                Object.keys(config.meshSettings.discrepancies[nodeIp]).forEach((key) => {
                    if (config.meshSettings.discrepancies[nodeIp][key].isLegacy) {
                        isLegacy = true;
                        legacySyncValue[key] = config.meshSettings.discrepancies[nodeIp][key].value;
                    } else {
                        discrepanciesValue[key] = config.meshSettings[key];
                    }
                });
            }
        });

        this.setState({
            legacySyncValue,
            discrepanciesValue,
        });

        return isLegacy;
    }

    parseLegacyDiscrepancyList(config) {
        // const {legacySyncValue} = this.state;
        const expectedConfig = {
            nodeIp: 'expectedConfig',
            discrepancies: false,
            hostNode: true,
            mac: 'expectedConfig',
            hostname: this.t('defaultLbl'),
            clusterId: config.meshSettings.clusterId,
            country: config.meshSettings.country,
            managementIp: config.meshSettings.managementIp,
            managementNetmask: config.meshSettings.managementNetmask,
            encKey: config.meshSettings.encKey,
            bpduFilter: config.meshSettings.bpduFilter,
            globalAllowActiveLinkDrop: config.meshSettings.globalAllowActiveLinkDrop,
            globalLinkMetric: config.meshSettings.globalLinkMetric,
            e2eEnc: config.meshSettings.e2eEnc,
            e2eEncKey: config.meshSettings.e2eEncKey,
            globalDiscoveryInterval: config.meshSettings.globalDiscoveryInterval,
            globalHeartbeatInterval: config.meshSettings.globalHeartbeatInterval,
            globalHeartbeatTimeout: config.meshSettings.globalHeartbeatTimeout,
            globalStaleTimeout: config.meshSettings.globalStaleTimeout,
            globalRoamingRSSIMargin: config.meshSettings.globalRoamingRSSIMargin,
            globalTimezone: config.meshSettings.globalTimezone,
            isLegacy: {},
        };
        Object.keys(config.meshSettings.discrepancies).forEach((nodeIp) => {
            if (typeof config.meshSettings.discrepancies[nodeIp] !== 'undefined') {
                Object.keys(config.meshSettings.discrepancies[nodeIp]).forEach((key) => {
                    if (config.meshSettings.discrepancies[nodeIp][key].isLegacy) {
                        expectedConfig[key] = config.meshSettings.discrepancies[nodeIp][key].value;
                        expectedConfig.isLegacy[key] = nodeIp;
                    }
                });
            }
        });
        const legacyArray = Object.keys(config.nodeSettings).flatMap((nodeIp) => {
            const discrepancy = {
                nodeIp,
                discrepancies: true,
                hostNode: false,
                mac: convertIpToMac(nodeIp),
                hostname: config.nodeSettings[nodeIp].hostname,
            };
            if (config.meshSettings.discrepancies[nodeIp]) {
                Object.keys(config.meshSettings.discrepancies[nodeIp]).forEach((key) => {
                    discrepancy[key] = config.meshSettings.discrepancies[nodeIp][key].value;
                });
            }
            Object.keys(expectedConfig.isLegacy).forEach((key) => {
                if (expectedConfig.isLegacy[key] !== nodeIp) {
                    discrepancy[key] = 'notSupported';
                }
            });
            const coreKey = ['nodeIp', 'discrepancies', 'hostNode', 'mac', 'hostname'];
            Object.keys(discrepancy).forEach((key) => {
                if (!coreKey.includes(key)) {
                    if (discrepancy[key] === expectedConfig[key]) {
                        delete discrepancy[key];
                    }
                }
            });
            return Object.keys(discrepancy).length > 5 ? discrepancy : [];
        });

        return [expectedConfig, ...legacyArray];
    }

    parseDiscrepacyList(config) {
        const discrepanciesList = [];
        discrepanciesList.push({
            nodeIp: this.t('defaultLbl'),
            discrepancies: false,
            hostNode: true,
            mac: this.t('defaultLbl'),
            hostname: this.t('defaultLbl'),
            clusterId: config.meshSettings.clusterId,
            country: config.meshSettings.country,
            managementIp: config.meshSettings.managementIp,
            managementNetmask: config.meshSettings.managementNetmask,
            encKey: config.meshSettings.encKey,
            bpduFilter: config.meshSettings.bpduFilter,
            globalAllowActiveLinkDrop: config.meshSettings.globalAllowActiveLinkDrop,
            globalLinkMetric: config.meshSettings.globalLinkMetric,
            e2eEnc: config.meshSettings.e2eEnc,
            e2eEncKey: config.meshSettings.e2eEncKey,
            globalDiscoveryInterval: config.meshSettings.globalDiscoveryInterval,
            globalHeartbeatInterval: config.meshSettings.globalHeartbeatInterval,
            globalHeartbeatTimeout: config.meshSettings.globalHeartbeatTimeout,
            globalStaleTimeout: config.meshSettings.globalStaleTimeout,
            globalRoamingRSSIMargin: config.meshSettings.globalRoamingRSSIMargin,
            globalTimezone: config.meshSettings.globalTimezone,
        });

        Object.keys(config.meshSettings.discrepancies).forEach((nodeIp) => {
            const discrepancies = {};
            if (typeof config.meshSettings.discrepancies[nodeIp] !== 'undefined') {
                discrepancies.nodeIp = nodeIp;
                discrepancies.discrepancies = true;
                discrepancies.mac = convertIpToMac(nodeIp);
                discrepancies.hostname = this.t('defaultLbl');
                discrepancies.hostNode = false;
                Object.keys(config.meshSettings.discrepancies[nodeIp]).forEach((key) => {
                    if (!config.meshSettings.discrepancies[nodeIp][key].isLegacy) {
                        discrepancies[key] = config.meshSettings.discrepancies[nodeIp][key].value;
                    }
                });
            }
            if (Object.keys(discrepancies).length > 5) {
                discrepanciesList.push(discrepancies);
            }
        });

        return discrepanciesList;
    }

    updateDiscrepancies(config) {
        const {dispatch} = this.props;
        let discrepanciesList = [];

        if (this.checkLegacy(config)) {
            discrepanciesList = this.parseLegacyDiscrepancyList(config);
        } else {
            discrepanciesList = this.parseDiscrepacyList(config);
        }

        console.log('Discrepancies list: ', discrepanciesList);

        if (discrepanciesList.length > 1) {
            this.setState({
                ...this.state,
                discrepancies: discrepanciesList,
            }, () => {
                this.props.addDiscrepancies(discrepanciesList, 'advanced');
            });
        } else {
            this.setState({
                isLock: false,
                isPartialLock: true,
            });
            dispatch(toggleSnackBar(this.t('retrieveMeshObjSuccessSnackbar')));
            // hide the notification
            if (this.mounted) {
                this.timer = setTimeout(() => {
                    dispatch(closeSnackbar());
                }, timeout.success);
            }
        }
    }

    clickSync() {
        const {legacySyncValue, discrepanciesValue} = this.state;
        const saveConfigObj = {};
        saveConfigObj.checksums = this.state.hash;
        saveConfigObj.diff = {};
        saveConfigObj.diff.meshSettings = discrepanciesValue;
        if (Object.keys(legacySyncValue).length !== 0) {
            Object.keys(legacySyncValue).forEach((key) => {
                saveConfigObj.diff.meshSettings[key] = legacySyncValue[key];
            });
        }
        // if (this.state.showBanner) {
        //     delete saveConfigObj.diff.meshSettings.bpduFilter;
        // }
        console.log('saveConfigObj(AdvancedSettings): ', saveConfigObj);
        this.saveProcess(saveConfigObj, true);
    }

    notLoggedInHandle() {
        const dialog = {
            open: true,
            title: this.t('notLoggedInTitle'),
            content: this.t('notLoggedInContent', this.props.labels),
            submitButton: this.t('notLoggedInAction'),
            submitAction: () => {
                // const currentOrigin = window.location.origin;
                // window.location.replace(`${currentOrigin}/mesh/`);
                // this.props.history.push('/');
                window.location.assign(`${window.location.origin}/index.html`);
                // this.props.history.push({
                //     pathname: '/index.html',
                //     hash: '/'
                // });
            },
            cancelButton: '',
            cancelAction: this.handleDialogOnClose,
        };
        this.setState({
            ...this.state,
            dialog,
        });
    }

    handlePartialLock(isLock) {
        this.setState({
            ...this.state,
            isPartialLock: isLock,
        });
    }

    handleLock(isLock, isPartialLock) {
        this.setState({
            ...this.state,
            isLock,
            isPartialLock,
        });
    }

    handleDialogOnClose(cb = false) {
        this.setState({
            ...this.state,
            dialog: {
                ...this.state.dialog,
                open: false,
            },
        }, () => {
            if (typeof cb === 'function') {
                cb();
            }
        });
    }

    saveSuccessHandler() {
        const {dispatch} = this.props;

        dispatch(closeSnackbar());
        const dialog = {};
        dialog.open = true;
        dialog.title = this.t('saveSuccessDialogTitle');
        dialog.content = (
            <span>
                <span style={{marginBottom: '15px', display: 'block'}}>
                    {this.t('saveSuccessDialogContent')}
                </span>
            </span>
        );
        dialog.submitButton = this.t('saveSuccessDialogSbmtLbl');
        dialog.submitAction = () => {
            // const currentOrigin = window.location.origin;
            // window.location.replace(`${currentOrigin}/mesh/`);
            // this.props.history.push('/');
            window.location.assign(`${window.location.origin}/index.html`);
            // this.props.history.push({
            //     pathname: '/index.html',
            //     hash: '/'
            // });
        };
        dialog.cancelButton = '';
        dialog.cancelAction = this.handleDialogOnClose;

        // stop progress bar
        this.props.dispatch(updateProgressBar(false));
        this.props.onLoadingAct(false);
        console.log('-----saveSuccessHandler-----');
        this.setState({
            ...this.state,
            loadData: {
                ...this.state.loadData,
                bpduFilter: this.state.formData.bpduFilter,
            },
            dialog,
        });
    }

    async saveProcess(saveConfigObj, isSync = false) {
        const {dispatch} = this.props;

        dispatch(toggleSnackBar(this.t('savingConfigSnackbar')));
        this.props.onLoadingAct(true);
        try {
            const value = await setConfig(this.props.csrf, Cookies.get('projectId'), saveConfigObj);
            setTimeout(() => {
                this.saveSuccessHandler();
            }, value.rtt * 1000);
        } catch (error) {
            this.saveProcessError(error, isSync);
        }
    }

    saveProcessError(error, isSync) {
        const {dispatch} = this.props;
        const unreachedNode = isUnreachedNode(error);
        // Something wrong, show error message with reason
        dispatch(closeSnackbar());
        this.props.dispatch(updateProgressBar(false));
        this.props.onLoadingAct(false);
        if (unreachedNode === 'headNodeUnreachable') {
            this.onFailReturn();
        } else if (unreachedNode === 'unreachable') {
            this.onFail();
        } else {
            const dialog = {
                open: true,
                title: this.t('saveFailDialogTitle'),
                content: isSync ? this.t('saveFailDialogSyncContent') :
                    this.t('saveFailDialogContent'),
                nonTextContent: <span />,
                submitButton: this.t('dialogSubmitLbl'),
                submitAction: () => {
                    this.setState({dialog: {...this.state.dialog, open: false}}, () => {
                        this.getMeshConfig(true, false);
                    });
                },
                cancelButton: '',
                cancelAction: this.handleDialogOnClose,
            };
            this.setState({
                ...this.state,
                dialog,
            });
        }
    }

    render() {
        // console.log('advanced config: ', this.state);
        const {
            discrepancies, isPartialLock, formStatus, showBanner,
            errorStatus, formData, filteredConfig, statusText,
        } = this.state;
        const disableSave = !Object.keys(formStatus).every(opt => formStatus[opt]) ||
        discrepancies.length > 0;

        return (
            <span style={{overflowY: 'auto'}}>
                <Card style={{background: colors.background}} elevation={0}>
                    <CardContent
                        style={{
                            paddingLeft: 52,
                            paddingRight: 52,
                            height: discrepancies.length === 0 && this.props.isAllNodesReachable ?
                                'calc(100vh - 380px)' : 'calc(100vh - 460px)',
                            overflowY: 'auto',
                        }}
                    >
                        {/* {mismatchBanner} */}
                        <FormSelectCreator
                            key="bpduFilter"
                            margin="normal"
                            errorStatus={errorStatus.bpduFilter}
                            // inputLabel={this.t('inputObj', {returnObjects: true}).bpduFilter.title}
                            inputLabel={this.t('inputObj.bpduFilter.title')}
                            inputID="bpduFilter"
                            inputValue={formData.bpduFilter}
                            onChangeField={this.handleChange}
                            menuItemObj={filteredConfig.bpduFilter.data}
                            helperText={statusText.bpduFilter}
                            showHelpTooltip
                            helpTooltip={createTooltip(
                                this.t('inputObj.bpduFilter.title'),
                                this.t('inputObj.bpduFilter.tooltip1'),
                                this.t('inputObj.bpduFilter.tooltip2')
                                // this.t('inputObj', {returnObjects: true}).bpduFilter.title,
                                // this.t('inputObj', {returnObjects: true}).bpduFilter.tooltip1,
                                // this.t('inputObj', {returnObjects: true}).bpduFilter.tooltip2
                            )}
                            disabled={isPartialLock || showBanner || discrepancies.length > 0}
                        />
                        <FormInputCreator
                            key="globalRoamingRSSIMargin"
                            margin="normal"
                            errorStatus={errorStatus.globalRoamingRSSIMargin}
                            // inputLabel={this.t('inputObj', {returnObjects: true}).globalRoamingRSSIMargin.title}
                            inputLabel={this.t('inputObj.globalRoamingRSSIMargin.title')}
                            inputID="globalRoamingRSSIMargin"
                            inputValue={formData.globalRoamingRSSIMargin}
                            onChangeField={this.handleChange}
                            helperText={statusText.globalRoamingRSSIMargin}
                            disabled={isPartialLock || showBanner || discrepancies.length > 0 ||
                                !isSupportedIntOption('globalRoamingRSSIMargin', filteredConfig)}
                            autoFocus={false}
                            inputType="text"
                            showHelpTooltip
                            helpTooltip={createTooltip(
                                // this.t('inputObj', {returnObjects: true}).globalRoamingRSSIMargin.title,
                                this.t('inputObj.globalRoamingRSSIMargin.title'),
                                false,
                                // this.t('inputObj', {returnObjects: true}).globalRoamingRSSIMargin.tooltip2
                                this.t('inputObj.globalRoamingRSSIMargin.tooltip2'),
                            )}
                        />
                        {/* <FormInputCreator
                            key="globalDiscoveryInterval"
                            margin="normal"
                            errorStatus={errorStatus.globalDiscoveryInterval}
                            inputLabel={this.t('inputObj', {returnObjects: true}).globalDiscoveryInterval.title}
                            inputID="globalDiscoveryInterval"
                            inputValue={formData.globalDiscoveryInterval}
                            onChangeField={this.handleChange}
                            helperText={statusText.globalDiscoveryInterval}
                            disabled={isPartialLock || showBanner || discrepancies.length > 0 ||
                                !isSupportedIntOption('globalDiscoveryInterval', filteredConfig)}
                            autoFocus={false}
                            inputType="text"
                            showHelpTooltip
                            helpTooltip={createTooltip(
                                this.t('inputObj', {returnObjects: true}).globalDiscoveryInterval.title,
                                false,
                                this.t('inputObj', {returnObjects: true}).globalDiscoveryInterval.tooltip2
                            )}
                        /> */}
                        <FormInputCreator
                            key="globalHeartbeatInterval"
                            margin="normal"
                            errorStatus={errorStatus.globalHeartbeatInterval}
                            inputLabel={this.t('globalHeartbeatIntervalTitle', {min: '123', max: '456'})}
                            inputID="globalHeartbeatInterval"
                            inputValue={formData.globalHeartbeatInterval}
                            onChangeField={this.handleChange}
                            helperText={statusText.globalHeartbeatInterval}
                            disabled={isPartialLock || showBanner || discrepancies.length > 0 ||
                                !isSupportedIntOption('globalHeartbeatInterval', filteredConfig)}
                            autoFocus={false}
                            inputType="text"
                            showHelpTooltip
                            helpTooltip={createTooltip(
                                this.t('inputObj.globalHeartbeatInterval.title'),
                                // this.t('inputObj', {returnObjects: true}).globalHeartbeatInterval.title,
                                false,
                                this.t('inputObj.globalHeartbeatInterval.tooltip2')
                                // this.t('inputObj', {returnObjects: true}).globalHeartbeatInterval.tooltip2
                            )}
                        />
                        <FormInputCreator
                            key="globalHeartbeatTimeout"
                            margin="normal"
                            errorStatus={errorStatus.globalHeartbeatTimeout}
                            // inputLabel={this.t('inputObj', {returnObjects: true}).globalHeartbeatTimeout.title}
                            inputLabel={this.t('inputObj.globalHeartbeatTimeout.title')}
                            inputID="globalHeartbeatTimeout"
                            inputValue={formData.globalHeartbeatTimeout}
                            onChangeField={this.handleChange}
                            helperText={statusText.globalHeartbeatTimeout}
                            disabled={isPartialLock || showBanner || discrepancies.length > 0 ||
                                !isSupportedIntOption('globalHeartbeatTimeout', filteredConfig)}
                            autoFocus={false}
                            inputType="text"
                            showHelpTooltip
                            helpTooltip={createTooltip(
                                this.t('inputObj.globalHeartbeatTimeout.title'),
                                // this.t('inputObj', {returnObjects: true}).globalHeartbeatTimeout.title,
                                false,
                                this.t('inputObj.globalHeartbeatTimeout.tooltip2')
                                // this.t('inputObj', {returnObjects: true}).globalHeartbeatTimeout.tooltip2
                            )}
                        />
                        <FormInputCreator
                            key="globalStaleTimeout"
                            margin="normal"
                            errorStatus={errorStatus.globalStaleTimeout}
                            // inputLabel={this.t('inputObj', {returnObjects: true}).globalStaleTimeout.title}
                            inputLabel={this.t('inputObj.globalStaleTimeout.title')}
                            inputID="globalStaleTimeout"
                            inputValue={formData.globalStaleTimeout}
                            onChangeField={this.handleChange}
                            helperText={statusText.globalStaleTimeout}
                            disabled={isPartialLock || showBanner || discrepancies.length > 0 ||
                                !isSupportedIntOption('globalStaleTimeout', filteredConfig)}
                            autoFocus={false}
                            inputType="text"
                            showHelpTooltip
                            helpTooltip={createTooltip(
                                this.t('inputObj.globalStaleTimeout.title'),
                                // this.t('inputObj', {returnObjects: true}).globalStaleTimeout.title,
                                false,
                                this.t('inputObj.globalStaleTimeout.tooltip2')
                                // this.t('inputObj', {returnObjects: true}).globalStaleTimeout.tooltip2
                            )}
                        />
                        <FormSelectCreator
                            key="globalAllowActiveLinkDrop"
                            margin="normal"
                            errorStatus={errorStatus.bpduFilter}
                            // inputLabel={this.t('inputObj', {returnObjects: true}).bpduFilter.title}
                            inputLabel={this.t('inputObj.globalAllowActiveLinkDrop.title')}
                            inputID="globalAllowActiveLinkDrop"
                            inputValue={formData.globalAllowActiveLinkDrop}
                            onChangeField={this.handleChange}
                            menuItemObj={filteredConfig.globalAllowActiveLinkDrop.data}
                            helperText={statusText.globalAllowActiveLinkDrop}
                            showHelpTooltip
                            helpTooltip={createTooltip(
                                this.t('inputObj.globalAllowActiveLinkDrop.title'),
                                false,
                                this.t('inputObj.globalAllowActiveLinkDrop.tooltip2')
                                // this.t('inputObj', {returnObjects: true}).bpduFilter.title,
                                // this.t('inputObj', {returnObjects: true}).bpduFilter.tooltip1,
                                // this.t('inputObj', {returnObjects: true}).bpduFilter.tooltip2
                            )}
                            disabled={isPartialLock || showBanner || discrepancies.length > 0}
                        />
                        <FormSelectCreator
                            key="globalLinkMetric"
                            margin="normal"
                            errorStatus={errorStatus.bpduFilter}
                            // inputLabel={this.t('inputObj', {returnObjects: true}).bpduFilter.title}
                            inputLabel={this.t('inputObj.globalLinkMetric.title')}
                            inputID="globalLinkMetric"
                            inputValue={formData.globalLinkMetric}
                            onChangeField={this.handleChange}
                            menuItemObj={filteredConfig.globalLinkMetric.data}
                            helperText={statusText.globalLinkMetric}
                            showHelpTooltip
                            helpTooltip={createTooltip(
                                this.t('inputObj.globalLinkMetric.title'),
                                false,
                                this.t('inputObj.globalLinkMetric.tooltip2')
                                // this.t('inputObj', {returnObjects: true}).bpduFilter.title,
                                // this.t('inputObj', {returnObjects: true}).bpduFilter.tooltip1,
                                // this.t('inputObj', {returnObjects: true}).bpduFilter.tooltip2
                            )}
                            disabled={isPartialLock || showBanner || discrepancies.length > 0}
                        />
                    </CardContent>
                    <CardActions style={{paddingRight: '52px'}}>
                        <div style={{flex: 1}} />
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={this.clickReset}
                            disabled={isPartialLock || showBanner || discrepancies.length > 0 || !this.props.isAllNodesReachable}
                        >
                            {this.t('resetLbl')}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={this.clickSave}
                            disabled={disableSave || isPartialLock || showBanner || !this.props.isAllNodesReachable}
                        >
                            {this.t('saveLbl')}
                        </Button>
                    </CardActions>
                </Card>
                <P2Dialog
                    open={this.state.dialog.open}
                    handleClose={this.handleDialogOnClose}
                    title={this.state.dialog.title}
                    content={this.state.dialog.content}
                    actionTitle={this.state.dialog.submitButton}
                    actionFn={this.state.dialog.submitAction}
                    cancelActTitle={this.state.dialog.cancelButton}
                    cancelActFn={this.state.dialog.cancelAction}
                    disableBackdropClick
                    disableEscapeKeyDown
                />
                <LockLayer
                    display={this.state.isLock}
                    top={0}
                    left={0}
                    zIndex={200}
                    hasCircularProgress
                />
            </span>
        );
    }
}
AdvancedSettings.propTypes = {
    history: PropTypes.object.isRequired, /* eslint-disable-line */
    csrf: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    onLoadingAct: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    handleLock: PropTypes.func.isRequired,
    handleSync: PropTypes.func.isRequired,
    addDiscrepancies: PropTypes.func.isRequired,
    setFilteredConfig: PropTypes.func.isRequired,
    projectId: PropTypes.string.isRequired,
    labels: PropTypes.object.isRequired,
    isAllNodesReachable:PropTypes.bool.isRequired,
    checkIfAllNodesReachable: PropTypes.func.isRequired,
    // display: PropTypes.bool,
};


function mapStateToProps(state) {
    const {csrf, labels} = state.common;
    const {projectId} = state.projectManagement;
    return {
        csrf,
        projectId,
        labels
    };
}

export const ConnectedAdvancedSettings = connect(mapStateToProps)(AdvancedSettings);

export default connect(mapStateToProps)(withRouter(AdvancedSettings));
