/**
 * @Author: mango
 * @Date:   2018-03-28T13:53:17+08:00
 * @Last modified by:   mango
 * @Last modified time: 2019-01-04T17:31:36+08:00
 */
import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {useTranslation, Trans} from 'react-i18next';
import {withRouter} from 'react-router-dom';
import Cookies from 'js-cookie';
import {withStyles, MuiThemeProvider, createTheme} from '@material-ui/core/styles';
// import Tabs from '@material-ui/core/Tabs';
// import Tab from '@material-ui/core/Tab';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import WarningIcon from '@material-ui/icons/Error';
import {
    Typography, FormControl, InputLabel, Accordion,
    AccordionSummary, AccordionDetails,
} from '@material-ui/core';
// import {Typography} from '@material-ui/core';
// import FormControlLabel from '@material-ui/core/FormControlLabel';
// import Checkbox from '@material-ui/core/Checkbox';
import * as TabsModule from 'react-simpletabs';
// import SwipeableViews from 'react-swipeable-views';
import Constant from '../../constants/common';
import FormInputCreator from '../../components/common/FormInputCreator';
import FormSelectCreator from '../../components/common/FormSelectCreator';
import {
    getConfig,
    getCachedConfig,
    setConfig,
    getFilteredConfigOptions
} from '../../util/apiCall';
import LockLayer from '../../components/common/LockLayer';
import P2Dialog from '../../components/common/P2Dialog';
import P2Tooltip from '../../components/common/P2Tooltip';
import {formValidator} from '../../util/inputValidator';
import RangeSlider from '../../components/common/RangeSlider';
import AtpcRangeSlider from '../../components/common/AtpcRangeSlider';
import {
    toggleAlignmentDialog,
    setLinkAlignmentConfigProcessStatus,
} from '../../redux/linkAlignment/linkAlignmentActions';
import {
    setTempNodeConfig,
    setClusterInformation,
    resetClusterInformation,
} from '../../redux/dashboard/dashboardActions';
import {
    fetchConfig
} from '../../redux/meshTopology/meshTopologyActions';
import {
    fetchCachedConfig
} from '../../redux/meshTopology/cachedMeshTopologyActions';
import check from '../../util/errorValidator';
import { isFwLTE, checkFwLTEDetail } from '../../util/common';

const { endtSupportVersion, atpcSupportVersion, allowRebootSupportVersion, acsSupportVersion } = Constant;
const Tabs = TabsModule.default;
const deepClone = object => JSON.parse(JSON.stringify(object));
const StyledTabs = styled(Tabs)`
    .tabs-navigation {
      padding: 0;
    }
    .tabs-menu {
      display: flex;
      list-style: none;
      padding: 0;
      margin: 0;
      font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    }
    .tabs-menu-item {
      float: left;
      cursor: pointer;
      max-height: 42px;
      flex: 1;
      max-width: ${props => (props.maxWidth ? props.maxWidth : '')};
    }
    .tabs-menu-item a {
      display: block;
      height: 40px;
      line-height: 40px;
      border-bottom: 0;
      color: ${props => props.theme.txt.halfOpa};
    }
    .tabs-menu-item:not(.is-active) a:hover {
      color: ${props => props.theme.primary.light};
    }
    .tabs-menu-item.is-active a {
      border-bottom: 3px solid ${props => props.tabStatus};
      border-top: 0;
      color: ${props => props.theme.primary.main};
      font-weight: 500;
    }
    .tabs-panel {
      display: none;
      padding: 30px;
    }
    .tabs-panel.is-active {
      display: block;
    }
`;

const get = (o, p) =>
    p.reduce(
        (xs, x) =>
            ((xs && xs[x]) ?
                xs[x] : null), o);

function checkOperationMode(inputValue, radioSettings, selectRadio) {
    if (inputValue === 'disable'|| inputValue === 'mesh') {
        return false;
    }
    return Object.keys(radioSettings).some((radioName) =>
        radioName !== selectRadio &&
        (radioSettings[radioName].operationMode !== inputValue &&
        radioSettings[radioName].operationMode !== 'disable' &&
        radioSettings[radioName].operationMode !== 'mesh')
    );
}

function validateHostname(i18n, inputValue, inputHelperText, optionType, regexStr) {
    let isValidObj = formValidator('isRequired', inputValue, inputHelperText);
    if (optionType !== 'regex') {
        isValidObj.result = false;
        isValidObj.text = i18n('retrieveTypeFail');
    } else if (isValidObj.result) {
        isValidObj = formValidator(
            'matchRegex',
            inputValue,
            new RegExp(regexStr),
            inputHelperText
        );
        if (!isValidObj.result) {
            isValidObj.text = i18n('invalidHostnameRegex');
        }
    }
    return isValidObj;
}

function validateMobilityDomain(i18n, inputValue, inputHelperText, optionType, regexStr) {
    let isValidObj = formValidator('isRequired', inputValue, inputHelperText);
    if (optionType !== 'regex') {
        isValidObj.result = false;
        isValidObj.text = i18n('retrieveTypeFail');
    } else if (isValidObj.result) {
        isValidObj = formValidator(
            'matchRegex',
            inputValue,
            new RegExp(regexStr),
            inputHelperText
        );
        if (!isValidObj.result) {
            isValidObj.text = i18n('invalidMobilityDomainRegex');
        }
    }
    return isValidObj;
}

function validateDistance(i18n, inputValue, inputHelperText, optionType, optionData) {
    const distanceReg = /^[0-9]+$/;
    let minNo = 0;
    let maxNo = 0;

    if (optionType === 'mixed') {
        optionData.forEach((typeObj) => {
            if (typeObj.type === 'int') {
                minNo = typeObj.data.min;
                maxNo = typeObj.data.max;
            }
        });
    }

    let isValidObj = formValidator('isRequired', inputValue, inputHelperText);
    if (optionType === 'invalid') {
        isValidObj.result = false;
        isValidObj.text = i18n('retrieveTypeFail');
    } else if (isValidObj.result && inputValue !== 'Auto' && inputValue !== 'auto') {
        isValidObj = formValidator('matchRegex', inputValue, distanceReg, inputHelperText);
        if (!isValidObj.result) {
            isValidObj.text = i18n('invalidDistanceRegex');
        } else {
            isValidObj = formValidator('checkRange', inputValue, {min: minNo, max: maxNo}, inputHelperText);
            if (!isValidObj.result) {
                isValidObj.text = i18n('invalidDistanceRange');
            }
        }
    }
    return isValidObj;
}

function validateInt(i18n, inputValue, inputHelperText, optionType, minNo, maxNo) {
    console.log(typeof inputValue)
    const mtuRegex = /^[0-9]+$/;
    let isValidObj = formValidator('isRequired', inputValue, inputHelperText);
    if (optionType !== 'int') {
        isValidObj.result = false;
        isValidObj.text = i18n('retrieveTypeFail');
    } else if (isValidObj.result) {
        isValidObj = formValidator('matchRegex', inputValue, mtuRegex, inputHelperText);
        if (!isValidObj.result) {
            isValidObj.text = i18n('invalidMtuRegex');
        } else {
            isValidObj = formValidator('checkRange', inputValue, {min: minNo, max: maxNo}, inputHelperText);
            if (!isValidObj.result) {
                const invalidMtuRange0 = i18n('invalidMtuRange0');
                const invalidMtuRange1 = i18n('invalidMtuRange1');
                const invalidMtuRange2 = i18n('invalidMtuRange2');
                isValidObj.text = `${invalidMtuRange0}${minNo}${invalidMtuRange1}${maxNo}${invalidMtuRange2}`;
            }
        }
    }
    return isValidObj;
}

function validateEnumOption(i18n, inputValue, inputHelperText, optionType, configOption, optionName) {
    let isValidObj = formValidator('isRequired', inputValue, inputHelperText);
    if (optionType !== 'enum') {
        isValidObj.result = false;
        isValidObj.text = i18n('retrieveTypeFail');
    } else if (isValidObj.result) {
        isValidObj = formValidator('enum', inputValue.toString(), configOption, inputHelperText);
        if (!isValidObj.result) {
            let errorText = i18n('invalidEnumVal');
            switch (optionName) {
                case 'operationMode':
                    errorText = i18n('invalidOperationMode');
                    break;
                default:
            }
            isValidObj.text = errorText;
        }
    }
    return isValidObj;
}

function validateMultipleSelectionEnum(i18n, inputArr, inputHelperText, optionType, configOption, optionName) {
    // always true for acs channel list (special case)
    if (optionName === 'acsChannelList') {
        return { result: true };
    }

    // for other multi-selectable options other than channel list
    let isValidObj = formValidator('isRequired', inputArr, inputHelperText);
    
    if (optionType !== 'enum') {
        isValidObj.result = false;
        isValidObj.text = i18n('retrieveTypeFail');
    } else if (isValidObj.result) {
        isValidObj = formValidator('multiEnum', inputArr, configOption, inputHelperText);
        
        if (!isValidObj.result) {
            let errorText = i18n('invalidEnumVal');
            isValidObj.text = errorText;
        }
    }
    
    return isValidObj;
}

function validateRssiFilterTolerance(rssiFilterTolerance, min, max) {
    if (rssiFilterTolerance === 255 || (rssiFilterTolerance >= min && rssiFilterTolerance <= max)) {
        return {result: true, text: ''};
    }
    return {result: false, text: 'This field contains invalid value.'};
}

function validateRssiFilterRange(rssiFilterLower, rssiFilterUpper, min, max) {
    if ((rssiFilterLower === 255 || (rssiFilterLower >= min && rssiFilterLower <= max)) ||
        ((rssiFilterUpper === 255 || (rssiFilterUpper >= min && rssiFilterUpper <= max)))) {
        if (rssiFilterLower !== 255 && rssiFilterUpper !== 255) {
            return {result: (rssiFilterUpper - rssiFilterLower) > 1, text: ''};
        }
        return {result: true, text: ''};
    }
    return {result: false, text: 'This field contains invalid value.'};
}

function validateAtpcRange(atpcTargetRssi, atpcRangeUpper, atpcRangeLower) {
    if (atpcTargetRssi <= atpcRangeUpper && atpcTargetRssi >= atpcRangeLower) {
        return {result: true, text: ''};
    }
    return {result: false, text: 'This field contains invalid value.'};
}

const checkboxStyle = createTheme({
    overrides: {
        MuiCheckbox: {
            colorSecondary: {
                color: '#DC4639',
                '&$checked': {
                    color: '#DC4639',
                },
            },
        },
    },
});

const {
    colors,
    themeObj,
} = Constant;

class NodeConfigurationBox extends React.Component {
    constructor(props) {
        super(props);
        this.t = this.props.t;
        this.timeout = 0;
        const {nodes} = this.props;
        const stateObj = {};
        const statusTextObj = {}; // To store field helperText
        const errorStatusObj = {}; // To show red
        const formStatusObj = {}; // To disable save button
        const disableRadioFilter = {};
        const loadRadioFilter = {};
        this.modelName = nodes[0].model;
        // is endt option supported
        this.fwVersion = nodes[0].fwVersion;
        this.isFwSupportEndt = isFwLTE(this.fwVersion, endtSupportVersion);
        this.isFwSupportAtpc = checkFwLTEDetail(this.fwVersion, atpcSupportVersion);
        this.isFwSupportAllowReboot = checkFwLTEDetail(this.fwVersion, allowRebootSupportVersion);
        // is acs option supported
        this.isFwSupportAcs = checkFwLTEDetail(this.fwVersion, acsSupportVersion);
        
        // Setup Node settings
        stateObj.nodeSettings = {};
        statusTextObj.nodeSettings = {};
        errorStatusObj.nodeSettings = {};
        formStatusObj.nodeSettings = {};
        Constant.modelOption[this.modelName].nodeSettings.forEach((opt) => {
            stateObj.nodeSettings[opt] = '';
            statusTextObj.nodeSettings[opt] = '';
            errorStatusObj.nodeSettings[opt] = false;
            formStatusObj.nodeSettings[opt] = true;
        });

        // Setup Radio Settings
        stateObj.radioSettings = {};
        statusTextObj.radioSettings = {};
        errorStatusObj.radioSettings = {};
        formStatusObj.radioSettings = {};
        
        Object.keys(Constant.modelOption[this.modelName].radioSettings).forEach((radio) => {
            disableRadioFilter[radio] = false;
            loadRadioFilter[radio] = false;
            stateObj.radioSettings[radio] = {};
            statusTextObj.radioSettings[radio] = {};
            errorStatusObj.radioSettings[radio] = {};
            formStatusObj.radioSettings[radio] = {};
            Constant.modelOption[this.modelName].radioSettings[radio].forEach((opt) => {
            // check if support ATPC
            if (
                !this.isFwSupportAtpc &&
                (
                    opt === 'atpcRangeLower' ||
                    opt === 'atpcRangeUpper' ||
                    opt === 'atpcTargetRssi'
                )
            ) {
                return;
            }
                stateObj.radioSettings[radio][opt] = '';
                statusTextObj.radioSettings[radio][opt] = this.t(`optionObj.radioSettings.${opt}.helperText`);
                errorStatusObj.radioSettings[radio][opt] = false;
                formStatusObj.radioSettings[radio][opt] = true;
            });
        });

        // Setup advanced config settings
        Object.keys(Constant.modelOption[this.modelName].radioSettings).forEach((radio) => {
            Constant.advancedConfigOption[radio].forEach((opt) => {
                // check if support ATPC
                if (
                    !this.isFwSupportAtpc &&
                    (
                        opt === 'atpcRangeLower' ||
                        opt === 'atpcRangeUpper' ||
                        opt === 'atpcTargetRssi'
                    )
                ) {
                    return;
                }
                stateObj.radioSettings[radio][opt] = '';
                statusTextObj.radioSettings[radio][opt] = this.t(`optionObj.radioSettings.${opt}.helperText`);
                errorStatusObj.radioSettings[radio][opt] = false;
                formStatusObj.radioSettings[radio][opt] = true;
            });
        });

        // Setup ethernet settings
        stateObj.ethernetSettings = {};
        statusTextObj.ethernetSettings = {};
        errorStatusObj.ethernetSettings = {};
        formStatusObj.ethernetSettings = {};
        Object.keys(Constant.modelOption[this.modelName].ethernetSettings).forEach((radio) => {
            stateObj.ethernetSettings[radio] = {};
            statusTextObj.ethernetSettings[radio] = {};
            errorStatusObj.ethernetSettings[radio] = {};
            formStatusObj.ethernetSettings[radio] = {};
            Constant.modelOption[this.modelName].ethernetSettings[radio].forEach((opt) => {
                stateObj.ethernetSettings[radio][opt] = '';
                statusTextObj.ethernetSettings[radio][opt] = this.t(`optionObj.ethernetSettings.${opt}.helperText`);
                errorStatusObj.ethernetSettings[radio][opt] = false;
                formStatusObj.ethernetSettings[radio][opt] = true;
            });
        });

        this.checksums = {};

        const fnNames = [
            'getNodeConfig',
            'handleNodeConfigTabChange',
            'handleRadioChange',
            'handleChange',
            'clickReset',
            'clickSave',
            'handleDialogOnClose',
            'setNodeConfig',
            'enterToSubmit',
            'triggerFormStatus',
            'updateNodeConfigData',
            'getConfigError',
            'setConfigSuccess',
            'setConfigError',
            'getConfigOptions',
            'updateConfigOptions',
            'getConfigOptionsError',
            'validateForm',
            'invalidCountryValue',
            'handleUnmanagedHostnode',
            'openRssiWarningDialog',
            'handleRssiWarningConfirm',
            'updateNodeConfigToStore',
            'getMobilityTabStatus',
            'updateMobilityTab',
            'adjustSpecialNodeConfigIfAny'
        ];

        fnNames.forEach((fnName) => {
            this[fnName] = this[fnName].bind(this);
        });

        this.state = {
            nodeConfig: null,
            loadData: stateObj,
            formData: stateObj,
            statusText: statusTextObj,
            errorStatus: errorStatusObj,
            warnStatus: {
                nodeSettings: {
                    maxNbr: false,
                },
            },
            formStatus: formStatusObj,
            disableRadioFilter,
            model: this.modelName,
            nodeConfigTabNo: 0,
            networkConfigTabNo: 0,
            dialog: {
                open: false,
                title: '',
                content: '',
                submitButton: this.t('submitBtnTitle'),
                submitAction: this.handleDialogOnClose,
                cancelButton: '',
                cancelAction: this.handleDialogOnClose,
            },
            isLock: false,
            acl: {},
            advancedConfig: {
                rssiWarningDialogOpen: false,
                agreeWarning: false,
                confirmWarning: false,
                saveObj: {},
            },
            meshSettings: {},
            hostnameModified: false,
        };
    }

    componentWillMount() {
        this.getNodeConfig();
        this.mounted = true;
    }

