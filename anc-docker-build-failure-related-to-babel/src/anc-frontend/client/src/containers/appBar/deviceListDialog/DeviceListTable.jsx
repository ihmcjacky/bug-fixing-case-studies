/**
* @Author: mango
* @Date:   2018-05-24T15:40:40+08:00
* @ Modified by: Kyle Suen
* @ Modified time: 2019-07-12 11:23:27
*/
import React from 'react';
import {compose} from 'redux';
import PropTypes from 'prop-types';
import {withRouter} from 'react-router-dom';
import Cookies from 'js-cookie';
import {connect} from 'react-redux';
import IconButton from '@material-ui/core/IconButton';
// import Menu from '@material-ui/core/Menu';
// import MenuItem from '@material-ui/core/MenuItem';
// import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core/styles';
import P2DevTbl from '../../../components/common/P2DevTbl';
import {convertUptime, convertIpToMac} from '../../../util/formatConvertor';
import P2Tooltip from '../../../components/common/P2Tooltip';
import P2Dialog from '../../../components/common/P2Dialog';
// import P2SnackBar from '../../../../components/common/P2SnackBar';
import {toggleSnackBar} from '../../../redux/common/commonActions';
import {getNodeInfo, getCachedNodeInfo, updateManagedDevList, getVersion} from '../../../util/apiCall';
import {fetchMeshTopology} from '../../../redux/meshTopology/meshTopologyActions';
import {fetchCachedMeshTopology} from '../../../redux/meshTopology/cachedMeshTopologyActions';
import Constant from '../../../constants/common';
import isMismatchSecret, {isUnreachedNode, isFwSupport} from '../../../util/common';
// import {updateNotify, updateAllUnmanagedDeviceNotify} from '../../actions/notificationCenter';

const headerIdx = {
    hostname: 0,
    sn: 1,
    model: 2,
    nodeIp: 3,
    mac: 4,
    uptime: 5,
    fwVersion: 6,
    status: 7,
    action: 8,
};


const {colors, timeout, theme} = Constant;


class DeviceListTable extends React.Component {
    constructor(props) {
        super(props);

        const fnNames = [
            'getDeviceContent',
            'updateMeshData',
            'getNodeInfo',
            'updateNodeData',
            'handleDelete',
            'handleAdd',
            'addProccess',
            'createDeleteButton',
            'createAddButton',
            'handleDeleteAll',
            'handleAddAll',
            'addAllProccess',
            'createDeleteAllButton',
            'createAddAllButton',
            'handleDialogOnClose',
            'handleIncompatibleDialogOnClose',
            'handleChangePageFn',
            'handleChangeItemsPerPageFn',
            'handleRequestSortFn',
            'handleSelectClickFn',
            // 'handleSelectRadioClickFn',
            'handleSelectAllClickFn',
            'handleSearchFn',
            'handleinitiateSearchFn',
            'closeSnack',
            'handleNodeInfo',
            'onLogout',
            // 'handleLock',
            'onReturn',
        ];

        window.__.each(fnNames, (fnName) => {
            this[fnName] = this[fnName].bind(this);
        });
        this.t = this.props.t;

        const Headers = [
            {
                id: 'hostname',
                HeaderLabel: this.t('hstnmeHdr'),
                isSorted: true,
                sortType: 0,
                canSort: true,
            },
            {
                id: 'sn',
                HeaderLabel: this.t('snHdr'),
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
                id: 'nodeIp',
                HeaderLabel: this.t('nodeIpHdr'),
                isSorted: false,
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
                id: 'uptime',
                HeaderLabel: this.t('uptimeHdr'),
                isSorted: false,
                sortType: 0,
                canSort: true,
            },
            {
                id: 'fwVersion',
                HeaderLabel: this.t('fwVerHdr'),
                isSorted: false,
                sortType: 0,
                canSort: true,
            },
            {
                id: 'status',
                HeaderLabel: this.t('statusHdr'),
                isSorted: false,
                sortType: 0,
                canSort: true,
            },
            {
                id: 'action',
                HeaderLabel: this.t('actionHdr'),
                isSorted: false,
                sortType: 0,
                canSort: false,
            },
        ];

        this.toggleSnackBar = this.props.toggleSnackBar;

        this.state = {
            table: {
                headers: {
                    Headers,
                    selectedId: [],
                    selectedIp: [],
                    selectedMac: [],
                    // disabledMac: ['64:9A:12:22:59:D0'],
                    searchKey: '',
                    searching: false,
                    handleRequestSort: this.handleRequestSortFn,
                    handleSelectClick: this.handleSelectClickFn,
                    // handleSelectRadioClick: this.handleSelectRadioClickFn,
                    handleSelectAllClick: this.handleSelectAllClickFn,
                },
                data: [],
                footer: {
                    totalItems: 0,
                    itemsPerPage: 10,
                    currentPage: 0,
                    handleChangePage: this.handleChangePageFn,
                    handleChangeItemsPerPage: this.handleChangeItemsPerPageFn,
                },
            },
            unmanagedDevice: [],
            mismatchDevice: [],
            meshTopoIp: [],
            hostNode: {
                status: '',
                ip: '',
                fetched: false,
            },
            dialog: {
                open: false,
                title: '',
                content: '',
                submitButton: this.t('defaultButtonLbl'),
                cancelButton: '',
                submitAction: this.handleDialogOnClose,
                cancelAction: this.handleDialogOnClose,
                disableBackdropClick: false,
                disableEscapeKeyDown: false,
            },
            incompatibleDialog: {
                open: false,
                title: '',
                content: '',
                nonTextContent: <span />,
                submitButton: this.t('defaultButtonLbl'),
                cancelButton: '',
                submitAction: this.handleDialogOnClose,
                cancelAction: this.handleDialogOnClose,
                disableBackdropClick: false,
                disableEscapeKeyDown: false,
            },
        };

        this.projectID = Cookies.get('projectID');
    }

