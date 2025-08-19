/**
 * @Author: mango
 * @Date:   2018-03-27T16:13:41+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-12-17T16:23:08+08:00
 */
import React from 'react';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {useTranslation, Trans} from 'react-i18next';
import Cookies from 'js-cookie';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import {withStyles, MuiThemeProvider} from '@material-ui/core/styles';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import IconButton from '@material-ui/core/IconButton';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import WarningIcon from '@material-ui/icons/Error';
import InputAdornment from '@material-ui/core/InputAdornment';
import SvgIcon from '@material-ui/core/SvgIcon';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import Icon from '@material-ui/core/Icon';
import Grid from '@material-ui/core/Grid';
import * as TabsModule from 'react-simpletabs';
import Constant from '../../../constants/common';
import HeaderApp from './meshHeader';
import {formValidator} from '../../../util/inputValidator';
import FormInputCreator from '../../../components/common/FormInputCreator';
import MeshSettingsApp from './meshSettings';
import SecuritySettings from './SecuritySettings';
import AdvancedSettings from './AdvancedSettings';
import P2Dialog from '../../../components/common/P2Dialog';
import LockLayer from '../../../components/common/LockLayer';
import {toggleSnackBar, updateProgressBar, toggleLockLayer, closeSnackbar} from '../../../redux/common/commonActions';
import {
    getNodeInfo,
    getCachedNodeInfo,
    getMeshTopology,
    getCachedMeshTopology,
    validateUserCredential
} from '../../../util/apiCall';

const Tabs = TabsModule.default;
const {themeObj, colors, timeout} = Constant;

const styles = theme => ({
    label: {
        fontSize: '14px',
    },
    tabIndent: {
        minWidth: '30px',
        maxWidth: '30px',
    },
    tabSpace: {
        maxWidth: '100%',
    },
    tabGridClass: {
        marginLeft: 0,
    },
    menuItemClass: theme.typography.title,
    itemMenuDivClass: {
        display: 'flex',
        alignItems: 'center',
    },
    itemMenuTxtClass: {
        fontSize: '14px',
        marginLeft: 6,
    },
    itemMenuSvgSubClass: {
        transform: 'translate(4px, 4px)',
        color: themeObj.mainBgColor,
    },
    itemMenuIconClass: {
        fontSize: 14,
    },
    svgIconStyle: {
        fontSize: '14px',
    },
    root: {
        flexGrow: 1,
    },
    mismatchButton: {
        color: 'white',
        backgroundColor: colors.mismatchLabel,
        textTransform: 'none',
        '&:hover': {
            backgroundColor: colors.inactiveRedHover,
        },
    },
});

const get = (o, p) =>
    p.reduce(
        (xs, x) =>
            ((xs && xs[x]) ?
                xs[x] : null), o);

function deleteKey(item, array) {
    const index = array.indexOf(item);
    if (index !== -1) array.splice(index, 1);
}

function getDiscrepancyEndKey(options, discrepancyObj) {
    for (let i = options.length - 1; i >= 0; i -= 1) {
        if (discrepancyObj[options[i]]) {
            return options[i];
        }
    }
    return options[options.length - 1];
}

const StyledTabs = styled(Tabs)`
    .tabs-navigation {
      padding: 0 30px;
      border-bottom: 1px solid ${props => props.theme.tabBorder};
    }
    .tabs-menu {
      display: table;
      list-style: none;
      padding: 0;
      margin: 0;
      font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    }
    .tabs-menu-item {
      float: left;
      cursor: pointer;
      max-height: 42px;
    }
    .tabs-menu-item a {
      display: block;
      padding: 0 20px;
      height: 40px;
      line-height: 40px;
      border-bottom: 0;
      color: ${props => props.theme.txt.halfOpa};
    }
    .tabs-menu-item:not(.is-active) a:hover {
      color: ${props => props.theme.primary.light};
    }
    .tabs-menu-item.is-active a {
      background: ${props => props.theme.mainBgColor};
      border: 1px solid ${props => props.theme.tabBorder};
      border-top: 3px solid ${props => props.theme.primary.main};
      border-bottom: 0;
      color: ${props => props.theme.primary.main};
      font-weight: bold;
    }
    .tabs-panel {
      display: none;
      padding: 30px;
    }
    .tabs-panel.is-active {
      display: block;
    }
    .tab-panel {
      height: calc(100vh - 48px - ${props => (props.hasMismatch ? '279px' : '189px')} - 43px);
      overflow-y: auto;
    }
`;

class MeshConfiguration extends React.Component {
    constructor(props) {
        super(props);

        const fnNames = [
            'getMeshTop',
            'getNodeInfo',
            'updateHostName',
            'updateDiscrepanciesDialog',
            'addDiscrepancies',
            'searchCountry',
            'createDiscrepancyItem',
            'searchBpduFilter',
            'setFilteredConfig',
            'handleDialogOnClose',
            'changeTab',
            'handleClickShowPasssword',
            'triggerFormStatus',
            'handleChange',
            'handleCountryDialogOnClose',
            'login',
            'enterToLogin',
            'checkIfAllNodesReachable'
        ];

        window.__.each(fnNames, (fnName) => {
            this[fnName] = this[fnName].bind(this);
        });

        this._toggleSnackBar = this.props._toggleSnackBar;
        this._closeSnackbar = this.props._closeSnackbar;
        this.t = this.props.t;

        this.state = {
            allNodesReachable: true,
            hostNodesReachable: true,
            discrepancies: [],
            formData: {
                password: '',
            },
            statusText: {
                password: '',
            },
            errorStatus: {
                password: false,
            },
            formStatus: {
                password: true,
            },
            showPassword: false,
            countryDialog: false,
            filteredConfig: {
                country: [{actualValue: '', displayValue: ''}],
                managementIp: '.',
                managementNetmask: '.',
                clusterId: '.',
                bpduFilter: {
                    type: '',
                    data: '',
                },
                e2eEnc: [{actualValue: '', displayValue: ''}],
                e2eEncKey: '.',
                globalTimezone: [{actualValue: '', displayValue: ''}],
            },
            dialog: {
                open: false,
                title: '',
                content: '',
                nonTextContent: <span />,
                submitTitle: '',
                submitFn: this.handleDialogOnClose,
                disableActionFn: false,
                cancelTitle: '',
                cancelFn: this.handleDialogOnClose,
                width: 'sm',
                dialogHelper: <span />,
            },
            tab: '',
            tabActive: 1,
            // disableSync: false,
        };
    }

