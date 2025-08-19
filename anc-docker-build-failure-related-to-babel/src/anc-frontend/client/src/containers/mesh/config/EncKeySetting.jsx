/**
 * @Author: Kenny
 * @Date:   2018-11-09T15:09:06+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-11-13T11:02:46+08:00
 */
import React from 'react';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
// import {compose} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Trans} from 'react-i18next';
// import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import {convertIpToMac} from '../../../util/formatConvertor';
import {formValidator} from '../../../util/inputValidator';
import {
    getConfig,
    setConfig,
    getFilteredConfigOptions,
    getCachedConfig,
} from '../../../util/apiCall';
import {toggleSnackBar, closeSnackbar, updateProgressBar} from '../../../redux/common/commonActions';
// import {convertIpToMac} from '../../util/formatConvertor';
import FormInputCreator from '../../../components/common/FormInputCreator';
import Constant from '../../../constants/common';
import isMismatchSecret, {isUnreachedNode} from '../../../util/common';
import check from '../../../util/errorValidator';
import {openDeviceListDialog} from '../../../redux/common/commonActions';

const {timeout, themeObj} = Constant;

// const deepClone = object => JSON.parse(JSON.stringify(object));

const get = (o, p) =>
    p.reduce(
        (xs, x) =>
            ((xs && xs[x]) ?
                xs[x] : null), o);

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

// function extractSourceConfig(Config) {
//     const newConfig = JSON.parse(JSON.stringify(Config));
//     newConfig.radioSettings = {};
//     newConfig.nodeSettings = {};
//     if (typeof newConfig.meshSettings.discrepancies !== 'undefined') {
//         delete newConfig.meshSettings.discrepancies;
//     }
//     Object.keys(Config.radioSettings).forEach((mac) => {
//         if (Config.radioSettings[mac].success) {
//             newConfig.radioSettings[mac] = Config.radioSettings[mac].data;
//         }
//     });
//     Object.keys(Config.nodeSettings).forEach((mac) => {
//         if (Config.nodeSettings[mac].success) {
//             newConfig.nodeSettings[mac] = Config.nodeSettings[mac].data;
//         }
//     });

//     return newConfig;
// }

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
    console.log('newConfig(MeshSettings): ', newConfig);
    return newConfig;
}

function createFormInput(
    title,
    errorStatus,
    inputLabel,
    inputID,
    inputValue,
    onChangeField,
    autoFocus,
    helperText,
    inputType,
    showPassword,
    endAdornment,
    disabled,
    isEnterToSubmit
) {
    return (
        <FormInputCreator
            key={inputID}
            errorStatus={errorStatus}
            inputLabel={title}
            inputID={inputID}
            inputValue={inputValue}
            onChangeField={onChangeField}
            margin="dense"
            autoFocus={false}
            helperText={errorStatus ? helperText : inputLabel}
            inputType={showPassword ? 'text' : inputType}
            endAdornment={endAdornment}
            disabled={disabled}
            onKeyPressField={isEnterToSubmit}
            autoComplete="new-password"
        />
    );
}


