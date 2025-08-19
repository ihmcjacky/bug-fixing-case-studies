/**
 * @Author: mango
 * @Date:   2018-03-28T13:53:17+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-11-30T11:28:06+08:00
 */
import React from 'react';
// import Draggable from 'react-draggable';
import {connect} from 'react-redux';
import {compose} from 'redux';
import moment from 'moment';
import Button from '@material-ui/core/Button';
import {withTranslation} from 'react-i18next';
import FormControl from '@material-ui/core/FormControl';
import Select from '@material-ui/core/Select';
import {LineChart, Line, XAxis, YAxis, Tooltip, Legend, CartesianGrid} from 'recharts';
import Paper from '@material-ui/core/Paper';
import PropTypes from 'prop-types';
import Chip from '@material-ui/core/Chip';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/Close';
import ListItemText from '@material-ui/core/ListItemText';
import {withStyles} from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import P2Dialog from '../../components/common/P2Dialog';
import LockLayer from '../../components/common/LockLayer';
import P2Tooltip from '../common/P2Tooltip';
import Constant from '../../constants/common';
import {getRadioInfo, linkAlignment} from '../../util/apiCall';
import {convertIpToMac} from '../../util/formatConvertor';
// import {get} from '../../util/common';

const {
    colors,
    theme,
    themeObj,
} = Constant;
const REMOTE_COLOR = theme.palette.secondary.main;
const LOCAL_COLOR = theme.palette.primary.light;
const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: (ITEM_HEIGHT * 4.5) + ITEM_PADDING_TOP,
            width: 300,
        },
    },
};
const NeiMenuProps = {
    PaperProps: {
        style: {
            maxHeight: (ITEM_HEIGHT * 4.5) + ITEM_PADDING_TOP,
            minWidth: 300,
        },
    },
};
export const modelHeader = {
    padding: '15px 20px 15px 25px',
};
const radioMap = {
    radio0: 'RADIO 0',
    radio1: 'RADIO 1',
    radio2: 'RADIO 2',
};
const getRemoteLocalList = function (data) {
    if (data.rssi.remote && data.rssi.local) {
        return ['Local', 'Remote', 'Local, Remote'];
    } else if (data.rssi.local) {
        return ['Local'];
    }
    return [];
};