    componentDidMount() {
        this.mounted = true;
        const meshConfigActiveTab = Cookies.get('meshConfigActiveTab');
        if (typeof meshConfigActiveTab === 'undefined') {
            Cookies.set('meshConfigActiveTab', 1);
        } else {
            this.changeTab(meshConfigActiveTab);
        }
        Cookies.remove('ClusterMaintenanceTab');
    }

    componentWillUnmount() {
        this.mounted = false;
        clearTimeout(this.timer);
    }

    setFilteredConfig(filteredConfig) {
        this.setState({
            ...this.state,
            filteredConfig,
        }, () => console.log('filterConfig: ', this.state.filteredConfig));
    }

    async checkIfAllNodesReachable(shouldLock = true) {
        const {csrf, projectId} = this.props;
    
        return new Promise(async (resolve, reject) => {
            try {
                if (shouldLock) {
                    this.meshHandleLock(true, false);
                }
    
                const res = await getCachedMeshTopology(csrf, projectId);
                console.log(res);
    
                let allNodesReachable = true;
                let hostNodesReachable = true;
    
                Object.keys(res).forEach((nodeIp) => {
                    if (!res[nodeIp].isReachable && res[nodeIp].isManaged) {
                        allNodesReachable = false;
                        if (res[nodeIp].isHostNode) {
                            hostNodesReachable = false;
                        }
                    }
                });
    
                this.setState({
                    ...this.state,
                    allNodesReachable,
                    hostNodesReachable,
                }, () => {
                    if (shouldLock) {
                        this.meshHandleLock(false, false);
                    }
                    resolve({ allNodesReachable, hostNodesReachable });
                });
            } catch (err) {
                console.log(err);
    
                this.setState({
                    ...this.state,
                    allNodesReachable: false,
                }, () => {
                    if (shouldLock) {
                        this.meshHandleLock(false, false);
                    }
                    resolve({ allNodesReachable: false, hostNodesReachable: false });
                });
            }
        });
    }
    

    async getMeshTop() {
        console.log('-----getMeshTop-----');
        try {
            const discrepanciesList = this.state.discrepancies;
            const meshTopoObj = await getCachedMeshTopology(this.props.csrf, this.props.projectId);
            if (this.mounted) {
                let hostNodeIp = '';
                Object.keys(meshTopoObj).some((nodeIp) => {
                    if (meshTopoObj[nodeIp].isHostNode) {
                        hostNodeIp = nodeIp;
                        return true;
                    }
                    return false;
                });

                const newDiscrepanciesList = discrepanciesList.map((discrepancy) => {
                    const newDiscrepancy = {...discrepancy};
                    if (newDiscrepancy.nodeIp === hostNodeIp) {
                        newDiscrepancy.hostNode = true;
                    }
                    return newDiscrepancy;
                });
                
                this.setState({
                    discrepancies: newDiscrepanciesList,
                }, () => {
                    this.getNodeInfo();
                });
            }
        } catch (err) {
            console.log('Get Cluster Topology Error');
            console.log(err);
            if (this.mounted) {
                this.updateDiscrepanciesDialog();
            }
        }
    }

    getNodeInfo() {
        getCachedNodeInfo(this.props.csrf, this.props.projectId, {allNodes: true})
        .then((managedDeviceInfo) => {
            if (this.mounted) {
                this.updateHostName(managedDeviceInfo);
            }
        }
        ).catch((error) => {
            if (this.mounted) {
                const partialManagedDeviceInfo = {};
                if (error.message === 'P2Error') {
                    const msg = error.data;
                    if (msg.type === 'specific') {
                        Object.keys(msg.data).forEach((key) => {
                            if (msg.data[key].success === true) {
                                partialManagedDeviceInfo[key] = msg.data[key].data;
                            }
                        }
                        );
                        this.updateHostName(partialManagedDeviceInfo);
                    } else if (this.mounted) {
                        this.updateDiscrepanciesDialog();
                    }
                }
            }
        });
    }

    updateHostName(DeviceInfo) {
        const newDiscrepanciesList = [];
        const discrepanciesList = [...this.state.discrepancies];

        discrepanciesList.forEach((discrepancy) => {
            const newDiscrepancy = {...discrepancy};
            Object.keys(DeviceInfo).forEach((nodeIp) => {
                if (newDiscrepancy.nodeIp === nodeIp) {
                    newDiscrepancy.hostname = DeviceInfo[nodeIp].hostname;
                }
            });
            newDiscrepanciesList.push(newDiscrepancy);
        });
        this.setState({
            discrepancies: newDiscrepanciesList,
        }, () => {
            this.updateDiscrepanciesDialog();
        });
    }