class EncKeySetting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hash: {},
            disableEnrptKeySave: true,
            showPassword: {
                encryptKey: false,
            },
            errorStatus: {
                encryptKey: false,
            },
            formData: {
                encryptKey: '',
                clusterId: '',
                managementIp: '',
                managementNetmask: '',
                country: 'HK',
                bpduFilter: '',
                e2eEnc: '',
                e2eEncKey: '',
                globalTimezone: '',
            },
            loadData: {
                encryptKey: '',
                clusterId: '',
                managementIp: '',
                managementNetmask: '',
                country: 'HK',
                bpduFilter: '',
                e2eEnc: '',
                e2eEncKey: '',
                globalTimezone: '',
            },
            statusText: {
                encryptKey: '',
            },
            dialog: {
                open: false,
                title: '',
                content: '',
                submitButton: this.props.t('dialogSubmitLbl'),
                submitAction: this.props.handleDialogOnClose,
                cancelButton: '',
                cancelAction: this.props.handleDialogOnClose,
            },
            filteredConfig: {
                encKey: '.',
            },
            isPartialLock: this.props.isPartialLock,
            // ignoreBpduSync: false,
            legacySyncValue: {},
            discrepancies: [],
        };

        const fnNames = [
            'getDiffObj',
            'handleShowPasssword',
            'getEyeIconButton',
            'handleInput',
            'triggerFormStatus',
            'clickEncKeyReset',
            'checkEncKeySaveDisable',
            'getMeshConfig',
            'updateFilterConfig',
            'handleGetMeshError',
            'handleSecretMismatch',
            'clickEncKeySave',
            'saveProcess',
            'saveSuccessHandler',
            'saveProcessError',
            'enterToSubmit',
            'onReturn',
            'onLogout',
            'onFailReturn',
            'onFail',
            'updateDiscrepancies',
            'clickSync',
            'notLoggedInHandle',
            'checkLegacy',
            'parseDiscrepacyList',
            'parseLegacyDiscrepancyList',
        ];

        window.__.each(fnNames, (fnName) => {
            this[fnName] = this[fnName].bind(this);
        });
        this.t = this.props.t;
    }

    componentDidMount() {
        this.mounted = true;
        const notLoggedIn = Cookies.get('notLoggedinToMeshTopology');
        const projectID = this.props.projectId;

        if (projectID === '__staging' && notLoggedIn === 'true') {
            this.notLoggedInHandle();
        } else {
            this.getMeshConfig(true, false);
            this.props.handleGetMeshConfig(this.getMeshConfig);
            this.props.handleSync(this.clickSync);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isPartialLock !== this.state.isPartialLock) {
            console.log('change partial Lock', nextProps.isPartialLock);
            this.setState({
                ...this.state,
                isPartialLock: nextProps.isPartialLock,
            });
        }
        if (nextProps.needRecall) {
            this.getMeshConfig(false, false);
        }
    }

    componentWillUnmount() {
        this.mounted = false;
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
                // this.props.history.push('/mesh');
            },
            cancelButton: '',
            cancelAction: this.props.handleDialogOnClose,
        };
        this.props.setDialog(dialog);
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
                // this.props.history.push('/');
                // this.propshistory.push({
                //     pathname: '/index.html',
                //     hash: '/'
                // });
                window.location.assign(`${window.location.origin}/index.html`);
            },
            cancelButton: '',
            cancelAction: this.props.handleDialogOnClose,
        };
        this.props.setDialog(dialog);
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
                // this.props.history.push('/');
                window.location.assign(`${window.location.origin}/index.html`);
            },
            cancelButton: '',
            cancelAction: this.props.handleDialogOnClose,
        };
        this.props.setDialog(dialog);
    }

    onFail() {
        const dialog = {
            open: true,
            title: this.t('remoteNodeUnreachableFailTitle'),
            content: this.t('remoteNodeUnreachableFailCtx'),
            submitButton: this.t('dialogSubmitLbl'),
            submitAction: () => {
                this.props.handleDialogOnClose(
                    () => {
                        this.setState({
                            ...this.state,
                            isPartialLock: true,
                        }, () => {
                            this.getMeshConfig(true, false);
                            this.props.handlePartialLock(true);
                        });
                    }
                );
            },
            cancelButton: '',
            cancelAction: this.props.handleDialogOnClose,
        };
        this.props.setDialog(dialog);
    }

    getEyeIconButton(inputID) {
        return (
            <InputAdornment position="end">
                <IconButton
                    onClick={() => this.handleShowPasssword(inputID)}
                >
                    {this.state.showPassword[`${inputID}`] ? <Visibility /> : <VisibilityOff />}
                </IconButton>
            </InputAdornment>
        );
    }

    getDiffObj() {
        const diffObj = {};
        Object.keys(this.state.loadData).forEach((optName) => {
            if (optName === 'encryptKey') {
                if (this.state.loadData[optName] !== this.state.formData[optName]) {
                    diffObj.encKey = this.state.formData[optName];
                }
            } else if (optName === 'e2eEnc' || optName === 'e2eEncKey') {
                if (this.state.loadData[optName] !== this.props.endToEndEncKeySetting[optName]) {
                    diffObj[optName] = this.props.endToEndEncKeySetting[optName];
                }
            } else if (this.state.loadData[optName] !== this.state.formData[optName]) {
                diffObj[optName] = this.state.formData[optName];
            }
        });
        return Object.keys(diffObj).length === 0 ? false : diffObj;
    }


    async getMeshConfig(needPopup, partial) {
        console.log('getMeshConfig: ', needPopup);
        const {csrf, dispatch, projectId} = this.props;
        const bodyMsg1 = {allNodes: true};
        const bodyMsg2 = {
            options: {
                meshSettings: ['encKey', 'country', 'bpduFilter', 'e2eEnc', 'e2eEncKey', 'globalTimezone'],
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

                                },
                                cancelButton: this.t('getOptionFailBtnLbl2'),
                                cancelAction: () => {
                                    this.props.handleDialogOnClose();
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
                                },
                                cancelButton: this.t('getOptionFailBtnLbl2'),
                                cancelAction: () => {
                                    this.props.handleDialogOnClose();
                                    this.getMeshConfig(true, false);
                                },
                            };
                        if (err.data.type === 'specific') {
                            const filterConfigErrors = get(err.data.data, ['meshSettings', 'errors', 0, 'type']);
                            if (filterConfigErrors === 'partialretrieve') {
                                this.updateFilterConfig(get(err.data.data, ['meshSettings', 'errors', 0, 'data']));
                                this.updateMeshForm(value, false);
                            } else {
                                this.props.setDialog(dialog, () => {
                                    this.props.handleLockLayer(false);
                                    this.setState({
                                        ...this.state,
                                        isPartialLock: false,
                                    }, () => {
                                        this.props.handlePartialLock(false);
                                    });
                                });
                            }
                        } else {
                            this.props.setDialog(dialog, () => {
                                this.props.handleLockLayer(false);
                                this.setState({
                                    ...this.state,
                                    isPartialLock: false,
                                }, () => {
                                    this.props.handlePartialLock(false);
                                });
                            });
                        }
                    }
                    // this.setState({
                    //     ...this.state,
                    //     dialog: {
                    //         ...this.state.dialog,
                    //         open: true,
                    //         title: this.t('getOptionFailTitle'),
                    //         content: this.t('getOptionFailContent'),
                    //         submitButton: this.t('getOptionFailBtnLbl1'),
                    //         submitAction: () => {
                    //             const currentOrigin = window.location.origin;
                    //             window.location.replace(`${currentOrigin}/mesh/`);
                    //         },
                    //         cancelButton: this.t('getOptionFailBtnLbl2'),
                    //         cancelAction: () => {
                    //             this.props.handleDialogOnClose();
                    //             this.getMeshConfig(true);
                    //         },
                    //     },
                    // }, () => handleUnLockLayer());
                }
            }
        } catch (err) {
            if (this.mounted) {
                this.handleGetMeshError(err, needPopup);
            }
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
        if (Config.e2eEnc !== 'undefined' && Config.e2eEnc.type === 'enum') {
            filteredConfig.e2eEnc = Config.e2eEnc.data;
        }
        if (Config.e2eEncKey !== 'undefined' && Config.e2eEncKey.type === 'regex') {
            filteredConfig.e2eEncKey = Config.e2eEncKey.data;
        }
        if (Config.globalTimezone !== 'undefined' && Config.globalTimezone.type === 'enum') {
            filteredConfig.globalTimezone = Config.globalTimezone.data;
        }
        if (Object.keys(filteredConfig).length === 6) {
            this.setState({
                ...this.state,
                filteredConfig,
            }, () => {
                this.props.setFilteredConfig(filteredConfig);
                this.props.setE2EFilterConfig({
                    e2eEnc: filteredConfig.e2eEnc,
                    e2eEncKey: filteredConfig.e2eEncKey,
                });
            });
        } else {
            const dialog = {
                open: true,
                title: this.t('getOptionFailTitle'),
                content: this.t('getOptionFailContent'),
                submitButton: this.t('getOptionFailBtnLbl1'),
                submitAction: () => {
                    const currentOrigin = window.location.origin;
                    window.location.replace(`${currentOrigin}/mesh/`);
                },
                cancelButton: this.t('getOptionFailBtnLbl2'),
                cancelAction: () => {
                    this.props.handleDialogOnClose();
                    this.getMeshConfig(true);
                },
            };
            this.props.setDialog(dialog, () => {
                this.props.handleLockLayer(false);
                this.setState({
                    ...this.state,
                    isPartialLock: false,
                }, () => {
                    this.props.handlePartialLock(false);
                });
            });
            // this.setState({
            //     ...this.state,
            //     dialog: {
            //         ...this.state.dialog,
            //         open: true,
            //         title: this.t('getOptionFailTitle'),
            //         content: this.t('getOptionFailContent'),
            //         submitButton: this.t('getOptionFailBtnLbl1'),
            //         submitAction: () => {
            //             const currentOrigin = window.location.origin;
            //             window.location.replace(`${currentOrigin}/mesh/`);
            //         },
            //         cancelButton: this.t('getOptionFailBtnLbl2'),
            //         cancelAction: () => {
            //             this.props.handleDialogOnClose();
            //             this.getMeshConfig(true);
            //         },
            //     },
            // }, () => handleUnLockLayer());
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
            e2eEnc: config.meshSettings.e2eEnc,
            e2eEncKey: config.meshSettings.e2eEncKey,
            globalDiscoveryInterval: config.meshSettings.globalDiscoveryInterval,
            globalHeartbeatInterval: config.meshSettings.globalHeartbeatInterval,
            globalHeartbeatTimeout: config.meshSettings.globalHeartbeatTimeout,
            globalAllowActiveLinkDrop: config.meshSettings.globalAllowActiveLinkDrop,
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
            e2eEnc: config.meshSettings.e2eEnc,
            e2eEncKey: config.meshSettings.e2eEncKey,
            globalDiscoveryInterval: config.meshSettings.globalDiscoveryInterval,
            globalHeartbeatInterval: config.meshSettings.globalHeartbeatInterval,
            globalHeartbeatTimeout: config.meshSettings.globalHeartbeatTimeout,
            globalStaleTimeout: config.meshSettings.globalStaleTimeout,
            globalAllowActiveLinkDrop: config.meshSettings.globalAllowActiveLinkDrop,
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
                this.props.addDiscrepancies(discrepanciesList, 'security');
            });
        } else {
            this.props.handleLockLayer(false);
            dispatch(toggleSnackBar(this.t('retrieveMeshObjSuccessSnackbar')));
            this.setState({
                isPartialLock: false,
            }, () => {
                this.props.handlePartialLock(false);
            });
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

        const encKeyHelperText = this.t('encKeyErrorHelperTextForRegex');

        const encKeyValidateObj = this.validateEncKey(meshTopoObj.meshSettings.encKey, encKeyHelperText);


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
                e2eEnc: meshTopoObj.meshSettings.e2eEnc,
                e2eEncKey: meshTopoObj.meshSettings.e2eEncKey,
                globalTimezone: meshTopoObj.meshSettings.globalTimezone,
            },
            disableEnrptKeySave: !encKeyValidateObj.result,
            errorStatus: {
                ...this.state.errorStatus,
                encryptKey: !encKeyValidateObj.result,
            },
            statusText: {
                ...this.state.statusText,
                encryptKey: encKeyValidateObj.text,
            },
            hash: meshTopoObj.checksums,
        }, () => {
            this.props.setFormData({
                encKey: meshTopoObj.meshSettings.encKey,
                clusterId: meshTopoObj.meshSettings.clusterId,
                managementIp: meshTopoObj.meshSettings.managementIp,
                managementNetmask: meshTopoObj.meshSettings.managementNetmask,
                country: meshTopoObj.meshSettings.country,
                bpduFilter: meshTopoObj.meshSettings.bpduFilter,
                e2eEnc: meshTopoObj.meshSettings.e2eEnc,
                e2eEncKey: meshTopoObj.meshSettings.e2eEncKey,
            }, this.state.hash, 'discrepancies' in meshTopoObj.meshSettings);
        });


        if ('discrepancies' in meshTopoObj.meshSettings && !partial) {
            this.updateDiscrepancies(meshTopoObj);
        } else {
            this.props.handleLockLayer(false);
            if (!partial) {
                dispatch(toggleSnackBar(this.t('retrieveMeshObjSuccessSnackbar')));
                this.setState({
                    isPartialLock: false,
                }, () => {
                    this.props.handlePartialLock(false);
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

    validateEncKey(inputValue, helperText) {
        const encKeyRegexPattern = new RegExp(this.state.filteredConfig.encKey);
        let isValidObj = formValidator('isRequired', inputValue, null, helperText);
        if (isValidObj.result) {
            isValidObj = formValidator('matchRegex', inputValue, encKeyRegexPattern, helperText);
            if (!isValidObj.result) {
                isValidObj.text = this.t('encKeyErrorHelperTextForRegex');
            }
        }
        return isValidObj;
    }

    async handleGetMeshError(error, needPopup) {
        console.log('kyle_debug: handleGetMeshError -> handleGetMeshError', error);
        const {csrf, dispatch, projectId} = this.props;
        const mismatchSecret = isMismatchSecret(error, 'getconfig');
        const unreachedNode = isUnreachedNode(error);
        const bodyMsg2 = {
            options: {
                meshSettings: ['encKey', 'country', 'bpduFilter', 'e2eEnc', 'e2eEncKey', 'globalTimezone'],
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
                // bodyMsg2.sourceConfig = Setting;
                bodyMsg2.sourceConfig = extractSourceConfig(JSON.parse(JSON.stringify(Setting)));
                try {
                    const filterConfig = await getFilteredConfigOptions(csrf,
                        projectId === '' ? Cookies.get('projectId') : projectId, bodyMsg2);
                    console.log('-----filterConfig(success)-----');
                    if (needPopup) {
                        const {title, content} = check(error);
                        const dialog = title !== '' ?
                            {
                                open: true,
                                title,
                                content,
                                nonTextContent: <span />,
                                submitButton: this.t('dialogSubmitLbl'),
                                submitAction: this.props.handleDialogOnClose,
                                cancelButton: '',
                                cancelAction: this.props.handleDialogOnClose,
                            } :
                            {
                                open: true,
                                title: this.t('getMeshFailTitle'),
                                content: this.t('getMeshFailContent', this.props.labels),
                                nonTextContent: <span />,
                                submitButton: this.t('dialogSubmitLbl'),
                                submitAction: this.props.handleDialogOnClose,
                                cancelButton: '',
                                cancelAction: this.props.handleDialogOnClose,
                            };
                        this.props.setDialog(dialog);
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

                                },
                                cancelButton: this.t('getOptionFailBtnLbl2'),
                                cancelAction: () => {
                                    this.props.handleDialogOnClose();
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
                                },
                                cancelButton: this.t('getOptionFailBtnLbl2'),
                                cancelAction: () => {
                                    this.props.handleDialogOnClose();
                                    this.getMeshConfig(true, false);
                                },
                            };
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
                                        submitAction: this.props.handleDialogOnClose,
                                        cancelButton: '',
                                        cancelAction: this.props.handleDialogOnClose,
                                    };
                                    this.props.setDialog(popUpDialog);
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
                                this.props.setDialog(dialog, () => {
                                    this.props.handleLockLayer(false);
                                    this.setState({
                                        ...this.state,
                                        isPartialLock: false,
                                    }, () => {
                                        this.props.handlePartialLock(false);
                                    });
                                });
                            }
                        } else {
                            this.props.setDialog(dialog, () => {
                                this.props.handleLockLayer(false);
                                this.setState({
                                    ...this.state,
                                    isPartialLock: false,
                                }, () => {
                                    this.props.handlePartialLock(false);
                                });
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
                            submitAction: this.props.handleDialogOnClose,
                            cancelButton: '',
                            cancelAction: this.props.handleDialogOnClose,
                        } :
                        {
                            open: true,
                            title: this.t('getMeshFailTitle'),
                            content: this.t('getMeshFailContent', this.props.labels),
                            nonTextContent: <span />,
                            submitButton: this.t('dialogSubmitLbl'),
                            submitAction: this.props.handleDialogOnClose,
                            cancelButton: '',
                            cancelAction: this.props.handleDialogOnClose,
                        };
                    this.props.setDialog(dialog);
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
            },
            cancelButton: '',
            cancelAction: this.props.handleDialogOnClose,
        };
        this.props.setDialog(dialog);
        // this.setState({
        //     dialog: {
        //         ...this.state.dialog,
        //         open: true,
        //         title: this.t('invalidSecretTitle'),
        //         content: this.t('invalidSecretContent'),
        //         submitButton: this.t('invalidSubmitLbl'),
        //         submitAction: () => {
        //             const currentOrigin = window.location.origin;
        //             window.location.replace(`${currentOrigin}/mesh/`);
        //         },
        //         cancelButton: '',
        //         cancelAction: this.props.handleDialogOnClose,
        //     },
        // });
    }

    handleInput(event) {
        console.log('-----inputID-----');
        console.log(event.target.id);
        console.log('-----inputValue-----');
        console.log(event.target.value);
        const inputID = event.target.id;
        const inputValue = event.target.value;
        const encryptKeyRegexPattern = new RegExp(this.state.filteredConfig.encKey);

        let isValidObj = {};

        isValidObj = formValidator('isRequired', inputValue);
        if (isValidObj.result) {
            isValidObj = formValidator('matchRegex', inputValue, encryptKeyRegexPattern);
            if (!isValidObj.result) {
                isValidObj.text = this.t('encKeyErrorHelperTextForRegex');
            }
        }

        this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text, inputValue);
    }

    clickSync() {
        const {legacySyncValue, discrepanciesValue} = this.state;
        const saveConfigObj = {};
        saveConfigObj.checksums = this.state.hash;
        saveConfigObj.diff = {};
        saveConfigObj.diff.meshSettings = discrepanciesValue;
        // if (this.state.ignoreBpduSync) {
        //     delete saveConfigObj.diff.meshSettings.bpduFilter;
        // }
        if (Object.keys(legacySyncValue).length !== 0) {
            Object.keys(legacySyncValue).forEach((key) => {
                saveConfigObj.diff.meshSettings[key] = legacySyncValue[key];
            });
        }
        console.log('saveConfigObj(SecuritySettings): ', saveConfigObj);
        this.saveProcess(saveConfigObj, true);
    }

    triggerFormStatus(field, status, text, inputValue, cb) {
        this.setState({
            errorStatus: {...this.state.errorStatus, [field]: !status},
            statusText: {...this.state.statusText, [field]: text},
            formData: {...this.state.formData, [field]: inputValue},
        }, (() => {
                if (cb) cb();
                this.checkEncKeySaveDisable();
                if (field === 'encryptKey' && status) {
                    this.props.handleSecurityChange(inputValue);
                }
            })
        );
    }

    checkEncKeySaveDisable() {
        if (this.state.errorStatus.encryptKey ||
            this.state.formData.encryptKey === '') {
            this.setState({
                disableEnrptKeySave: true,
            });
        } else {
            this.setState({
                disableEnrptKeySave: false,
            });
        }
    }

    clickEncKeyReset() {
        // console.log('-----clickEncKeyReset-----');
        // console.log(this.state);
        this.setState({
            ...this.state,
            disableEnrptKeySave: true,
            showPassword: {
                ...this.state.showPassword,
                encryptKey: false,
            },
            errorStatus: {
                ...this.state.errorStatus,
                encryptKey: false,
            },
            formData: {
                ...this.state.formData,
                encryptKey: this.state.loadData.encryptKey,
            },
            statusText: {
                ...this.state.statusText,
                encryptKey: '',
            },
        });
    }

    clickEncKeySave() {
        console.log('-----clickEncKeySave-----');
        if (!this.getDiffObj()) {
            const dialog = {
                open: true,
                title: this.t('noChangesWarningTitle'),
                content: this.t('noChangesWarningContent'),
                nonTextContent: <span />,
                submitButton: this.t('dialogSubmitLbl'),
                submitAction: this.props.handleDialogOnClose,
                cancelButton: '',
                cancelAction: this.props.handleDialogOnClose,
            };
            this.props.setDialog(dialog);
        } else {
            const saveConfigObj = {};
            saveConfigObj.checksums = this.state.hash;
            saveConfigObj.diff = {
                meshSettings: this.getDiffObj(),
            };
            // saveConfigObj.diff.meshSettings.encKey = this.state.formData.encryptKey;
            // saveConfigObj.diff.meshSettings.e2eEnc = this.props.endToEndEncKeySetting.e2eEnc;
            // saveConfigObj.diff.meshSettings.e2eEncKey = this.props.endToEndEncKeySetting.e2eEncKey;

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
                this.props.handleDialogOnClose();
                this.saveProcess(saveConfigObj);
            };
            dialog.cancelButton = this.t('confirmCancelLbl');
            dialog.cancelAction = () => { this.props.handleDialogOnClose(); };
            this.props.setDialog(dialog);
            // this.setState({dialog});
        }
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
        };
        dialog.cancelButton = '';
        dialog.cancelAction = this.props.handleDialogOnClose;

        // stop progress bar
        this.props.dispatch(updateProgressBar(false));
        this.props.onLoadingAct(false);
        console.log('-----saveSuccessHandler-----');
        this.setState({
            ...this.state,
            loadData: {
                ...this.state.loadData,
                encryptKey: this.state.formData.encryptKey,
            },
        }, () => { this.props.setDialog(dialog); });
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
                submitAction: this.props.handleDialogOnClose,
                cancelButton: '',
                cancelAction: this.props.handleDialogOnClose,
            };
            this.props.setDialog(dialog);
            // this.setState({
            //     dialog: {
            //         ...this.state.dialog,
            //         open: true,
            //         title: this.t('saveFailDialogTitle'),
            //         content: this.t('saveFailDialogContent'),
            //         nonTextContent: <span />,
            //         submitButton: this.t('dialogSubmitLbl'),
            //         submitAction: this.props.handleDialogOnClose,
            //         cancelButton: '',
            //         cancelAction: this.props.handleDialogOnClose,
            //     },
            // });
        }
    }

    handleShowPasssword(inputID) {
        this.setState({
            showPassword: {
                ...this.state.showPassword,
                [inputID]: !this.state.showPassword[inputID],
            },
        });
    }

    enterToSubmit(event) {
        if (event.key === 'Enter') {
            this.clickEncKeySave();
        }
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
            },
            cancelButton: '',
            cancelAction: this.handleDialogOnClose,
        };
        this.props.setDialog(dialog);
    }

    render() {
        let isEnterToSubmit = function () { return false; };
        if (!this.state.disableEnrptKeySave) {
            isEnterToSubmit = this.enterToSubmit;
        }
        const {
            component, resetFn, haveDiscrepancies, errorStatus,
        } = this.props.endToEndEncKeySetting;
        return (
            <Paper style={{background: '#FFFFFF', margin: '20px 52px'}} elevation={1}>
                <CardContent
                    style={{
                        // margin: '0 10px 10px 0px',
                        // height: 'calc(100vh - 380px)',
                        overflowY: 'auto',
                    }}
                >
                    <Typography
                        variant="body2"
                        style={{
                            color: themeObj.txt.normal,
                            fontSize: '22px',
                        }}
                    >
                        <b>{this.t('encryption')}</b>
                    </Typography>
                    <div style={{paddingTop: '16px'}}>
                        <Typography
                            variant="body2"
                            style={{
                                color: themeObj.txt.normal,
                                fontSize: '18px',
                            }}
                        >
                            <b>{this.t('encryptKeyLabel')}</b>
                        </Typography>
                        <div style={{paddingTop: '16px'}}>
                            {createFormInput(
                                this.t('encryptKeyLabel'),
                                this.state.errorStatus.encryptKey,
                                this.t('encryptKeyDescription'),
                                'encryptKey',
                                this.state.formData.encryptKey,
                                this.handleInput,
                                false,
                                this.state.statusText.encryptKey,
                                'password',
                                this.state.showPassword.encryptKey,
                                this.getEyeIconButton('encryptKey'),
                                this.state.isPartialLock || this.state.discrepancies.length > 0,
                                isEnterToSubmit
                            )}
                        </div>
                    </div>
                    {component}
                </CardContent>
                <div style={{paddingBottom: '10px'}}>
                    <CardActions style={{padding: '8px 12px 8px 4px'}}>
                        <div style={{flex: 1}} />
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => {
                                this.clickEncKeyReset();
                                resetFn();
                            }}
                            disabled={this.state.isPartialLock ||
                                this.state.discrepancies.length > 0 ||
                                !this.props.isAllNodesReachable
                            }
                        >
                            {this.t('resetLbl')}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={this.clickEncKeySave}
                            disabled={
                                // this.state.disableEnrptKeySave ||
                                this.state.errorStatus.encryptKey ||
                                this.state.isPartialLock ||
                                this.state.discrepancies.length > 0 ||
                                errorStatus.e2eEncKey || errorStatus.e2eEnc || haveDiscrepancies ||
                                !this.props.isAllNodesReachable
                            }
                        >
                            {this.t('saveLbl')}
                        </Button>
                    </CardActions>
                </div>
            </Paper>
        );
    }
}


