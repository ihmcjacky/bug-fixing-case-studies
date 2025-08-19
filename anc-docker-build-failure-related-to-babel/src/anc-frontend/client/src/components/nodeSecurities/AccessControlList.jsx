/**
* @Author: mango
* @Date:   2018-05-15T16:25:07+08:00
 * @Last modified by:   mango
 * @Last modified time: 2019-01-02T11:42:15+08:00
*/
import React from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withStyles} from '@material-ui/core/styles';
import {withTranslation} from 'react-i18next';
import saveAs from '../../util/nw/saveAs';
import Cookies from 'js-cookie';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import {getCachedConfig, setConfig, getFilteredConfigOptions} from '../../util/apiCall';
import P2Dialog from '../common/P2Dialog';
import P2Tooltip from '../common/P2Tooltip';
import FormSelectCreator from '../common/FormSelectCreator';
import FormInputCreator from '../common/FormInputCreator';
import {formValidator} from '../../util/inputValidator';
import {toggleSnackBar} from '../../redux/common/commonActions';
import {ReactComponent as ExportIcon} from '../../icon/svg/ic_export.svg';
import {ReactComponent as ImportIcon} from '../../icon/svg/ic_import.svg';
import CsvZipFactory from '../common/CsvZipFactory';
import {getOemNameOrAnm} from '../../util/common';

function textareaCounter(text) {
    if (text === '') {
        return 0;
    }
    return text.split(/\r*\n/).filter(mac => mac !== '').length;
}

function formatDate(date) {
    const d = new Date(date);
    let month = (d.getMonth() + 1).toString();
    let day = d.getDate().toString();
    const year = d.getFullYear();

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;

    return [year, month, day].join('-');
}

function textareaToArray(text) {
    const newArray = text.split(/\r*\n/).filter(mac => mac !== '');
    return newArray;
}

function verifyRuntimeInput(macAdrr) {
    const macAddrArray = textareaToArray(macAdrr);
    let verified = 'TRUE';
    const macRegex = /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/;
    if (macAddrArray.length > 128) {
        verified = 'MAX';
    }
    macAddrArray.some((mac) => {
        const resultObj = formValidator('matchRegex', mac, macRegex);
        if (!resultObj.result) {
            verified = 'INVALID';
            return true;
        }
        return false;
    });
    return verified;
}

const wrapper = promise => (
    promise
        .then(data => ({data, error: null}))
        .catch(error => ({error, data: null}))
);

const styles = {
    exportImportLabel: {
        width: 'inherit',
    },
};