    handleCountryDialogOnClose() {
        this.setState({
            countryDialog: false,
            formData: {
                ...this.state.formData,
                password: '',
            },
            errorStatus: {
                ...this.state.errorStatus,
                password: false,
            },
            statusText: {
                ...this.state.statusText,
                password: this.t('inputObj.password.helperText'),
            },
            formStatus: {
                ...this.state.formStatus,
                password: true,
            },
            showPassword: false,
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
        const {formData} = this.state;
        const bodyMsg = {
            username: 'admin',
            password: formData.password,
        };
        try {
            const res = await validateUserCredential(csrf, bodyMsg);
            console.log(res);
            if (res.isValid) {
                if (this.state.tab === 'general') {
                    this.meshClickSync();
                } else if (this.state.tab === 'security') {
                    this.securityClickSync();
                } else if (this.state.tab === 'advanced') {
                    this.advancedClickSync();
                }
                this.handleCountryDialogOnClose();
            } else {
                this.triggerFormStatus('password', false, this.t('invalidPwdLbl'), formData.password);
            }
        } catch (err) {
            this.triggerFormStatus('password', false, this.t('runtimeErrLbl'), formData.password);
        }
    }

    handleChange(event) {
        const inputID = event.target.id || event.target.name;
        const inputValue = event.target.value;
        const {helperText} = this.t(`inputObj.${[inputID]}`);
        const regexPattern = /^[0-9a-zA-Z]{8,32}$/;

        let isValidObj = {};

        switch (inputID) {
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
            default:
                isValidObj = formValidator('isRequired', inputValue, null, helperText);
        }

        this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text, inputValue);
    }

    enterToLogin(event) {
        if (event.key === 'Enter') {
            this.login();
        }
    }

    updateDiscrepanciesDialog(onButtonClick = false) {
        if (this.state.allNodesReachable === false) {
            if (this.state.tab === 'general') {
                this.meshHandleLock(false, false);
            } else if (this.state.tab === 'security') {
                this.securityHandleLock(false, false);
            } else if (this.state.tab === 'advanced') {
                this.advancedHandleLock(false, false);
            }
            return;
        }
        console.log('-----updateDiscrepanciesDialog-----', this.state.discrepancies);
        const discrepancyObjects = this.state.discrepancies.filter(obj => (obj.discrepancies))
            .sort((a, b) => a.hostname - b.hostname);
        const discrepanciesTextContent = (
            <span>
                {/* <Typography style={{marginLeft: '10px', fontSize: '12px', color: themeObj.primary.light}}>
                    {this.t('discrepancyHelper')}
                </Typography> */}
                {/* {this.state.disableSync && <span style={{
                    display: 'flex',
                    alignItems: 'flexStart',
                    borderRadius: '5px',
                    backgroundColor: colors.warningBackground,
                    padding: '10px',
                    paddingTop: '15px',
                    paddingBottom: '15px',
                    paddingLeft: '23px',
                    margin: '0px 0px 15px 0px',
                }}
                >
                    <i
                        className="material-icons"
                        style={{
                            fontSize: '20px',
                            paddingRight: '16px',
                            color: colors.warningColor,
                        }}
                    >error</i>
                    <span style={{fontSize: 14, lineHeight: '140%', color: colors.warningColor}}>
                        <b>{this.props.t('discrepancyHelper')}</b>
                    </span>
                </span>} */}
                <span style={{marginBottom: '15px', display: 'block', fontSize: '17px'}}>
                    <Trans
                        defaults={this.t('discrepancyDialogContent1')}
                        components={{ bold: <strong /> }}
                    />
                </span>
                <span style={{display: 'flex', alignItems: 'flex-start', marginBottom: '15px'}}>
                    <i
                        style={{
                            fontSize: 14,
                            color: colors.activeGreen,
                            marginTop: '3px',
                            marginRight: '5px',
                        }}
                        className="material-icons"
                    >lens</i>
                    <span style={{
                        display: 'flex',
                        flexDirection: 'column',
                        fontSize: 14,
                        color: colors.activeGreen,
                        marginRight: '15px',
                        marginLeft: '5px',
                        alignItems: 'center',
                    }}
                    >
                        <span>{this.t('expectedConfigLbl')}</span>
                        <span style={{fontSize: 12}}>
                            {this.t('expectedConfigHostNodeLbl')}
                        </span>
                    </span>
                    <span
                        style={{
                            fontSize: 14,
                            color: colors.activeGreen,
                            marginRight: '5px',
                            marginLeft: '5px',
                        }}
                    >
                        #
                    </span>
                    <span style={{
                        display: 'flex',
                        flexDirection: 'column',
                        fontSize: 14,
                        color: colors.activeGreen,
                        marginRight: '15px',
                        marginLeft: '5px',
                        alignItems: 'center',
                    }}
                    >
                        {this.t('expectedConfigLbl')}
                        <span style={{fontSize: 12}}>
                            {this.t('expectedConfigCompatDefaultLbl')}
                        </span>
                    </span>
                    <i
                        style={{
                            fontSize: 14,
                            color: colors.inactiveRed,
                            marginTop: '3px',
                            marginRight: '5px',
                        }}
                        className="material-icons"
                    >lens</i>
                    <span style={{
                        fontSize: 14,
                        color: colors.inactiveRed,
                        marginRight: '10px',
                        marginLeft: '5px',
                    }}
                    >
                        {this.t('mismatchConfigLbl')}
                    </span>
                </span>
                <span>
                    {
                        this.state.discrepancies.map((discrepancy) => {
                            if (!discrepancy.discrepancies) {
                                console.warn(discrepancy)
                                return this.createDiscrepancyItem(discrepancy);
                            }
                            return (<span key={discrepancy.mac} />);
                        })
                    }
                </span>
                <span style={{maxHeight: '40vh', overflowY: 'auto', display: 'flex'}}>
                    <span
                        style={{
                            fontSize: 14,
                            marginBottom: '25px',
                            color: colors.discrepancyRow,
                            display: 'flex',
                            alignItems: 'flex-start',
                        }}
                    >
                        <i
                            style={{fontSize: 50, marginRight: 10, color: colors.inactiveRed}}
                            className="material-icons"
                        >
                            error
                        </i>
                    </span>
                    <span style={{display: 'flex', flexDirection: 'column', flex: 1}}>
                        <span style={{fontSize: '16px', color: colors.discrepancyRow}}>
                            {this.t('mismatchedConfig')}
                        </span>
                        <span style={{display: 'flex', marginTop: '5px', flexDirection: 'column'}}>
                            {
                                discrepancyObjects.map((discrepancy, index) => (
                                    <React.Fragment key={`discrepancy-${discrepancy.nodeIp}`}>
                                        {this.createDiscrepancyItem(discrepancy)}
                                        {discrepancyObjects.length - 1 !== index ?
                                            (<span
                                                style={{
                                                    width: '820px',
                                                    // marginTop: '10px',
                                                    borderBottom: `1px solid ${colors.footerTxt}`,
                                                    marginBottom: '5px',
                                                }}
                                            />) :
                                            <span />
                                        }
                                    </React.Fragment>
                                ))
                            }
                        </span>
                    </span>
                </span>
            </span>
        );

        const checkIfCountryExist = discrepancy => 'country' in discrepancy && discrepancy.discrepancies;
        // console.log('this.state.discrepancies: ', this.state.discrepancies);
        // console.log('country exist ', this.state.discrepancies.some(checkIfCountryExist));
        // console.log('has discrepancies');
        this.setState({
            ...this.state,
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('discrepancyDialogTitle'),
                content: discrepanciesTextContent,
                submitTitle: this.t('syncLbl'),
                submitFn: () => {
                    this.handleDialogOnClose();
                    if (this.state.discrepancies.some(checkIfCountryExist)) {
                        this.setState({
                            countryDialog: true,
                        });
                    } else if (this.state.tab === 'general') {
                        this.meshClickSync();
                    } else if (this.state.tab === 'security') {
                        this.securityClickSync();
                    } else if (this.state.tab === 'advanced') {
                        this.advancedClickSync();
                    }
                },
                cancelTitle: this.t('confirmCancelLbl'),
                cancelFn: () => {
                    this.handleDialogOnClose();
                },
                width: 'md',
                // dialogHelper: this.state.disableSync ? (
                //     // <Typography style={{marginLeft: '10px', fontSize: '12px', color: themeObj.primary.light}}>
                //     //     {this.t('discrepancyHelper')}
                //     // </Typography>
                //     <span style={{
                //         display: 'flex',
                //         alignItems: 'center',
                //         borderRadius: '5px',
                //         backgroundColor: colors.mismatchBackground,
                //         padding: '10px',
                //         paddingTop: '15px',
                //         paddingBottom: '15px',
                //         paddingLeft: '23px',
                //         // margin: '25px 0px',
                //     }}
                //     >
                //         <i
                //             className="material-icons"
                //             style={{
                //                 fontSize: '20px',
                //                 paddingRight: '16px',
                //                 color: colors.mismatchLabel,
                //             }}
                //         >error</i>
                //         <Typography style={{fontSize: 14, lineHeight: '140%', color: colors.mismatchLabel}}>
                //             <b>{this.props.t('discrepancyHelper')}</b>
                //         </Typography>
                //     </span>
                // ) : <span />,
            },
        }, () => {
            if (this.state.tab === 'general') {
                this.meshHandleLock(false, false);
            } else if (this.state.tab === 'security') {
                this.securityHandleLock(false, false);
            } else if (this.state.tab === 'advanced') {
                this.advancedHandleLock(false, false);
            }
        });
        console.log('-----_toggleSnackBar-----');
        if (!onButtonClick) {
            this._toggleSnackBar(this.t('retrieveMeshObjSuccessSnackbar'));
        }
        // hide the notification
        this.timer = setTimeout(() => {
            this._closeSnackbar();
        }, timeout.success);
    }