    componentDidMount() {
        this.handleNodeConfigTabChange(1);
        this.handleRadioChange(1);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if (window.__.isEqual(this.props, nextProps) && window.__.isEqual(this.state, nextState)) {
            return false;
        }
        return true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    getNodeConfig() {
        this.setState({
            isLock: true,
        });

        const projectId = Cookies.get('projectId');
        const p = getCachedConfig(this.props.csrf, projectId, {nodes: [this.props.nodes[0].ipv4]});

        p.then((value) => {
            console.log(value)
            if (this.mounted) {
                this.updateNodeConfigData(value);
            }
        }).catch((error) => {
            if (this.mounted) {
                this.getConfigError(error);
            }
        });
    }

    // get filter config options and cross check whether the loaded configuration is within the acceptable values
    getConfigOptions(cb) {
        // const deepClone = object => JSON.parse(JSON.stringify(object));
        this.setState({
            isLock: true,
        });
        const {ethernetSettings, nodeSettings, radioSettings, profileSettings} = this.state.formData;
        // const {ethernetSettings, nodeSettings, radioSettings} = this.state.formData;
        const newRadioSettings = JSON.parse(JSON.stringify(this.state.nodeConfig.radioSettings));
        const newEthernetSettings = JSON.parse(JSON.stringify(this.state.nodeConfig.ethernetSettings));
        const newProfileSettings = JSON.parse(JSON.stringify(this.state.nodeConfig.profileSettings));
        const {ipv4} = this.props.nodes[0];
        const bodyMsg = {};
        bodyMsg.options = {};

        bodyMsg.options.meshSettings = ['country'];

        bodyMsg.options.nodeSettings = {};
        bodyMsg.options.nodeSettings[ipv4] = [];
        Object.keys(nodeSettings).forEach((optionName) => {
            if (optionName !== 'maxNbr') {
                bodyMsg.options.nodeSettings[ipv4].push(optionName);
            }
        });
        bodyMsg.options.radioSettings = {};
        bodyMsg.options.radioSettings[ipv4] = {};

        Object.keys(radioSettings).forEach((radioName) => {
            bodyMsg.options.radioSettings[ipv4][radioName] = [];
            Object.keys(radioSettings[radioName]).forEach((optionName) => {
                bodyMsg.options.radioSettings[ipv4][radioName].push(optionName);
            });
        });
        Object.keys(newRadioSettings[ipv4]).forEach((radioName) => {
            Object.keys(newRadioSettings[ipv4][radioName]).forEach((optionName) => {
                newRadioSettings[ipv4][radioName][optionName] = radioSettings[radioName][optionName];
            });
        });
        bodyMsg.options.ethernetSettings = {};
        bodyMsg.options.ethernetSettings[ipv4] = {};
        Object.keys(ethernetSettings).forEach((ethName) => {
            bodyMsg.options.ethernetSettings[ipv4][ethName] = [];
            Object.keys(ethernetSettings[ethName]).forEach((optionName) => {
                bodyMsg.options.ethernetSettings[ipv4][ethName].push(optionName);
            });
        });
        Object.keys(newEthernetSettings[ipv4]).forEach((ethName) => {
            Object.keys(newEthernetSettings[ipv4][ethName]).forEach((optionName) => {
                newEthernetSettings[ipv4][ethName][optionName] = ethernetSettings[ethName][optionName];
            });
        });
        bodyMsg.options.profileSettings = {};
        bodyMsg.options.profileSettings[ipv4] = {};
        Object.keys(profileSettings).forEach((profileOpt) => {
            bodyMsg.options.profileSettings[ipv4][profileOpt] = {};
            Object.keys(profileSettings[profileOpt]).forEach((profileId) => {
                bodyMsg.options.profileSettings[ipv4][profileOpt][profileId] = [];
                Object.keys(profileSettings[profileOpt][profileId]).forEach((opt) => {
                    bodyMsg.options.profileSettings[ipv4][profileOpt][profileId].push(opt);
                });
            });
        });
        Object.keys(newProfileSettings[ipv4]).forEach((profileOpt) => {
            Object.keys(newProfileSettings[ipv4][profileOpt]).forEach((profileId) => {
                Object.keys(newProfileSettings[ipv4][profileOpt][profileId]).forEach((opt) => {
                    newProfileSettings[ipv4][profileOpt][profileId][opt] = profileSettings[profileOpt][profileId][opt];
                });
            });
        });
        //  assign node settings maxNbr to profile Settings and radio Settings
        newProfileSettings[ipv4].nbr['1'].maxNbr = nodeSettings.maxNbr;
        // nodeSettings

        bodyMsg.sourceConfig = {};
        bodyMsg.sourceConfig.meshSettings = this.state.nodeConfig.meshSettings;
        bodyMsg.sourceConfig.radioSettings = {};
        bodyMsg.sourceConfig.radioSettings = newRadioSettings;
        bodyMsg.sourceConfig.nodeSettings = {};
        bodyMsg.sourceConfig.nodeSettings[ipv4] = deepClone(nodeSettings);
        bodyMsg.sourceConfig.nodeSettings[ipv4].acl = this.state.acl;
        delete bodyMsg.sourceConfig.nodeSettings[ipv4].maxNbr
        bodyMsg.sourceConfig.ethernetSettings = {};
        bodyMsg.sourceConfig.ethernetSettings = newEthernetSettings;
        bodyMsg.sourceConfig.profileSettings = {};
        bodyMsg.sourceConfig.profileSettings = newProfileSettings;
        // console.log('kyle_debug ~ file: ConfigurationBox.jsx ~ line 532 ~ NodeConfigurationBox ~ getConfigOptions ~ bodyMsg.sourceConfig', bodyMsg)

        console.log(bodyMsg)
        const projectId = Cookies.get('projectId');
        const p = getFilteredConfigOptions(
            this.props.csrf,
            projectId,
            bodyMsg
        );
        p.then((value) => {
            console.log(value)
            if (this.mounted) {
                this.updateConfigOptions(value, cb);
            }
        }).catch((error) => {
            if (this.mounted) {
                if (error.message === 'P2Error' && error.data.type === 'specific') {
                    const filterConfig = {};
                    let hasCriticalError = false;
                    Object.keys(error.data.data).forEach((settings) => {
                        if (error.data.data[settings].success) {
                            filterConfig[settings] = error.data.data[settings].data;
                        } else {
                            if (error.data.data[settings].specific) { //eslint-disable-line
                                if (error.data.data[settings].specific[ipv4].success) {
                                    filterConfig[settings] = error.data.data[settings].specific[ipv4].data;
                                } else {
                                    hasCriticalError = true;
                                    this.getConfigOptionsError(error);
                                }
                            } else if (error.data.data[settings].errors[0].type === 'partialretrieve') {
                                filterConfig[settings] = error.data.data[settings].errors[0].data;
                            }
                        }
                    });
                    if (!hasCriticalError) {
                        this.updateConfigOptions(filterConfig, cb);
                    }
                } else {
                    this.getConfigOptionsError(error);
                }
            }
        });
    }

    setNodeConfig(bodyMsg) {
        this.props.pollingHandler.stopInterval();
        const projectId = Cookies.get('projectId');
        const p = setConfig(this.props.csrf, projectId, bodyMsg);
        
        if (this.props.linkAlignmentDialogOpen) {
            this.props.setLinkAlignmentConfigProcessStatus(true);
        }
        
        p.then((value) => {
            if (this.mounted) {
                this.setConfigSuccess(value.rtt);
            }
        }).catch((error) => {
            console.error(error)
            if (this.mounted) {
                this.setConfigError(error);
                if (!this.props.linkAlignmentIsPolling) {
                    this.props.pollingHandler.restartInterval();
                }
            }
        });
    }

    getConfigError(error) {
        const {title, content} = check(error);
        const dialog = title !== '' ?
            {
                ...this.state.dialog,
                open: true,
                title,
                content,
                submitButton: this.t('submitBtnTitle'),
                submitAction: () => this.props.close(this.props.nodes[0].ipv4),
                cancelButton: '',
                cancelAction: this.handleDialogOnClose,
            } :
            {
                ...this.state.dialog,
                open: true,
                title: this.t('getConfigFailTitle'),
                content: this.t('getConfigFailContent'),
                submitButton: this.t('submitBtnTitle'),
                submitAction: () => this.props.close(this.props.nodes[0].ipv4),
                cancelButton: '',
                cancelAction: this.handleDialogOnClose,
            };
        this.setState({
            ...this.state,
            dialog,
        });
    }

    setConfigSuccess(rtt) {
        setTimeout(() => {
            // Popup success dialog
            // if user click ok => close config box and unlock the config box
            this.setState({
                ...this.state,
                isLock: false,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('setConfigSuccessTitle'),
                    content: this.t('setConfigSuccessContent'),
                    submitButton: this.t('submitBtnTitle'),
                    submitAction: () => {
                        if (this.props.linkAlignmentDialogOpen) {
                            this.props.setLinkAlignmentConfigProcessStatus(false);
                        }
                        this.props.close(this.props.nodes[0].ipv4);
                        this.updateNodeConfigToStore(false);
                    },
                    cancelButton: '',
                    cancelAction: this.handleDialogOnClose,
                },
            });
            if (!this.props.linkAlignmentIsPolling) {
                this.props.pollingHandler.restartInterval();
            }
        }, (parseInt(rtt, 10) * 1000));
    }

    setConfigError(error) {
        const {title, content} = check(error);
        const dialog = title !== '' ?
            {
                ...this.state.dialog,
                open: true,
                title,
                content,
                submitButton: this.t('submitBtnTitle'),
                submitAction: this.handleDialogOnClose,
                cancelButton: '',
                cancelAction: this.handleDialogOnClose,
            } :
            {
                ...this.state.dialog,
                open: true,
                title: this.t('setConfigFailTitle'),
                content: this.t('setConfigFailContent'),
                submitButton: this.t('submitBtnTitle'),
                submitAction: this.handleDialogOnClose,
                cancelButton: '',
                cancelAction: this.handleDialogOnClose,
            };
        // Popup error dialog
        // when user click ok => unlock the config box
        if (this.props.linkAlignmentDialogOpen) {
            this.props.setLinkAlignmentConfigProcessStatus(false);
        }
        this.setState({
            ...this.state,
            isLock: false,
            dialog,
        });
    }

    getConfigOptionsError(error) {
        const {title, content} = check(error);
        if (title !== '') {
            this.popUpDialog(
                title,
                content,
                'OK',
                () => { this.props.close(this.props.nodes[0].ipv4); }
            );
        } else {
            this.popUpDialog(
                'Error',
                this.t('retrieveTypeFail'),
                'OK',
                () => { this.props.close(this.props.nodes[0].ipv4); }
            );
        }
    }

    getMobilityTabStatus() {
        const {radioSettings} = this.state.formData;
        let isMobilityTabDisabled = true;
        Object.keys(radioSettings).forEach((radio) => {
            if (radioSettings[radio].operationMode === 'static' ||
                radioSettings[radio].operationMode === 'mobile') {
                isMobilityTabDisabled = false;
            }
        });
        return isMobilityTabDisabled;
    }

    adjustSpecialNodeConfigIfAny(optionTypeObj) {
        // acs channel discard logic handling
        const { ipv4 } = this.props.nodes[0];
        const currentAcsFormData = this.state.formData.nodeSettings.acsChannelList;
        const refAcsChannelOptionsObj = optionTypeObj.nodeSettings[ipv4].acsChannelList.data ?
            optionTypeObj.nodeSettings[ipv4].acsChannelList.data : [];
        let refAcsChannelOptionActualValueList = [];
        
        // extract the filter config option data for cross checking with form data
        if (!refAcsChannelOptionsObj ||
            !Array.isArray(refAcsChannelOptionsObj) ||
            refAcsChannelOptionsObj.length === 0
        ) {
            return;
        } else {
            refAcsChannelOptionActualValueList = refAcsChannelOptionsObj.map(
                acsChOptionObj => acsChOptionObj.actualValue
            )
        }
        // actual discard
        if (currentAcsFormData && refAcsChannelOptionActualValueList.length > 0) {
            const acsFormDataWithInvalidChDiscarded = currentAcsFormData.filter(
                currentAcsCh => refAcsChannelOptionActualValueList.indexOf(currentAcsCh) > -1
            )
            
            // re-order the selected multi channels
            acsFormDataWithInvalidChDiscarded.sort(
                (first, second) => {
                    return parseInt(first) - parseInt(second);
                }
            )
            
            // update the formData state object
            const newformDataObj = {
                ...this.state.formData,
                nodeSettings: {
                    ...this.state.formData.nodeSettings,
                    acsChannelList: acsFormDataWithInvalidChDiscarded
                }
            }
            
            this.setState({
                ...this.state,
                formData: newformDataObj
            })
        }
    }

    updateConfigOptions(optionTypeObj, cb) {
        console.log(optionTypeObj)
        this.setState({
            ...this.state,
            isLock: false,
            configOptionType: optionTypeObj,
        }, () => {
            const countryOpt = this.state.configOptionType.meshSettings.country.data
                .filter(opt => opt.actualValue === this.state.meshSettings.country);
            this.props.setClusterInformation({
                country: this.state.meshSettings.country,
                displayValue: get(countryOpt, [0, 'displayValue']) || '-',
                actualValue: this.state.meshSettings.country,
            });
            this.adjustSpecialNodeConfigIfAny(optionTypeObj);
            this.updateNodeConfigToStore(true);
            
            if (typeof cb !== 'undefined') {
                cb();
            } else {
                this.validateForm();
            }
        });
    }

    updateNodeConfigData(configObj) {
        // handle ui display when configuration is first loaded (per node)
        console.log(configObj)
        this.checksums = configObj.checksums;
        const {
            ethernetSettings, radioSettings, nodeSettings, meshSettings,
            profileSettings,
        } = configObj;
        
        if (Object.keys(meshSettings).length === 0) {
            this.handleUnmanagedHostnode();
            return;
        }
        
        const ipv4 = Object.keys(radioSettings)[0];
        const modelName = this.state.model;
        const newformDataObj = {};
        const newDisableRadioFilter = {};

        if (typeof meshSettings.discrepancies !== 'undefined' && !this.props.enableBoundlessConfig) {
            const title = this.t('inSyncTitle');
            const content = this.t('inSyncContent');
            const submitTitle = this.t('inSyncAction');
            const submitAction = () => {
                this.props.history.push('/config');
                if (this.props.linkAlignmentDialogOpen) {
                    this.props.toggleAlignmentDialog(false, '', true);
                }
            };
            const cancelTitle = '';
            const cancelAction = null;
            this.popUpDialog(title, content, submitTitle, submitAction, cancelTitle, cancelAction);
        } else {
            // Setup Node settings
            newformDataObj.nodeSettings = {};
            Constant.modelOption[modelName].nodeSettings.forEach((opt) => {
                if (opt === 'maxNbr') {
                    newformDataObj.nodeSettings[opt] =
                        profileSettings[ipv4].nbr[radioSettings[ipv4].radio0.profileId.nbr].maxNbr;
                } else {
                    newformDataObj.nodeSettings[opt] = nodeSettings[ipv4][opt];
                }
            });

            // Setup Radio Settings
            newformDataObj.radioSettings = {};
            Object.keys(Constant.modelOption[modelName].radioSettings).forEach((radio) => {
                newformDataObj.radioSettings[radio] = {};
                newDisableRadioFilter[radio] = radioSettings[ipv4][radio].band === '4.9';
                Constant.modelOption[modelName].radioSettings[radio].forEach((opt) => {
                    newformDataObj.radioSettings[radio][opt] = radioSettings[ipv4][radio][opt];
                });
                newformDataObj.radioSettings[radio].profileId =  radioSettings[ipv4][radio].profileId;
            });

            Object.keys(Constant.modelOption[modelName].radioSettings).forEach((radio) => {
                Constant.advancedConfigOption[radio].forEach((opt) => {
                    newformDataObj.radioSettings[radio][opt] = radioSettings[ipv4][radio][opt];
                });
            });

            // Setup ethernet Settings
            newformDataObj.ethernetSettings = {};
            Object.keys(Constant.modelOption[modelName].ethernetSettings).forEach((eth) => {
                newformDataObj.ethernetSettings[eth] = {};
                Constant.modelOption[modelName].ethernetSettings[eth].forEach((opt) => {
                    newformDataObj.ethernetSettings[eth][opt] = ethernetSettings[ipv4][eth][opt];
                });
            });

            // Setup profile Settings
            newformDataObj.profileSettings = profileSettings[ipv4];
            // newformDataObj.profileSettings = {
            //     nbr: {
            //         '1': {
            //             maxNbr: "6"
            //         }
            //     }
            // };

            this.setState({
                ...this.state,
                loadData: newformDataObj,
                formData: newformDataObj,
                nodeConfig: configObj,
                acl: nodeSettings[ipv4].acl,
                disableRadioFilter: newDisableRadioFilter,
                loadRadioFilter: newDisableRadioFilter,
                meshSettings,
            }, () => {
                this.getConfigOptions();
            });
        }
    }

    popUpDialog(title, content, submitTitle, submitAction, cancelTitle, cancelAction) {
        const submitTitleVal = typeof submitTitle !== 'undefined' ? submitTitle : this.t('submitBtnTitle');
        const submitActVal = typeof submitAction !== 'undefined' ? submitAction : this.handleDialogOnClose;
        const cancelTitleVal = typeof cancelTitle !== 'undefined' ? cancelTitle : '';
        const cancelActVal = typeof cancelAction !== 'undefined' ? cancelAction : this.handleDialogOnClose;

        this.setState({
            ...this.state,
            dialog: {
                ...this.state.dialog,
                open: true,
                title,
                content,
                submitButton: submitTitleVal,
                submitAction: submitActVal,
                cancelButton: cancelTitleVal,
                cancelAction: cancelActVal,
            },
            isLock: false,
        });
    }

    clickReset() {
        this.setState({
            ...this.state,
            formData: this.state.loadData,
            disableRadioFilter: this.state.loadRadioFilter,
            hostnameModified: false,
        }, () => this.getConfigOptions());
    }

    handleNodeConfigTabChange(nodeConfigTabNo) {
        this.setState({nodeConfigTabNo});
    }

    handleRadioChange(networkConfigTabNo) {
        this.setState({networkConfigTabNo});
    }

