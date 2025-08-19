/**
* @Author: mango
* @Date:   2018-05-15T16:25:07+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-11-29T11:36:31+08:00
*/
import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import saveAs from '../../util/nw/saveAs';
import Cookies from 'js-cookie';
import {withStyles, MuiThemeProvider, createMuiTheme} from '@material-ui/core/styles';
import Tabs from '@material-ui/core/Tabs';
import SwipeableViews from 'react-swipeable-views';
import Tab from '@material-ui/core/Tab';
import Button from '@material-ui/core/Button';
import InputBase from '@material-ui/core/InputBase';
// import Menu from '@material-ui/core/Menu';
// import MenuItem from '@material-ui/core/MenuItem';
import Chip from '@material-ui/core/Chip';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import ArrowBackIOS from '@material-ui/icons/ArrowBackIos';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialIcon from '@material-ui/lab/SpeedDialIcon';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
// import ListIcon from '@material-ui/icons/List';
import AddIcon from '@material-ui/icons/Add';
import {Icon, Tooltip} from '@material-ui/core';
// import PrintIcon from '@material-ui/icons/Print';
import P2DevTbl from '../common/P2DevTbl';
import {
    getConfig,
    getCachedConfig,
    setConfig,
    getFilteredConfigOptions
} from '../../util/apiCall';
import Constant from '../../constants/common';
import P2Dialog from '../common/P2Dialog';
import P2Tooltip from '../common/P2Tooltip';
import MACListDialog from './MacListDialog';
import FormSelectCreator from '../common/FormSelectCreator';
import P2SpeedDial from '../common/P2SpeedDial';
import {formValidator} from '../../util/inputValidator';
import LockLayer from '../common/LockLayer';
import {ReactComponent as ExportIcon} from '../../icon/svg/ic_export.svg';
import {ReactComponent as ImportIcon} from '../../icon/svg/ic_import.svg';
import {toggleSnackBar} from '../../redux/common/commonActions';
import CsvZipFactory from '../common/CsvZipFactory';
import {getOemNameOrAnm} from '../../util/common';

function formatDate(date) {
    const d = new Date(date);
    let month = (d.getMonth() + 1).toString();
    let day = d.getDate().toString();
    const year = d.getFullYear();

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;

    return [year, month, day].join('-');
}

const wrapper = promise => (
    promise
        .then(data => ({data, error: null}))
        .catch(error => ({error, data: null}))
);


const {
    theme, colors,
} = Constant;

const macMaxNo = 6;

const styles = {
    root: {
        display: 'flex',
        justifyContent: 'start',
        flexWrap: 'wrap',
        height: '180px',
        alignContent: 'flex-start',
        paddingLeft: '5px',
        paddingRight: '5px',
        paddingTop: '0px',
        paddingBottom: '0px',
    },
    input: {
        paddingTop: '0px',
        paddingBottom: '0px',
    },
    chip: {
        margin: '6px',
        marginLeft: '0px',
    },
    deleteIcon: {
        color: theme.palette.primary.main,
        padding: '5px',
        margin: '0px !important',
        borderRadius: '100%',
        borderRight: `1px solid ${theme.palette.primary.main}`,
        backgroundColor: colors.paperBackground,
        '&:hover': {
            backgroundColor: colors.paperBackground,
        },
    },
    deleteIconError: {
        color: colors.inactiveRed,
        padding: '5px',
        margin: '0px !important',
        borderRadius: '100%',
        borderRight: `1px solid ${colors.inactiveRed}`,
        backgroundColor: colors.paperBackground,
        '&:hover': {
            backgroundColor: colors.paperBackground,
        },
    },
    clickable: {
        backgroundColor: colors.paperBackground,
        color: theme.palette.primary.main,
        '&:active': {
            backgroundColor: theme.palette.primary.main,
            color: colors.paperBackground,
        },
    },
    clickableError: {
        backgroundColor: colors.paperBackground,
        color: colors.inactiveRed,
        borderColor: colors.inactiveRed,
        '&:active': {
            backgroundColor: colors.inactiveRed,
            color: colors.paperBackground,
        },
    },
    inpuBase: {
        color: theme.palette.primary.main,
        width: '110px',
        fontSize: '11px',
        cursor: 'pointer',
        paddingLeft: '5px',
        paddingRight: '5px',
        '&:active': {
            color: 'inherit',
        },
    },
    inpuBaseError: {
        color: colors.inactiveRed,
        width: '110px',
        fontSize: '11px',
        cursor: 'pointer',
        paddingLeft: '5px',
        paddingRight: '5px',
        '&:active': {
            color: 'inherit',
        },
    },
    label: {
        padding: '0px',
    },
    Tab: {
        minHeight: '20px',
    },
    IconButton: {
        padding: '0px',
        color: '#212121',
    },
    backIconButton: {
        padding: '5px',
        marginRight: '5px',
    },
    indicatorError: {
        backgroundColor: colors.inactiveRed,
    },
    indicator: {
        backgroundColor: theme.palette.primary.main,
    },
    popUpMACList: {
        flexGrow: 1,
        paddingLeft: 52,
        paddingRight: 52,
        width: '100%',
    },
    menuItem: {
        fontSize: '13px',
        paddingTop: '5px',
        paddingBottom: '5px',
    },
    speedDial: {
        position: 'absolute',
        // maxWidth: '30px',
        maxHeight: '26px',
        right: '30px',
    },
    speedDialAction: {
        // position: 'absolute',
        // maxWidth: '30px',
        maxHeight: '26px',
        right: '7.5px',
    },
    speedDialIcon: {
        fontSize: '20px',
    },
    speedDialElement: {
        paddingTop: '35px !important',
    },
    exportImportLabel: {
        width: 'inherit',
    },
};

const speedDialTheme = createMuiTheme({
    overrides: {
        MuiSpeedDial: {
            root: {
                height: '28px',
                marginTop: '28px',
            },
            actions: {
                '&$directionDown': {
                    paddingTop: '60px',
                },
            },
        },
        MuiIcon: {
            root: {
                width: '100%',
                height: '100%',
            },
        },
        MuiFab: {
            root: {
                width: '28px',
                height: '28px',
                boxShadow: '',
                minWidth: 0,
                minHeight: 0,
            },
            primary: {
                backgroundColor: '#ffffff',
                '&:hover': {backgroundColor: '#ffffff'},
            },
            sizeSmall: {
                width: '28px',
                height: '28px',
            },
        },
        // MuiSpeedDialAction: {
        //     button: {
        //         margin: '4px 0px',
        //     },
        // },
    },
});

class NeighborAccessControlList extends React.Component {
    constructor(props) {
        super(props);

        const fnNames = [
            'clickReset',
            'clickSave',
            'checkChange',
            'selectFileHandler',
            'handleDialogOnClose',
            'setConfigProcess',
            'getConfigSuccess',
            'getConfigError',
            'setConfigSuccess',
            'setConfigError',
            'handleChange',
            'handleCheck',
            'handleExport',
            'getNodeConfig',
            'generateSaveConfig',
            'updateNodeConfigData',
            'extractCSV',
            'processData',
            'handleDelete',
            'createDeleteButton',
            'createMACInput',
            'checkMAC',
            'handleRadioChange',
            'createAddButton',
            'handleAdd',
            'handleDeleteAll',
            'createNodeListButton',
            'handleShowNodeList',
            'handleChangePageFn',
            'handleChangeItemsPerPageFn',
            'handleRequestSortFn',
            'handleSelectClickFn',
            'handleSelectAllClickFn',
            'isNeighborNode',
            'handleSearchFn',
            'handleinitiateSearchFn',
            'saveMACEntries',
            // 'rescanMACList',
            'createSaveMACEntriesButton',
            'createRescanMACListButton',
            'getNodeData',
            'refreshNodeData',
            'handlePopUpList',
            'createPopUpButton',
            'savePopUpEntries',
            'handleMenuClose',
            'handleMenuOpen',
            'handleMenuHover',
            'handleMenuBlur',
            'handleSpeedDialOpen',
            'handleSpeedDialClose',
            'handleSpeedDialClick',
            'createAddSpeedDialButton',
        ];

        window.__.each(fnNames, (fnName) => {
            this[fnName] = this[fnName].bind(this);
        });

        this.t = this.props.t;
        this.timeout = 0;
        this.empty = false;
        const {nodes} = this.props;
        this.modelName = nodes[0].model;
        const stateObj = {};
        const statusTextObj = {}; // To store field helperText
        const formStatusObj = {}; // To disable save button

        const Headers = [
            {
                id: 'mac',
                HeaderLabel: 'mac',
                isSorted: true,
                sortType: 0,
                canSort: true,
            },
            {
                id: 'hostname',
                HeaderLabel: 'hostname',
                isSorted: false,
                sortType: 0,
                canSort: true,
            },
            {
                id: 'model',
                HeaderLabel: 'model',
                isSorted: false,
                sortType: 0,
                canSort: true,
            },
        ];

        // Setup Radio Settings
        stateObj.radioSettings = {};
        statusTextObj.radioSettings = {};
        formStatusObj.radioSettings = {};
        Object.keys(Constant.neighbourACL.modelOption[this.modelName].radioSettings).forEach((radio) => {
            stateObj.radioSettings[radio] = {};
            statusTextObj.radioSettings[radio] = {};
            formStatusObj.radioSettings[radio] = {};
            stateObj.radioSettings[radio].tblHeaders = {
                Headers,
                searchKey: '',
                searching: false,
                selectedId: [],
                selectedMAC: [],
                handleRequestSort: () => null,
                handleSelectClick: () => null,
                handleSelectAllClick: () => null,
            };
            stateObj.radioSettings[radio].tblData = [];
            stateObj.radioSettings[radio].tblfooter = {
                totalItems: 6,
                itemsPerPage: 5,
                currentPage: 0,
                handleChangePage: () => null,
                handleChangeItemsPerPage: () => null,
            };
            Constant.neighbourACL.modelOption[this.modelName].radioSettings[radio].forEach((opt) => {
                switch (opt) {
                    case 'type':
                        statusTextObj.radioSettings[radio][opt] = this.t(`optionObj.radioSettings.${opt}.helperText`);
                        stateObj.radioSettings[radio][opt] = 'none';
                        break;
                    case 'macAddressList':
                        stateObj.radioSettings[radio][opt] = {};
                        formStatusObj.radioSettings[radio][opt] = {};
                        Constant.neighbourACL.aclType.forEach((type) => {
                            stateObj.radioSettings[radio][opt][type.actualValue] = [];
                            formStatusObj.radioSettings[radio][opt][type.actualValue] = true;
                        });
                        break;
                    case 'nodeList':
                        stateObj.radioSettings[radio][opt] = false;
                        break;
                    default:
                        break;
                }
            });
        });

        this.state = {
            dialog: {
                open: false,
                title: '',
                content: '',
                submitTitle: 'OK',
                submitFn: this.handleDialogOnClose,
                cancelTitle: '',
                cancelFn: this.handleDialogOnClose,
            },
            formData: stateObj,
            loadData: JSON.parse(JSON.stringify(stateObj)),
            emptyData: JSON.parse(JSON.stringify(stateObj)),
            statusText: statusTextObj,
            formStatus: formStatusObj,
            configOptionType: {},
            model: this.modelName,
            radioNo: 0,
            isLock: false,
            popUpList: false,
            file: '',
            fileName: '',
            fileSize: '',
            disabledFileUpload: false,
            lines: '',
            hover: false,
            anchorEl: null,
            speedDialOpen: false,
        };
    }

