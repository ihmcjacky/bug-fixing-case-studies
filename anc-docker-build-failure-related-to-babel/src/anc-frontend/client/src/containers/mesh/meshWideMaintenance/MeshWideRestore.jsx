/**
 * @Author: mango
 * @Date:   2018-06-19T16:34:42+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-12-13T15:32:50+08:00
 */
import React from 'react';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {useTranslation, Trans} from 'react-i18next';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import Cookies from 'js-cookie';
import {withStyles} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
// import TextField from '@material-ui/core/TextField';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
// import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import InputAdornment from '@material-ui/core/InputAdornment';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import WarningIcon from '@material-ui/icons/Error';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import {Typography} from '@material-ui/core';
import {formValidator} from '../../../util/inputValidator';
import {toggleSnackBar, closeSnackbar} from '../../../redux/common/commonActions';
import P2PointsToNote from '../../../components/nodeMaintenances/P2PointsToNote';
import {convertIpToMac} from '../../../util/formatConvertor';
import FormInputCreator from '../../../components/common/FormInputCreator';
import P2DevTbl from '../../../components/common/P2DevTbl';
import {
    getCachedMeshTopology, getCachedNodeInfo,
    getConfig, setConfig, validateUserCredential, getFilteredConfigOptions,
} from '../../../util/apiCall';
import P2Dialog from '../../../components/common/P2Dialog';
import P2Tooltip from '../../../components/common/P2Tooltip';
import LockLayer from '../../../components/common/LockLayer';
import P2FileUpload from '../../../components/common/P2FileUpload';
import Constant from '../../../constants/common';
import isMismatchSecret, {isUnreachedNode} from '../../../util/common';
import check from '../../../util/errorValidator';
import InvalidConfigContainer from '../../../components/common/InvalidConfigContainer';
import {openDeviceListDialog} from '../../../redux/common/commonActions';

const {
    colors, timeout, theme, themeObj,
} = Constant;

function getOptionsFromGetConfigObj(Config) {
    let options = {};
    if (Config.meshSettings) {
        options.meshSettings = Object.keys(Config.meshSettings)
        .filter(key => key !== 'encType' && key !== 'rtscts' && key !== 'discrepancies')
    }
    if (Config.nodeSettings) {
        options.nodeSettings = {};
        Object.keys(Config.nodeSettings).forEach((nodeIp) => {
            options.nodeSettings[nodeIp] = Object.keys(Config.nodeSettings[nodeIp]).filter(key => key !== 'acl');
        });
    }
    if (Config.radioSettings) {
        options.radioSettings = {};

        Object.keys(Config.radioSettings).forEach((nodeIp) => {
            options.radioSettings[nodeIp] = {};
            Object.keys(Config.radioSettings[nodeIp]).forEach((radioName) => {
                options.radioSettings[nodeIp][radioName] = Object.keys(Config.radioSettings[nodeIp][radioName])
                    .filter(key => key !== 'acl');
            });
        });
    }
    if (Config.ethernetSettings) {
        options.ethernetSettings = {};

        Object.keys(Config.ethernetSettings).forEach((nodeIp) => {
            options.ethernetSettings[nodeIp] = {};
            Object.keys(Config.ethernetSettings[nodeIp]).forEach((ethName) => {
                options.ethernetSettings[nodeIp][ethName] = Object.keys(Config.ethernetSettings[nodeIp][ethName]);
            });
        });
    }
    if (Config.profileSettings) {
        options.profileSettings = {};

        Object.keys(Config.profileSettings).forEach((nodeIp) => {
            options.profileSettings[nodeIp] = {};
            Object.keys(Config.profileSettings[nodeIp]).forEach((profileOpt) => {
                options.profileSettings[nodeIp][profileOpt] = {};
                Object.keys(Config.profileSettings[nodeIp][profileOpt]).forEach((profileId) => {
                    options.profileSettings[nodeIp][profileOpt][profileId] =
                    Object.keys(Config.profileSettings[nodeIp][profileOpt][profileId]);
                });
            });
        });
    }
    return options;
}

const styles = {
    breakthroughLine: {
        width: '100%',
        textAlign: 'center',
        position: 'relative !important',
        zIndex: '1 !important',
    },
    chip: {
        height: '25px',
    },
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
    optionTitleText: {
        fontSize: '14px',
        color: '#9a9a9a',
    },
    optionValueText: {
        fontSize: '23px',
        color: themeObj.primary.light,
        fontWeight: '300',
    },
    optionValueIconActive: {
        color: colors.activeGreen,
        padding: '2px',
    },
    optionValueIconInactive: {
        color: colors.inactiveRed,
        padding: '2px',
    },
    root: {
        flexGrow: 1,
        paddingLeft: 52,
        paddingRight: 52,
        width: '100%',
    },
};

const get = (o, p) =>
    p.reduce(
        (xs, x) =>
            ((xs && xs[x]) ?
                xs[x] : null), o);

const secretMismactchStr = (<div
    style={{
        color: colors.inactiveRed,
        fontWeight: 'bold',
    }}
>Secret Mismatch</div>);

const headerIdx = {
    hostname: 0,
    mac: 1,
    model: 2,
    nodeIp: 3,
    fwVersion: 4,
    status: 5,
    restore: 6,
    action: 7,
};

const restoreHeaderIdx = {
    hostname: 0,
    mac: 1,
    model: 2,
    maxNbr: 3,
    action: 4,
};

function deepClone(object) {
    return JSON.parse(JSON.stringify(object));
}

// const shortgiMockOption = {
//     type: 'enum',
//     data: [
//         {
//             actualValue: 'enable',
//             displayValue: 'Enable',
//         },
//         {
//             actualValue: 'disable',
//             displayValue: 'Disable',
//         },
//     ],
// };

// const mcsMockOption = {
//     type: 'enum',
//     data: [
//         {
//             actualValue: 'auto',
//             displayValue: 'Auto',
//         },
//         {
//             actualValue: '0',
//             displayValue: '0',
//         },
//         {
//             actualValue: '1',
//             displayValue: '1',
//         },
//         {
//             actualValue: '2',
//             displayValue: '2',
//         },
//         {
//             actualValue: '3',
//             displayValue: '3',
//         },
//     ],
// };

// function checkFwMisMatch(nodeInfoObj) {
//     const isSpecific = !Object.keys(nodeInfoObj).every(nodeIp =>
//         typeof nodeInfoObj[nodeIp].success === 'undefined');
//     if (isSpecific) {
//         return true;
//     }
//     return !Object.keys(nodeInfoObj).every(nodeIp =>
//         nodeInfoObj[nodeIp].firmwareVersion.slice(0, 4) ===
//         nodeInfoObj[Object.keys(nodeInfoObj)[0]].firmwareVersion.slice(0, 4)
//     );
// }

function createBpduIcon(actualValue) {
    return actualValue === 'enable' ? (
        <i
            className="material-icons"
            style={{fontSize: '32px', color: colors.activeGreen}}
        >done</i>
    ) : (
        <i
            className="material-icons"
            style={{fontSize: '32px', color: colors.inactiveRed}}
        >clear</i>
    );
}

// function createCountryConfigOptionRequest(getConfigObj, decodeBackup) {
//     const bodyMsg = {
//         options: {
//             meshSettings: ['bpduFilter', 'country'],
//         },
//         sourceConfig: {},
//     };
//     const {checksums, ...Setting} = getConfigObj;
//     bodyMsg.sourceConfig = Setting;
//     Object.keys(decodeBackup.p2BackupConfig.meshSettings).forEach((key) => {
//         bodyMsg.sourceConfig.meshSettings[key] = decodeBackup.p2BackupConfig.meshSettings[key];
//     });
//     return bodyMsg;
// }

class MeshWideRestoreApp extends React.Component {
    constructor(props) {
        super(props);

        const fnNames = [
            'retrieveTableContent',
            'handleChangePageFn',
            'handleChangeItemsPerPageFn',
            'updateMeshTopology',
            'handleMeshTopoErr',
            'updateNodeInfo',
            'handleNodeInfoErr',
            'handleDialogOnClose',
            'selectFileHandler',
            'onReset',
            'onRestore',
            'restoreProcess',
            // 'handleRestoreTypeChange',
            'handleRestoreTypeRadioChange',
            'getConfigSuccess',
            'getConfigError',
            'setConfigSuccess',
            'setConfigError',
            'handleRequestSortFn',
            'handleSearchFn',
            'handleinitiateSearchFn',
            'getNodeInfo',
            'handleSecretMismatch',
            'onLogout',
            'onReturn',
            'onFailReturn',
            'onFail',
            'handleCountryDialogOnClose',
            'handleRestoreDialogOnClose',
            'handleRestorePreviewDialogOnClose',
            'handleChange',
            'triggerFormStatus',
            'handleClickShowPasssword',
            'handleClickShowEncKeyPasssword',
            'handleClickShowE2EEncKeyPassword',
            'handleSelectRadioClickFn',
            'enterToLogin',
            'setBackupConfig',
            'notLoggedInHandle',
            'handleRestoreData',
            'createCollpaseButton',
            'handleCollapse',
            'updateFilterConfig',
            'searchCountry',
            'searchE2EEnc',
            'searchBpduFilter',
            'searchGlobalTimezone',
            'handleMatchUpHeader',
            'handleMatchUpData',
            'createRestoreFromButton',
            'handleRestoreFromDialog',
            'handleChangeMatchUp',
            'createSkipRestoreButton',
            'handleSkipNodeRestore',
            'createDeleteAllButton',
            'handleDeleteAll',
            'createAddAllButton',
            'handleAddAll',
            'handleRestoreTableData',
            'createConfigOptionRequest',
            'getFilterConfigOption',
            // 'checkFilterConfig',
            'handleInvalidDialogOnClose',
            'createCountryConfigOptionRequest',
            'mixSettings',
            'reRenderRestoreTableActionCompoent',
            'checkConfigValue',
            'validateRegex',
            'validateEnum',
            'validateMultiEnum',
            'validateInt',
            'validateMix',
            'validateNodeSettings',
            'validateMeshSettings',
            'validateRadioSettings',
            'validateEthernetSettings',
            'validateProfileSettings',
            'setUpInterval',
            'createExpansionPanel',
            'createRadioGrid',
            'createGeneralContent',
            'createSecurityContent',
            'createAdvancedContent',
            'errorDeterminer',
            'changeMatchUp',
            'getConfigErrorDueToDiscrepancies',
        ];

        window.__.each(fnNames, (fnName) => {
            this[fnName] = this[fnName].bind(this);
        });

        this.t = this.props.t;
        this.toggleSnackBar = this.props.toggleSnackBar;
        this.closeSnackbar = this.props.closeSnackbar;

        const Headers = [
            {
                id: 'hostname',
                HeaderLabel: 'hstnmeHdr',
                isSorted: true,
                sortType: 0,
                canSort: true,
            },
            {
                id: 'mac',
                HeaderLabel: 'macHdr',
                isSorted: false,
                sortType: 0,
                canSort: true,
            },
            {
                id: 'model',
                HeaderLabel: 'modelHdr',
                isSorted: false,
                sortType: 0,
                canSort: true,
            },
            {
                id: 'nodeIp',
                HeaderLabel: 'nodeIpHdr',
                isSorted: false,
                sortType: 0,
                canSort: true,
            },
            {
                id: 'fwVersion',
                HeaderLabel: 'fwVerHdr',
                isSorted: false,
                sortType: 0,
                canSort: true,
            },
            {
                id: 'status',
                HeaderLabel: 'statusHdr',
                isSorted: false,
                sortType: 0,
                canSort: true,
            },
            {
                id: 'restore',
                HeaderLabel: 'restoreFromLbl',
                isSorted: false,
                sortType: 0,
                canSort: false,
            },
            {
                id: 'action',
                HeaderLabel: 'actionLbl',
                isSorted: false,
                sortType: 0,
                canSort: true,
            },
        ];

        const restoreHeaders = [
            {
                id: 'hostname',
                HeaderLabel: this.t('hstnmeHdr'),
                isSorted: true,
                sortType: 0,
                canSort: true,
            },
            {
                id: 'mac',
                HeaderLabel: this.t('macHdr'),
                isSorted: false,
                sortType: 0,
                canSort: true,
            },
            {
                id: 'model',
                HeaderLabel: this.t('modelHdr'),
                isSorted: false,
                sortType: 0,
                canSort: true,
            },
            {
                id: 'maxNbr',
                HeaderLabel: this.t('maxNbrHdr'),
                isSorted: false,
                sortType: 0,
                canSort: true,
            },
            {
                id: 'action',
                HeaderLabel: this.t('detailHdr'),
                isSorted: false,
                sortType: 0,
                canSort: false,
            },
        ];
        this.isRetrieveTblDataSuccess = false;
        this.state = {
            isCountryCodeChangedWithNoError: false,
            isResetRadio: false,
            table: {
                headers: {
                    Headers,
                    selectedId: [],
                    selectedMAC: [],
                    skippedMAC: [],
                    searchKey: '',
                    searching: true,
                    handleRequestSort: (e, property) => this.handleRequestSortFn(e, property, 'table'),
                    handleSelectClick: (e, id, nodeIp, n) => this.handleSelectClickFn(e, id, nodeIp, n, 'table'),
                    handleSelectAllClick: (e, checked, filterData) => this.handleSelectAllClickFn(e, checked,
                        filterData, 'table'),
                },
                data: [],
                footer: {
                    totalItems: 0,
                    itemsPerPage: 10,
                    currentPage: 0,
                    handleChangePage: (e, page) => this.handleChangePageFn(e, page, 'table'),
                    handleChangeItemsPerPage: e => this.handleChangeItemsPerPageFn(e, 'table'),
                },
            },
            restoreTable: {
                headers: {
                    Headers: restoreHeaders,
                    selectedMac: [],
                    collapsedMac: [],
                    disabledMac: [],
                    searchKey: '',
                    searching: true,
                    handleRequestSort: (e, property) => this.handleRequestSortFn(e, property, 'restoreTable'),
                    handleSelectRadioClick: (e, mac) => this.handleSelectRadioClickFn(e, mac, 'restoreTable'),
                },
                data: [],
                collapsedData: {},
                footer: {
                    totalItems: 0,
                    itemsPerPage: 10,
                    currentPage: 0,
                    handleChangePage: (e, page) => this.handleChangePageFn(e, page, 'restoreTable'),
                    handleChangeItemsPerPage: e => this.handleChangeItemsPerPageFn(e, 'restoreTable'),
                },
            },
            dialog: {
                open: false,
                title: '',
                content: '',
                nonTextContent: <span />,
                submitTitle: this.t('defaultButtonLbl'),
                submitFn: () => {
                    this.handleDialogOnClose();
                },
                cancelTitle: '',
                cancelFn: () => {
                    this.handleDialogOnClose();
                },
                disableBackdropClick: false,
                disableEscapeKeyDown: false,
            },
            file: '',
            fileName: '',
            fileSize: '',
            disabledFileUpload: false,
            disabledRestore: true,
            disabledReset: false,
            isLock: false,
            // isFwMisMatch: false,
            nodeInfoErr: false,
            restoreType: 'meshOnly',
            macToNodeIpMap: {},
            meshTopoIp: [],
            countryDialog: false,
            restoreDialog: false,
            restoreFrom: {
                mac: '',
                hostname: '',
                model: '',
            },
            // invalidFilterConfig: {},
            restorePreviewDialog: false,
            showPassword: false,
            showEncKeyPassword: false,
            showE2EEncKeyPassword: false,
            formStatus: {
                password: true,
            },
            errorStatus: {
                password: false,
            },
            statusText: {
                password: this.t('passwordObj', {returnObjects: true}).helperText,
            },
            formData: {
                password: '',
            },
            defaultStatusText: {
                password: this.t('passwordObj', {returnObjects: true}).helperText,
            },
            defaultFormStatus: {
                password: true,
            },
            loadData: {
                password: '',
            },
            defaultErrorStatus: {
                password: false,
            },
            getConfigObj: {},
            decodeBackup: {},
            disableSelectAfterRestore: false,
            filteredConfig: {
                country: [{actualValue: '', displayValue: ''}],
                e2eEnc: [{actualValue: '', displayValue: ''}],
                globalTimezone: [{actualValue: '', displayValue: ''}],
            },
            invalidConfigDialog: {
                open: false,
                title: '',
                content: '',
                nonTextContent: <span />,
                submitTitle: this.t('defaultButtonLbl'),
                submitFn: this.handleDialogOnClose,
                cancelTitle: '',
                cancelFn: this.handleDialogOnClose,
            },
            // invalidFilterConfig: {
            //     meshSettings: {
            //         bpduFilter: 'invalid',
            //         country: 'wrongEnum',
            //     },
            //     radioSettings: {
            //         '127.2.35.226': {
            //             radio0: {
            //                 distance: 'wrongEnum',
            //                 channel: 'wrongEnum',
            //                 txpower: 'wrongEnum',
            //             },
            //             radio1: {
            //                 channel: 'wrongEnum',
            //             },
            //             radio2: {
            //                 channelBandwidth: 'wrongEnum',
            //                 centralFreq: 'invalid',
            //                 channel: 'invalid',
            //             },
            //         },
            //         '127.2.37.235': {
            //             radio0: {
            //                 centralFreq: 'wrongEnum',
            //             },
            //             radio1: {
            //                 rssiFilterTolerance: 'wrongEnum',
            //             },
            //         },
            //     },
            //     nodeSettings: {
            //         '127.2.35.226': {
            //             hostname: 'wrongRegex',
            //         },
            //     },
            //     ethernetSettings: {
            //         '127.2.35.226': {
            //             eth0: {
            //                 ethernetLink: 'wrongEnum',
            //             },
            //             eth1: {
            //                 ethernetLink: 'wrongEnum',
            //             },
            //         },
            //         '127.2.37.235': {
            //             eth0: {
            //                 ethernetLink: 'wrongEnum',
            //             },
            //             eth1: {
            //                 ethernetLink: 'wrongEnum',
            //             },
            //         },
            //     },
            //     expanded: {
            //         meshSettings: true,
            //         node: {
            //             '127.2.35.226': true,
            //             '127.2.37.235': false,
            //         },
            //     },
            // },
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
            invalidConfigDialogOpen: false,
            invalidFilterConfigActionFn: () => null,
            hostnameMap: {},
            macMap: {},
        };
    }

    errorDeterminer(errObj) {
        let errorMsg = '';
        if (errObj.type === 'headnodeunreachable') {
            errorMsg = `(${this.t('headnodeunreachableErr')})`;
        } else if (errObj.type === 'unreachable' ||
            errObj === 'unreachable.managednodeunreachable') {
            errorMsg = `(${this.t('managednodeunreachable')})`;
        } else if (errObj.type === 'headnodebusy') {
            errorMsg = `(${this.t('headnodebusyErr')})`;
        } else if (errObj.type === 'unreachable.managednodeunreachable') {
            errorMsg = `(${this.t('unreachableHeadnodeErrContent')})`;
        } else if (errObj.type === 'stopprocess') {
            errorMsg = `(${this.t('stopprocessErr')})`;
        }
        const errJSX = (<div style={{display: 'block'}}>
            {this.t('cwReStatus2')}
            <strong>
                <font color="red">
                    &nbsp;{this.t('failed')} &nbsp;
                    {errorMsg}
                </font>
            </strong>
        </div>);
        return errJSX;
    };

    componentDidMount() {
        this.mounted = true;
        this.retrieveTableContent();
        // this.setUpInterval();
    }

    componentWillUnmount() {
        this.mounted = false;
        clearTimeout(this.timer);
        window.clearInterval(this.tblContTimer);
        this.closeSnackbar()
    }