    handleUnmanagedHostnode() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('unmanagedHostnodeErrTitle'),
                content: this.t('unmanagedHostnodeErrContent'),
                nonTextContent: <span />,
                submitTitle: this.t('unmanagedHostnodeErrBtn'),
                submitAction: () => this.props.close(this.props.nodes[0].ipv4),
                cancelTitle: '',
                cancelAction: this.handleDialogOnClose,
            },
            isLock: false,
        });
    }

    handleClose(event) {
        const { nodeSettings } = this.state.formData;
        let inputID = event.target.id || event.target.name;
        let inputValue = event.target.value;
        const { ipv4 } = this.props.nodes[0];
        const { configOptionType } = this.state;

        console.warn(inputID)
        if (inputID && inputID.startsWith('node_')) {
            inputID = inputID.replace('node_', '')
        }

        // all node settings now
        let inputHelperText = this.t(`optionObj.nodeSettings.${inputID}.helperText`);
        let configOption = configOptionType.nodeSettings[ipv4];
        
        // special handling for acs channel list
        if (inputID === "acsChannelList") {
            // discard invalid channels automatically
            const configOptionChActualValList =
                Array.isArray(configOption.acsChannelList.data) ?
                    configOption.acsChannelList.data.map(configOptionChObj => configOptionChObj.actualValue) : [];

            configOption.acsChannelList = Array.isArray(inputValue) && inputValue.filter((acsChannel) => {
                return configOptionChActualValList.indexOf(acsChannel) > -1
            }).sort((a, b) => parseInt(a) - parseInt(b));
        }
        
        let isValidObj = {};

        switch (inputID) {
            case 'acsChannelList':
                isValidObj = validateMultipleSelectionEnum(
                    this.t,
                    inputValue,
                    inputHelperText,
                    configOption[inputID].type,
                    configOption[inputID].data,
                    inputID
                );
                this.triggerFormStatus(
                    inputID, isValidObj.result, isValidObj.text, inputValue, null
                );
                break;
        }
    }
    
    handleChange(event, radioName) {
        const {nodeSettings} = this.state.formData;
        console.log(nodeSettings); // ok
        // console.log('kyle_debug: ConfigurationBox -> handleChange -> radioName', radioName)
        let inputID = event.target.id || event.target.name;
        // console.log('kyle_debug: ConfigurationBox -> handleChange -> inputID', inputID);
        
        if (inputID.startsWith('node_')) {
            inputID = inputID.replace('node_', '')
        }
        
        let inputValue = event.target.value;
        const {ipv4} = this.props.nodes[0];
        const {configOptionType} = this.state;
        const isNodeSettings = typeof radioName === 'undefined';
        const isRadioSettings = !isNodeSettings && radioName?.includes('radio');
        let inputHelperText = '';
        let configOption;
        
        // pre-process some special configurations
        if (isRadioSettings) {
            inputHelperText = this.t(`optionObj.radioSettings.${inputID}.helperText`);
            configOption = configOptionType.radioSettings[ipv4];
        } else if (isNodeSettings) {
            inputHelperText = this.t(`optionObj.nodeSettings.${inputID}.helperText`);
            if (inputID === "maxNbr") {
                configOption = configOptionType.profileSettings[ipv4].nbr;
            }
            configOption = configOptionType.nodeSettings[ipv4];
        } else {
            inputHelperText = this.t(`optionObj.ethernetSettings.${inputID}.helperText`);
            configOption = configOptionType.ethernetSettings[ipv4];
        }
        
        let isValidObj = {};
        
        switch (inputID) {
            case 'hostname':
                isValidObj = validateHostname(
                    this.t,
                    inputValue,
                    inputHelperText,
                    configOption.hostname.type,
                    configOption.hostname.data
                );
                break;
            case 'distance':
                isValidObj = validateDistance(
                    this.t,
                    inputValue,
                    inputHelperText,
                    configOption[radioName].distance.type,
                    configOption[radioName].distance.data
                );
                if (inputValue === 'Auto') {
                    inputValue = 'auto';
                }
                break;
            case 'rssiFilterTolerance':
                isValidObj = validateRssiFilterTolerance(inputValue, 0, 30);
                break;
            case 'mobilityDomain':
                isValidObj = validateMobilityDomain(
                    this.t,
                    inputValue,
                    inputHelperText,
                    configOption[radioName].mobilityDomain.type,
                    configOption[radioName].mobilityDomain.data
                );
                break;
            case 'mtu':
                isValidObj = validateInt(
                    this.t,
                    inputValue,
                    inputHelperText,
                    configOption[radioName].mtu.type,
                    configOption[radioName].mtu.data.min,
                    configOption[radioName].mtu.data.max
                );
                break;
            case 'endtSendInterval':
                isValidObj = validateInt(
                    this.t,
                    inputValue,
                    inputHelperText,
                    configOption[inputID].type,
                    configOption[inputID].data.min,
                    configOption[inputID].data.max
                );
                const {endtRecvTimeout} = nodeSettings;
                if (parseInt(endtRecvTimeout) < (parseInt(inputValue) * 2)) {
                    isValidObj.result = false;
                    isValidObj.text = 'Ethernet Neighbor Discovery Timeout should be greater than or equal to two times of its interval';
                }
                break;
            case 'endtRecvTimeout':
                isValidObj = validateInt(
                    this.t,
                    inputValue,
                    inputHelperText,
                    configOption[inputID].type,
                    configOption[inputID].data.min,
                    configOption[inputID].data.max
                );
                const {endtSendInterval} = nodeSettings;
                if (parseInt(inputValue) < (parseInt(endtSendInterval) * 2)) {
                    isValidObj.result = false;
                    isValidObj.text = 'Ethernet Neighbor Discovery Timeout should be greater than or equal to two times of its interval';
                }
                break;
            case 'endtPriority':
                isValidObj = validateInt(
                    this.t,
                    inputValue,
                    inputHelperText,
                    configOption[inputID].type,
                    configOption[inputID].data.min,
                    configOption[inputID].data.max
                );
                break;
            case 'maxNbr':
                isValidObj = validateEnumOption(
                    this.t,
                    inputValue,
                    inputHelperText,
                    isNodeSettings ?
                        configOption['1'][inputID].type :
                        configOption[radioName][inputID].type,
                    isNodeSettings ?
                        configOption['1'][inputID].data :
                        configOption[radioName][inputID].data,
                    inputID
                );
                break;
            case 'atpcInterval':
                isValidObj = validateEnumOption(
                    this.t,
                    inputValue,
                    inputHelperText,
                    configOption[inputID].type,
                    configOption[inputID].data,
                    inputID
                );
                    break;
            case 'allowReboot':
                isValidObj = validateEnumOption(
                    this.t,
                    inputValue,
                    inputHelperText,
                    configOption[inputID].type,
                    configOption[inputID].data,
                    inputID
                );
                    break;
            case 'acs':
                isValidObj = validateEnumOption(
                    this.t,
                    inputValue,
                    inputHelperText,
                    configOption[inputID].type,
                    configOption[inputID].data,
                    inputID
                );
                break;
            case 'acsInterval':
                isValidObj = validateEnumOption(
                    this.t,
                    inputValue,
                    inputHelperText,
                    configOption[inputID].type,
                    configOption[inputID].data,
                    inputID
                );
                break;
            default:
                if (inputID !== 'acsChannelList') {
                    isValidObj = validateInt(
                        this.t,
                        inputValue,
                        inputHelperText,
                        configOption[radioName][inputID].type,
                        configOption[radioName][inputID].data,
                        inputID
                    );
                }
        }

        if (inputID === 'status' && inputValue === 'disable') {
            this.popUpDialog(
                this.t('disableRadioWarningTitle'),
                this.t('disableRadioWarningContent'),
                this.t('submitBtnTitle'),
                () => {
                    this.handleDialogOnClose(() => {
                        this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text, inputValue, radioName);
                    });
                },
                this.t('cancelBtnTitle'),
                () => {
                    this.handleDialogOnClose(() => {
                        this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text, 'enable', radioName);
                    });
                }
            );
        } else if (inputID === 'operationMode') {
            if (checkOperationMode(inputValue, this.state.formData.radioSettings, radioName)) {
                this.popUpDialog(
                    (
                        <span>
                            <WarningIcon
                                color="error"
                                fontSize="large"
                                style={{
                                    marginRight: '10px',
                                    fontSize: '30px',
                                }}
                            />
                            <span
                                style={{
                                    transform: 'translate(0%, -25%)',
                                    fontWeight: 'bold',
                                    display: 'inline-block',
                                }}
                            >
                                {this.t('syncOperationModeTitle')}
                            </span>
                        </span>
                    ),
                    (
                        <Trans
                            defaults={this.t('syncOperationModeContent')}
                            components={{ bold: <strong /> }}
                        />
                    ),
                    this.t('syncOperationModeCancel'),
                    () => {
                        this.handleDialogOnClose();
                    }
                );
            } else {
                this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text, inputValue, radioName);
            }
        } else if (inputID === 'centralFreq' || inputID === 'channel') {
            this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text, inputValue, radioName, true);
        } else if (inputID === 'band') {
            this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text, inputValue, radioName, false, true);
        } else if (inputID === 'hostname') {
            this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text, inputValue, radioName, false, false, true);
        } else if (inputID === 'mtu') {
            if (!isValidObj.result) {
                this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text, inputValue, radioName);
            } else {
                this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text,
                    parseInt(inputValue, 10), radioName);
            }
        } else if (inputID === 'distance') {
            // console.log('inputValue: ', inputValue);
            if (!isValidObj.result || inputValue === 'auto') {
                this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text, inputValue, radioName);
            } else {
                this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text,
                    parseInt(inputValue, 10), radioName);
            }
        } else {
            this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text, inputValue, radioName);
        }
    }

    triggerFormStatus(field, status, text, inputValue, radioName, syncValue = false, bandValidation = false, hostnameModified = false) {
        // console.log('triggerFormStatus');
        // console.log(field);
        // console.log(status);
        // console.log(text);
        // integer here
        console.log(inputValue);
        // console.log(radioName);
        const isNodeSettings = typeof radioName === 'undefined';
        const isRadioSettings = !isNodeSettings && radioName.includes('radio');
        const {formData} = this.state;
        let toggleRadioFilter = false;
        let syncKey = '';
        if (syncValue) {
            syncKey = field === 'centralFreq' ? 'channel' : 'centralFreq';
        }
        if (bandValidation && isRadioSettings) {
            toggleRadioFilter = formData.radioSettings[radioName].band !== inputValue;
            if (
                toggleRadioFilter &&
                inputValue === '4.9' &&
                formData.radioSettings[radioName].radioFilter === 'enable'
            ) {
                this.popUpDialog(
                    this.t('radioFilterDisableTitle'),
                    this.t('radioFilterDisableContent')
                );
            }
        }
        let tmpOperationMode = isRadioSettings ? this.state.formData.radioSettings[radioName].operationMode : '';
        if (field === 'status' && inputValue === 'disable') {
            tmpOperationMode = 'disable';
        }

        if (isRadioSettings) {
            this.setState({
                formStatus: {
                    ...this.state.formStatus,
                    radioSettings: {
                        ...this.state.formStatus.radioSettings,
                        [radioName]: {
                            ...this.state.formStatus.radioSettings[radioName],
                            [field]: status,
                        },
                    },
                },
                errorStatus: {
                    ...this.state.errorStatus,
                    radioSettings: {
                        ...this.state.errorStatus.radioSettings,
                        [radioName]: {
                            ...this.state.errorStatus.radioSettings[radioName],
                            [field]: !status,
                        },
                    },
                },
                statusText: {
                    ...this.state.statusText,
                    radioSettings: {
                        ...this.state.statusText.radioSettings,
                        [radioName]: {
                            ...this.state.statusText.radioSettings[radioName],
                            [field]: text,
                        },
                    },
                },
                formData: {
                    ...this.state.formData,
                    radioSettings: {
                        ...this.state.formData.radioSettings,
                        [radioName]: {
                            ...this.state.formData.radioSettings[radioName],
                            [field]: inputValue,
                            ...(field === 'status' && {operationMode: tmpOperationMode}),
                            ...(syncValue && {[syncKey]: inputValue}),
                            ...((toggleRadioFilter && inputValue === '4.9') && {radioFilter: 'disable'}),
                        },
                    },
                },
                ...(toggleRadioFilter && {
                    disableRadioFilter: {
                        ...this.state.disableRadioFilter,
                        [radioName]: !this.state.disableRadioFilter[radioName],
                    },
                }),
            }, () => {
                if (field === 'distance') {
                    if (this.timeout) {
                        clearTimeout(this.timeout);
                    }
                    this.timeout = setTimeout(() => {
                        this.getConfigOptions();
                    }, 1000);
                } else if (field === 'mobilityDomain') {
                    const newRadioSettings = {};
                    Object.keys(Constant.modelOption[this.modelName].radioSettings).forEach((radio) => {
                        newRadioSettings[radio] = {
                            ...this.state.formData.radioSettings[radio],
                            [field]: inputValue,
                        };
                    });
                    this.setState({
                        ...this.state,
                        formData: {
                            ...this.state.formData,
                            radioSettings: newRadioSettings,
                        },
                    }, () => {
                        // if mobility tab is selected and the user select mesh or disable as operation mode
                        // switch to general tab to prevent user from setting the mobility tab option
                        this.updateMobilityTab(field);
                    });
                } else if (field === 'status') {
                    this.updateMobilityTab(field);
                } else {
                    this.getConfigOptions();
                }
            });
        } else if (isNodeSettings) {
            this.setState({
                formStatus: {
                    ...this.state.formStatus,
                    nodeSettings: {
                        ...this.state.formStatus.nodeSettings,
                        [field]: status,
                    },
                },
                errorStatus: {
                    ...this.state.errorStatus,
                    nodeSettings: {
                        ...this.state.errorStatus.nodeSettings,
                        [field]: !status,
                    },
                },
                statusText: {
                    ...this.state.statusText,
                    nodeSettings: {
                        ...this.state.statusText.nodeSettings,
                        [field]: text,
                    },
                },
                formData: {
                    ...this.state.formData,
                    nodeSettings: {
                        ...this.state.formData.nodeSettings,
                        [field]: inputValue,
                    },
                },
                hostnameModified,
            }, () => {
                // already be string here
                console.log(this.state.formData)
                if (field === 'hostname' || field === 'endtSendInterval' || field === 'endtRecvTimeout'|| field === 'endtPriority') {
                    if (this.timeout) {
                        clearTimeout(this.timeout);
                    }
                    this.timeout = setTimeout(() => {
                        this.getConfigOptions();
                    }, 1000);
                } else {
                    this.getConfigOptions();
                }
            });
        } else {
            this.setState({
                formStatus: {
                    ...this.state.formStatus,
                    ethernetSettings: {
                        ...this.state.formStatus.ethernetSettings,
                        [radioName]: {
                            ...this.state.formStatus.ethernetSettings[radioName],
                            [field]: status,
                        },
                    },
                },
                errorStatus: {
                    ...this.state.errorStatus,
                    ethernetSettings: {
                        ...this.state.errorStatus.ethernetSettings,
                        [radioName]: {
                            ...this.state.errorStatus.ethernetSettings[radioName],
                            [field]: !status,
                        },
                    },
                },
                statusText: {
                    ...this.state.statusText,
                    ethernetSettings: {
                        ...this.state.statusText.ethernetSettings,
                        [radioName]: {
                            ...this.state.statusText.ethernetSettings[radioName],
                            [field]: text,
                        },
                    },
                },
                formData: {
                    ...this.state.formData,
                    ethernetSettings: {
                        ...this.state.formData.ethernetSettings,
                        [radioName]: {
                            ...this.state.formData.ethernetSettings[radioName],
                            [field]: inputValue,
                            ...(syncValue && {[syncKey]: inputValue}),
                        },
                    },
                },
            }, () => {
                if (field === 'mtu') {
                    if (this.timeout) {
                        clearTimeout(this.timeout);
                    }
                    this.timeout = setTimeout(() => {
                        this.getConfigOptions();
                    }, 1000);
                } else {
                    this.getConfigOptions();
                }
            });
        }
    }

    updateMobilityTab(field) {
        const isMobilityTabDisabled = this.getMobilityTabStatus();
        if (isMobilityTabDisabled) {
            const tmpRadioSettings = {};
            Object.keys(Constant.modelOption[this.modelName].radioSettings).forEach((radio) => {
                tmpRadioSettings[radio] = {
                    ...this.state.formData.radioSettings[radio],
                    mobilityDomain: this.state.loadData.radioSettings[radio].mobilityDomain,
                };
            });
            this.setState({
                ...this.state,
                formData: {
                    ...this.state.formData,
                    radioSettings: tmpRadioSettings,
                },
            }, () => {
                this.getConfigOptions();
                // this.validateForm();
                this.handleNodeConfigTabChange(1);
            });
        } else if (field !== 'mobilityDomain') {
            this.getConfigOptions();
        }
    }

    openRssiWarningDialog(saveObj) {
        this.setState({
            ...this.state,
            advancedConfig: {
                ...this.state.advancedConfig,
                rssiWarningDialogOpen: true,
                saveObj,
            },
        });
    }

    handleRssiWarningConfirm() {
        // Generate the saveobj with checksums and diff object
        const {saveObj} = this.state.advancedConfig;

        // Pop up config confirm box with config alert message
        // this.state.advancedConfig.rssiWarningDialogOpen = false;
        this.setState({
            ...this.state,
            isLock: true,
            advancedConfig: {
                ...this.state.advancedConfig,
                rssiWarningDialogOpen: false,
                agreeWarning: false,
            },
        }, () => {
            this.setNodeConfig(saveObj);
        });
    }

    clickSave() {
        const nodeIp = this.props.nodes[0].ipv4;
        const {nodeSettings, radioSettings, ethernetSettings} = this.state.formData;
        const oldNodeSettings = this.state.loadData.nodeSettings;
        const oldRadioSettings = this.state.loadData.radioSettings;
        const oldEthSettings = this.state.loadData.ethernetSettings;

        const diffObj = {};
        Object.keys(nodeSettings).forEach((opt) => {
            // console.log('kyle_debug: ConfigurationBox -> clickSave -> nodeSettings', nodeSettings);
            // console.log('kyle_debug: ConfigurationBox -> clickSave -> opt', opt);
            // console.log('kyle_debug: ConfigurationBox -> clickSave -> nodeSettings[opt]', nodeSettings[opt]);
            // console.log('kyle_debug: ConfigurationBox -> clickSave -> oldNodeSettings[opt]', oldNodeSettings[opt]);
            if (opt !== 'maxNbr') {
                if (nodeSettings[opt] !== oldNodeSettings[opt]) {
                    if (typeof diffObj.nodeSettings === 'undefined') {
                        diffObj.nodeSettings = {};
                        diffObj.nodeSettings[nodeIp] = {};
                    }
                    diffObj.nodeSettings[nodeIp][opt] = nodeSettings[opt];
                    // cast back to integer since html input change the type to string
                    if (
                        opt === 'endtSendInterval' ||
                        opt === 'endtRecvTimeout' ||
                        opt === 'endtPriority' ||
                        opt === 'acsInterval'
                    ) {
                        diffObj.nodeSettings[nodeIp][opt] = parseInt(nodeSettings[opt]);
                    }
                }
            }
        });

        Object.keys(radioSettings).forEach((radioName) => {
            Object.keys(radioSettings[radioName]).forEach((opt) => {
                if (radioSettings[radioName][opt] !== oldRadioSettings[radioName][opt]) {
                    if (typeof diffObj.radioSettings === 'undefined') {
                        diffObj.radioSettings = {};
                        diffObj.radioSettings[nodeIp] = {};
                    }
                    if (typeof diffObj.radioSettings[nodeIp][radioName] === 'undefined') {
                        diffObj.radioSettings[nodeIp][radioName] = {};
                    }
                    if (!((radioSettings[radioName].band === '4.9' && opt === 'channel') ||
                    (radioSettings[radioName].band === '5' && opt === 'centralFreq'))) {
                        diffObj.radioSettings[nodeIp][radioName][opt] = radioSettings[radioName][opt];
                    }
                }
            });
        });

        Object.keys(ethernetSettings).forEach((ethName) => {
            Object.keys(ethernetSettings[ethName]).forEach((opt) => {
                if (ethernetSettings[ethName][opt] !== oldEthSettings[ethName][opt]) {
                    if (typeof diffObj.ethernetSettings === 'undefined') {
                        diffObj.ethernetSettings = {};
                        diffObj.ethernetSettings[nodeIp] = {};
                    }
                    if (typeof diffObj.ethernetSettings[nodeIp][ethName] === 'undefined') {
                        diffObj.ethernetSettings[nodeIp][ethName] = {};
                    }
                    diffObj.ethernetSettings[nodeIp][ethName][opt] = ethernetSettings[ethName][opt];
                }
            });
        });

        // check Node Max Nbr and Parse Diff
        // if (nodeSettings.maxNbr !== oldNodeSettings.maxNbr) {
        //     if (nodeSettings.maxNbr === 'disable' || oldNodeSettings.maxNbr === 'disable') {
        //         if (typeof diffObj.radioSettings === 'undefined') {
        //             diffObj.radioSettings = {};
        //             diffObj.radioSettings[nodeIp] = {};
        //         }
        //         if (oldNodeSettings.maxNbr === 'disable') {
        //             // from disable to enable
        //             diffObj.profileSettings = {
        //                 [nodeIp]: {
        //                     nbr: {
        //                         '1': {
        //                             maxNbr: nodeSettings.maxNbr,
        //                         }
        //                     }
        //                 }
        //             };
        //         }
        //         Object.keys(radioSettings).forEach((radioName) => {
        //             if (typeof diffObj.radioSettings[nodeIp][radioName] === 'undefined') {
        //                 diffObj.radioSettings[nodeIp][radioName] = {};
        //             }
        //             if (nodeSettings.maxNbr === 'disable') {
        //                 // disable Node Max Nbr
        //                 diffObj.radioSettings[nodeIp][radioName].profileId = {
        //                     nbr: '0'
        //                 };
        //             }
        //             if (oldNodeSettings.maxNbr === 'disable') {
        //                 // from disable to enable
        //                 diffObj.radioSettings[nodeIp][radioName].profileId = {
        //                     nbr: '1'
        //                 };
        //             }
        //         });
        //     } else {
        //         // change Node Max Nbr
        //         diffObj.profileSettings = {
        //             [nodeIp]: {
        //                 nbr: {
        //                     '1': {
        //                         maxNbr: nodeSettings.maxNbr,
        //                     }
        //                 }
        //             }
        //         };
        //     }
        // }
        // change Node Max Nbr
        if (nodeSettings.maxNbr !== oldNodeSettings.maxNbr) {
            diffObj.profileSettings = {
                [nodeIp]: {
                    nbr: {
                        '1': {
                            maxNbr: nodeSettings.maxNbr,
                        }
                    }
                }
            };
        }
        // console.log('kyle_debug: ConfigurationBox -> clickSave -> diffObj', diffObj);


        // Check same radio channel config
        let isSameRadioChannel = false;
        const networkConfigTabNo = Object.keys(radioSettings).length;
        if (networkConfigTabNo === 2
            && radioSettings.radio0.status !== 'disable'
            && radioSettings.radio1.status !== 'disable'
            && radioSettings.radio0.channel === radioSettings.radio1.channel) {
            isSameRadioChannel = true;
        } else if (networkConfigTabNo === 3 && (
            (radioSettings.radio0.status !== 'disable'
            && radioSettings.radio1.status !== 'disable'
            && radioSettings.radio0.channel === radioSettings.radio1.channel) ||
            (radioSettings.radio0.status !== 'disable'
            && radioSettings.radio2.status !== 'disable'
            && radioSettings.radio0.channel === radioSettings.radio2.channel) ||
            (radioSettings.radio1.status !== 'disable'
            && radioSettings.radio2.status !== 'disable'
            && radioSettings.radio1.channel === radioSettings.radio2.channel)
        )) {
            isSameRadioChannel = true;
        }

        // Check rssi warning
        let hasRssiWarning = false;
        Object.keys(radioSettings).forEach((radioName) => {
            const radioSettingObj = this.state.formData.radioSettings[radioName];
            if ((radioSettingObj.rssiFilterUpper !== 255 && radioSettingObj.rssiFilterLower !== 255) &&
                (radioSettingObj.rssiFilterUpper - radioSettingObj.rssiFilterLower) < 15) {
                hasRssiWarning = true;
            }
        });

        if (isSameRadioChannel) {
            this.popUpDialog(
                this.t('sameRadioWarningTitle'),
                this.t('sameRadioWarningContent')
            );
        } else if (Object.keys(diffObj).length === 0) {
            this.popUpDialog(
                this.t('noChangesWarningTitle'),
                this.t('noChangesWarningContent')
            );
        } else if (hasRssiWarning) {
            this.openRssiWarningDialog({checksums: this.checksums, diff: diffObj});
        } else {
            // Generate the saveobj with checksums and diff object
            const saveObj = {
                checksums: this.checksums,
                diff: diffObj,
            };

            // Pop up config confirm box with config alert message
            this.popUpDialog(
                this.t('saveConfigConfirmTitle'),
                (
                    <span style={{display: 'flex', flexDirection: 'column'}}>
                        {/* <span
                            dangerouslySetInnerHTML={{
                                __html: this.t('saveConfigConfirmContent')
                            }}
                        /> */}
                        <span>
                            <Trans
                                defaults={this.t('saveConfigConfirmContent')}
                                components={{ bold: <strong /> }}
                            />
                        </span>
                        {this.state.warnStatus.nodeSettings.maxNbr &&
                        <span style={{marginTop: '10px'}}>
                            <Trans
                                defaults={this.t('nodeSettingsMaxNbrWarningMsg')}
                                components={{ bold: <strong /> }}
                            />
                        </span>}
                    </span>
                ),
                this.t('saveConfigConfirmSubmit'),
                () => {
                    this.setState({
                        ...this.state,
                        isLock: true,
                        dialog: {
                            ...this.state.dialog,
                            open: false,
                        },
                    }, () => {
                        this.setNodeConfig(saveObj);
                    });
                },
                this.t('cancelBtnTitle')
            );
        }
    }

    handleDialogOnClose(cb) {
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

    enterToSubmit(event) {
        if (event.key === 'Enter') {
            this.clickSave();
        }
    }

    // run each time when configuration is updated
    validateForm() {
        const {configOptionType, formData, hostnameModified} = this.state;
        const {ipv4} = this.props.nodes[0];
        const {ethernetSettings, nodeSettings, radioSettings} = formData;
        const formStatus = {
            nodeSettings: {},
            radioSettings: {},
            ethernetSettings: {},
        };
        const errorStatus = {
            nodeSettings: {},
            radioSettings: {},
            ethernetSettings: {},
        };
        const statusText = {
            nodeSettings: {},
            radioSettings: {},
            ethernetSettings: {},
        };
        const warnStatus = {
            nodeSettings: {}
        };
        let invalidCountry = false;

        Constant.modelOption[this.modelName].nodeSettings.forEach((option) => {
            const inputValue = nodeSettings[option];
            const inputHelperText = this.t('inputObj', {returnObjects: true}).nodeSettings[option].helperText;
            let optionType = "";
            let optionData = [];
            let max = 0;
            let min = 0;
            
            if (option === "maxNbr") {
                optionType = configOptionType.profileSettings[ipv4].nbr[1][option].type;
                optionData = configOptionType.profileSettings[ipv4].nbr[1][option].data;
            } else if (
                option === 'endtSendInterval' ||
                option === 'endtRecvTimeout' ||
                option === 'endtPriority'
            ) {
                optionType = configOptionType.nodeSettings[ipv4][option].type;
                optionData = configOptionType.nodeSettings[ipv4][option].data;
                max = configOptionType.nodeSettings[ipv4][option].data.max;
                min = configOptionType.nodeSettings[ipv4][option].data.min;
            } else {
                optionType = configOptionType.nodeSettings[ipv4][option].type;
                optionData = configOptionType.nodeSettings[ipv4][option].data;
            }
            
            let isValidObj;
            let isNodeMaxNbrValid;
            
            if (optionData === 'country') {
                invalidCountry = true;
            }
            
            if (option === 'hostname') {
                isValidObj = hostnameModified ? validateHostname(
                    this.t,
                    inputValue,
                    inputHelperText,
                    optionType,
                    optionData
                ) :
                {result: true, text: ''};
            }
            
            if (option === 'maxNbr') {
                isValidObj = validateEnumOption(
                    this.t,
                    inputValue,
                    inputHelperText,
                    optionType,
                    optionData,
                    option
                );
                if (inputValue === 'disable') {
                    isNodeMaxNbrValid = true
                } else {
                    const sumOfRadioMaxNbr = Object.keys(radioSettings)
                    .reduce((acc, radioName) => {
                        const maxNbr = radioSettings?.[radioName]?.status === 'disable' ? 0 : parseInt(radioSettings?.[radioName]?.maxNbr ?? 0, 10);
                        return acc + maxNbr;
                    }, 0);
                    isNodeMaxNbrValid = inputValue >= sumOfRadioMaxNbr;
                }
            }
            
            if (option === 'endtSendInterval' || option === 'endtRecvTimeout' || option === 'endtPriority') {
                isValidObj = validateInt(
                    this.t,
                    inputValue,
                    inputHelperText,
                    optionType,
                    min,
                    max
                );
                if (option === 'endtSendInterval') {
                    const {endtRecvTimeout} = nodeSettings;
                    if (parseInt(endtRecvTimeout) < (parseInt(inputValue) * 2)) {
                        isValidObj.result = false;
                        isValidObj.text = 'Ethernet Neighbor Discovery Timeout should be greater than or equal to two times of its interval';
                    }
                }
                if (option === 'endtRecvTimeout') {
                    const {endtSendInterval} = nodeSettings;
                    if (parseInt(inputValue) < (parseInt(endtSendInterval) * 2)) {
                        isValidObj.result = false;
                        isValidObj.text = 'Ethernet Neighbor Discovery Timeout should be greater than or equal to two times of its interval';
                    }
                }
            }

            if (option === 'acsChannelList') {
                // always true for enum checking (special case)
                isValidObj = validateMultipleSelectionEnum(
                    this.t,
                    inputValue,
                    inputHelperText,
                    optionType,
                    optionData,
                    option
                )
            }

            // console.log(option);
            if (!isValidObj) {
                return;
            }
            
            formStatus.nodeSettings[option] = isValidObj.result;
            errorStatus.nodeSettings[option] = !isValidObj.result;
            statusText.nodeSettings[option] = isValidObj.text;
            
            // further check option specific limitation
            if (option === 'maxNbr') {
                warnStatus.nodeSettings[option]= !isNodeMaxNbrValid;
            }
            
            if (option === 'endtSendInterval' ||
                option === 'endtRecvTimeout' ||
                option === 'endtPriority'
            ) {
                warnStatus.nodeSettings['endt']= !isValidObj.result;
            }
        });

        Object.keys(radioSettings).forEach((radioName) => {
            const radioObj = radioSettings[radioName];
            formStatus.radioSettings[radioName] = {};
            errorStatus.radioSettings[radioName] = {};
            statusText.radioSettings[radioName] = {};
            // console.log('-----errorStatus-----');
            Object.keys(radioObj).forEach((option) => {
                // console.log('kyle_debug ~ file: ConfigurationBox.jsx ~ line 1706 ~ NodeConfigurationBox ~ Object.keys ~ option', option)
                if (option !== 'profileId') {
                    const inputValue = radioObj[option];
                    const inputHelperText = this.t('inputObj', {returnObjects: true}).radioSettings[option].helperText;
                    let isValidValue;
                    const optionType = configOptionType.radioSettings[ipv4][radioName][option].type;
                    const optionData = configOptionType.radioSettings[ipv4][radioName][option].data;

                    if (optionData === 'country') {
                        invalidCountry = true;
                    }
                    if (!(
                            (option === 'channel' && radioObj.band === '4.9') ||
                            (option === 'centralFreq' && radioObj.band === '5')
                        )
                    ) {
                        if (option === 'distance') {
                            isValidValue = validateDistance(
                                this.t,
                                inputValue,
                                inputHelperText,
                                optionType,
                                optionData
                            );
                        } else if (option === 'rssiFilterTolerance') {
                            isValidValue = validateRssiFilterTolerance(inputValue, 0, 30);
                        } else if (option === 'rssiFilterLower' || option === 'rssiFilterUpper') {
                            isValidValue = validateRssiFilterRange(radioObj.rssiFilterLower, radioObj.rssiFilterUpper,
                                -95, 0);
                        } else if (option === 'mobilityDomain') {
                            isValidValue = validateMobilityDomain(
                                this.t,
                                inputValue,
                                inputHelperText,
                                optionType,
                                optionData
                            );
                        } else if (option === 'atpcTargetRssi' || option === 'atpcRangeUpper' || option === 'atpcRangeLower') {
                            // skip if not support atpc
                            if (this.isFwSupportAtpc) {
                                isValidValue = validateAtpcRange(radioObj.atpcTargetRssi, radioObj.atpcRangeUpper, radioObj.atpcRangeLower);
                            } else {
                                return;
                            }
                        } else {
                            isValidValue = validateEnumOption(
                                this.t,
                                inputValue,
                                inputHelperText,
                                optionType,
                                optionData,
                                option
                            );
                        }
                        formStatus.radioSettings[radioName][option] = isValidValue.result;
                        errorStatus.radioSettings[radioName][option] = !isValidValue.result;
                        statusText.radioSettings[radioName][option] = isValidValue.text;
                    } else {
                        formStatus.radioSettings[radioName][option] = true;
                        errorStatus.radioSettings[radioName][option] = false;
                        statusText.radioSettings[radioName][option] = '';
                    }
                }
            });
        });

        Object.keys(ethernetSettings).forEach((ethName) => {
            const ethObj = ethernetSettings[ethName];
            formStatus.ethernetSettings[ethName] = {};
            errorStatus.ethernetSettings[ethName] = {};
            statusText.ethernetSettings[ethName] = {};
            Object.keys(ethObj).forEach((option) => {
                let isValidObj;
                const inputValue = ethObj[option];
                const inputHelperText = this.t('inputObj', {returnObjects: true}).ethernetSettings[option].helperText;
                const optionType = configOptionType.ethernetSettings[ipv4][ethName][option].type;
                const optionData = configOptionType.ethernetSettings[ipv4][ethName][option].data;
                if (option === 'ethernetLink') {
                    isValidObj = validateEnumOption(
                        this.t,
                        inputValue,
                        inputHelperText,
                        optionType,
                        optionData,
                        option
                    );
                }
                if (option === 'mtu') {
                    isValidObj = validateInt(
                        this.t,
                        inputValue,
                        inputHelperText,
                        optionType,
                        optionData.min,
                        optionData.max
                    );
                }
                formStatus.ethernetSettings[ethName][option] = isValidObj.result;
                errorStatus.ethernetSettings[ethName][option] = !isValidObj.result;
                statusText.ethernetSettings[ethName][option] = isValidObj.text;
            });
        });

        if (invalidCountry) {
            this.invalidCountryValue();
        } else {
            this.setState((prevState) => {
                return {
                    ...prevState,
                    formStatus,
                    errorStatus,
                    statusText,
                    warnStatus,
                }
            });
        }
    }

    invalidCountryValue() {
        this.popUpDialog(
            this.t('retrieveTypeFail'),
            this.t('retrieveTypeFailContent'),
            this.t('retrieveTypeFailAction'),
            () => {
                // const currentOrigin = window.location.origin;
                // window.location.replace(`${currentOrigin}/mesh/config/?l=${this.props.lang}`);
                this.props.history.replace('/config');
                // window.location.assign(`${window.location.origin}/index.html/mesh/config`);
            }
        );
    }

    updateNodeConfigToStore(open) {
        console.log(this.state.formData)
        const config = {
            [this.props.nodes[0].ipv4]: {
                config: {
                    ...this.state.formData,
                    meshSettings: this.state.meshSettings,
                },
                filteredConfig: this.state.configOptionType,
                open,
            },
        };
        this.props.setTempNodeConfig(config);
    }

    render() {
        const {classes, nodes} = this.props;
        const {
            theme, modelOption, inputObj, advancedConfigOption, advancedConfigInputObj,
        } = Constant;
        const {
            model, formData, errorStatus, warnStatus, statusText, formStatus, configOptionType, disableRadioFilter, hostnameModified,
        } = this.state;
        const {
            hostname, maxNbr,
        } = formStatus.nodeSettings;

        const {
            rssiWarningDialogOpen, agreeWarning,
        } = this.state.advancedConfig;

        let submitDisabled = !(hostname && maxNbr);

        Object.keys(formStatus.nodeSettings).forEach((opt) => {
            submitDisabled = submitDisabled || !formStatus.nodeSettings[opt];
        });

        Object.keys(formStatus.radioSettings).forEach((radio) => {
            Object.keys(formStatus.radioSettings[radio]).forEach((opt) => {
                submitDisabled = submitDisabled || !formStatus.radioSettings[radio][opt];
            });
        });

        Object.keys(formStatus.ethernetSettings).forEach((eth) => {
            Object.keys(formStatus.ethernetSettings[eth]).forEach((opt) => {
                submitDisabled = submitDisabled || !formStatus.ethernetSettings[eth][opt];
            });
        });

        let isEnterToSubmit = function () { return false; };

        if (!submitDisabled) {
            isEnterToSubmit = this.enterToSubmit;
        }

        const SaveConfigDialog = (
            <P2Dialog
                open={this.state.dialog.open}
                handleClose={this.handleDialogOnClose}
                title={this.state.dialog.title}
                content={this.state.dialog.content}
                actionTitle={this.state.dialog.submitButton}
                actionFn={this.state.dialog.submitAction}
                cancelActTitle={this.state.dialog.cancelButton}
                cancelActFn={this.state.dialog.cancelAction}
            />
        );

        const radioTabContent = [];

        Object.keys(modelOption[model].radioSettings)
        .forEach((radioName, radioIndex) => {
            const formFiedContent = [];
            modelOption[model].radioSettings[radioName].forEach((opt, optIndex) => {
                if (
                    opt === 'rssiFilterLower' || opt === 'rssiFilterUpper'||
                    opt === 'atpcTargetRssi' || opt === 'atpcRangeUpper' ||
                    opt === 'atpcRangeLower'
                ) {
                    return;
                }
                if (opt !== 'mobilityDomain') {
                    const titleKey = `optionObj.radioSettings.${opt}.title`;
                    const tooltipKey = `optionObj.radioSettings.${opt}.tooltip`;
                    const inputProps = {};
                    if (opt === 'channelBandwidth' || opt === 'radioFilter') {
                        inputProps.showHelpTooltip = true;
                        inputProps.helpTooltip = (
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                            >
                                <span>{this.t(titleKey)}</span>
                                <P2Tooltip
                                    direction="right"
                                    title={<div style={{
                                        fontSize: '12px',
                                        padding: '2px',
                                    }}
                                    >
                                        {this.t(tooltipKey)}
                                    </div>}
                                    content={(<i
                                        className="material-icons"
                                        style={{
                                            color: themeObj.primary.light,
                                            fontSize: '20px',
                                            marginLeft: '5px',
                                            marginTop: '-1px',
                                        }}
                                    >help</i>)}
                                    key={radioName}
                                />
                            </span>
                        );
                    }
                    switch (inputObj.radioSettings[opt].formType) {
                        case 'select':
                            formFiedContent[optIndex] = (
                                formData.radioSettings[radioName].band === '4.9' && opt === 'channel'
                            ) || (formData.radioSettings[radioName].band === '5' && opt === 'centralFreq') ?
                                (<span key={opt} />)
                                : (
                                    <FormSelectCreator
                                        key={opt}
                                        errorStatus={errorStatus.radioSettings[radioName][opt]}
                                        radio={radioName}
                                        margin="normal"
                                        inputLabel={this.t(`optionObj.radioSettings.${opt}.title`)}
                                        inputID={opt}
                                        inputValue={formData.radioSettings[radioName][opt]}
                                        onChangeField={(e) => {
                                            this.handleChange(e, radioName);
                                        }}
                                        menuItemObj={
                                            typeof configOptionType === 'undefined' ||
                                            configOptionType.radioSettings[nodes[0].ipv4][radioName][opt].type !== 'enum' ?
                                                [{
                                                    actualValue: formData.radioSettings[radioName][opt],
                                                    displayValue: formData.radioSettings[radioName][opt],
                                                }] :
                                                configOptionType.radioSettings[nodes[0].ipv4][radioName][opt].data
                                        }
                                        helperText={statusText.radioSettings[radioName][opt]}
                                        {...inputProps}
                                        disabled={opt === 'radioFilter' && disableRadioFilter[radioName]}
                                    />
                                );
                            break;
                        // case 'input':
                        //     formFiedContent[optIndex] = (
                        //         <FormInputCreator
                        //             key={opt}
                        //             errorStatus={errorStatus.radioSettings[radioName][opt]}
                        //             inputLabel={this.t(`optionObj.radioSettings.${opt}.title`)}
                        //             inputID={opt}
                        //             inputValue={formData.radioSettings[radioName][opt]}
                        //             onChangeField={e => this.handleChange(e, radioName)}
                        //             autoFocus={false}
                        //             margin="normal"
                        //             placeholder={this.t(`optionObj.radioSettings.${opt}.placeholder`)}
                        //             onKeyPressField={isEnterToSubmit}
                        //             helperText={statusText.radioSettings[radioName][opt]}
                        //             inputType="text"
                        //             {...inputProps}
                        //         />
                        //     );
                        //     break;
                        // case 'checkbox':
                        //     formFiedContent[optIndex] = (
                        //         <span
                        //             key={opt}
                        //             style={{
                        //                 display: 'flex',
                        //                 alignItems: 'center',
                        //                 margin: '5px 0px',
                        //             }}
                        //         >
                        //             <Typography>
                        //                 {this.t(`optionObj.radioSettings.${opt}.title`)}
                        //             </Typography>
                        //             <span style={{marginLeft: 'auto'}}>
                        //                 <Checkbox
                        //                     checked={formData.radioSettings[radioName][opt]}
                        //                     onChange={() => this.handleCheck(radioName)}
                        //                     value="checkedB"
                        //                     color="primary"
                        //                     style={{
                        //                         marginRight: '-12px',
                        //                     }}
                        //                 />
                        //             </span>
                        //         </span>
                        //     );
                        //     break;
                        default:
                            break;
                    }
                }
            });

            const advancedConfigForm = [];
            advancedConfigOption[radioName].forEach((opt, optIndex) => {
                const advancedRadioSettings = formData.radioSettings[radioName];
                const {
                    rssiFilterLower, rssiFilterUpper, rssiFilterTolerance,
                    atpcTargetRssi, atpcRangeUpper, atpcRangeLower
                } = advancedRadioSettings;
                const advancedMenuItemObj = {};
                const advancedTooltip = {};
                if (advancedConfigInputObj[opt].formType === 'select') {
                    advancedMenuItemObj[opt] = [];
                    advancedTooltip[opt] = <span />;
                }
                let range = [];
                let [min, max] = [];
                let enable = true;
                let validRange = true;
                const inputProps = {};
                if (opt === 'atpcTargetRssi') {
                    [min, max] = [-95, 0];
                    range = [Number(atpcRangeLower), Number(atpcTargetRssi), Number(atpcRangeUpper)];
                    validRange = validateAtpcRange(atpcTargetRssi, atpcRangeUpper, atpcRangeLower).result;
                } else if (opt === 'rssiFilterUpper') {
                    if (rssiFilterLower === 255 && rssiFilterUpper === 255) {
                        range = [-95, 0];
                        if (this.state.configOptionType) {
                            const filteredConfigOptions =
                                this.state.configOptionType.radioSettings[this.props.nodes[0].ipv4][radioName];

                                // check whether the node supports rssi filter range
                            if (filteredConfigOptions.rssiFilterLower.type === 'enum' &&
                                filteredConfigOptions.rssiFilterUpper.type === 'enum') {
                                enable = false;
                            }
                        }
                    } else if (rssiFilterLower !== 255 && rssiFilterUpper === 255) {
                        range = [Number(rssiFilterLower), 0];
                    } else if (rssiFilterLower === 255 && rssiFilterUpper !== 255) {
                        range = [-95, Number(rssiFilterUpper)];
                    } else {
                        range = [Number(rssiFilterLower), Number(rssiFilterUpper)];
                    }
                    [min, max] = [-95, 0];
                    validRange = validateRssiFilterRange(rssiFilterLower, rssiFilterUpper, -95, 0).result;
                } else if (opt === 'rssiFilterTolerance') {
                    if (this.state.configOptionType) {
                        const filteredConfigOptions =
                            this.state.configOptionType.radioSettings[this.props.nodes[0].ipv4][radioName];

                        // check whether the node supports rssi filter tolerance
                        if (filteredConfigOptions.rssiFilterLower.type === 'enum' &&
                            filteredConfigOptions.rssiFilterUpper.type === 'enum') {
                            advancedMenuItemObj[opt].push({
                                actualValue: rssiFilterTolerance, displayValue: `${rssiFilterTolerance} dBm`,
                            });
                        } else {
                            for (let tolerance = 0; tolerance <= 30; tolerance += 1) {
                                advancedMenuItemObj[opt].push({
                                    actualValue: tolerance, displayValue: `${tolerance} dBm`,
                                });
                            }
                        }
                        advancedTooltip[opt] = (
                            <div className={classes.tooltipStyle}>
                                <div>
                                    {this.t(`optionObj.radioSettings.${opt}.tooltip0`)}
                                </div>
                                <br />
                                <div>
                                    <i>{this.t(`optionObj.radioSettings.${opt}.tooltip1`)}</i>
                                </div>
                            </div>
                        );
                    } else {
                        advancedMenuItemObj[opt].push({
                            actualValue: rssiFilterTolerance, displayValue: `${rssiFilterTolerance} dBm`,
                        });
                    }
                } else if (opt === 'maxNbr' || opt === 'radioFilter' || opt === 'mcs' || opt === 'shortgi' ||
                opt === 'rtsCts') {
                    advancedMenuItemObj[opt] = typeof configOptionType === 'undefined' ||
                        configOptionType.radioSettings[nodes[0].ipv4][radioName][opt].type
                            !== 'enum' ?
                        [{
                            actualValue: formData.radioSettings[radioName][opt],
                            displayValue: formData.radioSettings[radioName][opt],
                        }] :
                        configOptionType.radioSettings[nodes[0].ipv4][radioName][opt].data;
                    if (opt === 'maxNbr') {
                        advancedTooltip[opt] = (
                            <div className={classes.tooltipStyle}>
                                <div>
                                    {this.t(`optionObj.radioSettings.${opt}.tooltip0`)}
                                </div>
                            </div>
                        );
                    } else if (opt === 'radioFilter') {
                        advancedTooltip[opt] = (
                            <div style={{
                                fontSize: '12px',
                                padding: '2px',
                            }}
                            >
                                {this.t(`optionObj.radioSettings.${opt}.tooltip`)}
                            </div>
                        );
                    } else if (opt === 'mcs' || opt === 'shortgi') {
                        if (opt === 'mcs') {
                            const autoIndex = advancedMenuItemObj[opt]
                                .findIndex(menuItem => menuItem.actualValue === 'auto');
                            if (autoIndex !== -1) {
                                const splicedMenuItem = advancedMenuItemObj[opt].splice(autoIndex, 1);
                                advancedMenuItemObj[opt].unshift(splicedMenuItem[0]);
                            }
                        }
                        advancedTooltip[opt] = (
                            <div className={classes.tooltipStyle}>
                                <div>
                                    {this.t(`optionObj.radioSettings.${opt}.tooltip0`)}
                                </div>
                                <div style={{textAlign: 'left', paddingTop: '10px', fontStyle: 'italic'}}>
                                    {this.t(`optionObj.radioSettings.${opt}.tooltip1`)}
                                </div>
                            </div>
                        );
                    } else if (opt === 'rtsCts') {
                        advancedTooltip[opt] = (
                            <div className={classes.tooltipStyle}>
                                <div>
                                    {this.t(`optionObj.radioSettings.${opt}.tooltip0`)}
                                </div>
                                <div style={{fontWeight: 900, paddingTop: '10px'}}>
                                    {this.t(`optionObj.radioSettings.${opt}.tooltip1`)}
                                </div>
                                <div style={{textAlign: 'left', paddingTop: '10px', fontStyle: 'italic'}}>
                                    {this.t(`optionObj.radioSettings.${opt}.tooltip2`)}
                                </div>
                            </div>
                        );
                    }
                } else if (opt === 'distance') {
                    inputProps.enableButton = true;
                    inputProps.buttonLabel = this.t('distanceCheckboxLabel');
                    inputProps.compareValue = 'auto';
                    inputProps.showHelpTooltip = true;
                    inputProps.helpTooltip = (
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        >
                            <span>{this.t(`optionObj.radioSettings.${opt}.title`)}</span>
                            <P2Tooltip
                                direction="right"
                                title={<div style={{
                                    fontSize: '12px',
                                    padding: '2px',
                                }}
                                >
                                    {this.t(`optionObj.radioSettings.${opt}.tooltip`)}
                                </div>}
                                content={(<i
                                    className="material-icons"
                                    style={{
                                        color: themeObj.primary.light,
                                        fontSize: '20px',
                                        marginLeft: '5px',
                                        marginTop: '-1px',
                                    }}
                                >help</i>)}
                                key={radioName}
                            />
                        </span>
                    );
                }
                switch (advancedConfigInputObj[opt].formType) {
                    case 'input':
                        advancedConfigForm[optIndex] = (
                            <FormInputCreator
                                key={opt}
                                errorStatus={errorStatus.radioSettings[radioName][opt]}
                                inputLabel={this.t(`optionObj.radioSettings.${opt}.title`)}
                                inputID={opt}
                                inputValue={formData.radioSettings[radioName][opt]}
                                onChangeField={e => this.handleChange(e, radioName)}
                                autoFocus={false}
                                margin="normal"
                                placeholder={this.t(`optionObj.radioSettings.${opt}.placeholder`)}
                                onKeyPressField={isEnterToSubmit}
                                helperText={statusText.radioSettings[radioName][opt]}
                                inputType="text"
                                {...inputProps}
                            />
                        );
                        break;
                    case 'atpc-slider':
                        if (!this.isFwSupportAtpc) {
                            break;
                        }
                        advancedConfigForm[optIndex] = (
                            <FormControl
                                key={opt}
                                error={false}
                                fullWidth
                                margin="dense"
                            >
                                <div style={{display: 'flex'}}>
                                    <InputLabel shrink>
                                        <span
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <span>{this.t(`optionObj.radioSettings.${opt}.title`)}</span>
                                            <P2Tooltip
                                                direction="right"
                                                title={
                                                    <div className={classes.tooltipStyle}>
                                                        <div>
                                                            {this.t(`optionObj.radioSettings.${opt}.tooltip0`)}
                                                        </div>
                                                        <div style={{textAlign: 'left', paddingTop: '10px', fontStyle: 'italic'}}>
                                                            {this.t(`optionObj.radioSettings.${opt}.tooltip1`)}
                                                        </div>
                                                    </div>
                                                }
                                                content={(<i
                                                    className="material-icons"
                                                    style={{
                                                        color: themeObj.primary.light,
                                                        fontSize: '20px',
                                                        marginLeft: '5px',
                                                        marginTop: '-1px',
                                                    }}
                                                >help</i>)}
                                            />
                                        </span>
                                    </InputLabel>
                                </div>
                                <div
                                    style={{
                                        flex: 1,
                                        paddingTop: '50px',
                                    }}
                                >
                                    <AtpcRangeSlider
                                        t={this.t}
                                        value={range}
                                        min={min}
                                        max={max}
                                        handleSliderOnChange={(e) => {
                                            let newAtpcRangeLower = e[0];
                                            let newAtpcTargetRssi = e[1];
                                            let newAtpcRangeUpper = e[2];

                                            this.setState({
                                                ...this.state,
                                                formData: {
                                                    ...this.state.formData,
                                                    radioSettings: {
                                                        ...this.state.formData.radioSettings,
                                                        [radioName]: {
                                                            ...this.state.formData.radioSettings[radioName],
                                                            atpcRangeLower: newAtpcRangeLower,
                                                            atpcTargetRssi: newAtpcTargetRssi,
                                                            atpcRangeUpper: newAtpcRangeUpper
                                                        },
                                                    },

                                                },
                                            }, () => this.validateForm());
                                        }}
                                        enable={enable}
                                        thumbStyle={{
                                            height: 10,
                                            width: 5,
                                            color: colors.thumbColor,
                                            levelFontSize: 12,
                                        }}
                                        trackStyle={{
                                            height: 2,
                                            color: themeObj.primary.light,
                                            headColor: colors.unmanagedIcon,
                                            tailColor: colors.unmanagedIcon,
                                        }}
                                        labelStyle={{
                                            color: colors.labelColor,
                                            fontSize: 12,
                                        }}
                                        unit="dBm"
                                    />
                                </div>
                            </FormControl>
                        );
                        break;
                    case 'slider':
                        advancedConfigForm[optIndex] = (
                            opt === 'rssiFilterUpper' &&
                            typeof rssiFilterLower === 'number' && typeof rssiFilterUpper === 'number' ?
                                (<FormControl
                                    key={opt}
                                    error={false}
                                    fullWidth
                                    margin="dense"
                                >
                                    <div style={{display: 'flex'}}>
                                        <InputLabel shrink>
                                            <span style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                            }}
                                            >
                                                <span>{this.t(`optionObj.radioSettings.${opt}.title`)}</span>
                                                {validRange ?
                                                    (<P2Tooltip
                                                        direction="right"
                                                        title={
                                                            <div className={classes.tooltipStyle}>
                                                                <div>
                                                                    {this.t(`optionObj.radioSettings.${opt}.tooltip0`)}
                                                                </div>
                                                                <div style={{textAlign: 'left', paddingTop: '10px', fontStyle: 'italic'}}>
                                                                    {this.t(`optionObj.radioSettings.${opt}.tooltip1`)}
                                                                </div>
                                                            </div>
                                                        }
                                                        content={(<i
                                                            className="material-icons"
                                                            style={{
                                                                color: themeObj.primary.light,
                                                                fontSize: '20px',
                                                                marginLeft: '5px',
                                                                marginTop: '-1px',
                                                            }}
                                                        >help</i>)}
                                                    />)
                                                    :
                                                    (<P2Tooltip
                                                        direction="right"
                                                        title={
                                                            <div className={classes.tooltipStyle}>
                                                                {this.t('rssiFilterToleranceInvalidRange')}
                                                            </div>
                                                        }
                                                        content={
                                                            <i
                                                                className="material-icons"
                                                                style={{
                                                                    color: colors.mismatchLabel,
                                                                    fontSize: '20px',
                                                                    marginLeft: '5px',
                                                                    marginTop: '-1px',
                                                                }}
                                                            >error</i>
                                                        }
                                                    />)
                                                }
                                            </span>
                                        </InputLabel>
                                        <div
                                            style={{
                                                flex: 1,
                                                paddingTop: '50px',
                                            }}
                                        >
                                            <RangeSlider
                                                value={range}
                                                min={min}
                                                max={max}
                                                handleSliderOnChange={(e) => {
                                                    let newRssiFilterLower = e[0];
                                                    let newRssiFilterUpper = e[1];
                                                    if (e[0] === -95) {
                                                        newRssiFilterLower = 255;
                                                    }
                                                    if (e[1] === 0) {
                                                        newRssiFilterUpper = 255;
                                                    }
                                                    this.setState({
                                                        ...this.state,
                                                        formData: {
                                                            ...this.state.formData,
                                                            radioSettings: {
                                                                ...this.state.formData.radioSettings,
                                                                [radioName]: {
                                                                    ...this.state.formData.radioSettings[radioName],
                                                                    rssiFilterLower: newRssiFilterLower,
                                                                    rssiFilterUpper: newRssiFilterUpper,
                                                                },
                                                            },

                                                        },
                                                    }, () => this.validateForm());
                                                }}
                                                enable={enable}
                                                thumbStyle={{
                                                    height: 10,
                                                    width: 5,
                                                    color: colors.thumbColor,
                                                    levelFontSize: 12,
                                                }}
                                                trackStyle={{
                                                    height: 2,
                                                    color: themeObj.primary.light,
                                                    headColor: colors.unmanagedIcon,
                                                    tailColor: colors.unmanagedIcon,
                                                }}
                                                labelStyle={{
                                                    color: colors.labelColor,
                                                    fontSize: 12,
                                                }}
                                                unit="dBm"
                                            />
                                        </div>
                                    </div>
                                </FormControl>) :
                                <span key={opt} />
                        ); break;
                    case 'select':
                        advancedConfigForm[optIndex] = (
                            <FormSelectCreator
                                key={opt}
                                errorStatus={errorStatus.radioSettings[radioName][opt]}
                                radio={radioName}
                                margin="normal"
                                inputLabel={this.t(`optionObj.radioSettings.${opt}.title`)}
                                inputID={opt}
                                inputValue={formData.radioSettings[radioName][opt]}
                                onChangeField={(e) => {
                                    this.handleChange(e, radioName);
                                }}
                                menuItemObj={advancedMenuItemObj[opt]}
                                helperText={statusText.radioSettings[radioName][opt]}
                                helpTooltip={(
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                    >
                                        <span>{this.t(`optionObj.radioSettings.${opt}.title`)}</span>
                                        <P2Tooltip
                                            direction="right"
                                            title={advancedTooltip[opt]}
                                            content={(<i
                                                className="material-icons"
                                                style={{
                                                    color: themeObj.primary.light,
                                                    fontSize: '20px',
                                                    marginLeft: '5px',
                                                    marginTop: '-1px',
                                                }}
                                            >help</i>)}
                                        />
                                    </span>
                                )}
                                showHelpTooltip
                                disabled={opt === 'radioFilter' && disableRadioFilter[radioName]}
                            />
                        ); break;
                    default:
                }
            });

            // const expansionPanelTheme = createMuiTheme({
            //     overrides: {
            //         MuiExpansionPanel: {
            //             root: {
            //                 '&:before': {
            //                     backgroundColor: 'white',
            //                 },
            //             },
            //         },
            //     },
            // });

            const advancedConfigSection = (
                // <MuiThemeProvider theme={expansionPanelTheme}>
                <Accordion
                    classes={{
                        root: classes.hideBorder,
                    }}
                    style={{width: '100%', boxShadow: 'none'}}
                >
                    <AccordionSummary
                        expandIcon={<i style={{color: '#122D54'}} className="material-icons">expand_more</i>}
                        style={{
                            maxHeight: '40px',
                            minHeight: '40px',
                            padding: '0px',
                        }}
                    >
                        <Typography variant="body2" style={{fontSize: '16px', color: '#122D54'}}>
                            {this.t('advancedConfiguration')}
                        </Typography>
                    </AccordionSummary>
                    <AccordionDetails
                        style={{padding: '20px 0 0 0', display: 'block'}}
                    >
                        {advancedConfigForm}
                        <MuiThemeProvider theme={theme}>
                            <P2Dialog
                                open={rssiWarningDialogOpen}
                                title={(
                                    <div>
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
                                            {this.t('rssiWarningDialogTitle')}
                                        </div>
                                    </div>
                                )}
                                content={
                                    <React.Fragment>
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: this.t('rssiWarningDialogContent1')
                                            }}
                                        />
                                        <div
                                            dangerouslySetInnerHTML={{
                                                __html: this.t('rssiWarningDialogContent2')
                                            }}
                                        />
                                    </React.Fragment>
                                }
                                nonTextContent={(
                                    <FormControlLabel
                                        control={
                                            <React.Fragment>
                                                <MuiThemeProvider theme={checkboxStyle}>
                                                    <Checkbox
                                                        checked={agreeWarning}
                                                        onChange={() => {
                                                            this.setState({
                                                                ...this.state,
                                                                advancedConfig: {
                                                                    ...this.state.advancedConfig,
                                                                    agreeWarning: !agreeWarning,
                                                                },
                                                            });
                                                        }}
                                                        color="secondary"
                                                        value="checkedA"
                                                    />
                                                </MuiThemeProvider>
                                            </React.Fragment>
                                        }
                                        label={
                                            <Typography style={{color: '#DC4639'}}>
                                                {this.t('rssiWarningDialogCheckboxLabel')}
                                            </Typography>
                                        }
                                    />
                                )}
                                cancelActFn={() => {
                                    this.setState({
                                        ...this.state,
                                        advancedConfig: {
                                            ...this.state.advancedConfig,
                                            rssiWarningDialogOpen: false,
                                            agreeWarning: false,
                                        },
                                    });
                                }}
                                cancelActTitle={this.t('rssiWarningDialogCancel')}
                                actionFn={() => this.handleRssiWarningConfirm()}
                                actionTitle={this.t('rssiWarningDialogConfirm')}
                                diableActionFn={!agreeWarning}
                                handleClose={() => {
                                    this.setState({
                                        ...this.state,
                                        advancedConfig: {
                                            ...this.state.advancedConfig,
                                            rssiWarningDialogOpen: false,
                                        },
                                    });
                                }}
                            />
                        </MuiThemeProvider>
                    </AccordionDetails>
                </Accordion>
                // </MuiThemeProvider>
            );

            radioTabContent[radioIndex] = (
                <div
                    component="div"
                    dir="x"
                    style={{padding: '0 24px 0 24px', overflow: 'hidden'}}
                    key={radioName}
                >
                    {formFiedContent}
                    {advancedConfigSection}
                </div>
            );
        });

        if (!this.props.disableEthernetConfig) {
            Object.keys(modelOption[model].ethernetSettings)
            .forEach((ethName) => {
                const ethIndex = radioTabContent.length;
                const formFiedContent = [];
                let disabledMTU = true;
                modelOption[model].ethernetSettings[ethName].forEach((opt, optIndex) => {
                    if (opt === 'mtu' && get(configOptionType, ['ethernetSettings', nodes[0].ipv4, ethName, opt])) {
                        const mtuConfigOption = configOptionType.ethernetSettings[nodes[0].ipv4][ethName][opt];
                        if (mtuConfigOption.type === 'int') {
                            disabledMTU = mtuConfigOption.data.min === mtuConfigOption.data.max;
                        }
                    }
                    switch (inputObj.ethernetSettings[opt].formType) {
                        case 'select':
                            formFiedContent[optIndex] = (
                                <FormSelectCreator
                                    key={opt}
                                    errorStatus={errorStatus.ethernetSettings[ethName][opt]}
                                    radio={ethName}
                                    margin="normal"
                                    inputLabel={this.t(`optionObj.ethernetSettings.${opt}.title`)}
                                    inputID={opt}
                                    inputValue={formData.ethernetSettings[ethName][opt]}
                                    onChangeField={(e) => {
                                        this.handleChange(e, ethName);
                                    }}
                                    menuItemObj={
                                        typeof configOptionType === 'undefined' ||
                                            configOptionType.ethernetSettings[nodes[0].ipv4][ethName][opt].type
                                            !== 'enum' ?
                                            [{
                                                displayValue: formData.ethernetSettings[ethName][opt],
                                                actualValue: formData.ethernetSettings[ethName][opt],
                                            }] :
                                            configOptionType.ethernetSettings[nodes[0].ipv4][ethName][opt].data
                                    }
                                    helperText={statusText.ethernetSettings[ethName][opt]}
                                    helpTooltip={(
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                        >
                                            <span>{this.t(`optionObj.ethernetSettings.${opt}.title`)}</span>
                                            <P2Tooltip
                                                direction="right"
                                                title={
                                                    <div style={{fontWeight: '400'}} className={classes.tooltipStyle}>
                                                        <div>
                                                            {this.t(`optionObj.ethernetSettings.${opt}.tooltip0`)}
                                                        </div>
                                                        <br />
                                                        <div>
                                                            <b>
                                                                {this.t(`optionObj.ethernetSettings.${opt}.tooltip1`)}
                                                            </b>
                                                        </div>
                                                        <br />
                                                        <div>
                                                            <i>
                                                                {this.t(`optionObj.ethernetSettings.${opt}.tooltip2`)}
                                                            </i>
                                                        </div>
                                                    </div>
                                                }
                                                content={(<i
                                                    className="material-icons"
                                                    style={{
                                                        color: themeObj.primary.light,
                                                        fontSize: '20px',
                                                        marginLeft: '5px',
                                                        marginTop: '-1px',
                                                    }}
                                                >help</i>)}
                                            />
                                        </span>
                                    )}
                                    showHelpTooltip
                                />
                            ); break;
                        case 'input':
                            formFiedContent[optIndex] = (
                                <FormInputCreator
                                    key={opt}
                                    errorStatus={errorStatus.ethernetSettings[ethName][opt]}
                                    inputLabel={this.t(`optionObj.ethernetSettings.${opt}.title`)}
                                    inputID={opt}
                                    inputValue={formData.ethernetSettings[ethName][opt]}
                                    onChangeField={e => this.handleChange(e, ethName)}
                                    autoFocus={false}
                                    margin="normal"
                                    placeholder={this.t(`optionObj.ethernetSettings.${opt}.placeholder`)}
                                    onKeyPressField={isEnterToSubmit}
                                    helperText={statusText.ethernetSettings[ethName][opt]}
                                    inputType="text"
                                    disabled={opt === 'mtu' && disabledMTU}
                                    helpTooltip={(
                                        <span style={{
                                            display: 'flex',
                                            alignItems: 'center',
                                        }}
                                        >
                                            <span>{this.t(`optionObj.ethernetSettings.${opt}.title`)}</span>
                                            <P2Tooltip
                                                direction="right"
                                                title={
                                                    <div style={{fontWeight: '400'}} className={classes.tooltipStyle}>
                                                        <div>
                                                            {this.t(`optionObj.ethernetSettings.${opt}.tooltip0`)}
                                                        </div>
                                                        <div style={{paddingTop: '10px', fontStyle: 'italic'}}>
                                                            {this.t(`optionObj.ethernetSettings.${opt}.tooltip1`)}
                                                        </div>
                                                    </div>
                                                }
                                                content={(<i
                                                    className="material-icons"
                                                    style={{
                                                        color: themeObj.primary.light,
                                                        fontSize: '20px',
                                                        marginLeft: '5px',
                                                        marginTop: '-1px',
                                                    }}
                                                >help</i>)}
                                            />
                                        </span>
                                    )}
                                    showHelpTooltip
                                />
                            );
                            break;
                        default:
                    }
                });
                radioTabContent[ethIndex] = (
                    <div
                        component="div"
                        dir="x"
                        style={{padding: '0px 24px 0px 24px'}}
                        key={ethName}
                    >
                        {formFiedContent}
                    </div>
                );
            });
        }

        const radioTabHeader = [];
        const radioTabHeaderStatus = [];
        const radioErrorStatusObj = errorStatus.radioSettings;
        const radioStatus = {};

        Object.keys(radioErrorStatusObj).forEach((radioName, radioIndex) => {
            const radioFieldStatus = radioErrorStatusObj[radioName];
            radioStatus[radioIndex] = true;
            Object.keys(radioFieldStatus).forEach((field) => {
                const fieldStatus = radioErrorStatusObj[radioName][field];
                if (fieldStatus === true && field !== 'mobilityDomain') {
                    radioStatus[radioIndex] = false;
                }
            });
        });

        Object.keys(modelOption[model].radioSettings)
        .forEach((radioName, radioIndex) => {
            radioTabHeaderStatus[radioIndex] = radioStatus[radioIndex] ? 'true' : 'false';
            radioTabHeader[radioIndex] = (
                // <Tab
                //     classes={{
                //         root: classes.tabStyle,
                //     }}
                //     style={{color: radioStatus[radioIndex] ? '#122d54' : '#DC4639'}}
                //     label={radioStatus[radioIndex] ?
                //         this.t(`radioTitle.${radioName}`) :
                //         (
                //             <span style={{
                //                 display: 'flex',
                //                 alignItems: 'center',
                //                 justifyContent: 'center',
                //                 marginLeft: '21px',
                //             }}
                //             >
                //                 <span>{this.t(`radioTitle.${radioName}`)}</span>
                //                 <P2Tooltip
                //                     title={this.t('invalidConfigLbl')}
                //                     content={(<i
                //                         className="material-icons"
                //                         style={{
                //                             fontSize: '16px',
                //                             marginLeft: '5px',
                //                             marginBottom: '0.5px',
                //                         }}
                //                     >error</i>)}
                //                     key={radioName}
                //                 />
                //             </span>
                //         )}
                //     key={radioName}
                // />
                <div
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: radioStatus[radioIndex] ? '#122d54' : '#DC4639',
                        fontSize: '13px',
                        userSelect: 'none',
                    }}
                    key={radioName}
                >
                    {radioStatus[radioIndex] ?
                        this.t(`radioTitle.${radioName}`) :
                        (
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                fontSize: '13px',
                            }}
                            >
                                <span>{this.t(`radioTitle.${radioName}`)}</span>
                                <P2Tooltip
                                    title={this.t('invalidConfigLbl')}
                                    content={(<i
                                        className="material-icons"
                                        style={{
                                            fontSize: '16px',
                                            marginLeft: '5px',
                                            marginBottom: '0.5px',
                                        }}
                                    >error</i>)}
                                    key={radioName}
                                />
                            </span>
                        )}
                </div>
            );
        });

        const ethErrorStatusObj = errorStatus.ethernetSettings;
        const ethStatus = {};

        Object.keys(ethErrorStatusObj).forEach((ethName, ethIndex) => {
            const ethFieldStatus = ethErrorStatusObj[ethName];
            ethStatus[ethIndex] = true;
            Object.keys(ethFieldStatus).forEach((field) => {
                const fieldStatus = ethErrorStatusObj[ethName][field];
                if (fieldStatus === true) {
                    ethStatus[ethIndex] = false;
                }
            });
        });

        if (!this.props.disableEthernetConfig) {
            Object.keys(modelOption[model].ethernetSettings)
            .forEach((ethName, ethIndex) => {
                const tabIndex = radioTabHeader.length;
                radioTabHeaderStatus[tabIndex] = ethStatus[ethIndex] ? 'true' : 'false';
                radioTabHeader[tabIndex] = (
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: ethStatus[ethIndex] ? '#122d54' : '#DC4639',
                            fontSize: '13px',
                            userSelect: 'none',
                        }}
                        key={ethName}
                    >
                        {ethStatus[ethIndex] ?
                            this.t(`ethTitle.${ethName}`) :
                            (
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '13px',
                                }}
                                >
                                    <span>{this.t(`ethTitle.${ethName}`)}</span>
                                    <P2Tooltip
                                        title={this.t('invalidConfigLbl')}
                                        content={(<i
                                            className="material-icons"
                                            style={{
                                                fontSize: '16px',
                                                marginLeft: '5px',
                                                marginBottom: '0.5px',
                                            }}
                                        >error</i>)}
                                        key={ethName}
                                    />
                                </span>
                            )}
                    </div>
                );
            });
        }

        const radioAction = (
            <div style={{
                padding: '15px 20px',
                display: 'flex',
                justifyContent: 'flex-end',
            }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={this.clickReset}
                    style={{marginRight: '10px', borderRadius: '0px'}}
                >
                    {this.t('resetBtnTitle')}
                </Button>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={this.clickSave}
                    disabled={submitDisabled || this.props.disabled}
                    style={{marginRight: '14px', borderRadius: '0px'}}
                >
                    {this.t('saveBtnTitle')}
                </Button>
            </div>
        );

        const nodeSettingsContent = [];
        const nodeAdvancedSettingsContents = [];
        modelOption[model].nodeSettings.forEach((opt) => {
            switch (opt) {
                case 'hostname':
                    nodeSettingsContent.push((
                        <FormInputCreator
                            key={opt}
                            errorStatus={errorStatus.nodeSettings[opt] && hostnameModified}
                            inputLabel={this.t(`optionObj.nodeSettings.${opt}.title`)}
                            inputID={opt}
                            inputValue={formData.nodeSettings[opt]}
                            onChangeField={this.handleChange}
                            placeholder={this.t(`optionObj.nodeSettings.${opt}.placeholder`)}
                            autoFocus={false}
                            margin="normal"
                            onKeyPressField={isEnterToSubmit}
                            helperText={statusText.nodeSettings[opt]}
                            inputType="text"
                        />
                    ));
                    break;
                case 'endtSendInterval':
                    if (!this.isFwSupportEndt) {
                        break;
                    }
                    nodeAdvancedSettingsContents.push((
                        <FormInputCreator
                            key={opt}
                            errorStatus={errorStatus.nodeSettings[opt]}
                            inputLabel={this.t(`optionObj.nodeSettings.${opt}.title`)}
                            inputID={opt}
                            inputValue={formData.nodeSettings[opt]}
                            onChangeField={this.handleChange}
                            placeholder={this.t(`optionObj.nodeSettings.${opt}.placeholder`)}
                            autoFocus={false}
                            margin="normal"
                            onKeyPressField={isEnterToSubmit}
                            helperText={statusText.nodeSettings[opt]}
                            inputType="text"
                            showHelpTooltip
                            helpTooltip={(
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                >
                                    <span
                                        style={{
                                            ...warnStatus.nodeSettings[opt] && {
                                            color: colors.warningColor,
                                        }}}
                                    >
                                            {this.t(`optionObj.nodeSettings.endtSendInterval.title`)}
                                    </span>
                                    <P2Tooltip
                                        direction="right"
                                        title={
                                            <div className={classes.tooltipStyle}>
                                                <div>
                                                    {this.t(`optionObj.nodeSettings.endtSendInterval.tooltip`)}
                                                </div>
                                            </div>
                                        }
                                        content={(<i
                                            className="material-icons"
                                            style={{
                                                color: themeObj.primary.light,
                                                fontSize: '20px',
                                                marginLeft: '5px',
                                                marginTop: '-1px',
                                            }}
                                        >help</i>)}
                                    />
                                </span>
                            )}
                        />
                    ));
                    break;
                case 'endtRecvTimeout':
                    if (!this.isFwSupportEndt) {
                        break;
                    }
                    nodeAdvancedSettingsContents.push((
                        <FormInputCreator
                            key={opt}
                            errorStatus={errorStatus.nodeSettings[opt]}
                            inputLabel={this.t(`optionObj.nodeSettings.${opt}.title`)}
                            inputID={opt}
                            inputValue={formData.nodeSettings[opt]}
                            onChangeField={this.handleChange}
                            placeholder={this.t(`optionObj.nodeSettings.${opt}.placeholder`)}
                            autoFocus={false}
                            margin="normal"
                            onKeyPressField={isEnterToSubmit}
                            helperText={statusText.nodeSettings[opt]}
                            inputType="text"
                            showHelpTooltip
                            helpTooltip={(
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                >
                                    <span
                                        style={{
                                            ...warnStatus.nodeSettings[opt] && {
                                            color: colors.warningColor,
                                        }}}
                                    >
                                            {this.t(`optionObj.nodeSettings.endtRecvTimeout.title`)}
                                    </span>
                                    <P2Tooltip
                                        direction="right"
                                        title={
                                            <div className={classes.tooltipStyle}>
                                                <div>
                                                    {this.t(`optionObj.nodeSettings.endtRecvTimeout.tooltip`)}
                                                </div>
                                            </div>
                                        }
                                        content={(<i
                                            className="material-icons"
                                            style={{
                                                color: themeObj.primary.light,
                                                fontSize: '20px',
                                                marginLeft: '5px',
                                                marginTop: '-1px',
                                            }}
                                        >help</i>)}
                                    />
                                </span>
                            )}
                        />
                    ));
                    break;
                case 'endtPriority':
                    if (!this.isFwSupportEndt) {
                        break;
                    }
                    nodeAdvancedSettingsContents.push((
                        <FormInputCreator
                            key={opt}
                            errorStatus={errorStatus.nodeSettings[opt]}
                            inputLabel={this.t(`optionObj.nodeSettings.${opt}.title`)}
                            inputID={opt}
                            inputValue={formData.nodeSettings[opt]}
                            onChangeField={this.handleChange}
                            placeholder={this.t(`optionObj.nodeSettings.${opt}.placeholder`)}
                            autoFocus={false}
                            margin="normal"
                            onKeyPressField={isEnterToSubmit}
                            helperText={statusText.nodeSettings[opt]}
                            inputType="text"
                            showHelpTooltip
                            helpTooltip={(
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                >
                                    <span
                                        style={{
                                            ...warnStatus.nodeSettings[opt] && {
                                            color: colors.warningColor,
                                        }}}
                                    >
                                            {this.t(`optionObj.nodeSettings.endtPriority.title`)}
                                    </span>
                                    <P2Tooltip
                                        direction="right"
                                        title={
                                            <div className={classes.tooltipStyle}>
                                                <div>
                                                    {this.t(`optionObj.nodeSettings.endtPriority.tooltip`)}
                                                </div>
                                            </div>
                                        }
                                        content={(<i
                                            className="material-icons"
                                            style={{
                                                color: themeObj.primary.light,
                                                fontSize: '20px',
                                                marginLeft: '5px',
                                                marginTop: '-1px',
                                            }}
                                        >help</i>)}
                                    />
                                </span>
                            )}
                        />
                    ));
                    break;
                case 'atpcInterval':
                    if (!this.isFwSupportAtpc) {
                        break;
                    }
                    nodeAdvancedSettingsContents.push((
                        <FormSelectCreator
                            key={`node_atpcInterval`}
                            errorStatus={errorStatus.nodeSettings.atpcInterval}
                            warnStatus={warnStatus.nodeSettings.atpcInterval}
                            radio={maxNbr}
                            margin="normal"
                            inputLabel={this.t(`optionObj.nodeSettings.atpcInterval.title`)}
                            inputID={`node_atpcInterval`}
                            inputValue={formData.nodeSettings.atpcInterval}
                            onChangeField={(e) => { this.handleChange(e) }}
                            menuItemObj={typeof configOptionType === 'undefined' ||
                            configOptionType.nodeSettings[nodes[0].ipv4].atpcInterval.type !== 'enum' ?
                                [{
                                    displayValue: formData.nodeSettings.atpcInterval,
                                    actualValue: formData.nodeSettings.atpcInterval,
                                }] :
                                 configOptionType.nodeSettings[nodes[0].ipv4].atpcInterval.data
                            }
                            helperText={statusText.nodeSettings.atpcInterval}
                            helpTooltip={(
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                >
                                    <span
                                        style={{
                                            ...warnStatus.nodeSettings.atpcInterval && {
                                            color: colors.warningColor,
                                        }}}
                                    >
                                            {this.t(`optionObj.nodeSettings.atpcInterval.title`)}
                                    </span>
                                    <P2Tooltip
                                        direction="right"
                                        title={
                                            <div className={classes.tooltipStyle}>
                                                <div>
                                                    {this.t(`optionObj.nodeSettings.atpcInterval.tooltip`)}
                                                </div>
                                                {/* <div style={{textAlign: 'left', paddingTop: '10px', fontStyle: 'italic'}}>
                                                    {this.t(`optionObj.nodeSettings.atpcInterval.tooltip1`)}
                                                </div> */}
                                            </div>
                                        }
                                        content={(<i
                                            className="material-icons"
                                            style={{
                                                color: themeObj.primary.light,
                                                fontSize: '20px',
                                                marginLeft: '5px',
                                                marginTop: '-1px',
                                            }}
                                        >help</i>)}
                                    />
                                </span>
                            )}
                            showHelpTooltip
                        />
                    ));
                    break;
                case 'allowReboot':
                    if (!this.isFwSupportAllowReboot || !this.props.enableWatchdogConfig) {
                        break;
                    }
                    nodeAdvancedSettingsContents.push((
                        <FormSelectCreator
                            key={opt}
                            errorStatus={errorStatus.nodeSettings.allowReboot}
                            warnStatus={warnStatus.nodeSettings.allowReboot}
                            radio={maxNbr}
                            margin="normal"
                            inputLabel={this.t(`optionObj.nodeSettings.allowReboot.title`)}
                            inputID={opt}
                            inputValue={formData.nodeSettings.allowReboot}
                            onChangeField={(e) => { this.handleChange(e) }}
                            menuItemObj={typeof configOptionType === 'undefined' ||
                            configOptionType.nodeSettings[nodes[0].ipv4].allowReboot.type
                            !== 'enum' ?
                            [{
                                displayValue: formData.nodeSettings.allowReboot,
                                actualValue: formData.nodeSettings.allowReboot,
                            }] :
                            configOptionType.nodeSettings[nodes[0].ipv4].allowReboot.data}
                            helperText={statusText.nodeSettings.allowReboot}
                            helpTooltip={(
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                >
                                    <span
                                        style={{
                                            ...warnStatus.nodeSettings.allowReboot && {
                                            color: colors.warningColor,
                                        }}}
                                    >
                                            {this.t(`optionObj.nodeSettings.allowReboot.title`)}
                                    </span>
                                    <P2Tooltip
                                        direction="right"
                                        title={
                                            <div className={classes.tooltipStyleMd}>
                                                <div>
                                                    {this.t(`optionObj.nodeSettings.allowReboot.tooltip0`)}
                                                </div>
                                                <div>
                                                    <span style={{fontWeight: '800'}}>{this.t(`optionObj.nodeSettings.allowReboot.tooltip1`)}</span>
                                                    {this.t(`optionObj.nodeSettings.allowReboot.tooltip2`)}
                                                </div>
                                                <div>
                                                    <span style={{fontWeight: '800'}}>{this.t(`optionObj.nodeSettings.allowReboot.tooltip3`)}</span>
                                                    {this.t(`optionObj.nodeSettings.allowReboot.tooltip4`)}
                                                </div>
                                                {/* <div style={{textAlign: 'left', paddingTop: '10px', fontStyle: 'italic'}}>
                                                    {this.t(`optionObj.nodeSettings.atpcInterval.tooltip1`)}
                                                </div> */}
                                            </div>
                                        }
                                        content={(<i
                                            className="material-icons"
                                            style={{
                                                color: themeObj.primary.light,
                                                fontSize: '20px',
                                                marginLeft: '5px',
                                                marginTop: '-1px',
                                            }}
                                        >help</i>)}
                                    />
                                </span>
                            )}
                            showHelpTooltip
                        />
                    ));
                    break;
                case 'acs':
                    if (!this.isFwSupportAcs) {
                        break;
                    }
                    nodeAdvancedSettingsContents.push((
                        <FormSelectCreator
                            key={`node_acs`}
                            errorStatus={errorStatus.nodeSettings.acs}
                            warnStatus={warnStatus.nodeSettings.acs}
                            margin="normal"
                            inputLabel={this.t(`.nodeSettings.acs.title`)}
                            inputID={`node_acs`}
                            inputValue={formData.nodeSettings.acs}
                            onChangeField={(e) => {this.handleChange(e)}}
                            onCloseField={(e) => {this.handleClose(e)}}
                            menuItemObj={typeof configOptionType === 'undefined' ||
                                configOptionType.nodeSettings[nodes[0].ipv4].acs.type
                                !== 'enum' ?
                                [{
                                    displayValue: formData.nodeSettings.acs,
                                    actualValue: formData.nodeSettings.acs,
                                }] :
                                configOptionType.nodeSettings[nodes[0].ipv4].acs.data}
                            helperText={statusText.nodeSettings.acs}
                            helpTooltip={(
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                >
                                    <span
                                        style={{
                                            ...warnStatus.nodeSettings.acs && {
                                                color: colors.warningColor,
                                            }
                                        }}
                                    >
                                        {this.t(`optionObj.nodeSettings.acs.title`)}
                                    </span>
                                    <P2Tooltip
                                        direction="right"
                                        title={
                                            <div className={classes.tooltipStyle}>
                                                <div>
                                                    {this.t(`optionObj.nodeSettings.acs.tooltip`)}
                                                </div>
                                            </div>
                                        }
                                        content={(<i
                                            className="material-icons"
                                            style={{
                                                color: themeObj.primary.light,
                                                fontSize: '20px',
                                                marginLeft: '5px',
                                                marginTop: '-1px',
                                            }}
                                        >help</i>)}
                                    />
                                </span>
                            )}
                            showHelpTooltip
                        />
                    ));
                    break;
                case 'acsInterval':
                    if (!this.isFwSupportAcs) {
                        break;
                    }
                    nodeAdvancedSettingsContents.push((
                        <FormSelectCreator
                            key={`node_acsInterval`}
                            errorStatus={errorStatus.nodeSettings.acsInterval}
                            warnStatus={warnStatus.nodeSettings.acsInterval}
                            margin="normal"
                            inputLabel={this.t(`.nodeSettings.acsInterval.title`)}
                            inputID={`node_acsInterval`}
                            inputValue={formData.nodeSettings.acsInterval}
                            onChangeField={(e) => { this.handleChange(e) }}
                            menuItemObj={typeof configOptionType === 'undefined' ||
                                configOptionType.nodeSettings[nodes[0].ipv4].acsInterval.type
                                !== 'enum' ?
                                [{
                                    displayValue: formData.nodeSettings.acsInterval,
                                    actualValue: formData.nodeSettings.acsInterval,
                                }] :
                                configOptionType.nodeSettings[nodes[0].ipv4].acsInterval.data}
                            helperText={statusText.nodeSettings.acsInterval}
                            helpTooltip={(
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                >
                                    <span
                                        style={{
                                            ...warnStatus.nodeSettings.acsInterval && {
                                                color: colors.warningColor,
                                            }
                                        }}
                                    >
                                        {this.t(`optionObj.nodeSettings.acsInterval.title`)}
                                    </span>
                                    <P2Tooltip
                                        direction="right"
                                        title={
                                            <div className={classes.tooltipStyle}>
                                                <div>
                                                    {this.t(`optionObj.nodeSettings.acsInterval.tooltip`)}
                                                </div>
                                            </div>
                                        }
                                        content={(<i
                                            className="material-icons"
                                            style={{
                                                color: themeObj.primary.light,
                                                fontSize: '20px',
                                                marginLeft: '5px',
                                                marginTop: '-1px',
                                            }}
                                        >help</i>)}
                                    />
                                </span>
                            )}
                            showHelpTooltip
                        />
                    ));
                    break;
                case 'acsChannelList':
                    if (!this.isFwSupportAcs) {
                        break;
                    }
                    
                    nodeAdvancedSettingsContents.push((
                        <FormSelectCreator
                            multiple={true}
                            key={`node_acsChannelList`}
                            errorStatus={errorStatus.nodeSettings.acsChannelList}
                            warnStatus={warnStatus.nodeSettings.acsChannelList}
                            margin="normal"
                            inputLabel={this.t(`.nodeSettings.acsChannelList.title`)}
                            inputID={`node_acsChannelList`}
                            helperText={statusText.nodeSettings.acsChannelList}
                            inputValue={formData.nodeSettings.acsChannelList}
                            onChangeField={(e) => { console.log(e); this.handleChange(e) }}
                            menuItemObj={
                                typeof configOptionType === 'undefined' ||
                                configOptionType.nodeSettings[nodes[0].ipv4].acsChannelList.type !== 'enum' ?
                                [{
                                    displayValue: formData.nodeSettings.acsChannelList,
                                    actualValue: formData.nodeSettings.acsChannelList,
                                }] :
                                configOptionType.nodeSettings[nodes[0].ipv4].acsChannelList.data
                            }
                            helpTooltip={(
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                >
                                    <span
                                        style={{
                                            ...warnStatus.nodeSettings.acsChannelList && {
                                                color: colors.warningColor,
                                            }
                                        }}
                                    >
                                        {this.t(`optionObj.nodeSettings.acsChannelList.title`)}
                                    </span>
                                    <P2Tooltip
                                        direction="right"
                                        title={
                                            <div className={classes.tooltipStyle}>
                                                <div>
                                                    {this.t(`optionObj.nodeSettings.acsChannelList.tooltip`)}
                                                </div>
                                            </div>
                                        }
                                        content={(<i
                                            className="material-icons"
                                            style={{
                                                color: themeObj.primary.light,
                                                fontSize: '20px',
                                                marginLeft: '5px',
                                                marginTop: '-1px',
                                            }}
                                        >help</i>)}
                                    />
                                </span>
                            )}
                            showHelpTooltip
                        />
                    ));
                    break;
                // case 'select':
                //     nodeSettingsContent.push((
                //         <FormSelectCreator
                //             key={`node_${opt}`}
                //             errorStatus={errorStatus.nodeSettings[opt]}
                //             warnStatus={warnStatus.nodeSettings[opt]}
                //             radio={opt}
                //             margin="normal"
                //             inputLabel={this.t(`optionObj.nodeSettings.${opt}.title`)}
                //             inputID={`node_${opt}`}
                //             inputValue={formData.nodeSettings[opt]}
                //             onChangeField={(e) => { this.handleChange(e) }}
                //             menuItemObj={menuItemObj}
                //             helperText={statusText.nodeSettings[opt]}
                //             helpTooltip={(
                //                 <span style={{
                //                     display: 'flex',
                //                     alignItems: 'center',
                //                 }}
                //                 >
                //                     <span
                //                         style={{
                //                             ...warnStatus.nodeSettings[opt] && {
                //                             color: colors.warningColor,
                //                         }}}
                //                     >
                //                             {this.t(`optionObj.nodeSettings.${opt}.title`)}
                //                     </span>
                //                     <P2Tooltip
                //                         direction="right"
                //                         title={
                //                             <div style={{fontWeight: '400'}} className={classes.tooltipStyle}>
                //                                 <div>
                //                                     {this.t(`optionObj.nodeSettings.${opt}.tooltip0`)}
                //                                 </div>
                //                             </div>
                //                         }
                //                         content={(<i
                //                             className="material-icons"
                //                             style={{
                //                                 color: themeObj.primary.light,
                //                                 fontSize: '20px',
                //                                 marginLeft: '5px',
                //                                 marginTop: '-1px',
                //                             }}
                //                         >help</i>)}
                //                     />
                //                 </span>
                //             )}
                //             showHelpTooltip
                //         />
                //     ));
                //     break;
                default:
                    break;
            }
        });

        const nodeErrorStatusObj = errorStatus.nodeSettings;
        let nodeStatus = true;
        let nodeStatusAdvanced = true;
        // Object.keys(nodeErrorStatusObj).forEach((opt) => {
        //     if (nodeErrorStatusObj[opt]) {
        //         nodeStatus = false;
        //     }
        // });
        if (nodeErrorStatusObj['hostname']) {
            nodeStatus = false;
        }
        if (nodeErrorStatusObj['endtSendInterval'] || nodeErrorStatusObj['endtRecvTimeout'] || nodeErrorStatusObj['endtPriority'] ) {
            nodeStatusAdvanced = false;
        }

        // const isMobilityTabDisabled = this.getMobilityTabStatus();
        // let mobilityTabColor = '#122d54';
        // if (isMobilityTabDisabled) {
        //     mobilityTabColor = Constant.colors.disabledText;
        // } else if (this.state.errorStatus.radioSettings.radio0.mobilityDomain) {
        //     mobilityTabColor = '#DC4639';
        // }
        const nodeConfigTabPanels = [
            (<Tabs.Panel
                title={
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: nodeStatus ? '#122d54' : '#DC4639',
                            fontSize: '13px',
                            userSelect: 'none',
                        }}
                    >
                        {nodeStatus ?
                            this.t('general') :
                            (
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '13px',
                                }}
                                >
                                    <span>{this.t('general')}</span>
                                    <P2Tooltip
                                        title={this.t('invalidConfigLbl')}
                                        content={(<i
                                            className="material-icons"
                                            style={{
                                                fontSize: '16px',
                                                marginLeft: '5px',
                                                marginBottom: '0.5px',
                                            }}
                                        >error</i>)}
                                    />
                                </span>
                            )
                        }
                    </div>
                }
                key="general-node-settings-tab"
            >
                <div
                    component="div"
                    dir="x"
                    style={{padding: '0 24px 0 24px', overflow: 'hidden'}}
                >
                    {nodeSettingsContent}
                </div>
            </Tabs.Panel>),
            (<Tabs.Panel
                title={
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: !nodeStatusAdvanced ? '#DC4639' : '#122d54',
                            fontSize: '13px',
                            userSelect: 'none',
                        }}
                    >
                        {nodeStatusAdvanced ?
                            this.t('advanced') :
                            (
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: '13px',
                                }}
                                >
                                    <span>{this.t('advanced')}</span>
                                    <P2Tooltip
                                        title={this.t('invalidConfigLbl')}
                                        content={(<i
                                            className="material-icons"
                                            style={{
                                                fontSize: '16px',
                                                marginLeft: '5px',
                                                marginBottom: '0.5px',
                                            }}
                                        >error</i>)}
                                    />
                                </span>
                            )
                        }
                    </div>
                }
                key="maxNbr-node-settings-tab"
            >
                <div
                    component="div"
                    dir="x"
                    style={{padding: '0 24px 0 24px', overflow: 'hidden'}}
                >
                    {
                        <FormSelectCreator
                            key={`node_maxNbr`}
                            errorStatus={errorStatus.nodeSettings.maxNbr}
                            warnStatus={warnStatus.nodeSettings.maxNbr}
                            radio={maxNbr}
                            margin="normal"
                            inputLabel={this.t(`optionObj.nodeSettings.maxNbr.title`)}
                            inputID={`node_maxNbr`}
                            inputValue={formData.nodeSettings.maxNbr}
                            onChangeField={(e) => { this.handleChange(e) }}
                            menuItemObj={typeof configOptionType === 'undefined' ||
                            configOptionType.profileSettings[nodes[0].ipv4].nbr['1'].maxNbr.type
                            !== 'enum' ?
                            [{
                                displayValue: formData.nodeSettings.maxNbr,
                                actualValue: formData.nodeSettings.maxNbr,
                            }] :
                            configOptionType.profileSettings[nodes[0].ipv4].nbr['1'].maxNbr.data}
                            helperText={statusText.nodeSettings.maxNbr}
                            helpTooltip={(
                                <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                                >
                                    <span
                                        style={{
                                            ...warnStatus.nodeSettings.maxNbr && {
                                            color: colors.warningColor,
                                        }}}
                                    >
                                            {this.t(`optionObj.nodeSettings.maxNbr.title`)}
                                    </span>
                                    <P2Tooltip
                                        direction="right"
                                        title={
                                            <div className={classes.tooltipStyle}>
                                                <div>
                                                    {this.t(`optionObj.nodeSettings.maxNbr.tooltip0`)}
                                                </div>
                                                <div style={{textAlign: 'left', paddingTop: '10px', fontStyle: 'italic'}}>
                                                    {this.t(`optionObj.nodeSettings.maxNbr.tooltip1`)}
                                                </div>
                                            </div>
                                        }
                                        content={(<i
                                            className="material-icons"
                                            style={{
                                                color: themeObj.primary.light,
                                                fontSize: '20px',
                                                marginLeft: '5px',
                                                marginTop: '-1px',
                                            }}
                                        >help</i>)}
                                    />
                                </span>
                            )}
                            showHelpTooltip
                        />
                    }
                    {
                        // <FormSelectCreator
                        //     key={`node_atpcInterval`}
                        //     errorStatus={errorStatus.nodeSettings.atpcInterval}
                        //     warnStatus={warnStatus.nodeSettings.atpcInterval}
                        //     radio={maxNbr}
                        //     margin="normal"
                        //     inputLabel={this.t(`optionObj.nodeSettings.atpcInterval.title`)}
                        //     inputID={`node_atpcInterval`}
                        //     inputValue={formData.nodeSettings.atpcInterval}
                        //     onChangeField={(e) => { this.handleChange(e) }}
                        //     menuItemObj={typeof configOptionType === 'undefined' ||
                        //     configOptionType.nodeSettings[nodes[0].ipv4].atpcInterval.type
                        //     !== 'enum' ?
                        //     [{
                        //         displayValue: formData.nodeSettings.atpcInterval,
                        //         actualValue: formData.nodeSettings.atpcInterval,
                        //     }] :
                        //     configOptionType.nodeSettings[nodes[0].ipv4].atpcInterval.data}
                        //     helperText={statusText.nodeSettings.atpcInterval}
                        //     helpTooltip={(
                        //         <span style={{
                        //             display: 'flex',
                        //             alignItems: 'center',
                        //         }}
                        //         >
                        //             <span
                        //                 style={{
                        //                     ...warnStatus.nodeSettings.atpcInterval && {
                        //                     color: colors.warningColor,
                        //                 }}}
                        //             >
                        //                     {this.t(`optionObj.nodeSettings.atpcInterval.title`)}
                        //             </span>
                        //             <P2Tooltip
                        //                 direction="right"
                        //                 title={
                        //                     <div className={classes.tooltipStyle}>
                        //                         <div>
                        //                             {this.t(`optionObj.nodeSettings.atpcInterval.tooltip`)}
                        //                         </div>
                        //                         {/* <div style={{textAlign: 'left', paddingTop: '10px', fontStyle: 'italic'}}>
                        //                             {this.t(`optionObj.nodeSettings.atpcInterval.tooltip1`)}
                        //                         </div> */}
                        //                     </div>
                        //                 }
                        //                 content={(<i
                        //                     className="material-icons"
                        //                     style={{
                        //                         color: themeObj.primary.light,
                        //                         fontSize: '20px',
                        //                         marginLeft: '5px',
                        //                         marginTop: '-1px',
                        //                     }}
                        //                 >help</i>)}
                        //             />
                        //         </span>
                        //     )}
                        //     showHelpTooltip
                        // />
                    }
                    {
                        nodeAdvancedSettingsContents
                    }
                </div>
            </Tabs.Panel>),
        ];

        const {nodeConfigTabNo} = this.state;
        let nodeTabBottomColor = colors.inactiveRed;
        if (nodeConfigTabNo === 1 && nodeStatus) {
            nodeTabBottomColor = themeObj.primary.main;
        } else if (nodeConfigTabNo === 2 && !nodeStatusAdvanced) {
            nodeTabBottomColor = colors.inactiveRed;
        } else if (nodeConfigTabNo === 2 && nodeStatusAdvanced) {
            nodeTabBottomColor = themeObj.primary.main;
        }

        const networkConfigTabPanels = [];
        for (let i = 0; i < radioTabContent.length; i += 1) {
            networkConfigTabPanels[i] =
                (<Tabs.Panel
                    title={
                        radioTabHeader[i] ? radioTabHeader[i] : <span />
                    }
                    key={`tabData_${i}`}
                >
                    {radioTabContent[i]}
                </Tabs.Panel>);
        }
        const borderColor = radioTabHeaderStatus[this.state.networkConfigTabNo - 1] === 'true' ?
            themeObj.primary.main : colors.inactiveRed;

        const nodeNotAccessibleBanner = this.props.disabled ? (
            <span style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '5px',
                backgroundColor: colors.mismatchBackground,
                padding: '10px',
                paddingTop: '15px',
                paddingBottom: '15px',
                paddingLeft: '23px',
                // margin: '15px',
            }}
            >
                <i
                    className="material-icons"
                    style={{
                        fontSize: '20px',
                        paddingRight: '16px',
                        color: colors.mismatchLabel,
                    }}
                >error</i>
                <Typography style={{fontSize: 14, lineHeight: '140%', color: colors.mismatchLabel}}>
                    <b>{this.props.t('nodeNotAccessibleTitle')}</b>
                </Typography>
            </span>
        ) : (<span />);

        return (
            <MuiThemeProvider theme={theme}>
                <LockLayer
                    display={this.state.isLock}
                    top={false}
                    left={false}
                    zIndex={200}
                    opacity={1}
                    color={colors.lockLayerBackground}
                    hasCircularProgress
                    circularMargin="-40px"
                    position="absolute"
                />
                <div
                    className={classes.wrapper}
                    style={{
                        padding: '20px 30px 10px 30px',
                        height: 'calc(100% - 93px)',
                    }}
                >
                    {SaveConfigDialog}
                    {nodeNotAccessibleBanner}
                    <Accordion
                        classes={{
                            expanded: classes.expansionPanelExpanded,
                            root: classes.expansionPanelRoot,
                        }}
                        defaultExpanded
                    >
                        <AccordionSummary
                            expandIcon={<i className="material-icons">expand_more</i>}
                            style={{minHeight: '40px'}}
                            classes={{content: warnStatus.nodeSettings.maxNbr ?
                                classes.accordionSummaryExpandedWithWarn :
                                classes.accordionSummaryExpanded,
                                expanded: 'wtf',
                            }}
                        >
                            <div style={{display: 'flex', flexDirection: 'column'}}>
                                <Typography variant="body2" style={{fontSize: '16px'}}>
                                    {this.t('nodeConfiguration')}
                                </Typography>
                                {warnStatus.nodeSettings.maxNbr && <span style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    borderRadius: '3px',
                                    backgroundColor: colors.warningBackground,
                                    padding: '12px',
                                    marginTop: '10px'
                                }}
                                >
                                    <i
                                        className="material-icons"
                                        style={{
                                            fontSize: '40px',
                                            paddingRight: '16px',
                                            color: colors.warningColor,
                                        }}
                                    >error_outline</i>
                                    <span style={{
                                        fontSize: 14,
                                        lineHeight: '140%',
                                        color: colors.warningColor,
                                        fontWeight: '500',
                                    }}>
                                        <Trans
                                            defaults={this.t('nodeSettingsMaxNbrWarningMsg')}
                                            components={{ bold: <strong /> }}
                                        />
                                    </span>
                                </span>}
                            </div>
                        </AccordionSummary>
                        <AccordionDetails
                            style={{padding: '0px 0px 20px 0px', display: 'block'}}
                        >
                            <StyledTabs
                                tabStatus={nodeTabBottomColor}
                                maxWidth="120px"
                                theme={themeObj}
                                className={classes.menuItemClass}
                                tabActive={this.state.nodeConfigTabNo}
                                onBeforeChange={(idx) => {
                                    // if the user clicks on mobility tab but the operation mode is mesh or disabled,
                                    // the click event is disabled
                                    // if (isMobilityTabDisabled && idx === 2) {
                                    //     return false;
                                    // }
                                    return true;
                                }}
                                onAfterChange={(idx) => {
                                    this.setState({nodeConfigTabNo: idx});
                                }}
                            >
                                {nodeConfigTabPanels}
                            </StyledTabs>
                        </AccordionDetails>
                    </Accordion>
                    {/* <Tabs
                        value={this.state.networkConfigTabNo}
                        onChange={this.handleRadioChange}
                        indicatorColor="primary"
                        textColor="primary"
                        style={{paddingLeft: '20px', paddingBottom: '10px'}}
                        classes={{
                            indicator: radioStatus[this.state.networkConfigTabNo] === false ?
                                classes.indicatorColorError : classes.indicatorColor,
                        }}
                    >
                        {radioTabHeader}
                    </Tabs>
                    <SwipeableViews
                        axis="x"
                        index={this.state.networkConfigTabNo}
                        onChangeIndex={this.handleChangeRadioIndex}
                        disableLazyLoading
                    >
                        {radioTabContent}
                    </SwipeableViews> */}
                    <Accordion
                        classes={{
                            expanded: classes.expansionPanelExpanded,
                            root: classes.expansionPanelRoot,
                        }}
                        defaultExpanded
                    >
                        <AccordionSummary
                            expandIcon={<i className="material-icons">expand_more</i>}
                            style={{maxHeight: '40px', minHeight: '40px'}}
                        >
                            <Typography variant="body2" style={{fontSize: '16px'}}>
                                {this.t('networkInterfaceConfig')}
                            </Typography>
                        </AccordionSummary>
                        <AccordionDetails
                            style={{padding: '0px 0px 20px 0px', display: 'block'}}
                        >
                            <StyledTabs
                                tabStatus={borderColor}
                                theme={themeObj}
                                className={classes.menuItemClass}
                                tabActive={this.state.networkConfigTabNo}
                                onAfterChange={(idx) => {
                                    this.setState({networkConfigTabNo: idx});
                                }}
                            >
                                {networkConfigTabPanels}
                            </StyledTabs>
                        </AccordionDetails>
                    </Accordion>
                </div>
                {radioAction}
            </MuiThemeProvider>
        );
    }
}
const styles = {
    input: {
        marginBotton: '20px',
    },
    root: {
        minWidth: 0,
        backgroundColor: themeObj.primary.light,
        color: 'white',
        fontWeight: 'bold',
    },
    modelContent: {
        width: '100%',
    },
    headerTitle: {
        color: 'white',
    },
    wrapper: {
        padding: '20px',
        overflowX: 'hidden',
    },
    loading: {
        position: 'absolute',
        zIndex: '100',
        backgroundColor: 'red',
        top: '0',
        bottom: '0',
        left: '0',
        right: '0',
    },
    indicatorColorError: {
        backgroundColor: '#DC4639',
    },
    indicatorColor: {
        backgroundColor: '#122d54',
    },
    tabTextColorError: {
        color: '#DC4639',
    },
    tabTextColor: {
        color: '#122d54',
    },
    tooltipStyle: {
        fontSize: '12px',
        padding: '2px',
        textAlign: 'left',
        width: '250px',
    },
    tooltipStyleMd: {
        fontSize: '12px',
        padding: '2px',
        textAlign: 'left',
        width: '500px',
    },
    tabStyle: {
        minWidth: '123px',
        '@media (min-width: 960px)': {
            minWidth: '123px',
            flex: 1,
        },
    },
    menuItemClass: Constant.theme.typography.title,
    expansionPanelExpanded: {
        margin: '0px 0px 15px 0px',
    },
    expansionPanelRoot: {
        marginBottom: '20px',
        '&:before': {
            display: 'none',
        },
        borderRadius: '2px',
    },
    accordionSummaryExpandedWithWarn: {
        margin: '20px 0px',
    },
    accordionSummaryExpanded: {
        margin: '12px 0px',
        '&.wtf': {
            margin: '12px 0px !important',
        },
    },
    hideBorder: {
        '&:before': {
            display: 'none',
        },
    },
};