    componentDidMount() {
        this.getNodeConfig();
        this.getNodeData();
    }

    componentWillUnmount() {
        this.props.pollingHandler.restartInterval();
    }

    getNodeData() {
        const newFormData = {...this.state.formData};
        Object.keys(newFormData.radioSettings).forEach((radioName) => {
            if (typeof this.props.nodeData !== 'undefined') {
                newFormData.radioSettings[radioName].tblData =
                Object.keys(this.props.nodeData).filter(nodeIp => nodeIp !== this.props.nodes[0].ipv4)
                    .map(nodeIp => [
                        {ctx: this.props.nodeData[nodeIp].mac, type: 'string'},
                        {ctx: this.isNeighborNode(this.props.nodeData[nodeIp].mac).hostname, type: 'string'},
                        {ctx: this.props.nodeData[nodeIp].model, type: 'string'},
                    ]);
            }
        });

        this.setState({
            ...this.state,
            formData: newFormData,
        });
    }

    async getNodeConfig() {
        this.props.updateIsLock(true);
        try {
            this.props.pollingHandler.stopInterval();
            const projectId = Cookies.get('projectId');
            const value = await getCachedConfig(this.props.csrf, projectId, {nodes: [this.props.nodes[0].ipv4]});
            await this.updateNodeConfigData(value);
            this.props.pollingHandler.restartInterval();
        } catch (error) {
            this.getConfigError(error);
            this.props.pollingHandler.restartInterval();
        }
    }


    async setConfigProcess(setConfigObj) {
        this.props.updateIsLock(true);
        this.props.pollingHandler.stopInterval();
        // Call set-config api
        try {
            this.props.pollingHandler.stopInterval();
            const projectId = Cookies.get('projectId');
            const value = await setConfig(this.props.csrf, projectId, setConfigObj);
            this.props.pollingHandler.restartInterval();
            this.setConfigSuccess(value.rtt);
        } catch (error) {
            this.props.pollingHandler.restartInterval();
            this.setConfigError(error);
        }
    }