    handleDialogOnClose() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: false,
            },
        });
    }

    changeTab(tabActive) {
        this.setState({
            ...this.state,
            tabActive: parseInt(tabActive, 10),
        });
    }

    /**
     * Display expected configuration data block in 
     * configuration mismatch preview dialog
     * 
     * @param {object} discrepancy 
     * @returns 
     */
    createDiscrepancyItem(discrepancy) {
        console.warn(discrepancy)
        const color = discrepancy.discrepancies ? colors.inactiveRed : colors.activeGreen;
        const icon = discrepancy.discrepancies ? 'error' : 'check_circle';
        const hostNode = !discrepancy.hostNode ? '' : (<span>, <b>{this.t('hostNodeLbl')}</b></span>);
        const isLegacy = discrepancy.isLegacy || {};
        const hostNameMac = !discrepancy.discrepancies ? (
            <span key={discrepancy.hostname} style={{fontSize: 15, paddingBottom: '5px'}}>
                {this.t('expectedConfigLbl')}
            </span>
        ) :
            (
                <span key={discrepancy.hostname} style={{fontSize: 15, paddingBottom: '5px'}}>
                    {discrepancy.hostname} ({discrepancy.mac}){hostNode}
                </span>
            );
        const discrepancyKey = Object.keys(discrepancy);
        deleteKey('nodeIp', discrepancyKey);
        deleteKey('discrepancies', discrepancyKey);
        deleteKey('mac', discrepancyKey);
        deleteKey('hostname', discrepancyKey);
        deleteKey('hostNode', discrepancyKey);
        deleteKey('isLegacy', discrepancyKey);
        // discrepancyKey.sort();
        const generalSettings = Constant.clusterConfigOptions.generalSettings.map((key) => {
            const discrepancyEndKey = getDiscrepancyEndKey(Constant.clusterConfigOptions.generalSettings, discrepancy);
            let displayValue = discrepancy[key];
            if (key === 'country') {
                displayValue = this.searchCountry(discrepancy[key]);
            } else if (key === 'globalTimezone') {
                displayValue = this.searchGlobalTimezone(discrepancy[key]);
            }
            return discrepancy[key] && (
                <span
                    key={`${key}_${discrepancy[key]}`}
                    style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
                >
                    {this.t(key)} <span style={{color, display: 'flex', paddingLeft: '5px'}}>
                        {displayValue}
                        {get(isLegacy, [key]) && (
                            <span style={{fontSize: '10px'}}>
                                #
                            </span>
                        )}
                    </span>{key !== discrepancyEndKey ? ' , ' : ''}
                </span>
            );
        });
        const securitySettings = Constant.clusterConfigOptions.securitySettings.map((key) => {
            const discrepancyEndKey = getDiscrepancyEndKey(Constant.clusterConfigOptions.securitySettings, discrepancy);
            let displayValue = discrepancy[key];
            if (key === 'e2eEnc') {
                displayValue = this.searchE2EEnc(discrepancy[key]);
            } else if (key === 'e2eEncKey') {
                displayValue = discrepancy[key] === 'notSupported' ?
                    this.t('notAvailableLbl') : (() => {
                        if (get(discrepancy, ['e2eEnc'])) {
                            const encValue = get(discrepancy, ['e2eEnc']);
                            return this.searchE2EEnc(encValue) === '-' ?
                                '-' : discrepancy[key];
                        }
                        return discrepancy[key];
                    }
                    )();
            }
            return discrepancy[key] && (
                <span
                    key={`${key}_${discrepancy[key]}`}
                    style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
                >
                    {this.t(key)} <span style={{color, display: 'flex', paddingLeft: '5px'}}>
                        {displayValue}
                        {get(isLegacy, [key]) && (
                            <span style={{fontSize: '10px'}}>
                                #
                            </span>
                        )}
                    </span>{key !== discrepancyEndKey ? ' , ' : ''}
                </span>
            );
        });
        const advancedSettings = Constant.clusterConfigOptions.advancedSettings.map((key) => {
            const discrepancyEndKey = getDiscrepancyEndKey(Constant.clusterConfigOptions.advancedSettings, discrepancy);
            let displayValue = discrepancy[key];
            if (key === 'bpduFilter') {
                displayValue = this.searchBpduFilter(discrepancy[key]);
            }
            return discrepancy[key] && (
                <span
                    key={`${key}_${discrepancy[key]}`}
                    style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
                >
                    {this.t(key)} <span style={{color, display: 'flex', paddingLeft: '5px'}}>
                        {displayValue}
                        {get(isLegacy, [key]) && (
                            <span style={{fontSize: '10px'}}>
                                #
                            </span>
                        )}
                    </span>{key !== discrepancyEndKey ? ' , ' : ''}
                </span>
            );
        });
        // const discrepancyDetail = discrepancyKey.map(
        //     (key, i, a) => {
        //         if (key === 'clusterId') {
        //             return discrepancy[key] && (
        //                 <span
        //                     key={`${key}_${discrepancy[key]}`}
        //                     style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
        //                 >
        //                     {this.t('clusterIDLbl')} <span style={{color, display: 'flex', paddingLeft: '5px'}}>
        //                         {discrepancy[key]}
        //                         {get(isLegacy, [key]) && (
        //                             <span style={{fontSize: '10px'}}>
        //                                 #
        //                             </span>
        //                         )}
        //                     </span>{i !== (a.length - 1) ? ' , ' : ''}
        //                 </span>
        //             );
        //         } else if (key === 'managementIp') {
        //             return discrepancy[key] && (
        //                 <span
        //                     key={`${key}_${discrepancy[key]}`}
        //                     style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
        //                 >
        //                     {this.t('mgmtIPLbl')} <span style={{color, display: 'flex', paddingLeft: '5px'}}>
        //                         {discrepancy[key]}
        //                         {get(isLegacy, [key]) && (
        //                             <span style={{fontSize: '10px'}}>
        //                                 #
        //                             </span>
        //                         )}
        //                     </span>{i !== (a.length - 1) ? ' , ' : ''}
        //                 </span>
        //             );
        //         } else if (key === 'managementNetmask') {
        //             return discrepancy[key] && (
        //                 <span
        //                     key={`${key}_${discrepancy[key]}`}
        //                     style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
        //                 >
        //                     {this.t('mgmtNtmskLbl')} <span style={{color, display: 'flex', paddingLeft: '5px'}}>
        //                         {discrepancy[key]}
        //                         {get(isLegacy, [key]) && (
        //                             <span style={{fontSize: '10px'}}>
        //                                 #
        //                             </span>
        //                         )}
        //                     </span>{i !== (a.length - 1) ? ' , ' : ''}
        //                 </span>
        //             );
        //         } else if (key === 'country') {
        //             return discrepancy[key] && (
        //                 <span
        //                     key={`${key}_${discrepancy[key]}`}
        //                     style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
        //                 >
        //                     {this.t('countryLbl')} <span style={{color, display: 'flex', paddingLeft: '5px'}}>
        //                         {this.searchCountry(discrepancy[key])}
        //                         {get(isLegacy, [key]) && (
        //                             <span style={{fontSize: '10px'}}>
        //                                 #
        //                             </span>
        //                         )}
        //                     </span>{i !== (a.length - 1) ? ' , ' : ''}
        //                 </span>
        //             );
        //         } else if (key === 'encKey') {
        //             return discrepancy[key] && (
        //                 <span
        //                     key={`${key}_${discrepancy[key]}`}
        //                     style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
        //                 >
        //                     {this.t('encKeyLbl')} <span style={{color, display: 'flex', paddingLeft: '5px'}}>
        //                         {discrepancy[key]}
        //                         {get(isLegacy, [key]) && (
        //                             <span style={{fontSize: '10px'}}>
        //                                 #
        //                             </span>
        //                         )}
        //                     </span>{i !== (a.length - 1) ? ' , ' : ''}
        //                 </span>
        //             );
        //         } else if (key === 'bpduFilter') {
        //             return discrepancy[key] && (
        //                 <span
        //                     key={`${key}_${discrepancy[key]}`}
        //                     style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
        //                 >
        //                     {this.t('bpduFilterLbl')} <span style={{color, display: 'flex', paddingLeft: '5px'}}>
        //                         {this.searchBpduFilter(discrepancy[key])}
        //                         {get(isLegacy, [key]) && (
        //                             <span style={{fontSize: '10px'}}>
        //                                 #
        //                             </span>
        //                         )}
        //                     </span>{i !== (a.length - 1) ? ' , ' : ''}
        //                 </span>
        //             );
        //         } else if (key === 'e2eEnc') {
        //             return discrepancy[key] && (
        //                 <span
        //                     key={`${key}_${discrepancy[key]}`}
        //                     style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
        //                 >
        //                     {this.t('e2eEncLbl')} <span style={{color, display: 'flex', paddingLeft: '5px'}}>
        //                         {this.searchE2EEnc(discrepancy[key])}
        //                         {get(isLegacy, [key]) && (
        //                             <span style={{fontSize: '10px'}}>
        //                                 #
        //                             </span>
        //                         )}
        //                     </span>{i !== (a.length - 1) ? ' , ' : ''}
        //                 </span>
        //             );
        //         } else if (key === 'e2eEncKey') {
        //             return discrepancy[key] && (
        //                 <span
        //                     key={`${key}_${discrepancy[key]}`}
        //                     style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
        //                 >
        //                     {this.t('e2eEncKeyLbl')} <span style={{color, display: 'flex', paddingLeft: '5px'}}>
        //                         {discrepancy[key] === 'notSupported' ?
        //                             this.t('notAvailableLbl') : (() => {
        //                                 if (get(discrepancy, ['e2eEnc'])) {
        //                                     const encValue = get(discrepancy, ['e2eEnc']);
        //                                     return this.searchE2EEnc(encValue) === 'N/A' ?
        //                                         'N/A' : discrepancy[key];
        //                                 }
        //                                 return discrepancy[key];
        //                             }
        //                             )()}
        //                         {get(isLegacy, [key]) && (
        //                             <span style={{fontSize: '10px'}}>
        //                                 #
        //                             </span>
        //                         )}
        //                     </span>{i !== (a.length - 1) ? ' , ' : ''}
        //                 </span>
        //             );
        //         } else if (key === 'globalDiscoveryInterval') {
        //             return discrepancy[key] && (
        //                 <span
        //                     key={`${key}_${discrepancy[key]}`}
        //                     style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
        //                 >
        //                     globalDiscoveryInterval <span style={{color, display: 'flex', paddingLeft: '5px'}}>
        //                         {discrepancy[key] === 'notSupported' ?
        //                             this.t('notAvailableLbl') : (() => {
        //                                 if (get(discrepancy, ['globalDiscoveryInterval'])) {
        //                                     const globalDiscoveryInterval = get(discrepancy,
        //                                         ['globalDiscoveryInterval']);
        //                                     return globalDiscoveryInterval;
        //                                 }
        //                                 return discrepancy[key];
        //                             }
        //                             )()}
        //                         {get(isLegacy, [key]) && (
        //                             <span style={{fontSize: '10px'}}>
        //                                 #
        //                             </span>
        //                         )}
        //                     </span>{i !== (a.length - 1) ? ' , ' : ''}
        //                 </span>
        //             );
        //         } else if (key === 'globalHeartbeatInterval') {
        //             return discrepancy[key] && (
        //                 <span
        //                     key={`${key}_${discrepancy[key]}`}
        //                     style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
        //                 >
        //                     globalHeartbeatInterval <span style={{color, display: 'flex', paddingLeft: '5px'}}>
        //                         {discrepancy[key] === 'notSupported' ?
        //                             this.t('notAvailableLbl') : (() => {
        //                                 if (get(discrepancy, ['globalHeartbeatInterval'])) {
        //                                     const globalHeartbeatInterval = get(discrepancy,
        //                                         ['globalHeartbeatInterval']);
        //                                     return globalHeartbeatInterval;
        //                                 }
        //                                 return discrepancy[key];
        //                             }
        //                             )()}
        //                         {get(isLegacy, [key]) && (
        //                             <span style={{fontSize: '10px'}}>
        //                                 #
        //                             </span>
        //                         )}
        //                     </span>{i !== (a.length - 1) ? ' , ' : ''}
        //                 </span>
        //             );
        //         } else if (key === 'globalHeartbeatTimeout') {
        //             return discrepancy[key] && (
        //                 <span
        //                     key={`${key}_${discrepancy[key]}`}
        //                     style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
        //                 >
        //                     globalHeartbeatTimeout <span style={{color, display: 'flex', paddingLeft: '5px'}}>
        //                         {discrepancy[key] === 'notSupported' ?
        //                             this.t('notAvailableLbl') : (() => {
        //                                 if (get(discrepancy, ['globalHeartbeatTimeout'])) {
        //                                     const globalHeartbeatTimeout = get(discrepancy,
        //                                         ['globalHeartbeatTimeout']);
        //                                     return globalHeartbeatTimeout;
        //                                 }
        //                                 return discrepancy[key];
        //                             }
        //                             )()}
        //                         {get(isLegacy, [key]) && (
        //                             <span style={{fontSize: '10px'}}>
        //                                 #
        //                             </span>
        //                         )}
        //                     </span>{i !== (a.length - 1) ? ' , ' : ''}
        //                 </span>
        //             );
        //         } else if (key === 'globalStaleTimeout') {
        //             return discrepancy[key] && (
        //                 <span
        //                     key={`${key}_${discrepancy[key]}`}
        //                     style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
        //                 >
        //                     globalStaleTimeout <span style={{color, display: 'flex', paddingLeft: '5px'}}>
        //                         {discrepancy[key] === 'notSupported' ?
        //                             this.t('notAvailableLbl') : (() => {
        //                                 if (get(discrepancy, ['globalStaleTimeout'])) {
        //                                     const globalStaleTimeout = get(discrepancy,
        //                                         ['globalStaleTimeout']);
        //                                     return globalStaleTimeout;
        //                                 }
        //                                 return discrepancy[key];
        //                             }
        //                             )()}
        //                         {get(isLegacy, [key]) && (
        //                             <span style={{fontSize: '10px'}}>
        //                                 #
        //                             </span>
        //                         )}
        //                     </span>{i !== (a.length - 1) ? ' , ' : ''}
        //                 </span>
        //             );
        //         } else if (key === 'globalRoamingRSSIMargin') {
        //             return discrepancy[key] && (
        //                 <span
        //                     key={`${key}_${discrepancy[key]}`}
        //                     style={{display: 'flex', flexWrap: 'nowrap', paddingRight: '5px'}}
        //                 >
        //                     globalRoamingRSSIMargin <span style={{color, display: 'flex', paddingLeft: '5px'}}>
        //                         {discrepancy[key] === 'notSupported' ?
        //                             this.t('notAvailableLbl') : (() => {
        //                                 if (get(discrepancy, ['globalRoamingRSSIMargin'])) {
        //                                     const globalRoamingRSSIMargin = get(discrepancy,
        //                                         ['globalRoamingRSSIMargin']);
        //                                     return globalRoamingRSSIMargin;
        //                                 }
        //                                 return discrepancy[key];
        //                             }
        //                             )()}
        //                         {get(isLegacy, [key]) && (
        //                             <span style={{fontSize: '10px'}}>
        //                                 #
        //                             </span>
        //                         )}
        //                     </span>{i !== (a.length - 1) ? ' , ' : ''}
        //                 </span>
        //             );
        //         }
        //         return (
        //             <span key={discrepancy[key]} />
        //         );
        //     });
        console.log('discrepancyRow', discrepancy);
        console.log('discrepancyRow(mac)', discrepancy.mac);
        console.log('generalSettings, securitySettings, advancedSettings: ',
            generalSettings, securitySettings, advancedSettings);
        const discrepancyRow = (
            <span
                key={discrepancy.mac}
                style={{
                    fontSize: 13,
                    color: colors.discrepancyRow,
                    display: 'flex',
                    alignItems: 'flex-start',
                    paddingTop: '15px',
                    paddingBottom: '15px',
                }}
            >
                {!discrepancy.discrepancies ? 
                    <i style={{fontSize: 50, marginRight: 10, color}}
                        className="material-icons"
                    >{icon}
                    </i> : <span />
                }
                <span style={{display: 'flex', flexDirection: 'column'}}>
                    {hostNameMac}
                    <span
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            marginTop: !discrepancy.discrepancies ? '5px' : '',
                            // paddingTop: discrepancy.discrepancies ?
                            //     '10px' : '',
                        }}
                    >
                        {/* {discrepancyDetail} */}
                        <span style={{display: 'flex', flexDirection: 'column'}}>
                            {!generalSettings.every(value => typeof value === 'undefined') ?
                                (<span style={{display: 'flex', flexDirection: 'column', paddingBottom: '15px'}}>
                                    <span style={{display: 'block', textDecoration: 'underline', paddingBottom: '5px'}}>
                                        {this.t('generalSettings')}
                                    </span>
                                    <span style={{display: 'flex', flexWrap: 'wrap'}}>
                                        {generalSettings}
                                    </span>
                                </span>) : <span />
                            }
                            {!securitySettings.every(value => typeof value === 'undefined') ?
                                (<span style={{display: 'flex', flexDirection: 'column', paddingBottom: '15px'}}>
                                    <span style={{display: 'block', textDecoration: 'underline', paddingBottom: '5px'}}>
                                        {this.t('securitySettings')}
                                    </span>
                                    <span style={{display: 'flex', flexWrap: 'wrap'}}>
                                        {securitySettings}
                                    </span>
                                </span>) : <span />
                            }
                            {!advancedSettings.every(value => typeof value === 'undefined') ?
                                (<span style={{display: 'flex', flexDirection: 'column', paddingBottom: '15px'}}>
                                    <span style={{display: 'block', textDecoration: 'underline', paddingBottom: '5px'}}>
                                        {this.t('advancedSettings')}
                                    </span>
                                    <span style={{display: 'flex', flexWrap: 'wrap'}}>
                                        {advancedSettings}
                                    </span>
                                </span>) : <span />
                            }
                        </span>
                    </span>
                </span>
            </span>
        );
        return discrepancyRow;
    }

    searchCountry(actualValue) {
        const countryList = [...this.state.filteredConfig.country];
        let result = '-';
        countryList.some((countryObj) => {
            if (countryObj.actualValue === actualValue) {
                result = countryObj.displayValue;
                return true;
            }
            return false;
        });
        if (actualValue === 'DB') {
            return 'Debug';
        }
        return result;
    }

    searchGlobalTimezone(actualValue) {
        console.log('kyle_debug: searchGlobalTimezone -> actualValue', actualValue);
        const globalTimezoneList = [...this.state.filteredConfig.globalTimezone];
        console.log('kyle_debug: searchGlobalTimezone -> globalTimezoneList', globalTimezoneList);
        let result = 'N/A';
        globalTimezoneList.some((globalTimezoneObj) => {
            if (globalTimezoneObj.actualValue === actualValue) {
                result = globalTimezoneObj.displayValue;
                return true;
            }
            return false;
        });
        console.log('kyle_debug: searchGlobalTimezone -> result', result);
        return result;
    }

    searchBpduFilter(actualValue) {
        const bpduFilterList = {...this.state.filteredConfig.bpduFilter};
        console.log('searchBpduFilter:', actualValue);
        let result = '';
        if (actualValue === 'notSupported') {
            result = this.t('notAvailableLbl');
        } else if (bpduFilterList.type === 'enum') {
            bpduFilterList.data.some((bpduFilterObj) => {
                if (bpduFilterObj.actualValue === actualValue) {
                    result = bpduFilterObj.displayValue;
                    return true;
                }
                return false;
            });
        }
        if (result === '') {
            result = this.t('notAvailableLbl');
        }
        console.log('result:', result);
        return result;
    }

    searchE2EEnc(actualValue) {
        const e2eEncList = [...this.state.filteredConfig.e2eEnc];
        console.log('searchE2EEnc:', actualValue);
        let result = '';
        if (actualValue === 'notSupported') {
            result = this.t('notAvailableLbl');
        } else {
            e2eEncList.some((e2eEncObj) => {
                if (e2eEncObj.actualValue === actualValue) {
                    result = e2eEncObj.displayValue;
                    return true;
                }
                return false;
            });
        }
        if (result === '') {
            result = this.t('notAvailableLbl');
        }
        return result;
    }

    addDiscrepancies(discrepancies, tab) {
        console.log('-----addDiscrepancies-----');
        this.setState({
            discrepancies,
            tab,
        }, () => {
            this.getMeshTop();
        });
    }

    render() {
        const {
            display,
            _updateLock,
            _updateProgressBar,
            classes,
        } = this.props;
        const {
            tabActive, formData, formStatus, countryDialog,
            statusText, errorStatus, showPassword,
        } = this.state;
        const {theme} = Constant;
        const loaderAct = (loading) => {
            _updateLock(loading);
            _updateProgressBar(loading);
        };


        const passwordDisabled = !formStatus.password;
        let isEnterToLogin = function () { return false; };
        if (!passwordDisabled) {
            isEnterToLogin = this.enterToLogin;
        }


        const TabItemComponent = (someProps) => {
            const {
                viewBox,
                titleTxt,
                dArr,
                ligature,
            } = someProps;
            const RenderIcon = !ligature ? (
                <SvgIcon
                    viewBox={viewBox}
                    classes={{root: classes.svgIconStyle}}
                >
                    {
                        dArr.map((d, idx) => (
                            <path
                                className={idx > 0 ? classes.itemMenuSvgSubClass : ''}
                                d={d.d}
                                key={`tabItemSvg_${d.key}`}
                            />
                        ))
                    }
                </SvgIcon>
            ) : (
                <Icon className={classes.itemMenuIconClass}>{ligature}</Icon>
            );
            return (
                <div className={classes.itemMenuDivClass}>
                    {RenderIcon}
                    <span className={classes.itemMenuTxtClass}>{titleTxt}</span>
                </div>
            );
        };

        const tabContent = [
            <MeshSettingsApp
                isAllNodesReachable={this.state.allNodesReachable}
                checkIfAllNodesReachable={this.checkIfAllNodesReachable}
                onLoadingAct={loaderAct}
                addDiscrepancies={this.addDiscrepancies}
                setFilteredConfig={this.setFilteredConfig}
                handleLock={(lock) => { this.meshHandleLock = lock; }}
                handleSync={(sync) => { this.meshClickSync = sync; }}
                t={(tKey, options) => this.props.t(`cluster-configuration:${tKey}`, {...this.props.labels, ...options})}
            />,
            <SecuritySettings
                isAllNodesReachable={this.state.allNodesReachable}
                checkIfAllNodesReachable={this.checkIfAllNodesReachable}
                onLoadingAct={loaderAct}
                addDiscrepancies={this.addDiscrepancies}
                setFilteredConfig={this.setFilteredConfig}
                handleLock={(lock) => { this.securityHandleLock = lock; }}
                handleSync={(sync) => { this.securityClickSync = sync; }}
                t={(tKey, options) => this.props.t(`cluster-configuration-security-settings:${tKey}`, {...this.props.labels, ...options})}
            />,
            <AdvancedSettings
                isAllNodesReachable={this.state.allNodesReachable}
                checkIfAllNodesReachable={this.checkIfAllNodesReachable}
                onLoadingAct={loaderAct}
                addDiscrepancies={this.addDiscrepancies}
                setFilteredConfig={this.setFilteredConfig}
                handleLock={(lock) => { this.advancedHandleLock = lock; }}
                handleSync={(sync) => { this.advancedClickSync = sync; }}
                t={(tKey, options) => this.props.t(`cluster-configuration-advanced-settings:${tKey}`, {...this.props.labels, ...options})}
            />,
        ];

        const mismatchBanner = this.state.discrepancies.length > 0 && this.state.allNodesReachable ? (
            <span style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '5px',
                backgroundColor: colors.mismatchBackground,
                padding: '10px',
                paddingTop: '15px',
                paddingBottom: '15px',
                paddingLeft: '23px',
                margin: '15px',
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
                    <b>{this.props.t('mismatchConfigTitle')}</b>
                </Typography>
                <div style={{
                    marginLeft: 'auto',
                }}
                >
                    <Button
                        variant="contained"
                        classes={{
                            root: classes.mismatchButton,
                        }}
                        size="small"
                        style={{
                            marginRight: '23px',
                            paddingRight: '20px',
                            paddingLeft: '20px',
                        }}
                        onClick={() => this.updateDiscrepanciesDialog(true)}
                    >
                        {this.props.t('mismatchConfigBtnLbl')}
                    </Button>
                </div>
            </span>
        ) : (<span />);

        const nodeUnreachableBanner = !this.state.allNodesReachable ? (
            <span style={{
                display: 'flex',
                alignItems: 'center',
                borderRadius: '5px',
                backgroundColor: colors.nodeUnreachableBackground,
                padding: '10px',
                paddingTop: '15px',
                paddingBottom: '15px',
                paddingLeft: '23px',
                margin: '15px',
            }}
            >
                <i
                    className="material-icons"
                    style={{
                        fontSize: '20px',
                        paddingRight: '16px',
                        color: colors.nodeUnreachableLabel,
                    }}
                >error</i>
                <Typography style={{fontSize: 14, lineHeight: '140%', color: colors.nodeUnreachableLabel}}>
                    <b>{this.props.t('nodeUnreachableTitle')}</b>
                </Typography>
            </span>
        ) : (<span />);

        const TabPanels = [
            {
                id: 0,
                title: this.t('generalTabTitle'),
                ligature: 'settings',
                dArr: [],
            },
            {
                id: 1,
                title: this.t('securityTabTitle'),
                ligature: 'verified_user',
                dArr: [],
            },
            {
                id: 2,
                title: this.t('advancedTabTitle'),
                ligature: 'build',
                dArr: [],
            },
        ].map((tabItem) => {
            const someProps = {
                viewBox: '0 0 20 20',
                dArr: tabItem.dArr,
                titleTxt: tabItem.title,
                ligature: tabItem.ligature,
            };
            return (
                <Tabs.Panel
                    title={<TabItemComponent {...someProps} />}
                    key={`tabData_${tabItem.id}`}
                >
                    {tabContent[tabItem.id]}
                </Tabs.Panel>
            );
        });

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
                    autoFocus={false}
                    margin="dense"
                    onKeyPressField={isEnterToLogin}
                    helperText={statusText.password}
                    inputType="password"
                    endAdornment={eyeIconButton}
                    showPassword={showPassword}
                />
            </React.Fragment>
        );

        const submitFn = () => {
            console.log('Accept');
            this.login();
        };

        const cancelFn = () => {
            console.log('Cancel');
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

        return (
            <MuiThemeProvider theme={theme}>
                <Grid
                container
                style={{
                    flexGrow: 1,
                    flexDirection: 'column',
                    marginLeft: 0,
                    paddingLeft: 0,
                    background: colors.background,
                }}
                >
                    <HeaderApp />
                    {mismatchBanner}
                    {nodeUnreachableBanner}
                    {
                        Object.keys(this.props.projectIdList).length > 0 ?
                            <Grid container className={classes.root}>
                                <Grid className={classes.tabGridClass} item xs={12} lg={12} xl={12}>
                                    {/* Note that subsequent components should override the typography changes */}
                                    <StyledTabs
                                        theme={themeObj}
                                        className={classes.menuItemClass}
                                        tabActive={tabActive}
                                        hasMismatch={this.state.discrepancies.length > 0}
                                        onAfterChange={(selectedIndex) => {
                                            Cookies.set('meshConfigActiveTab', selectedIndex);
                                        }}
                                    >
                                        {TabPanels}
                                    </StyledTabs>
                                </Grid>
                            </Grid> : <div />
                    }
                    <P2Dialog
                        open={this.state.dialog.open}
                        handleClose={this.handleDialogOnClose}
                        title={this.state.dialog.title}
                        content={this.state.dialog.content}
                        nonTextContent={this.state.dialog.nonTextContent}
                        actionTitle={this.state.dialog.submitTitle}
                        actionFn={this.state.dialog.submitFn}
                        diableActionFn={this.state.dialog.disableActionFn}
                        cancelActTitle={this.state.dialog.cancelTitle}
                        cancelActFn={this.state.dialog.cancelFn}
                        maxWidth={this.state.dialog.width}
                        dialogHelper={this.state.dialog.dialogHelper}
                    />
                    {changeCountryDialog}
                    <LockLayer
                        display={display}
                    />
                </Grid>
            </MuiThemeProvider>
        );
    }
}