NodeConfigurationBox.defaultProps = {
    disableEthernetConfig: false,
    updateIsLock: () => {},
};

NodeConfigurationBox.propTypes = {
    classes: PropTypes.object.isRequired, /* eslint-disable-line */
    history: PropTypes.object.isRequired, /* eslint-disable-line */
    nodes: PropTypes.arrayOf(
        PropTypes.shape({
            ipv4: PropTypes.string.isRequired,
            hostname: PropTypes.string.isRequired,
            model: PropTypes.string.isRequired,
            mac: PropTypes.string.isRequired,
        })
    ).isRequired,
    close: PropTypes.func.isRequired,
    csrf: PropTypes.string.isRequired,
    pollingHandler: PropTypes.shape(
        {
            restartInterval: PropTypes.func.isRequired,
            stopInterval: PropTypes.func.isRequired,
        }
    ).isRequired,
    updateIsLock: PropTypes.func,
    t: PropTypes.func.isRequired,
    lang: PropTypes.string.isRequired,
    setTempNodeConfig: PropTypes.func.isRequired,
    linkAlignmentIsPolling: PropTypes.bool.isRequired,
    linkAlignmentDialogOpen: PropTypes.bool.isRequired,
    enableBoundlessConfig: PropTypes.bool.isRequired,
    enableWatchdogConfig: PropTypes.bool.isRequired,
    disableEthernetConfig: PropTypes.bool,
    setClusterInformation: PropTypes.func.isRequired,
    resetClusterInformation: PropTypes.func.isRequired,
    toggleAlignmentDialog: PropTypes.func.isRequired,
    setLinkAlignmentConfigProcessStatus: PropTypes.func.isRequired,
    disabled: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
    const {csrf, lang} = state.common;
    return {
        csrf,
        lang,
        linkAlignmentIsPolling: state.linkAlignment.isPolling,
        linkAlignmentDialogOpen: state.linkAlignment.open,
        enableBoundlessConfig: state.devMode.enableBoundlessConfig,
        enableWatchdogConfig: state.devMode.enableWatchdogConfig,
    };
}

export const ConnectConfigurationBox = compose(
    connect(mapStateToProps, {
        setTempNodeConfig,
        setClusterInformation,
        resetClusterInformation,
        toggleAlignmentDialog,
        setLinkAlignmentConfigProcessStatus,
        fetchConfig,
    }),
    withStyles(styles)
)(withRouter(NodeConfigurationBox));

const ConfigurationBox = (props) => {
    const {t, ready} = useTranslation('node-configuration');
    return !ready ?
        <span />
        : <ConnectConfigurationBox {...props} t={t} />;
};

export default ConfigurationBox;
