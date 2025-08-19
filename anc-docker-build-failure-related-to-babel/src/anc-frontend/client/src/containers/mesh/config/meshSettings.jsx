/**
 * @Author: mango
 * @Date:   2018-03-27T16:51:03+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-12-18T14:17:05+08:00
 */
import React from 'react';
import PropTypes from 'prop-types';
import {Trans} from 'react-i18next';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import WarningIcon from '@material-ui/icons/Error';
import Cookies from 'js-cookie';
import BuildIcon from '@material-ui/icons/Build';
import Card from '@material-ui/core/Card';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core/styles';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import InputAdornment from '@material-ui/core/InputAdornment';
import {convertIpToMac} from '../../../util/formatConvertor';
import {formValidator} from '../../../util/inputValidator';
import FormInputCreator from '../../../components/common/FormInputCreator';
import FormSelectCreator from '../../../components/common/FormSelectCreator';
import checkConfigValue, {getOptionsFromGetConfigObj} from '../../../util/configValidator';
import InvalidConfigContainer from '../../../components/common/InvalidConfigContainer';
import {closeSnackbar, toggleSnackBar, updateProgressBar} from '../../../redux/common/commonActions';
import P2Dialog from '../../../components/common/P2Dialog';
import LockLayer from '../../../components/common/LockLayer';
import P2Tooltip from '../../../components/common/P2Tooltip';
import isMismatchSecret, {isUnreachedNode} from '../../../util/common';
import {
    getConfig,
    setConfig,
    validateUserCredential,
    getFilteredConfigOptions,
    getCachedConfig,
    getCachedMeshTopology
} from '../../../util/apiCall';
import Constant from '../../../constants/common';
import check from '../../../util/errorValidator';
import {openDeviceListDialog} from '../../../redux/common/commonActions';

const {timeout, colors, themeObj} = Constant;

const get = (o, p) =>
    p.reduce(
        (xs, x) =>
            ((xs && xs[x]) ?
                xs[x] : null), o);

const styles = {
    root: {
        paddingLeft: 15,
        paddingRight: 15,
        color: 'white',
        backgroundColor: colors.inactiveRed,
        textTransform: 'none',
        '&:hover': {
            backgroundColor: colors.inactiveRedHover,
        },
    },
};

const deepClone = object => JSON.parse(JSON.stringify(object));

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
                    <span style={{display: 'flex'}}>
                        {tooltip2}
                    </span>
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

function validateRtsCts(inputValue, helperText) {
    const rtxCtsEnum = [
        {
            actualValue: 'enable',
            displayValue: 'Enable',
        },
        {
            actualValue: 'disable',
            displayValue: 'Disable',
        },
    ];
    const isValidObj = formValidator('enum', inputValue, rtxCtsEnum, helperText);
    return isValidObj;
}


// function deleteKey(item, array) {
//     const index = array.indexOf(item);
//     if (index !== -1) array.splice(index, 1);
// }


class MeshSettingsApp extends React.Component {
    constructor(props) {
        super(props);

        const fnNames = [
            'handleChange',
            'triggerFormStatus',
            'handleClickShowPasssword',
            'handleDialogOnClose',
            'handleCountryDialogOnClose',
            'clickReset',
            'clickSave',
            'clickSync',
            'getMeshConfig',
            'updateMeshForm',
            'handleGetMeshError',
            'getDiffObj',
            'enterToSubmit',
            'enterToLogin',
            'saveSuccessHandler',
            'saveProcess',
            'saveProcessError',
            'handleSecretMismatch',
            'onLogout',
            'onReturn',
            'onFailReturn',
            'onFail',
            'handleChangeCountry',
            'handleCountryLock',
            'login',
            'updateDiscrepancies',
            // 'getMeshTop',
            // 'getNodeInfo',
            // 'updateDiscrepanciesDialog',
            'validateClusterID',
            'validatePresharedKey',
            'validateManagementNetmask',
            'validateManagementIp',
            'validateGlobalTimezone',
            // 'createDiscrepancyItem',
            'updateFilterConfig',
            'handleDebugCheck',
            'handleUnmanagedHostnode',
            'handleLock',
            // 'searchCountry',
            'notLoggedInHandle',
            'getCountryLabel',
            'getTimezoneLabel',
            'checkLegacy',
            'parseDiscrepacyList',
            'parseLegacyDiscrepancyList',
            'checkTimezoneChange',
            'checkDebugMode',
            'checkCountryChange',
            'confirmSaveAction',
            'createGetFilteredConfigBodyMsg',
            'handleInvalidDialogOnClose',
        ];

        window.__.each(fnNames, (fnName) => {
            this[fnName] = this[fnName].bind(this);
        });

        this.t = this.props.t;

        this.state = {
            rawGetConfig: {},
            invalidConfigDialogOpen: false,
            invalidFilterConfig: {
                meshSettings: {},
                radioSettings: {},
                nodeSettings: {},
                ethernetSettings: {},
                profileSettings: {},
                expanded: {
                    meshSettings: false,
                    node: {},
                },
            },
            invalidFilterConfigActionFn: () => null,
            loadData: {
                encKey: '',
                clusterId: '',
                // presharedKey: '12345678',
                managementIp: '',
                managementNetmask: '',
                country: 'HK',
                password: '',
                bpduFilter: '',
                e2eEnc: '',
                e2eEncKey: '',
                globalTimezone: '',
                // rtsCts: 'disable',
            },
            defaultErrorStatus: {
                clusterId: false,
                // presharedKey: false,
                managementIp: false,
                managementNetmask: false,
                country: false,
                password: false,
                globalTimezone: false,
                // rtsCts: false,
            },
            defaultFormStatus: {
                clusterId: true,
                // presharedKey: true,
                managementIp: true,
                managementNetmask: true,
                country: true,
                password: true,
                globalTimezone: true,
                // rtsCts: true,
            },
            formData: {
                encKey: '',
                clusterId: '',
                // presharedKey: '12345678',
                managementIp: '',
                managementNetmask: '',
                country: {},
                password: '',
                bpduFilter: '',
                e2eEnc: '',
                e2eEncKey: '',
                globalTimezone: {},
                // rtsCts: 'disable',
            },
            statusText: {
                clusterId: this.t('inputObj.clusterId.helperText'),
                managementIp: this.t('inputObj.managementIp.helperText'),
                managementNetmask: this.t('inputObj.managementNetmask.helperText'),
                country: this.t('inputObj.country.helperText'),
                password: this.t('inputObj.password.helperText'),
                globalTimezone: this.t('inputObj.globalTimezone.helperText'),
                // presharedKey: inputObj.presharedKey.helperText,
                // rtsCts: inputObj.rtsCts.helperText,
            },
            errorStatus: {
                clusterId: false,
                // presharedKey: false,
                managementIp: false,
                managementNetmask: false,
                country: false,
                password: false,
                globalTimezone: false,
                // rtsCts: false,
            },
            formStatus: {
                clusterId: true,
                // presharedKey: true,
                managementIp: true,
                managementNetmask: true,
                country: true,
                password: true,
                globalTimezone: true,
                // rtsCts: true,
            },
            hash: {},
            showPassword: false,
            countryLock: true,
            dialog: {
                open: false,
                title: '',
                content: '',
                nonTextContent: <span />,
                submitTitle: this.t('dialogSubmitLbl'),
                submitFn: this.handleDialogOnClose,
                cancelTitle: '',
                cancelFn: this.handleDialogOnClose,
                width: 'sm',
            },
            debugMode: false,
            countryDialog: false,
            discrepancies: [],
            isLock: true,
            isPartialLock: true,
            // ignoreBpduSync: false,
            legacySyncValue: {},
            override: {
                status: false,
                ctx: {},
            },
            filteredConfig: {
                country: [{actualValue: '', displayValue: ''}],
                managementIp: '.',
                managementNetmask: '.',
                clusterId: '.',
                globalTimezone: [{actualValue: '', displayValue: ''}],
            },
        };
    }

    componentDidMount() {
        this.mounted = true;
        const {projectName} = this.props
        const notLoggedinToMeshTopology = Cookies.get('notLoggedinToMeshTopology') === 'true';

        if (projectName === '__staging' && notLoggedinToMeshTopology) {
            this.notLoggedInHandle();
        } else {
            this.getMeshConfig(true, false);
            this.props.handleLock(this.handleLock);
            this.props.handleSync(this.clickSync);
        }
    }

    componentWillUnmount() {
        const {dispatch} = this.props;
        this.mounted = false;
        dispatch(closeSnackbar());
        clearTimeout(this.timer);
    }