class AccessControlList extends React.Component {
    constructor(props) {
        super(props);

        const fnNames = [
            'clickReset',
            'clickSave',
            'checkRuntimeValue',
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
            'showBlackNWhiteDialog',
            'generateSaveConfig',
            'updateNodeConfigData',
            'extractCSV',
            'processData',
            'getConfigOptions',
            'getConfigOptionsError',
            'updateConfigOptions',
        ];

        window.__.each(fnNames, (fnName) => {
            this[fnName] = this[fnName].bind(this);
        });

        this.t = this.props.t;
        this.timeout = 0;
        this.empty = false;

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
            type: 'none',
            blacklist: {
                sourceMACAddr: '',
                destinMACAddr: '',
            },
            whitlelist: {
                sourceMACAddr: '',
                destinMACAddr: '',
            },
            errorStatus: {
                sourceMACAddr: false,
                destinMACAddr: false,
            },
            statusText: {
                sourceMACAddr: 'sourceMACAddrHelperText',
                destinMACAddr: 'destinMACAddrHelperText',
            },
            defaultType: 'none',
            defaultBlacklist: {
                sourceMACAddr: '',
                destinMACAddr: '',
            },
            defaultWhitelist: {
                sourceMACAddr: '',
                destinMACAddr: '',
            },
            defaultErrorStatus: {
                sourceMACAddr: false,
                destinMACAddr: false,
            },
            bothList: false,
            file: '',
            fileName: '',
            fileSize: '',
            disabledFileUpload: false,
            lines: '',
        };
    }

    componentDidMount() {
        this.props.activate(this.getNodeConfig);
    }

    async getNodeConfig() {
        this.props.updateIsLock(true);
        try {
            const projectId = Cookies.get('projectId');
            const value = await getCachedConfig(this.props.csrf, projectId, {nodes: [this.props.nodes[0].ipv4]});
            this.getConfigOptions(value);
        } catch (error) {
            this.getConfigError(error);
        }
    }

    getConfigOptions(configObj) {
        const {ipv4} = this.props.nodes[0];
        const bodyMsg = {};
        bodyMsg.options = {};
        bodyMsg.options.nodeSettings = {};
        bodyMsg.options.nodeSettings[ipv4] = ['acl'];

        bodyMsg.sourceConfig = {};
        bodyMsg.sourceConfig.meshSettings = configObj.meshSettings;
        bodyMsg.sourceConfig.radioSettings = configObj.radioSettings;
        bodyMsg.sourceConfig.nodeSettings = configObj.nodeSettings;
        bodyMsg.sourceConfig.ethernetSettings = configObj.ethernetSettings;
        bodyMsg.sourceConfig.profileSettings = configObj.profileSettings;

        const projectId = Cookies.get('projectId');
        const p = getFilteredConfigOptions(
            this.props.csrf,
            projectId,
            bodyMsg
        );
        p.then((value) => {
            this.updateConfigOptions(configObj, value);
        }).catch((error) => {
            if (error.message === 'P2Error' && error.data.type === 'specific') {
                const filterConfig = {};
                Object.keys(error.data.data).forEach((settings) => {
                    if (error.data.data[settings].success) {
                        filterConfig[settings] = error.data.data[settings].data;
                    } else if (error.data.data[settings].errors[0].type === 'partialretrieve') {
                        filterConfig[settings] = error.data.data[settings].errors[0].data;
                    }
                });
                this.updateConfigOptions(configObj, filterConfig);
            } else {
                this.getConfigOptionsError(error);
            }
        });
    }

    getConfigOptionsError() {
        this.setState({
            ...this.state,
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('retrieveTypeFailTitle'),
                content: this.t('retrieveTypeFail'),
                submitTitle: this.t('submitBtnTitle'),
                submitFn: () => {
                    this.props.close(this.props.nodes[0].ipv4);
                },
                cancelTitle: '',
                cancelFn: this.handleDialogOnClose,
            },
        });
    }

    async setConfigProcess(setConfigObj) {
        this.props.updateIsLock(true);
        this.props.pollingHandler.stopInterval();
        // Call set-config api
        try {
            const projectId = Cookies.get('projectId');
            const value = await setConfig(this.props.csrf, projectId, setConfigObj);
            this.setConfigSuccess(value.rtt);
        } catch (error) {
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

    updateConfigOptions(configObj, optionTypeObj) {
        const aclTypeArr = optionTypeObj.nodeSettings[this.props.nodes[0].ipv4].acl.data.type.data;
        const filterOptions = [];

        aclTypeArr.forEach((opt) => {
            if (opt.actualValue !== 'none' && opt.actualValue !== 'whitelist') {
                filterOptions.push(opt);
            }
        });

        this.setState({
            ...this.state,
            configOptionType: filterOptions,
        }, () => {
            this.updateNodeConfigData(configObj);
        });
    }

    showBlackNWhiteDialog() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('getBothListTitle'),
                content: this.t('getBothListContent'),
                submitTitle: this.t('submitBtnTitle'),
                submitFn: this.handleDialogOnClose,
                cancelTitle: '',
                cancelFn: this.handleDialogOnClose,
            },
            bothList: true,
        }, this.props.updateIsLock(false));
    }

    updateNodeConfigData(configObj) {
        this.checksums = configObj.checksums;
        const {nodeSettings} = configObj;
        const ipv4 = Object.keys(nodeSettings)[0];
        let whitelistSourceAddr = '';
        let whitelistDestinationAddr = '';
        let blacklistSourceAddr = '';
        let blacklistDestinationAddr = '';
        let type = 'none';
        const acl = {...nodeSettings[ipv4].acl};

        if (Object.keys(acl).length !== 0) {
            if (Object.keys(acl.blacklist).length !== 0) {
                type = 'blacklist';
                Object.keys(acl.blacklist).forEach((key) => {
                    if (key === 'source') {
                        acl.blacklist[key].forEach((mac) => {
                            blacklistSourceAddr += `${mac}\r\n`;
                        });
                        blacklistSourceAddr = blacklistSourceAddr.slice(0, -2);
                    } else if (key === 'destination') {
                        acl.blacklist[key].forEach((mac) => {
                            blacklistDestinationAddr += `${mac}\r\n`;
                        });
                        blacklistDestinationAddr = blacklistDestinationAddr.slice(0, -2);
                    }
                });
            }
            if (Object.keys(acl.whitelist).length !== 0) {
                type = 'whitelist';
                Object.keys(acl.whitelist).forEach((key) => {
                    if (key === 'source') {
                        acl.whitelist[key].forEach((mac) => {
                            whitelistSourceAddr += `${mac}\r\n`;
                        });
                        whitelistSourceAddr = whitelistSourceAddr.slice(0, -2);
                    } else if (key === 'destination') {
                        acl.whitelist[key].forEach((mac) => {
                            whitelistDestinationAddr += `${mac}\r\n`;
                        });
                        whitelistDestinationAddr = whitelistDestinationAddr.slice(0, -2);
                    }
                });
            }
        }

        this.setState({
            ...this.state,
            whitelist: {
                ...this.state.whitelist,
                sourceMACAddr: whitelistSourceAddr,
                destinMACAddr: whitelistDestinationAddr,
            },
            blacklist: {
                ...this.state.blacklist,
                sourceMACAddr: blacklistSourceAddr,
                destinMACAddr: blacklistDestinationAddr,
            },
            defaultWhitelist: {
                ...this.state.whitelist,
                sourceMACAddr: whitelistSourceAddr,
                destinMACAddr: whitelistDestinationAddr,
            },
            defaultBlacklist: {
                ...this.state.blacklist,
                sourceMACAddr: blacklistSourceAddr,
                destinMACAddr: blacklistDestinationAddr,
            },
            defaultType: type,
            type,
        }, () => {
            if (Object.keys(acl).length !== 0) {
                if (Object.keys(acl.whitelist).length !== 0 && Object.keys(acl.blacklist).length !== 0) {
                    this.showBlackNWhiteDialog();
                } else {
                    this.props.updateIsLock(false);
                }
            } else {
                this.props.updateIsLock(false);
            }
        });
    }

    checkChange() {
        const {
            type, blacklist, whitelist, defaultBlacklist,
            defaultWhitelist, defaultType,
        } = this.state;
        let changed = true;
        if (type === 'blacklist') {
            if (JSON.stringify(blacklist) === JSON.stringify(defaultBlacklist) && type === defaultType) changed = false;
        } else if (type === 'whitelist') {
            if (JSON.stringify(whitelist) === JSON.stringify(defaultWhitelist) && type === defaultType) changed = false;
        } else if (type === 'none') {
            if (type === defaultType) changed = false;
        }
        if (changed) {
            this.clickSave();
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
                bothList: true,
            });
        }
    }

    clickReset() {
        this.setState({
            ...this.state,
            type: this.state.defaultType,
            whitelist: {
                ...this.state.whitlelist,
                sourceMACAddr: this.state.defaultWhitelist.sourceMACAddr,
                destinMACAddr: this.state.defaultWhitelist.destinMACAddr,
            },
            blacklist: {
                ...this.state.blacklist,
                sourceMACAddr: this.state.defaultBlacklist.sourceMACAddr,
                destinMACAddr: this.state.defaultBlacklist.destinMACAddr,
            },
            errorStatus: this.state.defaultErrorStatus,
        });
    }

    handleCheck() {
        const {type} = this.state;
        let {defaultType} = this.state;
        if (type === 'none' && defaultType === 'none') defaultType = 'blacklist';
        const finalType = type !== 'none' ? 'none' : defaultType;
        this.setState({
            ...this.state,
            type: finalType,
        }, () => {
            if (finalType === 'none') {
                this.setState({
                    errorStatus: {
                        ...this.state.errorStatus,
                        sourceMACAddr: false,
                        destinMACAddr: false,
                    },
                    statusText: {
                        ...this.state.statusText,
                        sourceMACAddr: 'sourceMACAddrHelperText',
                        destinMACAddr: 'destinMACAddrHelperText',
                    },
                });
            } else if (finalType !== 'none' &&
            this.state[finalType].sourceMACAddr === '' &&
            this.state[finalType].destinMACAddr === '') {
                this.empty = true;
                this.setState({
                    errorStatus: {
                        ...this.state.errorStatus,
                        sourceMACAddr: true,
                        destinMACAddr: true,
                    },
                    statusText: {
                        ...this.state.statusText,
                        sourceMACAddr: 'requiredField',
                        destinMACAddr: 'requiredField',
                    },
                });
            }
        });
    }

    generateSaveConfig() {
        const {type} = this.state;
        const setConfigObj = {
            checksums: this.checksums,
            diff: {
                nodeSettings: {
                    [this.props.nodes[0].ipv4]: {
                        acl: {},
                    },
                },
            },
        };
        if (type !== 'none') {
            setConfigObj.diff.nodeSettings[this.props.nodes[0].ipv4].acl[type] = {};
            const source = this.state[type].sourceMACAddr === '' ? [] :
                textareaToArray(this.state[type].sourceMACAddr);
            const destination = this.state[type].destinMACAddr === '' ? [] :
                textareaToArray(this.state[type].destinMACAddr);
            if (source.length !== 0) {
                setConfigObj.diff.nodeSettings[this.props.nodes[0].ipv4].acl[type].source = source;
            }
            if (destination.length !== 0) {
                setConfigObj.diff.nodeSettings[this.props.nodes[0].ipv4].acl[type].destination = destination;
            }
        }
        this.setConfigProcess(setConfigObj);
    }

    selectFileHandler(event) {
        event.stopPropagation();
        event.preventDefault();

        let valid = true;
        let fileExtension = '';
        console.log(event);
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
                    title: this.t('importFailTitle'),
                    content: this.t('importFailContent'),
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
                        title: this.t('readFailTitle'),
                        content: this.t('readFailContent'),
                        submitTitle: this.t('submitBtnTitle'),
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
        const macRegex = /^([0-9A-Fa-f]{2}[:]){5}([0-9A-Fa-f]{2})$/;
        let type = '';
        let sourceMACAddr = '';
        let destinMACAddr = '';
        let error = false;
        let errorMsg = '';
        let sourceCounter = 0;
        let destinCounter = 0;
        const allTextLines = csv.replace(/['"]+/g, '').split(/\r\n|\n/);
        const lines = allTextLines.map(data => data.split(';'));
        lines.forEach((line) => {
            const linePair = line[0].split(',');
            if (linePair[0] === 'type') {
                switch (linePair[1]) {
                    case 'blacklist':
                        type = 'blacklist';
                        break;
                    case 'whitelist':
                        type = 'whitelist';
                        break;
                    default:
                        error = true;
                        errorMsg = 'invalid type';
                        break;
                }
            } else if (linePair[0] === 'destination') {
                const resultObj = formValidator('matchRegex', linePair[1], macRegex);
                if (!resultObj.result) {
                    error = true;
                    errorMsg = 'invalid destination MAC';
                } else {
                    destinMACAddr += `${linePair[1].toUpperCase()}\r\n`;
                    destinCounter += 1;
                }
            } else if (linePair[0] === 'source') {
                const resultObj = formValidator('matchRegex', linePair[1], macRegex);
                if (!resultObj.result) {
                    error = true;
                    errorMsg = 'invalid source MAC';
                } else {
                    sourceMACAddr += `${linePair[1].toUpperCase()}\r\n`;
                    sourceCounter += 1;
                }
            }
        });
        if (sourceMACAddr !== '') {
            sourceMACAddr = sourceMACAddr.slice(0, -2);
        }
        if (destinMACAddr !== '') {
            destinMACAddr = destinMACAddr.slice(0, -2);
        }
        if (destinCounter > 128 || sourceCounter > 128) {
            error = true;
            errorMsg = 'exceed Max';
        }
        console.log(errorMsg);
        if (!error) {
            this.setState({
                ...this.state,
                type,
                [type]: {
                    ...this.state[type],
                    sourceMACAddr,
                    destinMACAddr,
                },
            }, () => {
                this.checkRuntimeValue('sourceMACAddr', this.checkRuntimeValue('destinMACAddr'));
                document.getElementById('configFile').value = null;
            });
        } else {
            this.setState({
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: 'Import Failed',
                    content: 'Invalid File Format',
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

    clickSave() {
        let {bothList} = this.state;
        const {blacklist, whitelist} = this.state;
        if ((blacklist.sourceMACAddr !== '' || blacklist.destinMACAddr !== '') &&
            (whitelist.sourceMACAddr !== '' || whitelist.destinMACAddr !== '')) {
            bothList = true;
        }
        if (bothList) {
            this.setState({
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('saveMACACLConfirmTitle'),
                    content: this.t('saveMACACLConfirmContent'),
                    submitTitle: this.t('submitBtnTitle'),
                    submitFn: () => {
                        this.handleDialogOnClose();
                        this.generateSaveConfig();
                    },
                    cancelTitle: this.t('cancelBtnTitle'),
                    cancelFn: this.handleDialogOnClose,
                },
            });
        } else { this.generateSaveConfig(); }
    }

    checkRuntimeValue(inputID, cb) {
        const {type} = this.state;
        const {[inputID]: MAC, ...adjMAC} = this.state[type];
        let nextState = {};
        if (type !== 'none') {
            const verifiedList = verifyRuntimeInput(MAC);
            if (this.state[type].sourceMACAddr === '' &&
            this.state[type].destinMACAddr === '') {
                nextState = {
                    errorStatus: {
                        ...this.state.errorStatus,
                        sourceMACAddr: true,
                        destinMACAddr: true,
                    },
                    statusText: {
                        ...this.state.statusText,
                        sourceMACAddr: 'requiredField',
                        destinMACAddr: 'requiredField',
                    },
                };
            } else if (verifiedList === 'INVALID') {
                nextState = {
                    errorStatus: {
                        ...this.state.errorStatus,
                        [inputID]: true,
                    },
                    statusText: {
                        ...this.state.statusText,
                        [inputID]: 'invalidMAC',
                    },
                };
            } else if (verifiedList === 'MAX') {
                nextState = {
                    errorStatus: {
                        ...this.state.errorStatus,
                        [inputID]: true,
                    },
                    statusText: {
                        ...this.state.statusText,
                        [inputID]: 'macMaxLbl',
                    },
                };
            } else if (verifiedList === 'TRUE') {
                if (adjMAC[Object.keys(adjMAC)[0]] === '') {
                    nextState = {
                        errorStatus: {
                            ...this.state.errorStatus,
                            sourceMACAddr: false,
                            destinMACAddr: false,
                        },
                        statusText: {
                            ...this.state.statusText,
                            sourceMACAddr: 'sourceMACAddrHelperText',
                            destinMACAddr: 'destinMACAddrHelperText',
                        },
                    };
                } else {
                    nextState = {
                        errorStatus: {
                            ...this.state.errorStatus,
                            [inputID]: false,
                        },
                        statusText: {
                            ...this.state.statusText,
                            [inputID]: `${inputID}HelperText`,
                        },
                    };
                }
            }
            if (Object.keys(nextState).length !== 0) {
                this.setState(nextState, () => {
                    if (cb) cb();
                });
            }
        }
    }

    async handleExport() {
        const {projectIdList, projectId} = this.props;
        const {hostname} = this.props.nodes[0];
        const projectName = projectIdList[projectId] ?? '';
        const nwManifestName = typeof window.nw !== 'undefined' ? window.nw.App.manifest.window.title : undefined;
        const namePrefix = getOemNameOrAnm(nwManifestName);
        const currentTime = moment().format('YYYY-MM-DD-hh-mm-ss');
        const exportName = `${namePrefix}_${projectName}_${hostname}_cacl_${currentTime}.csv`;

        const {type} = this.state;
        const sourceList = textareaToArray(this.state[type].sourceMACAddr);
        const destinationList = textareaToArray(this.state[type].destinMACAddr);

        const sourceArray = sourceList.map(source => ['source', source]);
        const destinationArray = destinationList.map(source => ['destination', source]);
        const exportArray = [['type', type], ...sourceArray, ...destinationArray];
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

    handleChange(e, type) {
        const inputID = e.target.id || e.target.name;
        if (type === 'type') {
            this.setState({
                ...this.state,
                [inputID]: e.target.value,
            });
        } else {
            this.setState({
                ...this.state,
                [type]: {
                    ...this.state[type],
                    [inputID]: e.target.value.toUpperCase(),
                },
            }, () => {
                if (this.timeout) {
                    clearTimeout(this.timeout);
                }
                this.timeout = setTimeout(() => {
                    this.checkRuntimeValue(inputID);
                }, 500);
            });
        }
    }


    render() {
        const {
            type, whitelist, blacklist, errorStatus, statusText,
        } = this.state;
        const {t} = this.props;
        let sourceCounter = 0;
        let destinCounter = 0;
        let sourceMACAddrVal = '';
        let destinMACAddrVal = '';

        const buttonPanel = (
            <div style={{marginTop: '10px'}}>
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={this.checkChange}
                    disabled={errorStatus.destinMACAddr ||
                    errorStatus.sourceMACAddr}
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


        switch (type) {
            case 'whitelist':
                sourceCounter = textareaCounter(whitelist.sourceMACAddr);
                destinCounter = textareaCounter(whitelist.destinMACAddr);
                sourceMACAddrVal = whitelist.sourceMACAddr;
                destinMACAddrVal = whitelist.destinMACAddr;
                break;
            case 'blacklist':
                sourceCounter = textareaCounter(blacklist.sourceMACAddr);
                destinCounter = textareaCounter(blacklist.destinMACAddr);
                sourceMACAddrVal = blacklist.sourceMACAddr;
                destinMACAddrVal = blacklist.destinMACAddr;
                break;
            case 'none':
                sourceCounter = 0;
                destinCounter = 0;
                sourceMACAddrVal = '';
                destinMACAddrVal = '';
                break;
            default:
                sourceCounter = 0;
                destinCounter = 0;
                sourceMACAddrVal = '';
                destinMACAddrVal = '';
        }

        const soruceCounterLbl = sourceCounter === 0 ? '' : `(${this.t('countLbl')}: ${sourceCounter})`;
        const destinCounterLbl = destinCounter === 0 ? '' : `(${this.t('countLbl')}: ${destinCounter})`;

        const exportACL = type !== 'none' &&
            !(errorStatus.sourceMACAddr || errorStatus.destinMACAddr) ? (
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
                        label: this.props.classes.exportImportLabel
                    }}
                >
                    <ExportIcon width="18px" height="18px" style={{fill: '#212121'}} />
                </IconButton>
            )
            :
            (<span key="export" />);

        const importACL = (
            <P2Tooltip
                title={this.t('importButtonLbl')}
                content={
                    <IconButton
                        // onClick={props.tblToolbar.handleinitiateSearch}
                        aria-label="Upload"
                        disableRipple
                        style={{
                            width: 30,
                            height: 30,
                            color: '#212121',
                            marginRight: '13px',
                        }}
                        classes={{
                            label: this.props.classes.exportImportLabel
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
        const toolbarIcon = [exportACL, importACL];

        const accessPanel = (
            <React.Fragment>
                <div style={{marginTop: '14px'}}>
                    <FormSelectCreator
                        key="type"
                        margin="dense"
                        inputLabel={this.t('typeLbl')}
                        inputID="type"
                        inputValue={type}
                        onChangeField={e => this.handleChange(e, 'type')}
                        menuItemObj={this.state.configOptionType || []}
                        helperText={this.t('typeHelperText')}
                        enableButton
                        buttonLabel={this.t('disableLbl')}
                        checked={type === 'none'}
                        onCheckField={this.handleCheck}
                        showDisable
                    />
                </div>
                <div style={{marginTop: '14px'}}>
                    <FormInputCreator
                        key="sourceMACAddr"
                        inputLabel={`${this.t('sourceLbl')} ${soruceCounterLbl}`}
                        inputID="sourceMACAddr"
                        inputValue={sourceMACAddrVal}
                        onChangeField={e => this.handleChange(e, type)}
                        margin="dense"
                        helperText={t(statusText.sourceMACAddr)}
                        inputType="text"
                        errorStatus={errorStatus.sourceMACAddr}
                        autoFocus={false}
                        multiline
                        disabled={type === 'none'}
                    />
                </div>
                <div style={{marginTop: '14px'}}>
                    <FormInputCreator
                        key="destinMACAddr"
                        inputLabel={`${this.t('destinationLbl')} ${destinCounterLbl}`}
                        inputID="destinMACAddr"
                        inputValue={destinMACAddrVal}
                        onChangeField={e => this.handleChange(e, type)}
                        margin="dense"
                        helperText={t(statusText.destinMACAddr)}
                        inputType="text"
                        errorStatus={errorStatus.destinMACAddr}
                        autoFocus={false}
                        multiline
                        disabled={type === 'none'}
                    />
                </div>
            </React.Fragment>
        );

        const subTitle = (
            <Typography variant="body2" style={{fontSize: 14, color: 'rgba(33, 33, 33, 0.37)'}}>
                {this.t('subTitleLbl')}
            </Typography>
        );

        return (
            <div>
                <div style={{display: 'flex'}}>
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
                {accessPanel}
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

AccessControlList.propTypes = {
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    activate: PropTypes.func.isRequired,
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
    projectIdList: PropTypes.objectOf(PropTypes.string).isRequired,
    projectId: PropTypes.string.isRequired,
    close: PropTypes.func.isRequired,
    pollingHandler: PropTypes.shape(
        {
            restartInterval: PropTypes.func.isRequired,
            stopInterval: PropTypes.func.isRequired,
        }
    ).isRequired,
    updateIsLock: PropTypes.func.isRequired,
    toggleSnackBar: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const {csrf} = state.common;
    const {projectId, projectIdToNameMap: projectIdList} = state.projectManagement;
    return {
        csrf,
        projectIdList,
        projectId,
    };
}

const mapDispatchToProps = {
    toggleSnackBar,
};

export default compose(
    withTranslation(['node-security-acl']),
    connect(mapStateToProps, mapDispatchToProps),
    withStyles(styles)
)(AccessControlList);