const parseValue = function (value) {
    if (value) {
        return Number(value.split(' ')[0]);
    }
    return null;
};
const emptyArr = [];
for (let i = 0; i < 30; i += 1) {
    emptyArr.push(
        {
            time: null,
            remote: null,
            local: null,
        }
    );
}
class RssiViewerCard extends React.Component {
    constructor(props) {
        super(props);
        this.t = this.props.t;
        this.state = {
            filterOpt: {
                radio: '',
                localRemote: '',
                mac: '',
            },
            // canRefresh: false,
            radioList: [],
            localRemoteList: [],
            macList: {},
            style: {
                opacity: 1,
                transition: 'all 0.3s ease-in',
                width: '850px',
                height: '510px',
            },
            data: [
            ],
            loading: true,
            status: 'stop',
            dialog: {
                open: false,
                title: '',
                content: '',
                submitButton: 'OK',
                submitAction: this.handleDialogOnClose,
            },
        };
        this.lastFilterOpt = {
            radio: '',
            localRemote: '',
            mac: '',
        };
        this.macToIpMap = {};
        this.storeData = [];
        this.handleOptChange = this.handleOptChange.bind(this);
        this.unMountStyle = this.unMountStyle.bind(this);
        this.mountStyle = this.mountStyle.bind(this);
        this.refresh = this.refresh.bind(this);
        this.handleClickSwap = this.handleClickSwap.bind(this);
        this.getNoDataWrapper = this.getNoDataWrapper.bind(this);
        this.getData = this.getData.bind(this);
        this.getMacList = this.getMacList.bind(this);
        this.canStart = this.canStart.bind(this);
        this.canRefresh = this.canRefresh.bind(this);
        this.saveData = this.saveData.bind(this);
        this.getLocalRemoteList = this.getLocalRemoteList.bind(this);
        this.getLocalRssiData = this.getLocalRssiData.bind(this);
        this.handleDialogOnClose = this.handleDialogOnClose.bind(this);
        this.getNewestData = this.getNewestData.bind(this);
        this.getNewestDataBox = this.getNewestDataBox.bind(this);
        this.getHostname = this.getHostname.bind(this);
        this.filter = this.filter.bind(this);
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.getRemoteRssiData = this.getRemoteRssiData.bind(this);
        this.init = this.init.bind(this);
        this.structureList = null;
    }
    componentDidMount() {
        // setTimeout(this.mountStyle, 10);
        this.init();
        this.mounted = true;
    }
    componentWillUnmount() {
        clearInterval(this.intervalFunc);
        this.mounted = false;
    }
    getHostname(mac) {
        if (this.props.macToHostnameMap[mac]) {
            return `${mac} (${this.props.macToHostnameMap[mac]})`;
        }
        return mac;
    }
    getData() {
        const mode = this.state.filterOpt.localRemote;
        const targetMac = this.state.filterOpt.mac;
        const reqObj = {
            targets: {},
        };
        if (mode === 'Local') {
            reqObj.targets[this.props.ip] = {
                interval: 1,
                enableRemote: false,
            };
        }
        if (mode === 'Remote') {
            const ip = this.macToIpMap[targetMac];
            reqObj.targets[ip] = {
                interval: 1,
                enableRemote: false,
            };
        }
        if (mode === 'Local, Remote') {
            const ip = this.macToIpMap[targetMac];
            reqObj.targets[ip] = {
                interval: 1,
                enableRemote: false,
            };
            reqObj.targets[this.props.ip] = {
                interval: 1,
                enableRemote: false,
            };
        }
        linkAlignment(this.props.csrf, this.props.projectId,  reqObj).then(
            (res) => {
                if (!this.mounted || this.state.status === 'stop') {
                    return;
                }
                const {data, success} = res;
                if (data && success && data[this.props.ip]) {
                    this.saveData((data[this.props.ip]), data[this.macToIpMap[targetMac]]);
                } else if (data && success && this.macToIpMap[targetMac]) {
                    this.saveData(null, data[this.macToIpMap[targetMac]]);
                }
            }
        ).catch(
            (err) => {
                if (!this.mounted || this.state.status === 'stop') {
                    return;
                }
                if (
                    err.data &&
                    err.data.type === 'specific' &&
                    err.data.data &&
                    err.data.data[this.props.ip] &&
                    err.data.data[this.props.ip].success
                ) {
                    const {data} = err.data.data[this.props.ip];
                    this.saveData(data, null);
                } else if (
                    err.data &&
                    err.data.type === 'specific' &&
                    err.data.data &&
                    err.data.data[this.macToIpMap[targetMac]] &&
                    err.data.data[this.macToIpMap[targetMac]].success
                ) {
                    const {data} = err.data.data[this.macToIpMap[targetMac]];
                    this.saveData(null, data);
                } else {
                    // error for getting nothing
                    console.log('Get data fail');
                    console.log(err);
                    console.log(err.data);
                    this.saveData({});
                }
            }
        );
    }
    getMacList() {
        if (this.state.macList[this.state.filterOpt.radio]) {
            return this.state.macList[this.state.filterOpt.radio];
        }
        return [];
    }
    getLocalRemoteList() {
        if (
            this.state.localRemoteList[this.state.filterOpt.radio] &&
            this.state.localRemoteList[this.state.filterOpt.radio][this.state.filterOpt.mac]
        ) {
            return this.state.localRemoteList[this.state.filterOpt.radio][this.state.filterOpt.mac];
        }
        return [];
    }
    getNewestData() {
        const data = this.state.data[0];
        const returnVal = {remote: '-', local: '-'};
        if (data) {
            if (data.remote && this.state.filterOpt.localRemote !== 'Local') {
                returnVal.remote = `${data.remote}`;
            }
            if (data.local && this.state.filterOpt.localRemote !== 'Remote') {
                returnVal.local = `${data.local}`;
            }
        }
        return returnVal;
    }
    getNewestDataBox() {
        const {remote, local} = this.getNewestData();
        return (
            <div>
                <div className={this.props.classes.remoteCircleBox}>
                    <div className={this.props.classes.circleBoxText}>
                        <div>
                            {remote}
                            {remote === '-' ? null : <span style={{paddingLeft: '2px', fontSize: '18px'}}>dBm</span>}
                        </div>
                        <div style={{paddingTop: '5px', fontSize: '10px'}}>{this.t('Remote')}</div>
                    </div>
                </div>
                <div className={this.props.classes.localCircleBox}>
                    <div className={this.props.classes.circleBoxText}>
                        <div>
                            {local}
                            {local === '-' ? null : <span style={{paddingLeft: '2px', fontSize: '18px'}}>dBm</span>}
                        </div>
                        <div style={{paddingTop: '5px', fontSize: '10px'}}>{this.t('Local')}</div>
                    </div>
                </div>
            </div>
        );
    }
    getRemoteRssiData(data) {
        let returnValue = null;
        if (
            data[this.state.filterOpt.radio] &&
            data[this.state.filterOpt.radio].radioNeighbors &&
            data[this.state.filterOpt.radio].radioNeighbors
        ) {
            const neiData = data[this.state.filterOpt.radio].radioNeighbors;
            if (Object.keys(neiData).length > 0) {
                Object.keys(neiData).forEach((ip) => {
                    if (
                        convertIpToMac(ip) === this.state.filterOpt.mac &&
                        neiData[ip].rssi &&
                        neiData[ip].rssi.remote
                    ) {
                        returnValue = parseValue(neiData[ip].rssi.remote);
                        if (returnValue > 0) {
                            returnValue = 0;
                        } else if (returnValue < -95) {
                            returnValue = -95;
                        }
                    }
                });
            }
        }
        return returnValue;
    }
    getLocalRssiData(data) {
        let returnValue = null;
        if (
            data[this.state.filterOpt.radio] &&
            data[this.state.filterOpt.radio].radioNeighbors &&
            data[this.state.filterOpt.radio].radioNeighbors
        ) {
            const neiData = data[this.state.filterOpt.radio].radioNeighbors;
            if (Object.keys(neiData).length > 0) {
                Object.keys(neiData).forEach((ip) => {
                    if (
                        convertIpToMac(ip) === this.state.filterOpt.mac &&
                        neiData[ip].rssi &&
                        neiData[ip].rssi.local
                    ) {
                        returnValue = parseValue(neiData[ip].rssi.local);
                        if (returnValue > 0) {
                            returnValue = 0;
                        } else if (returnValue < -95) {
                            returnValue = -95;
                        }
                    }
                });
            }
        }
        return returnValue;
    }
    getNoDataWrapper() {
        if (
            this.state.filterOpt.localRemote === '' ||
            this.state.filterOpt.mac === '' ||
            this.state.filterOpt.radio === ''
        ) {
            return (
                <Typography classes={{h6: this.props.classes.noDataWrapper}} variant="h6">
                    {this.t('noDataWrapper')}
                </Typography>
            );
        }
        return <span />;
    }
    start() {
        this.getData();
        this.intervalFunc = setInterval(
            this.getData, 1000
        );
    }
    stop() {
        clearInterval(this.intervalFunc);
    }
    filter() {
        if (this.state.status === 'stop') {
            if (
                this.lastFilterOpt.radio === this.state.filterOpt.radio &&
                this.lastFilterOpt.mac === this.state.filterOpt.mac &&
                this.lastFilterOpt.localRemote === this.state.filterOpt.localRemote
            ) {
                this.setState({
                    status: 'start',
                }, () => {
                    this.start();
                });
            } else {
                this.lastFilterOpt.radio = this.state.filterOpt.radio;
                this.lastFilterOpt.mac = this.state.filterOpt.mac;
                this.lastFilterOpt.localRemote = this.state.filterOpt.localRemote;
                this.setState({
                    status: 'start',
                }, () => {
                    this.storeData = [];
                    this.start();
                });
            }
        } else {
            this.setState({
                status: 'stop',
            }, () => {
                this.stop();
            });
        }
    }
    canStart() {
        if (
            this.state.filterOpt.radio === '' ||
            this.state.filterOpt.localRemote === '' ||
            this.state.filterOpt.mac === ''
        ) {
            return true;
        }
        return false;
    }
    init() {
        const temp = [];
        for (let i = 0; i < 30; i += 1) {
            temp.push({
                time: null,
                remote: null,
                local: null,
            });
        }
        getRadioInfo(this.props.csrf, this.props.projectId, {nodes:[this.props.ip]}).then((radioInfo) => {
            this.setState({
                loading: false,
                data: temp,
            });
            const macList = {};
            const radioList = Object.keys(radioInfo[this.props.ip]);
            const localRemoteList = {};
            let canLoad = false;
            radioList.forEach(
                (radio) => {
                    localRemoteList[radio] = {};
                    macList[radio] = Object.keys(radioInfo[this.props.ip][radio].radioNeighbors).map(
                        (ip) => {
                            this.macToIpMap[convertIpToMac(ip)] = ip;
                            canLoad = true;
                            localRemoteList[radio][convertIpToMac(ip)] =
                            getRemoteLocalList(radioInfo[this.props.ip][radio].radioNeighbors[ip]);
                            return convertIpToMac(ip);
                        }
                    );
                }
            );
            this.setState({
                localRemoteList,
                radioList,
                macList,
            }, () => {
                if (!canLoad) {
                    this.setState({
                        ...this.state,
                        dialog: {
                            ...this.state.dialog,
                            open: true,
                            title: this.t('getInitDataFailTitle'),
                            content: this.t('getInitDataFailContent'),
                            submitButton: this.t('ok'),
                            submitAction: this.handleDialogOnClose,
                        },
                    });
                }
            });
        }).catch((err) => {
                this.setState(
                    {
                        loading: false,
                    }
                );
                if (
                    err.data &&
                    err.data.type === 'specific' &&
                    err.data.data &&
                     err.data.data[this.props.ip] &&
                     err.data.data[this.props.ip].specific
                ) {
                    const data = err.data.data[this.props.ip].specific;
                    const macList = {};
                    const radioList = Object.keys(data);
                    const localRemoteList = {};
                    let canLoad = false;
                    radioList.forEach(
                        (radio) => {
                            localRemoteList[radio] = {};
                            macList[radio] = Object.keys(data[radio].radioNeighbors).map(
                                (ip) => {
                                    this.macToIpMap[convertIpToMac(ip)] = ip;
                                    canLoad = true;
                                    localRemoteList[radio][convertIpToMac(ip)] =
                                    getRemoteLocalList(data[radio].radioNeighbors[ip]);
                                    return convertIpToMac(ip);
                                }
                            );
                        }
                    );
                    this.setState({
                        localRemoteList,
                        radioList,
                        macList,
                    }, () => {
                        if (!canLoad) {
                            this.setState({
                                ...this.state,
                                dialog: {
                                    ...this.state.dialog,
                                    open: true,
                                    title: this.t('getInitDataFailTitle'),
                                    content: this.t('getInitDataFailContent'),
                                    submitButton: this.t('ok'),
                                    submitAction: this.handleDialogOnClose,
                                },
                            });
                        }
                    });
                } else {
                    this.setState({
                        ...this.state,
                        dialog: {
                            ...this.state.dialog,
                            open: true,
                            title: this.t('getInitDataFailTitle'),
                            content: this.t('getInitDataFailContent'),
                            submitButton: this.t('ok'),
                            submitAction: this.handleDialogOnClose,
                        },
                    });
                }
            }
        );
    }
    handleDialogOnClose() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: false,
            },
        });
    }
    canRefresh() {
        if (this.state.status === 'stop') {
            return false;
        }
        return true;
    }
    refresh() {
        this.setState({
            loading: true,
            filterOpt: {
                radio: '',
                localRemote: '',
                mac: '',
            },
        }, () => {
            setTimeout(
                this.init, 2000
            );
        });
    }
    saveData(localData, remoteData) {
        console.log('---- save data ----');
        console.log(localData, remoteData);
        this.storeData.push({
            localData,
            remoteData,
            time: moment(this.initDate).format('HH:mm:ss'),
        });
        if (this.storeData.length > 10) {
            this.storeData.pop();
        }
        const newData = this.state.data;
        newData.pop();
        if (localData && remoteData) {
            this.setState({
                data: [{
                    time: moment(this.initDate).format('HH:mm:ss'),
                    remote: this.getRemoteRssiData(localData),
                    local: this.getLocalRssiData(localData),
                }, ...newData],
            }, () => {
                // console.log(this.state);
            });
        } else if (!remoteData) {
            this.setState({
                data: [{
                    time: moment(this.initDate).format('HH:mm:ss'),
                    remote: null,
                    local: this.getLocalRssiData(localData),
                }, ...newData],
            }, () => {
                // console.log(this.state);
            });
        } else {
            let rssi = null;
            Object.keys(remoteData).forEach(
                (radio) => {
                    console.log(radio);
                    const neiList = remoteData[radio].radioNeighbors;
                    if (neiList) {
                        Object.keys(neiList).forEach(
                            (nei) => {
                                if (nei === this.props.ip) {
                                    const {linkId} = neiList[nei];
                                    const targetIp = this.props.ip;
                                    const substrIdx = linkId.indexOf(targetIp);
                                    if (
                                        this.state.filterOpt.radio.substr(5, 1) ===
                                        linkId.substr(substrIdx + targetIp.length + 1, 1)
                                    ) {
                                        if (neiList[nei].rssi) {
                                            rssi = parseValue(neiList[nei].rssi.local);
                                        }
                                    }
                                }
                            }
                        );
                    }
                }
            );
            this.setState({
                data: [{
                    time: moment(this.initDate).format('HH:mm:ss'),
                    remote: rssi,
                    local: null,
                }, ...newData],
            }, () => {
                // console.log(this.state);
            });
        }
    }
    mountStyle() { // css for mount animation
        this.setState({
            style: {
                width: '750px',
                opacity: 1,
                transition: 'opacity 0.2s ease-in',
            },
        });
    }
    unMountStyle() {
        // console.log('I am closing');
        this.props.close();
    }
    handleClickSwap(e) {
        this.setState({
            filterOpt: {
                ...this.state.filterOpt,
                swap: e.target.checked,
            },
        });
    }
    handleOptChange(e, name) {
        switch (name) {
            case 'radio':
                this.setState({
                    filterOpt: {
                        radio: e.target.value,
                        mac: '',
                        localRemote: '',
                    },
                    data: emptyArr,
                }, () => {
                });
                break;
            case 'mac':
                this.setState({
                    filterOpt: {
                        ...this.state.filterOpt,
                        mac: e.target.value,
                        localRemote: '',
                    },
                    data: emptyArr,
                }, () => {
                });
                break;
            case 'localRemote':
                this.setState({
                    filterOpt: {
                        ...this.state.filterOpt,
                        localRemote: e.target.value,
                    },
                    data: this.state.filterOpt.localRemote === e.target.value ? this.state.data : emptyArr,
                }, () => {
                });
                break;
            default:
                this.setState({
                    filterOpt: {
                        ...this.state.filterOpt,
                        [name]: e.target.value,
                    },
                });
        }
    }
    render() {
        const {classes} = this.props;
        const YAxisTickButLabel = props =>
            (
                <g transform={`translate(${props.x},${props.y})`}>
                    <text
                        x={0}
                        y={0}
                        dy={4}
                        fontFamily="Roboto"
                        fontSize="10px"
                        textAnchor="end"
                        fill={props.color || '#8884d8'}
                    >
                        {props.payload.value}
                    </text>
                </g>
            );
        const NotAxisTickButLabel = props =>
            (
                <g transform={`translate(${props.x},${props.y})`}>
                    <text
                        x={0}
                        y={0}
                        dy={10}
                        dx={3}
                        fontFamily="Roboto"
                        fontSize="10px"
                        textAnchor="end"
                        fill={props.color || '#8884d8'}
                    >
                        {props.payload.value}
                    </text>
                </g>
            );
        const CustomizeTooltip = (props) => {
            if (props.active && props.payload) {
                if (props.payload.length > 1 && props.payload[0].value > props.payload[1].value) {
                    return (
                        <div className={classes.tooltipBox}>
                            {
                                props.payload[0] && props.payload[0].name === 'remote' ?
                                    (<div className={classes.remoteTooltip}>
                                        <div>
                                            {
                                                `${props.payload[0] ?
                                                    props.payload[0].value : null} ${this.t('rssiUnit')}`
                                            }
                                        </div>
                                        <div
                                            style={{textAlign: 'center', fontSize: '12px', marginTop: '5px'}}
                                        >{props.label}</div>
                                    </div>) : null
                            }
                            {
                                props.payload[0] && props.payload[0].name === 'local' ?
                                    (<div className={classes.localTooltip}>
                                        <div>
                                            {`${props.payload[0] ?
                                                props.payload[0].value : null} ${this.t('rssiUnit')}`}
                                        </div>
                                        <div
                                            style={{textAlign: 'center', fontSize: '12px', marginTop: '5px'}}
                                        >{props.label}</div>
                                    </div>) : null
                            }
                            {
                                props.payload[1] && props.payload[1].name === 'remote' ?
                                    (<div className={classes.remoteTooltip}>
                                        <div>
                                            {`${props.payload[1] ?
                                                props.payload[1].value : null} ${this.t('rssiUnit')}`}
                                        </div>
                                        <div
                                            style={{textAlign: 'center', fontSize: '12px', marginTop: '5px'}}
                                        >{props.label}</div>
                                    </div>) : null
                            }
                            {
                                props.payload[1] && props.payload[1].name === 'local' ?
                                    (<div className={classes.localTooltip}>
                                        <div>
                                            {`${props.payload[1] ?
                                                props.payload[1].value : null} ${this.t('rssiUnit')}`}
                                        </div>
                                        <div
                                            style={{textAlign: 'center', fontSize: '12px', marginTop: '5px'}}
                                        >{props.label}</div>
                                    </div>) : null
                            }
                        </div>
                    );
                }
                return (
                    <div className={classes.tooltipBox}>
                        {
                            props.payload[1] && props.payload[1].name === 'remote' ?
                                (<div className={classes.remoteTooltip}>
                                    <div>
                                        {`${props.payload[1] ? props.payload[1].value : null} ${this.t('rssiUnit')}`}
                                    </div>
                                    <div
                                        style={{textAlign: 'center', fontSize: '12px', marginTop: '5px'}}
                                    >{props.label}</div>
                                </div>) : null
                        }
                        {
                            props.payload[1] && props.payload[1].name === 'local' ?
                                (<div className={classes.localTooltip}>
                                    <div>
                                        {`${props.payload[1] ? props.payload[1].value : null} ${this.t('rssiUnit')}`}
                                    </div>
                                    <div
                                        style={{textAlign: 'center', fontSize: '12px', marginTop: '5px'}}
                                    >{props.label}</div>
                                </div>) : null
                        }
                        {
                            props.payload[0] && props.payload[0].name === 'remote' ?
                                (<div className={classes.remoteTooltip}>
                                    <div>
                                        {`${props.payload[0] ? props.payload[0].value : null} ${this.t('rssiUnit')}`}
                                    </div>
                                    <div
                                        style={{textAlign: 'center', fontSize: '12px', marginTop: '5px'}}
                                    >{props.label}</div>
                                </div>) : null
                        }
                        {
                            props.payload[0] && props.payload[0].name === 'local' ?
                                (<div className={classes.localTooltip}>
                                    <div>
                                        {`${props.payload[0] ? props.payload[0].value : null} ${this.t('rssiUnit')}`}
                                    </div>
                                    <div
                                        style={{textAlign: 'center', fontSize: '12px', marginTop: '5px'}}
                                    >{props.label}</div>
                                </div>) : null
                        }
                    </div>
                );
            }
            return null;
        };
        const LegendPayload = [
            {
                color: REMOTE_COLOR,
                value: this.t('Remote'),
                type: 'line',
                dataKey: 'remote',
            },
            {
                color: LOCAL_COLOR,
                value: this.t('Local'),
                type: 'line',
                dataKey: 'local',
            },
        ];
        return (
            <>
                <Paper style={this.state.style}>
                    <LockLayer
                        display={this.state.loading}
                        top={0}
                        left={0}
                        zIndex={200}
                        opacity={1}
                        color={colors.lockLayerBackground}
                        hasCircularProgress
                        circularMargin="-40px"
                    />
                    <P2Dialog
                        open={this.state.dialog.open}
                        handleClose={this.handleDialogOnClose}
                        title={this.state.dialog.title}
                        content={this.state.dialog.content}
                        actionTitle={this.state.dialog.submitButton}
                        actionFn={this.state.dialog.submitAction}
                    />
                    <div style={modelHeader} className={`${classes.modelHeader} draggable`}>
                        <Typography classes={{h6: classes.headerTitle}} variant="h6">
                            {this.t('header')}
                            <span className={classes.hostname}>&#160;&#160;&#160;{this.props.hostname}</span>
                        </Typography>
                        <Chip
                            label={this.t('beta')}
                            className={classes.titleChip}
                            style={{position: 'absolute', top: '10px', right: '40px'}}
                        />
                        <div
                            role="presentation"
                            onClick={this.unMountStyle}
                            id="rssiRightCloseDiv"
                            className={classes.close}
                        >
                            <CloseIcon />
                        </div>
                    </div>
                    <Typography classes={{h6: classes.subHeader}} variant="h6">
                        {this.t('subHeader')}
                    </Typography>
                    <div className={classes.optWrapper}>
                        <div>
                            <i
                                className="p2-icon-funnel"
                                style={{
                                    fontSize: '20px',
                                    color: theme.palette.primary.light,
                                }}
                            />
                        </div>
                        <FormControl className={classes.radioOpt}>
                            <Select
                                value={this.state.filterOpt.radio}
                                onChange={(e) => {
                                    this.handleOptChange(e, 'radio');
                                }}
                                input={<Input id="radio" />}
                                renderValue={
                                    selected =>
                                        (`${selected}` !== '' ? `${radioMap[selected]}` : this.t('radioPlaceholder'))
                                }
                                displayEmpty
                                MenuProps={MenuProps}
                                disabled={this.state.status === 'start'}
                            >
                                {this.state.radioList.sort().map(name => (
                                    <MenuItem key={name} value={name}>
                                        <ListItemText primary={radioMap[name]} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl className={classes.macOpt}>
                            <Select
                                value={this.state.filterOpt.mac}
                                onChange={(e) => {
                                    this.handleOptChange(e, 'mac');
                                }}
                                input={<Input id="mac" />}
                                renderValue={
                                    selected =>
                                        (
                                            `${selected}` !== '' ?
                                                `${this.getHostname(selected)}` :
                                                this.t('neighborsPlaceholder')
                                        )
                                }
                                MenuProps={NeiMenuProps}
                                displayEmpty
                                disabled={this.state.status === 'start' || this.state.filterOpt.radio === ''}
                            >
                                {
                                    this.getMacList().length < 1 ?
                                        <MenuItem value="" disabled>{this.t('noNeighborsPlaceholder')}</MenuItem>
                                        : null
                                }
                                {this.getMacList().map(name => (
                                    <MenuItem key={name} value={name}>
                                        <ListItemText className={classes.menuItem} primary={this.getHostname(name)} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <FormControl className={classes.localRemoteOpt}>
                            <Select
                                value={this.state.filterOpt.localRemote}
                                onChange={(e) => {
                                    this.handleOptChange(e, 'localRemote');
                                }}
                                input={<Input id="local-remote" />}
                                disabled={this.state.status === 'start' || this.state.filterOpt.mac === ''}
                                renderValue={
                                    selected =>
                                        (`${selected}` !== '' ? this.t(selected) : this.t('dataTypePlaceholder'))
                                }
                                displayEmpty
                                MenuProps={MenuProps}
                            >
                                {
                                    this.getLocalRemoteList().length < 1 ?
                                        <MenuItem value="" disabled>{this.t('noDataPlaceholder')}</MenuItem>
                                        : null
                                }
                                {this.getLocalRemoteList().map(name => (
                                    <MenuItem key={name} value={name}>
                                        <ListItemText primary={this.t(name)} />
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <P2Tooltip
                            title={this.t('scanTooltip')}
                            content={(
                                <span>
                                    <Button
                                        color="primary"
                                        onClick={this.filter}
                                        variant="contained"
                                        classes={{
                                            root: classes.filterBtn,
                                        }}
                                        disabled={this.canStart()}
                                    >
                                        {this.state.status === 'stop' ? this.t('scan') : this.t('stop')}
                                    </Button>
                                </span>
                            )}
                        />
                        <P2Tooltip
                            title={this.t('refreshTooltip')}
                            content={(
                                <span>
                                    <Button
                                        color="primary"
                                        onClick={this.refresh}
                                        variant="contained"
                                        classes={{
                                            root: classes.filterBtn,
                                        }}
                                        disabled={this.canRefresh()}
                                    >
                                        {this.t('refreshButtonLabel')}
                                    </Button>
                                </span>
                            )}
                        />
                    </div>
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <div
                            style={{
                                fontFamily: 'Roboto',
                                fontSize: '10px',
                                marginTop: '20px',
                                width: '700px',
                            }}
                        >
                            {
                                this.getNoDataWrapper()
                            }
                            <LineChart
                                width={700}
                                height={340}
                                data={this.state.data}
                                margin={
                                    {
                                        top: 5,
                                        right: 30,
                                        left: 20,
                                        bottom: 5,
                                    }
                                }
                            >
                                <XAxis
                                    dataKey="time"
                                    tick={<NotAxisTickButLabel color="#000000" />}
                                />
                                <YAxis
                                    tickLine={false}
                                    interval={0}
                                    type="number"
                                    axisLine={false}
                                    width={30}
                                    minTickGap={10}
                                    domain={[0, -95]}
                                    tick={<YAxisTickButLabel color="#000000" />}
                                    ticks={[0, -10, -20, -30, -40, -50, -60, -70, -80, -95]}
                                    label={
                                        {
                                            value: this.t('yAxisLabel'),
                                            angle: -90,
                                            position: 'insideLeft',
                                            offset: -5,
                                        }
                                    }
                                />
                                <Tooltip content={<CustomizeTooltip />} />
                                <CartesianGrid strokeDasharray="3 3" vertical={false} height={20} />
                                <Legend payload={LegendPayload} />
                                <Line
                                    type="linear"
                                    dataKey="remote"
                                    stroke={REMOTE_COLOR}
                                    strokeWidth={2}
                                    isAnimationActive={false}
                                    hide={
                                        this.state.filterOpt.localRemote === 'Local' ||
                                        this.state.filterOpt.localRemote === ''
                                    }
                                />
                                <Line
                                    type="linear"
                                    dataKey="local"
                                    stroke={LOCAL_COLOR}
                                    strokeWidth={2}
                                    isAnimationActive={false}
                                    hide={
                                        this.state.filterOpt.localRemote === 'Remote' ||
                                        this.state.filterOpt.localRemote === ''
                                    }
                                />
                            </LineChart>
                        </div>
                        {this.getNewestDataBox()}
                    </div>
                </Paper>
            </>
        );
    }
}

export const styles = {
    titleChip: {
        borderRadius: '4px',
        marginRight: '8px',
        backgroundColor: Constant.themeObj.primary.light,
        color: 'white',
        fontWeight: 'bolder',
        height: '23px',
    },
    noDataWrapper: {
        position: 'absolute',
        top: '243px',
        opacity: '0.3',
        fontSize: '30px',
        // width: '100%',
        textAlign: 'center',
        left: '185px',
    },
    swapOptWrapper: {
        display: 'flex',
        alignItems: 'center',
    },
    swapCheckbox: {
        display: 'inline-flex',
    },
    swapOptLabel: {
        fontSize: '14px',
        display: 'inline-flex',
    },
    optWrapper: {
        paddingLeft: '25px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    radioOpt: {
        width: '130px',
        marginRight: '20px',
        marginLeft: '10px',
    },
    localRemoteOpt: {
        width: '170px',
        marginRight: '20px',
    },
    macOpt: {
        width: '240px',
        marginRight: '20px',
    },
    headerTitle: {
        opacity: '0.875',
        fontSize: '18px',
        fontWeight: 800,
        color: 'white',
    },
    subHeader: {
        padding: '15px 20px 15px 25px',
        color: themeObj.txt.normal,
        opacity: '0.59',
        fontWeight: 400,
        fontSize: '12px',
    },
    hostname: {
        padding: '15px 20px 15px 0px',
        color: 'white',
        fontWeight: 400,
        fontSize: '12px',
    },
    // labelContainer: {
    // },
    filterBtn: {
        // padding: '10px',
        paddingTop: '5px',
        paddingBottom: '5px',
        marginRight: '10px',
        fontSize: '12px',
        minHeight: '20px',
    },
    close: {
        cursor: 'pointer',
        position: 'absolute',
        top: '10px',
        right: '20px',
        color: 'white',
        opacity: '87.5%',
        fontSize: '18px',
    },
    tooltipBox: {
        // width: '70px',
        height: '170px',
        padding: '5px',
        color: 'white',
        fontSize: '18px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
    },
    remoteTooltip: {
        // marginTop: '18px',
        // marginBottom: '18px',
        padding: '10px',
        backgroundColor: REMOTE_COLOR,
        borderRadius: '4px',
        fontWeight: '600',
    },
    localTooltip: {
        padding: '10px',
        borderRadius: '4px',
        // marginTop: '18px',
        backgroundColor: LOCAL_COLOR,
        fontWeight: '600',
        // marginBottom: '18px',
    },
    modelHeader: {
        backgroundColor: theme.palette.primary.main,
        color: 'white',
    },
    localCircleBox: {
        backgroundColor: LOCAL_COLOR,
        marginTop: '20px',
        width: '120px',
        height: '120px',
        borderRadius: '60px',
        display: 'flex',
        flexDirection: 'column',
    },
    remoteCircleBox: {
        backgroundColor: REMOTE_COLOR,
        marginTop: '34px',
        width: '120px',
        height: '120px',
        borderRadius: '60px',
        display: 'flex',
        flexDirection: 'column',
    },
    circleBoxText: {
        width: '100px',
        textAlign: 'center',
        margin: 'auto',
        color: 'white',
        fontSize: '28px',
        fontWeight: '800',
        // paddingTop: '15px',
        fontFamily: 'Roboto',
    },
    menuItem: {
        maxWidth: '500px',
        width: '100%',
        // overflow: 'hidden',
        // whiteSpace: 'nowrap',
        // textOverflow: 'ellipsis',
    },
};
// GeneralModal.propTypes = {
//     open: PropTypes.bool.isRequired,
// };

// export default RssiViewerCard;

/* eslint-disable */
RssiViewerCard.propTypes = {
    ip: PropTypes.string.isRequired,
    hostname: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired,
    macToHostnameMap: PropTypes.object.isRequired,
    csrf: PropTypes.string.isRequired,
    close: PropTypes.func.isRequired,
    // initIndex: PropTypes.number.isRequired,
    t: PropTypes.func.isRequired,
};
/* eslint-enable */

function mapStateToProps(store) {
    return {
        macToHostnameMap: store.meshTopology.macToHostnameMap,
    };
}

const ConnectedRssiViewerCard = connect(mapStateToProps)(RssiViewerCard);

export {ConnectedRssiViewerCard, RssiViewerCard as NamedRssiViewerCard};
export default compose(
    withTranslation(['node-rssi-viewer']),
    connect(mapStateToProps),
    (withStyles(styles))
)(RssiViewerCard);