    setConfigSuccess(rtt) {
        setTimeout(() => {
            this.setState({
                ...this.state,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('aclSaveSuccessTitle'),
                    content: this.t('aclSaveSuccessContent'),
                    submitTitle: this.t('submitBtnTitle'),
                    submitFn: () => {
                        this.props.close(this.props.nodes[0].ipv4);
                    },
                    cancelTitle: '',
                    cancelFn: this.handleDialogOnClose,
                },
            });
            this.props.updateIsLock(false);
            this.props.pollingHandler.restartInterval();
        }, (parseInt(rtt, 10) * 1000));
    }

    setConfigError() {
        this.setState({
            ...this.state,
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('aclSaveFailTitle'),
                content: this.t('aclSaveFailContent'),
                submitTitle: this.t('submitBtnTitle'),
                submitFn: () => {
                    // this.props.close(this.props.nodes[0].ipv4);
                    this.handleDialogOnClose();
                },
                cancelTitle: '',
                cancelFn: this.handleDialogOnClose,
            },
        });
        this.props.updateIsLock(false);
    }


    getConfigSuccess(getConfigObj, setConfigObj) {
        const newObj = setConfigObj;
        newObj.checksums = getConfigObj.checksums;
        this.setConfigProcess(setConfigObj);
    }


    getConfigError() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('getConfigErrTitle'),
                content: this.t('getConfigErrContent'),
                submitTitle: this.t('submitBtnTitle'),
                submitFn: () => {
                    this.props.close(this.props.nodes[0].ipv4);
                },
                cancelTitle: '',
                cancelFn: this.handleDialogOnClose,
            },
        });
        this.props.updateIsLock(false);
    }

    isNeighborNode(mac) {
        let isNeighborNode = false;
        const {macToIpMap, macToHostnameMap} = this.props;
        console.log(macToIpMap);
        // search for ip from hostname
        const hostname = macToHostnameMap[mac] || '-';
        if (hostname !== '-') {
            const ipv4 = macToIpMap[mac] || '-';
            this.props.edges.some((edge) => {
                if (edge.from === this.props.nodes[0].ipv4 &&
                    edge.to === ipv4) {
                    isNeighborNode = true;
                    return true;
                }
                if (edge.to === this.props.nodes[0].ipv4 &&
                    edge.from === ipv4) {
                    isNeighborNode = true;
                    return true;
                }
                return false;
            });
        }
        return isNeighborNode ? {
            hostname: `${hostname} *`,
            neighborNode: true,
        } :
            {
                hostname,
                neighborNode: false,
            };
    }

    async updateNodeConfigData(configObj) {
        const newFormData = {...this.state.formData};
        const newLoadData = {...this.state.loadData};
        const {checksums, ...Setting} = configObj;
        this.checksums = checksums;
        const bodyMsg = {
            options: {
                radioSettings: {},
            },
            sourceConfig: {},
        };
        const {radioSettings} = configObj;
        const ipv4 = Object.keys(radioSettings)[0];
        bodyMsg.options.radioSettings[ipv4] = {};
        Object.keys(radioSettings[ipv4]).forEach((radioName) => {
            bodyMsg.options.radioSettings[ipv4][radioName] = [];
            bodyMsg.options.radioSettings[ipv4][radioName].push('acl');
        });
        bodyMsg.sourceConfig = Setting;
        try {
            this.props.pollingHandler.stopInterval();
            let filterConfig = {};
            const projectId = Cookies.get('projectId');
            const {error, data} = await wrapper(getFilteredConfigOptions(this.props.csrf, projectId, bodyMsg));
            if (!error) {
                filterConfig = data;
            } else {
                const dialog = {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('getOptionFailTitle'),
                    content: this.t('getOptionFailContent'),
                    submitTitle: this.t('submitBtnTitle'),
                    submitFn: () => {
                        this.props.close(this.props.nodes[0].ipv4);
                        this.handleDialogOnClose();
                    },
                    cancelTitle: '',
                    cancelFn: this.handleDialogOnClose,
                    width: 'md',
                };
                if (error.message === 'P2Error' && error.data.type === 'specific') {
                    Object.keys(error.data.data).forEach((settings) => {
                        if (error.data.data[settings].success) {
                            filterConfig[settings] = error.data.data[settings].data;
                        } else if (error.data.data[settings].errors[0].type === 'partialretrieve') {
                            filterConfig[settings] = error.data.data[settings].errors[0].data;
                        }
                    });
                } else {
                    this.props.pollingHandler.restartInterval();
                    this.props.updateIsLock(false);
                    this.setState(dialog);
                }
            }
            Object.keys(radioSettings[ipv4]).forEach((radioName) => {
                newFormData.radioSettings[radioName].type = radioSettings[ipv4][radioName].acl.type;
                newLoadData.radioSettings[radioName].type = radioSettings[ipv4][radioName].acl.type;
                if (radioSettings[ipv4][radioName].acl.type !== 'none') {
                    newFormData.radioSettings[radioName].macAddressList[radioSettings[ipv4][radioName]
                        .acl.type] = radioSettings[ipv4][radioName].acl.macList
                            .map((mac, idx) => {
                                const {hostname, neighborNode} = this.isNeighborNode(mac);
                                return {
                                    key: idx,
                                    label: mac,
                                    error: false,
                                    hostname,
                                    neighborNode,
                                };
                            });
                    newLoadData.radioSettings[radioName].macAddressList[radioSettings[ipv4][radioName]
                    .acl.type] = radioSettings[ipv4][radioName].acl.macList
                        .map((mac, idx) => {
                            const {hostname, neighborNode} = this.isNeighborNode(mac);
                            return {
                                key: idx,
                                label: mac,
                                error: false,
                                hostname,
                                neighborNode,
                            };
                        });
                }
            });
            // const loadData = JSON.parse(JSON.stringify(formData));
            // newFormData.radioSettings.radio0
            //     .macAddressList.blacklist.push({
            //         key: 10,
            //         label: '11:22:33:44:66:77',
            //         error: false,
            //         hostname: '',
            //         neighborNode: false,
            //     });
            this.props.pollingHandler.restartInterval();
            this.props.updateIsLock(false);
            this.setState({
                ...this.state,
                configOptionType: filterConfig.radioSettings[ipv4],
                formData: newFormData,
                loadData: newLoadData,
            }, () => {
                console.log('this.state: ', this.state);
                const exceedMax = !Object.keys(newFormData.radioSettings).every((radioName) => {
                    if (newFormData.radioSettings[radioName].type === 'none') {
                        return true;
                    }
                    return newFormData.radioSettings[radioName]
                    .macAddressList[newFormData.radioSettings[radioName].type].length <= macMaxNo;
                });
                if (exceedMax) {
                    this.setState({
                        ...this.state,
                        dialog: {
                            ...this.state.dialog,
                            open: true,
                            title: this.t('exccessMAXTitle'),
                            content: this.t('exccessMAXContent'),
                            submitTitle: this.t('submitBtnTitle'),
                            submitFn: () => {
                                // this.props.close(this.props.nodes[0].ipv4);
                                this.handleDialogOnClose();
                            },
                            cancelTitle: '',
                            cancelFn: this.handleDialogOnClose,
                        },
                    });
                }
            });
        } catch (err) {
            this.props.pollingHandler.restartInterval();
            this.props.updateIsLock(false);
            this.setState({
                ...this.state,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('getOptionFailTitle'),
                    content: this.t('getOptionFailContent'),
                    submitTitle: this.t('submitBtnTitle'),
                    submitFn: () => {
                        this.props.close(this.props.nodes[0].ipv4);
                        this.handleDialogOnClose();
                    },
                    cancelTitle: '',
                    cancelFn: this.handleDialogOnClose,
                    width: 'md',
                },
                isLock: false,
                isPartialLock: false,
            });
        }
    }

    checkChange() {
        const {formData, loadData} = this.state;
        const changedRadioType = [];
        Object.keys(formData.radioSettings).forEach((radioName) => {
            const formDataType = formData.radioSettings[radioName].type;
            const loadDataType = loadData.radioSettings[radioName].type;
            if (formDataType === 'none') {
                if (formDataType !== loadDataType) {
                    changedRadioType.push(radioName);
                }
            } else if (formData.radioSettings[radioName].macAddressList[formDataType].length !==
                loadData.radioSettings[radioName].macAddressList[formDataType].length) {
                changedRadioType.push(radioName);
            } else {
                const macChanged = !formData.radioSettings[radioName]
                .macAddressList[formDataType].every((mac, idx) => mac.label === loadData.radioSettings[radioName]
                .macAddressList[formDataType][idx].label);
                if (macChanged) {
                    changedRadioType.push(radioName);
                }
            }
        });

        if (changedRadioType.length > 0) {
            this.generateSaveConfig(changedRadioType);
        } else {
            this.setState({
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('noChangesTitle'),
                    content: this.t('noChangesContent'),
                    submitTitle: this.t('submitBtnTitle'),
                    submitFn: this.handleDialogOnClose,
                    cancelTitle: '',
                    cancelFn: this.handleDialogOnClose,
                },
            });
        }
    }

    clickReset() {
        console.log('clickReset(acl): ', this.state.loadData);
        const loadData = {...this.state.loadData};
        this.setState({
            ...this.state,
            formData: loadData,
        }, () => this.getNodeData());
    }

    handleCheck(radioName) {
        const {formData} = this.state;

        const finalType = formData.radioSettings[radioName].type !== 'none' ? 'none' : 'blacklist';
        this.setState({
            ...this.state,
            formData: {
                ...this.state.formData,
                radioSettings: {
                    ...this.state.formData.radioSettings,
                    [radioName]: {
                        ...this.state.formData.radioSettings[radioName],
                        type: finalType,
                    },
                },
            },
        });
    }

    generateSaveConfig(changedRadioType) {
        const {formData} = this.state;
        const radioObj = {};
        changedRadioType.forEach((radioName) => {
            radioObj[radioName] = {};
            radioObj[radioName].acl = {};
            radioObj[radioName].acl.type = formData.radioSettings[radioName].type;
            if (formData.radioSettings[radioName].type !== 'none') {
                radioObj[radioName].acl.macList = [];
                radioObj[radioName].acl.macList = formData.radioSettings[radioName]
                .macAddressList[formData.radioSettings[radioName].type]
                    .map(mac => (mac.label));
            }
        });
        const setConfigObj = {
            checksums: this.checksums,
            diff: {
                radioSettings: {
                    [this.props.nodes[0].ipv4]: radioObj,
                },
            },
        };
        this.setConfigProcess(setConfigObj);
    }

    savePopUpEntries(newRadioSettings, newLoadRadioSettings) {
        console.log('savePopUpEntries: ', this.state);
        console.log('newRadioSettings: ', newRadioSettings);
        console.log('loadRadioSettings: ', newLoadRadioSettings);
        const radioSettings = {...this.state.formData.radioSettings};
        const loadRadioSettings = {...this.state.loadData.radioSettings};
        Object.keys(radioSettings).forEach((radio) => {
            radioSettings[radio].type = newRadioSettings[radio].type;
            radioSettings[radio].macAddressList = JSON.parse(JSON.stringify(
                newRadioSettings[radio].macAddressList));
        });
        Object.keys(loadRadioSettings).forEach((radio) => {
            loadRadioSettings[radio].type = newLoadRadioSettings[radio].type;
            loadRadioSettings[radio].macAddressList = JSON.parse(JSON.stringify(
                newLoadRadioSettings[radio].macAddressList));
        });
        this.setState({
            ...this.state,
            formData: {
                ...this.state.fromData,
                radioSettings,
            },
            loadData: {
                ...this.state.loadData,
                radioSettings: loadRadioSettings,
            },
        }, () => {
            console.log('after save newSettings', this.state);
            this.handlePopUpList(false);
        });
    }

    selectFileHandler(event) {
        event.stopPropagation();
        event.preventDefault();

        let valid = true;
        let fileExtension = '';
        const file = event.target.files[0];
        const filename = typeof file === 'undefined' ? '' : file.name;
        if (filename.lastIndexOf('.') > 0) {
            fileExtension = filename.substring(
                filename.lastIndexOf('.') + 1, filename.length);
        }
        if (fileExtension.toLowerCase() !== 'csv') {
            valid = false;
        }
        let filesize = typeof file === 'undefined' ? '' : file.size;

        if (filesize !== '') {
            filesize = `, ${filesize} ${this.t('byteLbl')}`;
        }
        let disabledRestoreBtn = false;

        if (typeof file === 'undefined') {
            disabledRestoreBtn = true;
        }

        event.target.value = null;
        if (valid) {
            this.setState({
                file,
                fileName: filename,
                fileSize: filesize,
                disabledRestore: disabledRestoreBtn,
            }, () => {
                this.extractCSV();
            });
        } else {
            this.setState({
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: 'Import Failed',
                    content: 'Invalid File Type',
                    submitTitle: 'OK',
                    submitFn: () => {
                        this.handleDialogOnClose();
                    },
                    cancelTitle: '',
                    cancelFn: this.handleDialogOnClose,
                },
            });
        }
    }

    extractCSV() {
        const {file} = this.state;
        const reader = new FileReader();

        reader.readAsText(file);
        reader.onload = (event) => {
            const csv = event.target.result;
            this.processData(csv);
        };
        reader.onerror = (event) => {
            if (event.target.error.name === 'NotReadableError') {
                this.setState({
                    dialog: {
                        ...this.state.dialog,
                        open: true,
                        title: 'Read Failed',
                        content: 'Read error',
                        submitTitle: 'OK',
                        submitFn: () => {
                            this.handleDialogOnClose();
                        },
                        cancelTitle: '',
                        cancelFn: this.handleDialogOnClose,
                    },
                });
            }
        };
    }

    processData(csv) {
        const {emptyData, configOptionType} = this.state;
        const newFormData = JSON.parse(JSON.stringify(emptyData));
        const newRadioSetting = newFormData.radioSettings;
        let error = false;
        const allTextLines = csv.replace(/['"]+/g, '').split(/\r\n|\n/);
        const lines = allTextLines.map(data => data.split(';'));
        try {
            lines.forEach((line, idx) => {
                if (idx !== 0) {
                    const linePair = line[0].split(',');
                    const radioName = linePair[0].toLowerCase();
                    if (radioName.startsWith('radio') &&
                    typeof parseInt(radioName.charAt(radioName.length - 1), 10) === 'number' &&
                    radioName.charAt(radioName.length - 1) <= Object.keys(emptyData.radioSettings).length) {
                        const type = linePair[1].toLowerCase();
                        switch (type) {
                            case 'blacklist':
                                if (formValidator('matchRegex', linePair[2], new RegExp(configOptionType[radioName].acl
                                    .data.maclist.data.data)).result &&
                                    newRadioSetting[radioName].macAddressList[type].length < macMaxNo) {
                                    newRadioSetting[radioName].type = 'blacklist';
                                    const {hostname, neighborNode} = this.isNeighborNode(linePair[2]);
                                    newRadioSetting[radioName].macAddressList[type].push({
                                        key: newRadioSetting[radioName].macAddressList[type].length === 0 ?
                                            0 : Math.max(...newRadioSetting[radioName].macAddressList[type]
                                            .map(data => data.key), 0) + 1,
                                        label: linePair[2],
                                        error: false,
                                        hostname,
                                        neighborNode,
                                    });
                                } else {
                                    error = true;
                                }
                                break;
                            case 'whitelist':
                                if (formValidator('matchRegex', linePair[2], new RegExp(configOptionType[radioName].acl
                                    .data.maclist.data.data)).result &&
                                    newRadioSetting[radioName].macAddressList[type].length < macMaxNo) {
                                    newRadioSetting[radioName].type = 'whitelist';
                                    const {hostname, neighborNode} = this.isNeighborNode(linePair[2]);
                                    newRadioSetting[radioName].macAddressList[type].push({
                                        key: newRadioSetting[radioName].macAddressList[type].length === 0 ?
                                            0 : Math.max(...newRadioSetting[radioName].macAddressList[type]
                                            .map(data => data.key), 0) + 1,
                                        label: linePair[2],
                                        error: false,
                                        hostname,
                                        neighborNode,
                                    });
                                } else {
                                    error = true;
                                }
                                break;
                            case 'disable':
                                newFormData.radioSettings[radioName].type = 'none';
                                break;
                            default:
                                error = true;
                                break;
                        }
                    } else {
                        error = true;
                    }
                }
            });
        } catch (e) {
            this.setState({
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('invalidFormatTitle'),
                    content: this.t('invalidFormatContent'),
                    submitTitle: 'ok',
                    submitFn: () => {
                        this.handleDialogOnClose();
                    },
                    cancelTitle: '',
                    cancelFn: this.handleDialogOnClose,
                },
            });
        }

        if (!error) {
            this.setState({
                ...this.state,
                formData: newFormData,
            }, () => {
                document.getElementById('configFile').value = null;
            });
        } else {
            this.setState({
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('invalidFormatTitle'),
                    content: this.t('invalidFormatContent'),
                    submitTitle: 'ok',
                    submitFn: () => {
                        this.handleDialogOnClose();
                    },
                    cancelTitle: '',
                    cancelFn: this.handleDialogOnClose,
                },
            });
        }
    }

    createDeleteButton(chipData, radioName, radioType) {
        const root = chipData.error ? this.props.classes.deleteIconError :
            this.props.classes.deleteIcon;
        return (
            <IconButton
                classes={{
                    root,
                }}
                onClick={(e) => { this.handleDelete(e, radioName, radioType); }}
                aria-label="delete"
                id={chipData.key}
            >
                <i
                    className="material-icons"
                    style={{
                        fontSize: '20px',
                    }}
                >remove</i>
            </IconButton>
        );
    }

    createPopUpButton() {
        const content = (
            <IconButton
                color="inherit"
                onClick={() => this.handlePopUpList(true)}
                aria-label="popup"
                style={{
                    width: 30,
                    height: 30,
                }}
                classes={{
                    root: this.props.classes.IconButton,
                }}
            >
                <i
                    className="material-icons"
                    style={{
                        fontSize: '20px',
                        color: '#ffffff',
                        transform: 'rotate(45deg)',
                        backgroundColor: '#212121',
                        padding: '1px',
                        borderRadius: '50%',
                    }}
                >unfold_more</i>
            </IconButton>
        );
        return (
            <P2Tooltip
                title={this.t('popUpMACListlbl')}
                content={content}
                key="popup"
            />
        );
    }

    createMACInput(chipData, radioName, radioType) {
        const root = chipData.error ? this.props.classes.inpuBaseError :
            this.props.classes.inpuBase;
        const createEllipsis = hostname => (hostname.slice(-1) === '*' ? (<span style={{
            fontSize: '10px',
            display: 'inline-flex',
        }}
        >
            <span
                style={{
                    width: '80px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    textOverflow: 'ellipsis',
                }}
            >
                {hostname.slice(0, -1)}
            </span>
            <span>*</span>
        </span>
        )
            :
            (
                <span style={{
                    width: '80px',
                    overflow: 'hidden',
                    whiteSpace: 'nowrap',
                    display: 'inline-block',
                    textOverflow: 'ellipsis',
                    fontSize: '10px',
                }}
                >
                    {hostname}
                </span>
            ));
        return (
            <span style={{display: 'block', textAlign: 'center'}}>
                <InputBase
                    autoFocus
                    classes={{
                        root,
                        input: this.props.classes.input,
                    }}
                    inputProps={{
                        spellCheck: false,
                        maxLength: '17',
                    }}
                    onChange={event => this.checkMAC(event, chipData.key, radioName, radioType)}
                    value={chipData.label}
                /><br />
                {chipData.hostname.length > 15 ? <P2Tooltip
                    direction="bottom"
                    title={chipData.hostname.slice(-1) === '*' ?
                        chipData.hostname.slice(0, -1) : chipData.hostname}
                    content={createEllipsis(chipData.hostname)}
                /> : <span style={{fontSize: '10px'}}>{chipData.hostname}</span>}
            </span>
        );
    }

    checkRuntimeValue(value, key, radioName, radioType) {
        const {configOptionType} = this.state;
        const macRegex = new RegExp(configOptionType[radioName].acl.data.maclist.data.data);
        const macList = [...this.state.formData.radioSettings[radioName]
            .macAddressList[radioType]];
        const newMacList = macList.map((mac) => {
            const newMAC = {...mac};
            if (newMAC.key === key) {
                newMAC.error = !formValidator('matchRegex', value, macRegex).result || macList
                    .filter(checkMAC => checkMAC.key !== key)
                    .map(checkMAC => checkMAC.label)
                    .indexOf(value) !== -1;
                const {hostname, neighborNode} = this.isNeighborNode(value);
                newMAC.hostname = hostname;
                newMAC.neighborNode = neighborNode;
            } else {
                newMAC.error = !formValidator('matchRegex', newMAC.label, macRegex).result ||
                !macList
                .filter(cloneMac => cloneMac.key !== newMAC.key)
                .every(cloneMac => cloneMac.label !== newMAC.label);
            }
            return newMAC;
        });
        this.setState({
            ...this.state,
            formData: {
                ...this.state.formData,
                radioSettings: {
                    ...this.state.formData.radioSettings,
                    [radioName]: {
                        ...this.state.formData.radioSettings[radioName],
                        macAddressList: {
                            ...this.state.formData.radioSettings[radioName].macAddressList,
                            [radioType]: newMacList,
                        },
                    },
                },
            },
        });
    }

    checkMAC(event, key, radioName, radioType) {
        const targetValue = event.target.value;
        const macList = this.state.formData.radioSettings[radioName].macAddressList[radioType];
        const newChipData = macList.map((mac) => {
            const newMAC = {...mac};
            if (newMAC.key === key) {
                newMAC.label = targetValue.toUpperCase();
            }
            return newMAC;
        });
        console.log('targetValue: ', targetValue);
        console.log('newChipData: ', newChipData);

        this.setState({
            ...this.state,
            formData: {
                ...this.state.formData,
                radioSettings: {
                    ...this.state.formData.radioSettings,
                    [radioName]: {
                        ...this.state.formData.radioSettings[radioName],
                        macAddressList: {
                            ...this.state.formData.radioSettings[radioName].macAddressList,
                            [radioType]: newChipData,
                        },
                    },
                },
            },
        }, () => {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(() => {
                this.checkRuntimeValue(targetValue.toUpperCase(), key, radioName, radioType);
            }, 500);
        });
    }

    clickSave() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('saveMACACLConfirmTitle'),
                content: this.t('saveMACACLConfirmContent'),
                submitTitle: this.t('submitBtnTitle'),
                submitFn: () => {
                    this.handleDialogOnClose();
                    this.checkChange();
                },
                cancelTitle: this.t('cancelBtnTitle'),
                cancelFn: this.handleDialogOnClose,
            },
        });
    }

    handleRadioChange(event, radioNo) {
        this.setState({
            ...this.state,
            radioNo,
        });
    }

    async handleExport() {
        const {projectIdList, projectId} = this.props;
        const {hostname} = this.props.nodes[0];
        const projectName = projectIdList[projectId] ?? '';
        const nwManifestName = typeof window.nw !== 'undefined' ? window.nw.App.manifest.window.title : undefined;
        const namePrefix = getOemNameOrAnm(nwManifestName);
        const currentTime = moment().format('YYYY-MM-DD-hh-mm-ss');
        const exportName = `${namePrefix}_${projectName}_${hostname}_nacl_${currentTime}.csv`;


        const {formData} = this.state;
        const macArray = [];
        Object.keys(formData.radioSettings).forEach((radioName) => {
            const radioType = formData.radioSettings[radioName].type;
            if (radioType !== 'none') {
                const radioMacList = formData.radioSettings[radioName].macAddressList[radioType];
                radioMacList.forEach(mac => macArray.push([radioName, radioType, mac.label]));
            } else {
                macArray.push([radioName, 'disable']);
            }
        });

        const exportArray = [['Radio', 'Type', 'MAC'], ...macArray];
        const linkAlignmentCsvFactory = new CsvZipFactory();
        let csv = ''
        exportArray.forEach((line) => {
            csv += linkAlignmentCsvFactory.createLine(line);
        })
        const dataUrl = 'data:text/csv;charset=utf-8,' + csv;
        const {data} = await wrapper(saveAs(dataUrl, exportName, '.csv'));
        if (data.success) {
            this.props.toggleSnackBar(this.t('downloadCompleted'));
        }
    }

    handleDialogOnClose() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: false,
            },
        });
    }

    handleChange(e, type, radioName) {
        if (type === 'type') {
            this.setState({
                ...this.state,
                formData: {
                    ...this.state.formData,
                    radioSettings: {
                        ...this.state.formData.radioSettings,
                        [radioName]: {
                            ...this.state.formData.radioSettings[radioName],
                            type: e.target.value,
                        },
                    },
                },
            });
        }
    }

    handleAdd(radioName, radioType) {
        const chipData = [...this.state.formData.radioSettings[radioName].macAddressList[radioType]];
        if (chipData.length < macMaxNo) {
            const maxKey = Math.max(...chipData.map(data => data.key), 0);
            chipData.push(
                {
                    key: (maxKey === 0 && chipData.length === 0) ? 0 : maxKey + 1,
                    label: '',
                    error: true,
                    hostname: '-',
                    neighborNode: false,
                }
            );
            this.setState({
                ...this.state,
                speedDialOpen: true,
                formData: {
                    ...this.state.formData,
                    radioSettings: {
                        ...this.state.formData.radioSettings,
                        [radioName]: {
                            ...this.state.formData.radioSettings[radioName],
                            macAddressList: {
                                ...this.state.formData.radioSettings[radioName].macAddressList,
                                [radioType]: chipData,
                            },
                        },
                    },
                },
            });
        } else {
            this.setState({
                ...this.state,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('exccessMAXTitle'),
                    content: this.t('exccessMAXContent'),
                    submitTitle: this.t('submitBtnTitle'),
                    submitFn: () => {
                        this.handleDialogOnClose();
                    },
                    cancelTitle: '',
                    cancelFn: this.handleDialogOnClose,
                },
            });
        }
    }

    handleMenuClose() {
        this.setState({
            anchorEl: null,
        });
    }
    handleMenuOpen(e) {
        this.setState({
            anchorEl: e.currentTarget,
        });
    }
    handleMenuHover() {
        this.setState({
            hover: true,
        });
    }
    handleMenuBlur() {
        this.setState({
            hover: false,
        });
    }

    handleSpeedDialClose(cb) {
        this.setState({
            ...this.state,
            speedDialOpen: false,
        }, () => {
            if (typeof cb === 'function') cb();
        });
    }

    handleSpeedDialOpen() {
        this.setState({
            ...this.state,
            speedDialOpen: true,
        });
    }

    handleSpeedDialClick() {
        this.setState(state => ({
            open: !state.open,
        }));
    }

    createAddSpeedDialButton(radioName, radioType) {
        console.log('radioName: ', radioName);
        console.log('radioType: ', radioType);
        const {speedDialOpen} = this.state;
        console.log('speedDialOpen: ', speedDialOpen);
        return (
            <SpeedDial
                className={this.props.classes.speedDial}
                ariaLabel="SpeedDial openIcon example"
                classes={{
                    actions: this.props.classes.speedDialElement,
                }}
                icon={<P2Tooltip
                    direction="left"
                    title={this.t('addMAC')}
                    content={<SpeedDialIcon
                        classes={{
                            icon: this.props.classes.speedDialIcon,
                        }}
                        style={{paddingTop: '3px'}}
                        openIcon={<AddIcon />}
                    />}
                    key="addBtn"
                />}
                // onBlur={this.handleSpeedDialClose}
                onOpen={(e, reason) => {
                    if (reason === 'toggle') {
                        this.handleAdd(radioName, radioType)
                    } else if (reason === 'mouseEnter' || reason === 'focus') {
                        this.handleSpeedDialOpen();
                    }
                }}
                // onClick={this.handleSpeedDialClick}
                onClose={this.handleSpeedDialClose}
                // onFocus={this.handleSpeedDialOpen}
                // onMouseEnter={this.handleSpeedDialOpen}
                // onMouseLeave={this.handleSpeedDialClose}

                open={speedDialOpen}
                direction="down"
                ButtonProps={{
                    style: {
                        width: '26px',
                        marginRight: '5px',
                        minHeight: '26px',
                        marginTop: '1px',
                        backgroundColor: '#212121',
                        boxShadow: 'none',
                    },
                }}
            >
                <SpeedDialAction
                    className={this.props.classes.speedDialAction}
                    style={{paddingTop: '15px'}}
                    classes={{
                        fab: this.props.classes.speedDialAction,
                    }}
                    key="test1"
                    icon={<i
                        className="material-icons"
                        style={{fontSize: '18px', color: '#212121'}}
                    >list</i>}
                    tooltipTitle={this.t('showMACList')}
                    // tooltipOpen
                    onClick={() => {
                        console.log('speeddialogAction clicked');
                        this.handleSpeedDialClose(() => this.handleShowNodeList(radioName, true));
                    }}
                    FabProps={{
                        style: {
                            width: '26px',
                            minHeight: '26px',
                            // marginLeft: '5px',
                            boxShadow: 'none',
                        },
                    }}
                />
            </SpeedDial>
        );
    }

    createAddButton(radioName, radioType) {
        const content = (
            <IconButton
                color="inherit"
                onClick={() => this.handleAdd(radioName, radioType)}
                // onClick={this.handleMenuOpen}
                // onMouseEnter={this.handleMenuHover}
                // onMouseLeave={this.handleMenuBlur}
                aria-label="Add"
                classes={{
                    root: this.props.classes.IconButton,
                }}
            >
                <i
                    className="material-icons"
                    style={{fontSize: '28px', color: '#212121'}}
                >add_circle</i>
            </IconButton>
        );
        return (
            <P2Tooltip
                title={this.t('addMAC')}
                content={content}
                key="addBtn"
            />
        );
    }

    // createAddButton(radioName, radioType) {
    //     const {anchorEl} = this.state;
    //     const content = (
    //         <IconButton
    //             color="inherit"
    //             // onClick={() => this.handleAdd(radioName, radioType)}
    //             onClick={this.handleMenuOpen}
    //             onMouseEnter={this.handleMenuHover}
    //             onMouseLeave={this.handleMenuBlur}
    //             aria-label="Add"
    //             classes={{
    //                 root: this.props.classes.IconButton,
    //             }}
    //         >
    //             <i
    //                 className="material-icons"
    //                 style={{fontSize: '28px', color: '#212121'}}
    //             >add_circle</i>
    //         </IconButton>
    //     );

    //     const menu = (<Menu
    //         id="lang-menu"
    //         open={Boolean(anchorEl)}
    //         anchorEl={anchorEl}
    //         onClose={this.handleMenuClose}
    //         MenuListProps={{
    //             style: {
    //                 padding: 0,
    //             },
    //         }}
    //         getContentAnchorEl={null}
    //         anchorOrigin={{
    //             vertical: 'bottom',
    //             horizontal: 'center',
    //         }}
    //         transformOrigin={{
    //             vertical: 'top',
    //             horizontal: 'center',
    //         }}
    //     >
    //         <MenuItem
    //             onClick={() => {
    //                 this.handleAdd(radioName, radioType);
    //                 this.handleMenuClose();
    //             }}
    //             classes={{
    //                 root: this.props.classes.menuItem,
    //             }}
    //         >
    //             <Interpolate
    //                 i18nKey="addMACACL"
    //                 useDangerouslySetInnerHTML
    //             />
    //         </MenuItem>
    //         <MenuItem
    //             onClick={() => {
    //                 this.handleShowNodeList(radioName, true);
    //                 this.handleMenuClose();
    //             }}
    //             classes={{
    //                 root: this.props.classes.menuItem,
    //             }}
    //         >
    //             <Interpolate
    //                 i18nKey="showMACList"
    //                 useDangerouslySetInnerHTML
    //             />
    //         </MenuItem>
    //     </Menu>);

    //     return (
    //         <React.Fragment>
    //             <P2Tooltip
    //                 title={this.t('addMAC')}
    //                 content={content}
    //                 key="addBtn"
    //             />
    //             {menu}
    //         </React.Fragment>
    //     );
    // }

    handleShowNodeList(radioName, nodeList) {
        if (!nodeList) {
            this.setState({
                ...this.state,
                formData: {
                    ...this.state.formData,
                    radioSettings: {
                        ...this.state.formData.radioSettings,
                        [radioName]: {
                            ...this.state.formData.radioSettings[radioName],
                            nodeList,
                            tblHeaders: {
                                ...this.state.formData.radioSettings[radioName].tblHeaders,
                                selectedId: [],
                                selectedMAC: [],
                            },
                        },
                    },
                },
            });
        } else {
            this.setState({
                ...this.state,
                formData: {
                    ...this.state.formData,
                    radioSettings: {
                        ...this.state.formData.radioSettings,
                        [radioName]: {
                            ...this.state.formData.radioSettings[radioName],
                            nodeList,
                        },
                    },
                },
            });
        }
    }

    createNodeListButton(radioName) {
        const content = (
            <IconButton
                style={{marginLeft: '10px'}}
                color="inherit"
                onClick={() => this.handleShowNodeList(radioName, true)}
                aria-label="List"
                classes={{
                    root: this.props.classes.IconButton,
                }}
            >
                <i
                    className="material-icons"
                    style={{fontSize: '28px', color: '#212121'}}
                >list</i>
            </IconButton>
        );
        return (
            <P2Tooltip
                title={this.t('showNodeList')}
                content={content}
                key="List"
            />
        );
    }

    handleDeleteAll(radioName, radioType) {
        const submitFn = () => {
            this.setState({
                ...this.state,
                formData: {
                    ...this.state.formData,
                    radioSettings: {
                        ...this.state.formData.radioSettings,
                        [radioName]: {
                            ...this.state.formData.radioSettings[radioName],
                            macAddressList: {
                                ...this.state.formData.radioSettings[radioName].macAddressList,
                                [radioType]: [],
                            },
                        },
                    },
                },
            }, () => {
                this.handleDialogOnClose();
            });
        };
        this.setState({
            ...this.state,
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('deleteAllTitle'),
                content: this.t('deleteAllContent'),
                submitTitle: this.t('submitBtnTitle'),
                submitFn,
                cancelTitle: this.t('cancelBtnTitle'),
                cancelFn: this.handleDialogOnClose,
            },
        });
    }

    createDeleteAllButton(radioName, radioType, length) {
        const disable = length === 0 ? true : null;
        const content = (
            <IconButton
                style={{marginLeft: '10px'}}
                color="inherit"
                onClick={() => this.handleDeleteAll(radioName, radioType)}
                classes={{
                    root: this.props.classes.IconButton,
                }}
                disabled={disable}
            >
                <i
                    className="material-icons"
                    style={{fontSize: '28px', color: '#212121'}}
                >delete</i>
            </IconButton>
        );
        return disable ? (
            <IconButton
                style={{marginLeft: '10px'}}
                color="inherit"
                onClick={() => this.handleDeleteAll(radioName, radioType)}
                classes={{
                    root: this.props.classes.IconButton,
                }}
                disabled={disable}
            >
                <i
                    className="material-icons"
                    style={{fontSize: '28px', color: 'gray'}}
                >delete</i>
            </IconButton>
        ) :
            (
                <P2Tooltip
                    title={this.t('deleteAllMAC')}
                    content={content}
                    key="deleteAllBtn"
                />
            );
    }

    handleDelete(event, radioName, radioType) {
        const chipData = [...this.state.formData.radioSettings[radioName].macAddressList[radioType]];
        const deleteLabel = chipData.find(mac => mac.key.toString() === event.currentTarget.id).label;
        const splicedChipData = chipData.filter(mac => mac.key.toString() !== event.currentTarget.id);
        const duplicateLabelChipData = splicedChipData.filter(mac => mac.label === deleteLabel);
        this.setState({
            ...this.state,
            formData: {
                ...this.state.formData,
                radioSettings: {
                    ...this.state.formData.radioSettings,
                    [radioName]: {
                        ...this.state.formData.radioSettings[radioName],
                        macAddressList: {
                            ...this.state.formData.radioSettings[radioName].macAddressList,
                            [radioType]: splicedChipData,
                        },
                    },
                },
            },
        }, () => {
            if (duplicateLabelChipData.length > 0) {
                duplicateLabelChipData.forEach((mac) => {
                    this.checkRuntimeValue(mac.label, mac.key, radioName, radioType);
                });
            }
        });
    }

    handleChangePageFn(event, page, radioName) {
        this.setState({
            ...this.state,
            formData: {
                ...this.state.formData,
                radioSettings: {
                    ...this.state.formData.radioSettings,
                    [radioName]: {
                        ...this.state.formData.radioSettings[radioName],
                        tblfooter: {
                            ...this.state.formData.radioSettings[radioName].tblfooter,
                            currentPage: page,
                        },
                    },
                },
            },
        });
    }

    handleChangeItemsPerPageFn(event, radioName) {
        this.setState({
            ...this.state,
            formData: {
                ...this.state.formData,
                radioSettings: {
                    ...this.state.formData.radioSettings,
                    [radioName]: {
                        ...this.state.formData.radioSettings[radioName],
                        tblfooter: {
                            ...this.state.formData.radioSettings[radioName].tblfooter,
                            itemsPerPage: event.target.value,
                            currentPage: 0,
                        },
                    },
                },
            },
        });
    }

    handleRequestSortFn(event, property, radioName) {
        const Headers = [...this.state.formData.radioSettings[radioName].tblHeaders.Headers];
        const orderBy = property;
        let order = 1;

        const index = Headers.findIndex(obj => obj.id === orderBy);
        const Sorted = Headers.findIndex(obj => obj.isSorted === true);

        if (Headers[index].id === orderBy && Headers[index].sortType === 1) {
            order = 0;
        }
        Headers[index].sortType = order;
        Headers[Sorted].isSorted = false;
        Headers[index].isSorted = true;

        this.setState({
            ...this.state,
            formData: {
                ...this.state.formData,
                radioSettings: {
                    ...this.state.formData.radioSettings,
                    [radioName]: {
                        ...this.state.formData.radioSettings[radioName],
                        tblHeaders: {
                            ...this.state.formData.radioSettings[radioName].tblHeaders,
                            Headers,
                        },
                    },
                },
            },
        });
    }

    handleSelectClickFn(event, id, mac, n, radioName) {
        const {selectedId, selectedMAC} = this.state.formData.radioSettings[radioName].tblHeaders;
        const selectedIdIndex = selectedId.indexOf(id);
        let newSelectedId = [];
        let newSelectedMAC = [];


        if (selectedIdIndex === -1) {
            newSelectedId = newSelectedId.concat(selectedId, id);
            newSelectedMAC = newSelectedMAC.concat(selectedMAC, mac);
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
            formData: {
                ...this.state.formData,
                radioSettings: {
                    ...this.state.formData.radioSettings,
                    [radioName]: {
                        ...this.state.formData.radioSettings[radioName],
                        tblHeaders: {
                            ...this.state.formData.radioSettings[radioName].tblHeaders,
                            selectedId: newSelectedId,
                            selectedMAC: newSelectedMAC,
                        },
                    },
                },
            },
        });
    }

    handleSelectAllClickFn(event, checked, filterData, radioName) {
        if (checked) {
            const selectedId = filterData.map(n => n.id);
            const selectedMAC = filterData.map(n => n.mac);
            this.setState({
                ...this.state,
                formData: {
                    ...this.state.formData,
                    radioSettings: {
                        ...this.state.formData.radioSettings,
                        [radioName]: {
                            ...this.state.formData.radioSettings[radioName],
                            tblHeaders: {
                                ...this.state.formData.radioSettings[radioName].tblHeaders,
                                selectedId,
                                selectedMAC,
                            },
                        },
                    },
                },
            });
            return;
        }
        this.setState({
            ...this.state,
            formData: {
                ...this.state.formData,
                radioSettings: {
                    ...this.state.formData.radioSettings,
                    [radioName]: {
                        ...this.state.formData.radioSettings[radioName],
                        tblHeaders: {
                            ...this.state.formData.radioSettings[radioName].tblHeaders,
                            selectedId: [],
                            selectedMAC: [],
                        },
                    },
                },
            },
        });
    }

    handleSearchFn(searchKey, radioName) {
        this.setState({
            ...this.state,
            formData: {
                ...this.state.formData,
                radioSettings: {
                    ...this.state.formData.radioSettings,
                    [radioName]: {
                        ...this.state.formData.radioSettings[radioName],
                        tblHeaders: {
                            ...this.state.formData.radioSettings[radioName].tblHeaders,
                            searchKey,
                        },
                        tblfooter: {
                            ...this.state.formData.radioSettings[radioName].tblfooter,
                            currentPage: 0,
                        },
                    },
                },
            },
        });
    }

    handleinitiateSearchFn(radioName) {
        const formData = {
            ...this.state.formData,
            radioSettings: {
                ...this.state.formData.radioSettings,
                [radioName]: {
                    ...this.state.formData.radioSettings[radioName],
                    tblHeaders: {
                        ...this.state.formData.radioSettings[radioName].tblHeaders,
                        searching: true,
                    },
                },
            },
        };

        if (this.state.formData.radioSettings[radioName].tblHeaders.searching) {
            formData.radioSettings[radioName].tblHeaders.searching = false;
            formData.radioSettings[radioName].tblHeaders.searchKey = '';
            this.setState({
                ...this.state,
                formData,
            });
        } else {
            this.setState({
                ...this.state,
                formData,
            });
        }
    }

    createCloseButton(radioName) {
        const closeIconButton = (
            <IconButton
                color="inherit"
                aria-label="Back"
                disableRipple
                disabled={this.state.disableCloseBtn}
                onClick={() => this.handleShowNodeList(radioName, false)}
                classes={{
                    root: this.props.classes.backIconButton,
                }}
            >
                <ArrowBackIOS style={{
                    fontSize: '16px',
                }}
                />
            </IconButton>
        );

        const closeButton = (
            <P2Tooltip
                title="Back"
                content={closeIconButton}
            />
        );

        return closeButton;
    }

    createSaveMACEntriesButton(radioName, radioType) {
        const saveMACEntriesIconButton = (
            <IconButton
                color="inherit"
                aria-label="save"
                onClick={() => this.saveMACEntries(radioName, radioType)}
            >
                <i
                    className="material-icons"
                    style={{fontSize: '20px', color: '#ffffff'}}
                >save</i>
            </IconButton>
        );

        const saveMACEntriesButton = (
            <P2Tooltip
                title="Save MAC Entries"
                content={saveMACEntriesIconButton}
                key="createSaveMACEntriesButton"
            />
        );

        return saveMACEntriesButton;
    }

    handlePopUpList(popUpList) {
        this.setState({
            ...this.state,
            popUpList,
        }, () => console.log('handlePopUpList(this.state)', this.state));
    }

    saveMACEntries(radioName, radioType) {
        const {selectedMAC} = this.state.formData.radioSettings[radioName].tblHeaders;
        // console.log('selectedMAC:', selectedMAC);
        const macAddressList = JSON.parse(JSON.stringify(this.state.formData.radioSettings[radioName].macAddressList));
        if (selectedMAC.length + macAddressList[radioType].length <= macMaxNo) {
            selectedMAC.forEach((mac) => {
                const {hostname, neighborNode} = this.isNeighborNode(mac);
                macAddressList[radioType].push({
                    key: macAddressList[radioType].length === 0 ?
                        0 : Math.max(...macAddressList[radioType].map(data => data.key), 0) + 1,
                    label: mac,
                    error: false,
                    hostname,
                    neighborNode,
                });
            });

            this.setState({
                ...this.state,
                formData: {
                    ...this.state.formData,
                    radioSettings: {
                        ...this.state.formData.radioSettings,
                        [radioName]: {
                            ...this.state.formData.radioSettings[radioName],
                            macAddressList,
                            nodeList: false,
                            tblHeaders: {
                                ...this.state.formData.radioSettings[radioName].tblHeaders,
                                selectedId: [],
                                selectedMAC: [],
                            },
                        },
                    },
                },
            }, () => { console.log('this.state after save entries: ', this.state); });
        } else {
            this.setState({
                ...this.state,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('exccessMAXTitle'),
                    content: this.t('exccessMAXContent'),
                    submitTitle: this.t('submitBtnTitle'),
                    submitFn: () => {
                        // this.props.close(this.props.nodes[0].ipv4);
                        this.handleDialogOnClose();
                    },
                    cancelTitle: '',
                    cancelFn: this.handleDialogOnClose,
                },
            });
        }
    }

    createRescanMACListButton() {
        const rescanMACListIconButton = (
            <IconButton
                color="inherit"
                aria-label="rescan"
                // onClick={() => this.rescanMACList()}
            >
                <i
                    className="material-icons"
                    style={{fontSize: '20px', color: '#ffffff'}}
                >autorenew</i>
            </IconButton>
        );

        const rescanMACListButton = (
            <P2Tooltip
                title={this.t('refreshNodeListLbl')}
                content={rescanMACListIconButton}
                key="createRescanMACListButton"
            />
        );

        return rescanMACListButton;
    }

    refreshNodeData(nodeData) {
        const newFormData = {...this.state.formData};
        Object.keys(newFormData.radioSettings).forEach((radioName) => {
            if (typeof nodeData !== 'undefined' && nodeData.success) {
                newFormData.radioSettings[radioName].tblData =
                Object.keys(nodeData.ctx).filter(nodeIp => nodeIp !== this.props.nodes[0].ipv4)
                    .map(nodeIp => [
                        {ctx: nodeData.ctx[nodeIp].mac, type: 'string'},
                        {ctx: this.isNeighborNode(nodeData.ctx[nodeIp].mac).hostname, type: 'string'},
                        {ctx: nodeData.ctx[nodeIp].model, type: 'string'},
                    ]);
            }
        });

        this.setState({
            ...this.state,
            formData: newFormData,
            isLock: false,
        });
    }

    // async rescanMACList() {
    //     // console.log('rescanMACList');
    //     // console.log('this.state', this.state);
    //     this.setState({
    //         ...this.state,
    //         isLock: true,
    //     });
    //     try {
    //         await this.props.refreshMeshTopology();
    //         const nodeData = await this.props.refreshNodeInfo();
    //         // console.log('nodeData: ', nodeData);
    //         this.refreshNodeData(nodeData);
    //     } catch (err) {
    //         this.setState({
    //             ...this.state,
    //             isLock: false,
    //         });
    //     }
    // }

    render() {
        const {
            model, formData, configOptionType, loadData,
        } = this.state;
        const {classes, nodes} = this.props;


        const disableSave = !Object.keys(formData.radioSettings).every((radioName) => {
            if (formData.radioSettings[radioName].type === 'none') {
                return true;
            } else if (formData.radioSettings[radioName]
                .macAddressList[formData.radioSettings[radioName].type].length === 0 ||
                formData.radioSettings[radioName]
                .macAddressList[formData.radioSettings[radioName].type].length > macMaxNo) {
                return false;
            }
            return formData.radioSettings[radioName]
                .macAddressList[formData.radioSettings[radioName].type]
                .every(mac => !mac.error);
        });

        const buttonPanel = formData.radioSettings[`radio${this.state.radioNo}`].nodeList ?
            (<span />) : (
                <div style={{marginTop: '10px'}}>
                    <Typography
                        color="primary"
                        style={{
                            // fontWeight: 'bold',
                            fontSize: '14px',
                            float: 'left',
                            marginTop: '20px',
                        }}
                        variant="body2"
                    >
                        * {this.t('neighborNodeLbl')}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={this.clickSave}
                        disabled={disableSave}
                        style={{
                            float: 'right',
                            marginBottom: '20px',
                            marginTop: '15px',
                        }}
                    >
                        {this.t('saveBtnTitle')}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={this.clickReset}
                        style={{
                            float: 'right',
                            marginBottom: '20px',
                            marginTop: '15px',
                            marginRight: 10,
                        }}
                    >
                        {this.t('resetBtnTitle')}
                    </Button>
                </div>
            );

        const exportACL = !disableSave ? (
            <P2Tooltip
                title={this.t('exportButtonLbl')}
                content={
                    <IconButton
                        onClick={this.handleExport}
                        color="inherit"
                        aria-label="Export"
                        disableRipple
                        style={{
                            width: 30,
                            height: 30,
                        }}
                        classes={{
                            label: classes.exportImportLabel
                        }}
                    >
                        <ExportIcon width="18px" height="18px" style={{fill: '#212121'}} />
                    </IconButton>
                }
                key="export"
            />
        )
            :
            (<span key="export" />);

        const importACL = (
            <P2Tooltip
                title={this.t('importButtonLbl')}
                content={
                    <IconButton
                        color="inherit"
                        aria-label="Upload"
                        disableRipple
                        style={{
                            width: 30,
                            height: 30,
                            color: '#212121',
                            // marginRight: '13px',
                        }}
                        classes={{
                            label: classes.exportImportLabel,
                        }}
                    >
                        <ImportIcon width="18px" height="18px" fill="#212121" />
                        <input
                            id="configFile"
                            type="file"
                            accept=".csv"
                            multiple={false}
                            onChange={this.selectFileHandler}
                            filename={this.state.fileName}
                            disabled={this.state.disabledFileUpload}
                            className="fileUploadInput"
                            style={{
                                width: '30px',
                                overflow: 'hidden',
                            }}
                        />
                    </IconButton>
                }
                key="import"
            />
        );
        const toolbarIcon = [exportACL, importACL, this.createPopUpButton()];
        // const toolbarIcon = [exportACL];

        const subTitle = (
            <Typography variant="body2" style={{fontSize: 14, color: 'rgba(33, 33, 33, 0.37)'}}>
                {`${this.t('subTitleLbl')}${this.props.nodes[0].hostname}`}
            </Typography>
        );

        const radioTabHeader = [];
        const radioError = {};


        Object.keys(Constant.neighbourACL.modelOption[model].radioSettings)
        .forEach((radioName, radioIndex) => {
            radioError[radioIndex] = false;
            if (formData.radioSettings[radioName].type === 'none') {
                radioError[radioIndex] = false;
            } else if (formData.radioSettings[radioName]
                .macAddressList[formData.radioSettings[radioName].type].length === 0 ||
                formData.radioSettings[radioName]
                .macAddressList[formData.radioSettings[radioName].type].length > macMaxNo) {
                radioError[radioIndex] = true;
            } else {
                radioError[radioIndex] = !formData.radioSettings[radioName]
                .macAddressList[formData.radioSettings[radioName].type]
                .every(mac => !mac.error);
            }

            // const tabContent = (
            //     <Tab
            //         style={{color: radioError[radioIndex] ? '#DC4639' : '#122d54'}}
            //         label={radioError[radioIndex] ? (
            //             <P2Tooltip
            //                 title={this.t('invalidConfigLbl')}
            //                 content={this.t(`radioTitle.${radioName}`)}
            //                 key={radioName}
            //             />
            //         ) : this.t(`radioTitle.${radioName}`)
            //         }
            //         key={radioName}
            //         classes={{
            //             root: classes.Tab,
            //         }}
            //     />
            // );

            radioTabHeader[radioIndex] = (
                <Tab
                    style={{color: radioError[radioIndex] ? colors.inactiveRed : theme.palette.primary.main}}
                    label={radioError[radioIndex] ? (
                        <span style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginLeft: '21px',
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
                    ) : this.t(`radioTitle.${radioName}`)
                    }
                    key={radioName}
                    classes={{
                        root: classes.Tab,
                    }}
                />
            );
        });

        const radioTabContent = [];

        Object.keys(Constant.neighbourACL.modelOption[model].radioSettings)
        .forEach((radioName, radioIndex) => {
            const formFiedContent = [];
            const radioType = formData.radioSettings[radioName].type;
            const macList = formData.radioSettings[radioName].macAddressList[radioType];
            const enableNodeList = formData.radioSettings[radioName].nodeList;
            const selectToolbar = [this.createSaveMACEntriesButton(radioName, radioType)];
            // this.createRescanMACListButton()];
            const description = (
                <span style={{display: 'flex', alignItems: 'center'}}>
                    {this.createCloseButton(radioName)}
                    {this.t('tblDesc')}
                </span>);
            formData.radioSettings[radioName].tblfooter.label = (
                <Typography
                    color="primary"
                    style={{
                        // fontWeight: 'bold',
                        fontSize: '14px',
                        float: 'left',
                        marginTop: '20px',
                        marginLeft: '20px',
                    }}
                    variant="body2"
                >
                    * {this.t('neighborNodeLbl')}
                </Typography>
            );
            formData.radioSettings[radioName].tblfooter.rowsPerPageOptions = [5, 10, 15, 20, 25];

            if (enableNodeList) {
                const tblToolbar = {
                    description,
                    handleSearch: searchKey => this.handleSearchFn(searchKey, radioName),
                    handleinitiateSearch: () => this.handleinitiateSearchFn(radioName),
                    selectToolbar,
                };
                formData.radioSettings[radioName].tblHeaders.handleRequestSort =
                    (event, property) => this.handleRequestSortFn(event, property, radioName);
                formData.radioSettings[radioName].tblHeaders.handleSelectClick =
                    (event, id, mac, n) => this.handleSelectClickFn(event, id, mac, n, radioName);
                formData.radioSettings[radioName].tblHeaders.handleSelectAllClick =
                    (event, checked, filterData) => this.handleSelectAllClickFn(event, checked, filterData, radioName);
                formData.radioSettings[radioName].tblHeaders.Headers = formData.radioSettings[radioName].tblHeaders.Headers
                    .map((header, idx) => ({
                            ...formData.radioSettings[radioName].tblHeaders.Headers[idx],
                            HeaderLabel: this.t(formData.radioSettings[radioName].tblHeaders.Headers[idx].HeaderLabel),
                    }));
                formData.radioSettings[radioName].tblfooter.handleChangePage =
                    (event, page) => this.handleChangePageFn(event, page, radioName);
                formData.radioSettings[radioName].tblfooter.handleChangeItemsPerPage =
                    event => this.handleChangeItemsPerPageFn(event, radioName);
                // console.log('radioName: ', radioName);
                // console.log('formData.radioSettings[radioName]: ', formData.radioSettings[radioName]);
                // const rescanButton = (
                //     <P2Tooltip
                //         title={this.t('refreshNodeListLbl')}
                //         content={<IconButton
                //             color="inherit"
                //             aria-label="rescan"
                //             onClick={() => this.rescanMACList()}
                //         >
                //             <i
                //                 className="material-icons"
                //             >autorenew</i>
                //         </IconButton>}
                //         key="createRescanMACListButton"
                //     />
                // );
                formFiedContent[0] = (
                    <span
                        style={{
                            display: 'flex',
                            height: '271px',
                        }}
                        key="nodeList"
                    >
                        <LockLayer
                            display={this.state.isLock}
                            top={false}
                            left={false}
                            zIndex={200}
                            opacity={1}
                            color={colors.lockLayerBackground}
                            hasCircularProgress
                            circularMargin="-40px"
                        />
                        <P2DevTbl
                            tblToolbar={tblToolbar}
                            tblHeaders={formData.radioSettings[radioName].tblHeaders}
                            tblData={formData.radioSettings[radioName].tblData
                                .filter(rowArr => macList.every(mac => rowArr[0].ctx !== mac.label))}
                            tblFooter={
                                {
                                    ...formData.radioSettings[radioName].tblfooter,
                                    totalItems: formData.radioSettings[radioName].tblData
                                    .filter(rowArr => macList.every(mac => rowArr[0].ctx !== mac.label)).length,
                                }
                            }
                            backSelected={this.createCloseButton(radioName)}
                            backSearch={this.createCloseButton(radioName)}
                            disableCloseSearchIcon
                            // rescanButton={rescanButton}
                            // disableSearch
                            // disableSelect
                            disablePaper
                            style={{
                                padding: {
                                    // tableCell: '1px',
                                },
                                toolbar: {
                                    minHeight: '40px',
                                    // paddingLeft: '0px',
                                },
                                fontSize: {
                                    header: '12px',
                                    body: '12px',
                                    description: '14px',
                                },
                                footer: {},
                            }}
                        />
                        { formData.radioSettings[radioName].tblData
                                .filter(rowArr => macList.every(mac => rowArr[0].ctx !== mac.label)).length === 0 &&
                            (
                                <div
                                    style={{
                                        display: 'flex',
                                        justifyContent: 'center',
                                        flexWrap: 'wrap',
                                        height: '271px',
                                        alignItems: 'center',
                                        color: 'gray',
                                        fontSize: '25px',
                                        opacity: '0.3',
                                        position: 'absolute',
                                        left: '27%',
                                        zIndex: '-10',
                                    }}
                                >
                                    {this.t('noMACEntries')}
                                </div>
                            )
                        }
                    </span>
                );
                // <span
                //     style={{
                //         display: 'flex',
                //         height: '363px',
                //     }}
                //     key="nodeList"
                // ></span>
            } else {
                Constant.neighbourACL.modelOption[model].radioSettings[radioName].forEach((opt, optIndex) => {
                    const itemList = typeof configOptionType[radioName] !== 'undefined' ?
                        configOptionType[radioName].acl.data.type.data
                        .filter(optionType => optionType.actualValue !== 'none') :
                        [{
                            actualValue: '',
                            displayValue: '',
                        }];
                    const disableLbl = typeof configOptionType[radioName] !== 'undefined' ?
                        configOptionType[radioName].acl.data.type.data
                        .filter(optionType => optionType.actualValue === 'none')[0].displayValue :
                        this.t('disableLbl');

                    const addIcon = (
                        <Tooltip
                            title={this.t('addMAC')}
                            placement="left"
                        >
                            <Icon
                                color="inherit"
                                aria-label="Add"
                                classes={{
                                    root: this.props.classes.IconButton,
                                }}
                            >
                                <i
                                    className="material-icons"
                                    style={{fontSize: '28px', color: '#212121'}}
                                >add_circle</i>
                            </Icon>
                        </Tooltip>
                    );

                    const nodeListIcon = (
                        <Icon
                            color="inherit"
                            aria-label="List"
                            classes={{
                                root: this.props.classes.IconButton,
                            }}
                        >
                            <i
                                className="material-icons"
                                style={{fontSize: '28px', color: '#212121'}}
                            >list</i>
                        </Icon>
                    );
                    const nodeListName = this.t('showNodeList');
                    const nodeListFn = () => this.handleShowNodeList(radioName, true);

                    const actions = [];
                    actions.push({icon: nodeListIcon, name: nodeListName, fn: nodeListFn});

                    switch (Constant.neighbourACL.optionObj.radioSettings[opt].formType) {
                        case 'select':
                            formFiedContent[optIndex] = (
                                <div key={`Type${opt}`}>
                                    <FormSelectCreator
                                        margin="dense"
                                        inputLabel={this.t('typeLbl')}
                                        inputID={`type_${opt}`}
                                        inputValue={radioType}
                                        onChangeField={e => this.handleChange(e, 'type', radioName)}
                                        menuItemObj={itemList}
                                        helperText={this.t('typeHelperText')}
                                        enableButton
                                        buttonLabel={disableLbl}
                                        checked={radioType === 'none'}
                                        onCheckField={() => { this.handleCheck(radioName); }}
                                        showDisable
                                    />
                                </div>
                            );
                            break;
                        case 'macList':
                            formFiedContent[optIndex] = radioType === 'none' ? (
                                <span
                                    style={{
                                        display: 'flex',
                                        height: '135px',
                                    }}
                                    key={`Typography${opt}`}
                                />
                            ) : (
                                <div key={`Typography${opt}`}>
                                    <span style={{display: 'flex', alignItems: 'center'}}>
                                        <Typography
                                            variant="body2"
                                            style={{
                                                fontSize: 14,
                                                color: formData.radioSettings[radioName]
                                                    .macAddressList[radioType].length === 0 ||
                                                    formData.radioSettings[radioName]
                                                    .macAddressList[radioType].length > macMaxNo ?
                                                    colors.inactiveRed : 'rgba(0, 0, 0, 0.54)',
                                            }}
                                        >
                                            {this.t('macAddressList')} ({this.t('macAddressNo')}{formData
                                            .radioSettings[radioName].macAddressList[radioType].length})
                                        </Typography>
                                        <span style={{
                                            marginLeft: 'auto',
                                            display: 'flex',
                                        }}
                                        >
                                            {/* {this.createAddSpeedDialButton(radioName, radioType)} */}
                                            {/* {this.createAddButton(radioName, radioType)}
                                            {this.createNodeListButton(radioName)} */}
                                            <MuiThemeProvider theme={speedDialTheme}>
                                                <P2SpeedDial
                                                    defaultIcon={addIcon}
                                                    defaultIconClick={() => this.handleAdd(radioName, radioType)}
                                                    actions={actions}
                                                />
                                            </MuiThemeProvider>
                                            {this.createDeleteAllButton(radioName, radioType, macList.length)}
                                        </span>
                                    </span>
                                    {
                                        macList.length === 0 ? (
                                            <div
                                                style={{
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                    flexWrap: 'wrap',
                                                    height: '80px',
                                                    alignItems: 'center',
                                                    color: 'gray',
                                                    fontSize: '25px',
                                                    opacity: '0.3',
                                                }}
                                            >
                                                {this.t('noEntryTitle')}
                                            </div>
                                        ) :
                                            (
                                                <div
                                                    style={{
                                                        display: 'flex',
                                                        justifyContent: 'start',
                                                        flexWrap: 'wrap',
                                                        // height: '165px',
                                                        alignContent: 'flex-start',
                                                    }}
                                                >
                                                    {macList.map((data) => {
                                                        const outlinedPrimary = data.error ? classes.clickableError :
                                                            classes.clickable;
                                                        return (
                                                            <Chip
                                                                variant="outlined"
                                                                color="primary"
                                                                // clickable
                                                                key={data.key}
                                                                label={this.createMACInput(data, radioName, radioType)}
                                                                icon={this.createDeleteButton(data, radioName,
                                                                    radioType)}
                                                                classes={{
                                                                    root: classes.chip,
                                                                    outlinedPrimary,
                                                                    label: classes.label,
                                                                }}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            )
                                    }
                                </div>
                            );
                            break;
                        default:
                            break;
                    }
                });
            }
            radioTabContent[radioIndex] = (
                <div
                    component="div"
                    dir="x"
                    key={radioName}
                >
                    {formFiedContent}
                </div>
            );
        });

        return (
            <div>
                {this.state.popUpList ? <MACListDialog
                    open={this.state.popUpList}
                    handlePopUpList={this.handlePopUpList}
                    savePopUpEntries={this.savePopUpEntries}
                    radioSettings={formData.radioSettings}
                    loadData={loadData.radioSettings}
                    configOptionType={configOptionType}
                    nodes={nodes}
                    macMaxNo={macMaxNo}
                /> : <span />
                }
                <div style={{
                    display: 'flex',
                    marginBottom: '10px',
                    alignItems: 'center',
                }}
                >
                    {subTitle}
                    <div style={{
                        marginLeft: 'auto',
                        flexWrap: 'nowrap',
                        display: 'flex',
                    }}
                    >
                        {toolbarIcon.map(icon =>
                            (<span
                                key={icon.key}
                            >
                                {icon}
                            </span>)
                        )}
                    </div>
                </div>
                <Typography variant="body2" style={{fontSize: 14, color: 'rgba(21, 21, 21, 0.87)', marginBottom: '10px'}}>
                    {this.t('meshModeWarningTitleLbl')}
                </Typography>
                <div style={{display: 'flex'}}>
                    <Tabs
                        value={this.state.radioNo}
                        onChange={this.handleRadioChange}
                        indicatorColor="primary"
                        textColor="primary"
                        style={{paddingBottom: '10px'}}
                        classes={{
                            root: classes.Tab,
                            indicator: radioError[this.state.radioNo] ? classes.indicatorError :
                                classes.indicator,
                        }}
                    >
                        {radioTabHeader}
                    </Tabs>
                </div>
                <SwipeableViews
                    axis="x"
                    index={this.state.radioNo}
                >
                    {radioTabContent}
                </SwipeableViews>
                {buttonPanel}
                <P2Dialog
                    open={this.state.dialog.open}
                    handleClose={this.handleDialogOnClose}
                    title={this.state.dialog.title}
                    content={this.state.dialog.content}
                    actionTitle={this.state.dialog.submitTitle}
                    actionFn={this.state.dialog.submitFn}
                    cancelActTitle={this.state.dialog.cancelTitle}
                    cancelActFn={this.state.dialog.cancelFn}
                />
            </div>
        );
    }
}

NeighborAccessControlList.propTypes = {
    nodes: PropTypes.arrayOf(
        PropTypes.shape({
            ipv4: PropTypes.string.isRequired,
            hostname: PropTypes.string.isRequired,
            model: PropTypes.string.isRequired,
            fwVersion: PropTypes.string.isRequired,
            mac: PropTypes.string.isRequired,
        })
    ).isRequired,
    csrf: PropTypes.string.isRequired,
    macToIpMap: PropTypes.objectOf(PropTypes.string).isRequired,
    macToHostnameMap: PropTypes.objectOf(PropTypes.string).isRequired,
    nodeData: PropTypes.objectOf(
        PropTypes.shape({
            ethStatus: PropTypes.arrayOf(PropTypes.string).isRequired,
            firmwareVersion: PropTypes.string.isRequired,
            hostname: PropTypes.string.isRequired,
            mac: PropTypes.string.isRequired,
            model: PropTypes.string.isRequired,
            sn: PropTypes.string.isRequired,
            radioStatus: PropTypes.arrayOf(PropTypes.string).isRequired,
            uptime: PropTypes.number.isRequired,
        })
    ).isRequired,
    edges: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.string.isRequired,
            from: PropTypes.string.isRequired,
            to: PropTypes.string.isRequired,
        })
    ).isRequired,
    projectIdList: PropTypes.objectOf(PropTypes.string).isRequired,
    projectId: PropTypes.string.isRequired,
    close: PropTypes.func.isRequired,
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    pollingHandler: PropTypes.shape(
        {
            restartInterval: PropTypes.func.isRequired,
            stopInterval: PropTypes.func.isRequired,
        }
    ).isRequired,
    updateIsLock: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    toggleSnackBar: PropTypes.func.isRequired,
    // refreshMeshTopology: PropTypes.func.isRequired,
    // refreshNodeInfo: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const {csrf} = state.common;
    const {projectId, projectIdToNameMap: projectIdList} = state.projectManagement;
    const {
        macToIpMap, macToHostnameMap, graph, nodeInfo,
    } = state.meshTopology;
    return {
        projectIdList,
        projectId,
        csrf,
        edges: graph.edges,
        nodeData: nodeInfo,
        macToIpMap,
        macToHostnameMap,
    };
}

const mapDispatchToProps = {
    // refreshMeshTopology,
    // refreshNodeInfo,
    toggleSnackBar,
};

export default compose(
    withTranslation(['node-security-neighbor-acl']),
    connect(mapStateToProps, mapDispatchToProps),
    withStyles(styles)
)(NeighborAccessControlList);