    onLogout() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('invalidMgmtTitle'),
                content: this.t('invalidMgmtCtx'),
                submitTitle: this.t('backProjMgmt'),
                submitFn: () => {
                    Cookies.remove('projectID');
                    // const currentOrigin = window.location.origin;
                    // window.location.replace(`${currentOrigin}/mesh/?l=${this.props.lang}`);
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
                content: this.t('headNodeUnreachableCtx', this.props.labels),
                submitTitle: this.t('backClusterTopo'),
                submitFn: () => {
                    // const currentOrigin = window.location.origin;
                    // window.location.replace(`${currentOrigin}/mesh/?l=${this.props.lang}`);
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
                nonTextContent: <span />,
                submitTitle: this.t('backClusterTopo'),
                submitFn: () => {
                    // const currentOrigin = window.location.origin;
                    // window.location.replace(`${currentOrigin}/mesh/?l=${this.props.lang}`);
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

    onFail(error) {
        // console.log('onFail');
        // console.log(error);
        const errorObj = error.data.data;
        const _data = this.state.table.data.map((dataRow) => {
            const _dataRow = dataRow;
            if (typeof errorObj.checksums !== 'undefined') {
                // console.log('getconfig');
                const checksumsObj = errorObj.checksums;
                Object.keys(checksumsObj).some((ipv4) => {
                    if (!checksumsObj[ipv4].success &&
                        typeof checksumsObj[ipv4].errors !== 'undefined' &&
                        _dataRow[headerIdx.nodeIp].ctx === ipv4) {
                        checksumsObj[ipv4].errors.forEach((err) => {
                            _dataRow[headerIdx.status].ctx = this.errorDeterminer(err);
                        });
                        return true;
                    }
                    _dataRow[headerIdx.status].ctx = (
                        <div style={{display: 'block'}}>
                            {this.t('cwReStatus2')}
                            <strong><font color="red">&nbsp;{this.t('failed')}
                            </font></strong>
                        </div>
                    );
                    return false;
                });
            } else {
                // console.log('setconfig');
                Object.keys(errorObj).some((nodeIp) => {
                    if (typeof errorObj[nodeIp].success !== 'undefined' &&
                        !errorObj[nodeIp].success &&
                        typeof errorObj[nodeIp].errors !== 'undefined' &&
                        _dataRow[headerIdx.nodeIp].ctx === nodeIp
                    ) {
                        errorObj[nodeIp].errors.forEach((err) => {
                            _dataRow[headerIdx.status].ctx = this.errorDeterminer(err);
                        });
                        return true;
                    }
                    _dataRow[headerIdx.status].ctx = (
                        <div style={{display: 'block'}}>
                            {this.t('cwReStatus2')}
                            <strong><font color="red">&nbsp;{this.t('failed')}
                            </font></strong>
                        </div>
                    );
                    return false;
                });
            }
            return _dataRow;
        });

        this.setState({
            ...this.state,
            table: {
                ...this.state.table,
                data: _data,
            },
            isLock: false,
            disabledRestore: true,
        });
    }

    onReset() {
        this.setState({
            isCountryCodeChangedWithNoError: false,
            isResetRadio: false,
            formData: this.state.loadData,
            errorStatus: this.state.defaultErrorStatus,
            formStatus: this.state.defaultFormStatus,
            statusText: this.state.defaultStatusText,
            restoreType: 'meshOnly',
            file: '',
            fileName: '',
            fileSize: '',
            disabledFileUpload: false,
            disabledRestore: true,
            disabledReset: false,
            // isFwMisMatch: false,
            nodeInfoErr: false,
            getConfigObj: {},
            decodeBackup: {},
            disableSelectAfterRestore: false,
            invalidFilterConfig: {
                meshSettings: {},
                radioSettings: {},
                nodeSettings: {},
                ethernetSettings: {},
                expanded: {
                    meshSettings: false,
                    node: {},
                },
            },
            table: {
                ...this.state.table,
                headers: {
                    ...this.state.table.headers,
                    selectedId: [],
                    selectedMAC: [],
                    skippedMAC: [],
                },
            },
        }, () => {
            this.retrieveTableContent();
            document.getElementById('configFile').value = null;
        });
    }

    onRestore() {
        // const dialogContent = (
        //     <span>
        //         {this.t('restoreDialogContent')}
        //     </span>
        // );

        // const dialogRadioContent = (
        //     <RadioGroup
        //         id="restoreType"
        //         aria-label="restoreType"
        //         name="restoreType"
        //         value={this.state.restoreType}
        //         onChange={this.handleRestoreTypeChange}
        //         style={{marginTop: '10px'}}
        //     >
        //         <FormControlLabel
        //             value="meshOnly"
        //             control={<Radio style={{height: '36px'}} />}
        //             label={this.t('restoreRadioDialogContentMesh')}
        //         />
        //         <FormControlLabel
        //             value="all"
        //             control={<Radio style={{height: '36px'}} />}
        //             label={this.t('restoreRadioDialogContentAll')}
        //         />
        //     </RadioGroup>
        // );

        // this.setState({
        //     dialog: {
        //         ...this.state.dialog,
        //         open: true,
        //         title: this.t('restoreDialogTitle'),
        //         content: dialogContent,
        //         nonTextContent: dialogRadioContent,
        //         submitTitle: this.t('restoreDialogProceed'),
        //         submitFn: () => {
        //             this.restoreProcess();
        //         },
        //         cancelTitle: this.t('restoreDialogCancel'),
        //         cancelFn: () => {
        //             this.handleDialogOnClose();
        //         },
        //     },
        // });
        this.setState({
            ...this.state,
            restorePreviewDialog: true,
        });
    }


    setBackupConfig() {
        const {restoreType, isResetRadio} = this.state;
        const {checksums, meshSettings: getConfigMesh,
            ethernetSettings: getConfigEthernet,
            profileSettings: getConfigProfile,
        } = this.state.getConfigObj;
        const {meshSettings, nodes} = this.state.decodeBackup.p2BackupConfig;

        const setConfigObj = {};
        setConfigObj.checksums = checksums;
        setConfigObj.diff = {};
        setConfigObj.diff.meshSettings = deepClone(getConfigMesh);
        Object.keys(meshSettings).forEach((key) => {
            setConfigObj.diff.meshSettings[key] = meshSettings[key];
        });
        delete setConfigObj.diff.meshSettings.rtsCts;
        setConfigObj.options = {isResetRadio};
        try {
            // console.log('setBackupConfig: ', restoreType);
            if (restoreType === 'all') {
                // Make sure all managed device config in backup file
                const tableData = this.state.table.data;
                setConfigObj.diff.radioSettings = {};
                setConfigObj.diff.nodeSettings = {};
                setConfigObj.diff.ethernetSettings = {};
                setConfigObj.diff.profileSettings = {};
                tableData.forEach((row) => {
                    const nodeIp = row[headerIdx.nodeIp].ctx;
                    const mac = row[headerIdx.restore].ctx;

                    if (this.state.table.headers.skippedMAC.indexOf(
                        row[headerIdx.mac].ctx) === -1) {
                        if (typeof nodes[mac] === 'undefined') {
                            throw new Error('Unmatch List');
                        } else if (typeof checksums[nodeIp] === 'undefined') {
                            throw new Error('Outdated List');
                        }

                        const {config} = nodes[mac];
                        const {nodeSettings, radioSettings} = config;
                        const ethernetSettings = get(config, ['ethernetSettings']) ||
                            get(getConfigEthernet, [nodeIp]);
                        const profileSettings = config?.profileSettings ?? getConfigProfile?.[nodeIp];
                        // Restore mesh settings + node settings + radio settings
                        // setConfigObj.diff.radioSettings[nodeIp] = radioSettings;
                        // setConfigObj.diff.nodeSettings[nodeIp] = nodeSettings;
                        setConfigObj.diff.radioSettings[nodeIp] =
                            this.mixSettings(nodeIp, radioSettings, 'radioSettings');
                        setConfigObj.diff.nodeSettings[nodeIp] =
                            this.mixSettings(nodeIp, nodeSettings, 'nodeSettings');
                        setConfigObj.diff.ethernetSettings[nodeIp] =
                            this.mixSettings(nodeIp, ethernetSettings, 'ethernetSettings');
                        setConfigObj.diff.profileSettings[nodeIp] =
                            this.mixSettings(nodeIp, profileSettings, 'profileSettings');
                    }
                });
            }

            const p = setConfig(this.props.csrf, this.props.projectId, setConfigObj);

            p.then((value) => {
                setTimeout(() => {
                    this.setConfigSuccess();
                }, value.rtt * 1000);
            }).catch((error) => {
                this.setConfigError(error);
            });
        } catch (e) {
            let dialogContent = this.t('getConfigFailDefault');
            if (e.message === 'Unmatch List') {
                dialogContent = this.t('getConfigFailUnmatch');
            } else if (e.message === 'Outdated List') {
                dialogContent = this.t('getConfigFailOutdated');
            }
            this.setState({
                ...this.state,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('getConfigFailTitle'),
                    content: dialogContent,
                    nonTextContent: <span />,
                    submitTitle: this.t('defaultButtonLbl'),
                    submitFn: () => {
                        this.setState({...this.state, isLock: false}, () => {
                            this.handleDialogOnClose();
                        });
                    },
                    cancelTitle: '',
                    cancelFn: () => {
                        this.handleDialogOnClose();
                    },
                },
            });
        }
    }

    getConfigErrorDueToDiscrepancies() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('inSyncTitle'),
                content: this.t('inSyncContent'),
                submitTitle: this.t('inSyncAction'),
                submitFn: () => {
                    this.history.push('/config');
                },
                cancelTitle: '',
                cancelFn: null,
                disableBackdropClick: true,
                disableEscapeKeyDown: true,
            },
        });
    };

    async getConfigSuccess(getConfigObj, decodeBackup, restoreType) {
        try {
            const {bodyMsg, matchNodeIpArray, isOperationModeValid, isCountryCodeChanged} =
                this.createCountryConfigOptionRequest(deepClone(getConfigObj), decodeBackup, restoreType);

            if (getConfigObj?.meshSettings?.discrepancies) {
                this.getConfigErrorDueToDiscrepancies();
            } else if (isOperationModeValid) {
                const filterConfig = await getFilteredConfigOptions(this.props.csrf, this.props.projectId, bodyMsg);
                const isFilterConfigValid = this.checkConfigValue(deepClone(filterConfig), matchNodeIpArray, bodyMsg);
                this.updateFilterConfig(filterConfig.meshSettings);
                const isCountryCodeChangedWithNoError = isCountryCodeChanged &&
                    !('country' in this.state.invalidFilterConfig.meshSettings);
                if (isFilterConfigValid) {
                    this.setState({
                        ...this.state,
                        isLock: false,
                        getConfigObj,
                        decodeBackup,
                        isCountryCodeChangedWithNoError,
                    }, () => this.handleRestoreData());
                } else {
                    this.setState({
                        isCountryCodeChangedWithNoError,
                        getConfigObj,
                        decodeBackup,
                        invalidConfigDialogOpen: true,
                        invalidFilterConfigActionFn: isCountryCodeChangedWithNoError ?
                        () => {
                            this.setState({disabledRestore: false, isResetRadio: true});
                            this.handleInvalidDialogOnClose();
                            this.handleRestoreData();
                        } : () => {
                            this.setState({disabledRestore: true});
                            this.handleInvalidDialogOnClose();
                            this.onReset();
                        },
                        isLock: false,
                    });
                }
            } else {
                this.setState({
                    disabledRestore: true,
                    isCountryCodeChangedWithNoError: isCountryCodeChanged,
                    dialog: {
                        ...this.state.dialog,
                        open: true,
                        title: this.t('operationModeNotIdenticalTitle'),
                        content: this.t('operationModeNotIdenticalContent'),
                        nonTextContent: <span />,
                        submitTitle: this.t('defaultButtonLbl'),
                        submitFn: () => {
                            this.handleDialogOnClose();
                        },
                    },
                    isLock: false,
                });
            }
        } catch (e) {
            const {title, content} = check(e);
            let dialogContent = this.t('getConfigFailDefault');
            if (e.message === 'Unmatch List') {
                dialogContent = this.t('getConfigFailUnmatch');
            } else if (e.message === 'Outdated List') {
                dialogContent = this.t('getConfigFailOutdated');
            }
            this.setState({
                isLock: false,
                disabledRestore: true,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: title !== '' ? title : this.t('getConfigFailTitle'),
                    content: title !== '' ? content : dialogContent,
                    nonTextContent: <span />,
                    submitTitle: this.t('defaultButtonLbl'),
                    submitFn: () => {
                        this.handleDialogOnClose();
                        this.onReset();
                    },
                    cancelTitle: '',
                    cancelFn: () => {
                        this.handleDialogOnClose();
                    },
                },
            });
        }
    }

    getConfigError(error) {
        // console.log('backupError');
        // const unreachedNode = isUnreachedNode(error);
        // if (unreachedNode === 'headNodeUnreachable') {
        //     this.onFailReturn();
        // } else if (unreachedNode === 'unreachable') {
        //     this.onFail(error);
        // } else {
        const {title, content} = check(error);
        const dialogContent = this.t('getConfigFailContent');
        this.setState({
            isLock: false,
            dialog: {
                ...this.state.dialog,
                open: true,
                title: title !== '' ? title : this.t('getConfigFailTitle'),
                content: title !== '' ? content : dialogContent,
                nonTextContent: <span />,
                submitTitle: this.t('defaultButtonLbl'),
                submitFn: () => {
                    this.handleDialogOnClose();
                    this.onReset();
                },
                cancelTitle: '',
                cancelFn: () => {
                    this.handleDialogOnClose();
                },
            },
            restoreType: 'meshOnly',
            file: '',
            fileName: '',
            fileSize: '',
            disabledFileUpload: false,
            disabledRestore: true,
            disableSelectAfterRestore: false,
            disabledReset: false,
            getConfigObj: {},
            decodeBackup: {},
        }, () => {
            document.getElementById('configFile').value = null;
        });
    }

    setConfigSuccess() {
        const _data = this.state.table.data.map((dataRow) => {
            const _dataRow = dataRow;
            _dataRow[headerIdx.action] = {
                ctx: (
                    <span
                        style={{
                            // width: '250px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {this.t('clusterAndNodeRestoreLbl')}
                        <span style={{
                            marginLeft: 'auto',
                        }}
                        >
                            <P2Tooltip
                                title={this.t('chooseRestoreNodeTooltipLbl')}
                                content={this.createRestoreFromButton(_dataRow[headerIdx.mac].ctx,
                                    _dataRow[headerIdx.hostname].ctx, _dataRow[headerIdx.model].ctx)}
                            />
                        </span>
                    </span>
                ),
                type: 'component',
            };
            _dataRow[headerIdx.status].ctx = (
                <div style={{display: 'block'}}>
                    {this.t('cwReStatus2')}
                    <strong>
                        <font color="green">
                            &nbsp;{this.t('success')}
                        </font>
                    </strong>
                </div>);
            return _dataRow;
        });

        this.setState({
            table: {
                ...this.state.table,
                data: _data,
            },
            // restoreType: 'meshOnly',
            disableSelectAfterRestore: true,
            disabledFileUpload: true,
        }, () => {
            this.setState({
                isLock: false,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('restoreSuccessTitle'),
                    content: (
                        <Trans
                            defaults={this.t('restoreSuccessContent')}
                            components={{bold: <strong />}}
                        />),
                    submitTitle: this.t('restoreSuccessSubmitLbl'),
                    submitFn: () => {
                        // const currentOrigin = window.location.origin;
                        // window.location.replace(`${currentOrigin}/mesh/?l=${this.props.lang}`);
                        // this.props.history.push('/');
                        window.location.assign(`${window.location.origin}/index.html`);
                    },
                    nonTextContent: <span />,
                    cancelTitle: this.t('restoreDialogCancel'),
                    cancelFn: () => {
                        this.handleDialogOnClose();
                    },
                },
                disabledRestore: true,
            });
        });
    }

    setConfigError(error) {
        const {title, content} = check(error);
        const unreachedNode = isUnreachedNode(error);
        if (unreachedNode === 'headNodeUnreachable') {
            this.onFailReturn();
        } else if (unreachedNode === 'unreachable') {
            this.onFail(error);
        } else if (title !== '') {
            this.setState({
                ...this.state,
                isLock: false,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title,
                    content,
                    submitTitle: this.t('dialogSubmitLbl'),
                    submitFn: this.handleDialogOnClose,
                    cancelTitle: '',
                },
            });
        } else {
            this.setState({
                isLock: false,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('setConfigFailTitle'),
                    content: this.t('setConfigFailContent'),
                    nonTextContent: <span />,
                    submitTitle: this.t('defaultButtonLbl'),
                    submitFn: () => {
                        this.handleDialogOnClose();
                    },
                    cancelTitle: '',
                    cancelFn: () => {
                        this.handleDialogOnClose();
                    },
                },
            });
        }
    }


    async getNodeInfo() {
        try {
            const meshTopoDeviceInfo = await getCachedNodeInfo(this.props.csrf,
                this.props.projectId === '' ? Cookies.get('projectId') : this.props.projectId,
                {nodes: this.state.meshTopoIp});
            if (!this.mounted) {
                return;
            }
            this.updateNodeInfo(meshTopoDeviceInfo);
        } catch (err) {
            if (!this.mounted) {
                return;
            }
            const {title, content} = check(err);
            this.setState({
                nodeInfoErr: true,
            });
            if (err.message === 'P2Error' && err.data.type === 'specific') {
                this.updateNodeInfo(err.data.data);
            } else if (title !== '') {
                this.isRetrieveTblDataSuccess = true;
                this.setState({
                    ...this.state,
                    isLock: false,
                    dialog: {
                        ...this.state.dialog,
                        open: true,
                        title,
                        content,
                        submitTitle: this.t('dialogSubmitLbl'),
                        submitFn: this.handleDialogOnClose,
                        cancelTitle: '',
                    },
                });
            } else {
                this.setState({
                    isLock: false,
                });
            }
        }
    }

    getProfileFilterConfigOption(ctx, filterConfig, key) {
        // console.log('kyle_debug ~ file: MeshWideRestore.jsx ~ line 1320 ~ MeshWideRestoreApp ~ getProfileFilterConfigOption ~ ctx', ctx)
        const {macToNodeIpMap, restoreFrom} = this.state;
        const nodeIp = macToNodeIpMap[restoreFrom.mac];
        if (filterConfig?.profileSettings?.[nodeIp]?.nbr?.['1']?.[key]?.type === 'enum') {
            const value = filterConfig.profileSettings[nodeIp].nbr['1'][key].data
                .find(option => option.actualValue === ctx.toString());
            return typeof value !== 'undefined' ? value.displayValue : '-';
        }
        return ctx;
    }

    getFilterConfigOption(ctx, mac, filterConfig, radio, key) {
        // console.log('-------------------------');
        // console.log('ctx: ', ctx);
        // console.log('filterConfig: ', filterConfig);
        // console.log('key: ', key);
        // console.log('mac: ', mac);
        // console.log('radio: ', radio);
        // console.log('-------------------------');
        const {macToNodeIpMap, restoreFrom} = this.state;
        const nodeIp = macToNodeIpMap[restoreFrom.mac];
        if (filterConfig.radioSettings[nodeIp][radio][key].type === 'enum') {
            const value = filterConfig.radioSettings[nodeIp][radio][key].data
                .find(option => option.actualValue === ctx.toString());
            return typeof value !== 'undefined' ? value.displayValue : '-';
        }
        return '-';
    }

    // getInfo(nodeIp, key) {
    //     const Data = [...this.state.table.data];
    //     // console.log('getInfo(Data): ', Data);
    //     const nodeInfo = Data.find(rowArr => rowArr[headerIdx.nodeIp].ctx === nodeIp);
    //     switch (key) {
    //         case 'hostname':
    //             return nodeInfo[headerIdx.hostname].ctx || '-';
    //         case 'mac':
    //             return nodeInfo[headerIdx.mac].ctx || '-';
    //         default:
    //             return '';
    //     }
    // }

    setUpInterval() {
        this.tblContTimer = setInterval(() => {
            if (!this.isRetrieveTblDataSuccess) {
                this.retrieveTableContent();
            } else {
                window.clearInterval(this.tblContTimer);
            }
        }, 5000);
    }

    mixSettings(nodeIp, settings, key) {
        const {getConfigObj} = this.state;
        let newSettings = {};
        switch (key) {
            case 'radioSettings':
                newSettings = deepClone(getConfigObj.radioSettings[nodeIp]);
                Object.keys(settings).forEach((radioName) => {
                    Object.keys(settings[radioName]).forEach((opt) => {
                        newSettings[radioName][opt] = settings[radioName][opt];
                    });
                    if (!('status' in settings[radioName])) {
                        newSettings[radioName].status = settings[radioName].operationMode !==
                            'disable' ? 'enable' : 'disable';
                    }
                });
                break;
            case 'nodeSettings':
                newSettings = deepClone(getConfigObj.nodeSettings[nodeIp]);
                Object.keys(settings).forEach((opt) => {
                    newSettings[opt] = settings[opt];
                });
                delete newSettings.acl;
                break;
            case 'ethernetSettings':
                newSettings = deepClone(getConfigObj.ethernetSettings[nodeIp]);
                Object.keys(settings).forEach((ethName) => {
                    Object.keys(settings[ethName]).forEach((opt) => {
                        newSettings[ethName][opt] = settings[ethName][opt];
                    });
                });
                break;
            case 'profileSettings':
                newSettings = deepClone(getConfigObj.profileSettings[nodeIp]);
                Object.keys(settings).forEach((profileOpt) => {
                    Object.keys(settings[profileOpt]).forEach((profileId) => {
                        Object.keys(settings[profileOpt][profileId]).forEach((opt) => {
                            newSettings[profileOpt][profileId][opt] = settings[profileOpt][profileId][opt];
                        });
                    });
                });
                break;
            default:
                return settings;
        }
        return newSettings;
    }

    handleRestoreTableData() {
        const {getConfigObj, macToNodeIpMap, restoreFrom, decodeBackup} = this.state;
        const {headers, data} = this.state.restoreTable;
        if (headers.disabledMac.length !== 0) {
            return data.map((rowArr) => {
                const newRowArr = [...rowArr];
                let maxNbrWarning = false;
                let sumOfRadioMaxNbr = 0;
                let nodeMaxNbr = rowArr[restoreHeaderIdx.maxNbr].ctx === '-' ?
                    getConfigObj?.profileSettings?.[macToNodeIpMap[restoreFrom.mac]]?.nbr?.['1']?.maxNbr ?? '-'
                    : rowArr[restoreHeaderIdx.maxNbr].ctx;
                if (nodeMaxNbr === 'disable') {
                    nodeMaxNbr = 'Disable';
                }
                if (decodeBackup?.p2BackupConfig?.nodes?.[rowArr[restoreHeaderIdx.mac].ctx]?.config) {
                    const {config} = decodeBackup?.p2BackupConfig?.nodes?.[rowArr[restoreHeaderIdx.mac].ctx];
                    Object.keys(config.radioSettings).forEach((radio) => {
                        if (config.radioSettings[radio].status === 'enable') {
                            sumOfRadioMaxNbr += config.radioSettings[radio].maxNbr;
                        }
                    });
                    if (nodeMaxNbr !== '-' && nodeMaxNbr !== 'Disable') {
                        if (sumOfRadioMaxNbr > parseInt(nodeMaxNbr, 10)) {
                            maxNbrWarning = true;
                        }
                    }
                }
                newRowArr[restoreHeaderIdx.maxNbr] = {
                    ctx: (
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                        >
                            {nodeMaxNbr}
                            {maxNbrWarning && <P2Tooltip
                                title={this.t('maxNbrWarningLbl')}
                                content={(<i
                                    className="material-icons"
                                    style={{
                                        fontSize: '16px',
                                        marginLeft: '5px',
                                        marginBottom: '0.5px',
                                        color: colors.warningColor,
                                    }}
                                >error</i>)}
                            />}
                        </span>
                    ),
                    type: 'string',
                };
                if (headers.disabledMac.indexOf(newRowArr[restoreHeaderIdx.mac].ctx) !== -1) {
                    newRowArr[restoreHeaderIdx.mac] = {
                        ctx: (<span style={{color: colors.dialogText}}>
                            {rowArr[restoreHeaderIdx.mac].ctx}
                        </span>),
                        type: 'string',
                    };
                    newRowArr[restoreHeaderIdx.hostname] = {
                        ctx: (<span style={{color: colors.dialogText}}>
                            {rowArr[restoreHeaderIdx.hostname].ctx}
                        </span>),
                        type: 'string',
                    };
                    newRowArr[restoreHeaderIdx.model] = {
                        ctx: (
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                            >
                                <span style={{color: colors.dialogText}}>
                                    {rowArr[restoreHeaderIdx.model].ctx}
                                </span>
                                <P2Tooltip
                                    title={this.t('crossModelWarningLbl')}
                                    content={(<i
                                        className="material-icons"
                                        style={{
                                            fontSize: '16px',
                                            marginLeft: '5px',
                                            marginBottom: '0.5px',
                                            color: colors.inactiveRed,
                                        }}
                                    >error</i>)}
                                />
                            </span>
                        ),
                        type: 'string',
                    };
                    newRowArr[restoreHeaderIdx.maxNbr] = {
                        ctx: (
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                            >
                                <span style={{color: colors.dialogText}}>
                                    {nodeMaxNbr}
                                </span>
                                {maxNbrWarning && <P2Tooltip
                                    title={this.t('maxNbrWarningLbl')}
                                    content={(<i
                                        className="material-icons"
                                        style={{
                                            fontSize: '16px',
                                            marginLeft: '5px',
                                            marginBottom: '0.5px',
                                            color: colors.warningColor,
                                        }}
                                    >error</i>)}
                                />}
                            </span>
                        ),
                        type: 'string',
                    };
                    newRowArr[restoreHeaderIdx.action] = {
                        ctx: (
                            <div>
                                {this.createCollpaseButton(rowArr[restoreHeaderIdx.mac].ctx, true)}
                            </div>
                        ),
                        type: 'component',
                    };
                }
                return newRowArr;
            });
        }
        return data;
    }

    handleRestoreFromDialog(mac, hostname, model) {
        const {data} = this.state.restoreTable;
        const {table} = this.state;
        const disabledMac = data.filter(rowArr => rowArr[restoreHeaderIdx.model].ctx !== model)
            .map(rowArr => rowArr[restoreHeaderIdx.mac].ctx);
        const selectedMacArr = table.data.filter(rowArr => rowArr[headerIdx.mac].ctx === mac);
        const selectedMac = selectedMacArr.length > 0 ? [selectedMacArr[0][headerIdx.restore].ctx] : [];

        this.setState({
            ...this.state,
            restoreTable: {
                ...this.state.restoreTable,
                headers: {
                    ...this.state.restoreTable.headers,
                    disabledMac,
                    selectedMac: selectedMac[0] === '-' ? [] : selectedMac,
                    collapsedMac: [],
                },
            },
            restoreFrom: {
                ...this.state.restoreFrom,
                mac,
                hostname,
                model,
            },
        }, () => {
            // console.log('handleRestoreFromDialog(selectedMac): ', this.state.restoreTable.headers.selectedMac);
            this.reRenderRestoreTableActionCompoent(mac, true,
                () => {
                    this.setState({
                        restoreDialog: true,
                    });
                });
        });
    }

    createRestoreFromButton(mac, hostname, model, error = false) {
        return (
            <IconButton
                style={{padding: '5px'}}
                color="primary"
                onClick={() => this.handleRestoreFromDialog(mac, hostname, model)}
                aria-label="add"
                id={mac}
            >
                <i
                    style={{fontSize: '20px', color: error && colors.inactiveRed}}
                    className="material-icons"
                >settings
                </i>
            </IconButton>
        );
    }

    handleSkipNodeRestore(mac) {
        const {skippedMAC} = this.state.table.headers;
        const skippedMACIndex = skippedMAC.indexOf(mac);
        let newskippedMAC = [];


        if (skippedMACIndex === -1) {
            newskippedMAC = newskippedMAC.concat(skippedMAC, mac);
        } else if (skippedMACIndex === 0) {
            newskippedMAC = newskippedMAC.concat(skippedMAC.slice(1));
        } else if (skippedMACIndex === skippedMAC.length - 1) {
            newskippedMAC = newskippedMAC.concat(skippedMAC.slice(0, -1));
        } else if (skippedMACIndex > 0) {
            newskippedMAC = newskippedMAC.concat(
                skippedMAC.slice(0, skippedMACIndex),
                skippedMAC.slice(skippedMACIndex + 1)
            );
        }

        this.setState({
            ...this.state,
            table: {
                ...this.state.table,
                headers: {
                    ...this.state.table.headers,
                    skippedMAC: newskippedMAC,
                },
            },
        });
    }

    createSkipRestoreButton(mac) {
        let icon = (
            <i
                style={{fontSize: '20px'}}
                className="material-icons"
            >not_interested
            </i>
        );
        if (this.state.table.headers.skippedMAC.indexOf(mac) !== -1) {
            icon = (
                <i
                    style={{fontSize: '20px'}}
                    className="material-icons"
                >playlist_add
                </i>
            );
        }

        return (
            <IconButton
                style={{padding: '5px'}}
                color="primary"
                onClick={() => this.handleSkipNodeRestore(mac)}
                aria-label="add"
                id={mac}
            >
                {icon}
            </IconButton>
        );
    }

    handleSelectClickFn(event, id, nodeIp, n, destination) {
        const {selectedId, selectedMAC} = this.state.table.headers;
        const selectedIdIndex = selectedId.indexOf(id);
        let newSelectedId = [];
        let newSelectedMAC = [];


        if (selectedIdIndex === -1) {
            newSelectedId = newSelectedId.concat(selectedId, id);
            newSelectedMAC = newSelectedMAC.concat(selectedMAC, n.mac);
        } else if (selectedIdIndex === 0) {
            newSelectedId = newSelectedId.concat(selectedId.slice(1));
            newSelectedMAC = newSelectedMAC.concat(selectedMAC.slice(1));
        } else if (selectedIdIndex === selectedId.length - 1) {
            newSelectedId = newSelectedId.concat(selectedId.slice(0, -1));
            newSelectedMAC = newSelectedMAC.concat(selectedMAC.slice(0, -1));
        } else if (selectedIdIndex > 0) {
            newSelectedId = newSelectedId.concat(
                selectedId.slice(0, selectedIdIndex),
                selectedId.slice(selectedIdIndex + 1)
            );
            newSelectedMAC = newSelectedMAC.concat(
                selectedMAC.slice(0, selectedIdIndex),
                selectedMAC.slice(selectedIdIndex + 1)
            );
        }

        this.setState({
            ...this.state,
            [destination]: {
                ...this.state[destination],
                headers: {
                    ...this.state[destination].headers,
                    selectedId: newSelectedId,
                    selectedMAC: newSelectedMAC,
                },
            },
        });
    }

    handleSelectAllClickFn(event, checked, filterData, destination) {
        // // console.log('----------filteredData-----------');
        // // console.log(filterData);
        // // console.log(this.state.table.data);
        if (checked) {
            // const currentTableRows = this.state.table.data;
            // // console.log('----------selectedId-----------');
            const selectedId = filterData.map(n => n.id);
            // // console.log(selectedId);
            // // console.log('----------selectedIp-----------');
            const selectedMAC = filterData.map(n => n.mac);
            // // console.log(selectedIp);
            this.setState({
                ...this.state,
                [destination]: {
                    ...this.state[destination],
                    headers: {
                        ...this.state.table.headers,
                        selectedId,
                        selectedMAC,
                    },
                },
            });
            return;
        }
        this.setState({
            ...this.state,
            [destination]: {
                ...this.state[destination],
                headers: {
                    ...this.state.table.headers,
                    selectedId: [],
                    selectedMAC: [],
                },
            },
        });
    }

    handleMatchUpHeader(header, error) {
        const {p2BackupConfig} = this.state.decodeBackup;
        if (this.state.restoreType === 'all') {
            if (error && typeof p2BackupConfig !== 'undefined') {
                const newHeader = {...header};
                newHeader.Headers = header.Headers.map((headerElement) => {
                    const newHeaderElement = {...headerElement};
                    if (newHeaderElement.id === 'restore') {
                        newHeaderElement.HeaderLabel = (
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                            >
                                <span>{this.t('restoreFromLbl')}</span>
                                <P2Tooltip
                                    title={this.t('invalidConfigLbl')}
                                    content={(<i
                                        className="material-icons"
                                        style={{
                                            fontSize: '16px',
                                            marginLeft: '5px',
                                            marginBottom: '0.5px',
                                            color: colors.inactiveRed,
                                        }}
                                    >error</i>)}
                                />
                            </span>
                        );
                    } else {
                        newHeaderElement.HeaderLabel = this.t(newHeaderElement.HeaderLabel);
                    }
                    return newHeaderElement;
                });
                return newHeader;
            }
            return {
                ...header,
                Headers: header.Headers.map(Header => ({
                    ...Header,
                    HeaderLabel: this.t(Header.HeaderLabel),
                })),
            };
        }
        const finalHeaders = header.Headers.map(Header => ({
            ...Header,
            HeaderLabel: this.t(Header.HeaderLabel),
        }))
        return {
            ...header,
            Headers: finalHeaders.filter(rowHeader => rowHeader.id !== 'restore' &&
                rowHeader.id !== 'action'),
        };
    }

    handleMatchUpData() {
        const {data, headers} = this.state.table;
        const {p2BackupConfig} = this.state.decodeBackup;
        // console.log('p2BackupConfig: ', p2BackupConfig);
        // console.log('before data: ', data);
        let newData = [];
        if (this.state.restoreType === 'all') {
            if (typeof p2BackupConfig !== 'undefined') {
                newData = data.map((rowArr) => {
                    const newRowArr = [...rowArr];
                    // console.log('kyle_debug: handleMatchUpData -> newRowArr', newRowArr);
                    if (headers.skippedMAC.indexOf(newRowArr[headerIdx.mac].ctx) !== -1) {
                        newRowArr[headerIdx.restore] = {
                            ctx: '-',
                            type: 'string',
                        };
                        newRowArr[headerIdx.action] = {
                            ctx: (
                                <span
                                    style={{
                                        // width: '250px',
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    {this.t('clusterRestoreOnlyLbl')}
                                    <span style={{
                                        marginLeft: 'auto',
                                    }}
                                    >
                                        {!this.state.disableSelectAfterRestore && <P2Tooltip
                                            title={this.state.table.headers.skippedMAC
                                                .indexOf(newRowArr[headerIdx.mac].ctx) !== -1 ?
                                                this.t('resumeRestoreNodeTooltipLbl') :
                                                this.t('skipRestoreNodeTooltipLbl')}
                                            content={this.createSkipRestoreButton(newRowArr[headerIdx.mac].ctx)}
                                        />}
                                    </span>
                                </span>
                            ),
                            type: 'component',
                        };
                    } else if (Object.keys(p2BackupConfig.nodes).indexOf(rowArr[headerIdx.restore].ctx) !== -1 &&
                        newRowArr[headerIdx.restore].ctx !== '-') {
                        newRowArr[headerIdx.restore] = {};
                        newRowArr[headerIdx.restore].type = 'string';
                        newRowArr[headerIdx.restore].ctx = `${p2BackupConfig.nodes[rowArr[headerIdx.restore].ctx]
                            .config.nodeSettings.hostname} (${rowArr[headerIdx.restore].ctx})`;
                        newRowArr[headerIdx.action] = {
                            ctx: (
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    {this.t('clusterAndNodeRestoreLbl')}
                                    <span style={{
                                        marginLeft: 'auto',
                                    }}
                                    >
                                        <P2Tooltip
                                            title={this.t('chooseRestoreNodeTooltipLbl')}
                                            content={this.createRestoreFromButton(newRowArr[headerIdx.mac].ctx,
                                                newRowArr[headerIdx.hostname].ctx, newRowArr[headerIdx.model].ctx)}
                                        />
                                        <P2Tooltip
                                            title={this.state.table.headers.skippedMAC
                                                .indexOf(newRowArr[headerIdx.mac].ctx) !== -1 ?
                                                this.t('resumeRestoreNodeTooltipLbl') :
                                                this.t('skipRestoreNodeTooltipLbl')}
                                            content={this.createSkipRestoreButton(newRowArr[headerIdx.mac].ctx)}
                                        />
                                    </span>
                                </span>
                            ),
                            type: 'component',
                        };
                    } else {
                        newRowArr[headerIdx.action] = {
                            ctx: (
                                <span
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                    }}
                                >
                                    {this.t('clusterAndNodeRestoreLbl')}
                                    <span style={{
                                        marginLeft: 'auto',
                                    }}
                                    >
                                        <P2Tooltip
                                            title={this.t('chooseRestoreNodeTooltipLbl')}
                                            content={this.createRestoreFromButton(newRowArr[headerIdx.mac].ctx,
                                                newRowArr[headerIdx.hostname].ctx, newRowArr[headerIdx.model].ctx,
                                                true)}
                                        />
                                        <P2Tooltip
                                            title={this.state.table.headers.skippedMAC
                                                .indexOf(newRowArr[headerIdx.mac].ctx) !== -1 ?
                                                this.t('resumeRestoreNodeTooltipLbl') :
                                                this.t('skipRestoreNodeTooltipLbl')}
                                            content={this.createSkipRestoreButton(newRowArr[headerIdx.mac].ctx)}
                                        />
                                    </span>
                                </span>
                            ),
                            type: 'component',
                        };
                    }
                    return newRowArr;
                });
                return newData;
            }
            return data;
        }
        return data.map(rowArr => [...rowArr].slice(0, -2));
    }

    searchCountry(actualValue) {
        const countryList = [...this.state.filteredConfig.country];
        const country = countryList.find(countryObj => countryObj.actualValue === actualValue);
        // countryList.some((countryObj) => {
        //     if (countryObj.actualValue === actualValue) {
        //         result = countryObj.displayValue;
        //         return true;
        //     }
        //     return false;
        // });
        return typeof country !== 'undefined' ? country.displayValue : '-';
    }

    searchGlobalTimezone(actualValue) {
        const globalTimezoneList = [...this.state.filteredConfig.globalTimezone];
        const timezone = globalTimezoneList.find(globalTimezoneObj => globalTimezoneObj.actualValue === actualValue);
        // countryList.some((countryObj) => {
        //     if (countryObj.actualValue === actualValue) {
        //         result = countryObj.displayValue;
        //         return true;
        //     }
        //     return false;
        // });
        return typeof timezone !== 'undefined' ? timezone.displayValue : '-';
    }

    searchE2EEnc(actualValue) {
        const e2eEncList = [...this.state.filteredConfig.e2eEnc];
        const e2eEnc = e2eEncList.find(e2eEncObj => e2eEncObj.actualValue === actualValue);
        return typeof e2eEnc !== 'undefined' ? e2eEnc.displayValue : '-';
    }

    searchBpduFilter(actualValue) {
        const bpduFilterList = [...this.state.filteredConfig.bpduFilter];
        const bpduFilter = bpduFilterList.find(bpduFilterObj => bpduFilterObj.actualValue === actualValue);
        return typeof bpduFilter !== 'undefined' ? bpduFilter.displayValue : '-';
    }

    updateFilterConfig(Config) {
        // console.log('-----updateFilterConfig-----');
        // console.log(Config);
        const filteredConfig = {};

        if (typeof Config.country !== 'undefined' && Config.country.type === 'enum') {
            filteredConfig.country = Config.country.data;
        }
        if (typeof Config.bpduFilter !== 'undefined' && Config.bpduFilter.type === 'enum') {
            filteredConfig.bpduFilter = Config.bpduFilter.data;
        }
        if (typeof Config.e2eEnc !== 'undefined' && Config.e2eEnc.type === 'enum') {
            filteredConfig.e2eEnc = Config.e2eEnc.data;
        }
        if (typeof Config.e2eEncKey !== 'undefined' && Config.e2eEncKey.type === 'regex') {
            filteredConfig.e2eEncKey = Config.e2eEncKey.data;
        }
        if (Config.globalTimezone !== 'undefined' && Config.globalTimezone.type === 'enum') {
            filteredConfig.globalTimezone = Config.globalTimezone.data;
        }

        if (Object.keys(filteredConfig).length === 5) {
            this.setState({
                ...this.state,
                filteredConfig,
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
                        // window.location.replace(`${currentOrigin}/mesh/?l=${this.props.lang}`);
                        // this.props.history.push('/');
                        window.location.assign(`${window.location.origin}/index.html`);
                    },
                    cancelTitle: this.t('getOptionFailBtnLbl2'),
                    cancelFn: () => {
                        this.handleDialogOnClose();
                        this.getMeshConfig(true, false);
                    },
                },
                isLock: false,
            });
        }
    }

    createCountryConfigOptionRequest(getConfigObj, decodeBackup, restoreType) {
        // console.log(this.state.macToNodeIpMap);
        const {data} = this.state.table;
        const {checksums, ...Setting} = getConfigObj;
        const options = getOptionsFromGetConfigObj(Setting);
        const bodyMsg = {
            options,
            sourceConfig: deepClone(Setting),
        };
        // bodyMsg.sourceConfig = Setting;
        Object.keys(decodeBackup.p2BackupConfig.meshSettings).forEach((opt) => {
            bodyMsg.sourceConfig.meshSettings[opt] =
                decodeBackup.p2BackupConfig.meshSettings[opt];
        });
        const isCountryCodeChanged = Setting.meshSettings.country !== decodeBackup.p2BackupConfig.meshSettings.country;
        const isConfigBackupMismatch = {};
        const isOperationModeValid = {};
        const matchNodeIpArray = [];
        Object.keys(bodyMsg.sourceConfig.radioSettings).forEach((nodeIp) => {
            isConfigBackupMismatch[nodeIp] = false;
            isOperationModeValid[nodeIp] = true;
        });

        if (restoreType === 'all') {
            data.forEach((rowArr) => {
                // console.log('restore match: ', Object.keys(decodeBackup.p2BackupConfig.nodes)
                    // .indexOf(rowArr[headerIdx.mac].ctx));
                // auto matching try match current cluster nodes' mac to backup file nodes' mac
                if (Object.keys(decodeBackup.p2BackupConfig.nodes).indexOf(rowArr[headerIdx.mac].ctx) !== -1) {
                    const nodeIp = rowArr[headerIdx.nodeIp].ctx;
                    matchNodeIpArray.push(nodeIp);
                    const mac = rowArr[headerIdx.mac].ctx;
                    const {config} = decodeBackup.p2BackupConfig.nodes[mac];

                    Object.keys(bodyMsg.sourceConfig.radioSettings[nodeIp]).forEach((radioName) => {
                        delete bodyMsg.sourceConfig.radioSettings[nodeIp][radioName].acl;
                    });

                    isConfigBackupMismatch[nodeIp] =
                        !Object.keys(bodyMsg.sourceConfig.radioSettings[nodeIp]).every(radioName =>
                            Object.keys(bodyMsg.sourceConfig.radioSettings[nodeIp][radioName]).every((opt) => {
                                if (config.radioSettings[radioName]) {
                                    return opt in config.radioSettings[radioName];
                                }
                                return false;
                            })
                        );

                    const operationModeUniqueSet = new Set(Object.keys(bodyMsg.sourceConfig.radioSettings[nodeIp])
                        .map(radioName => bodyMsg.sourceConfig.radioSettings[nodeIp][radioName].operationMode));
                    isOperationModeValid[nodeIp] = !(operationModeUniqueSet.has('static') && operationModeUniqueSet.has('mobile'));

                    Object.keys(config.radioSettings).forEach((radioName) => {
                        Object.keys(config.radioSettings[radioName]).forEach((key) => {
                            bodyMsg.sourceConfig.radioSettings[nodeIp][radioName][key] =
                                decodeBackup.p2BackupConfig.nodes[mac].config.radioSettings[radioName][key];
                        });
                        if (!('status' in config.radioSettings[radioName])) {
                            bodyMsg.sourceConfig.radioSettings[nodeIp][radioName].status =
                                config.radioSettings[radioName].operationMode !== 'disable' ? 'enable' : 'disable';
                        }
                    });
                    Object.keys(config.nodeSettings).forEach((opt) => {
                        bodyMsg.sourceConfig.nodeSettings[nodeIp][opt] =
                            decodeBackup.p2BackupConfig.nodes[mac].config.nodeSettings[opt];
                    });
                    if (config.ethernetSettings) {
                        Object.keys(config.ethernetSettings).forEach((ethName) => {
                            if (bodyMsg.sourceConfig.ethernetSettings[nodeIp][ethName]) {
                                Object.keys(config.ethernetSettings[ethName]).forEach((key) => {
                                    bodyMsg.sourceConfig.ethernetSettings[nodeIp][ethName][key] =
                                        config.ethernetSettings[ethName][key];
                                });
                            }
                        });
                    }

                    if (config.profileSettings) {
                        Object.keys(config.profileSettings).forEach((profileOpt) => {
                            Object.keys(config.profileSettings[profileOpt]).forEach((profileId) => {
                                Object.keys(config.profileSettings[profileOpt][profileId]).forEach((opt) => {
                                    bodyMsg.sourceConfig.profileSettings[nodeIp][profileOpt][profileId][opt] =
                                    config.profileSettings[profileOpt][profileId][opt];
                                })
                            });
                        });
                    }
                } else {
                    // will not add option for non-auto-matching-success node
                    delete bodyMsg.options.radioSettings[rowArr[headerIdx.nodeIp].ctx];
                    delete bodyMsg.options.ethernetSettings[rowArr[headerIdx.nodeIp].ctx];
                    delete bodyMsg.options.nodeSettings[rowArr[headerIdx.nodeIp].ctx];
                    if (bodyMsg.options?.profileSettings) {
                        delete bodyMsg.options.profileSettings[rowArr[headerIdx.nodeIp].ctx];
                    }
                }
            });
        } else {
            data.forEach((rowArr) => {
                if (Object.keys(decodeBackup.p2BackupConfig.nodes).indexOf(rowArr[headerIdx.mac].ctx) !== -1) {
                    const nodeIp = rowArr[headerIdx.nodeIp].ctx;
                    matchNodeIpArray.push(nodeIp);
                }
            })
        }
        // will not add option for radioSettings if no node is matched from backup file
        if (Object.keys(bodyMsg.options.radioSettings).length === 0) {
            delete bodyMsg.options.radioSettings;
        }
        if (Object.keys(bodyMsg.options.ethernetSettings).length === 0) {
            delete bodyMsg.options.ethernetSettings;
        }
        if (Object.keys(bodyMsg.options.nodeSettings).length === 0) {
            delete bodyMsg.options.nodeSettings;
        }
        if (bodyMsg.options?.profileSettings) {
            if (Object.keys(bodyMsg.options.profileSettings).length === 0) {
                delete bodyMsg.options.profileSettings;
            }
        }

        return {
            bodyMsg,
            isConfigBackupMismatch:
                Object.keys(isConfigBackupMismatch)
                    .some(nodeIp => isConfigBackupMismatch[nodeIp]),
            isOperationModeValid: Object.keys(isOperationModeValid)
                .every(nodeIp => isOperationModeValid[nodeIp]),
            matchNodeIpArray,
            isCountryCodeChanged,
        };
    }

    createConfigOptionRequest(getConfigObj, decodeBackup, mac) {
        // console.log(this.state.macToNodeIpMap);
        // console.log(mac);
        const {macToNodeIpMap, restoreFrom} = this.state;

        let isConfigBackupMismatch = false;
        const {config} = decodeBackup.p2BackupConfig.nodes[mac];
        const {checksums, ...Setting} = getConfigObj;
        const options = getOptionsFromGetConfigObj(Setting);
        const bodyMsg = {
            options,
            sourceConfig: Setting,
        };

        if (Object.keys(macToNodeIpMap) !== 0) {
            const nodeIp = macToNodeIpMap[restoreFrom.mac];
            Object.keys(bodyMsg.sourceConfig.radioSettings).forEach((radioSettingsNodeIp) => {
                if (radioSettingsNodeIp !== nodeIp) {
                    delete bodyMsg.sourceConfig.radioSettings[radioSettingsNodeIp];
                }
            });
            Object.keys(bodyMsg.sourceConfig.nodeSettings).forEach((nodeSettingsNodeIp) => {
                if (nodeSettingsNodeIp !== nodeIp) {
                    delete bodyMsg.sourceConfig.nodeSettings[nodeSettingsNodeIp];
                }
            });
            Object.keys(bodyMsg.sourceConfig.ethernetSettings).forEach((ethernetSettingsNodeIp) => {
                if (ethernetSettingsNodeIp !== nodeIp) {
                    delete bodyMsg.sourceConfig.ethernetSettings[ethernetSettingsNodeIp];
                }
            });
            if (Setting.profileSettings) {
                Object.keys(bodyMsg.sourceConfig.profileSettings).forEach((profileSettingsNodeIp) => {
                    if (profileSettingsNodeIp !== nodeIp) {
                        delete bodyMsg.sourceConfig.profileSettings[profileSettingsNodeIp];
                    }
                });
            }
            Object.keys(bodyMsg.sourceConfig.radioSettings[nodeIp]).forEach((radioName) => {
                // radioSettings[radioName] = Object.keys(bodyMsg.sourceConfig.radioSettings[nodeIp][radioName]);
                delete bodyMsg.sourceConfig.radioSettings[nodeIp][radioName].acl;
            });
            isConfigBackupMismatch = !Object.keys(bodyMsg.sourceConfig.radioSettings[nodeIp]).every(radioName =>
                Object.keys(bodyMsg.sourceConfig.radioSettings[nodeIp][radioName]).every((opt) => {
                    if (config.radioSettings[radioName]) {
                        return opt in config.radioSettings[radioName];
                    }
                    return false;
                })
            );
            // bodyMsg.options.radioSettings = {
            //     [nodeIp]: radioSettings,
            // };
            Object.keys(config.radioSettings).forEach((radioName) => {
                Object.keys(config.radioSettings[radioName]).forEach((key) => {
                    bodyMsg.sourceConfig.radioSettings[nodeIp][radioName][key] =
                        decodeBackup.p2BackupConfig.nodes[mac].config.radioSettings[radioName][key];
                });
                if (!('status' in config.radioSettings[radioName])) {
                    bodyMsg.sourceConfig.radioSettings[nodeIp][radioName].status =
                        config.radioSettings[radioName].operationMode !== 'disable' ? 'enable' : 'disable';
                }
            });
            Object.keys(config.nodeSettings).forEach((opt) => {
                bodyMsg.sourceConfig.nodeSettings[nodeIp][opt] =
                    decodeBackup.p2BackupConfig.nodes[mac].config.nodeSettings[opt];
            });
            if (config.ethernetSettings) {
                Object.keys(config.ethernetSettings).forEach((ethName) => {
                    if (bodyMsg.sourceConfig.ethernetSettings[nodeIp][ethName]) {
                        Object.keys(config.ethernetSettings[ethName]).forEach((key) => {
                            bodyMsg.sourceConfig.ethernetSettings[nodeIp][ethName][key] =
                                decodeBackup.p2BackupConfig.nodes[mac].config.ethernetSettings[ethName][key];
                        });
                    }
                });
            }
            if (config.profileSettings) {
                Object.keys(config.profileSettings).forEach((profileOpt) => {
                    Object.keys(config.profileSettings[profileOpt]).forEach((profileId) => {
                        Object.keys(config.profileSettings[profileOpt][profileId]).forEach((opt) => {
                            bodyMsg.sourceConfig.profileSettings[nodeIp][profileOpt][profileId][opt] =
                            config.profileSettings[profileOpt][profileId][opt];
                        })
                    });
                });
            }
            Object.keys(decodeBackup.p2BackupConfig.meshSettings).forEach((opt) => {
                bodyMsg.sourceConfig.meshSettings[opt] =
                    decodeBackup.p2BackupConfig.meshSettings[opt];
            });

            if (bodyMsg.options.radioSettings) {
                    Object.keys(bodyMsg.options.radioSettings).forEach((radioIp) => {
                    if (radioIp !== nodeIp) {
                        delete bodyMsg.options.radioSettings[radioIp];
                    }
                })
            }
            if (bodyMsg.options.ethernetSettings) {
                Object.keys(bodyMsg.options.ethernetSettings).forEach((ethernetIp) => {
                    if (ethernetIp !== nodeIp) {
                        delete bodyMsg.options.ethernetSettings[ethernetIp];
                    }
                })
            }
            if (bodyMsg.options.nodeSettings) {
                Object.keys(bodyMsg.options.nodeSettings).forEach((ethernetIp) => {
                    if (ethernetIp !== nodeIp) {
                        delete bodyMsg.options.nodeSettings[ethernetIp];
                    }
                })
            }
            if (bodyMsg.options.profileSettings) {
                Object.keys(bodyMsg.options.profileSettings).forEach((profielIp) => {
                    if (profielIp !== nodeIp) {
                        delete bodyMsg.options.profileSettings[profielIp];
                    }
                })
            }
        }
        console.log('kyle_debug ~ file: MeshWideRestore.jsx ~ line 2131 ~ MeshWideRestoreApp ~ getConfigError ~ bodyMsg', bodyMsg)
        return {bodyMsg, isConfigBackupMismatch};
    }

    async handleCollapse(event) {
        const mac = event.currentTarget.id;
        const {collapsedMac} = this.state.restoreTable.headers;
        const {collapsedData} = this.state.restoreTable;
        const {
            getConfigObj, decodeBackup, macToNodeIpMap, restoreFrom,
        } = this.state;
        const collapsedMacIndex = collapsedMac.indexOf(mac);
        let newCollapsedMac = [];


        if (collapsedMacIndex === -1) {
            newCollapsedMac = newCollapsedMac.concat(collapsedMac, mac);
        } else if (collapsedMacIndex === 0) {
            newCollapsedMac = newCollapsedMac.concat(collapsedMac.slice(1));
        } else if (collapsedMacIndex === collapsedMac.length - 1) {
            newCollapsedMac = newCollapsedMac.concat(collapsedMac.slice(0, -1));
        } else if (collapsedMacIndex > 0) {
            newCollapsedMac = newCollapsedMac.concat(
                collapsedMac.slice(0, collapsedMacIndex),
                collapsedMac.slice(collapsedMacIndex + 1)
            );
        }

        try {
            if (newCollapsedMac.indexOf(mac) !== -1) {
                const {bodyMsg} = this.createConfigOptionRequest(deepClone(getConfigObj),
                    decodeBackup, mac);
                const filterConfig = await getFilteredConfigOptions(this.props.csrf, this.props.projectId, bodyMsg);
                const ethernetSettings = get(decodeBackup.p2BackupConfig
                    .nodes[mac].config, ['ethernetSettings']) ?
                    get(decodeBackup.p2BackupConfig.nodes[mac].config, ['ethernetSettings']) :
                    getConfigObj.ethernetSettings[macToNodeIpMap[restoreFrom.mac]];
                const nodeSettings = decodeBackup.p2BackupConfig.nodes[mac].config.nodeSettings;
                const {
                    endtRecvTimeout, endtSendInterval, endtPriority,
                    atpcInterval, acs, acsInterval, acsChannelList
                } = nodeSettings;

                let {allowReboot} = nodeSettings;
                if (allowReboot !== undefined) {
                    allowReboot = allowReboot.toUpperCase();
                }

                collapsedData[mac] = (
                    <React.Fragment>
                        <span>
                            <span
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    flexWrap: 'wrap',
                                    padding: '15px 50px 0px 50px',
                                }}
                            >
                                <span style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    width: '100%',
                                    justifyContent: 'center',
                                }}
                                >
                                    <Typography
                                        style={{
                                            backgroundColor: theme.palette.primary.light,
                                            color: 'white',
                                            padding: '2px 10px 2px 10px',
                                            borderRadius: '35px',
                                            fontSize: '13px',
                                        }}
                                    >
                                        {this.t('nodeConfigTitle')}
                                    </Typography>
                                </span>
                            </span>
                            {
                                endtRecvTimeout !== undefined && endtSendInterval !== undefined && endtPriority !== undefined ?
                                (
                                    <span 
                                        style={{
                                            display: 'flex',
                                            flexDirection: 'row',
                                            width: '100%',
                                            justifyContent: 'space-evenly',
                                            alignItems: 'flex-start',
                                            marginTop: '25px',
                                            marginBottom: '25px',
                                        }}
                                    >
                                        <span
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Typography
                                                style={{
                                                    fontSize: '13px',
                                                    paddingBottom: '5px',
                                                    color: 'rgba(0, 0, 0, 0.38)',
                                                }}
                                            >
                                                {this.t('endtSendIntervalTitle')}
                                            </Typography>
                                            <Typography style={{
                                                fontSize: '18px',
                                                color: theme.palette.primary.main,
                                                fontWeight: '300',
                                            }}
                                            >
                                                {endtRecvTimeout}
                                            </Typography>
                                        </span>
                                        <span
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Typography
                                                style={{
                                                    fontSize: '13px',
                                                    paddingBottom: '5px',
                                                    color: 'rgba(0, 0, 0, 0.38)',
                                                }}
                                            >
                                                {this.t('endtRecvTimeoutTitle')}
                                            </Typography>
                                            <Typography style={{
                                                fontSize: '18px',
                                                color: theme.palette.primary.main,
                                                fontWeight: '300',
                                            }}
                                            >
                                                {endtSendInterval}
                                            </Typography>
                                        </span>
                                        <span
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Typography
                                                style={{
                                                    fontSize: '13px',
                                                    paddingBottom: '5px',
                                                    color: 'rgba(0, 0, 0, 0.38)',
                                                }}
                                            >
                                                {this.t('endtPriorityTitle')}
                                            </Typography>
                                            <Typography style={{
                                                fontSize: '18px',
                                                color: theme.palette.primary.main,
                                                fontWeight: '300',
                                            }}
                                            >
                                                {endtPriority}
                                            </Typography>
                                        </span>
                                    </span>
                                ) : null
                            }
                            <span 
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    width: '100%',
                                    justifyContent: 'space-evenly',
                                    alignItems: 'flex-start',
                                    marginTop: '25px',
                                    marginBottom: '25px',
                                }}
                            >
                                {
                                    allowReboot !== undefined && this.props.enableWatchdogConfig ?
                                    (
                                        <span
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Typography
                                                style={{
                                                    fontSize: '13px',
                                                    paddingBottom: '5px',
                                                    color: 'rgba(0, 0, 0, 0.38)',
                                                }}
                                            >
                                                {this.t('allowRebootTitle')}
                                            </Typography>
                                            <Typography style={{
                                                fontSize: '18px',
                                                color: theme.palette.primary.main,
                                                fontWeight: '300',
                                            }}
                                            >
                                                {allowReboot}
                                            </Typography>
                                        </span>
                                    ) : null
                                }
                                {
                                    atpcInterval !== undefined ?
                                    (
                                        <span
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Typography
                                                style={{
                                                    fontSize: '13px',
                                                    paddingBottom: '5px',
                                                    color: 'rgba(0, 0, 0, 0.38)',
                                                }}
                                            >
                                                {this.t('atpcIntervalTitle')}
                                            </Typography>
                                            <Typography style={{
                                                fontSize: '18px',
                                                color: theme.palette.primary.main,
                                                fontWeight: '300',
                                            }}
                                            >
                                                {atpcInterval}
                                            </Typography>
                                        </span>
                                    ) : null
                                }
                                {
                                    acs !== undefined ?
                                        (
                                            <span
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Typography
                                                    style={{
                                                        fontSize: '13px',
                                                        paddingBottom: '5px',
                                                        color: 'rgba(0, 0, 0, 0.38)',
                                                    }}
                                                >
                                                    {this.t('acsTitle')}
                                                </Typography>
                                                <Typography style={{
                                                    fontSize: '18px',
                                                    color: theme.palette.primary.main,
                                                    fontWeight: '300',
                                                }}
                                                >
                                                    {`${acs}`.toUpperCase()}
                                                </Typography>
                                            </span>
                                        ) : null
                                }
                                {
                                    acsInterval !== undefined ?
                                        (
                                            <span
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    alignItems: 'center',
                                                }}
                                            >
                                                <Typography
                                                    style={{
                                                        fontSize: '13px',
                                                        paddingBottom: '5px',
                                                        color: 'rgba(0, 0, 0, 0.38)',
                                                    }}
                                                >
                                                    {this.t('acsIntervalTitle')}
                                                </Typography>
                                                <Typography style={{
                                                    fontSize: '18px',
                                                    color: theme.palette.primary.main,
                                                    fontWeight: '300',
                                                }}
                                                >
                                                    {`${acsInterval}s`}
                                                </Typography>
                                            </span>
                                        ) : null
                                }
                            </span>
                            
                            <span
                                style={{
                                    display: 'flex',
                                    flexDirection: 'row',
                                    width: '100%',
                                    justifyContent: 'space-evenly',
                                    alignItems: 'flex-start',
                                    marginTop: '25px',
                                    marginBottom: '25px',
                                }}
                            >
                                {
                                    acsChannelList !== undefined ? 
                                    (
                                        <span
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                alignItems: 'center',
                                            }}
                                        >
                                            <Typography
                                                style={{
                                                    fontSize: '13px',
                                                    paddingBottom: '5px',
                                                    color: 'rgba(0, 0, 0, 0.38)',
                                                }}
                                            >
                                                {this.t('acsChannelListTitle')}
                                            </Typography>
                                            <Typography style={{
                                                fontSize: '18px',
                                                color: theme.palette.primary.main,
                                                fontWeight: '300',
                                            }}
                                            >
                                                {acsChannelList.join(',')}
                                            </Typography>
                                        </span>
                                    ) : null
                                }
                            </span>

                        </span>
                        <span>
                            {
                                Object.keys(decodeBackup.p2BackupConfig.nodes[mac].config.radioSettings)
                                    .map((radio) => {
                                        let status = '';
                                        let operationMode = '';
                                        if (typeof decodeBackup.p2BackupConfig.nodes[mac].config
                                            .radioSettings[radio].status !== 'undefined') {
                                            status = decodeBackup.p2BackupConfig.nodes[mac].config
                                                .radioSettings[radio].status !== 'disable';
                                            operationMode =
                                                this.getFilterConfigOption(decodeBackup.p2BackupConfig.nodes[mac].config
                                                    .radioSettings[radio].operationMode,
                                                mac, filterConfig, radio, 'operationMode');
                                        } else {
                                            status = decodeBackup.p2BackupConfig.nodes[mac].config
                                                .radioSettings[radio].operationMode !== 'disable';
                                            operationMode =
                                                this.getFilterConfigOption(
                                                    decodeBackup.p2BackupConfig.nodes[mac].config
                                                        .radioSettings[radio].operationMode,
                                                    mac, filterConfig, radio, 'operationMode');
                                        }

                                        const showBand = typeof decodeBackup.p2BackupConfig.nodes[mac].config
                                            .radioSettings[radio].band !== 'undefined';
                                        const showCentralFreq = showBand &&
                                            decodeBackup.p2BackupConfig.nodes[mac].config
                                                .radioSettings[radio].band === '4.9';
                                        const rssiFilterTolerance = get(decodeBackup.p2BackupConfig
                                            .nodes[mac].config, ['radioSettings', radio, 'rssiFilterTolerance']) ?
                                            get(decodeBackup.p2BackupConfig
                                                .nodes[mac].config, ['radioSettings', radio, 'rssiFilterTolerance']) :
                                            getConfigObj.radioSettings[macToNodeIpMap[restoreFrom.mac]][radio]
                                                .rssiFilterTolerance;
                                        let rssiFilterUpper = get(decodeBackup.p2BackupConfig
                                            .nodes[mac].config, ['radioSettings', radio, 'rssiFilterUpper']) ?
                                            get(decodeBackup.p2BackupConfig
                                                .nodes[mac].config, ['radioSettings', radio, 'rssiFilterUpper']) :
                                            getConfigObj.radioSettings[macToNodeIpMap[restoreFrom.mac]][radio]
                                                .rssiFilterUpper;
                                        let rssiFilterLower = get(decodeBackup.p2BackupConfig
                                            .nodes[mac].config, ['radioSettings', radio, 'rssiFilterLower']) ?
                                            get(decodeBackup.p2BackupConfig
                                                .nodes[mac].config, ['radioSettings', radio, 'rssiFilterLower']) :
                                            getConfigObj.radioSettings[macToNodeIpMap[restoreFrom.mac]][radio]
                                                .rssiFilterLower;
                                        const mcs = get(decodeBackup.p2BackupConfig
                                            .nodes[mac].config, ['radioSettings', radio, 'mcs']) ?
                                            get(decodeBackup.p2BackupConfig
                                                .nodes[mac].config, ['radioSettings', radio, 'mcs']) :
                                            getConfigObj.radioSettings[macToNodeIpMap[restoreFrom.mac]][radio]
                                                .mcs;
                                        const shortgi = get(decodeBackup.p2BackupConfig
                                            .nodes[mac].config, ['radioSettings', radio, 'shortgi']) ?
                                            get(decodeBackup.p2BackupConfig
                                                .nodes[mac].config, ['radioSettings', radio, 'shortgi']) :
                                            getConfigObj.radioSettings[macToNodeIpMap[restoreFrom.mac]][radio]
                                                .shortgi;
                                        const rtsCts = decodeBackup.p2BackupConfig.nodes[mac].config?.radioSettings?.[radio]?.rtsCts ??
                                            getConfigObj.radioSettings[macToNodeIpMap[restoreFrom.mac]][radio].rtsCts;
                                        rssiFilterUpper = rssiFilterUpper === 255 ?
                                            'DISABLED' :
                                            `${rssiFilterUpper}${this.t('dbmLbl')}`;
                                        rssiFilterLower = rssiFilterLower === 255 ?
                                            'DISABLED' :
                                            `${rssiFilterLower}${this.t('dbmLbl')}`;
                                        const atpcTargetRssi = get(decodeBackup.p2BackupConfig
                                            .nodes[mac].config, ['radioSettings', radio, 'atpcTargetRssi']) ?
                                            get(decodeBackup.p2BackupConfig
                                                .nodes[mac].config, ['radioSettings', radio, 'atpcTargetRssi']) :
                                            getConfigObj.radioSettings[macToNodeIpMap[restoreFrom.mac]][radio]
                                                .atpcTargetRssi;
                                        const atpcRangeUpper = get(decodeBackup.p2BackupConfig
                                            .nodes[mac].config, ['radioSettings', radio, 'atpcRangeUpper']) ?
                                            get(decodeBackup.p2BackupConfig
                                                .nodes[mac].config, ['radioSettings', radio, 'atpcRangeUpper']) :
                                            getConfigObj.radioSettings[macToNodeIpMap[restoreFrom.mac]][radio]
                                                .atpcRangeUpper;
                                        const atpcRangeLower = get(decodeBackup.p2BackupConfig
                                            .nodes[mac].config, ['radioSettings', radio, 'atpcRangeLower']) ?
                                            get(decodeBackup.p2BackupConfig
                                                .nodes[mac].config, ['radioSettings', radio, 'atpcRangeLower']) :
                                            getConfigObj.radioSettings[macToNodeIpMap[restoreFrom.mac]][radio]
                                                .atpcRangeLower;
                                        return (
                                            <span
                                                key={radio}
                                                style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    flexWrap: 'wrap',
                                                    padding: '15px 50px 0px 50px',
                                                }}
                                            >
                                                <span style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    width: '100%',
                                                    justifyContent: 'center',
                                                }}
                                                >
                                                    <Typography
                                                        style={{
                                                            backgroundColor: theme.palette.primary.light,
                                                            color: 'white',
                                                            padding: '2px 10px 2px 10px',
                                                            borderRadius: '35px',
                                                            fontSize: '13px',
                                                        }}
                                                    >
                                                        {this.t(`radioTitle.${radio}`)}
                                                    </Typography>
                                                </span>
                                                <span style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    width: '100%',
                                                    justifyContent: 'space-evenly',
                                                    alignItems: 'flex-start',
                                                    marginTop: '25px',
                                                    marginBottom: '25px',
                                                }}
                                                >
                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                        }}
                                                        key="stauts"
                                                    >
                                                        <Typography
                                                            style={{
                                                                fontSize: '13px',
                                                                paddingBottom: '5px',
                                                                color: 'rgba(0, 0, 0, 0.38)',
                                                            }}
                                                        >
                                                            {this.t('stautsLbl')}
                                                        </Typography>
                                                        <span>
                                                            {status ?
                                                                (
                                                                    <i
                                                                        className="material-icons"
                                                                        style={{
                                                                            fontSize: '24px',
                                                                            color: colors.activeGreen,
                                                                        }}
                                                                    >done</i>
                                                                ) : (
                                                                    <i
                                                                        className="material-icons"
                                                                        style={{
                                                                            fontSize: '26px',
                                                                            color: colors.inactiveRed,
                                                                        }}
                                                                    >clear</i>
                                                                )
                                                            }
                                                        </span>
                                                    </span>
                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                        }}
                                                        key="operationMode"
                                                    >
                                                        <Typography
                                                            style={{
                                                                fontSize: '13px',
                                                                paddingBottom: '5px',
                                                                color: 'rgba(0, 0, 0, 0.38)',
                                                            }}
                                                        >
                                                            {this.t('operationModeLbl')}
                                                        </Typography>
                                                        <Typography style={{
                                                            fontSize: '18px',
                                                            color: theme.palette.primary.main,
                                                            fontWeight: '300',
                                                        }}
                                                        >
                                                            {operationMode.toUpperCase()}
                                                        </Typography>
                                                    </span>
                                                </span>
                                                <span style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    width: '100%',
                                                    justifyContent: 'space-evenly',
                                                    alignItems: 'flex-start',
                                                    marginTop: '10px',
                                                    marginBottom: '25px',
                                                }}
                                                >
                                                    {
                                                        showBand &&
                                                        <span
                                                            style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                alignItems: 'center',
                                                                width: '65px',
                                                            }}
                                                            key="band"
                                                        >
                                                            <Typography
                                                                style={{
                                                                    fontSize: '13px',
                                                                    paddingBottom: '5px',
                                                                    color: 'rgba(0, 0, 0, 0.38)',
                                                                }}
                                                            >
                                                                {this.t('bandLbl')}
                                                            </Typography>
                                                            <Typography style={{
                                                                fontSize: '18px',
                                                                color: theme.palette.primary.main,
                                                                fontWeight: '300',
                                                            }}
                                                            >
                                                                {this.getFilterConfigOption(decodeBackup
                                                                    .p2BackupConfig.nodes[mac]
                                                                    .config.radioSettings[radio].band,
                                                                mac, filterConfig, radio, 'band')}
                                                            </Typography>
                                                        </span>
                                                    }
                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                        }}
                                                        key="channel"
                                                    >
                                                        <Typography
                                                            style={{
                                                                fontSize: '13px',
                                                                paddingBottom: '5px',
                                                                color: 'rgba(0, 0, 0, 0.38)',
                                                            }}
                                                        >
                                                            {this.t('channelBandwidthLbl')}
                                                        </Typography>
                                                        <Typography style={{
                                                            fontSize: '18px',
                                                            color: theme.palette.primary.main,
                                                            fontWeight: '300',
                                                        }}
                                                        >
                                                            {
                                                                this.getFilterConfigOption(decodeBackup
                                                                    .p2BackupConfig.nodes[mac]
                                                                    .config.radioSettings[radio].channelBandwidth,
                                                                mac, filterConfig, radio, 'channelBandwidth')}
                                                        </Typography>
                                                    </span>
                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                        }}
                                                        key={showCentralFreq ?
                                                            'centralFreq' : 'channelBandWidth'}
                                                    >
                                                        <Typography
                                                            style={{
                                                                fontSize: '13px',
                                                                paddingBottom: '5px',
                                                                color: 'rgba(0, 0, 0, 0.38)',
                                                            }}
                                                        >
                                                            {this.t('channelCentralFreqLbl')}
                                                        </Typography>
                                                        <Typography style={{
                                                            fontSize: '18px',
                                                            color: theme.palette.primary.main,
                                                            fontWeight: '300',
                                                        }}
                                                        >
                                                            {
                                                                showCentralFreq ?
                                                                    this.getFilterConfigOption(decodeBackup
                                                                        .p2BackupConfig.nodes[mac]
                                                                        .config.radioSettings[radio].centralFreq,
                                                                    mac, filterConfig, radio, 'centralFreq') :
                                                                    `${this.t('channelTag')}
                                                                    ${this.getFilterConfigOption(decodeBackup
                                                                        .p2BackupConfig.nodes[mac]
                                                                        .config.radioSettings[radio].channel,
                                            mac, filterConfig, radio, 'channel')}`
                                                            }
                                                        </Typography>
                                                    </span>
                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                        }}
                                                        key="txpower"
                                                    >
                                                        <Typography
                                                            style={{
                                                                fontSize: '13px',
                                                                paddingBottom: '5px',
                                                                color: 'rgba(0, 0, 0, 0.38)',
                                                            }}
                                                        >
                                                            {this.t('txpowerLbl')}
                                                        </Typography>
                                                        <Typography style={{
                                                            fontSize: '18px',
                                                            color: theme.palette.primary.main,
                                                            fontWeight: '300',
                                                        }}
                                                        >
                                                            {this.getFilterConfigOption(decodeBackup
                                                                .p2BackupConfig.nodes[mac]
                                                                .config.radioSettings[radio].txpower,
                                                            mac, filterConfig, radio, 'txpower')}
                                                        </Typography>
                                                    </span>
                                                </span>
                                                <Typography
                                                    classes={{
                                                        root: this.props.classes.breakthroughLine,
                                                    }}
                                                >
                                                    <span
                                                        style={{
                                                            background: 'rgba(155, 154, 154, 0.3)',
                                                            position: 'absolute',
                                                            height: '1px',
                                                            display: 'block',
                                                            top: '50%',
                                                            width: '100%',
                                                        }}
                                                    />
                                                    <span style={{
                                                        backgroundColor: '#FFFFFF',
                                                        zIndex: '20',
                                                        position: 'relative',
                                                        textAlign: 'center',
                                                        padding: '0 10px',
                                                        color: '#9a9a9a',
                                                        fontSize: '15px',
                                                        fontWeight: '500',
                                                    }}
                                                    >
                                                        {this.t('advancedConfigTitle')}
                                                    </span>
                                                </Typography>
                                                <span style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    width: '100%',
                                                    justifyContent: 'space-evenly',
                                                    alignItems: 'center',
                                                    margin: '10px 0px',
                                                    marginTop: '25px',
                                                }}
                                                >
                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                        }}
                                                        key="maxNbr"
                                                    >
                                                        <Typography
                                                            style={{
                                                                fontSize: '13px',
                                                                paddingBottom: '5px',
                                                                color: 'rgba(0, 0, 0, 0.38)',
                                                            }}
                                                        >
                                                            {this.t('maxNbrTitle')}
                                                        </Typography>
                                                        <Typography
                                                            style={{
                                                                fontSize: '18px',
                                                                color: theme.palette.primary.main,
                                                                fontWeight: '300',
                                                            }}
                                                        >
                                                            {
                                                                this.getFilterConfigOption(decodeBackup
                                                                    .p2BackupConfig.nodes[mac]
                                                                    .config.radioSettings[radio].maxNbr,
                                                                mac, filterConfig, radio, 'maxNbr') === 'Unlimited' ?
                                                                    'UNLIMITED' :
                                                                    this.getFilterConfigOption(decodeBackup
                                                                        .p2BackupConfig.nodes[mac]
                                                                        .config.radioSettings[radio].maxNbr,
                                                                    mac, filterConfig, radio, 'maxNbr')
                                                            }
                                                        </Typography>
                                                    </span>
                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                        }}
                                                        key="radioFilter"
                                                    >
                                                        <Typography
                                                            style={{
                                                                fontSize: '13px',
                                                                paddingBottom: '5px',
                                                                color: 'rgba(0, 0, 0, 0.38)',
                                                            }}
                                                        >
                                                            {this.t('radioFilterLbl')}
                                                        </Typography>
                                                        <span>
                                                            {decodeBackup.p2BackupConfig.nodes[mac]
                                                                .config.radioSettings[radio].radioFilter === 'enable' ?
                                                                (
                                                                    <i
                                                                        className="material-icons"
                                                                        style={{
                                                                            fontSize: '24px',
                                                                            color: colors.activeGreen,
                                                                        }}
                                                                    >done</i>
                                                                ) : (
                                                                    <i
                                                                        className="material-icons"
                                                                        style={{
                                                                            fontSize: '26px',
                                                                            color: colors.inactiveRed,
                                                                        }}
                                                                    >clear</i>
                                                                )
                                                            }
                                                        </span>
                                                    </span>
                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            width: '80px',
                                                        }}
                                                        key="distance"
                                                    >
                                                        <Typography
                                                            style={{
                                                                fontSize: '13px',
                                                                paddingBottom: '5px',
                                                                color: 'rgba(0, 0, 0, 0.38)',
                                                            }}
                                                        >
                                                            {this.t('distanceLbl')}
                                                        </Typography>
                                                        <Typography style={{
                                                            fontSize: '18px',
                                                            color: theme.palette.primary.main,
                                                            fontWeight: '300',
                                                        }}
                                                        >
                                                            {typeof decodeBackup.p2BackupConfig.nodes[mac]
                                                                .config.radioSettings[radio].distance !== 'string' ?
                                                                `${decodeBackup.p2BackupConfig.nodes[mac]
                                                                    .config.radioSettings[radio]
                                                                    .distance} ${this.t('distanceUnit')}` :
                                                                this.t('distanceDefaultLbl')}
                                                        </Typography>
                                                    </span>
                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                        }}
                                                        key="mcs"
                                                    >
                                                        <Typography
                                                            style={{
                                                                fontSize: '13px',
                                                                paddingBottom: '5px',
                                                                color: 'rgba(0, 0, 0, 0.38)',
                                                            }}
                                                        >
                                                            {this.t('mcsTitle')}
                                                        </Typography>
                                                        <Typography
                                                            style={{
                                                                fontSize: '18px',
                                                                color: theme.palette.primary.main,
                                                                fontWeight: '300',
                                                            }}
                                                        >
                                                            {this.getFilterConfigOption(
                                                                mcs, mac, filterConfig, radio, 'mcs')
                                                                .toUpperCase()}
                                                        </Typography>
                                                    </span>
                                                </span>
                                                <span style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    width: '100%',
                                                    justifyContent: 'space-evenly',
                                                    margin: '10px 0px',
                                                    marginTop: '25px',
                                                }}
                                                >
                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                        }}
                                                        key="shortgi"
                                                    >
                                                        <Typography
                                                            style={{
                                                                fontSize: '13px',
                                                                paddingBottom: '5px',
                                                                color: 'rgba(0, 0, 0, 0.38)',
                                                            }}
                                                        >
                                                            {this.t('shortgiTitle')}
                                                        </Typography>
                                                        <Typography
                                                            style={{
                                                                fontSize: '18px',
                                                                color: theme.palette.primary.main,
                                                                fontWeight: '300',
                                                            }}
                                                        >
                                                            {shortgi === 'enable' ?
                                                                (
                                                                    <i
                                                                        className="material-icons"
                                                                        style={{
                                                                            fontSize: '24px',
                                                                            color: colors.activeGreen,
                                                                        }}
                                                                    >done</i>
                                                                ) : (
                                                                    <i
                                                                        className="material-icons"
                                                                        style={{
                                                                            fontSize: '26px',
                                                                            color: colors.inactiveRed,
                                                                        }}
                                                                    >clear</i>
                                                                )
                                                            }
                                                        </Typography>
                                                    </span>
                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                        }}
                                                        key="rtsCts"
                                                    >
                                                        <Typography
                                                            style={{
                                                                fontSize: '13px',
                                                                paddingBottom: '5px',
                                                                color: 'rgba(0, 0, 0, 0.38)',
                                                            }}
                                                        >
                                                            {this.t('rtsCtsTitle')}
                                                        </Typography>
                                                        <Typography
                                                            style={{
                                                                fontSize: '18px',
                                                                color: theme.palette.primary.main,
                                                                fontWeight: '300',
                                                            }}
                                                        >
                                                            {rtsCts === 'enable' ?
                                                                (
                                                                    <i
                                                                        className="material-icons"
                                                                        style={{
                                                                            fontSize: '24px',
                                                                            color: colors.activeGreen,
                                                                        }}
                                                                    >done</i>
                                                                ) : (
                                                                    <i
                                                                        className="material-icons"
                                                                        style={{
                                                                            fontSize: '26px',
                                                                            color: colors.inactiveRed,
                                                                        }}
                                                                    >clear</i>
                                                                )
                                                            }
                                                        </Typography>
                                                    </span>
                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                        }}
                                                        key="rssiFilterTolerance"
                                                    >
                                                        <Typography
                                                            style={{
                                                                fontSize: '13px',
                                                                paddingBottom: '5px',
                                                                color: 'rgba(0, 0, 0, 0.38)',
                                                            }}
                                                        >
                                                            {this.t('rssiFilterToleranceTitle')}
                                                        </Typography>
                                                        <Typography
                                                            style={{
                                                                fontSize: '18px',
                                                                color: theme.palette.primary.main,
                                                                fontWeight: '300',
                                                            }}
                                                        >
                                                            {`${rssiFilterTolerance} ${this.t('dbmLbl')}`}
                                                        </Typography>
                                                    </span>
                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            padding: '0px 20px',
                                                        }}
                                                        key="rssiFilterUpperLower"
                                                    >
                                                        <span
                                                            style={{
                                                                display: 'flex',
                                                                flexDirection: 'column',
                                                                flexWrap: 'nowrap',
                                                                alignItems: 'center',
                                                                paddingBottom: '5px',
                                                            }}
                                                        >
                                                            <Typography
                                                                style={{
                                                                    fontSize: '13px',
                                                                    color: 'rgba(0, 0, 0, 0.38)',
                                                                }}
                                                            >
                                                                {this.t('rssiFilterUpperLowerTitle')}
                                                            </Typography>
                                                            <Typography
                                                                style={{
                                                                    fontSize: '13px',
                                                                    color: 'rgba(0, 0, 0, 0.38)',
                                                                }}
                                                            >
                                                                {this.t('rssiFilterUpperLowerTitle1')}
                                                            </Typography>
                                                        </span>
                                                        <span
                                                            style={{
                                                                fontSize: '18px',
                                                                color: theme.palette.primary.main,
                                                                display: 'flex',
                                                                flexWrap: 'nowrap',
                                                                fontWeight: '300',
                                                            }}
                                                        >
                                                            {
                                                                rssiFilterLower !== 'DISABLED' ?
                                                                    <Typography style={{fontWeight: '300'}}>
                                                                        {rssiFilterLower}
                                                                    </Typography>
                                                                    :
                                                                    <Typography
                                                                        style={{
                                                                            color: colors.tagTxt,
                                                                            fontWeight: '300',
                                                                        }}
                                                                    >
                                                                        {rssiFilterLower}
                                                                    </Typography>
                                                            }
                                                            {
                                                                <Typography style={{padding: '0px 5px'}}>
                                                                    /
                                                                </Typography>
                                                            }
                                                            {
                                                                rssiFilterUpper !== 'DISABLED' ?
                                                                    <Typography style={{fontWeight: '300'}}>
                                                                        {rssiFilterUpper}
                                                                    </Typography>
                                                                    :
                                                                    <Typography
                                                                        style={{
                                                                            color: colors.tagTxt,
                                                                            fontWeight: '300',
                                                                        }}
                                                                    >
                                                                        {rssiFilterUpper}
                                                                    </Typography>
                                                            }
                                                        </span>
                                                    </span>
                                                </span>
                                                <span style={{
                                                    display: 'flex',
                                                    flexDirection: 'row',
                                                    width: '100%',
                                                    justifyContent: 'space-evenly',
                                                    margin: '10px 0px',
                                                    marginTop: '25px',
                                                }}
                                                >
                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                        }}
                                                        key="atpcTargetRssi"
                                                    >
                                                        <Typography
                                                            style={{
                                                                fontSize: '13px',
                                                                paddingBottom: '5px',
                                                                color: 'rgba(0, 0, 0, 0.38)',
                                                            }}
                                                        >
                                                            {this.t('atpcTargetRssiTitle')}
                                                        </Typography>
                                                        <Typography
                                                            style={{
                                                                fontSize: '18px',
                                                                color: theme.palette.primary.main,
                                                                fontWeight: '300',
                                                            }}
                                                        >
                                                            {`${atpcTargetRssi} ${this.t('dbmLbl')}`}
                                                        </Typography>
                                                    </span>
                                                    <span
                                                        style={{
                                                            display: 'flex',
                                                            flexDirection: 'column',
                                                            alignItems: 'center',
                                                            justifyContent: 'space-between',
                                                        }}
                                                        key="atpcRssiRange"
                                                    >
                                                        <Typography
                                                            style={{
                                                                fontSize: '13px',
                                                                paddingBottom: '5px',
                                                                color: 'rgba(0, 0, 0, 0.38)',
                                                            }}
                                                        >
                                                            {this.t('atpcRssiRangeTitle')}
                                                        </Typography>
                                                        <Typography
                                                            style={{
                                                                fontSize: '18px',
                                                                color: theme.palette.primary.main,
                                                                fontWeight: '300',
                                                            }}
                                                        >
                                                            {`${atpcRangeLower} / ${atpcRangeUpper}`}
                                                        </Typography>
                                                    </span>
                                                </span>
                                            </span>
                                        );
                                    })
                            }
                        </span>
                        <span>
                            {
                                Object.keys(getConfigObj.ethernetSettings[macToNodeIpMap[restoreFrom.mac]])
                                    .map(ethName => (
                                        <span
                                            key={ethName}
                                            style={{
                                                display: 'flex',
                                                flexDirection: 'column',
                                                flexWrap: 'wrap',
                                                padding: '15px 50px 0px 50px',
                                            }}
                                        >
                                            <span style={{
                                                display: 'flex',
                                                flexDirection: 'row',
                                                width: '100%',
                                                marginBottom: '25px',
                                                justifyContent: 'center',
                                            }}
                                            >
                                                <Typography
                                                    style={{
                                                        backgroundColor: theme.palette.primary.light,
                                                        color: 'white',
                                                        padding: '2px 10px 2px 10px',
                                                        borderRadius: '35px',
                                                        fontSize: '13px',
                                                    }}
                                                >
                                                    {this.t(`ethTitle.${ethName}`)}
                                                </Typography>
                                            </span>
                                            <span
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'space-evenly',
                                                    alignItems: 'flex-start',
                                                }}
                                            >
                                                <span
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                    key="ethernetLink"
                                                >
                                                    <Typography
                                                        style={{
                                                            fontSize: '13px',
                                                            color: 'rgba(0, 0, 0, 0.38)',
                                                            paddingBottom: '5px',
                                                        }}
                                                    >
                                                        {this.t('ethernetLinkTitle')}
                                                    </Typography>
                                                    <span>
                                                        {ethernetSettings[ethName].ethernetLink === 'enable' ?
                                                            (
                                                                <i
                                                                    className="material-icons"
                                                                    style={{
                                                                        fontSize: '24px',
                                                                        color: colors.activeGreen,
                                                                    }}
                                                                >done</i>
                                                            ) : (
                                                                <i
                                                                    className="material-icons"
                                                                    style={{
                                                                        fontSize: '26px',
                                                                        color: colors.inactiveRed,
                                                                    }}
                                                                >clear</i>
                                                            )
                                                        }
                                                    </span>
                                                </span>
                                                <span
                                                    style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                    }}
                                                    key="mtu"
                                                >
                                                    <Typography
                                                        style={{
                                                            fontSize: '13px',
                                                            color: 'rgba(0, 0, 0, 0.38)',
                                                            paddingBottom: '5px',
                                                        }}
                                                    >
                                                        {this.t('mtuTitle')}
                                                    </Typography>
                                                    <span>
                                                        {get(ethernetSettings[ethName], ['mtu']) ?
                                                            <Typography style={{
                                                                fontSize: '18px',
                                                                color: theme.palette.primary.main,
                                                                fontWeight: '300',
                                                            }}
                                                            >
                                                                {`${get(ethernetSettings[ethName],
                                                                    ['mtu'])} ${this.t('byteLbl')}`}
                                                            </Typography>
                                                            :
                                                            <Typography style={{
                                                                fontSize: '18px',
                                                                color: theme.palette.primary.main,
                                                                fontWeight: '300',
                                                            }}
                                                            >
                                                                {`${getConfigObj
                                                                    // eslint-disable-next-line max-len
                                                                    .ethernetSettings[macToNodeIpMap[restoreFrom.mac]][ethName]
                                                                    .mtu} ${this.t('byteLbl')}`}
                                                            </Typography>
                                                        }
                                                    </span>
                                                </span>
                                            </span>
                                        </span>
                                    ))
                            }
                        </span>
                    </React.Fragment>
                );
            }

            this.setState({
                restoreTable: {
                    ...this.state.restoreTable,
                    headers: {
                        ...this.state.restoreTable.headers,
                        collapsedMac: newCollapsedMac,
                    },
                    collapsedData,
                },
            }, () => this.reRenderRestoreTableActionCompoent(mac));
        } catch (e) {
            const {title, content} = check(e);
            this.setState({
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: title !== '' ? title : this.t('setConfigFailTitle'),
                    content: title !== '' ? content : this.t('getConfigFailDefault'),
                    submitTitle: this.t('defaultButtonLbl'),
                    submitFn: this.handleDialogOnClose,
                    cancelTitle: '',
                    cancelFn: this.handleDialogOnClose,
                },
            });
        }
    }

    reRenderRestoreTableActionCompoent(mac, allRerender = false, cb) {
        const {data} = this.state.restoreTable;

        const newData = data.map((dataRow) => {
            const newDataRow = [...dataRow];
            if (newDataRow[restoreHeaderIdx.mac].ctx === mac ||
                allRerender) {
                newDataRow[restoreHeaderIdx.action] = {
                    ctx: (
                        <div>
                            {this.createCollpaseButton(
                                newDataRow[restoreHeaderIdx.mac].ctx
                            )}
                        </div>
                    ),
                    type: 'component',
                };
            }
            return newDataRow;
        });

        this.setState({
            restoreTable: {
                ...this.state.restoreTable,
                data: newData,
            },
        }, () => {
            if (cb) cb();
        });
    }

    createCollpaseButton(mac, error = false) {
        const {collapsedMac} = this.state.restoreTable.headers;
        // console.log('createCollpaseButton(collpaseArray): ', collapsedMac);
        // console.log('createCollpaseButton(mac): ', mac);
        if (collapsedMac.indexOf(mac) !== -1) {
            // console.log('upButton');
        } else {
            // console.log('downButton');
        }

        const icon = collapsedMac.indexOf(mac) !== -1 ?
            (
                <i
                    className="material-icons"
                >keyboard_arrow_up
                </i>
            ) :
            (
                <i
                    className="material-icons"
                >keyboard_arrow_down
                </i>
            );
        return (
            <IconButton
                color="primary"
                onClick={this.handleCollapse}
                aria-label="add"
                id={mac}
                disabled={error}
            >
                {icon}
            </IconButton>
        );
    }

    handleAddAll() {
        const {selectedMAC, skippedMAC} = this.state.table.headers;

        const newSkippedMAC = skippedMAC.filter(skipped =>
            selectedMAC.every(selected => selected !== skipped));
        // console.log('newSkippedMAC (handleAddAll): ', newSkippedMAC);

        this.setState({
            ...this.state,
            table: {
                ...this.state.table,
                headers: {
                    ...this.state.table.headers,
                    skippedMAC: newSkippedMAC,
                    selectedMAC: [],
                    selectedId: [],
                },
            },
        });
    }

    createAddAllButton() {
        const content = (
            <IconButton
                color="inherit"
                onClick={this.handleAddAll}
                aria-label="Add All"
            >
                <i
                    className="material-icons"
                >playlist_add</i>
            </IconButton>
        );
        return (
            <P2Tooltip
                title={this.t('resumeRestoreNodeTooltipLbl')}
                content={content}
                key="addAllBtn"
            />
        );
    }

    handleDeleteAll() {
        const {selectedMAC, skippedMAC} = this.state.table.headers;

        const newSkippedMAC = [...new Set([...selectedMAC, ...skippedMAC])];
        // console.log('newSkippedMAC (handleDeleteAll): ', newSkippedMAC);

        this.setState({
            ...this.state,
            table: {
                ...this.state.table,
                headers: {
                    ...this.state.table.headers,
                    skippedMAC: newSkippedMAC,
                    selectedMAC: [],
                    selectedId: [],
                },
            },
        });
    }

    createDeleteAllButton() {
        const content = (
            <IconButton
                color="inherit"
                onClick={this.handleDeleteAll}
                aria-label="Delete All"
            >
                <i
                    className="material-icons"
                >not_interested</i>
            </IconButton>
        );
        return (
            <P2Tooltip
                title={this.t('skipRestoreNodeTooltipLbl')}
                content={content}
                key="deleteAllBtn"
            />
        );
    }

    handleRestoreData() {
        // console.log('handleRestoreData: ');
        const {decodeBackup, invalidFilterConfig} = this.state;
        const collapsedData = {};
        // console.log('decodeBackUp: ', decodeBackup);
        const {data} = this.state.table;

        const newData = data.map((rowArr) => {
            const newRowArr = [...rowArr];
            let invalidMatch = false;
            // console.log('restore match: ', Object.keys(decodeBackup.p2BackupConfig.nodes)
                // .indexOf(newRowArr[headerIdx.mac].ctx));
            const invalidFilterConfigRadioSettings = get(invalidFilterConfig, ['radioSettings']);
            if (invalidFilterConfigRadioSettings) {
                invalidMatch = Object.keys(invalidFilterConfigRadioSettings)
                    .indexOf(newRowArr[headerIdx.nodeIp].ctx) !== -1;
            }
            if (
                Object.keys(decodeBackup.p2BackupConfig.nodes).indexOf(newRowArr[headerIdx.mac].ctx) !== -1 &&
                !invalidMatch
            ) {
                // newRowArr[headerIdx.restore].ctx = `${decodeBackup.p2BackupConfig.nodes[newRowArr[headerIdx.mac].ctx]
                //     .config.nodeSettings.hostname} (${newRowArr[headerIdx.mac].ctx})`;
                newRowArr[headerIdx.restore].ctx = newRowArr[headerIdx.mac].ctx;
                newRowArr[headerIdx.action].ctx = (
                    <span
                        style={{
                            // width: '250px',
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {this.t('clusterAndNodeRestoreLbl')}
                        <span style={{
                            marginLeft: 'auto',
                        }}
                        >
                            <P2Tooltip
                                title={this.t('chooseRestoreNodeTooltipLbl')}
                                content={this.createRestoreFromButton(newRowArr[headerIdx.mac].ctx,
                                    newRowArr[headerIdx.hostname].ctx, newRowArr[headerIdx.model].ctx)}
                            />
                            <P2Tooltip
                                title={this.state.table.headers.skippedMAC
                                    .indexOf(newRowArr[headerIdx.mac].ctx) !== -1 ?
                                    this.t('resumeRestoreNodeTooltipLbl') :
                                    this.t('skipRestoreNodeTooltipLbl')}
                                content={this.createSkipRestoreButton(newRowArr[headerIdx.mac].ctx)}
                            />
                        </span>
                    </span>
                );
            } else {
                newRowArr[headerIdx.restore].ctx = '-';
                newRowArr[headerIdx.action].ctx = (
                    <span
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        {this.t('clusterAndNodeRestoreLbl')}
                        <span style={{
                            marginLeft: 'auto',
                        }}
                        >
                            <P2Tooltip
                                title={this.t('chooseRestoreNodeTooltipLbl')}
                                content={this.createRestoreFromButton(newRowArr[headerIdx.mac].ctx,
                                    newRowArr[headerIdx.hostname].ctx, newRowArr[headerIdx.model].ctx)}
                            />
                        </span>
                    </span>
                );
            }
            return newRowArr;
        });

        const dataRows = Object.keys(decodeBackup.p2BackupConfig.nodes).map((mac) => {
            const rowDataArr = [];
            const actions = (
                <div>
                    {this.createCollpaseButton(mac)}
                </div>
            );
            rowDataArr[restoreHeaderIdx.hostname] = {
                ctx: decodeBackup.p2BackupConfig.nodes[mac].config.nodeSettings.hostname,
                type: 'string',
            };
            rowDataArr[restoreHeaderIdx.mac] = {
                ctx: mac,
                type: 'string',
            };
            rowDataArr[restoreHeaderIdx.model] = {
                ctx: decodeBackup.p2BackupConfig.nodes[mac].model,
                type: 'string',
            };
            rowDataArr[restoreHeaderIdx.maxNbr] = {
                ctx: decodeBackup.p2BackupConfig.nodes[mac]
                    .config?.profileSettings?.nbr?.['1']?.maxNbr ??
                    '-',
                type: 'string',
            };
            rowDataArr[restoreHeaderIdx.action] = {
                ctx: actions,
                type: 'component',
            };
            return rowDataArr;
        });

        Object.keys(decodeBackup.p2BackupConfig.nodes).forEach((mac) => {
            collapsedData[mac] = [];
        });

        this.setState({
            // restoreDialog: true,
            isLock: false,
            table: {
                ...this.state.table,
                data: newData,
            },
            restoreTable: {
                ...this.state.restoreTable,
                data: dataRows,
                collapsedData,
                footer: {
                    ...this.state.restoreTable.footer,
                    totalItems: Object.keys(decodeBackup.p2BackupConfig.nodes).length,
                },
            },
        });
    }

    restoreProcess() {
        // Lock the maintenance page and close confirmation box
        // console.log('restoreProcess');
        this.setState({
            isLock: true,
            disabledFileUpload: true,
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
            dialog: {
                ...this.state.dialog,
                open: false,
            },
        });

        if (this.state.nodeInfoErr) {
            const dialogContent = this.t('getConfigFailContent');
            this.setState({
                isLock: false,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('getConfigFailTitle'),
                    content: dialogContent,
                    nonTextContent: <span />,
                    submitTitle: this.t('defaultButtonLbl'),
                    submitFn: () => {
                        this.handleDialogOnClose();
                        this.onReset();
                    },
                    cancelTitle: '',
                    cancelFn: () => {
                        this.handleDialogOnClose();
                    },
                },
                restoreType: 'meshOnly',
                file: '',
                fileName: '',
                fileSize: '',
                disabledFileUpload: false,
                disabledRestore: true,
                disableSelectAfterRestore: false,
                disabledReset: false,
                getConfigObj: {},
                decodeBackup: {},
            }, () => {
                document.getElementById('configFile').value = null;
            });
        } else {
            const reader = new FileReader();
            reader.readAsText(this.state.file, 'UTF-8');
            reader.onload = function (evt) {
                const fileContent = evt.target.result;
                try {
                    const decodeBackupJson = atob(fileContent);
                    const decodeBackup = JSON.parse(decodeBackupJson);

                    // File content checking
                    if (typeof decodeBackup.p2BackupConfig === 'undefined') {
                        throw new Error(this.t('restoreFailInvalidFile'));
                    }
                    if (decodeBackup.p2BackupConfig.type !== 'mesh') {
                        throw new Error(this.t('restoreFailInvalidFile'));
                    }
                    // Call get-config to get checksums
                    const bodyMsg = {allNodes: true};
                    const p = getConfig(this.props.csrf, this.props.projectId, bodyMsg);
                    p.then((value) => {
                        this.getConfigSuccess(value, decodeBackup, this.state.restoreType);
                    }).catch((error) => {
                        // console.log('kyle_debug: reader.onload -> error', error);
                        this.getConfigError(error);
                    });
                } catch (e) {
                    this.setState({
                        isLock: false,
                        dialog: {
                            ...this.state.dialog,
                            open: true,
                            title: this.t('setConfigFailTitle'),
                            content: this.t('invalidFileErrContent'),
                            nonTextContent: <span />,
                            submitTitle: this.t('defaultButtonLbl'),
                            submitFn: () => {
                                this.handleDialogOnClose();
                            },
                            cancelTitle: '',
                            cancelFn: () => {
                                this.handleDialogOnClose();
                            },
                        },
                        restoreType: 'meshOnly',
                        file: '',
                        fileName: '',
                        fileSize: '',
                        disabledFileUpload: false,
                        disabledRestore: true,
                        disableSelectAfterRestore: false,
                        disabledReset: false,
                        getConfigObj: {},
                        decodeBackup: {},
                    }, () => {
                        document.getElementById('configFile').value = null;
                    });
                }
            }.bind(this);

            reader.onerror = function () {
                this.setState({
                    isLock: false,
                    dialog: {
                        ...this.state.dialog,
                        open: true,
                        title: this.t('setConfigFailTitle'),
                        content: this.t('invalidFileErrContent'),
                        nonTextContent: <span />,
                        submitTitle: this.t('defaultButtonLbl'),
                        submitFn: () => {
                            this.handleDialogOnClose();
                        },
                        cancelTitle: '',
                        cancelFn: () => {
                            this.handleDialogOnClose();
                        },
                    },
                    restoreType: 'meshOnly',
                    file: '',
                    fileName: '',
                    fileSize: '',
                    disabledFileUpload: false,
                    disabledRestore: true,
                    disableSelectAfterRestore: false,
                    disabledReset: false,
                    getConfigObj: {},
                    decodeBackup: {},
                }, () => {
                    document.getElementById('configFile').value = null;
                });
            };
        }
    }

    // handleRestoreTypeChange(event) {
    //     const dialogRadioContent = (
    //         <RadioGroup
    //             aria-label="restoreType"
    //             name="restoreType"
    //             value={event.target.value}
    //             onChange={this.handleRestoreTypeChange}
    //             style={{marginTop: '10px'}}
    //         >
    //             <FormControlLabel
    //                 value="meshOnly"
    //                 control={<Radio style={{height: '36px'}} />}
    //                 label={this.t('restoreRadioDialogContentMesh')}
    //             />
    //             <FormControlLabel
    //                 value="all"
    //                 control={<Radio style={{height: '36px'}} />}
    //                 label={this.t('restoreRadioDialogContentAll')}
    //             />
    //         </RadioGroup>
    //     );

    //     this.setState({
    //         dialog: {
    //             ...this.state.dialog,
    //             nonTextContent: dialogRadioContent,
    //         },
    //         restoreType: event.target.value,
    //     });
    // }

    checkMask(encKey, key) {
        if (!this.state[key] && encKey) {
            return encKey.replace(/./g, '*');
        }
        return encKey;
    }

    handleRestoreTypeRadioChange(event) {
        const restoreType = event.target.value;
        this.setState({
            ...this.state,
            restoreType,
            disabledRestore: this.state.file === '',
        }, () => {
            if (this.state.restoreType === 'meshOnly') {
                this.setState({
                    ...this.state,
                    table: {
                        ...this.state.table,
                        headers: {
                            ...this.state.table.headers,
                            selectedMAC: [],
                            selectedId: [],
                        },
                    },
                });
            }
        });
    }


    handleDialogOnClose() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: false,
            },
            // restoreType: 'meshOnly',
        });
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

    handleCountryDialogOnClose(lock = false) {
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
                password: this.state.defaultStatusText.password,
            },
            formStatus: {
                ...this.state.formStatus,
                password: this.state.defaultFormStatus.password,
            },
            showPassword: false,
            isLock: lock,
        });
    }

    handleRestoreDialogOnClose() {
        this.setState({
            restoreDialog: false,
        });
    }

    handleRestorePreviewDialogOnClose() {
        this.setState({
            showEncKeyPassword: false,
            showE2EEncKeyPassword: false,
            restorePreviewDialog: false,
        });
    }

    handleClickShowPasssword() {
        this.setState({showPassword: !this.state.showPassword});
    }

    handleClickShowEncKeyPasssword() {
        this.setState({showEncKeyPassword: !this.state.showEncKeyPassword});
    }

    handleClickShowE2EEncKeyPassword() {
        this.setState({showE2EEncKeyPassword: !this.state.showE2EEncKeyPassword});
    }

    retrieveTableContent(retry = false) {
        // console.log('kyle_debug ~ file: MeshWideRestore.jsx ~ line 3970 ~ MeshWideRestoreApp ~ retrieveTableContent ~ retrieveTableContent')
        this.setState({
            isLock: true,
        });
        this.toggleSnackBar(this.t('retrieveDeviceList'), null);
        const p1 = getCachedMeshTopology(this.props.csrf, this.props.projectId === '' ? Cookies.get('projectId') : this.props.projectId);
        // console.log('kyle_debug: retrieveTableContent -> Cookies.get(projectId)', Cookies.get('projectId'))

        p1.then((value) => {
            if (!this.mounted) {
                return;
            }
            this.isRetrieveTblDataSuccess = true;
            this.updateMeshTopology(value);
        }).catch((error) => {
            if (!this.mounted) {
                return;
            }
            this.handleMeshTopoErr(error, retry);
        });
    }

    handleSearchFn(event, destination) {
        // console.log(event);
        this.setState({
            [destination]: {
                ...this.state[destination],
                headers: {
                    ...this.state[destination].headers,
                    searchKey: event,
                },
            },
        });
    }

    handleinitiateSearchFn(destination) {
        if (this.state[destination].headers.searching) {
            this.setState({
                [destination]: {
                    ...this.state[destination],
                    headers: {
                        ...this.state[destination].headers,
                        searching: false,
                        searchKey: '',
                    },
                },
            });
        } else {
            this.setState({
                [destination]: {
                    ...this.state[destination],
                    headers: {
                        ...this.state[destination].headers,
                        searching: true,
                    },
                },
            });
        }
    }

    handleRequestSortFn(event, property, destination) {
        const headers = [...this.state[destination].headers.Headers];
        const orderBy = property;
        let order = 1;
        // orderBy = 'sn';
        const index = headers.findIndex(obj => obj.id === orderBy);
        const Sorted = headers.findIndex(obj => obj.isSorted === true);

        if (headers[index].id === orderBy && headers[index].sortType === 1) {
            order = 0;
        }
        headers[index].sortType = order;
        headers[Sorted].isSorted = false;
        headers[index].isSorted = true;

        this.setState({
            [destination]: {
                ...this.state[destination],
                headers: {
                    ...this.state[destination].headers,
                    Headers: headers,
                },
            },
        });
    }

    handleSelectRadioClickFn(event, mac, destination) {
        const newSelectedMac = [mac];

        this.setState({
            [destination]: {
                ...this.state[destination],
                headers: {
                    ...this.state[destination].headers,
                    selectedMac: newSelectedMac,
                },
            },
        });
    }

    handleChangePageFn(event, page, destination) {
        this.setState(
            {
                [destination]: {
                    ...this.state[destination],
                    footer: {
                        ...this.state[destination].footer,
                        currentPage: page,
                    },
                },
            }
        );
    }

    handleChangeItemsPerPageFn(event, destination) {
        this.setState(
            {
                [destination]: {
                    ...this.state[destination],
                    footer: {
                        ...this.state[destination].footer,
                        itemsPerPage: event.target.value,
                    },
                },
            }
        );
    }

    updateMeshTopology(meshTopoObj) {
        const dataRows = [];
        const meshTopoIp = [];
        const macToNodeIpMap = {};

        Object.keys(meshTopoObj).forEach((nodeIp) => {
            // Skip unmanaged device
            if (!meshTopoObj[nodeIp].isManaged) {
                return;
            }
            let status = (
                <div style={{
                    fontWeight: 'bold',
                    color: 'green',
                }}
                >
                    {this.t('rchbleLbl')}
                </div>
            );

            if (!meshTopoObj[nodeIp].isReachable) {
                status = (
                    <div style={{
                        fontWeight: 'bold',
                        color: 'red',
                    }}
                    >
                        {this.t('unRchbleLbl')}
                    </div>
                );
            }

            const actioncomponent = (
                <span
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                    }}
                >
                    {this.t('clusterAndNodeRestoreLbl')}
                </span>
            );

            const rowDataArr = [];
            rowDataArr[headerIdx.hostname] = {
                ctx: this.t('defaultValue'),
                type: 'string',
            };
            rowDataArr[headerIdx.mac] = {
                ctx: convertIpToMac(nodeIp),
                type: 'string',
            };
            rowDataArr[headerIdx.model] = {
                ctx: this.t('defaultValue'),
                type: 'string',
            };
            rowDataArr[headerIdx.nodeIp] = {
                ctx: nodeIp,
                type: 'string',
            };
            rowDataArr[headerIdx.fwVersion] = {
                ctx: this.t('defaultValue'),
                type: 'string',
            };
            rowDataArr[headerIdx.status] = {
                ctx: status,
                type: 'component',
            };
            rowDataArr[headerIdx.restore] = {
                ctx: '-',
                type: 'string',
            };
            rowDataArr[headerIdx.action] = {
                ctx: actioncomponent,
                type: 'component',
            };
            dataRows.push(rowDataArr);
            // // console.log('-----isReachable-----');
            // // console.log(meshTopoObj[nodeIp].isReachable);
            // // console.log('-----nodeIp-----');
            // // console.log(nodeIp);
            if (meshTopoObj[nodeIp].isReachable && meshTopoObj[nodeIp].isAuth === 'yes') {
                meshTopoIp.push(nodeIp);
                macToNodeIpMap[convertIpToMac(nodeIp)] = nodeIp;
            }
        });
        // // console.log('-----meshTopoIp-----');
        // // console.log(meshTopoIp);
        this.setState({
            meshTopoIp,
            macToNodeIpMap,
            table: {
                ...this.state.table,
                data: dataRows,
                footer: {
                    ...this.state.table.footer,
                    totalItems: Object.keys(meshTopoObj).length,
                },
            },
        }, () => {
            // console.log('updateMeshTopology: ', this.state);
            this.getNodeInfo();
        });
    }

    handleMeshTopoErr(error, retry) {
        // console.log('kyle_debug ~ file: MeshWideRestore.jsx ~ line 4205 ~ MeshWideRestoreApp ~ handleMeshTopoErr ~ error', error)
        // console.log('kyle_debug ~ file: MeshWideRestore.jsx ~ line 4203 ~ MeshWideRestoreApp ~ handleMeshTopoErr ~ handleMeshTopoErr')
        const mismatchSecret = isMismatchSecret(error);
        const unreachedNode = isUnreachedNode(error);
        const {title, content} = check(error);
        // this.toggleSnackBar(this.t('retrieveDeviceListFail'));
        if (mismatchSecret === 'logout') {
            this.closeSnackbar();
            this.isRetrieveTblDataSuccess = true;
            this.handleSecretMismatch();
        } else if (mismatchSecret === 'logout') {
            this.closeSnackbar();
            this.isRetrieveTblDataSuccess = true;
            this.onLogout();
        } else if (unreachedNode === 'headNodeUnreachable') {
            this.closeSnackbar();
            this.isRetrieveTblDataSuccess = true;
            this.onReturn();
        } else if (title !== '') {
            this.closeSnackbar();
            this.isRetrieveTblDataSuccess = true;
            this.setState({
                ...this.state,
                isLock: false,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title,
                    content,
                    submitTitle: this.t('dialogSubmitLbl'),
                    submitFn: this.handleDialogOnClose,
                    cancelTitle: '',
                },
            });
        } else if (!(error?.data?.type === 'error' &&
            error?.data?.data?.[0]?.type === 'session.authenticateerror')){
            if (!retry) {
                this.toggleSnackBar(this.t('retrieveDeviceListFail'));
            }
            if (this.mounted) {
                this.timer = setTimeout(() => {
                    // this.closeSnackbar();
                    this.retrieveTableContent(true);
                }, timeout.error);
            }
        }

    }

    handleSecretMismatch() {
        this.setState({
            isLock: false,
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('invalidSecretTitle'),
                content: this.t('invalidSecretContent'),
                submitTitle: this.t('invalidSubmitLbl'),
                submitFn: () => {
                    // Cookies.set('openManagedDeviceList', true);
                    // const currentOrigin = window.location.origin;
                    // window.location.replace(`${currentOrigin}/mesh/?l=${this.props.lang}`);

                    this.props.openDeviceListDialog();
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

    validateRegex(inputValue, regex) {
        const regexPattern = new RegExp(regex);
        const isValidObj = formValidator('matchRegex', inputValue, regexPattern);
        if (!isValidObj.result) {
            isValidObj.text = this.t('wrongRegex');
        }
        return isValidObj;
    }

    validateEnum(inputValue, enumArray) {
        const isValidObj = {
            result: false,
            text: '',
        };
        
        isValidObj.result = enumArray.some((enumObj) => {
            if (enumObj.actualValue === inputValue.toString()) {
                return true;
            }
            return false;
        });
        
        if (!isValidObj.result) {
            isValidObj.text = this.t('wrongEnum');
        }
        return isValidObj;
    }

    validateMultiEnum(inputValue, enumArray) {
        const isValidObj = {
            result: false,
            text: '',
        };

        const enumArrayActualValues = enumArray.map(enumArrayItem => enumArrayItem.actualValue);
        
        isValidObj.result = inputValue.every(i => enumArrayActualValues.includes(i));

        if (!isValidObj.result) {
            isValidObj.text = this.t('wrongEnum');
        }
        
        return isValidObj;
    }

    validateInt(inputValue, int) {
        const isValidObj = {
            result: false,
            text: '',
        };
        const {max, min} = int;
        isValidObj.result = inputValue <= max && inputValue >= min;
        if (!isValidObj.result) {
            isValidObj.text = this.t('wrongInt');
        }
        return isValidObj;
    }

    validateMix(inputValue, ruleSetArray) {
        let isValidObj = {
            result: false,
            text: '',
        };

        isValidObj.result = !ruleSetArray.every((ruleSet) => {
            if (isValidObj.result) {
                return false;
            }
            switch (ruleSet.type) {
                case 'int':
                    isValidObj = this.validateInt(inputValue, ruleSet.data);
                    if (!isValidObj.result) {
                        isValidObj.text = this.t('wrongInt');
                    }
                    break;
                case 'enum':
                    isValidObj = this.validateEnum(inputValue, ruleSet.data);
                    if (!isValidObj.result) {
                        isValidObj.text = this.t('wrongEnum');
                    }
                    break;
                case 'regex':
                    isValidObj = this.validateRegex(inputValue, ruleSet.data);
                    if (!isValidObj.result) {
                        isValidObj.text = this.t('wrongRegex');
                    }
                    break;
                default:
            }
            return true;
        });
        return isValidObj;
    }

    validateMeshSettings(configMeshSettings, meshSettings) {
        const invalidMeshSettings = {};
        if (Object.keys(meshSettings) !== 0) {
            Object.keys(meshSettings).forEach((opt) => {
                if (meshSettings[opt].type === 'invalid' || meshSettings[opt].type === 'notSupport') {
                    if (meshSettings[opt]?.data === 'countryCode') {
                        invalidMeshSettings[opt] = meshSettings[opt]?.data;
                    } else {
                        invalidMeshSettings[opt] = meshSettings[opt].type;
                    }
                } else if (meshSettings[opt].type === 'regex') {
                    const {result, text} = this.validateRegex(configMeshSettings[opt], meshSettings[opt].data);
                    if (!result) {
                        invalidMeshSettings[opt] = text;
                    }
                } else if (meshSettings[opt].type === 'int') {
                    const {result, text} = this.validateInt(configMeshSettings[opt], meshSettings[opt].data);
                    if (!result) {
                        invalidMeshSettings[opt] = text;
                    }
                } else if (meshSettings[opt].type === 'enum') {
                    const {result, text} = this.validateEnum(configMeshSettings[opt], meshSettings[opt].data);
                    if (!result) {
                        invalidMeshSettings[opt] = text;
                    }
                }
            });
        }

        if (Object.keys(invalidMeshSettings).length !== 0) {
            this.setState({
                invalidFilterConfig: {
                    ...this.state.invalidFilterConfig,
                    meshSettings: invalidMeshSettings,
                    expanded: {
                        ...this.state.invalidFilterConfig.expanded,
                        meshSettings: true,
                    },
                },
            });
        }
        return Object.keys(invalidMeshSettings).length === 0;
    }

    validateNodeSettings(configNodeSettings, nodeSettings, nodeArr) {
        const invalidNodeSettings = {};
        const {node} = this.state.invalidFilterConfig.expanded;
        if (Object.keys(nodeSettings) !== 0) {
            nodeArr.forEach((nodeIp) => {
                invalidNodeSettings[nodeIp] = {};
                Object.keys(nodeSettings[nodeIp]).forEach((opt) => {
                    if (
                        nodeSettings[nodeIp][opt].type === 'invalid' ||
                        nodeSettings[nodeIp][opt].type === 'notSupport'
                    ) {
                        if (nodeSettings[nodeIp][opt]?.data === 'countryCode') {
                            invalidNodeSettings[nodeIp][opt] = nodeSettings[nodeIp][opt]?.data;
                        } else {
                            invalidNodeSettings[nodeIp][opt] = nodeSettings[nodeIp][opt].type;
                        }
                    } else if (nodeSettings[nodeIp][opt].type === 'regex') {
                        const {result, text} = this.validateRegex(configNodeSettings[nodeIp][opt],
                            nodeSettings[nodeIp][opt].data);
                        if (!result) {
                            invalidNodeSettings[nodeIp][opt] = text;
                        }
                    } else if (nodeSettings[nodeIp][opt].type === 'int') {
                        const {result, text} = this.validateInt(configNodeSettings[nodeIp][opt],
                            nodeSettings[nodeIp][opt].data);
                        if (!result) {
                            invalidNodeSettings[nodeIp][opt] = text;
                        }
                    } else if (nodeSettings[nodeIp][opt].type === 'enum') {
                        if (opt === 'acsChannelList') {
                            const { result, text } = this.validateMultiEnum(configNodeSettings[nodeIp][opt],
                                nodeSettings[nodeIp][opt].data);
                            
                            if (!result) {
                                invalidNodeSettings[nodeIp][opt] = text;
                            }
                        } else {
                            const { result, text } = this.validateEnum(configNodeSettings[nodeIp][opt].toString(),
                                nodeSettings[nodeIp][opt].data);

                            if (!result) {
                                invalidNodeSettings[nodeIp][opt] = text;
                            }
                        }
                    }
                });
                if (Object.keys(invalidNodeSettings[nodeIp]).length === 0) {
                    delete invalidNodeSettings[nodeIp];
                } else {
                    node[nodeIp] = true;
                }
            });
        }

        if (Object.keys(invalidNodeSettings).length !== 0) {
            this.setState({
                invalidFilterConfig: {
                    ...this.state.invalidFilterConfig,
                    nodeSettings: invalidNodeSettings,
                    expanded: {
                        ...this.state.invalidFilterConfig.expanded,
                        node,
                    },
                },
            });
        }
        return Object.keys(invalidNodeSettings).length === 0;
    }

    validateRadioSettings(configRadioSettings, radioSettings, nodeArr) {
        const invalidRadioSettings = {};
        const {node} = this.state.invalidFilterConfig.expanded;
        if (Object.keys(radioSettings) !== 0) {
            nodeArr.forEach((nodeIp) => {
                invalidRadioSettings[nodeIp] = {};
                Object.keys(radioSettings[nodeIp]).forEach((radioName) => {
                    invalidRadioSettings[nodeIp][radioName] = {};
                    Object.keys(radioSettings[nodeIp][radioName]).forEach((opt) => {
                        if (
                            radioSettings[nodeIp][radioName][opt].type === 'invalid' ||
                            radioSettings[nodeIp][radioName][opt].type === 'notSupport'
                        ) {
                            if (radioSettings[nodeIp][radioName][opt]?.data === 'countryCode') {
                                invalidRadioSettings[nodeIp][radioName][opt] = radioSettings[nodeIp][radioName][opt]?.data;
                            } else {
                                invalidRadioSettings[nodeIp][radioName][opt] = radioSettings[nodeIp][radioName][opt].type;
                            }
                        } else if (radioSettings[nodeIp][radioName][opt].type === 'regex') {
                            const {result, text} = this.validateRegex(configRadioSettings[nodeIp][radioName][opt],
                                radioSettings[nodeIp][radioName][opt].data);
                            if (!result) {
                                invalidRadioSettings[nodeIp][radioName][opt] = text;
                            }
                        } else if (radioSettings[nodeIp][radioName][opt].type === 'int') {
                            const {result, text} = this.validateInt(configRadioSettings[nodeIp][radioName][opt],
                                radioSettings[nodeIp][radioName][opt].data);
                            if (!result) {
                                invalidRadioSettings[nodeIp][radioName][opt] = text;
                            }
                        } else if (radioSettings[nodeIp][radioName][opt].type === 'enum') {
                            const {result, text} = this.validateEnum(
                                configRadioSettings[nodeIp][radioName][opt].toString(),
                                radioSettings[nodeIp][radioName][opt].data);
                            if (!result) {
                                invalidRadioSettings[nodeIp][radioName][opt] = text;
                            }
                        } else if (radioSettings[nodeIp][radioName][opt].type === 'mixed') {
                            const {result, text} = this.validateMix(
                                configRadioSettings[nodeIp][radioName][opt],
                                radioSettings[nodeIp][radioName][opt].data);
                            if (!result) {
                                invalidRadioSettings[nodeIp][radioName][opt] = text;
                            }
                        }
                    });
                    if (Object.keys(invalidRadioSettings[nodeIp][radioName]).length === 0) {
                        delete invalidRadioSettings[nodeIp][radioName];
                    }
                });
                if (Object.keys(invalidRadioSettings[nodeIp]).length === 0) {
                    delete invalidRadioSettings[nodeIp];
                } else {
                    node[nodeIp] = true;
                }
            });
        }

        if (Object.keys(invalidRadioSettings).length !== 0) {
            this.setState({
                invalidFilterConfig: {
                    ...this.state.invalidFilterConfig,
                    radioSettings: invalidRadioSettings,
                    expanded: {
                        ...this.state.invalidFilterConfig.expanded,
                        node,
                    },
                },
            });
        }
        return Object.keys(invalidRadioSettings).length === 0;
    }

    validateEthernetSettings(configEthernetSettings, ethernetSettings, nodeArr) {
        const invalidEthernetSettings = {};
        const {node} = this.state.invalidFilterConfig.expanded;
        if (Object.keys(ethernetSettings) !== 0) {
            nodeArr.forEach((nodeIp) => {
                invalidEthernetSettings[nodeIp] = {};
                Object.keys(ethernetSettings[nodeIp]).forEach((ethName) => {
                    invalidEthernetSettings[nodeIp][ethName] = {};
                    Object.keys(ethernetSettings[nodeIp][ethName]).forEach((opt) => {
                        if (
                            ethernetSettings[nodeIp][ethName][opt].type === 'invalid' ||
                            ethernetSettings[nodeIp][ethName][opt].type === 'notSupport'
                        ) {
                            if (ethernetSettings[nodeIp][ethName][opt]?.data === 'countryCode') {
                                invalidEthernetSettings[nodeIp][ethName][opt] =
                                    ethernetSettings[nodeIp][ethName][opt]?.data;
                            } else {
                                invalidEthernetSettings[nodeIp][ethName][opt] =
                                    ethernetSettings[nodeIp][ethName][opt].type;
                            }
                        } else if (ethernetSettings[nodeIp][ethName][opt].type === 'regex') {
                            const {result, text} = this.validateRegex(configEthernetSettings[nodeIp][ethName][opt],
                                ethernetSettings[nodeIp][ethName][opt].data);
                            if (!result) {
                                invalidEthernetSettings[nodeIp][ethName][opt] = text;
                            }
                        } else if (ethernetSettings[nodeIp][ethName][opt].type === 'enum') {
                            const {result, text} = this.validateEnum(
                                configEthernetSettings[nodeIp][ethName][opt].toString(),
                                ethernetSettings[nodeIp][ethName][opt].data);
                            if (!result) {
                                invalidEthernetSettings[nodeIp][ethName][opt] = text;
                            }
                        } else if (ethernetSettings[nodeIp][ethName][opt].type === 'int') {
                            const {result, text} = this.validateInt(
                                configEthernetSettings[nodeIp][ethName][opt],
                                ethernetSettings[nodeIp][ethName][opt].data);
                            if (!result) {
                                invalidEthernetSettings[nodeIp][ethName][opt] = text;
                            }
                        }
                    });
                    if (Object.keys(invalidEthernetSettings[nodeIp][ethName]).length === 0) {
                        delete invalidEthernetSettings[nodeIp][ethName];
                    }
                });
                if (Object.keys(invalidEthernetSettings[nodeIp]).length === 0) {
                    delete invalidEthernetSettings[nodeIp];
                } else {
                    node[nodeIp] = true;
                }
            });
        }

        if (Object.keys(invalidEthernetSettings).length !== 0) {
            this.setState({
                invalidFilterConfig: {
                    ...this.state.invalidFilterConfig,
                    ethernetSettings: invalidEthernetSettings,
                    expanded: {
                        ...this.state.invalidFilterConfig.expanded,
                        node,
                    },
                },
            });
        }
        return Object.keys(invalidEthernetSettings).length === 0;
    }

    validateProfileSettings(configProfileSettings, profileSettings, nodeArr) {
        const invalidProfileSettings = {};
        const {node} = this.state.invalidFilterConfig.expanded;
        if (Object.keys(profileSettings) !== 0) {
            nodeArr.forEach((nodeIp) => {
                invalidProfileSettings[nodeIp] = {};
                Object.keys(profileSettings[nodeIp]).forEach((profileOpt) => {
                    invalidProfileSettings[nodeIp][profileOpt] = {};
                    Object.keys(profileSettings[nodeIp][profileOpt]).forEach((profileId) => {
                        invalidProfileSettings[nodeIp][profileOpt][profileId] = {};
                        Object.keys(profileSettings[nodeIp][profileOpt][profileId]).forEach((opt) => {
                            if (
                                profileSettings[nodeIp][profileOpt][profileId][opt].type === 'invalid' ||
                                profileSettings[nodeIp][profileOpt][profileId][opt].type === 'notSupport'
                            ) {
                                if (profileSettings[nodeIp][profileOpt][profileId][opt]?.data === 'countryCode'){
                                    invalidProfileSettings[nodeIp][profileOpt][profileId][opt] =
                                        profileSettings[nodeIp][profileOpt][profileId][opt]?.data;
                                } else {
                                    invalidProfileSettings[nodeIp][profileOpt][profileId][opt] =
                                        profileSettings[nodeIp][profileOpt][profileId][opt].type;
                                }
                                invalidProfileSettings[nodeIp][profileOpt][profileId][opt] =
                                    profileSettings[nodeIp][profileOpt][profileId][opt].type;
                            } else if (profileSettings[nodeIp][profileOpt][profileId][opt].type === 'regex') {
                                const {result, text} = this.validateRegex(configProfileSettings[nodeIp][profileOpt][profileId][opt],
                                    profileSettings[nodeIp][profileOpt][profileId][opt].data);
                                if (!result) {
                                    invalidProfileSettings[nodeIp][profileOpt][profileId][opt] = text;
                                }
                            } else if (profileSettings[nodeIp][profileOpt][profileId][opt].type === 'enum') {
                                const {result, text} = this.validateEnum(
                                    configProfileSettings[nodeIp][profileOpt][profileId][opt].toString(),
                                    profileSettings[nodeIp][profileOpt][profileId][opt].data);
                                if (!result) {
                                    invalidProfileSettings[nodeIp][profileOpt][profileId][opt] = text;
                                }
                            } else if (profileSettings[nodeIp][profileOpt][profileId][opt].type === 'int') {
                                const {result, text} = this.validateInt(
                                    configProfileSettings[nodeIp][profileOpt][profileId][opt],
                                    profileSettings[nodeIp][profileOpt][profileId][opt].data);
                                if (!result) {
                                    invalidProfileSettings[nodeIp][profileOpt][profileId][opt] = text;
                                }
                            }
                        });
                        if (Object.keys(invalidProfileSettings[nodeIp][profileOpt][profileId]).length === 0) {
                            delete invalidProfileSettings[nodeIp][profileOpt][profileId];
                        }
                    });
                    if (Object.keys(invalidProfileSettings[nodeIp][profileOpt]).length === 0) {
                        delete invalidProfileSettings[nodeIp][profileOpt];
                    }
                });
                if (Object.keys(invalidProfileSettings[nodeIp]).length === 0) {
                    delete invalidProfileSettings[nodeIp];
                } else {
                    node[nodeIp] = true;
                }
            });
        }

        if (Object.keys(invalidProfileSettings).length !== 0) {
            this.setState({
                invalidFilterConfig: {
                    ...this.state.invalidFilterConfig,
                    profileSettings: invalidProfileSettings,
                    expanded: {
                        ...this.state.invalidFilterConfig.expanded,
                        node,
                    },
                },
            });
        }
        return Object.keys(invalidProfileSettings).length === 0;
    }

    checkConfigValue(
        {
            meshSettings, radioSettings, nodeSettings, ethernetSettings, profileSettings,
        },
        nodeArr, setConfigObj) {
        // const {
        //     getConfigValue: {
        //         meshSettings: configMeshSettings,
        //         radioSettings: configRadioSettings,
        //         nodeSettings: configNodeSettings,
        //     },
        // } = this.state;
        const {
            meshSettings: configMeshSettings,
            radioSettings: configRadioSettings,
            nodeSettings: configNodeSettings,
            ethernetSettings: configEthernetSettings,
            profileSettings: configProfileSettings,
        } = setConfigObj.sourceConfig;

        const isMeshFilterConfigValid = this.validateMeshSettings(
            configMeshSettings, meshSettings);
        // console.log('kyle_debug: handleRestoreData -> isMeshFilterConfigValid', isMeshFilterConfigValid);
        const isRadioFilterConfigValid = this.validateRadioSettings(
            configRadioSettings, radioSettings, nodeArr);
        const isNodeFilterConfigValid = this.validateNodeSettings(
            configNodeSettings, nodeSettings, nodeArr);
        const isEthernetFilterConfigValid = this.validateEthernetSettings(
            configEthernetSettings, ethernetSettings, nodeArr);
        const isProfileFilterConfigValid = this.validateProfileSettings(
            configProfileSettings, profileSettings, nodeArr);

        return isMeshFilterConfigValid &&
            isRadioFilterConfigValid &&
            isNodeFilterConfigValid &&
            isEthernetFilterConfigValid &&
            isProfileFilterConfigValid;
        // return isMeshFilterConfigValid &&
        //     isRadioFilterConfigValid &&
        //     isNodeFilterConfigValid &&
        //     isEthernetFilterConfigValid && false;
    }

    changeMatchUp(Data, mac, replacingMAC, isConfigBackupMismatch, cb) {
        const newData = Data.map((rowArr) => {
            const newRowArr = [...rowArr];
            if (newRowArr[headerIdx.mac].ctx === mac) {
                newRowArr[headerIdx.restore] = {
                    ctx: replacingMAC[0],
                    type: 'string',
                };
            }
            return newRowArr;
        });

        this.setState({
            ...this.state,
            ...(isConfigBackupMismatch ?
                {
                    dialog: {
                        ...this.state.dialog,
                        open: true,
                        title: this.t('isConfigBackupMismatchTitle'),
                        content: this.t('isConfigBackupMismatchContent', this.props.labels),
                        submitTitle: this.t('restoreDialogProceed'),
                        submitFn: () => {
                            this.setState({
                                table: {
                                    ...this.state.table,
                                    data: newData,
                                },
                                restoreTable: {
                                    ...this.state.restoreTable,
                                    headers: {
                                        ...this.state.restoreTable.headers,
                                        selectedMac: [],
                                    },
                                },
                            }, () => {
                                this.handleDialogOnClose();
                                cb();
                            });
                        },
                        cancelTitle: this.t('restoreDialogCancel'),
                        cancelFn: this.handleDialogOnClose,
                    },
                }
                :
                {
                    table: {
                        ...this.state.table,
                        data: newData,
                    },
                    restoreTable: {
                        ...this.state.restoreTable,
                        headers: {
                            ...this.state.restoreTable.headers,
                            selectedMac: [],
                        },
                    },
                }
            ),
        }, () => !isConfigBackupMismatch && cb());
    }

    async handleChangeMatchUp(mac, cb) {
        const replacingMAC = [...this.state.restoreTable.headers.selectedMac];
        const Data = [...this.state.table.data];
        const {
            getConfigObj, decodeBackup,
            macToNodeIpMap, restoreFrom,
            isCountryCodeChangedWithNoError,
        } = this.state;
        // console.log('selectedMAC: ', replacingMAC);
        // console.log('handleChangeMatchUp data: ', Data);
        // console.log('changing mac', mac);

        try {
            const {bodyMsg, isConfigBackupMismatch} =
                this.createConfigOptionRequest(deepClone(getConfigObj),
                    decodeBackup,
                    replacingMAC[0]
                );
            const filterConfig = await getFilteredConfigOptions(this.props.csrf, this.props.projectId, bodyMsg);
            const isFilterConfigValid = this.checkConfigValue(deepClone(filterConfig),
                [macToNodeIpMap[restoreFrom.mac]], bodyMsg);


            if (isFilterConfigValid) {
                this.changeMatchUp(Data, mac ,replacingMAC, isConfigBackupMismatch, cb)
            } else {
                this.setState({
                    invalidConfigDialogOpen: true,
                    isLock: false,
                    invalidFilterConfigActionFn: isCountryCodeChangedWithNoError ? () => {
                        this.handleInvalidDialogOnClose();
                        this.changeMatchUp(Data, mac, replacingMAC, isConfigBackupMismatch, cb);
                        this.setState({isResetRadio: true})
                    }:
                        () => this.handleInvalidDialogOnClose(),
                });
            }
        } catch (e) {
            // console.log('kyle_debug: handleChangeMatchUp -> e', e);
            const {title, content} = check(e);
            this.setState({
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: title !== '' ? title : this.t('setConfigFailTitle'),
                    content: title !== '' ? content : this.t('invalidFileErrContent'),
                    submitTitle: this.t('defaultButtonLbl'),
                    submitFn: this.handleDialogOnClose,
                    cancelTitle: '',
                    cancelFn: this.handleDialogOnClose,
                },
            });
        }
    }

    createExpansionPanel(value, content, defaultExpanded) {
        const {classes} = this.props;
        // const {previewContent} = this.state;

        return (
            <ExpansionPanel
                classes={{
                    expanded: classes.expansionPanelExpanded,
                    root: classes.expansionPanelRoot,
                }}
                defaultExpanded={defaultExpanded}
            >
                <ExpansionPanelSummary
                    expandIcon={<i className="material-icons">expand_more</i>}
                    style={{maxHeight: '40px', minHeight: '40px'}}
                >
                    <Typography variant="body2" style={{fontSize: '16px'}}>
                        {value}
                    </Typography>
                </ExpansionPanelSummary>
                <ExpansionPanelDetails
                    style={{padding: '8px 30px', display: 'block'}}
                >
                    {content}
                </ExpansionPanelDetails>
            </ExpansionPanel>
        );
    }

    createRadioGrid(title, content, cssClass, ratio = 4) {
        const {classes} = this.props;

        return (
            <Grid item xs={ratio} style={{textAlign: 'center'}}>
                {typeof title === 'string' ?
                    <Typography variant="body2" classes={{body2: classes.optionTitleText}}>
                        {title}
                    </Typography> :
                    <span>{title}</span>
                }
                <Typography component="span" variant="body2" classes={{body2: cssClass}}>
                    {content}
                </Typography>
            </Grid>
        );
    }

    createGeneralContent() {
        const {classes} = this.props;
        const {decodeBackup, getConfigObj} = this.state;

        return (
            <Grid container>
                <Grid container style={{padding: '10px'}}>
                    {this.createRadioGrid(
                        this.t('clusterIDLbl'),
                        typeof decodeBackup.p2BackupConfig !== 'undefined' ?
                            decodeBackup.p2BackupConfig.meshSettings.clusterId : '',
                        classes.optionValueText,
                        4)
                    }
                    {this.createRadioGrid(
                        this.t('globalTimezoneLbl'),
                        get(decodeBackup, ['p2BackupConfig', 'meshSettings', 'globalTimezone']) ?
                            this.searchGlobalTimezone(decodeBackup.p2BackupConfig.meshSettings.globalTimezone) :
                            this.searchGlobalTimezone(get(getConfigObj, ['meshSettings', 'globalTimezone'])),
                        classes.optionValueText,
                        4)
                    }
                    {this.createRadioGrid(
                        this.t('countryLbl'),
                        typeof decodeBackup.p2BackupConfig !== 'undefined' ?
                            this.searchCountry(decodeBackup.p2BackupConfig.meshSettings.country) : '',
                        classes.optionValueText,
                        4)
                    }
                </Grid>
                <Grid container style={{padding: '10px'}}>
                    {this.createRadioGrid(
                        this.t('mngmtIPLbl'),
                        typeof decodeBackup.p2BackupConfig !== 'undefined' ?
                            decodeBackup.p2BackupConfig.meshSettings.managementIp : '',
                        classes.optionValueText,
                        6)
                    }
                    {this.createRadioGrid(
                        this.t('mngmtNetmskLbl'),
                        typeof decodeBackup.p2BackupConfig !== 'undefined' ?
                            decodeBackup.p2BackupConfig.meshSettings.managementNetmask : '',
                        classes.optionValueText,
                        6)
                    }
                </Grid>
            </Grid>
        );
    }

    createSecurityContent(encKeyEyeIconButton, e2eEncKeyEyeIconButton) {
        const {classes} = this.props;
        const {decodeBackup, getConfigObj} = this.state;

        return (
            <Grid container>
                <Grid container style={{padding: '10px'}}>
                    {this.createRadioGrid(
                        <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <Typography variant="body2" classes={{body2: classes.optionTitleText}}>
                                {this.t('encryptionKeyLbl')}
                            </Typography>
                            {typeof decodeBackup.p2BackupConfig !== 'undefined' && encKeyEyeIconButton}
                        </span>
                        ,
                        typeof decodeBackup.p2BackupConfig !== 'undefined' ?
                            this.checkMask(decodeBackup.p2BackupConfig.meshSettings.encKey,
                                'showEncKeyPassword') : '',
                        classes.optionValueText,
                        12)
                    }
                </Grid>
                <Grid container style={{padding: '10px'}}>
                    {this.createRadioGrid(
                        this.t('e2eEncLbl'),
                        get(decodeBackup, ['p2BackupConfig', 'meshSettings', 'e2eEnc']) ?
                            createBpduIcon(decodeBackup.p2BackupConfig.meshSettings.e2eEnc) :
                            createBpduIcon(get(getConfigObj, ['meshSettings', 'e2eEnc'])),
                        classes.optionValueText,
                        6)
                    }
                    {this.createRadioGrid(
                        <span style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                            <Typography variant="body2" classes={{body2: classes.optionTitleText}}>
                                {this.t('e2eEncKeyLbl')}
                            </Typography>
                            {typeof decodeBackup.p2BackupConfig !== 'undefined' && e2eEncKeyEyeIconButton}
                        </span>,
                        get(decodeBackup, ['p2BackupConfig', 'meshSettings', 'e2eEncKey']) ?
                            this.checkMask(decodeBackup.p2BackupConfig.meshSettings.e2eEncKey,
                                'showE2EEncKeyPassword') :
                            this.checkMask(get(getConfigObj, ['meshSettings', 'e2eEncKey']),
                                'showE2EEncKeyPassword'),
                        classes.optionValueText,
                        6)
                    }
                </Grid>
            </Grid>
        );
    }

    createAdvancedContent() {
        const {classes} = this.props;
        const {decodeBackup, getConfigObj} = this.state;

        return (
            <Grid container>
                <Grid container style={{padding: '10px'}}>
                    {this.createRadioGrid(
                        this.t('bpduFilterLbl'),
                        get(decodeBackup, ['p2BackupConfig', 'meshSettings', 'bpduFilter']) ?
                            createBpduIcon(decodeBackup.p2BackupConfig.meshSettings.bpduFilter) :
                            createBpduIcon(get(getConfigObj, ['meshSettings', 'bpduFilter'])),
                        classes.optionValueText,
                        4)
                    }
                    {this.createRadioGrid(
                        this.t('globalRoamingRssiMarginLbl'),
                        get(decodeBackup, ['p2BackupConfig', 'meshSettings', 'globalRoamingRSSIMargin']) ?
                            decodeBackup.p2BackupConfig.meshSettings.globalRoamingRSSIMargin :
                            get(getConfigObj, ['meshSettings', 'globalRoamingRSSIMargin']) || '-',
                        classes.optionValueText,
                        4)
                    }
                    {this.createRadioGrid(
                        this.t('globalStaleTimeoutLbl'),
                        get(decodeBackup, ['p2BackupConfig', 'meshSettings', 'globalStaleTimeout']) ?
                            decodeBackup.p2BackupConfig.meshSettings.globalStaleTimeout :
                            get(getConfigObj, ['meshSettings', 'globalStaleTimeout']) || '-',
                        classes.optionValueText,
                        4)
                    }
                </Grid>
                <Grid container style={{padding: '10px'}}>
                    {this.createRadioGrid(
                        this.t('globalHeartbeatIntervalLbl'),
                        get(decodeBackup, ['p2BackupConfig', 'meshSettings', 'globalHeartbeatInterval']) ?
                            decodeBackup.p2BackupConfig.meshSettings.globalHeartbeatInterval :
                            get(getConfigObj, ['meshSettings', 'globalHeartbeatInterval']) || '-',
                        classes.optionValueText,
                        4)
                    }
                    {this.createRadioGrid(
                        this.t('globalHeartbeatTimeoutLbl'),
                        get(decodeBackup, ['p2BackupConfig', 'meshSettings', 'globalHeartbeatTimeout']) ?
                            decodeBackup.p2BackupConfig.meshSettings.globalHeartbeatTimeout :
                            get(getConfigObj, ['meshSettings', 'globalHeartbeatTimeout']) || '-',
                        classes.optionValueText,
                        4)
                    }
                    {this.createRadioGrid(
                        this.t('globalAllowActiveLinkDropLbl'),
                        get(decodeBackup, ['p2BackupConfig', 'meshSettings', 'globalAllowActiveLinkDrop']) ?
                            createBpduIcon(decodeBackup.p2BackupConfig.meshSettings.globalAllowActiveLinkDrop) :
                            createBpduIcon(get(getConfigObj, ['meshSettings', 'globalAllowActiveLinkDrop'])),
                            classes.optionValueText,
                        4)
                    }
                </Grid>
            </Grid>
        );
    }

    updateNodeInfo(nodeInfoObj) {
        const currentTableRows = this.state.table.data;
        let mismatchSecret = false;
        const hostnameMap = {};
        const macMap = {};

        currentTableRows.forEach((rowArr, idx) => {
            const nodeIp = rowArr[headerIdx.nodeIp].ctx;
            hostnameMap[nodeIp] = '';
            macMap[nodeIp] = '';

            if (typeof nodeInfoObj[nodeIp] !== 'undefined') {
                let hostnameVal = this.t('defaultValue');
                let firmwareVersionVal = this.t('defaultValue');
                let modelVal = this.t('defaultValue');
                let macVal = this.t('defaultValue');

                if (typeof nodeInfoObj[nodeIp].success !== 'undefined' &&
                    nodeInfoObj[nodeIp].success
                ) {
                    hostnameVal = nodeInfoObj[nodeIp].data.hostname;
                    firmwareVersionVal = nodeInfoObj[nodeIp].data.firmwareVersion;
                    modelVal = nodeInfoObj[nodeIp].data.model;
                    macVal = nodeInfoObj[nodeIp].data.mac;
                } else if (typeof nodeInfoObj[nodeIp].success === 'undefined') {
                    hostnameVal = nodeInfoObj[nodeIp].hostname;
                    firmwareVersionVal = nodeInfoObj[nodeIp].firmwareVersion;
                    modelVal = nodeInfoObj[nodeIp].model;
                    macVal = nodeInfoObj[nodeIp].mac;
                } else if (typeof nodeInfoObj[nodeIp].success !== 'undefined' &&
                    !nodeInfoObj[nodeIp].success
                ) {
                    if (typeof nodeInfoObj[nodeIp].errors !== 'undefined') {
                        nodeInfoObj[nodeIp].errors.forEach((err) => {
                            if (err.type === 'auth.password') {
                                currentTableRows[idx][headerIdx.status].ctx = secretMismactchStr;
                                mismatchSecret = true;
                            }
                        });
                    }
                }
                currentTableRows[idx][headerIdx.hostname].ctx = hostnameVal;
                currentTableRows[idx][headerIdx.fwVersion].ctx = firmwareVersionVal;
                currentTableRows[idx][headerIdx.model].ctx = modelVal;
                currentTableRows[idx][headerIdx.mac].ctx = macVal;
                hostnameMap[nodeIp] = hostnameVal;
                macMap[nodeIp] = macVal;
            }
        });

        this.setState({
            table: {
                ...this.state.table,
                data: currentTableRows,
            },
            hostnameMap,
            macMap,
            isLock: false,
            // isFwMisMatch: checkFwMisMatch(nodeInfoObj),
            // isFwMisMatch: true,
        }, () => {
            // // console.log('isFwMisMatch: ', this.state.isFwMisMatch);
            // // console.log(checkFwMisMatch);
            if (mismatchSecret) {
                this.handleSecretMismatch();
            }
        });

        this.toggleSnackBar(this.t('retrieveDeviceListSuccess'));
        // hide the notification
        if (this.mounted) {
            this.timer = setTimeout(() => {
                this.closeSnackbar();
            }, timeout.success);
        }
    }

    enterToLogin(event) {
        if (event.key === 'Enter') {
            this.login();
        }
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

    handleChange(event) {
        const inputID = event.target.id || event.target.name;
        const inputValue = event.target.value;
        const {helperText} = this.t('passwordObj', {returnObjects: true});
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
                    isValidObj.text = this.state.defaultStatusText.password;
                }
                break;
            default:
                isValidObj = formValidator('isRequired', inputValue, null, helperText);
        }

        this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text, inputValue);
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
            if (res.isValid) {
                this.setBackupConfig();
                this.handleCountryDialogOnClose(true);
            } else {
                this.triggerFormStatus('password', false, this.t('invalidPwdLbl'), formData.password);
            }
        } catch (err) {
            // console.log(err);
            const {title, content} = check(err);
            if (title !== '') {
                this.setState({
                    ...this.state,
                    isLock: false,
                    dialog: {
                        ...this.state.dialog,
                        open: true,
                        title,
                        content,
                        submitTitle: this.t('dialogSubmitLbl'),
                        submitFn: this.handleDialogOnClose,
                        cancelTitle: '',
                    },
                });
            } else {
                this.triggerFormStatus('password', false, this.t('runtimeErrLbl'), formData.password);
            }
        }
    }

    handleNodeInfoErr() {
        this.toggleSnackBar(this.t('retrieveDeviceListFail'));
        if (this.mounted) {
            this.timer = setTimeout(() => {
                // this.closeSnackbar();
                this.retrieveTableContent();
            }, timeout.error);
        }
    }

    selectFileHandler(event) {
        event.stopPropagation();
        event.preventDefault();

        const file = event.target.files[0];
        const filename = typeof file === 'undefined' ? '' : file.name;
        let filesize = typeof file === 'undefined' ? '' : file.size;

        if (filesize !== '') {
            filesize = `, ${filesize} ${this.t('byteLbl')}`;
        }
        let disabledRestoreBtn = false;

        if (typeof file === 'undefined') {
            disabledRestoreBtn = true;
        }
        // console.log('this.state.restoreType: ', this.state.restoreType);
        // console.log('selectFileHandler');
        this.setState({
            file,
            fileName: filename,
            fileSize: filesize,
            disabledRestore: disabledRestoreBtn,
        }, () => {
            if (typeof file !== 'undefined') {
                this.restoreProcess();
            }
        });
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
                    // window.location.replace(`${currentOrigin}/mesh/?l=${this.props.lang}`);
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

    render() {
        const {
            formData, statusText, formStatus, errorStatus, restorePreviewDialog, getConfigObj,
            showPassword, showEncKeyPassword, countryDialog, restoreDialog, decodeBackup, table,
            restoreFrom, showE2EEncKeyPassword, isCountryCodeChangedWithNoError, invalidFilterConfigActionFn,
            // isBpduSupport, nodeInfoErr,
            nodeInfoErr, invalidFilterConfig, invalidConfigDialogOpen, hostnameMap, macMap,
        } = this.state;

        const passwordDisabled = !formStatus.password;

        let isEnterToLogin = function () {
            return false;
        };

        if (!passwordDisabled) {
            isEnterToLogin = this.enterToLogin;
        }

        // console.log('getConfigObj.meshSettings: ', typeof getConfigObj.meshSettings !== 'undefined' ?
            // getConfigObj.meshSettings.country : '');
        // console.log('p2BackupConfig.meshSettings: ', typeof decodeBackup.p2BackupConfig !== 'undefined' ?
            // decodeBackup.p2BackupConfig.meshSettings.country : '');

        const noteCtx = (
            <P2PointsToNote
                noteTitle={this.t('noteTitle')}
                noteCtxArr={typeof this.t('noteCtxArr', {returnObjects: true, ...this.props.labels}) === 'string' ? [] :
                this.t('noteCtxArr', {returnObjects: true, ...this.props.labels})}
            />
        );

        const disableRestoreAllSave = this.state.restoreType === 'all' &&
            !table.data.every((rowArr) => {
                if (table.headers.skippedMAC.indexOf(rowArr[headerIdx.mac].ctx) !== -1) {
                    return true;
                }
                return rowArr[headerIdx.restore].ctx !== '-';
            });

        const restoreBtn = (
            <Button
                variant="contained"
                color="primary"
                size="small"
                style={{
                    float: 'right',
                    marginBottom: '20px',
                    marginTop: '15px',
                }}
                onClick={this.onRestore}
                disabled={this.state.disabledRestore || disableRestoreAllSave}
            >
                <i
                    className="material-icons"
                    style={{fontSize: '16px', paddingRight: '3px'}}
                >restore</i>
                {this.t('restoreButtonLabel')}
            </Button>
        );

        const resetTableBtn = (
            <Button
                variant="contained"
                color="primary"
                size="small"
                style={{
                    float: 'right',
                    marginBottom: '20px',
                    marginTop: '15px',
                    marginRight: '10px',
                }}
                onClick={this.onReset}
                disabled={this.state.disabledReset}
            >
                <i
                    className="material-icons"
                    style={{fontSize: '16px', paddingRight: '3px'}}
                >settings_backup_restore</i>
                {this.t('resetButtonLabel')}
            </Button>
        );

        // const restoreTypeRadioGroup = (
        //     <div
        //         style={{
        //             display: 'flex',
        //         }}
        //     >
        //         <Radio>

        //         </Radio>
        //     </div>
        // );

        const restoreRadioDialogContentMesh = (
            <span>
                <Trans
                    defaults={this.t('restoreRadioDialogContentMesh')}
                    components={{bold: <strong />}}
                />
            </span>
        );

        const restoreRadioDialogContentAll = (
            <span>
                <Trans
                    defaults={this.t('restoreRadioDialogContentAll')}
                    components={{bold: <strong />}}
                />
            </span>
        );

        const restoreTypeRadioGroup = (
            <RadioGroup
                id="restoreType"
                aria-label="restoreType"
                name="restoreType"
                value={this.state.restoreType}
                onChange={this.handleRestoreTypeRadioChange}
                style={{
                    margin: '10px 0px 10px 0px',
                    display: 'flex',
                    flexDirection: 'row',
                    // width: '100%',
                    // justifyContent: 'center',
                }}
            >
                <FormControlLabel
                    value="meshOnly"
                    control={<Radio color="primary" style={{height: '36px'}} />}
                    label={restoreRadioDialogContentMesh}
                    style={{marginRight: '10vw'}}
                    disabled={this.state.disabledFileUpload}
                />
                <FormControlLabel
                    value="all"
                    control={<Radio color="primary" style={{height: '36px'}} />}
                    label={restoreRadioDialogContentAll}
                    style={{marginRight: '10vw'}}
                    disabled={this.state.disabledFileUpload}
                />
            </RadioGroup>
        );

        const restorePanel = (
            <div style={{marginTop: '10px', width: '100%'}}>
                <P2FileUpload
                    inputId="configFile"
                    selectFileHandler={this.selectFileHandler}
                    fileName={this.state.fileName}
                    disabledSelectFile={this.state.disabledFileUpload}
                    fileSize={this.state.fileSize}
                    placeholder={this.t('fileUpPlaceholder')}
                    acceptType=".config"
                />
                {restoreBtn}
                {resetTableBtn}
            </div>
        );

        const tblToolbar = {
            selectToolbar: [this.createAddAllButton(), this.createDeleteAllButton()],
            handleSearch: value => this.handleSearchFn(value, 'table'),
            handleinitiateSearch: () => this.handleinitiateSearchFn('table'),
        };

        const restoreTblToolbar = {
            handleSearch: value => this.handleSearchFn(value, 'restoreTable'),
            handleinitiateSearch: () => this.handleinitiateSearchFn('restoreTable'),
        };

        const dialogContent = (
            <React.Fragment>
                <span style={{
                    display: 'flex',
                    alignItems: 'center',
                    borderRadius: '3px',
                    backgroundColor: colors.warningBackground,
                    padding: '10px',
                    marginBottom: '25px',
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
                    <span style={{fontSize: 16, lineHeight: '140%', color: colors.warningColor}}>
                        {this.t('changeCountryDialogContent1')}
                    </span>
                </span>
                <span style={{display: 'block', paddingBottom: 25}}>
                    {this.t('changeCountryDialogContent2')}
                </span>
                <span style={{display: 'block', paddingBottom: 25}}>
                    {this.t('changeCountryDialogContent3')}
                </span>
                <span style={{display: 'block', paddingBottom: 25}}>
                    {this.t('changeCountryDialogContent4')}
                </span>
            </React.Fragment>
        );

        const eyeIconButton = (
            <InputAdornment position="end">
                <IconButton
                    onClick={this.handleClickShowPasssword}
                >
                    {showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
            </InputAdornment>
        );

        const encKeyEyeIconButton = (
            <InputAdornment position="end">
                <IconButton
                    onClick={this.handleClickShowEncKeyPasssword}
                >
                    {showEncKeyPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                </IconButton>
            </InputAdornment>
        );

        const e2eEncKeyEyeIconButton = (
            <InputAdornment position="end">
                <IconButton
                    onClick={this.handleClickShowE2EEncKeyPassword}
                >
                    {showE2EEncKeyPassword ? <Visibility fontSize="small" /> : <VisibilityOff fontSize="small" />}
                </IconButton>
            </InputAdornment>
        );


        const loginPassword = (
            <React.Fragment>
                <FormInputCreator
                    key="password"
                    errorStatus={errorStatus.password}
                    inputLabel={this.t('passwordObj', {returnObjects: true}).title}
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
            </React.Fragment>
        );

        const submitFn = () => {
            // console.log('Accept');
            this.login();
        };

        const cancelFn = () => {
            // console.log('Cancel');
            this.handleCountryDialogOnClose();
        };

        const restoreCancelFn = () => {
            // console.log('Cancel');
            this.handleRestoreDialogOnClose();
        };

        const restorePreviewCancelFn = () => {
            // console.log('Cancel');
            this.handleRestorePreviewDialogOnClose();
        };

        const changeCountryDialog = (
            <Dialog
                open={countryDialog}
                onClose={this.handleCountryDialogOnClose}
                disableBackdropClick
                disableEscapeKeyDown
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

        const restoreDialogContent = (
            <div style={{
                display: 'flex',
                height: '55vh',
            }}
            >
                <P2DevTbl
                    tblToolbar={restoreTblToolbar}
                    tblHeaders={{
                        ...this.state.restoreTable.headers,
                        Headers: this.state.restoreTable.headers.Headers.map(Header => ({
                            ...Header,
                            HeaderLabel: this.t(Header.HeaderLabel),
                        })),
                    }}
                    tblData={this.handleRestoreTableData()}
                    tblFooter={this.state.restoreTable.footer}
                    tblCollpased={this.state.restoreTable.collapsedData}
                    radioSelect
                    hideSearchIcon
                />
            </div>
        );

        const restoreMeshWidePreviewDialogContent = (
            <div style={{height: '480px', overflowY: 'auto', paddingRight: '10px'}}>
                {this.createExpansionPanel(this.t('generalConfigTitle'), this.createGeneralContent(), true)}
                {this.createExpansionPanel(this.t('securityConfigTitle'),
                    this.createSecurityContent(encKeyEyeIconButton, e2eEncKeyEyeIconButton), true)}
                {this.createExpansionPanel(this.t('advancedConfigTitle'), this.createAdvancedContent(), true)}
            </div>
        );

        let disableRestoreWarning = <span />;
        let disableRestore = false;
        let disableRestoreMsg = '';
        if (typeof decodeBackup.p2BackupConfig !== 'undefined') {
            disableRestore = nodeInfoErr;
            // disableRestore = nodeInfoErr || isFwMisMatch;
            // (
            //     isBpduSupport &&
            //     !('bpduFilter' in decodeBackup.p2BackupConfig.meshSettings)
            // ));
            if (nodeInfoErr) {
                disableRestoreMsg = this.t('disableRestoreNodeInfoErr');
            }
            // } else if (isFwMisMatch) {
            //     disableRestoreMsg = this.t('disableRestoreFwMismatch');
            // }
            // } else if (isBpduSupport && !('bpduFilter' in decodeBackup.p2BackupConfig.meshSettings)) {
            //     disableRestoreMsg = this.t('disableRestoreBkUp');
            // }
            disableRestoreWarning = disableRestore &&
                <span style={{
                    display: 'flex',
                    alignItems: 'flexStart',
                    borderRadius: '5px',
                    backgroundColor: colors.warningBackground,
                    padding: '10px',
                    paddingTop: '15px',
                    paddingBottom: '15px',
                    paddingLeft: '23px',
                    margin: '15px 0px 15px 0px',
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
                    <Typography style={{fontSize: 14, lineHeight: '140%', color: colors.warningColor}}>
                        <b>{disableRestoreMsg}</b>
                    </Typography>
                </span>;
        }

        const configRestorePreviewDialog = (
            <Dialog
                open={restorePreviewDialog}
                onClose={this.handleRestorePreviewDialogOnClose}
                disableBackdropClick
                disableEscapeKeyDown
                // maxWidth="md"
                // fullWidth
                PaperProps={{
                    style: {
                        backgroundColor: '#EEEEEE',
                        minWidth: '900px',
                    },
                }}
            >
                <DialogTitle
                    style={{
                        backgroundColor: theme.palette.primary.main,
                    }}
                    id="alert-dialog-title"
                >
                    <Typography style={{color: 'white', fontSize: '18px'}}>
                        {this.t('configRestorePreviewDialogLbl')}
                    </Typography>
                </DialogTitle>
                <DialogContent style={{paddingBottom: '5px'}}>
                    {disableRestoreWarning}
                    <DialogContentText
                        style={{
                            marginTop: '10px',
                            marginBottom: '10px',
                        }}
                        id="alert-dialog-description"
                    >
                        {this.t('configRestorePreviewDialogContent')}
                    </DialogContentText>
                    {restoreMeshWidePreviewDialogContent}
                </DialogContent>
                <DialogActions style={{margin: '0px 24px 0px 24px'}}>
                    <Typography
                        style={{
                            marginRight: 'auto',
                            fontSize: '11px',
                            // paddingLeft: '17px',
                        }}
                    >
                        {typeof decodeBackup.p2BackupConfig !== 'undefined' ?
                            `${this.t('configRestorePreviewDialogCreationTime')} ${decodeBackup
                                .p2BackupConfig.createdTimestamp}` :
                            this.t('configRestorePreviewDialogCreationTime')}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        style={{
                            float: 'right',
                            marginBottom: '20px',
                            marginTop: '15px',
                        }}
                        onClick={restorePreviewCancelFn}
                    >
                        {this.t('configRestorePreviewDialogBackLbl')}
                    </Button>
                    <Button
                        onClick={() => {
                            this.setState({
                                ...this.state,
                                isLock: true,
                            }, () => {
                                if (getConfigObj.meshSettings &&
                                    getConfigObj.meshSettings.country &&
                                    getConfigObj.meshSettings.country !==
                                    decodeBackup.p2BackupConfig.meshSettings.country) {
                                    this.setState({
                                        ...this.state,
                                        countryDialog: true,
                                    });
                                    restorePreviewCancelFn();
                                } else {
                                    this.setBackupConfig();
                                    restorePreviewCancelFn();
                                }
                            });
                        }}
                        variant="contained"
                        color="primary"
                        size="small"
                        style={{
                            float: 'right',
                            marginBottom: '20px',
                            marginTop: '15px',
                        }}
                        disabled={disableRestore}
                    >
                        {this.t('configRestorePreviewDialogSelectLbl')}
                    </Button>
                </DialogActions>
            </Dialog>
        );

        const restoreCancelBtn = (
            <Button
                variant="contained"
                color="primary"
                size="small"
                style={{
                    float: 'right',
                    marginBottom: '20px',
                    marginTop: '15px',
                }}
                onClick={restoreCancelFn}
            >
                {this.t('configRestoreDialogBackLbl')}
            </Button>
        );

        const restoreSkipBtn = (
            <Button
                variant="contained"
                color="primary"
                size="small"
                style={{
                    float: 'right',
                    marginBottom: '20px',
                    marginTop: '15px',
                }}
                onClick={() => {
                    this.handleSkipNodeRestore(restoreFrom.mac);
                    restoreCancelFn();
                }}
                disabled={this.state.disableSelectAfterRestore}
            >
                {this.t('configRestoreDialogSkipLbl')}
            </Button>
        );
        // console.log('restoreTableSelectedMac', this.state.restoreTable.headers.selectedMac);
        const restoreMatchUpBtn = mac => (
            <Button
                variant="contained"
                color="primary"
                size="small"
                style={{
                    float: 'right',
                    marginBottom: '20px',
                    marginTop: '15px',
                }}
                onClick={() => {
                    this.handleChangeMatchUp(mac, restoreCancelFn);
                }}
                disabled={this.state.restoreTable.headers.selectedMac.length === 0 ||
                    this.state.disableSelectAfterRestore}
            >
                {this.t('configRestoreDialogSelectLbl')}
            </Button>
        );

        const configRestoreMatchUpDialog = (
            <Dialog
                open={restoreDialog}
                onClose={this.handleRestoreDialogOnClose}
                disableBackdropClick
                disableEscapeKeyDown
                maxWidth="md"
                PaperProps={{
                    style: {
                        backgroundColor: '#EEEEEE',
                    },
                }}
                fullWidth
            >
                <DialogTitle
                    style={{
                        backgroundColor: theme.palette.primary.main,
                    }}
                    id="alert-dialog-title"
                >
                    <Typography style={{color: 'white', fontSize: '18px'}}>
                        {typeof decodeBackup.p2BackupConfig !== 'undefined' ?
                            `${this.t('configRestoreDialogLbl')} (${restoreFrom.hostname}, ${restoreFrom.mac})` :
                            this.t('configRestoreDialogLbl')}
                    </Typography>
                </DialogTitle>
                <DialogContent style={{paddingBottom: '5px'}}>
                    <DialogContentText
                        style={{
                            marginTop: '15px',
                            marginBottom: '10px',
                        }}
                        id="alert-dialog-description"
                    >
                        {this.t('configRestoreDialogContent')}
                    </DialogContentText>
                    {restoreDialogContent}
                </DialogContent>
                <DialogActions style={{margin: '0px 24px 0px 24px'}}>
                    <Typography
                        style={{
                            marginRight: 'auto',
                            fontSize: '11px',
                        }}
                    >
                        {typeof decodeBackup.p2BackupConfig !== 'undefined' ?
                            `${this.t('configRestoreDialogCreationTime')} ${decodeBackup
                                .p2BackupConfig.createdTimestamp}` :
                            this.t('configRestoreDialogCreationTime')}
                    </Typography>
                    {restoreCancelBtn}
                    {restoreSkipBtn}
                    {restoreMatchUpBtn(restoreFrom.mac)}
                </DialogActions>
            </Dialog>
        );

        // const invalidConfigDialog = (
        //     <P2Dialog
        //         open={this.state.invalidConfigDialog.open}
        //         handleClose={this.handleInvalidDialogOnClose}
        //         title={this.state.invalidConfigDialog.title}
        //         content={this.state.invalidConfigDialog.content}
        //         nonTextContent={this.state.invalidConfigDialog.nonTextContent}
        //         actionTitle={this.state.invalidConfigDialog.submitTitle}
        //         actionFn={this.state.invalidConfigDialog.submitFn}
        //         cancelActTitle={this.state.invalidConfigDialog.cancelTitle}
        //         cancelActFn={this.state.invalidConfigDialog.cancelFn}
        //         paperProps={{
        //             style: {
        //                 maxWidth: '800px',
        //             },
        //         }}
        //     />
        // );

        const invalidConfigDialog = (
            <InvalidConfigContainer
                meshSettings={invalidFilterConfig.meshSettings}
                nodeSettings={invalidFilterConfig.nodeSettings}
                radioSettings={invalidFilterConfig.radioSettings}
                ethernetSettings={invalidFilterConfig.ethernetSettings}
                profileSettings={invalidFilterConfig.profileSettings}
                expanded={invalidFilterConfig.expanded}
                open={invalidConfigDialogOpen}
                hostnameMap={hostnameMap}
                macMap={macMap}
            >
                {(open, content) => (
                    <P2Dialog
                        open={open}
                        handleClose={this.handleInvalidDialogOnClose}
                        title={isCountryCodeChangedWithNoError ?
                            this.t('countryConflictTitle') : this.t('setConfigFailTitle')}
                        content={(
                            <span style={{marginBottom: '15px'}}>
                                {isCountryCodeChangedWithNoError ? (
                                    <Trans
                                        defaults={this.t('countryConflictDescription')}
                                        components={{ bold: <strong /> }}
                                    />
                                )
                                : this.t('isFilterConfigValidContent')}
                            </span>
                        )}
                        nonTextContent={content}
                        actionTitle={isCountryCodeChangedWithNoError ?
                            this.t('countryConflictActionLbl') : this.t('defaultButtonLbl')}
                        actionFn={invalidFilterConfigActionFn}
                        cancelActTitle={isCountryCodeChangedWithNoError ? this.t('restoreDialogCancel') : ''}
                        cancelActFn={() => {
                            this.handleInvalidDialogOnClose();
                            this.onReset();
                        }}
                        paperProps={{
                            style: {
                                maxWidth: '800px',
                            },
                        }}
                    />
                )}
            </InvalidConfigContainer>
        );

        return (
            <Grid container className={this.props.classes.root} spacing={1}>
                {noteCtx}
                <P2DevTbl
                    tblToolbar={tblToolbar}
                    tblHeaders={this.handleMatchUpHeader(table.headers, disableRestoreAllSave)}
                    tblData={this.handleMatchUpData()}
                    tblFooter={table.footer}
                    disableSelect={this.state.restoreType !== 'all' ||
                        typeof decodeBackup.p2BackupConfig === 'undefined' ||
                        this.state.disableSelectAfterRestore}
                    disablePaper
                    hideSearchIcon
                />
                {restoreTypeRadioGroup}
                {restorePanel}
                {changeCountryDialog}
                {configRestoreMatchUpDialog}
                {configRestorePreviewDialog}
                <LockLayer
                    display={this.state.isLock}
                    left={0}
                    zIndex={200}
                    opacity={0.9}
                    hasCircularProgress
                />
                {invalidConfigDialog}
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
                    disableBackdropClick={this.state.dialog.disableBackdropClick}
                    disableEscapeKeyDown={this.state.dialog.disableEscapeKeyDown}
                />
            </Grid>
        );
    }
}

function mapStateToProps(store) {
    return {
        projectId: store.projectManagement.projectId,
        csrf: store.common.csrf,
        lang: store.common.lang,
        labels: store.common.labels,
        enableWatchdogConfig: store.devMode.enableWatchdogConfig,
    };
}

MeshWideRestoreApp.propTypes = {
    history: PropTypes.object.isRequired, /* eslint-disable-line */
    csrf: PropTypes.string.isRequired,
    lang: PropTypes.string.isRequired,
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    toggleSnackBar: PropTypes.func.isRequired,
    closeSnackbar: PropTypes.func.isRequired,
    openDeviceListDialog: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    enableWatchdogConfig: PropTypes.bool.isRequired,
};

export const ConnectedMeshMeshWideRestore = connect(
    mapStateToProps,
    {toggleSnackBar, closeSnackbar}
)(MeshWideRestoreApp);

export const ExportMeshMeshWideRestore = compose(
    connect(
        mapStateToProps,
        {toggleSnackBar, closeSnackbar, openDeviceListDialog}
    ),
    withStyles(styles)
)(withRouter(MeshWideRestoreApp));

const MeshWideRestore = (props) => {
    const {t, ready} = useTranslation('cluster-maintenance-config-restore');

    return !ready ?
        <span />
        : <ExportMeshMeshWideRestore {...props} t={t} />;
};

export default MeshWideRestore;