    componentDidMount() {
        // Setup Refresh & Close Button action
        this.props.disableClose(true);
        this.props.handleRefresh(this.getDeviceContent);
        // this.props.handleLock(this.handleLock);
        this.mounted = true;
        this.getDeviceContent();
    }

    componentWillUnmount() {
        this.mounted = false;
        clearTimeout(this.timer);
        // Cookies.remove('notificationCloseManagedDeviceListObj');
        // this.toggleSnackBar(false, '');
    }

    onLogout() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('invalidSecretDialogTitle'),
                content: this.t('invalidSecretDialogContent'),
                submitButton: this.t('invalidSecretSubmitLbl'),
                submitAction: () => {
                    Cookies.remove('projectId');
                    // window.location.reload();
                    // window.nw.Window.get().reloadIgnoringCache();
                    window.location.assign(`${window.location.origin}/index.html`);
                },
                cancelButton: '',
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
                submitButton: this.t('backClusterTopo'),
                submitAction: () => {
                    // const currentOrigin = window.location.origin;
                    // window.location.replace(`${currentOrigin}/mesh/?l=${this.props.lang}`);
                    // this.props.history.push('/');
                    window.location.assign(`${window.location.origin}/index.html`);
                    this.props.handleCloseDialog();
                },
                cancelButton: '',
                cancelFn: this.handleDialogOnClose,
                disableBackdropClick: true,
                disableEscapeKeyDown: true,
            },
        });
    }

    async getDeviceContent() {
        try {
            this.props.setLock(true);
            // this.setState({isLock: true});
            const version = await getVersion();
            this.anmVersion = version.version;
            const {res} = await this.props.fetchCachedMeshTopology();
            this.updateMeshData(res);
            if (this.state.meshTopoIp.length > 0) {
                // // update notification center By Tom
                // const temp = Cookies.get('notificationCloseManagedDeviceListObj');
                // if (temp) {
                //     const tempObj = JSON.parse(temp);
                //     let allDone = true;
                //     tempObj.info.deviceList.forEach((ip) => {
                //         if (!data[ip] || !data[ip].isManaged) allDone = false;
                //     });
                //     console.log('tempObj   :');
                //     console.log(tempObj);
                //     if (allDone) {
                //         this.props.updateNotify(tempObj.id, {
                //             iconType: 'SUCCESS',
                //             onClickAction: '',
                //             info: {
                //                 ...tempObj.info,
                //                 status: 'success',
                //             },
                //             cannotRemove: false,
                //         });
                //     }
                // }
                this.getNodeInfo(this.state.meshTopoIp);
            } else {
                this.props.setLock(false);
                this.setState({
                    dialog: {
                        ...this.state.dialog,
                        open: true,
                        title: this.t('getNodeInfoFailTitle'),
                        content: this.t('getNodeInfoFailContent'),
                        submitButton: this.t('defaultButtonLbl'),
                        submitAction: this.handleDialogOnClose,
                        cancelButton: '',
                        cancelAction: this.handleDialogOnClose,
                    },
                });
            }
        } catch (error) {
            console.log('Get Cluster Topology Error');
            console.log(error);
            this.handleGetMeshError(error);
        }
    }

    async getNodeInfo(nodes) {
        try {
            const meshTopoDeviceInfo = await getCachedNodeInfo(this.props.csrf, this.props.projectId, {nodes});
            // console.log('-----meshTopoDeviceInfo-----');
            // console.log(meshTopoDeviceInfo);
            // delete meshTopoDeviceInfo['127.0.17.10'];
            this.updateNodeData(meshTopoDeviceInfo);
        } catch (err) {
            const partialManagedDeviceInfo = {};
            const msg = err.data;
            if (err.message === 'P2Error' && msg.type === 'specific') {
                Object.keys(msg.data).forEach((key) => {
                    if (msg.data[key].success) {
                        partialManagedDeviceInfo[key] = msg.data[key].data;
                    } else {
                        const {data} = this.state.table;
                        const {mismatchDevice} = this.state;
                        msg.data[key].errors.forEach((err2) => {
                            if (err2.type === 'auth.password') {
                                data.forEach((item, idx) => {
                                    if (item[headerIdx.nodeIp].ctx === key &&
                                        item[headerIdx.status].ctx.props.children !== this.t('unMngedLbl')) {
                                        if (mismatchDevice.indexOf(key) === -1) {
                                            mismatchDevice.push(key);
                                        }
                                        const newitem = [...item];
                                        newitem[headerIdx.status].ctx = (
                                            <div style={{
                                                fontWeight: 'bold',
                                                color: colors.inactiveRed,
                                            }}
                                            >
                                                {this.t('mismatchLbl')}
                                            </div>
                                        );
                                        data.push(newitem);
                                        data.splice(idx, 1);
                                    }
                                });
                                this.setState({
                                    ...this.state,
                                    mismatchDevice,
                                    table: {
                                        ...this.state.table,
                                        data,
                                    },
                                }, this.props.isMismatch(mismatchDevice));
                            }
                        });
                    }
                });
                this.updateNodeData(partialManagedDeviceInfo);
            } else {
                this.props.setLock(false);
                this.setState({
                    dialog: {
                        ...this.state.dialog,
                        open: true,
                        title: this.t('getNodeInfoFailTitle'),
                        content: this.t('getNodeInfoFailContent'),
                        submitButton: this.t('defaultButtonLbl'),
                        submitAction: this.handleDialogOnClose,
                        cancelButton: '',
                        cancelAction: this.handleDialogOnClose,
                    },
                });
            }
        }
    }

    // handleLock(status) {
    //     this.setState({
    //         isLock: status,
    //     });
    // }

    handleGetMeshError(error) {
        const mismatchSecret = isMismatchSecret(error);
        const unreachedNode = isUnreachedNode(error);
        // console.log('-----------mismatchSecret-----------');
        // console.log(mismatchSecret);
        if (mismatchSecret === 'logout') {
            this.onLogout();
        } else if (unreachedNode === 'headNodeUnreachable') {
            this.onReturn();
        } else {
            this.props.setLock(false);
            this.setState({
                ...this.state,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('getMgedListFailTitle'),
                    content: this.t('getMgedListFailContent'),
                    submitButton: this.t('defaultButtonLbl'),
                    submitFn: () => {
                        // const currentOrigin = window.location.origin;
                        // window.location.replace(`${currentOrigin}/mesh/?l=${this.props.lang}`);
                        // this.props.history.push('/');
                        // this.props.history.push({
                        //     pathname: '/index.html',
                        //     hash: '/'
                        // });
                        window.location.assign(`${window.location.origin}/index.html`);

                    },
                    submitAction: this.handleDialogOnClose,
                    cancelButton: '',
                    cancelAction: this.handleDialogOnClose,
                },
                lockLayerColor: colors.lockLayerBackground,
            });
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

    handleIncompatibleDialogOnClose() {
        this.setState({
            incompatibleDialog: {
                ...this.state.incompatibleDialog,
                open: false,
            },
        });
    }

    closeSnack() {
        this.toggleSnackBar('');
    }

    async handleDelete(event) {
        // this.setState({
        //     isLock: true,
        // });
        this.props.setLock(true);

        const nodeIP = event.currentTarget.id;

        try {
            await updateManagedDevList(this.props.csrf, this.props.projectId, {del: [nodeIP]});
            this.getDeviceContent();
            this.toggleSnackBar(this.t('delSnackBar'), timeout.success);
            // setTimeout(() => {
            //     this.toggleSnackBar(false, '');
            // }, timeout.success);
        } catch (error) {
            console.log('delete device error');
            console.log(error);
            this.props.setLock(false);
            this.setState({
                ...this.state,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('delFailTitle'),
                    content: this.t('delFailContent'),
                    submitButton: this.t('defaultButtonLbl'),
                    submitAction: this.handleDialogOnClose,
                    cancelButton: '',
                    cancelAction: this.handleDialogOnClose,
                },
            });
        }
    }

    async addProccess(nodeIP) {
        try {
            await updateManagedDevList(this.props.csrf, this.props.projectId, {add: [nodeIP]});
            // this.props.updateAllUnmanagedDeviceNotify([nodeIP]);
            this.getDeviceContent();
            this.toggleSnackBar(this.t('addSnackBar'), timeout.success);
            // hide the notification
            // this.timer = setTimeout(() => {
            //     this.toggleSnackBar(false, '');
            // }, timeout.success);
        } catch (error) {
            console.log('add device error');
            console.log(error);
            this.props.setLock(false);
            this.setState({
                ...this.state,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('addFailTitle'),
                    content: this.t('addFailContent'),
                    submitButton: this.t('defaultButtonLbl'),
                    submitAction: this.handleDialogOnClose,
                    cancelButton: '',
                    cancelAction: this.handleDialogOnClose,
                },
            });
        }
    }

    handleAdd(event) {
        // this.setState({
        //     isLock: true,
        // });
        this.props.setLock(true);
        const nodeIP = event.currentTarget.id;
        console.log('-----handleAdd-----');
        console.log(nodeIP);
        let supported = true;
        const currentTableRows = this.state.table.data;
        currentTableRows.some((rowArr) => {
            if (rowArr[headerIdx.nodeIp].ctx === nodeIP &&
                rowArr[headerIdx.fwVersion].ctx !== '-' &&
                !isFwSupport(rowArr[headerIdx.fwVersion].ctx, this.anmVersion)) {
                supported = false;
                return true;
            }
            return false;
        });

        if (!supported) {
            this.props.setLock(false);
            this.setState({
                ...this.state,
                incompatibleDialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('incompatibilityTitle'),
                    content: this.t('incompatibilityContent'),
                    nonTextContent: <span />,
                    submitButton: this.t('defaultButtonLbl'),
                    submitAction: () => {
                        this.addProccess(nodeIP);
                        this.handleIncompatibleDialogOnClose();
                    },
                    cancelButton: '',
                    cancelAction: this.handleIncompatibleDialogOnClose,
                },
            });
        } else {
            this.addProccess(nodeIP);
        }
    }

    updateNodeData(nodeInfoObj) {
        const currentTableRows = this.state.table.data;
        let hostNodeFetched = false;
        currentTableRows.forEach((rowArr, idx) => {
            const nodeIp = rowArr[headerIdx.nodeIp].ctx;

            if (typeof nodeInfoObj[nodeIp] !== 'undefined') {
                const {
                    hostname,
                    sn,
                    model,
                    mac,
                    uptime,
                    firmwareVersion,
                } = nodeInfoObj[nodeIp];

                currentTableRows[idx][headerIdx.hostname].ctx = hostname;
                if (this.state.hostNode.ip === nodeIp) {
                    hostNodeFetched = true;
                    const hostnameContent = (
                        <div>
                            {hostname}
                            <span style={{color: theme.palette.primary.main, paddingLeft: '2px'}}>
                                *
                            </span>
                        </div>
                    );
                    currentTableRows[idx][headerIdx.hostname].ctx = hostnameContent;
                }

                currentTableRows[idx][headerIdx.sn].ctx = sn;
                currentTableRows[idx][headerIdx.model].ctx = model;
                currentTableRows[idx][headerIdx.mac].ctx = mac;
                if (typeof uptime === 'number') {
                    currentTableRows[idx][headerIdx.uptime].ctx = convertUptime(uptime);
                } else {
                    currentTableRows[idx][headerIdx.uptime].ctx = this.t('defaultValue');
                }
                currentTableRows[idx][headerIdx.fwVersion].ctx = firmwareVersion;
            } else if (this.state.hostNode.ip === nodeIp) {
                currentTableRows[idx][headerIdx.hostname].ctx = '- (Host Node)';
            }
        });
        this.props.setLock(false);
        this.setState({
            table: {
                ...this.state.table,
                data: currentTableRows,
            },
            hostNode: {
                ...this.state.hostNode,
                fetched: hostNodeFetched,
            },
        }, () => {
            this.handleNodeInfo();
        });
    }

    handleNodeInfo() {
        // const {mismatchDevice} = this.state;
        // console.log('-----mismatch(Node)-----');
        // console.log(mismatchDevice);
        // this.props.isMismatch(mismatchDevice);
        const {data} = this.state.table;
        // console.log('-----handleNodeInfo(child)-----');
        // console.log(data);
        this.props.handleNodeInfo(data);
    }

    createDeleteButton(nodeIP) {
        return (
            <IconButton
                color="primary"
                onClick={this.handleDelete}
                aria-label="delete"
                id={nodeIP}
            >
                <i
                    className="material-icons"
                >delete</i>
            </IconButton>
        );
    }

    createAddButton(nodeIP) {
        return (
            <IconButton
                color="primary"
                onClick={this.handleAdd}
                aria-label="add"
                id={nodeIP}
            >
                <i
                    className="material-icons"
                >add_circle</i>
            </IconButton>
        );
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
                >add_circle</i>
            </IconButton>
        );
        return (
            <P2Tooltip
                title={this.t('addSelectedTooltip')}
                content={content}
                key="addAllBtn"
            />
        );
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
                >delete</i>
            </IconButton>
        );
        return (
            <P2Tooltip
                title={this.t('delSelectedTooltip')}
                content={content}
                key="deleteAllBtn"
            />
        );
    }

    async addAllProccess(nodeIP) {
        try {
            await updateManagedDevList(this.props.csrf, this.props.projectId, {add: nodeIP});
            // this.props.updateAllUnmanagedDeviceNotify(nodeIP);
            this.getDeviceContent();
            this.setState({
                ...this.state,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('addSelectedSucsTitle'),
                    content: this.t('addSelectedSucsContent'),
                    submitButton: this.t('defaultButtonLbl'),
                    submitAction: this.handleDialogOnClose,
                    cancelButton: '',
                    cancelAction: this.handleDialogOnClose,
                },
                table: {
                    ...this.state.table,
                    headers: {
                        ...this.state.table.headers,
                        selectedId: [],
                        selectedIp: [],
                    },
                },
            });
        } catch (error) {
            this.props.setLock(false);
            this.setState({
                ...this.state,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('addSelectedFailTitle'),
                    content: '',
                    submitButton: this.t('defaultButtonLbl'),
                    submitAction: this.handleDialogOnClose,
                    cancelButton: '',
                    cancelAction: this.handleDialogOnClose,
                },
            });
        }
    }

    handleAddAll() {
        // this.setState({
        //     isLock: true,
        // });
        this.props.setLock(true);
        console.log('-----handleAddAll-----');
        const nodeIP = [...this.state.table.headers.selectedIp];
        console.log(nodeIP);
        const currentTableRows = this.state.table.data;
        const notSupportedNodeIP = nodeIP.filter((IP) => {
            let filtered = false;
            currentTableRows.some((rowArr) => {
                if (rowArr[headerIdx.nodeIp].ctx === IP &&
                    rowArr[headerIdx.fwVersion].ctx !== '-' &&
                    !isFwSupport(rowArr[headerIdx.fwVersion].ctx, this.anmVersion)) {
                    filtered = true;
                    return true;
                }
                return false;
            });
            return filtered;
        });

        if (notSupportedNodeIP.length !== 0) {
            const notSupportedArray = notSupportedNodeIP.map((IP) => {
                let notSupportedRow = '';
                currentTableRows.some((rowArr) => {
                    if (rowArr[headerIdx.nodeIp].ctx === IP) {
                        const hostname = this.props.macToHostnameMap[rowArr[headerIdx.mac].ctx];
                        notSupportedRow = `${hostname}, ${rowArr[headerIdx.mac].ctx}` +
                        ` (${rowArr[headerIdx.fwVersion].ctx})`;
                        return true;
                    }
                    return false;
                });
                return (
                    <li
                        key={IP}
                        className={this.props.classes.dialogContent}
                        style={{marginTop: 3}}
                    >
                        <Typography variant="body2" className={this.props.classes.dialogContent}>
                            {notSupportedRow}
                        </Typography>
                    </li>
                );
            });
            const content = (
                <span style={{display: 'flex', flexDirection: 'column', flexWrap: 'wrap'}}>
                    <span style={{marginBottom: 10}}>
                        {this.t('incompatibilityContent')}
                    </span>
                </span>
            );

            const nonTextContent = (
                <ul>
                    {notSupportedArray}
                </ul>
            );

            this.props.setLock(false);
            this.setState({
                ...this.state,
                incompatibleDialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('incompatibilityTitle'),
                    content,
                    nonTextContent,
                    submitButton: this.t('defaultButtonLbl'),
                    submitAction: () => {
                        this.addAllProccess(nodeIP);
                        this.handleIncompatibleDialogOnClose();
                    },
                    cancelButton: '',
                    cancelAction: this.handleIncompatibleDialogOnClose,
                },
            });
        } else {
            this.addAllProccess(nodeIP);
        }
    }

    async handleDeleteAll() {
        // this.setState({
        //     isLock: true,
        // });
        this.props.setLock(true);
        const selectedNodeIP = [...this.state.table.headers.selectedIp];
        const hostNodeIp = this.state.hostNode.ip;
        const mangedNodeIp = [];

        try {
            const {res} = await this.props.fetchCachedMeshTopology();
            selectedNodeIP.forEach((nodeIp) => {
                if (nodeIp === hostNodeIp) {
                    throw new Error('hostNode');
                }
                if (res[nodeIp].isManaged && nodeIp !== hostNodeIp) {
                    mangedNodeIp.push(nodeIp);
                }
            });
            await updateManagedDevList(this.props.csrf, this.props.projectId, {del: mangedNodeIp});
            this.getDeviceContent();
            this.setState({
                ...this.state,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('delSelectedSucsTitle'),
                    content: this.t('delSelectedSucsContent'),
                    submitButton: this.t('defaultButtonLbl'),
                    submitAction: this.handleDialogOnClose,
                    cancelButton: '',
                    cancelAction: this.handleDialogOnClose,
                },
                table: {
                    ...this.state.table,
                    headers: {
                        ...this.state.table.headers,
                        selectedId: [],
                        selectedIp: [],
                    },
                },
            });
        } catch (error) {
            if (error.message === 'hostNode') {
                this.props.setLock(false);
                this.setState({
                    ...this.state,
                    dialog: {
                        ...this.state.dialog,
                        open: true,
                        title: this.t('cannotDelHostNodeTitle'),
                        content: this.t('cannotDelHostNodeContent'),
                        submitButton: this.t('defaultButtonLbl'),
                        submitAction: this.handleDialogOnClose,
                        cancelButton: '',
                        cancelAction: this.handleDialogOnClose,
                    },
                });
            } else {
                this.props.setLock(false);
                this.setState({
                    ...this.state,
                    dialog: {
                        ...this.state.dialog,
                        open: true,
                        title: this.t('delSelectedFailTitle'),
                        content: '',
                        submitButton: this.t('defaultButtonLbl'),
                        submitAction: this.handleDialogOnClose,
                        cancelButton: '',
                        cancelAction: this.handleDialogOnClose,
                    },
                });
            }
        }
    }

    updateMeshData(meshTopoObj) {
        const dataRows = [];
        const unmanagedDeviceArr = [];
        const mismatchDeviceArr = [];
        const meshTopoIp = [];
        let hostNodeIp = '';
        let hostNodeStatus = 'unmanaged';

        Object.keys(meshTopoObj).forEach((nodeIp) => {

            // skip virtial node
            if (meshTopoObj[nodeIp].isVirtualNode) {
                return;
            }

            // Skip unmanaged and unreachable device
            if (!meshTopoObj[nodeIp].isManaged && !meshTopoObj[nodeIp].isReachable) {
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
            let actions = (
                <div>
                    <P2Tooltip
                        title={this.t('delDeviceTooltip')}
                        content={this.createDeleteButton(nodeIp)}
                    />
                </div>
            );
            if (!meshTopoObj[nodeIp].isManaged) {
                status = (
                    <div style={{
                        fontWeight: 'bold',
                        color: 'grey',
                    }}
                    >
                        {this.t('unMngedLbl')}
                    </div>
                );
                actions = (
                    <div>
                        <P2Tooltip
                            title={this.t('addDeviceTooltip')}
                            content={this.createAddButton(nodeIp)}
                        />
                    </div>
                );
                unmanagedDeviceArr.push(nodeIp);
            } else if (!meshTopoObj[nodeIp].isReachable) {
                status = (
                    <div style={{
                        fontWeight: 'bold',
                        color: colors.inactiveRed,
                    }}
                    >
                        {this.t('unRchbleLbl')}
                    </div>
                );
            } else if (meshTopoObj[nodeIp].isAuth === 'no') {
                status = (
                    <div style={{
                        fontWeight: 'bold',
                        color: colors.inactiveRed,
                    }}
                    >
                        {this.t('mismatchLbl')}
                    </div>
                );
                mismatchDeviceArr.push(nodeIp);
            }

            if (meshTopoObj[nodeIp].isHostNode) {
                hostNodeIp = nodeIp;
                if (meshTopoObj[nodeIp].isManaged) {
                    hostNodeStatus = 'managed';
                    actions = (
                        <span />
                    );
                }
            }
            const rowDataArr = [];
            rowDataArr[headerIdx.hostname] = {
                ctx: this.t('defaultValue'),
                type: 'string',
            };
            rowDataArr[headerIdx.sn] = {
                ctx: this.t('defaultValue'),
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
            rowDataArr[headerIdx.mac] = {
                ctx: convertIpToMac(nodeIp),
                type: 'string',
            };
            rowDataArr[headerIdx.uptime] = {
                ctx: this.t('defaultValue'),
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
            rowDataArr[headerIdx.action] = {
                ctx: actions,
                type: 'component',
            };
            dataRows.push(rowDataArr);
            if (meshTopoObj[nodeIp].isReachable && meshTopoObj[nodeIp].isAuth !== 'no') {
                meshTopoIp.push(nodeIp);
            }
        });

        this.setState({
            table: {
                ...this.state.table,
                data: dataRows,
                footer: {
                    ...this.state.table.footer,
                    totalItems: Object.keys(meshTopoObj).length,
                },
            },
            hostNode: {
                status: hostNodeStatus,
                ip: hostNodeIp,
            },
            unmanagedDevice: unmanagedDeviceArr,
            mismatchDevice: mismatchDeviceArr,
            meshTopoIp,
        }, () => {
            const {mismatchDevice} = this.state;
            // console.log('-----mismatch(Node)-----');
            // console.log(mismatchDevice);
            this.props.isMismatch(mismatchDevice);
            if (hostNodeStatus === 'unmanaged') {
                this.setState({
                    dialog: {
                        open: true,
                        title: this.t('unMngedNodeFoundTitle'),
                        content: this.t('unMngedNodeFoundContent'),
                        submitButton: this.t('defaultButtonLbl'),
                        submitAction: this.handleDialogOnClose,
                        cancelButton: '',
                        cancelAction: this.handleDialogOnClose,
                    },
                });
            }
        });

        if (hostNodeStatus === 'unmanaged') {
            this.props.disableClose(true);
        } else {
            this.props.disableClose(false);
        }
    }

    handleSearchFn(searchKey) {
        this.setState({
            table: {
                ...this.state.table,
                headers: {
                    ...this.state.table.headers,
                    searchKey,
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

    handleSelectClickFn(event, id, nodeIp) {
        const {selectedId, selectedIp} = this.state.table.headers;
        const selectedIdIndex = selectedId.indexOf(id);
        let newSelectedId = [];
        let newSelectedIp = [];


        if (selectedIdIndex === -1) {
            newSelectedId = newSelectedId.concat(selectedId, id);
            newSelectedIp = newSelectedIp.concat(selectedIp, nodeIp);
        } else if (selectedIdIndex === 0) {
            newSelectedId = newSelectedId.concat(selectedId.slice(1));
            newSelectedIp = newSelectedIp.concat(selectedIp.slice(1));
        } else if (selectedIdIndex === selectedId.length - 1) {
            newSelectedId = newSelectedId.concat(selectedId.slice(0, -1));
            newSelectedIp = newSelectedIp.concat(selectedIp.slice(0, -1));
        } else if (selectedIdIndex > 0) {
            newSelectedId = newSelectedId.concat(
                selectedId.slice(0, selectedIdIndex),
                selectedId.slice(selectedIdIndex + 1)
            );
            newSelectedIp = newSelectedIp.concat(
                selectedIp.slice(0, selectedIdIndex),
                selectedIp.slice(selectedIdIndex + 1)
            );
        }

        this.setState({
            table: {
                ...this.state.table,
                headers: {
                    ...this.state.table.headers,
                    selectedId: newSelectedId,
                    selectedIp: newSelectedIp,
                },
            },
        });
    }

    // handleSelectRadioClickFn(event, mac) {
    //     // const {selectedMac} = this.state.table.headers;
    //     // const selectedMacIndex = selectedMac.indexOf(mac);
    //     const newSelectedMac = [mac];
    //     // if (selectedMacIndex === -1) {
    //     //     newSelectedMac = newSelectedMac.concat(selectedMac, mac);
    //     // } else if (selectedMacIndex === 0) {
    //     //     newSelectedMac = newSelectedMac.concat(selectedMac.slice(1));
    //     // } else if (selectedMacIndex === selectedMac.length - 1) {
    //     //     newSelectedMac = newSelectedMac.concat(selectedMac.slice(0, -1));
    //     //     newSelectedMac = newSelectedMac.concat(selectedMac.slice(0, -1));
    //     // } else if (selectedMacIndex > 0) {
    //     //     newSelectedMac = newSelectedMac.concat(
    //     //         selectedMac.slice(0, selectedMacIndex),
    //     //         selectedMac.slice(selectedMacIndex + 1)
    //     //     );
    //     //     newSelectedMac = newSelectedMac.concat(
    //     //         selectedMac.slice(0, selectedMacIndex),
    //     //         selectedMac.slice(selectedMacIndex + 1)
    //     //     );
    //     // }

    //     this.setState({
    //         table: {
    //             ...this.state.table,
    //             headers: {
    //                 ...this.state.table.headers,
    //                 selectedMac: newSelectedMac,
    //             },
    //         },
    //     });
    // }

    handleSelectAllClickFn(event, checked, filterData) {
        // console.log('----------filteredData-----------');
        // console.log(filterData);
        // console.log(this.state.table.data);
        if (checked) {
            // const currentTableRows = this.state.table.data;
            // console.log('----------selectedId-----------');
            const selectedId = filterData.map(n => n.id);
            // console.log(selectedId);
            // console.log('----------selectedIp-----------');
            const selectedIp = filterData.map(n => n.nodeIp);
            // console.log(selectedIp);
            this.setState({
                table: {
                    ...this.state.table,
                    headers: {
                        ...this.state.table.headers,
                        selectedId,
                        selectedIp,
                    },
                },
            }, console.log(this.state.table.headers.selctedId));
            return;
        }
        this.setState({
            table: {
                ...this.state.table,
                headers: {
                    ...this.state.table.headers,
                    selectedId: [],
                    selectedIp: [],
                },
            },
        });
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
        this.setState({
            table: {
                ...this.state.table,
                footer: {
                    ...this.state.table.footer,
                    currentPage: page,
                },
            },
        });
    }

    handleChangeItemsPerPageFn(event) {
        this.setState({
            table: {
                ...this.state.table,
                footer: {
                    ...this.state.table.footer,
                    itemsPerPage: event.target.value,
                },
            },
        });
    }

    render() {
        const selectToolbar = [this.createAddAllButton(), this.createDeleteAllButton()];
        const description = this.t('tblDesc');
        const tblToolbar = {
            description,
            handleSearch: this.handleSearchFn,
            handleinitiateSearch: this.handleinitiateSearchFn,
            selectToolbar,
        };

        const {footer} = this.state.table;
        footer.label = this.state.hostNode.fetched ? (
            <Typography
                color="primary"
                style={{
                    fontWeight: 'bold',
                    fontSize: '14px',
                    float: 'left',
                    marginTop: '20px',
                    marginLeft: '20px',
                }}
                variant="body2"
            >
                * {this.t('hstNodeLbl')}
            </Typography>
        ) : <span />;

        const incompatibleDialog = (
            <P2Dialog
                open={this.state.incompatibleDialog.open}
                handleClose={this.handleIncompatibleDialogOnClose}
                title={this.state.incompatibleDialog.title}
                content={this.state.incompatibleDialog.content}
                nonTextContent={this.state.incompatibleDialog.nonTextContent}
                actionTitle={this.state.incompatibleDialog.submitButton}
                actionFn={this.state.incompatibleDialog.submitAction}
                cancelActTitle={this.state.incompatibleDialog.cancelButton}
                cancelActFn={this.state.incompatibleDialog.cancelAction}
                disableBackdropClick={this.state.incompatibleDialog.disableBackdropClick}
                disableEscapeKeyDown={this.state.incompatibleDialog.disableEscapeKeyDown}
                maxWidth="md"
            />
        );

        return (
            <React.Fragment>
                <div style={{padding: '24px', width: 'calc(100% - 48px)', minWidth: '600px'}}>
                    {/* <P2SnackBar
                        messages={"testMsg"}
                        open={this.props.open}
                        closeSnack={this.closeSnack}
                    /> */}
                    {incompatibleDialog}
                    <P2Dialog
                        open={this.state.dialog.open}
                        handleClose={this.handleDialogOnClose}
                        title={this.state.dialog.title}
                        content={this.state.dialog.content}
                        actionTitle={this.state.dialog.submitButton}
                        actionFn={this.state.dialog.submitAction}
                        cancelActTitle={this.state.dialog.cancelButton}
                        cancelActFn={this.state.dialog.cancelAction}
                        disableBackdropClick={this.state.dialog.disableBackdropClick}
                        disableEscapeKeyDown={this.state.dialog.disableEscapeKeyDown}
                    />
                    <P2DevTbl
                        tblToolbar={tblToolbar}
                        tblHeaders={this.state.table.headers}
                        tblData={this.state.table.data}
                        tblFooter={footer}
                        disableCloseSearchIcon
                        // radioSelect
                    />
                </div>
            </React.Fragment>
        );
    }
}

DeviceListTable.propTypes = {
    history: PropTypes.object.isRequired, /* eslint-disable-line */
    csrf: PropTypes.string.isRequired,
    lang: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    macToHostnameMap: PropTypes.objectOf(PropTypes.string).isRequired,
    setLock: PropTypes.func.isRequired,
    handleRefresh: PropTypes.func,
    // handleLock: PropTypes.func,
    disableClose: PropTypes.func.isRequired,
    // messages: PropTypes.string,
    // open: PropTypes.bool.isRequired,
    toggleSnackBar: PropTypes.func.isRequired,
    isMismatch: PropTypes.func.isRequired,
    handleNodeInfo: PropTypes.func.isRequired,
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    t: PropTypes.func.isRequired,
    // updateNotify: PropTypes.func.isRequired,
    // updateAllUnmanagedDeviceNotify: PropTypes.func.isRequired,
    fetchMeshTopology: PropTypes.func.isRequired,
    fetchCachedMeshTopology: PropTypes.func.isRequired,
    handleCloseDialog: PropTypes.func.isRequired,
};

DeviceListTable.defaultProps = {
    handleRefresh: () => false,
    // handleLock: () => false,
    // messages: '',
};

const styles = {
    dialogContent: {
        color: colors.dialogText,
    },
};

function mapStateToProps(store) {
    return {
        csrf: store.common.csrf,
        lang: store.common.lang,
        projectId: store.projectManagement.projectId,
        // messages: store.notification.messages,
        // open: store.notification.open,
        macToHostnameMap: store.meshTopology.macToHostnameMap,
    };
}

export default compose(
    connect(
        mapStateToProps,
        {
            toggleSnackBar,
            // updateNotify,
            // updateAllUnmanagedDeviceNotify,
            fetchMeshTopology,
            fetchCachedMeshTopology,
        }
    ),
    withStyles(styles)
)(withRouter(DeviceListTable));