    onLogout() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('invalidMgmtSecretTitle'),
                content: this.t('invalidMgmtSecretContent'),
                submitTitle: this.t('invalidMgmtSecretAction'),
                submitFn: () => {
                    Cookies.remove('projectId');
                    // const currentOrigin = window.location.origin;
                    // window.location.replace(`${currentOrigin}/mesh/`);
                    window.location.assign(`${window.location.origin}/index.html`);
                },
                cancelTitle: '',
                cancelFn: this.handleDialogOnClose,
                disableBackdropClick: true,
                disableEscapeKeyDown: true,
            },
        });
    }

    onReturn() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('headNodeUnreachableTitle'),
                content: this.t('headNodeUnreachableCtx'),
                submitTitle: this.t('backClusterTopo'),
                submitFn: () => {
                    // const currentOrigin = window.location.origin;
                    // window.location.replace(`${currentOrigin}/mesh/`);
                    // this.props.history.push('/');
                    window.location.assign(`${window.location.origin}/index.html`);
                    
                },
                cancelTitle: '',
                cancelFn: this.handleDialogOnClose,
                disableBackdropClick: true,
                disableEscapeKeyDown: true,
            },
        });
    }

    onFailReturn() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('headNodeUnreachableFailTitle'),
                content: this.t('headNodeUnreachableFailCtx'),
                submitTitle: this.t('backClusterTopo'),
                submitFn: () => {
                    // const currentOrigin = window.location.origin;
                    // window.location.replace(`${currentOrigin}/mesh/`);
                    // this.props.history.push('/');
                    window.location.assign(`${window.location.origin}/index.html`);

                },
                cancelTitle: '',
                cancelFn: this.handleDialogOnClose,
                disableBackdropClick: true,
                disableEscapeKeyDown: true,
            },
        });
    }

    onFail() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('remoteNodeUnreachableFailTitle'),
                content: this.t('remoteNodeUnreachableFailCtx'),
                submitTitle: this.t('dialogSubmitLbl'),
                submitFn: () => {
                    this.setState({
                        ...this.state,
                        isPartialLock: true,
                        dialog: {
                            ...this.state.dialog,
                            open: false,
                        },
                    }, () => {
                        this.getMeshConfig(true, false);
                    });
                },
                cancelTitle: '',
                cancelFn: this.handleDialogOnClose,
                disableBackdropClick: true,
                disableEscapeKeyDown: true,
            },
        });
    }

    async getMeshConfig(needPopup, partial) {
        const {csrf, dispatch, projectId} = this.props;
        const bodyMsg1 = {allNodes: true};
        const bodyMsg2 = {
            options: {
                meshSettings: ['clusterId', 'managementIp',
                    'managementNetmask', 'country', 'bpduFilter', 'e2eEnc', 'e2eEncKey', 'globalTimezone'],
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
            const value = await getCachedConfig(csrf, projectId === '' ? Cookies.get('projectId') : projectId, bodyMsg1);
            const remoteNodeUnreachable = !allNodesReachable && hostNodesReachable

            if (this.mounted) {
                const {checksums, ...Setting} = value;
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
                        const {title, content} = check(err);
                        const errorDialog = title !== '' ?
                            {
                                ...this.state,
                                dialog: {
                                    ...this.state.dialog,
                                    open: true,
                                    title,
                                    content,
                                    submitTitle: this.t('getOptionFailBtnLbl1'),
                                    submitFn: () => {
                                        // const currentOrigin = window.location.origin;
                                        // window.location.replace(`${currentOrigin}/mesh/`);
                                        // this.props.history.push('/');
                                        window.location.assign(`${window.location.origin}/index.html`);
                                    },
                                    cancelTitle: this.t('getOptionFailBtnLbl2'),
                                    cancelFn: () => {
                                        this.handleDialogOnClose();
                                        this.getMeshConfig(true, false);
                                    },
                                    width: 'md',
                                },
                                isLock: false,
                                isPartialLock: false,
                            } :
                            {
                                ...this.state,
                                dialog: {
                                    ...this.state.dialog,
                                    open: true,
                                    title: this.t('getOptionFailTitle'),
                                    content: this.t('getOptionFailContent'),
                                    submitTitle: this.t('getOptionFailBtnLbl1'),
                                    submitFn: () => {
                                        // const currentOrigin = window.location.origin;
                                        // window.location.replace(`${currentOrigin}/mesh/`);
                                        // this.props.history.push('/');
                                        window.location.assign(`${window.location.origin}/index.html`);
                                    },
                                    cancelTitle: this.t('getOptionFailBtnLbl2'),
                                    cancelFn: () => {
                                        this.handleDialogOnClose();
                                        this.getMeshConfig(true, false);
                                    },
                                    width: 'md',
                                },
                                isLock: false,
                                isPartialLock: false,
                            };
                        if (err.data.type === 'specific') {
                            const filterConfigErrors = get(err.data.data, ['meshSettings', 'errors', 0, 'type']);
                            if (filterConfigErrors === 'partialretrieve') {
                                this.updateFilterConfig(get(err.data.data, ['meshSettings', 'errors', 0, 'data']));
                                this.updateMeshForm(value, false);
                            } else {
                                this.setState(errorDialog);
                            }
                        } else {
                            this.setState(errorDialog);
                        }
                    }
                }
            }
        } catch (err) {
            if (this.mounted) {
                if (err.message === 'Host Node is unmanaged') {
                    this.handleUnmanagedHostnode();
                } else {
                    this.handleGetMeshError(err, needPopup);
                }
            }
        }
    }

    getDiffObj() {
        const diffObj = {};
        Object.keys(this.state.loadData).forEach((optName) => {
            if (['country', 'globalTimezone'].includes(optName)) {
                if (this.state.loadData[optName].value !== this.state.formData[optName].value) {
                    diffObj[optName] = this.state.formData[optName].value;
                }
            } else if (this.state.loadData[optName] !== this.state.formData[optName]) {
                diffObj[optName] = this.state.formData[optName];
            }
        });
        return Object.keys(diffObj).length === 0 ? false : diffObj;
    }

    getCountryLabel(countryCode) {
        let countryLabel = '';
        for (let i = 0; i < this.state.filteredConfig.country.length; i += 1) {
            if (this.state.filteredConfig.country[i].actualValue === countryCode) {
                countryLabel = this.state.filteredConfig.country[i].displayValue;
            }
        }
        return countryLabel;
    }

    getTimezoneLabel(timezoneCode) {
        let timeLabel = '';
        for (let i = 0; i < this.state.filteredConfig.globalTimezone.length; i += 1) {
            if (this.state.filteredConfig.globalTimezone[i].actualValue === timezoneCode) {
                timeLabel = this.state.filteredConfig.globalTimezone[i].displayValue;
            }
        }
        return timeLabel;
    }

    notLoggedInHandle() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('notLoggedInTitle'),
                content: this.t('notLoggedInContent', this.props.labels),
                submitTitle: this.t('notLoggedInAction'),
                submitFn: () => {
                    // const currentOrigin = window.location.origin;
                    // window.location.replace(`${currentOrigin}/mesh/`);
                    // this.props.history.push('/');
                    window.location.assign(`${window.location.origin}/index.html`);
                },
                cancelTitle: '',
                cancelFn: this.handleDialogOnClose,
                disableBackdropClick: true,
                disableEscapeKeyDown: true,
            },
        });
    }

    handleLock(isLock, isPartialLock) {
        this.setState({
            ...this.state,
            isLock,
            isPartialLock,
        });
    }

    // getNodeInfo() {
    //     getNodeInfo(this.props.csrf, {allNodes: true})
    //     .then((managedDeviceInfo) => {
    //         if (this.mounted) {
    //             this.updateHostName(managedDeviceInfo);
    //         }
    //     }
    //     ).catch((error) => {
    //         if (this.mounted) {
    //             const partialManagedDeviceInfo = {};
    //             if (error.message === 'P2Error') {
    //                 const msg = error.data;
    //                 if (msg.type === 'specific') {
    //                     Object.keys(msg.data).forEach((key) => {
    //                         if (msg.data[key].success === true) {
    //                             partialManagedDeviceInfo[key] = msg.data[key].data;
    //                         }
    //                     }
    //                     );
    //                     this.updateHostName(partialManagedDeviceInfo);
    //                 }
    //             }
    //         }
    //     });
    // }


    // async getMeshTop() {
    //     try {
    //         const discrepanciesList = this.state.discrepancies;
    //         const meshTopoObj = await getMeshTopology(this.props.csrf);
    //         if (this.mounted) {
    //             let hostNodeIp = '';
    //             Object.keys(meshTopoObj).some((nodeIp) => {
    //                 if (meshTopoObj[nodeIp].isHostNode) {
    //                     hostNodeIp = nodeIp;
    //                     return true;
    //                 }
    //                 return false;
    //             });

    //             discrepanciesList[0].nodeIp = hostNodeIp;
    //             discrepanciesList[0].mac = convertIpToMac(hostNodeIp);
    //             this.setState({
    //                 discrepancies: discrepanciesList,
    //             }, () => {
    //                 this.getNodeInfo();
    //             });
    //         }
    //     } catch (err) {
    //         console.log('Get Cluster Topology Error');
    //         console.log(err);
    //         if (this.mounted) {
    //             this.updateDiscrepanciesDialog();
    //         }
    //     }
    // }

    handleUnmanagedHostnode() {
        const {dispatch} = this.props;
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('unmanagedHostnodeErrTitle'),
                content: this.t('unmanagedHostnodeErrContent'),
                nonTextContent: <span />,
                submitTitle: this.t('unmanagedHostnodeErrBtn'),
                submitFn: () => {
                    // const currentOrigin = window.location.origin;
                    // window.location.replace(`${currentOrigin}/mesh/`);
                    // this.props.history.push('/');
                    window.location.assign(`${window.location.origin}/index.html`);
                },
                cancelTitle: '',
                cancelFn: this.handleDialogOnClose,
            },
            isLock: false,
            isPartialLock: false,
        });
        dispatch(closeSnackbar());
    }

    updateFilterConfig(Config) {
        if (!this.mounted) {
            return;
        }
        const filteredConfig = {};

        if (Config.country !== 'undefined' && Config.country.type === 'enum') {
            const countries = [];
            Config.country.data.forEach((country) => {
                if (country.actualValue !== 'DB') {
                    countries.push({
                        actualValue: country.actualValue,
                        displayValue: `${country.displayValue} (${country.actualValue.toUpperCase()})`,
                    });
                }
            });
            filteredConfig.country = countries;
        }
        if (Config.managementIp !== 'undefined' && Config.managementIp.type === 'regex') {
            filteredConfig.managementIp = Config.managementIp.data;
        }
        if (Config.managementNetmask !== 'undefined' && Config.managementNetmask.type === 'regex') {
            filteredConfig.managementNetmask = Config.managementNetmask.data;
        }
        if (Config.clusterId !== 'undefined' && Config.clusterId.type === 'regex') {
            filteredConfig.clusterId = Config.clusterId.data;
        }
        if (Config.bpduFilter !== 'undefined') {
            filteredConfig.bpduFilter = Config.bpduFilter;
        }
        if (Config.e2eEnc !== 'undefined' && Config.e2eEnc.type === 'enum') {
            filteredConfig.e2eEnc = Config.e2eEnc.data;
        }
        if (Config.e2eEncKey !== 'undefined' && Config.e2eEncKey.type === 'regex') {
            filteredConfig.e2eEncKey = Config.e2eEncKey.data;
        }
        if (Config.globalTimezone !== 'undefined' && Config.globalTimezone.type === 'enum') {
            filteredConfig.globalTimezone = Config.globalTimezone.data;
        }
        if (Object.keys(filteredConfig).length === 8) {
            this.setState({
                ...this.state,
                filteredConfig,
            }, () => {
                this.props.setFilteredConfig(filteredConfig);
            });
        } else {
            this.setState({
                ...this.state,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('getOptionFailTitle'),
                    content: this.t('getOptionFailContent'),
                    submitTitle: this.t('getOptionFailBtnLbl1'),
                    submitFn: () => {
                        // const currentOrigin = window.location.origin;
                        // window.location.replace(`${currentOrigin}/mesh/`);
                        // this.props.history.push('/');
                        window.location.assign(`${window.location.origin}/index.html`);
                    },
                    cancelTitle: this.t('getOptionFailBtnLbl2'),
                    cancelFn: () => {
                        this.handleDialogOnClose();
                        this.getMeshConfig(true, false);
                    },
                    width: 'md',
                },
                isLock: false,
                isPartialLock: false,
            });
        }
    }

    // searchCountry(actualValue) {
    //     const countryList = [...this.state.filteredConfig.country];
    //     let result = '';
    //     countryList.some((countryObj) => {
    //         if (countryObj.actualValue === actualValue) {
    //             result = countryObj.displayValue;
    //             return true;
    //         }
    //         return false;
    //     });
    //     return result;
    // }

    validateClusterID(inputValue, helperText) {
        const clusterIdPattern = new RegExp(this.state.filteredConfig.clusterId);
        let isValidObj = formValidator('isRequired', inputValue, null, helperText);
        if (isValidObj.result) {
            isValidObj = formValidator('matchRegex', inputValue, clusterIdPattern, helperText);
            if (!isValidObj.result) {
                isValidObj.text = this.t('validateClusterIDText');
            }
        }
        return isValidObj;
    }

    validatePresharedKey(inputValue, helperText) {
        const regexPattern = /^[0-9a-zA-Z]{1,16}$/;
        let isValidObj = formValidator('isRequired', inputValue, null, helperText);
        if (isValidObj.result) {
            isValidObj = formValidator('matchRegex', inputValue, regexPattern, helperText);
            if (!isValidObj.result) {
                isValidObj.text = this.t('validatePresharedKeyText');
            }
        }
        return isValidObj;
    }

    validateManagementIp(inputValue, helperText) {
        const netIpRegexPattern = new RegExp(this.state.filteredConfig.managementIp);
        let isValidObj = formValidator('isRequired', inputValue, null, helperText);
        if (isValidObj.result) {
            isValidObj = formValidator('matchRegex', inputValue, netIpRegexPattern, helperText);
            if (!isValidObj.result) {
                isValidObj.text = this.t('validateIPv4Field');
            }
        }
        return isValidObj;
    }

    validateManagementNetmask(inputValue, helperText) {
        const netmaskRegexPattern = new RegExp(this.state.filteredConfig.managementNetmask);
        let isValidObj = formValidator('isRequired', inputValue, null, helperText);
        if (isValidObj.result) {
            isValidObj = formValidator('matchRegex', inputValue, netmaskRegexPattern, helperText);
            if (!isValidObj.result) {
                isValidObj.text = this.t('validateMngmtNtmskText');
            }
        }
        return isValidObj;
    }

    validateGlobalTimezone(inputValue, helpText) {
        const globalTimezoneList = [...this.state.filteredConfig.globalTimezone];
        let isValidObj = formValidator('isRequired', inputValue, helpText);
        if (isValidObj.result) {
            isValidObj = formValidator('enum', inputValue, globalTimezoneList, helpText);
            if (!isValidObj.result) {
                isValidObj.text = this.t('validateGlobalTimezoneText');
            }
        }
        return isValidObj;
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
            e2eEnc: config.meshSettings.e2eEnc,
            e2eEncKey: config.meshSettings.e2eEncKey,
            globalDiscoveryInterval: config.meshSettings.globalDiscoveryInterval,
            globalHeartbeatInterval: config.meshSettings.globalHeartbeatInterval,
            globalHeartbeatTimeout: config.meshSettings.globalHeartbeatTimeout,
            globalStaleTimeout: config.meshSettings.globalStaleTimeout,
            globalRoamingRSSIMargin: config.meshSettings.globalRoamingRSSIMargin,
            globalAllowActiveLinkDrop: config.meshSettings.globalAllowActiveLinkDrop,
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
            e2eEnc: config.meshSettings.e2eEnc,
            e2eEncKey: config.meshSettings.e2eEncKey,
            globalDiscoveryInterval: config.meshSettings.globalDiscoveryInterval,
            globalHeartbeatInterval: config.meshSettings.globalHeartbeatInterval,
            globalHeartbeatTimeout: config.meshSettings.globalHeartbeatTimeout,
            globalAllowActiveLinkDrop: config.meshSettings.globalAllowActiveLinkDrop,
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
        if (discrepanciesList.length > 1) {
            this.setState({
                ...this.state,
                discrepancies: discrepanciesList,
            }, () => {
                this.props.addDiscrepancies(discrepanciesList, 'general');
            });
        } else {
            this.setState({
                isLock: false,
                isPartialLock: false,
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

    updateMeshForm(meshTopoObj, partial) {
        const {dispatch} = this.props;
        const clusterIdHelperText = this.t('inputObj.clusterId.helperText');
        const managementIpHelperText = this.t('inputObj.managementIp.helperText');
        const managementNetmaskHelperText = this.t('inputObj.managementNetmask.helperText');
        const globalTimezoneHelperText = this.t('inputObj.globalTimezone.helperText');
        const countryHelperText = this.t('inputObj.country.helperText');
        const passwordHelperText = this.t('inputObj.password.helperText');
        const clusterIDValidateObj = this.validateClusterID(meshTopoObj.meshSettings.clusterId, clusterIdHelperText);
        const managementIpValidateObj =
            this.validateManagementIp(meshTopoObj.meshSettings.managementIp, managementIpHelperText);
        const managementNetmaskValidateObj =
            this.validateManagementNetmask(meshTopoObj.meshSettings.managementNetmask, managementNetmaskHelperText);
        const countryLabel = meshTopoObj.meshSettings.country !== 'DB' ?
            this.getCountryLabel(meshTopoObj.meshSettings.country) :
            'Debug';
        const globalTimezoneValidateObj = this.validateGlobalTimezone(
            meshTopoObj.meshSettings.globalTimezone, globalTimezoneHelperText
        );
        const timezoneLabel = this.getTimezoneLabel(meshTopoObj.meshSettings.globalTimezone);

        this.setState({
            ...this.state,
            rawGetConfig: meshTopoObj,
            loadData: {
                ...this.state.loadData,
                encKey: meshTopoObj.meshSettings.encKey,
                clusterId: meshTopoObj.meshSettings.clusterId,
                country: {value: meshTopoObj.meshSettings.country, label: countryLabel},
                // rtsCts: meshTopoObj.meshSettings.rtsCts,
                managementIp: meshTopoObj.meshSettings.managementIp,
                managementNetmask: meshTopoObj.meshSettings.managementNetmask,
                bpduFilter: meshTopoObj.meshSettings.bpduFilter,
                e2eEnc: meshTopoObj.meshSettings.e2eEnc,
                e2eEncKey: meshTopoObj.meshSettings.e2eEncKey,
                globalTimezone: {value: meshTopoObj.meshSettings.globalTimezone, label: timezoneLabel},
            },
            formData: {
                ...this.state.formData,
                encKey: meshTopoObj.meshSettings.encKey,
                clusterId: meshTopoObj.meshSettings.clusterId,
                country: {value: meshTopoObj.meshSettings.country, label: countryLabel},
                // rtsCts: meshTopoObj.meshSettings.rtsCts,
                managementIp: meshTopoObj.meshSettings.managementIp,
                managementNetmask: meshTopoObj.meshSettings.managementNetmask,
                bpduFilter: meshTopoObj.meshSettings.bpduFilter,
                e2eEnc: meshTopoObj.meshSettings.e2eEnc,
                e2eEncKey: meshTopoObj.meshSettings.e2eEncKey,
                globalTimezone: {value: meshTopoObj.meshSettings.globalTimezone, label: timezoneLabel},
            },
            formStatus: {
                ...this.state.formStatus,
                clusterId: clusterIDValidateObj.result,
                // rtsCts: rtsCtsValidateObj.result,
                managementIp: managementIpValidateObj.result,
                managementNetmask: managementNetmaskValidateObj.result,
                globalTimezone: globalTimezoneValidateObj.result,
            },
            errorStatus: {
                ...this.state.errorStatus,
                clusterId: !clusterIDValidateObj.result,
                // rtsCts: !rtsCtsValidateObj.result,
                managementIp: !managementIpValidateObj.result,
                managementNetmask: !managementNetmaskValidateObj.result,
                globalTimezone: !globalTimezoneValidateObj.result,
            },
            statusText: {
                ...this.state.statusText,
                clusterId: clusterIDValidateObj.text,
                // rtsCts: rtsCtsValidateObj.text,
                managementIp: managementIpValidateObj.text,
                managementNetmask: managementNetmaskValidateObj.text,
                globalTimezone: globalTimezoneValidateObj.text,
                password: passwordHelperText,
                country: countryHelperText,
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

    async handleGetMeshError(error, needPopup) {
        const {csrf, dispatch, projectId} = this.props;
        const mismatchSecret = isMismatchSecret(error, 'getconfig');
        const unreachedNode = isUnreachedNode(error);
        const bodyMsg2 = {
            options: {
                meshSettings: ['clusterId', 'managementIp',
                    'managementNetmask', 'country', 'bpduFilter', 'e2eEnc', 'e2eEncKey', 'globalTimezone'],
            },
            sourceConfig: {},
        };
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
            dispatch(toggleSnackBar(this.t('retrieveMeshObjPartialSnackbar'), null));
            if (get(error.data.data, ['meshSettings', 'data']) &&
            Object.keys(error.data.data.meshSettings.data).length === 0) {
                this.handleUnmanagedHostnode();
            } else if (error.message === 'P2Error') {
                if (typeof error.data.data.checksums !== 'undefined') {
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
                            this.setState({
                                dialog: {
                                    ...this.state.dialog,
                                    open: true,
                                    title: this.t('getMeshFailTitle'),
                                    content: this.t('getMeshFailContent', this.props.labels),
                                    nonTextContent: <span />,
                                    submitTitle: this.t('dialogSubmitLbl'),
                                    submitFn: this.handleDialogOnClose,
                                    cancelTitle: '',
                                    cancelFn: this.handleDialogOnClose,
                                    width: 'sm',
                                },
                            });
                        }
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
                        if (err.message === 'P2Error') {
                            const {title, content} = check(err);
                            const errorDialog = title !== '' ?
                                {
                                    ...this.state,
                                    dialog: {
                                        ...this.state.dialog,
                                        open: true,
                                        title,
                                        content,
                                        submitTitle: this.t('getOptionFailBtnLbl1'),
                                        submitFn: () => {
                                            // const currentOrigin = window.location.origin;
                                            // window.location.replace(`${currentOrigin}/mesh/`);
                                            // this.props.history.push('/');
                                            window.location.assign(`${window.location.origin}/index.html`);
                                        },
                                        cancelTitle: this.t('getOptionFailBtnLbl2'),
                                        cancelFn: () => {
                                            this.handleDialogOnClose();
                                            this.getMeshConfig(true, false);
                                        },
                                        width: 'md',
                                    },
                                    isLock: false,
                                    isPartialLock: false,
                                } :
                                {
                                    ...this.state,
                                    dialog: {
                                        ...this.state.dialog,
                                        open: true,
                                        title: this.t('getOptionFailTitle'),
                                        content: this.t('getOptionFailContent'),
                                        submitTitle: this.t('getOptionFailBtnLbl1'),
                                        submitFn: () => {
                                            // const currentOrigin = window.location.origin;
                                            // window.location.replace(`${currentOrigin}/mesh/`);
                                            // this.props.history.push('/');
                                            window.location.assign(`${window.location.origin}/index.html`);
                                        },
                                        cancelTitle: this.t('getOptionFailBtnLbl2'),
                                        cancelFn: () => {
                                            this.handleDialogOnClose();
                                            this.getMeshConfig(true, false);
                                        },
                                        width: 'md',
                                    },
                                    isLock: false,
                                    isPartialLock: false,
                                };
                            if (err.data.type === 'specific') {
                                const filterConfigErrors = get(err.data.data, ['meshSettings', 'errors', 0, 'type']);
                                if (filterConfigErrors === 'partialretrieve') {
                                    if (needPopup) {
                                        this.setState({
                                            dialog: {
                                                ...this.state.dialog,
                                                open: true,
                                                title: this.t('getMeshFailTitle'),
                                                content: this.t('getMeshFailContent', this.props.labels),
                                                nonTextContent: <span />,
                                                submitTitle: this.t('dialogSubmitLbl'),
                                                submitFn: this.handleDialogOnClose,
                                                cancelTitle: '',
                                                cancelFn: this.handleDialogOnClose,
                                                width: 'sm',
                                            },
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
                                            meshSettings: getMeshConfigErrorData(
                                                [...error.data.data.meshSettings.errors]),
                                        };
                                    }
                                    this.updateMeshForm(meshTopoObj, true);
                                } else {
                                    this.setState(errorDialog);
                                }
                            } else {
                                this.setState(errorDialog);
                            }
                        }
                    }
                } else {
                    if (needPopup) {
                        const {title, content} = check(error);
                        if (title !== '') {
                            this.setState({
                                dialog: {
                                    ...this.state.dialog,
                                    open: true,
                                    title,
                                    content,
                                    submitTitle: this.t('dialogSubmitLbl'),
                                    submitFn: this.handleDialogOnClose,
                                    cancelTitle: '',
                                    isLock: false,
                                },
                            });
                        } else {
                            this.setState({
                                dialog: {
                                    ...this.state.dialog,
                                    open: true,
                                    title: this.t('getMeshFailTitle'),
                                    content: this.t('getMeshFailContent', this.props.labels),
                                    nonTextContent: <span />,
                                    submitTitle: this.t('dialogSubmitLbl'),
                                    submitFn: this.handleDialogOnClose,
                                    cancelTitle: '',
                                    cancelFn: this.handleDialogOnClose,
                                    width: 'sm',
                                },
                            });
                        }
                    }
                    this.timer = setTimeout(() => {
                        this.getMeshConfig(false, true);
                    }, timeout.error);
                }
            }
        }
        // hide the notification
    }

    handleSecretMismatch() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('invalidSecretTitle'),
                content: this.t('invalidSecretContent'),
                submitTitle: this.t('invalidSubmitLbl'),
                submitFn: () => {
                    // Cookies.set('openManagedDeviceList', true);
                    // const currentOrigin = window.location.origin;
                    // window.location.replace(`${currentOrigin}/mesh/`);

                    this.props.dispatch(openDeviceListDialog());
                    // this.props.history.push('/');
                    window.location.assign(`${window.location.origin}/index.html`);
                },
                cancelTitle: '',
                cancelFn: this.handleDialogOnClose,
                disableBackdropClick: true,
                disableEscapeKeyDown: true,
            },
        });
    }

    handleClickShowPasssword() {
        this.setState({showPassword: !this.state.showPassword});
    }

    triggerFormStatus(field, status, text, inputValue) {
        this.setState({
            ...this.state,
            formStatus: {...this.state.formStatus, [field]: status},
            errorStatus: {...this.state.errorStatus, [field]: !status},
            statusText: {...this.state.statusText, [field]: text},
            formData: {...this.state.formData, [field]: inputValue},
        });
    }

    async login() {
        const {csrf} = this.props;
        const {formData, override} = this.state;
        const bodyMsg = {
            username: 'admin',
            password: formData.password,
        };
        try {
            const res = await validateUserCredential(csrf, bodyMsg);
            if (!this.mounted) {
                return;
            }
            if (res.isValid) {
                if (override.status) {
                    this.checkTimezoneChange(override.ctx);
                    this.setState({
                        override: {
                            ...this.state.override,
                            status: false,
                        },
                    });
                } else {
                    this.handleCountryLock();
                }
                this.handleCountryDialogOnClose();
            } else {
                this.triggerFormStatus('password', false, this.t('invalidPwdLbl'), formData.password);
            }
        } catch (err) {
            if (!this.mounted) {
                return;
            }
            this.triggerFormStatus('password', false, this.t('runtimeErrLbl'), formData.password);
        }
    }

    handleChange(event, key = false) {
        let inputID = '';
        let inputValue = '';

        if (!key) {
            inputID = (event.target.id || event.target.name);
            inputValue = event.target.value;
        } else {
            inputID = key;
            inputValue = event;
        }

        const helperText = this.t(`inputObj.${inputID}.helperText`);
        const regexPattern = /^[0-9a-zA-Z]{8,32}$/;

        let isValidObj = {};

        switch (inputID) {
            case 'clusterId':
                isValidObj = this.validateClusterID(inputValue, helperText);
                break;
            case 'presharedKey':
                isValidObj = this.validatePresharedKey(inputValue, helperText);
                break;
            case 'managementIp':
                isValidObj = this.validateManagementIp(inputValue, helperText);
                break;
            case 'managementNetmask':
                isValidObj = this.validateManagementNetmask(inputValue, helperText);
                break;
            case 'rtsCts':
                isValidObj = validateRtsCts(inputValue, helperText);
                break;
            case 'password':
                isValidObj = formValidator('isRequired', inputValue);
                if (isValidObj.result) {
                    isValidObj = formValidator('matchRegex', inputValue, regexPattern);
                    if (!isValidObj.result) {
                        isValidObj.text = this.t('validateRegexText');
                    }
                }
                if (isValidObj.text === '') {
                    isValidObj.text = this.t('inputObj.password.helperText');
                }
                break;
            case 'globalTimezone':
                isValidObj = this.validateGlobalTimezone(inputValue.value, helperText);
                break;
            default:
                isValidObj = formValidator('isRequired', inputValue, null, helperText);
        }

        this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text, inputValue);
    }

    handleDialogOnClose() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: false,
            },
        });
    }

    handleCountryDialogOnClose() {
        this.setState({
            countryDialog: false,
            formData: {
                ...this.state.formData,
                password: this.state.loadData.password,
            },
            errorStatus: {
                ...this.state.errorStatus,
                password: this.state.defaultErrorStatus.password,
            },
            statusText: {
                ...this.state.statusText,
                password: this.t('inputObj.password.helperText'),
            },
            formStatus: {
                ...this.state.formStatus,
                password: this.state.defaultFormStatus.password,
            },
            showPassword: false,
        });
    }

    handleCountryLock() {
        const countryList = JSON.parse(JSON.stringify(this.state.filteredConfig.country));
        if (!this.state.debugMode && !this.props.enableDebugCountry) {
            const filteredCountry = countryList.filter(country => country.displayValue !== 'Debug');
            if (this.state.formData.country === 'DB') {
                this.setState({
                    ...this.state,
                    errorStatus: {
                        ...this.state.errorStatus,
                        country: true,
                    },
                    statusText: {
                        ...this.state.statusText,
                        country: this.t('debugStatusText'),
                    },
                });
            }
            this.setState({
                ...this.state,
                countryLock: false,
                filteredConfig: {
                    ...this.state.filteredConfig,
                    country: filteredCountry,
                },
            });
        } else {
            const index = countryList.findIndex(country => country.displayValue === 'Debug');
            if (index === -1) {
                countryList.push({displayValue: 'Debug', actualValue: 'DB'});
            }
            this.setState({
                ...this.state,
                countryLock: false,
                filteredConfig: {
                    ...this.state.filteredConfig,
                    country: countryList,
                },
                errorStatus: {
                    ...this.state.errorStatus,
                    country: this.state.defaultErrorStatus.country,
                },
                statusText: {
                    ...this.state.statusText,
                    country: this.t('inputObj.country.helperText'),
                },
                debugMode: false,
            });
        }
    }

    clickReset() {
        const countryList = JSON.parse(JSON.stringify(this.state.filteredConfig.country));
        const index = countryList.findIndex(country => country.displayValue === 'Debug');
        if (index === -1 && this.state.loadData.country === 'DB') {
            countryList.push({displayValue: 'Debug', actualValue: 'DB'});
        }
        this.setState({
            formData: this.state.loadData,
            errorStatus: this.state.defaultErrorStatus,
            formStatus: this.state.defaultFormStatus,
            statusText: {
                clusterId: this.t('inputObj.clusterId.helperText'),
                managementIp: this.t('inputObj.managementIp.helperText'),
                managementNetmask: this.t('inputObj.managementNetmask.helperText'),
                country: this.t('inputObj.country.helperText'),
                password: this.t('inputObj.password.helperText'),
                globalTimezone: this.t('inputObj.globalTimezone.helperText'),
            },
            countryLock: true,
            filteredConfig: {
                ...this.state.filteredConfig,
                country: countryList,
            },
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
                {this.t('saveSuccessDialogClstID')} <b>{this.state.formData.clusterId}</b>
                <br />
                {this.t('saveSuccessDialogMgmtIP')} <b>{this.state.formData.managementIp}</b>
                <br />
                {this.t('saveSuccessDialogMgmtNtmsk')} <b>{this.state.formData.managementNetmask}</b>
            </span>
        );
        dialog.submitTitle = this.t('saveSuccessDialogSbmtLbl');
        dialog.submitFn = () => {
            // const currentOrigin = window.location.origin;
            // window.location.replace(`${currentOrigin}/mesh/`);
            // this.props.history.push('/');
            window.location.assign(`${window.location.origin}/index.html`);
        };
        dialog.cancelTitle = '';
        dialog.cancelFn = this.handleDialogOnClose;
        dialog.width = 'sm';

        // stop progress bar
        this.props.dispatch(updateProgressBar(false));
        this.props.onLoadingAct(false);
        this.setState({
            loadData: this.state.formData,
            dialog,
        });
    }

    checkTimezoneChange(saveConfigObj, isSync = false) {
        if (saveConfigObj.diff.meshSettings.globalTimezone) {
            this.setState({
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('timezoneChangeTitle'),
                    content: '',
                    nonTextContent: (
                        <Typography style={{color: colors.dialogText}}>
                            {this.t('timezoneChangeContent0')}
                            <BuildIcon style={{fontSize: '15px', paddingLeft: '3px'}} />
                            {this.t('timezoneChangeContent1')}
                        </Typography>
                    ),
                    submitTitle: this.t('dialogSubmitLbl'),
                    submitFn: () => {
                        this.handleDialogOnClose();
                        this.checkCountryChange(saveConfigObj, isSync);
                    },
                    cancelTitle: this.t('confirmCancelLbl'),
                    cancelFn: this.handleDialogOnClose,
                    width: 'sm',
                },
            });
        } else {
            this.checkCountryChange(saveConfigObj, isSync);
        }
    }

    async checkCountryChange(saveConfigObj, isSync = false, isReset = false) {
        const {rawGetConfig, invalidFilterConfig} = this.state;
        const {csrf, projectId} = this.props;
        const excludeErrCheckOpt = ['acsChannelList']
        
        if ('country' in saveConfigObj.diff.meshSettings) {
            try {
                this.setState({isLock: true});
                const newSaveConfigObj = {
                    ...rawGetConfig,
                    meshSettings: {
                        ...rawGetConfig.meshSettings,
                        ...saveConfigObj.diff.meshSettings,
                    },
                };
                const bodyMsg = this.createGetFilteredConfigBodyMsg(deepClone(newSaveConfigObj));
                const filteredConfig = await getFilteredConfigOptions(csrf, projectId, bodyMsg);

                let {success, invalidFilterConfigRes} = checkConfigValue(
                    invalidFilterConfig, filteredConfig, deepClone(bodyMsg.sourceConfig), Object.keys(rawGetConfig.nodeSettings)
                );

                // force write default acs channel list (read from get filtered config options)
                if (invalidFilterConfigRes &&
                    invalidFilterConfigRes.nodeSettings
                ) {
                    for (let nodeIp in invalidFilterConfigRes.nodeSettings) {
                        excludeErrCheckOpt.forEach((excludedOpt) => {
                            if (invalidFilterConfigRes.nodeSettings[nodeIp][excludedOpt]) {
                                const defaultAcsChannelListObjArr = filteredConfig.nodeSettings[nodeIp][excludedOpt].data;
                                const defaultAcsChannelListValArr = 
                                    defaultAcsChannelListObjArr.map((defaultAcsChannelListObj) => {
                                        return defaultAcsChannelListObj.actualValue;
                                    })
                                
                                // nullish assignment
                                if (typeof saveConfigObj.diff.nodeSettings === 'undefined') {
                                    saveConfigObj.diff.nodeSettings = {};
                                }

                                if (typeof saveConfigObj.diff.nodeSettings[nodeIp] === 'undefined') {
                                    saveConfigObj.diff.nodeSettings[nodeIp] = {};
                                }

                                saveConfigObj.diff.nodeSettings[nodeIp].acsChannelList = defaultAcsChannelListValArr
                                
                                delete invalidFilterConfigRes.nodeSettings[nodeIp].acsChannelList;

                                if (Object.keys(invalidFilterConfigRes.nodeSettings[nodeIp]).length === 0) {
                                    delete invalidFilterConfigRes.nodeSettings[nodeIp];
                                }
                            }
                        });
                    }
                }

                console.log(invalidFilterConfigRes);

                // check if only acs channel list issues
                if (
                    invalidFilterConfigRes &&
                    Object.keys(invalidFilterConfigRes.meshSettings).length === 0 &&
                    Object.keys(invalidFilterConfigRes.radioSettings).length === 0 &&
                    Object.keys(invalidFilterConfigRes.ethernetSettings).length === 0 &&
                    Object.keys(invalidFilterConfigRes.profileSettings).length === 0 &&
                    Object.keys(invalidFilterConfigRes.nodeSettings).length === 0
                ) {
                    success = true;
                }
                
                if (success) {
                    this.saveProcess(saveConfigObj, isSync);
                    this.setState({isLock: false});
                } else {
                    this.setState({
                        invalidFilterConfig: invalidFilterConfigRes,
                        invalidConfigDialogOpen: true,
                        invalidFilterConfigActionFn: () => {
                            this.handleInvalidDialogOnClose();
                            this.saveProcess(saveConfigObj, isSync, true);
                        },
                        isLock: false,
                    });
                }
            } catch (err) {
                this.saveProcessError(err, isSync)
            }
        } else {
            this.saveProcess(saveConfigObj, isSync);
        }
    }

    saveProcess(saveConfigObj, isSync = false, isReset = false) {
        const {dispatch} = this.props;
        const newSaveConfigObj = deepClone(saveConfigObj);
        newSaveConfigObj.options = {isResetRadio: isReset};
        // console.log('kyle_debug ~ file: meshSettings.jsx ~ line 1901 ~ MeshSettingsApp ~ saveProcess ~ newSaveConfigObj', newSaveConfigObj)
        dispatch(toggleSnackBar(this.t('savingConfigSnackbar')));
        this.props.onLoadingAct(true);

        const p = setConfig(this.props.csrf,
            this.props.projectId === '' ? Cookies.get('projectId') : this.props.projectId, newSaveConfigObj);

        p.then((value) => {
            setTimeout(() => {
                this.saveSuccessHandler();
            }, value.rtt * 1000);
        }).catch((error) => {
            this.saveProcessError(error, isSync);
        });
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
            this.setState({
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('saveFailDialogTitle'),
                    content: isSync ? this.t('saveFailDialogSyncContent') :
                        this.t('saveFailDialogContent'),
                    nonTextContent: <span />,
                    submitTitle: this.t('dialogSubmitLbl'),
                    submitFn: this.handleDialogOnClose,
                    cancelTitle: '',
                    cancelFn: this.handleDialogOnClose,
                    width: 'sm',
                },
            });
        }
    }

    clickSync() {
        const {legacySyncValue, discrepanciesValue} = this.state;
        const saveConfigObj = {
            checksums: this.state.hash,
            diff: {
                meshSettings: discrepanciesValue,
            },
        };
        delete saveConfigObj.diff.meshSettings.password;
        // if (this.state.ignoreBpduSync) {
        //     delete saveConfigObj.diff.meshSettings.bpduFilter;
        // }
        if (Object.keys(legacySyncValue).length !== 0) {
            Object.keys(legacySyncValue).forEach((key) => {
                saveConfigObj.diff.meshSettings[key] = legacySyncValue[key];
            });
        }

        this.checkTimezoneChange(saveConfigObj, true);
    }

    createGetFilteredConfigBodyMsg(getConfigValue) {
        const {checksums, ...sourceConfig} = deepClone(getConfigValue);
        const options = getOptionsFromGetConfigObj(sourceConfig);
        const bodyMsg = {
            options,
            sourceConfig: deepClone(sourceConfig),
        };

        return bodyMsg;
    }

    clickSave() {
        const meshSettingsDiff = this.getDiffObj();
        if (!meshSettingsDiff) {
            this.setState({
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('noChangesWarningTitle'),
                    content: this.t('noChangesWarningContent'),
                    nonTextContent: <span />,
                    submitTitle: this.t('dialogSubmitLbl'),
                    submitFn: this.handleDialogOnClose,
                    cancelTitle: '',
                    cancelFn: this.handleDialogOnClose,
                    width: 'sm',
                },
            });
        } else {
            this.confirmSaveAction(false);
        }
    }

    handleInvalidDialogOnClose() {
        // this.setState({
        //     invalidConfigDialog: {
        //         ...this.state.dialog,
        //         open: false,
        //     },
        // });
        this.setState({
            invalidConfigDialogOpen: false,
            invalidFilterConfig: {
                meshSettings: {},
                radioSettings: {},
                nodeSettings: {},
                ethernetSettings: {},
                profileSettings: {},
                expanded: {
                    meshSettings: false,
                    node: {},
                },
            },
        });
    }

    confirmSaveAction () {
        const saveConfigObj = {
            checksums: this.state.hash,
            diff: {
                meshSettings: this.getDiffObj(),
            },
        };
        delete saveConfigObj.diff.meshSettings.password;
        delete saveConfigObj.diff.meshSettings.bpduFilter;
        delete saveConfigObj.diff.meshSettings.encKey;
        const dialog = {...this.state.dialog};
        const {discrepancies} = {...this.state};
        dialog.open = true;
        dialog.title = discrepancies.length > 0 ?
            this.t('confirmOverrideTitle') : this.t('confirmSaveTitle');
        dialog.content = discrepancies.length > 0 ?
            (
                <span>
                    <span style={{marginBottom: '15px', display: 'block'}}>
                        {this.t('confirmOverrideContent')}
                    </span>
                    {this.t('confirmOverrideContent2')}
                </span>
            )
            :
            (
                <span>
                    <span style={{marginBottom: '15px', display: 'block'}}>
                        <Trans
                            defaults={this.t('confirmSaveContent')}
                            components={{ bold: <strong /> }}
                        />
                    </span>
                    {saveConfigObj.diff.meshSettings.globalTimezone && (
                        <Typography style={{color: colors.dialogText}}>
                            <Trans
                                defaults={this.t('confirmSaveContent4')}
                                components={{ bold: <strong /> }}
                            />
                            <BuildIcon style={{fontSize: '15px', paddingLeft: '3px'}} />
                            <Trans
                                defaults={this.t('confirmSaveContent5')}
                                components={{ bold: <strong /> }}
                            />
                        </Typography>)}
                    <br />
                    {this.t('confirmSaveContent2')}
                </span>
            );
        dialog.nonTextContent = (<span />);
        dialog.submitTitle = this.t('confirmSubmitLbl');
        dialog.submitFn = () => {
            if (discrepancies.length === 0 ||
                (
                    discrepancies
                        .filter(discrepancy => discrepancy.nodeIp !== 'expectedConfig')
                        .every(discrepancy => !('country' in discrepancy))
                )
            ) {
                this.handleDialogOnClose();
                this.checkCountryChange(saveConfigObj);
            } else {
                this.setState({
                    ...this.state,
                    countryDialog: true,
                    override: {
                        ...this.state.override,
                        status: true,
                        ctx: saveConfigObj,
                    },
                    dialog: {
                        ...this.state.dialog,
                        open: false,
                    },
                });
            }
        };
        dialog.cancelTitle = this.t('confirmCancelLbl');
        dialog.cancelFn = this.handleDialogOnClose;
        dialog.width = 'sm';
        this.setState({
            dialog,
        });
    }

    enterToSubmit(event) {
        if (event.key === 'Enter') {
            this.clickSave();
        }
    }

    enterToLogin(event) {
        if (event.key === 'Enter') {
            this.login();
        }
    }

    handleChangeCountry() {
        if (this.state.countryLock) {
            this.setState({
                ...this.state,
                countryDialog: true,
            });
        } else {
            const countryList = JSON.parse(JSON.stringify(this.state.filteredConfig.country));
            const index = countryList.findIndex(country => country.displayValue === 'Debug');
            if (index === -1 && this.state.loadData.country === 'DB') {
                countryList.push({displayValue: 'Debug', actualValue: 'DB'});
            }
            this.setState({
                ...this.state,
                errorStatus: {
                    ...this.state.errorStatus,
                    country: this.state.defaultErrorStatus.country,
                },
                statusText: {
                    ...this.state.statusText,
                    country: this.t('inputObj.country.helperText'),
                },
                formData: {
                    ...this.state.formData,
                    country: this.state.loadData.country,
                },
                filteredConfig: {
                    ...this.state.filteredConfig,
                    country: countryList,
                },
                countryLock: true,
            });
        }
    }

    handleDebugCheck() {
        this.setState({
            ...this.state,
            debugMode: !this.state.debugMode,
        });
    }

    checkDebugMode(countryList) {
        if (this.props.enableDebugCountry) {
            const index = countryList.findIndex(country => country.displayValue === 'Debug');
            if (index === -1) {
                countryList.push({displayValue: 'Debug', actualValue: 'DB'});
            }
            return countryList;
        }
        const filteredCountry = countryList.filter(country => country.displayValue !== 'Debug');
        return filteredCountry;
    }

    render() {
        const {
            formData, statusText, formStatus, errorStatus, showPassword,
            countryDialog, filteredConfig, isPartialLock, discrepancies,
            invalidFilterConfig, invalidConfigDialogOpen, invalidFilterConfigActionFn,
        } = this.state;

        const {ipToHostnameMap, ipToMacMap} = this.props;


        const {
            clusterId, country, managementIp, managementNetmask, password, globalTimezone
        } = formStatus;

        const submitDisabled = !clusterId || !country || !managementIp || !managementNetmask || !globalTimezone ||
            discrepancies.length > 0;

        const passwordDisabled = !password;

        let isEnterToSubmit = function () { return false; };
        let isEnterToLogin = function () { return false; };
        if (!submitDisabled) {
            isEnterToSubmit = this.enterToSubmit;
        }
        if (!passwordDisabled) {
            isEnterToLogin = this.enterToLogin;
        }

        // let countryObj2 = [];
        // console.log('-----filteredConfig-----');
        // console.log(filteredConfig.country);
        // countryObj2 = Object.keys(filteredConfig).length !== 0 ?
        //     filteredConfig.country.data : [{value: '', title: ''}];
        // console.log(countryObj2);

        const invalidConfigDialog = invalidConfigDialogOpen && (
            <InvalidConfigContainer
                meshSettings={invalidFilterConfig.meshSettings}
                nodeSettings={invalidFilterConfig.nodeSettings}
                radioSettings={invalidFilterConfig.radioSettings}
                ethernetSettings={invalidFilterConfig.ethernetSettings}
                profileSettings={invalidFilterConfig.profileSettings}
                expanded={invalidFilterConfig.expanded}
                open={invalidConfigDialogOpen}
                hostnameMap={ipToHostnameMap}
                macMap={ipToMacMap}
            >
                {(open, content) => (
                    <P2Dialog
                        open={open}
                        handleClose={this.handleInvalidDialogOnClose}
                        title={this.t('countryConflictTitle')}
                        content={(
                            <span style={{marginBottom: '15px'}}>
                                <Trans
                                    defaults={this.t('countryConflictDescription')}
                                    components={{ bold: <strong /> }}
                                />
                            </span>
                        )}
                        nonTextContent={content}
                        actionTitle={this.t('countryConflictActionLbl')}
                        actionFn={invalidFilterConfigActionFn}
                        cancelActTitle={this.t('changeCountryCancelLbl')}
                        cancelActFn={this.handleInvalidDialogOnClose}
                        paperProps={{
                            style: {
                                maxWidth: '800px',
                            },
                        }}
                    />
                )}
            </InvalidConfigContainer>
        );


        const inputFieldsDrawer = [
            <FormSelectCreator
                key="country"
                margin="normal"
                errorStatus={errorStatus.country}
                inputLabel={this.t('inputObj.country.title')}
                inputID="country"
                inputValue={formData.country}
                onChangeField={(e) => this.handleChange(e, 'country')}
                onCheckField={this.handleChangeCountry}
                menuItemObj={this.checkDebugMode(filteredConfig.country)}
                helperText={statusText.country}
                enableButton
                buttonLabel={this.t('changeCountrySettingLbl')}
                checked={!this.state.countryLock}
                checkedToDisabled={false}
                disabled={isPartialLock || discrepancies.length > 0}
                canSearch
            />,
            <FormSelectCreator
                key="globalTimezone"
                margin="normal"
                errorStatus={errorStatus.globalTimezone}
                inputLabel={this.t('inputObj.globalTimezone.title')}
                inputID="globalTimezone"
                inputValue={formData.globalTimezone}
                onChangeField={(e) => this.handleChange(e, 'globalTimezone')}
                menuItemObj={filteredConfig.globalTimezone}
                helperText={statusText.globalTimezone}
                disabled={isPartialLock || discrepancies.length > 0}
                showHelpTooltip
                helpTooltip={createTooltip(
                    this.t('inputObj.globalTimezone.title'),
                    false,
                    this.t('inputObj.globalTimezone.tooltip2')
                )}
                canSearch
            />,
            <FormInputCreator
                key="clusterId"
                errorStatus={errorStatus.clusterId}
                inputLabel={this.t('inputObj.clusterId.title')}
                inputID="clusterId"
                inputValue={formData.clusterId}
                onChangeField={this.handleChange}
                autoFocus={false}
                margin="dense"
                onKeyPressField={isEnterToSubmit}
                helperText={statusText.clusterId}
                inputType="text"
                disabled={isPartialLock || discrepancies.length > 0}
            />,
            // <FormInputCreator
            //     key="presharedKey"
            //     errorStatus={errorStatus.presharedKey}
            //     inputLabel={inputObj.presharedKey.title}
            //     inputID="presharedKey"
            //     inputValue={formData.presharedKey}
            //     onChangeField={this.handleChange}
            //     autoFocus={false}
            //     margin="normal"
            //     onKeyPressField={isEnterToSubmit}
            //     helperText={statusText.presharedKey}
            //     inputType="password"
            //     endAdornment={eyeIconButton}
            //     showPassword={showPassword}
            // />,
            <FormInputCreator
                key="managementIp"
                errorStatus={errorStatus.managementIp}
                inputLabel={this.t('inputObj.managementIp.title')}
                inputID="managementIp"
                inputValue={formData.managementIp}
                onChangeField={this.handleChange}
                autoFocus={false}
                margin="normal"
                onKeyPressField={isEnterToSubmit}
                helperText={statusText.managementIp}
                inputType="text"
                disabled={isPartialLock || discrepancies.length > 0}
            />,
            <FormInputCreator
                key="managementNetmask"
                errorStatus={errorStatus.managementNetmask}
                inputLabel={this.t('inputObj.managementNetmask.title')}
                inputID="managementNetmask"
                inputValue={formData.managementNetmask}
                onChangeField={this.handleChange}
                autoFocus={false}
                margin="normal"
                onKeyPressField={isEnterToSubmit}
                helperText={statusText.managementNetmask}
                inputType="text"
                disabled={isPartialLock || discrepancies.length > 0}
            />,
            // <CreateFormSelect
            //     key="rtsCts"
            //     margin="normal"
            //     errorStatus={errorStatus.rtsCts}
            //     inputLabel={inputObj.rtsCts.title}
            //     inputID="rtsCts"
            //     inputValue={formData.rtsCts}
            //     onChangeField={this.handleChange}
            //     menuItemObj={rtsCtsObj}
            //     helperText={statusText.rtsCts}
            // />,
        ];

        const dialogContent = (
            <React.Fragment>
                <span>
                    {this.t('changeCountryDialogContent1')}
                </span>
                <br /><br />
                <span>
                    {this.t('changeCountryDialogContent2')}
                </span>
                <br /><br />
                <span>
                    {this.t('changeCountryDialogContent3')}
                </span>
                <br /><br />
            </React.Fragment>
        );

        const eyeIconButton = (
            <InputAdornment position="end">
                <IconButton
                    onClick={this.handleClickShowPasssword}
                >
                    {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
            </InputAdornment>
        );

        const loginPassword = (
            <React.Fragment>
                <FormInputCreator
                    key="password"
                    errorStatus={errorStatus.password}
                    inputLabel={this.t('inputObj.password.title')}
                    inputID="password"
                    inputValue={formData.password || ''}
                    onChangeField={this.handleChange}
                    autoFocus
                    margin="dense"
                    onKeyPressField={isEnterToLogin}
                    helperText={statusText.password}
                    inputType="password"
                    endAdornment={eyeIconButton}
                    showPassword={showPassword}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={this.state.debugMode}
                            onChange={this.handleDebugCheck}
                            value="checkedA"
                            color="primary"
                        />
                    }
                    label={this.t('debugModeLbl')}
                    style={{
                        marginTop: 10,
                        marginRight: 5,
                        display: 'none',
                        minWidth: 'fit-content',
                    }}
                    id="enableDebug"
                />
            </React.Fragment>
        );

        const submitFn = () => {
            this.login();
        };

        const cancelFn = () => {
            this.handleCountryDialogOnClose();
        };

        const changeCountryDialog = (
            <Dialog
                open={countryDialog}
                onClose={this.handleCountryDialogOnClose}
            >
                <DialogTitle id="alert-dialog-title">
                    <WarningIcon
                        color="error"
                        fontSize="large"
                        style={{
                            marginRight: '10px',
                            fontSize: '30px',
                        }}
                    />
                    <div
                        style={{
                            transform: 'translate(0%, -25%)',
                            fontWeight: 'bold',
                            display: 'inline-block',
                        }}
                    >
                        {this.t('changeCountryDisclaimerLbl')}
                    </div>
                </DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {dialogContent}
                    </DialogContentText>
                    {loginPassword}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={cancelFn}
                        color="primary"
                        autoFocus
                        style={{display: 'inline'}}
                        disableRipple
                    >
                        {this.t('changeCountryCancelLbl')}
                    </Button>
                    <Button
                        onClick={submitFn}
                        disabled={passwordDisabled}
                        color="primary"
                        autoFocus
                        disableRipple
                    >
                        {this.t('changeCountryContinueLbl')}
                    </Button>
                </DialogActions>
            </Dialog>
        );

        const saveConfigDialog = (
            <P2Dialog
                open={this.state.dialog.open}
                handleClose={this.handleDialogOnClose}
                title={this.state.dialog.title}
                content={this.state.dialog.content}
                nonTextContent={this.state.dialog.nonTextContent}
                actionTitle={this.state.dialog.submitTitle}
                actionFn={this.state.dialog.submitFn}
                cancelActTitle={this.state.dialog.cancelTitle}
                cancelActFn={this.state.dialog.cancelFn}
                maxWidth={this.state.dialog.width}
            />
        );

        // const mismatchConfigButton = discrepancies.length > 0 && (
        //     <Button
        //         variant="contained"
        //         size="small"
        //         classes={{
        //             root: classes.root,
        //         }}
        //         onClick={this.updateDiscrepanciesDialog}
        //         style={{
        //             display: 'none',
        //         }}
        //     >
        //         <i
        //             style={{
        //                 marginRight: 10,
        //                 fontSize: 13,
        //             }}
        //             className="material-icons"
        //         >error</i>
        //         {this.t('configMismatchLbl')}
        //     </Button>
        // );

        return (
            <Card style={{background: colors.background}} elevation={0}>
                <CardContent
                    style={{
                        paddingLeft: 52,
                        paddingRight: 52,
                        height: discrepancies.length === 0 && this.props.isAllNodesReachable ? 'calc(100vh - 380px)' : 'calc(100vh - 460px)',
                        overflowY: 'auto',
                    }}
                >
                    {inputFieldsDrawer}
                </CardContent>
                <CardActions style={{paddingRight: '52px'}}>
                    <div style={{flex: 1}} />
                    {/* <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={this.updateDiscrepanciesDialog}
                    >
                        {actionLabel.mismatch}
                    </Button> */}
                    {/* {mismatchConfigButton} */}
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={this.clickReset}
                        disabled={isPartialLock || discrepancies.length > 0 || !this.props.isAllNodesReachable}
                    >
                        {this.t('resetLbl')}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={this.clickSave}
                        disabled={submitDisabled || isPartialLock || !this.props.isAllNodesReachable}
                    >
                        {this.t('saveLbl')}
                    </Button>
                </CardActions>
                {changeCountryDialog}
                {saveConfigDialog}
                {invalidConfigDialog}
                <LockLayer
                    display={this.state.isLock}
                    top={0}
                    left={0}
                    zIndex={200}
                    hasCircularProgress
                />
            </Card>
        );
    }
}
MeshSettingsApp.propTypes = {
    history: PropTypes.object.isRequired, /* eslint-disable-line */
    csrf: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    onLoadingAct: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    addDiscrepancies: PropTypes.func.isRequired,
    setFilteredConfig: PropTypes.func.isRequired,
    handleLock: PropTypes.func.isRequired,
    handleSync: PropTypes.func.isRequired,
    projectName: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    enableDebugCountry: PropTypes.bool.isRequired,
    ipToHostnameMap: PropTypes.objectOf(PropTypes.string).isRequired,
    ipToMacMap: PropTypes.objectOf(PropTypes.string).isRequired,
    checkIfAllNodesReachable: PropTypes.func.isRequired,
    isAllNodesReachable:PropTypes.bool.isRequired,
    // openLogoutProjectDialog: PropTypes.func.isRequired,
};
function mapStateToProps(state) {
    const {csrf, labels} = state.common;
    const {projectName, projectId} = state.projectManagement;
    const {enableDebugCountry} = state.devMode;
    const {ipToHostnameMap, ipToMacMap} = state.meshTopology;
    return {
        csrf,
        projectName,
        projectId,
        enableDebugCountry,
        ipToHostnameMap,
        ipToMacMap,
        labels
    };
}

export default compose(
    connect(mapStateToProps),
    withStyles(styles)
)(withRouter(MeshSettingsApp));