EncKeySetting.propTypes = {
    history: PropTypes.object.isRequired, /* eslint-disable-line */
    csrf: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    dispatch: PropTypes.func.isRequired,
    onLoadingAct: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    handleLockLayer: PropTypes.func.isRequired,
    setDialog: PropTypes.func.isRequired,
    handleDialogOnClose: PropTypes.func.isRequired,
    handleSync: PropTypes.func.isRequired,
    addDiscrepancies: PropTypes.func.isRequired,
    // display: PropTypes.bool,
    handlePartialLock: PropTypes.func.isRequired,
    isPartialLock: PropTypes.bool.isRequired,
    setFilteredConfig: PropTypes.func.isRequired,
    needRecall: PropTypes.bool,
    setE2EFilterConfig: PropTypes.func.isRequired,
    setFormData: PropTypes.func.isRequired,
    handleSecurityChange: PropTypes.func.isRequired,
    handleGetMeshConfig: PropTypes.func.isRequired,
    endToEndEncKeySetting: PropTypes.shape({
        component: PropTypes.element.isRequired,
        resetFn: PropTypes.func.isRequired,
        haveDiscrepancies: PropTypes.bool.isRequired,
        errorStatus: PropTypes.shape(
            {
                e2eEnc: PropTypes.bool.isRequired,
                e2eEncKey: PropTypes.bool.isRequired,
            }
        ).isRequired,
        e2eEnc: PropTypes.string.isRequired,
        e2eEncKey: PropTypes.string.isRequired,
    }).isRequired,
    isAllNodesReachable:PropTypes.bool.isRequired,
    checkIfAllNodesReachable:PropTypes.func.isRequired,
};

EncKeySetting.defaultProps = {
    // display: false,
    needRecall: false,
};

function mapStateToProps(state) {
    const {csrf, labels} = state.common;
    const {projectId} = state.projectManagement;
    return {
        csrf,
        projectId,
        labels,
    };
}

export default connect(mapStateToProps)(withRouter(EncKeySetting));