function mapStateToProps(state) {
    return {
        display: state.common.lock,
        labels: state.common.labels,
        csrf: state.common.csrf,
        projectIdList: state.projectManagement.projectList,
        projectId: state.projectManagement.projectId,
    };
}

function mapDispatchToProps(dispatch) {
    return {
        _updateLock: (open) => {
            dispatch(toggleLockLayer(open));
        },
        _updateProgressBar: (open) => {
            dispatch(updateProgressBar(open));
        },
        _toggleSnackBar: (messages) => {
            dispatch(toggleSnackBar(messages));
        },
        _closeSnackbar: () => {
            dispatch(closeSnackbar());
        },
    };
}

MeshConfiguration.propTypes = {
    csrf: PropTypes.string.isRequired,
    display: PropTypes.bool,
    _updateLock: PropTypes.func,
    _updateProgressBar: PropTypes.func.isRequired,
    _toggleSnackBar: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    classes: PropTypes.object,// eslint-disable-line
    projectIdList: PropTypes.object.isRequired,// eslint-disable-line
    projectId: PropTypes.string.isRequired,
};

MeshConfiguration.defaultProps = {
    display: false,
    _updateLock: () => true,
};

export const ConnectedMeshConfiguration = connect(
    mapStateToProps,
    mapDispatchToProps
)(MeshConfiguration);

export const ExportMeshConfiguration = compose(
    connect(mapStateToProps, mapDispatchToProps),
    withStyles(styles, {withTheme: true}),
)(MeshConfiguration);

const ConfigMain = (props) => {
    const {t, ready} = useTranslation([
        'cluster-configuration',
        'cluster-configuration-security-settings',
        'cluster-configuration-advanced-settings',
    ]);
    return !ready ?
        <Grid
            container
            style={{
                flexGrow: 1,
                marginLeft: 0,
                paddingLeft: 0,
                background: colors.background,
            }}
        />
        : <ExportMeshConfiguration {...props} t={t} />;
};

export default ConfigMain;
