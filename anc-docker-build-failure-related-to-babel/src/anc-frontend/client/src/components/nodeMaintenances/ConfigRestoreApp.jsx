/**
* @Author: mango
* @Date:   2018-05-15T16:25:07+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-11-16T15:01:15+08:00
*/
import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import Typography from '@material-ui/core/Typography';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import {withStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import P2PointsToNote from './P2PointsToNote';
import {getConfig, setConfig, getFilteredConfigOptions} from '../../util/apiCall';
import P2Dialog from '../common/P2Dialog';
import P2FileUpload from '../common/P2FileUpload';
import Constant from '../../constants/common';
import P2DevTbl from '../common/P2DevTbl';
import P2Tooltip from '../common/P2Tooltip';
import Transition from '../common/Transition';
import InvalidConfigContainer from '../common/InvalidConfigContainer';
import check from '../../util/errorValidator';
import checkConfigValue from '../../util/configValidator';

const {themeObj, theme, colors} = Constant;


const get = (o, p) =>
    p.reduce(
        (xs, x) =>
            ((xs && xs[x]) ?
                xs[x] : null), o);

const wrapper = promise => (
    promise
        .then(data => ({data, error: null}))
        .catch(error => ({error, data: null}))
);

function deepClone(object) {
    return JSON.parse(JSON.stringify(object));
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
    grid: {
        textAlign: 'center',
    },
    optionTitleText: {
        fontSize: '10px',
        color: '#9a9a9a',
    },
    optionValueText: {
        fontSize: '23px',
        color: themeObj.primary.light,
        fontWeight: '300',
        wordWrap: 'break-word',
        overflowWrap: 'break-word'
    },
    optionValueIconActive: {
        color: colors.activeGreen,
        padding: '2px',
        display: 'flex',
    },
    optionValueIconInactive: {
        color: colors.inactiveRed,
        padding: '2px',
        display: 'flex',
    },
    timeText: {
        padding: '22px 0px 0px',
        color: colors.dialogText,
        fontSize: '12px',
        display: 'inline-block',
    },
    hintsText: {
        fontSize: '10px',
        color: colors.black75,
    },
};


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

function extractSourceConfig(Config) {
    const newConfig = JSON.parse(JSON.stringify(Config));

    if (typeof newConfig.meshSettings.discrepancies !== 'undefined') {
        delete newConfig.meshSettings.discrepancies;
    }

    Object.keys(Config.radioSettings).forEach((mac) => {
        if (Config.radioSettings[mac].success) {
            newConfig.radioSettings[mac] = Config.radioSettings[mac].data;
        }
    });
    Object.keys(Config.nodeSettings).forEach((mac) => {
        if (Config.nodeSettings[mac].success) {
            newConfig.nodeSettings[mac] = Config.nodeSettings[mac].data;
        }
    });

    return newConfig;
}

function getRadioFilterConfigOption(ctx, nodeIp, filterConfig, radio, key) {
    if (filterConfig.radioSettings[nodeIp][radio][key].type === 'enum') {
        const value = filterConfig.radioSettings[nodeIp][radio][key].data
            .find(option => option.actualValue === ctx.toString());
        return typeof value !== 'undefined' ? value.displayValue : '-';
    }
    return ctx;
}

function getNodeFilterConfigOption(ctx, nodeIp, filterConfig, key) {
    if (filterConfig.nodeSettings[nodeIp][key].type === 'enum') {
        const value = filterConfig.nodeSettings[nodeIp][key].data
            .find(option => option.actualValue === ctx.toString());
        return typeof value !== 'undefined' ? value.displayValue : '-';
    }
    return ctx;
}

function getProfileFilterConfigOption(ctx, nodeIp, filterConfig, key) {
    if (filterConfig.profileSettings[nodeIp].nbr['1'][key].type === 'enum') {
        const value = filterConfig.profileSettings[nodeIp].nbr['1'][key].data
            .find(option => option.actualValue === ctx.toString());
        return typeof value !== 'undefined' ? value.displayValue : '-';
    }
    return ctx;
}

// function getEthernetFilterConfigOption(ctx, nodeIp, filterConfig, eth, key) {
//     if (filterConfig.ethernetSettings[nodeIp][eth][key].type === 'enum') {
//         const value = filterConfig.ethernetSettings[nodeIp][eth][key].data
//             .find(option => option.actualValue === ctx);
//         return typeof value !== 'undefined' ? value.displayValue : '-';
//     }
//     return ctx;
// }

class ConfigRestore extends React.Component {
    constructor(props) {
        super(props);

        this.t = (tKey, options) => this.props.t(tKey, {...this.props.labels, ...options});

        const fnNames = [
            'clickRestore',
            'handleDialogOnClose',
            'updateInvalidConfigDialog',
            'handleInvalidDialogOnClose',
            'selectFileHandler',
            'handleCheckboxChange',
            'restoreProcess',
            'setConfigProcess',
            'getConfigSuccess',
            'getConfigError',
            'setConfigSuccess',
            'setConfigError',
            'previewConfig',
            'createExpansionPanel',
            'createRadioGrid',
            'createEthContent',
            'createNodeContent',
            'closePreview',
            'chooseTargetNode',
            'handleSearchFn',
            'handleinitiateSearchFn',
            'handleChangePageFn',
            'handleChangeItemsPerPageFn',
            'handleRequestSortFn',
            'handleSelectRadioClickFn',
            'closeChooseNode',
        ];

        window.__.each(fnNames, (fnName) => {
            this[fnName] = this[fnName].bind(this);
        });

        this.state = {
            dialog: {
                open: false,
                title: '',
                content: '',
                submitTitle: this.t('submitTitle'),
                submitFn: this.handleDialogOnClose,
                cancelTitle: '',
                cancelFn: this.handleDialogOnClose,
            },
            invalidConfigDialogOpen: false,
            // invalidFilterConfig: {
            //     meshSettings: {},
            //     radioSettings: {
            //         '127.0.17.10': {
            //             radio0: {
            //                 centralFreq: 'invalid',
            //                 channel: 'invalid',
            //                 txpower: 'invalid',
            //             },
            //             radio1: {
            //                 centralFreq: 'wrongEnum',
            //                 channel: 'wrongEnum',
            //                 txpower: 'wrongEnum',
            //             },
            //         },
            //     },
            //     nodeSettings: {
            //         '127.0.17.10': {
            //             hostname: 'wrongRegex',
            //         },
            //     },
            //     ethernetSettings: {
            //         '127.0.17.10': {
            //             eth0: {
            //                 ethernetLink: 'wrongEnum',
            //             },
            //             eth1: {
            //                 ethernetLink: 'wrongEnum',
            //             },
            //         },
            //     },
            //     profileSettings: {
            //         '127.0.17.10': {
            //             nbr: {
            //                 '1': {
            //                     maxNbr: 'wrongEnum'
            //                 }
            //             }
            //         }
            //     },
            //     expanded: {
            //         meshSettings: false,
            //         node: {
            //             '127.0.17.10': true,
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
            file: '',
            fileName: '',
            fileSize: '',
            disabledFileUpload: false,
            disabledRestore: true,
            checkedNotes: false,
            nodePreviewDialog: {
                open: false,
            },
            previewContent: {
                hostname: this.t('defaultValue'),
                mac: this.t('defaultValue'),
                timeStamp: this.t('defaultValue'),
                nodeSettings: {
                    display: true,
                    hostname: this.t('defaultValue'),
                    mobilityDomain: this.t('defaultValue'),
                },
                radio0: {
                    display: true,
                    status: true,
                    channel: this.t('defaultValue'),
                    channelBandwidth: this.t('defaultValue'),
                    txPower: this.t('defaultValue'),
                    radioFilter: true,
                    distance: this.t('defaultValue'),
                    rssiFilterLower: this.t('defaultValue'),
                    rssiFilterUpper: this.t('defaultValue'),
                    rssiFilterTolerance: this.t('defaultValue'),
                },
                radio1: {
                    display: true,
                    status: true,
                    channel: this.t('defaultValue'),
                    channelBandwidth: this.t('defaultValue'),
                    txPower: this.t('defaultValue'),
                    radioFilter: true,
                    distance: this.t('defaultValue'),
                    rssiFilterLower: this.t('defaultValue'),
                    rssiFilterUpper: this.t('defaultValue'),
                    rssiFilterTolerance: this.t('defaultValue'),
                },
                radio2: {
                    display: false,
                    status: true,
                    channel: this.t('defaultValue'),
                    channelBandwidth: this.t('defaultValue'),
                    txPower: this.t('defaultValue'),
                    radioFilter: true,
                    distance: this.t('defaultValue'),
                    rssiFilterLower: this.t('defaultValue'),
                    rssiFilterUpper: this.t('defaultValue'),
                    rssiFilterTolerance: this.t('defaultValue'),
                },
                eth0: {
                    display: false,
                    ethernetLink: false,
                },
                eth1: {
                    display: false,
                    ethernetLink: false,
                },
            },
            backupContent: '',
            chooseNodeDialog: {
                open: false,
                timeStamp: this.t('defaultValue'),
            },
            isConfigBackupMismatch: false,
            table: {
                headers: {
                    Headers: [
                        {
                            id: 'hostname',
                            HeaderLabel: 'hostnameTitle',
                            isSorted: true,
                            sortType: 0,
                            canSort: true,
                        },
                        {
                            id: 'mac',
                            HeaderLabel: 'macTitle',
                            isSorted: false,
                            sortType: 0,
                            canSort: true,
                        },
                        {
                            id: 'model',
                            HeaderLabel: 'modelTitle',
                            isSorted: false,
                            sortType: 0,
                            canSort: true,
                        },
                        {
                            id: 'fwVersion',
                            HeaderLabel: 'fwVersionTitle',
                            isSorted: false,
                            sortType: 0,
                            canSort: true,
                        },
                    ],
                    searchKey: '',
                    searching: true,
                    handleRequestSort: this.handleRequestSortFn,
                    handleSelectRadioClick: this.handleSelectRadioClickFn,
                    selectedMac: [],
                    disabledMac: [],
                },
                data: [],
                footer: {
                    totalItems: 0,
                    itemsPerPage: 5,
                    currentPage: 0,
                    handleChangePage: this.handleChangePageFn,
                    handleChangeItemsPerPage: this.handleChangeItemsPerPageFn,
                    rowsPerPageOptions: [5, 10, 25],
                },
            },
        };
    }

    setConfigProcess(setConfigObj) {
        this.props.pollingHandler.stopInterval();
        // const projectId = Cookies.get('projectId');
        // Call set-config api
        const p = setConfig(this.props.csrf, this.props.projectId, setConfigObj);

        p.then((value) => {
            this.setConfigSuccess(value.rtt);
        }).catch((error) => {
            this.props.pollingHandler.restartInterval();
            this.setConfigError(error);
        });
    }

    setConfigSuccess(rtt) {
        setTimeout(() => {
            this.setState({
                ...this.state,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('restoreSuccessTitle'),
                    content: this.t('restoreSuccessContent'),
                    submitTitle: this.t('submitTitle'),
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

    setConfigError(error) {
        const {title, content} = check(error);
        this.setState({
            ...this.state,
            dialog: {
                ...this.state.dialog,
                open: true,
                title: title !== '' ? title : this.t('restoreFailTitle'),
                content: title !== '' ? content : this.t('restoreFailContent'),
                submitTitle: this.t('submitTitle'),
                submitFn: () => {
                    this.props.close(this.props.nodes[0].ipv4);
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

    getConfigError(error) {
        const {title, content} = check(error);
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: true,
                title: title !== '' ? title : this.t('restoreFailTitle'),
                content: title !== '' ? content : this.t('restoreFailContent'),
                submitTitle: this.t('submitTitle'),
                submitFn: () => {
                    this.props.close(this.props.nodes[0].ipv4);
                },
                cancelTitle: '',
                cancelFn: this.handleDialogOnClose,
            },
        });
        this.props.updateIsLock(false);
    }

    handleCheckboxChange() {
        let disabledRestoreBtn = false;

        if (this.state.file === '' || this.state.checkedNotes) {
            disabledRestoreBtn = true;
        }
        this.setState({
            ...this.state,
            checkedNotes: !this.state.checkedNotes,
            disabledRestore: disabledRestoreBtn,
        });
    }

    selectFileHandler(event) {
        event.stopPropagation();
        event.preventDefault();

        const file = event.target.files[0];
        const filename = typeof file === 'undefined' ? '' : file.name;
        let filesize = typeof file === 'undefined' ? '' : file.size;

        if (filesize !== '') {
            filesize = `, ${filesize} ${this.t('bytes')}`;
        }
        let disabledRestoreBtn = false;

        if (typeof file === 'undefined' || !this.state.checkedNotes) {
            disabledRestoreBtn = true;
        }

        this.setState({
            file,
            fileName: filename,
            fileSize: filesize,
            disabledRestore: disabledRestoreBtn,
        });
    }

    restoreProcess() {
        this.setState({
            nodePreviewDialog: {
                open: false,
            },
        });
        this.props.updateIsLock(true);

        const {radioSettings, nodeSettings, ethernetSettings, profileSettings} = this.state.setConfigObj.sourceConfig;
        // const {nodes} = this.state.backupContent.p2BackupConfig;
        // const nodesKeyArr = Object.keys(nodes);
        // const mac = this.state.table.headers.selectedMac.length === 0 ?
        //     nodesKeyArr[0] : this.state.table.headers.selectedMac[0];
        // const {config} = nodes[mac];

        // Generate setting config object
        const setConfigObj = {};
        setConfigObj.diff = {};
        setConfigObj.diff.radioSettings = radioSettings;
        setConfigObj.diff.nodeSettings = nodeSettings;
        Object.keys(setConfigObj.diff.nodeSettings).forEach((nodeIp) => {
            delete setConfigObj.diff.nodeSettings[nodeIp].acl;
        });
        setConfigObj.diff.ethernetSettings = ethernetSettings;
        setConfigObj.diff.profileSettings = profileSettings;

        // Get config to get the checksums for save-config
        // const projectId = Cookies.get('porjectId');
        const bodyMsg = {nodes: [this.props.nodes[0].ipv4]};
        const p = getConfig(this.props.csrf, this.props.projectId, bodyMsg);

        p.then((value) => {
            this.getConfigSuccess(value, setConfigObj);
        }).catch((error) => {
            this.getConfigError(error);
        });
    }

    handleDialogOnClose() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: false,
            },
        });
    }

    handleInvalidDialogOnClose() {
        this.setState({
            invalidConfigDialogOpen: false,
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
        });
        this.props.updateIsLock(false);
    }

    clickRestore() {
        // Lock the maintenance page
        this.props.updateIsLock(true);

        // Read files
        const reader = new FileReader();
        reader.readAsText(this.state.file, 'UTF-8');
        reader.onload = function (evt) {
            const fileContent = evt.target.result;
            try {
                const decodeBackupJson = atob(fileContent);
                const decodeBackup = JSON.parse(decodeBackupJson);

                console.log(decodeBackup);

                // File content checking
                if (typeof decodeBackup.p2BackupConfig === 'undefined') {
                    throw new Error(this.t('invalidFileErr'));
                }
                if (decodeBackup.p2BackupConfig.type === 'node') {
                    this.previewConfig(decodeBackup);
                } else {
                    this.chooseTargetNode(decodeBackup);
                }
            } catch (e) {
                console.log('trace error clickRestore', e);
                console.log(e.message);
                this.setState({
                    dialog: {
                        ...this.state.dialog,
                        open: true,
                        title: this.t('restoreErrorTitle'),
                        content: this.t('invalidFileErrContent'),
                        submitTitle: this.t('submitTitle'),
                        submitFn: this.handleDialogOnClose,
                        cancelTitle: '',
                        cancelFn: this.handleDialogOnClose,
                    },
                });
                this.props.updateIsLock(false);
            }
        }.bind(this);

        reader.onerror = function () {
            this.setState({
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('restoreErrorTitle'),
                    content: this.t('invalidFileErrContent'),
                    submitTitle: this.t('submitTitle'),
                    submitFn: this.handleDialogOnClose,
                    cancelTitle: '',
                    cancelFn: this.handleDialogOnClose,
                },
            });
            this.props.updateIsLock(false);
        };
    }

    createConfigOptionRequest(getConfigObj, decodeBackup, mac) {

        const {config, model} = decodeBackup.p2BackupConfig.nodes[mac];
        const {checksums, ...Setting} = getConfigObj;
        const nodeIp = this.props.nodes[0].ipv4;
        const options = getOptionsFromGetConfigObj(Setting);
        const bodyMsg = {
            options,
            sourceConfig: {},
        };
        bodyMsg.sourceConfig = extractSourceConfig(JSON.parse(JSON.stringify(Setting)));
        const radioSettings = {};
        Object.keys(bodyMsg.sourceConfig.radioSettings[nodeIp]).forEach((radioName) => {
            radioSettings[radioName] = Object.keys(bodyMsg.sourceConfig.radioSettings[nodeIp][radioName]);
            delete bodyMsg.sourceConfig.radioSettings[nodeIp][radioName].acl;
        });

        const isConfigBackupMismatch =
        !Object.keys(bodyMsg.sourceConfig.radioSettings[nodeIp]).every(radioName =>
            Object.keys(bodyMsg.sourceConfig.radioSettings[nodeIp][radioName]).every((opt) => {
                if (config.radioSettings[radioName]) {
                    return opt in config.radioSettings[radioName];
                }
                return false;
            }) || (model !== this.props.nodes[0].model)
        ) && !Object.keys(bodyMsg.sourceConfig.ethernetSettings[nodeIp]).every(ethName =>
            Object.keys(bodyMsg.sourceConfig.ethernetSettings[nodeIp][ethName]).every((opt) => {
                if (config.ethernetSettings[ethName]) {
                    return opt in config.ethernetSettings[ethName];
                }
                return false;
            }) || (model !== this.props.nodes[0].model)
        );

        Object.keys(config.radioSettings).forEach((radioName) => {
            if (bodyMsg.sourceConfig.radioSettings[nodeIp][radioName]) {
                Object.keys(config.radioSettings[radioName]).forEach((key) => {
                    bodyMsg.sourceConfig.radioSettings[nodeIp][radioName][key] = config.radioSettings[radioName][key];
                });
                if (!('status' in config.radioSettings[radioName])) {
                    bodyMsg.sourceConfig.radioSettings[nodeIp][radioName].status =
                        config.radioSettings[radioName].operationMode !== 'disable' ? 'enable' : 'disable';
                }
            }
        });
        const operationModeUniqueSet = new Set(Object.keys(bodyMsg.sourceConfig.radioSettings[nodeIp])
            .map(radioName => bodyMsg.sourceConfig.radioSettings[nodeIp][radioName].operationMode));
        const isOperationModeValid = !(operationModeUniqueSet.has('static') && operationModeUniqueSet.has('mobile'));

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
        Object.keys(config.nodeSettings).forEach((opt) => {
            bodyMsg.sourceConfig.nodeSettings[nodeIp][opt] = config.nodeSettings[opt];
        });

        console.log('kyle_debug ~ file: ConfigRestoreApp.jsx ~ line 737 ~ ConfigRestore ~ createConfigOptionRequest ~ config', config)
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

        // Object.keys(decodeBackup.p2BackupConfig.meshSettings).forEach((opt) => {
        //     bodyMsg.sourceConfig.meshSettings[opt] =
        //         decodeBackup.p2BackupConfig.meshSettings[opt];
        // });
        console.log(isConfigBackupMismatch);
        return {bodyMsg2: bodyMsg, isConfigBackupMismatch, isOperationModeValid};
    }

    async previewConfig(decodeBackup, selectedMAC) {
        const {createdTimestamp, nodes} = decodeBackup.p2BackupConfig;
        const bodyMsg = {nodes: [this.props.nodes[0].ipv4]};
        try {
            let mac = Object.keys(nodes)[0];
            if (typeof selectedMAC !== 'undefined') {
                mac = selectedMAC;
            }
            const {config, model} = nodes[mac];
            const nodeModel = this.props.nodes[0].model;
            if (nodeModel !== model) {
                this.setState({
                    dialog: {
                        ...this.state.dialog,
                        open: true,
                        title: this.t('restoreErrorTitle'),
                        content: this.t('crossModelErr'),
                        submitTitle: this.t('submitTitle'),
                        submitFn: this.handleDialogOnClose,
                        cancelTitle: '',
                        cancelFn: this.handleDialogOnClose,
                    },
                });
                this.props.updateIsLock(false);
            } else {
                // const deepClone = object => JSON.parse(JSON.stringify(object));
                // const projectId = Cookies.get('porjectId');
                const getConfigObj = await getConfig(this.props.csrf, this.props.projectId, bodyMsg);
                // const getConfigObj1 = await getConfig(this.props.csrf, bodyMsg);
                // const getConfigObj = deepClone(getConfigObj1);
                // getConfigObj.ethernetSettings[this.props.nodes[0].ipv4].eth0.mtu = 1500;
                // getConfigObj.ethernetSettings[this.props.nodes[0].ipv4].eth1.mtu = 1500;
                // getConfigObj.radioSettings[this.props.nodes[0].ipv4].radio0.mcs = 'auto';
                // getConfigObj.radioSettings[this.props.nodes[0].ipv4].radio1.mcs = 'auto';
                // getConfigObj.radioSettings[this.props.nodes[0].ipv4].radio2.mcs = 'auto';
                // getConfigObj.radioSettings[this.props.nodes[0].ipv4].radio0.shortgi = 'enable';
                // getConfigObj.radioSettings[this.props.nodes[0].ipv4].radio1.shortgi = 'enable';
                // getConfigObj.radioSettings[this.props.nodes[0].ipv4].radio2.shortgi = 'enable';
                // getConfigObj.radioSettings[this.props.nodes[0].ipv4].radio0.profileId = {nbr: '1'};
                // getConfigObj.radioSettings[this.props.nodes[0].ipv4].radio1.profileId = {nbr: '1'};
                // getConfigObj.radioSettings[this.props.nodes[0].ipv4].radio2.profileId = {nbr: '1'};
                // getConfigObj.profileSettings = {[this.props.nodes[0].ipv4]: {nbr: {'1': {maxNbr: '6'}}}};
                let filterConfig = {};
                const {bodyMsg2, isConfigBackupMismatch, isOperationModeValid} = this.createConfigOptionRequest(
                    JSON.parse(JSON.stringify(getConfigObj)), decodeBackup, mac);
                if (!isOperationModeValid) {
                    this.setState({
                        dialog: {
                            ...this.state.dialog,
                            open: true,
                            title: this.t('operationModeNotIdenticalTitle'),
                            content: this.t('operationModeNotIdenticalContent'),
                            submitTitle: this.t('submitTitle'),
                            submitFn: this.handleDialogOnClose,
                            cancelTitle: '',
                            cancelFn: this.handleDialogOnClose,
                        },
                    });
                    this.props.updateIsLock(false);
                } else {
                    // const projectId = Cookies.get('projectId');
                    const {error, data} = await wrapper(getFilteredConfigOptions(this.props.csrf, this.props.projectId, bodyMsg2));
                    if (!error) {
                        // data.ethernetSettings[this.props.nodes[0].ipv4].eth0.mtu = {
                        //     type: 'int',
                        //     data: {
                        //         min: 1500,
                        //         max: 1868,
                        //     },
                        // };
                        // data.ethernetSettings[this.props.nodes[0].ipv4].eth1.mtu = {
                        //     type: 'int',
                        //     data: {
                        //         min: 1500,
                        //         max: 1868,
                        //     },
                        // };
                        // data.radioSettings[this.props.nodes[0].ipv4].radio0.mcs = mcsMockOption;
                        // data.radioSettings[this.props.nodes[0].ipv4].radio1.mcs = mcsMockOption;
                        // data.radioSettings[this.props.nodes[0].ipv4].radio2.mcs = mcsMockOption;
                        // data.radioSettings[this.props.nodes[0].ipv4].radio0.shortgi = shortgiMockOption;
                        // data.radioSettings[this.props.nodes[0].ipv4].radio1.shortgi = shortgiMockOption;
                        // data.radioSettings[this.props.nodes[0].ipv4].radio2.shortgi = shortgiMockOption;
                        // data.profileSettings = {
                        //     [this.props.nodes[0].ipv4]: {
                        //         nbr: {
                        //             '1': {
                        //                 maxNbr: {
                        //                     type: "enum",
                        //                     data: [
                        //                         {
                        //                             actualValue: "1",
                        //                             displayValue: "1"
                        //                         },
                        //                         {
                        //                             actualValue: "2",
                        //                             displayValue: "2"
                        //                         },
                        //                         {
                        //                             actualValue: "6",
                        //                             displayValue: "6"
                        //                         },
                        //                         {
                        //                             actualValue: "18",
                        //                             displayValue: "18"
                        //                         },
                        //                         {
                        //                             actualValue: "disable",
                        //                             displayValue: "Disable",
                        //                         },
                        //                     ]
                        //                 }
                        //             }
                        //         }
                        //     }
                        // }
                        filterConfig = data;
                    } else {
                        const {title, content} = check(error);
                        const dialog = {
                            ...this.state.dialog,
                            open: true,
                            title: title !== '' ? title : this.t('restoreErrorTitle'),
                            content: title !== '' ? content : this.t('invalidFileErrContent'),
                            submitTitle: this.t('submitTitle'),
                            submitFn: this.handleDialogOnClose,
                            cancelTitle: '',
                            cancelFn: this.handleDialogOnClose,
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
                            this.setState(dialog);
                            this.props.updateIsLock(false);
                        }
                    }
                    console.log('filterconfig: ', filterConfig);
                    const {success, invalidFilterConfigRes} = checkConfigValue(
                        this.state.invalidFilterConfig, filterConfig, deepClone(bodyMsg2.sourceConfig), [this.props.nodes[0].ipv4]
                    );

                    if (success) {
                        const {radioSettings, nodeSettings, ethernetSettings, profileSettings} = config;
                        const previewObj = {};

                        previewObj.timeStamp = createdTimestamp;
                        previewObj.hostname = nodeSettings.hostname;
                        previewObj.mac = mac;

                        previewObj.nodeSettings = {};
                        previewObj.nodeSettings.hostname = nodeSettings.hostname;
                        previewObj.nodeSettings.display = true;

                        // check if there are endt option
                        if (
                            nodeSettings.endtSendInterval !== undefined && 
                            nodeSettings.endtRecvTimeout !== undefined && 
                            nodeSettings.endtPriority !== undefined
                        ) {
                            previewObj.nodeSettings.endtSendInterval = nodeSettings.endtSendInterval;
                            previewObj.nodeSettings.endtRecvTimeout = nodeSettings.endtRecvTimeout;
                            previewObj.nodeSettings.endtPriority = nodeSettings.endtPriority;
                        }

                        // ACS
                        const acsConfigVal = getConfigObj?.nodeSettings?.[this.props.nodes[0].ipv4]?.acs ?? '-';
                        previewObj.nodeSettings.acs = getNodeFilterConfigOption(acsConfigVal,
                            this.props.nodes[0].ipv4, filterConfig, 'acs');
                        
                        previewObj.nodeSettings.acsInterval = nodeSettings?.acsInterval;
                        previewObj.nodeSettings.acsChannelList = nodeSettings?.acsChannelList;

                        // ATPC interval
                        if (nodeSettings.atpcInterval !== undefined) {
                            previewObj.nodeSettings.atpcInterval = nodeSettings.atpcInterval;
                        }

                        // ATPC interval
                        if (nodeSettings.allowReboot !== undefined) {
                            previewObj.nodeSettings.allowReboot = nodeSettings.allowReboot;
                        }

                        // getConfigObj.profileSettings = {[this.props.nodes[0].ipv4]: {nbr: {'1': {maxNbr: 'disable'}}}};
                        if (getConfigObj.profileSettings) {
                            let sumOfRadioMaxNbr = 0;
                            Object.keys(radioSettings).forEach((radio) => {
                                if (radioSettings[radio].status === 'enable') {
                                    sumOfRadioMaxNbr += radioSettings[radio].maxNbr;
                                }
                            });
                            const nodeMaxNbr = profileSettings?.nbr?.['1']?.maxNbr ??
                                getConfigObj?.profileSettings?.[this.props.nodes[0].ipv4]?.nbr?.['1']?.maxNbr ?? '-';
                            previewObj.nodeSettings.maxNbr = getProfileFilterConfigOption(nodeMaxNbr,
                                this.props.nodes[0].ipv4, filterConfig, 'maxNbr');
                            if (nodeMaxNbr === 'disable' || nodeMaxNbr === '-') {
                                previewObj.nodeSettings.maxNbrWarning = false;
                            } else {
                                previewObj.nodeSettings.maxNbrWarning = sumOfRadioMaxNbr > parseInt(nodeMaxNbr, 10);
                            }
                        }

                        for (let i = 0; i <= 2; i += 1) {
                            if (typeof radioSettings[`radio${i}`] !== 'undefined') {
                                // previewObj.nodeSettings.mobilityDomain = typeof radioSettings
                                // .radio0.mobilityDomain !== 'undefined' ? radioSettings.radio0.mobilityDomain :
                                //     getConfigObj.radioSettings[this.props.nodes[0].ipv4].radio0.mobilityDomain;
                                // console.log('kyle_debug: ConfigRestore -> previewConfig -> mobilityDomain',
                                    // previewObj.nodeSettings.mobilityDomain);
                                previewObj[`radio${i}`] = {};
                                previewObj[`radio${i}`].display = true;
                                if (typeof radioSettings[`radio${i}`].status !== 'undefined') {
                                    previewObj[`radio${i}`].status = radioSettings[`radio${i}`].status !== 'disable';
                                    previewObj[`radio${i}`].operationMode =
                                        getRadioFilterConfigOption(radioSettings[`radio${i}`].operationMode,
                                            this.props.nodes[0].ipv4, filterConfig, `radio${i}`, 'operationMode')
                                            .toUpperCase();
                                } else {
                                    previewObj[`radio${i}`].status =
                                        radioSettings[`radio${i}`].operationMode !== 'disable';
                                    previewObj[`radio${i}`].operationMode =
                                        getRadioFilterConfigOption(radioSettings[`radio${i}`].operationMode,
                                            this.props.nodes[0].ipv4, filterConfig, `radio${i}`, 'operationMode')
                                            .toUpperCase();
                                }
                                previewObj[`radio${i}`].displayBand =
                                    typeof decodeBackup.p2BackupConfig.nodes[mac].config
                                    .radioSettings[`radio${i}`].band !== 'undefined';
                                previewObj[`radio${i}`].band = {
                                    actualValue: radioSettings[`radio${i}`].band,
                                    displayValue: getRadioFilterConfigOption(radioSettings[`radio${i}`].band,
                                        this.props.nodes[0].ipv4, filterConfig, `radio${i}`, 'band'),
                                };
                                previewObj[`radio${i}`].channel =
                                    getRadioFilterConfigOption(radioSettings[`radio${i}`].channel,
                                        this.props.nodes[0].ipv4, filterConfig, `radio${i}`, 'channel');
                                previewObj[`radio${i}`].channelBandwidth =
                                    getRadioFilterConfigOption(radioSettings[`radio${i}`].channelBandwidth,
                                        this.props.nodes[0].ipv4, filterConfig, `radio${i}`, 'channelBandwidth');
                                previewObj[`radio${i}`].centralFreq = previewObj[`radio${i}`].displayBand &&
                                    decodeBackup.p2BackupConfig.nodes[mac].config
                                        .radioSettings[`radio${i}`].band === '4.9' ?
                                    getRadioFilterConfigOption(radioSettings[`radio${i}`].centralFreq,
                                        this.props.nodes[0].ipv4, filterConfig, `radio${i}`, 'centralFreq') :
                                    '';
                                previewObj[`radio${i}`].txPower =
                                    getRadioFilterConfigOption(radioSettings[`radio${i}`].txpower,
                                        this.props.nodes[0].ipv4, filterConfig, `radio${i}`, 'txpower');
                                previewObj[`radio${i}`].radioFilter =
                                    radioSettings[`radio${i}`].radioFilter === 'enable';
                                previewObj[`radio${i}`].distance =
                                    typeof radioSettings[`radio${i}`].distance !== 'string' ?
                                        `${radioSettings[`radio${i}`].distance} ${this.t('distanceUnit')}` :
                                        this.t('defaultTxt');
                                previewObj[`radio${i}`].maxNbr =
                                    getRadioFilterConfigOption(radioSettings[`radio${i}`].maxNbr,
                                        this.props.nodes[0].ipv4, filterConfig, `radio${i}`, 'maxNbr') === 'Unlimited' ?
                                        'UNLIMITED' :
                                        getRadioFilterConfigOption(radioSettings[`radio${i}`].maxNbr,
                                            this.props.nodes[0].ipv4, filterConfig, `radio${i}`, 'maxNbr');
                                previewObj[`radio${i}`].mcs = get(radioSettings[`radio${i}`], ['mcs']) ?
                                    getRadioFilterConfigOption(radioSettings[`radio${i}`].mcs,
                                        this.props.nodes[0].ipv4, filterConfig, `radio${i}`, 'mcs').toUpperCase() :
                                    getRadioFilterConfigOption(get(
                                        getConfigObj.radioSettings[this.props.nodes[0].ipv4], [`radio${i}`, 'mcs']),
                                    this.props.nodes[0].ipv4, filterConfig, `radio${i}`, 'mcs').toUpperCase();
                                previewObj[`radio${i}`].shortgi = get(radioSettings[`radio${i}`], ['shortgi']) ?
                                        get(radioSettings[`radio${i}`], ['shortgi']) :
                                        get(getConfigObj.radioSettings[this.props.nodes[0].ipv4], [`radio${i}`, 'shortgi']);
                                previewObj[`radio${i}`].rtsCts = get(radioSettings[`radio${i}`], ['rtsCts']) ?
                                    get(radioSettings[`radio${i}`], ['rtsCts']) :
                                    get(getConfigObj.radioSettings[this.props.nodes[0].ipv4], [`radio${i}`, 'rtsCts']);
                                if (get(radioSettings[`radio${i}`], ['rssiFilterLower'])) {
                                    previewObj[`radio${i}`].rssiFilterLower =
                                        radioSettings[`radio${i}`].rssiFilterLower !== 255 ?
                                            `${radioSettings[`radio${i}`].rssiFilterLower} ${this.t('txpowerUnit')}` :
                                            this.t('disabledCapital');
                                    previewObj[`radio${i}`].rssiFilterUpper =
                                        radioSettings[`radio${i}`].rssiFilterUpper !== 255 ?
                                            `${radioSettings[`radio${i}`].rssiFilterUpper} ${this.t('txpowerUnit')}` :
                                        this.t('disabledCapital');
                                    previewObj[`radio${i}`].rssiFilterTolerance =
                                        `${radioSettings[`radio${i}`].rssiFilterTolerance} ${this.t('txpowerUnit')}`;
                                } else {
                                    previewObj[`radio${i}`].rssiFilterLower =
                                        getConfigObj.radioSettings[this.props.nodes[0].ipv4][`radio${i}`]
                                        .rssiFilterLower !== 255 ?
                                            `${getConfigObj.radioSettings[this.props.nodes[0].ipv4][`radio${i}`]
                                            .rssiFilterLower} ${this.t('txpowerUnit')}` :
                                            this.t('disabledCapital');
                                    previewObj[`radio${i}`].rssiFilterUpper =
                                        getConfigObj.radioSettings[this.props.nodes[0].ipv4][`radio${i}`]
                                        .rssiFilterUpper !== 255 ?
                                            `${getConfigObj.radioSettings[this.props.nodes[0].ipv4][`radio${i}`]
                                            .rssiFilterUpper} ${this.t('txpowerUnit')}` :
                                            this.t('disabledCapital');
                                    previewObj[`radio${i}`].rssiFilterTolerance =
                                        `${getConfigObj.radioSettings[this.props.nodes[0].ipv4][`radio${i}`]
                                        .rssiFilterTolerance} ${this.t('txpowerUnit')}`;
                                }
                                // atpc option
                                const radioData =  radioSettings[`radio${i}`];
                                if (radioData) {
                                    if (
                                        'atpcRangeLower' in radioData &&
                                        'atpcRangeUpper' in radioData &&
                                        'atpcTargetRssi' in radioData
                                    ) {
                                        previewObj[`radio${i}`].atpcRangeLower = radioSettings[`radio${i}`].atpcRangeLower;
                                        previewObj[`radio${i}`].atpcRangeUpper = radioSettings[`radio${i}`].atpcRangeUpper;
                                        previewObj[`radio${i}`].atpcTargetRssi = radioSettings[`radio${i}`].atpcTargetRssi;
                                    }

                                }

                            } else {
                                previewObj[`radio${i}`] = {};
                                previewObj[`radio${i}`].display = false;
                                previewObj[`radio${i}`].status = false;
                                previewObj[`radio${i}`].channel = this.t('defaultValue');
                                previewObj[`radio${i}`].channelBandwidth = this.t('defaultValue');
                                previewObj[`radio${i}`].txPower = this.t('defaultValue');
                                previewObj[`radio${i}`].radioFilter = false;
                                previewObj[`radio${i}`].distance = this.t('defaultValue');
                                previewObj[`radio${i}`].rssiFilterLower = this.t('defaultValue');
                                previewObj[`radio${i}`].rssiFilterUpper = this.t('defaultValue');
                                previewObj[`radio${i}`].rssiFilterTolerance = this.t('defaultValue');
                                previewObj[`radio${i}`].atpcRangeLower = this.t('defaultValue');
                                previewObj[`radio${i}`].atpcRangeUpper = this.t('defaultValue');
                                previewObj[`radio${i}`].atpcTargetRssi = this.t('defaultValue');
                            }
                        }
                        for (let i = 0; i <= 1; i += 1) {
                            if (get(ethernetSettings, [`eth${i}`])) {
                                previewObj[`eth${i}`] = {};
                                previewObj[`eth${i}`].display = true;
                                previewObj[`eth${i}`].ethernetLink =
                                    ethernetSettings[`eth${i}`].ethernetLink === 'enable';
                                previewObj[`eth${i}`].mtu = get(ethernetSettings[`eth${i}`], ['mtu']) ?
                                    ethernetSettings[`eth${i}`].mtu :
                                    get(getConfigObj.ethernetSettings[this.props.nodes[0].ipv4], [`eth${i}`, 'mtu']);
                            } else {
                                previewObj[`eth${i}`] = {};
                                previewObj[`eth${i}`].display = false;
                                previewObj[`eth${i}`].ethernetLink =
                                    get(getConfigObj.ethernetSettings[this.props.nodes[0].ipv4],
                                        [`eth${i}`, 'ethernetLink']) === 'enable';
                                previewObj[`eth${i}`].mtu =
                                    get(getConfigObj.ethernetSettings[this.props.nodes[0].ipv4],
                                        [`eth${i}`, 'mtu']);
                            }
                        }

                        console.log('previewObj');
                        console.log(previewObj);
                        this.setState({
                            ...(isConfigBackupMismatch ?
                                {
                                    dialog: {
                                        ...this.state.dialog,
                                        open: true,
                                        title: this.t('restoreErrorTitle'),
                                        content: this.t('isConfigBackupMismatchContent'),
                                        submitTitle: this.t('proceedTitle'),
                                        submitFn: () => {
                                            this.setState({
                                                nodePreviewDialog: {
                                                    open: true,
                                                },
                                            }, this.handleDialogOnClose);
                                        },
                                        cancelTitle: this.t('cancelTitle'),
                                        cancelFn: this.handleDialogOnClose,
                                    },
                                }
                                :
                                {
                                    nodePreviewDialog: {
                                        open: true,
                                    },
                                }
                            ),
                            previewContent: previewObj,
                            backupContent: decodeBackup,
                            isConfigBackupMismatch,
                            setConfigObj: bodyMsg2,
                        }, () => { this.props.updateIsLock(false); });
                    } else {
                        this.setState({
                            invalidFilterConfig: invalidFilterConfigRes,
                        }, () => {
                            this.updateInvalidConfigDialog();
                        });
                    }
                }
            }
        } catch (e) {
            console.log(e);
            const {title, content} = check(e);
            this.setState({
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: title !== '' ? title : this.t('restoreErrorTitle'),
                    content: title !== '' ? content : this.t('invalidFileErrContent'),
                    submitTitle: this.t('submitTitle'),
                    submitFn: this.handleDialogOnClose,
                    cancelTitle: '',
                    cancelFn: this.handleDialogOnClose,
                },
            });
            this.props.updateIsLock(false);
        }
    }

    createExpansionPanel(value, content, defaultExpanded) {
        const {classes} = this.props;
        // const {previewContent} = this.state;

        return (
            <Accordion
                classes={{
                    expanded: classes.expansionPanelExpanded,
                    root: classes.expansionPanelRoot,
                }}
                defaultExpanded={defaultExpanded}
            >
                <AccordionSummary
                    expandIcon={<i className="material-icons">expand_more</i>}
                    style={{maxHeight: '40px', minHeight: '40px'}}
                >
                    <Typography variant="body2" style={{fontSize: '16px'}}>
                        {value}
                    </Typography>
                </AccordionSummary>
                <AccordionDetails
                    style={{padding: '8px 30px', display: 'block'}}
                >
                    {content}
                </AccordionDetails>
            </Accordion>
        );
    }

    createRadioGrid(title, content, cssClass, ratio = 4, componentTitle = false) {
        const {classes} = this.props;

        return (
            <Grid
                item
                xs={ratio}
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    // height: '100%',
                }}
            >
                {componentTitle ?
                    <span style={{color: '#9a9a9a'}}>
                        {title}
                    </span>
                    :
                    <Typography align="center" variant="body2" classes={{body2: classes.optionTitleText}}>
                        {title}
                    </Typography>
                }
                {/* {typeof content === 'string' ?
                    <Typography component="span" variant="body2" classes={{body2: cssClass}}>
                        {content}
                    </Typography>
                    :
                    <span classes={{body2: cssClass}}>
                        {content}
                    </span>
                } */}
                <Typography component="span" variant="body2" classes={{body2: cssClass}}>
                    {content}
                </Typography>
            </Grid>
        );
    }

    createNodeContent() {
        const {classes} = this.props;
        const {previewContent} = this.state;
        // console.log('previewContent: ', previewContent);
        let nodeMaxNbrCtx = previewContent.nodeSettings.maxNbr?.toUpperCase() ?? '-';
        let nodeAllowRebootCtx = previewContent.nodeSettings.allowReboot?.toUpperCase() ?? '-';
        if (previewContent.nodeSettings.maxNbrWarning) {
            nodeMaxNbrCtx = (
                <span>
                    {previewContent.nodeSettings.maxNbr?.toUpperCase()}
                    <P2Tooltip
                        title={this.t('nodeMaxNbrWarning')}
                        content={(<i
                            className="material-icons"
                            style={{
                                fontSize: '16px',
                                marginLeft: '5px',
                                marginBottom: '0.5px',
                                color: colors.warningColor,
                            }}
                        >error</i>)}
                    />
                </span>
            )
        }
        console.log(previewContent.nodeSettings)
        return (
            <Grid container>
                <Grid container style={{padding: '10px'}}>
                    {this.createRadioGrid(
                        this.t('hostnamePreviewTitle'),
                        previewContent.nodeSettings.hostname,
                        classes.optionValueText,
                        6)
                    }
                    {this.createRadioGrid(
                        this.t('maxNbrTitle'),
                        nodeMaxNbrCtx,
                        classes.optionValueText,
                        6)
                    }
                </Grid>
                {
                    previewContent.nodeSettings.endtPriority !== undefined &&
                    previewContent.nodeSettings.endtRecvTimeout !== undefined &&
                    previewContent.nodeSettings.endtSendInterval !== undefined ?
                    (
                        <Grid container style={{padding: '10px'}}>
                            {this.createRadioGrid(
                                this.t('endtSendIntervalTitle'),
                                previewContent.nodeSettings.endtSendInterval,
                                classes.optionValueText,
                                4)
                            }
                            {this.createRadioGrid(
                                this.t('endtRecvTimeoutTitle'),
                                previewContent.nodeSettings.endtRecvTimeout,
                                classes.optionValueText,
                                4)
                            }
                            {this.createRadioGrid(
                                this.t('endtPriorityTitle'),
                                previewContent.nodeSettings.endtPriority,
                                classes.optionValueText,
                                4)
                            }
                        </Grid>
                    ) : (<div />)
                }
                {
                    previewContent.nodeSettings.acs !== undefined ? (
                        <Grid container style={{padding: '10px'}}>
                            {
                                previewContent.nodeSettings.atpcInterval !== undefined ?
                                    (
                                        this.createRadioGrid(
                                            this.t('atpcIntervalTitle'),
                                            previewContent.nodeSettings.atpcInterval,
                                            classes.optionValueText,
                                            4)

                                    ) : null
                            }
                            {
                                previewContent.nodeSettings.acs !== undefined ?
                                    (
                                        this.createRadioGrid(
                                            this.t('acsTitle'),
                                            previewContent.nodeSettings.acs.toUpperCase(),
                                            classes.optionValueText,
                                            4)

                                    ) : null
                            }
                            {
                                previewContent.nodeSettings.acsInterval !== undefined ?
                                    (
                                        this.createRadioGrid(
                                            this.t('acsInterval'),
                                            `${previewContent.nodeSettings.acsInterval}s`,
                                            classes.optionValueText,
                                            4)

                                    ) : null
                            }
                        </Grid>
                    ) : (<div />)
                }
                
                <Grid container style={{ padding: '10px' }}>
                    {
                        previewContent.nodeSettings.allowReboot !== undefined &&
                            this.props.enableWatchdogConfig ?
                            (
                                this.createRadioGrid(
                                    this.t('allowRebootTitle'),
                                    nodeAllowRebootCtx,
                                    classes.optionValueText,
                                    4)
                            ) : 
                            previewContent.nodeSettings.acsChannelList !== undefined ?
                                (
                                    this.createRadioGrid(
                                        this.t('acsChannelList'),
                                        `${previewContent.nodeSettings.acsChannelList.join(', ')}`,
                                        classes.optionValueText,
                                        12)
                                ) : null
                    }
                </Grid>
            </Grid>
        );
    }

    createRadioContent(radioName) {
        const {classes} = this.props;
        const {previewContent} = this.state;
        // console.log('previewContent: ', previewContent);

        const statusCtx = previewContent[radioName].status ?
            (<i className="material-icons" style={{fontSize: '32px'}}>check</i>) :
            (<i className="material-icons" style={{fontSize: '32px'}}>close</i>);

        const statusCss = previewContent[radioName].status ?
            classes.optionValueIconActive : classes.optionValueIconInactive;

        const radioFilterCtx = previewContent[radioName].radioFilter ?
            (<i className="material-icons" style={{fontSize: '32px'}}>check</i>) :
            (<i className="material-icons" style={{fontSize: '32px'}}>close</i>);

        const radioFilterCss = previewContent[radioName].radioFilter ?
            classes.optionValueIconActive : classes.optionValueIconInactive;

        const shortgiCtx = previewContent[radioName].shortgi === 'enable' ?
            (<i className="material-icons" style={{fontSize: '32px'}}>check</i>) :
            (<i className="material-icons" style={{fontSize: '32px'}}>close</i>);

        const shortgiCss = previewContent[radioName].shortgi === 'enable'?
            classes.optionValueIconActive : classes.optionValueIconInactive;

        const rtsCtsCtx = previewContent[radioName].rtsCts === 'enable' ?
            (<i className="material-icons" style={{fontSize: '32px'}}>check</i>) :
            (<i className="material-icons" style={{fontSize: '32px'}}>close</i>);

        const rtsCtsCss = previewContent[radioName].rtsCts === 'enable'?
            classes.optionValueIconActive : classes.optionValueIconInactive;

        const rssiFilterUpperLowerCtx = (
            <span
                style={{
                    fontSize: '16px',
                    color: theme.palette.primary.light,
                    display: 'flex',
                    justifyContent: 'center',
                    paddingTop: '4px',
                    fontWeight: '300',
                }}
            >
                {
                    previewContent[radioName].rssiFilterLower !== 'DISABLED' ?
                        <Typography>
                            {previewContent[radioName].rssiFilterLower}
                        </Typography>
                        :
                        <Typography style={{color: colors.tagTxt}}>
                            {previewContent[radioName].rssiFilterLower}
                        </Typography>
                }
                {
                    <Typography style={{padding: '0px 5px'}}>
                        /
                    </Typography>
                }
                {
                    previewContent[radioName].rssiFilterUpper !== 'DISABLED' ?
                        <Typography>
                            {previewContent[radioName].rssiFilterUpper}
                        </Typography>
                        :
                        <Typography style={{color: colors.tagTxt}}>
                            {previewContent[radioName].rssiFilterUpper}
                        </Typography>
                }
            </span>
        );

        const gridRatio = previewContent[radioName].displayBand ? 4 : 6;

        return (
            <Grid container>
                <Grid
                    alignContent="center"
                    alignItems="center"
                    container
                    style={{
                        padding: '10px',
                        paddingLeft: 0,
                        paddingBottom: 5,
                        // borderBottom: '0.032em solid rgba(33, 33, 33, 0.5)',
                        // marginBottom: '10px',
                        display: 'flex',
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
                        {this.t('radioTitle', {returnObjects: true})[radioName]}
                    </Typography>
                </Grid>
                <Grid container style={{padding: '20px 10px 10px 10px'}}>
                    {this.createRadioGrid(this.t('statusTitle'), statusCtx, statusCss, gridRatio)}
                    {this.createRadioGrid(
                        this.t('operationModeTitle'),
                        previewContent[radioName].operationMode,
                        classes.optionValueText,
                        gridRatio)
                    }
                    {previewContent[radioName].displayBand && this.createRadioGrid(
                        this.t('bandTitle'), previewContent[radioName].band.displayValue,
                        classes.optionValueText, gridRatio
                    )}
                </Grid>
                <Grid
                    container
                    style={{
                        padding: '10px',
                        // borderBottom: '0.032em solid rgba(33, 33, 33, 0.5)',
                        marginBottom: '10px',
                    }}
                >
                    {previewContent[radioName].displayBand && previewContent[radioName].band.actualValue === '4.9' ?
                        this.createRadioGrid(
                            this.t('centralFrequencyTitle'),
                            previewContent[radioName].centralFreq,
                            classes.optionValueText,
                            4) :
                        this.createRadioGrid(
                            this.t('channelTitle'),
                            previewContent[radioName].channel,
                            classes.optionValueText,
                            4
                        )
                    }
                    {this.createRadioGrid(
                        this.t('channelBandwidthTitle'),
                        previewContent[radioName].channelBandwidth,
                        classes.optionValueText,
                        4)
                    }
                    {this.createRadioGrid(
                        this.t('txpowerTitle'), previewContent[radioName].txPower, classes.optionValueText, 4
                    )}
                </Grid>
                <Typography
                    classes={{
                        root: classes.breakthroughLine,
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
                        padding: '0 5px',
                        color: '#9a9a9a',
                        fontSize: '13px',
                        fontWeight: '500',
                    }}
                    >
                        {this.t('advancedConfigTitle')}
                    </span>
                </Typography>
                <Grid
                    container
                    style={{padding: '20px 10px 10px 10px'}}
                >
                    {this.createRadioGrid(
                        this.t('maxNbrTitle'),
                        previewContent[radioName].maxNbr, classes.optionValueText
                    )}
                    {this.createRadioGrid(this.t('radioFilterTitle'), radioFilterCtx, radioFilterCss)}
                    {this.createRadioGrid(
                        this.t('distanceTitle'), previewContent[radioName].distance, classes.optionValueText
                    )}
                </Grid>
                <Grid
                    container
                    style={{
                        padding: '10px',
                        // borderBottom: '0.032em solid rgba(33, 33, 33, 0.5)',
                        marginBottom: '10px',
                    }}
                >
                    {this.createRadioGrid(
                        this.t('rssiFilterToleranceTitle'),
                        previewContent[radioName].rssiFilterTolerance, classes.optionValueText
                    )}
                    {this.createRadioGrid(
                        (
                            <span
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    flexWrap: 'nowrap',
                                    alignItems: 'center',
                                }}
                            >
                                <Typography
                                    variant="body2"
                                    style={{
                                        fontSize: '12px',
                                    }}
                                >
                                    {this.t('rssiFilterUpperLowerTitle')}
                                </Typography>
                                <Typography
                                    variant="body2"
                                    style={{
                                        fontSize: '12px',
                                    }}
                                >
                                    {this.t('rssiFilterUpperLowerTitle1')}
                                </Typography>
                            </span>
                        ),
                        rssiFilterUpperLowerCtx, classes.optionValueText, undefined, true
                    )}
                    {this.createRadioGrid(
                        this.t('mcsTitle'),
                        previewContent[radioName].mcs, classes.optionValueText
                    )}
                </Grid>
                <Grid
                    container
                    style={{
                        padding: '10px',
                        // borderBottom: '0.032em solid rgba(33, 33, 33, 0.5)',
                        marginBottom: '10px',
                    }}
                >
                    {this.createRadioGrid(this.t('shortgiTitle'), shortgiCtx, shortgiCss, 6)}
                    {this.createRadioGrid(this.t('rtsCtsTitle'), rtsCtsCtx, rtsCtsCss, 6)}
                </Grid>
                {   'atpcTargetRssi' in previewContent[radioName] ?
                    (<Grid
                        container
                        style={{
                            padding: '10px',
                            // borderBottom: '0.032em solid rgba(33, 33, 33, 0.5)',
                            marginBottom: '10px',
                        }}
                    >
                        {/* this.createRadioGrid(
                            this.t('distanceTitle'), previewContent[radioName].distance, classes.optionValueText
                        ) */}
                        {
                            this.createRadioGrid(
                                this.t('atpcTargetRssiTitle'),
                                `${previewContent[radioName].atpcTargetRssi} dBm`,
                                classes.optionValueText,
                                6
                            )
                        }
                        {
                            this.createRadioGrid(
                                this.t('atpcRssiRangeTitle'),
                                `${previewContent[radioName].atpcRangeLower} / ${previewContent[radioName].atpcRangeUpper} `,
                                classes.optionValueText,
                                6
                            )
                        }
                    </Grid>) : null
                }
            </Grid>
        );
    }

    createEthContent(ethName) {
        const {classes} = this.props;
        const {previewContent} = this.state;
        // console.log('previewContent: ', previewContent);

        const ethernetLinkCtx = previewContent[ethName].ethernetLink ?
            (<i className="material-icons" style={{fontSize: '32px'}}>check</i>) :
            (<i className="material-icons" style={{fontSize: '32px'}}>close</i>);

        const mtuCtx = `${previewContent[ethName].mtu} ${this.t('bytes')}`;

        const statusCss = previewContent[ethName].ethernetLink ?
            classes.optionValueIconActive : classes.optionValueIconInactive;


        return (
            <Grid container>
                <Grid
                    alignContent="center"
                    alignItems="center"
                    container
                    style={{
                        padding: '10px',
                        paddingLeft: 0,
                        paddingBottom: 5,
                        // borderBottom: '0.032em solid rgba(33, 33, 33, 0.5)',
                        // marginBottom: '10px',
                        display: 'flex',
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
                        {this.t('ethTitle', {returnObjects: true})[ethName]}
                    </Typography>
                </Grid>
                <Grid container style={{padding: '10px'}}>
                    {this.createRadioGrid(this.t('ethernetLinkTitle'), ethernetLinkCtx, statusCss, 6)}
                    {this.createRadioGrid(this.t('mtuTitle'), mtuCtx, classes.optionValueText, 6)}
                </Grid>
            </Grid>
        );
    }

    closePreview() {
        this.setState({
            nodePreviewDialog: {
                open: false,
            },
        });
    }

    closeChooseNode() {
        this.setState({
            chooseNodeDialog: {
                open: false,
            },
            table: {
                headers: {
                    Headers: [
                        {
                            id: 'hostname',
                            HeaderLabel: 'hostnameTitle',
                            isSorted: true,
                            sortType: 0,
                            canSort: true,
                        },
                        {
                            id: 'mac',
                            HeaderLabel: 'macTitle',
                            isSorted: false,
                            sortType: 0,
                            canSort: true,
                        },
                        {
                            id: 'model',
                            HeaderLabel: 'modelTitle',
                            isSorted: false,
                            sortType: 0,
                            canSort: true,
                        },
                        {
                            id: 'fwVersion',
                            HeaderLabel: 'fwVersionTitle',
                            isSorted: false,
                            sortType: 0,
                            canSort: true,
                        },
                    ],
                    searchKey: '',
                    searching: true,
                    handleRequestSort: this.handleRequestSortFn,
                    handleSelectRadioClick: this.handleSelectRadioClickFn,
                    selectedMac: [],
                },
                data: [],
                footer: {
                    totalItems: 0,
                    itemsPerPage: 5,
                    currentPage: 0,
                    handleChangePage: this.handleChangePageFn,
                    handleChangeItemsPerPage: this.handleChangeItemsPerPageFn,
                    rowsPerPageOptions: [5, 10, 25],
                },
            },
        });
    }

    chooseTargetNode(decodeBackup) {
        console.log(decodeBackup);
        const {nodes, createdTimestamp} = decodeBackup.p2BackupConfig;
        const tableDataArr = [];
        const disabledMac = [];

        Object.keys(nodes).forEach((mac) => {
            const {fwVersion, model, config} = nodes[mac];
            const {hostname} = config.nodeSettings;

            const row = [
                {
                    ctx: model !== this.props.nodes[0].model ?
                        (<span style={{color: colors.dialogText}}>
                            {hostname}
                        </span>) : hostname,
                    type: 'string',
                },
                {
                    ctx: model !== this.props.nodes[0].model ?
                        (<span style={{color: colors.dialogText}}>
                            {mac}
                        </span>) : mac,
                    type: 'string',
                },
                {
                    ctx: model !== this.props.nodes[0].model ?
                        (
                            <span style={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                            >
                                <span style={{color: colors.dialogText}}>
                                    {model}
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
                        ) : model,
                    type: 'string',
                },
                {
                    ctx: model !== this.props.nodes[0].model ?
                        (<span style={{color: colors.dialogText}}>
                            {fwVersion}
                        </span>) : fwVersion,
                    type: 'string',
                },
            ];
            if (model !== this.props.nodes[0].model) {
                disabledMac.push(mac);
            }
            tableDataArr.push(row);
        });

        // const disabledMac = tableDataArr.filter(rowArr => rowArr[restoreHeaderIdx.model].ctx !== nodes.model)
        //     .map(rowArr => rowArr[restoreHeaderIdx.mac].ctx);


        this.props.updateIsLock(false);
        this.setState({
            chooseNodeDialog: {
                open: true,
                timeStamp: createdTimestamp,
            },
            table: {
                ...this.state.table,
                data: tableDataArr,
                headers: {
                    ...this.state.table.headers,
                    disabledMac,
                },
                footer: {
                    ...this.state.table.footer,
                    totalItems: tableDataArr.length,
                },
            },
            backupContent: decodeBackup,
        });
    }

    handleSearchFn(event) {
        this.setState({
            table: {
                ...this.state.table,
                headers: {
                    ...this.state.table.headers,
                    searchKey: event,
                },
            },
        });
    }

    handleinitiateSearchFn() {
        if (this.state.table.headers.searching) {
            this.setState({
                table: {
                    ...this.state.table,
                    headers: {
                        ...this.state.table.headers,
                        searching: false,
                        searchKey: '',
                    },
                },
            });
        } else {
            this.setState({
                table: {
                    ...this.state.table,
                    headers: {
                        ...this.state.table.headers,
                        searching: true,
                    },
                },
            });
        }
    }

    handleRequestSortFn(event, property) {
        const headers = [...this.state.table.headers.Headers];
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
            table: {
                ...this.state.table,
                headers: {
                    ...this.state.table.headers,
                    Headers: headers,
                },
            },
        });
    }

    handleChangePageFn(event, page) {
        this.setState(
            {
                table: {
                    ...this.state.table,
                    footer: {
                        ...this.state.table.footer,
                        currentPage: page,
                    },
                },
            }
        );
    }

    handleChangeItemsPerPageFn(event) {
        this.setState(
            {
                table: {
                    ...this.state.table,
                    footer: {
                        ...this.state.table.footer,
                        itemsPerPage: event.target.value,
                    },
                },
            }
        );
    }

    handleSelectRadioClickFn(event, mac) {
        const newSelectedMac = [mac];

        this.setState({
            table: {
                ...this.state.table,
                headers: {
                    ...this.state.table.headers,
                    selectedMac: newSelectedMac,
                },
            },
        });
    }

    updateInvalidConfigDialog() {
        this.setState({
            invalidConfigDialogOpen: true,
        });
        this.props.updateIsLock(false);
    }

    render() {
        if (!this.props.tReady) {
            return <span />;
        }
        const {
            nodePreviewDialog, previewContent, table, chooseNodeDialog, backupContent, invalidFilterConfig,
            invalidConfigDialogOpen,
        } = this.state;

        table.headers.Headers = table.headers.Headers.map((header, idx) => ({
            ...table.headers.Headers[idx],
            HeaderLabel: this.t(table.headers.Headers[idx].HeaderLabel),
        }));

        const {classes} = this.props;
        // console.log('kyle_debug: render -> this.t(noteCtxArr, {returnObjects: true})', this.t('noteCtxArr', {returnObjects: true}));
        const noteCtx = (
            <P2PointsToNote
                noteTitle={this.t('noteTitle')}
                noteCtxArr={this.t('noteCtxArr', {returnObjects: true})}
                style={{
                    fwNoteGrid: {
                        fontSize: 12,
                    },
                    fwNoteTitle: {
                        marginBottom: '10px',
                        fontSize: '14px',
                    },
                    fwNoteItem: {
                        fontWeight: 400,
                        fontSize: 12,
                    },
                }}
            />
        );

        const checkedNote = (
            <div style={{marginLeft: '-15px', paddingTop: '10px'}}>
                <Checkbox
                    checked={this.state.checkedNotes}
                    onChange={this.handleCheckboxChange}
                    value="checkedNotes"
                    color="secondary"
                    style={{color: themeObj.secondary.main}}
                />
                <Typography
                    color="secondary"
                    style={{display: 'inline'}}
                    variant="body2"
                >
                    {this.t('checkboxMsg')}
                </Typography>
            </div>
        );

        const restorePanel = (
            <div style={{marginTop: '10px'}}>
                <P2FileUpload
                    inputId="configFile"
                    selectFileHandler={this.selectFileHandler}
                    fileName={this.state.fileName}
                    disabledSelectFile={this.state.disabledFileUpload}
                    fileSize={this.state.fileSize}
                    placeholder={this.t('fileUpPlaceholder')}
                    acceptType=".config"
                />
                {checkedNote}
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={this.clickRestore}
                    style={{
                        float: 'right',
                        marginBottom: '20px',
                        marginTop: '15px',
                    }}
                    disabled={this.state.disabledRestore}
                >
                    {this.t('proceedTitle')}
                </Button>
            </div>
        );

        const nodePreviewDialogCtx = (
            <Dialog
                fullWidth
                open={nodePreviewDialog.open}
                disableBackdropClick
                disableEscapeKeyDown
                TransitionComponent={Transition}
                transitionDuration={500}
                TransitionProps={{direction: 'down'}}
            >
                <AppBar style={{position: 'relative'}}>
                    <Toolbar style={{minHeight: '43px'}}>
                        <Typography color="inherit" style={{fontWeight: 'bold'}}>
                            {this.t('nodeConfigPreview')}
                        </Typography>
                        <Typography
                            color="inherit"
                            style={{fontSize: '12px', paddingLeft: '5px', display: 'inline'}}
                        >
                            ({this.props.nodes[0].hostname}, {this.props.nodes[0].mac})
                        </Typography>
                    </Toolbar>
                </AppBar>
                <DialogContent style={{
                    backgroundColor: colors.background,
                    padding: '20px 20px 20px 25px',
                }}
                >
                    <Typography style={{paddingBottom: '15px', display: 'inline-block'}}>
                        {this.t('nodePreviewSubtitle1')}
                        <b>{previewContent.hostname} ({previewContent.mac})</b>
                        {this.t('nodePreviewSubtitle2')}
                    </Typography>
                    <div style={{height: '380px', overflowY: 'auto', paddingRight: '10px'}}>
                        {this.createExpansionPanel(this.t('nodeConfiguration'), this.createNodeContent(), true)}
                        {this.createExpansionPanel(this.t('networkInterfaceConfig'),
                            (
                                <span>
                                    {this.createRadioContent('radio0')}
                                    {this.createRadioContent('radio1')}
                                    {get(this.state.previewContent, ['radio2', 'display']) &&
                                        this.createRadioContent('radio2')}
                                    {this.createEthContent('eth0')}
                                    {get(this.state.previewContent, ['eth1', 'display']) &&
                                        this.createEthContent('eth1')}
                                </span>
                            ), true)}
                    </div>
                    <Typography variant="body2" classes={{body2: this.props.classes.timeText}}>
                        {this.t('timeStampTitle')} {previewContent.timeStamp}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        style={{
                            float: 'right',
                            marginTop: '15px',
                            marginRight: '15px',
                        }}
                        onClick={this.restoreProcess}
                    >
                        {this.t('confirmRestoreBtn')}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        style={{
                            float: 'right',
                            margin: '15px 10px 0px',
                        }}
                        onClick={this.closePreview}
                    >
                        {this.t('backBtn')}
                    </Button>
                </DialogContent>
            </Dialog>
        );

        const tblToolbar = {
            handleSearch: this.handleSearchFn,
            handleinitiateSearch: this.handleinitiateSearchFn,
        };

        const chooseNodeDialogCtx = (
            <Dialog
                open={chooseNodeDialog.open}
                disableBackdropClick
                disableEscapeKeyDown
                maxWidth="md"
                fullWidth
            >
                <AppBar style={{position: 'relative'}}>
                    <Toolbar style={{minHeight: '43px'}}>
                        <Typography color="inherit" style={{fontWeight: 'bold'}}>
                            {this.t('chooseNodeTitle')}
                        </Typography>
                        <Typography
                            color="inherit"
                            style={{fontSize: '12px', paddingLeft: '5px', display: 'inline'}}
                        >
                            ({this.props.nodes[0].hostname}, {this.props.nodes[0].mac})
                        </Typography>
                    </Toolbar>
                </AppBar>
                <DialogContent style={{
                    backgroundColor: colors.background,
                    padding: '20px 20px 20px 25px',
                }}
                >
                    <Typography style={{paddingBottom: '15px', display: 'inline-block'}}>
                        {this.t('chooseNodeSubtitle')}
                    </Typography>
                    <Card>
                        <CardContent style={{paddingBottom: '0px'}}>
                            <Typography variant="body2" classes={{body2: classes.hintsText}}>
                                {this.t('nodeTableHints')}
                            </Typography>
                            <div style={{height: '54vh', display: 'flex'}}>
                                <P2DevTbl
                                    tblToolbar={tblToolbar}
                                    tblHeaders={table.headers}
                                    tblData={table.data}
                                    tblFooter={table.footer}
                                    disablePaper
                                    radioSelect
                                    hideSearchIcon
                                />
                            </div>
                        </CardContent>
                    </Card>
                    <Typography variant="body2" classes={{body2: classes.timeText}}>
                        {this.t('timeStampTitle')} {this.state.chooseNodeDialog.timeStamp}
                    </Typography>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        style={{
                            float: 'right',
                            marginTop: '15px',
                            marginRight: '15px',
                        }}
                        disabled={this.state.table.headers.selectedMac.length === 0}
                        onClick={() => {
                            try {
                                this.props.updateIsLock(true);
                                this.previewConfig(
                                    backupContent, table.headers.selectedMac
                                );
                                this.setState({
                                    chooseNodeDialog: {
                                        ...this.state.chooseNodeDialog,
                                        open: false,
                                    },
                                });
                            } catch (e) {
                                console.log('trace error chooseNodeDialogCtx', e);
                                this.setState({
                                    dialog: {
                                        ...this.state.dialog,
                                        open: true,
                                        title: this.t('restoreErrorTitle'),
                                        content: e.message,
                                        submitTitle: this.t('submitTitle'),
                                        submitFn: this.handleDialogOnClose,
                                        cancelTitle: '',
                                        cancelFn: this.handleDialogOnClose,
                                    },
                                });
                            }
                        }}
                    >
                        {this.t('previewButtonTitle')}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        style={{
                            float: 'right',
                            margin: '15px 10px 0px',
                        }}
                        onClick={this.closeChooseNode}
                    >
                        {this.t('backBtn')}
                    </Button>
                </DialogContent>
            </Dialog>
        );

        const invalidConfigDialog = (
            <InvalidConfigContainer
                meshSettings={invalidFilterConfig.meshSettings}
                nodeSettings={invalidFilterConfig.nodeSettings}
                radioSettings={invalidFilterConfig.radioSettings}
                ethernetSettings={invalidFilterConfig.ethernetSettings}
                profileSettings={invalidFilterConfig.profileSettings}
                expanded={invalidFilterConfig.expanded}
                open={invalidConfigDialogOpen}
                hostnameMap={{
                    [this.props.nodes[0].ipv4]: this.props.nodes[0].hostname,
                }}
                macMap={{
                    [this.props.nodes[0].ipv4]: this.props.nodes[0].mac,
                }}
            >
                {(open, content) => (
                    <P2Dialog
                        open={open}
                        handleClose={this.handleInvalidDialogOnClose}
                        title={this.t('restoreFailTitle')}
                        content={
                            <span style={{marginBottom: '15px'}}>
                                {this.t('isFilterConfigValidContent')}
                            </span>
                        }
                        nonTextContent={content}
                        actionTitle={this.t('submitTitle')}
                        actionFn={this.handleInvalidDialogOnClose}
                        cancelActTitle=""
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

        return (
            <div>
                {noteCtx}
                {restorePanel}
                {nodePreviewDialogCtx}
                {chooseNodeDialogCtx}
                {invalidConfigDialog}
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

ConfigRestore.propTypes = {
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
    projectId: PropTypes.string.isRequired,
    close: PropTypes.func.isRequired,
    pollingHandler: PropTypes.shape(
        {
            restartInterval: PropTypes.func.isRequired,
            stopInterval: PropTypes.func.isRequired,
        }
    ).isRequired,
    updateIsLock: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    tReady: PropTypes.bool.isRequired,
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    enableWatchdogConfig: PropTypes.bool.isRequired,
};

function mapStateToProps(state) {
    const {csrf, labels} = state.common;
    const {projectId} = state.projectManagement;
    const {enableWatchdogConfig} = state.devMode;
    return {csrf, projectId, enableWatchdogConfig, labels};
}

export default compose(
    withTranslation(['node-maintenance-restore']),
    connect(mapStateToProps),
    withStyles(styles)
)(ConfigRestore);
