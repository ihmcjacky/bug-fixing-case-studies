/**
 * @Author: mango
 * @Date:   2018-06-13T13:16:31+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-11-13T10:58:57+08:00
 */
import React from 'react';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import {compose} from 'redux';
import Button from '@material-ui/core/Button';

import {withStyles, MuiThemeProvider} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {CircularProgressbar, buildStyles} from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import Constant from '../../constants/common';
import {
    getNetworkDeviceStat,
    getConfig,
    getFilteredConfigOptions,
    getRadioInfo,
    getCachedNetworkDeviceStat,
    getCachedConfig,
    getCachedRadioInfo,
} from '../../util/apiCall';
import {fetchEthLinkSegments} from '../../redux/meshTopology/meshTopologyActions';
import {convertUptime, convertBytes, convertUnit} from '../../util/formatConvertor';
import P2Dialog from '../../components/common/P2Dialog';
import LockLayer from '../../components/common/LockLayer';
import P2Progressbar from '../../components/common/P2Progressbar';
import MdopInfoOverviewDialog from './MdopInfoOverviewDialog';
import {convertSpeed} from '../../util/formatConvertor';

const {colors, theme} = Constant;

const deepClone = object => JSON.parse(JSON.stringify(object));

const wrapper = promise => (
    promise
        .then(data => ({data, error: null}))
        .catch(error => ({error, data: null}))
);

const styles = {
    headerRoot: {
        fontWeight: 'bold',
        paddingBottom: '5px',
    },
    content: {
        fontSize: '12px',
    },
    subcontent: {
        paddingLeft: '15px',
        paddingTop: '5px',
        fontSize: '11px',
    },
    iconRoot: {
        paddingLeft: '10px',
    },
    mdopBtn: {
        padding: '0px 10px',
    },
};

function createConfigOptionRequest(getConfigObj, nodeIp) {
    const bodyMsg = {
        sourceConfig: {},
    };
    const {checksums, ...Setting} = getConfigObj;
    bodyMsg.sourceConfig = Setting;
    bodyMsg.options = {};

    const radioSettings = {};
    Object.keys(bodyMsg.sourceConfig.radioSettings[nodeIp]).forEach((radioName) => {
        radioSettings[radioName] = ['channel', 'centralFreq', 'operationMode', 'txpower'];
    });
    bodyMsg.options.radioSettings = {
        [nodeIp]: radioSettings,
    };

    return bodyMsg;
}

class OverviewBox extends React.Component {
    constructor(props) {
        super(props);

        this.t = this.props.t;
        this.state = {
            productImgPath: `/img/${this.props.nodes[0].model}.png`,
            dialog: {
                open: false,
                title: '',
                content: '',
                submitButton: '',
                submitAction: this.handleDialogOnClose,
            },
            filteredConfig: {},
            ethernet: {},
            radio: {},
            isLock: true,
            mdopDialog: {
                open: false,
                initEth: '',
            }
        };

        const fnNames = [
            'createEth',
            'createRadio',
            'getStatistic',
            'getConfig',
            'getDataFailHandler',
            'convertNodeInfo',
            'convertStatistic',
            'convertConfig',
            'updateConfigData',
            'handleDialogOnClose',
            'updateFilterConfig',
            'searchChannel',
            'searchCentralFreq',
            'searchTxpower',
            'getRadioInfo',
            'updateRadioInfo',
            'openMdopDialog',
            'closeMdopDialog',
            'shouldMdopBtnShow',
        ];

        window.__.each(fnNames, (fnName) => {
            this[fnName] = this[fnName].bind(this);
        });

        this.projectID = Cookies.get('projectID');
    }

    componentDidMount() {
        this.convertNodeInfo();
        // this.props.fetchEthLinkSegments();
        this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }
    openMdopDialog() {
        this.setState(
            {
                mdopDialog: {
                    ...this.state.mdopDialog,
                    open: true,
                }
            }
        );
    }
    closeMdopDialog() {
        this.setState(
            {
                mdopDialog: {
                    ...this.state.mdopDialog,
                    open: false,
                }
            }
        );
    }
    getStatistic() {
        const {ipv4} = this.props.nodes[0];
        const projectId = Cookies.get('projectId');
        const p = getCachedNetworkDeviceStat(this.props.csrf, projectId, {nodes: [ipv4]});

        p.then((value) => {
            if (this.mounted) {
                this.updateStatistic(value);
            }
        }).catch((e) => {
            console.log('kyle_debug: OverviewBox -> getStatistic -> e', e);
            if (this.mounted) {
                this.getDataFailHandler();
            }
        });
    }

    getConfig() {
        const {ipv4} = this.props.nodes[0];
        const projectId = Cookies.get('projectId');
        const p = getCachedConfig(this.props.csrf, projectId, {nodes: [ipv4]});

        p.then((value) => {
            if (this.mounted) {
                this.updateConfigData(value);
            }
        }).catch((e) => {
            console.log('kyle_debug: OverviewBox -> getConfig -> e', e);
            if (this.mounted) {
                this.getDataFailHandler();
            }
        });
    }

    getDataFailHandler() {
        console.log('kyle_debug: OverviewBox -> getDataFailHandler -> getDataFailHandler');
        this.setState({
            ...this.state,
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('getDataFailTitle'),
                content: this.t('getDataFailContent'),
                submitButton: this.t('submitBtnTitle'),
                submitAction: () => this.props.close(this.props.nodes[0].ipv4),
            },
            isLock: false,
        });
    }


    async getRadioInfo() {
        const {ipv4} = this.props.nodes[0];
        // const temp = {};
        // temp[ipv4] = {
        //     interval: 1,
        //     enableRemote: false,
        // };

        const projectId = Cookies.get('projectId');
        const {data, error} = await wrapper(getCachedRadioInfo(this.props.csrf, projectId, {nodes: [ipv4]}));
        if (error) {
            console.log('kyle_debug: OverviewBox -> getRadioInfo -> error', error)
            this.setState({
                ...this.state,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('getDataFailTitle'),
                    content: this.t('getDataFailContent'),
                    submitButton: this.t('submitBtnTitle'),
                    submitAction: () => this.props.close(this.props.nodes[0].ipv4),
                },
            });
        } else {
            this.updateRadioInfo(data);
        }
    }

    updateRadioInfo(radioInfo) {
        const {radio} = this.state;
        const {ipv4} = this.props.nodes[0];
        const newRadioObj = deepClone(radio);
        Object.keys(newRadioObj).forEach((radioName) => {
            newRadioObj[radioName].txpower = radioInfo?.[ipv4]?.[radioName]?.txpower ?? '';
            newRadioObj[radioName].channel = radioInfo?.[ipv4]?.[radioName]?.channel ?? '';
            newRadioObj[radioName].channelBandwidth = radioInfo?.[ipv4]?.[radioName]?.channelBandwidth ?? '';
            newRadioObj[radioName].centralFreq = radioInfo?.[ipv4]?.[radioName]?.channel ?? '';
        });
        this.setState({
            ...this.state,
            radio: newRadioObj,
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

    updateFilterConfig(Config, nodeIp) {
        console.log('-----updateFilterConfig-----', nodeIp);
        console.log(Config);
        const filteredConfig = {};

        Object.keys(Config[nodeIp]).forEach((radio) => {
            filteredConfig[radio] = {};
            if (Config[nodeIp][radio].channel !== 'undefined' &&
                Config[nodeIp][radio].channel.type === 'enum') {
                filteredConfig[radio].channel = Config[nodeIp][radio].channel.data;
            }
            if (Config[nodeIp][radio].centralFreq !== 'undefined' &&
                Config[nodeIp][radio].centralFreq.type === 'enum') {
                filteredConfig[radio].centralFreq = Config[nodeIp][radio].centralFreq.data;
            }
            if (Config[nodeIp][radio].operationMode !== 'undefined' &&
                Config[nodeIp][radio].operationMode.type === 'enum') {
                filteredConfig[radio].operationMode = Config[nodeIp][radio].operationMode.data;
            }
            if (Config[nodeIp][radio].txpower !== 'undefined' &&
                Config[nodeIp][radio].txpower.type === 'enum') {
                filteredConfig[radio].txpower = Config[nodeIp][radio].txpower.data;
            }
        });

        this.setState({
            ...this.state,
            filteredConfig,
        });
    }

    updateStatistic(statObj) {
        const {ipv4} = this.props.nodes[0];

        if (typeof statObj[ipv4] !== 'undefined') {
            const newEthObj = this.convertStatistic(statObj[ipv4]);
            this.setState({
                ethernet: newEthObj,
            }, () => {
                this.getConfig();
            });
        }
    }


    async updateConfigData(configObj) {
        const {ipv4} = this.props.nodes[0];

        try {
            const projectId = Cookies.get('projectId');
            const bodyMsg = createConfigOptionRequest(configObj, ipv4);
            const filterConfig = await getFilteredConfigOptions(this.props.csrf, projectId, bodyMsg);
            this.updateFilterConfig(filterConfig.radioSettings, ipv4);
            if (typeof configObj.radioSettings !== 'undefined' &&
                typeof configObj.radioSettings[ipv4] !== 'undefined') {
                const newRadioObj = this.convertConfig(configObj.radioSettings[ipv4]);
                this.setState({
                    radio: {
                        ...this.state.radio,
                        ...newRadioObj,
                    },
                }, () => {
                    this.getRadioInfo();
                });
            }
        } catch (err) {
            console.log('kyle_debug: OverviewBox -> updateConfigData -> err', err);
            this.setState({
                ...this.state,
                dialog: {
                    ...this.state.dialog,
                    open: true,
                    title: this.t('getDataFailTitle'),
                    content: this.t('getDataFailContent'),
                    submitButton: this.t('submitBtnTitle'),
                    submitAction: () => this.props.close(this.props.nodes[0].ipv4),
                },
            });
        }
    }

    convertNodeInfo() {
        const {ipv4} = this.props.nodes[0];
        const {nodeData} = this.props;
        const nodeInfo = nodeData[ipv4];
        console.log('kyle_debug: OverviewBox -> convertNodeInfo -> nodeInfo', nodeInfo);
        console.log('kyle_debug: OverviewBox -> convertNodeInfo -> nodeInfo', nodeData);

        const ethernet = {};

        nodeInfo.ethStatus.forEach((status, key) => {
            const objKey = `eth${key}`;
            ethernet[objKey] = {};
            ethernet[objKey].status = status === '1' ? 'statusUp' : 'statusDown';
        });

        const radio = {};

        nodeInfo.radioStatus.forEach((status, key) => {
            const objKey = `radio${key}`;
            radio[objKey] = {};
            radio[objKey].status = status === '1' ? 'statusEnable' : 'statusDisable';
        });

        // check should open mdop Table


        const topologyNodes = {};
        this.props.topologyNodes.forEach(
            (node) => {
                topologyNodes[node.id] = node;
            }
        );
        if (
            this.props.initData &&
            this.props.initData[ipv4] &&
            this.props.initData[ipv4].directToMdopTable &&
            this.shouldMdopBtnShow(topologyNodes[ipv4])
        ) {
            this.setState({
                ethernet,
                radio,
                isLock: false,
                mdopDialog: {
                    ...this.state.mdopDialog,
                    open: true,
                    initEth: this.props.initData[ipv4].eth,
                }
            }, () => {
                this.getStatistic();
            });
        } else {
            this.setState({
                ethernet,
                radio,
                isLock: false,
            }, () => {
                this.getStatistic();
            });
        }
        
    }

    convertStatistic(statObj) {
        const {ethernet} = this.state;
        const newEthObj = {};
        Object.keys(ethernet).forEach((eth) => {
            newEthObj[eth] = {};
            newEthObj[eth].status = ethernet[eth].status;
            newEthObj[eth].txPackets = statObj[eth].txPackets;
            newEthObj[eth].rxPackets = statObj[eth].rxPackets;
            newEthObj[eth].txBytes = statObj[eth].txBytes;
            newEthObj[eth].rxBytes = statObj[eth].rxBytes;
            newEthObj[eth].speed = statObj[eth].speed.tx.max || '-';
        });
        console.log('kyle_debug: OverviewBox -> convertStatistic -> newEthObj', newEthObj);
        return newEthObj;
    }

    convertConfig(radioSettingsObj) {
        const {radio} = this.state;
        const newRadioObj = {};

        Object.keys(radio).forEach((radioName) => {
            newRadioObj[radioName] = {};
            newRadioObj[radioName].status = radio[radioName].status;
            newRadioObj[radioName].operationMode = radioSettingsObj[radioName].operationMode;
        });

        return newRadioObj;
    }

    createEth(hostname, sn) {
        const {ethernet} = this.state;
        const {classes} = this.props;

        if (Object.keys(ethernet).length === 0) {
            return (
                <Grid item xs={4} style={{paddingTop: '0px'}}>
                    <Typography variant="body2">{this.t('defaultUnknownValue')}</Typography>
                </Grid>
            );
        }

        const ethernetElement = Object.keys(ethernet).map((eth) => {
            const {status} = ethernet[eth];
            const textColor = status === 'statusUp' ? colors.activeGreen : colors.inactiveRed;
            const txPackets = typeof ethernet[eth].txPackets !== 'undefined' ?
                convertUnit(ethernet[eth].txPackets) : this.t('defaultUnknownValue');
            const rxPackets = typeof ethernet[eth].rxPackets !== 'undefined' ?
                convertUnit(ethernet[eth].rxPackets) : this.t('defaultUnknownValue');
            const txBytes = typeof ethernet[eth].txBytes !== 'undefined' ?
                convertBytes(ethernet[eth].txBytes) : this.t('defaultUnknownValue');
            const rxBytes = typeof ethernet[eth].rxBytes !== 'undefined' ?
                convertBytes(ethernet[eth].rxBytes) : this.t('defaultUnknownValue');
            const speed = typeof ethernet[eth].speed !== 'undefined' ?
                convertSpeed(ethernet[eth].speed, this.t) : this.t('defaultUnknownValue');

            return (
                <Grid item xs={4} style={{paddingTop: '0px'}} key={eth}>
                    <Typography variant="body2" classes={{root: classes.content}}>
                        {this.t(`ethTitle.${eth}`)}
                    </Typography>
                    <Typography variant="body2" classes={{root: classes.subcontent}}>
                        {this.t('statusTitle')}: <span style={{fontWeight: 'bold', color: textColor}} id={`${hostname}-${sn}-ethStatus`}>
                            {this.t(status)}
                        </span>
                    </Typography>
                    <Typography variant="body2" classes={{root: classes.subcontent}}>
                        {this.t('speedTitle')}: <span id={`${hostname}-${sn}-speed`}>{speed}</span>
                    </Typography>
                    <Typography variant="body2" classes={{root: classes.subcontent}}>
                        {this.t('txRxPacketsTitle')}: <span id={`${hostname}-${sn}-txPackets`}>{txPackets}</span> / <span id={`${hostname}-${sn}-rxPackets`}>{rxPackets}</span>
                    </Typography>
                    <Typography variant="body2" classes={{root: classes.subcontent}}>
                        {this.t('txRxBytesTitle')}: <span id={`${hostname}-${sn}-txBytes`}>{txBytes}</span> / <span id={`${hostname}-${sn}-rxBytes`}>{rxBytes}</span>
                    </Typography>
                </Grid>
            );
        });

        return ethernetElement;
    }

    searchChannel(value, radio) {
        const {filteredConfig} = this.state;
        // console.log(filteredConfig);
        const options = filteredConfig?.[radio]?.channel;
        if (!options) {
            return '-';
        }
        const channel = options
            .find(channelObj => channelObj.actualValue === value);

        return typeof channel !== 'undefined' ? channel.displayValue : '-';
    }

    searchCentralFreq(value, radio) {
        const {filteredConfig} = this.state;
        // console.log(filteredConfig);
        const options = filteredConfig?.[radio]?.centralFreq;
        if (!options) {
            return '-';
        }
        const centralFreq = options
            .find(centralFreqObj => centralFreqObj.actualValue === value);

        return typeof centralFreq !== 'undefined' ? centralFreq.displayValue : '-';
    }

    searchTxpower(value, radio) {
        const {filteredConfig} = this.state;

        const options = filteredConfig?.[radio]?.txpower;
        if (!options) {
            return '-';
        }
        const txpower = options
            .find(txpowerObj => txpowerObj.actualValue === value);

        return typeof txpower !== 'undefined' ? txpower.displayValue : '-';
    }

    searchOperationMode(value, radio) {
        const {filteredConfig} = this.state;
        // console.log(filteredConfig);
        const options = filteredConfig?.[radio]?.operationMode;
        if (!options) {
            return '-';
        }
        const operationMode = options
            .find(centralFreqObj => centralFreqObj.actualValue === value);

        return typeof operationMode !== 'undefined' ? operationMode.displayValue : '-';
    }


    createRadio(hostname, sn) {
        const {radio} = this.state;
        const {classes} = this.props;

        if (Object.keys(radio).length === 0) {
            return (
                <Grid item xs={4} style={{paddingTop: '0px'}}>
                    <Typography variant="body2">{this.t('defaultUnknownValue')}</Typography>
                </Grid>
            );
        }

        const radioElement = Object.keys(radio).map((radioName) => {
            const {status} = radio[radioName];
            const textColor = status === 'statusEnable' ? colors.activeGreen : colors.inactiveRed;
            let channel = typeof radio[radioName].channel !== 'undefined' ?
                this.searchChannel(radio[radioName].channel, radioName) : this.t('defaultUnknownValue');
            const channelBandwidth = typeof radio[radioName].channelBandwidth !== 'undefined' ?
                `${radio[radioName].channelBandwidth}` : this.t('defaultUnknownValue');
            const txpower = typeof radio[radioName].txpower !== 'undefined' ?
                radio[radioName].txpower : this.t('defaultUnknownValue');
            const centralFreq = typeof radio[radioName].centralFreq !== 'undefined' ?
                `${this.searchCentralFreq(radio[radioName].centralFreq, radioName)}` :
                this.t('defaultUnknownValue');
            const operationMode = typeof radio[radioName].operationMode !== 'undefined' ?
                `${this.searchOperationMode(radio[radioName].operationMode, radioName)}` :
                this.t('defaultUnknownValue');

            // const mockFreq = '4999HMz';
            let is49GHz = false;
            if (centralFreq !== this.t('defaultUnknownValue')) {
                const tmpFreq = centralFreq.replace(/[^\d.]/g, '');
                is49GHz = parseInt(tmpFreq / 100, 10) === 49;
            }
            if (is49GHz) {
                channel = '-';
            }
            return (
                <Grid item xs={4} style={{paddingTop: '0px'}} key={radioName}>
                    <Typography variant="body2" classes={{root: classes.content}} data-test-id={`${hostname}-${sn}-radioName${radioName}`}>
                        {this.t(`radioName.${radioName}`)}
                    </Typography>
                    <Typography variant="body2" classes={{root: classes.subcontent}}>
                        {this.t('statusTitle')}: <span style={{fontWeight: 'bold', color: textColor}} data-test-id={`${hostname}-${sn}-radioStatus`}>
                            {this.t(status)}
                        </span>
                    </Typography>
                    <Typography variant="body2" classes={{root: classes.subcontent}}>
                        {this.t('operationModeTitle')}: <span id={`${hostname}-${sn}-operationMode`}>{operationMode}</span>
                    </Typography>
                    <Typography variant="body2" classes={{root: classes.subcontent}}>
                        {this.t('channelTitle')}: <span id={`${hostname}-${sn}-channel`}>{channel}</span>(<span id={`${hostname}-${sn}-centralFreq`}>{centralFreq}</span>)
                    </Typography>
                    <Typography variant="body2" classes={{root: classes.subcontent}}>
                        {this.t('txpowerTitle')}: <span id={`${hostname}-${sn}-txpower`}>{txpower}</span>
                    </Typography>
                    <Typography variant="body2" classes={{root: classes.subcontent}}>
                        {this.t('channelBandwidthTitle')}: <span id={`${hostname}-${sn}-channelBandwidth`}>{channelBandwidth}</span>
                    </Typography>
                </Grid>
            );
        });

        return radioElement;
    }

    shouldMdopBtnShow(node) {
        // console.log('shouldMdopBtnShow');
        // console.log(node);
        if (node && node.hasMdop && node.mdopInfo) {
            const {modeLabelList} = node.mdopInfo;
            if (!modeLabelList) {
                return false;
            }
            if (modeLabelList.eth0 === '' && modeLabelList.eth1 === '') {
                return false;
            }
            return true;
            // const {mdopTable} = this.props;
            // let havEthStatus = true;
            // mdopIdList.forEach(
            //     (mdopId) => {
            //         if (
            //             !mdopTable[mdopId] ||
            //             !mdopTable[mdopId].neighbors ||
            //             !mdopTable[mdopId].neighbors[ipv4] ||
            //             mdopTable[mdopId].neighbors[ipv4].eth === undefined
            //         ) {
            //             havEthStatus = false;
            //         }
            //     }
            // );
            // return !havEthStatus;
        }
        return false;
    };

    render() {
        if (!this.props.tReady) {
            return <span />;
        }
        const {classes} = this.props;
        const {productImgPath} = this.state;
        const {nodeData} = this.props;
        const {ipv4} = this.props.nodes[0];
        const {hostname} = nodeData[ipv4];
        const {
            cpuUsage, ramUsage, firmwareVersion, model, sn,
        } = nodeData[ipv4];
        

        const topologyNodes = {};
        this.props.topologyNodes.forEach(
            (node) => {
                topologyNodes[node.id] = node;
            }
        );
        // const randomValue = Math.floor(Math.random() * 101);
        // console.log('kyle_debug: OverviewBox -> render -> randomValue', randomValue);

        let totalRam = this.t('defaultUnknownValue');
        let availableRam = this.t('defaultUnknownValue');
        let usedRam = this.t('defaultUnknownValue');
        // console.log('kyle_debug: OverviewBox -> render -> usedRam', usedRam);
        let ramUsagePercent = this.t('defaultUnknownValue');
        let activeNeighborsNum = this.t('defaultUnknownValue');
        let displayUptime = this.t('defaultUnknownValue');

        if (nodeData[ipv4]) {
            totalRam = Math.floor(ramUsage.total / 1024);
            availableRam = Math.floor(ramUsage.available / 1024);
            usedRam = totalRam - availableRam;
            ramUsagePercent = Math.floor((usedRam / totalRam) * 100);
            activeNeighborsNum = topologyNodes[ipv4].activeNeiNum;
            displayUptime = convertUptime(nodeData[ipv4].uptime);
        }
        // console.log('kyle_debug: OverviewBox -> render -> usedRam', usedRam);
        // console.log('kyle_debug: OverviewBox -> render -> ramUsagePercent', ramUsagePercent);

        const productImgGrid = (
            <Grid item xs={3} style={{display: 'flex', justifyContent: 'center'}}>
                <img
                    src={productImgPath}
                    alt=""
                    width="60%"
                />
            </Grid>
        );

        const memoryGrid = (
            <Grid item xs={9}>
                <Typography variant="body2" classes={{root: classes.headerRoot}}>
                    {this.t('memoryTitle')}
                </Typography>
                <Grid container spacing={2}>
                    <Grid item xs={3}>
                        <Typography
                            variant="body2"
                            style={{padding: '10px 0px'}}
                            classes={{root: classes.content}}
                        >
                            {this.t('cpuTitle')}
                        </Typography>
                        <Typography style={{width: 50, height: 50}}>
                            <CircularProgressbar
                                data-test-id={`${hostname}-${sn}-cpuUsage`}
                                strokeWidth={6}
                                value={parseInt(cpuUsage, 10)}
                                text={`${parseInt(cpuUsage, 10)}%`}
                                styles={buildStyles({
                                    textColor: theme.palette.primary.main,
                                    pathColor: 'rgba(222, 53, 124, 0.8)',
                                    trailColor: 'rgba(222, 53, 124, 0.3)',
                                    strokeLinecap: 'butt',
                                    textSize: '30px',
                                })}
                            />
                        </Typography>
                    </Grid>
                    <Grid item xs={7} style={{paddingRight: 0}}>
                        <Typography
                            variant="body2"
                            style={{padding: '10px 0px'}}
                            classes={{root: classes.content}}
                        >
                            {this.t('ramTitle')}
                        </Typography>
                        <P2Progressbar
                            data-test-id={`${hostname}-${sn}-ramUsageProgressBar`}
                            current={usedRam}
                            currentPercentage={ramUsagePercent}
                            total={totalRam}
                            unit={this.t('mbTitle')}
                            aux={{testId: {type: 'ramUsage', hostname, sn}}}
                        />
                        {/* <Typography variant="body2" classes={{root: classes.content}}>
                            {ramUsagePercent}
                            {this.t('percentTitle')} ({usedRam}{this.t('mbTitle')}{this.t('usedOfTitle')}
                            {totalRam}{this.t('mbTitle')})
                        </Typography> */}
                    </Grid>
                </Grid>

            </Grid>
        );

        const snGrid = (
            <Grid item xs={3} data-test-id={`${hostname}-${sn}-snGrid`}>
                <Typography variant="body2" classes={{root: classes.headerRoot}}>
                    {this.t('snTitle')}
                </Typography>
                <Typography variant="body2" classes={{root: classes.content}} data-test-id={`${hostname}-${sn}-sn`}>
                    {sn}
                </Typography>
            </Grid>
        );

        const modelGrid = (
            <Grid item xs={3} data-test-id={`${hostname}-${sn}-modelGrid`}>
                <Typography variant="body2" classes={{root: classes.headerRoot}}>
                    {this.t('modelTitle')}
                </Typography>
                <Typography variant="body2" classes={{root: classes.content}} data-test-id={`${hostname}-${sn}-model`}>
                    {model}
                </Typography>
            </Grid>
        );

        const fwVersionUptimeGrid = (
            <Grid item xs={3} style={{display: 'flex', flexDirection: 'column'}}
                data-test-id={`${hostname}-${sn}-fwVersionUptimeGrid`}
            >
                <span>
                    <Typography variant="body2" classes={{root: classes.headerRoot}}>
                        {this.t('fwVersionTitle')}
                    </Typography>
                    <Typography variant="body2" classes={{root: classes.content}}  data-test-id={`${hostname}-${sn}-fwVersion`}>
                        {firmwareVersion}
                    </Typography>
                </span>
                <span style={{marginTop: '25px'}}>
                    <Typography variant="body2" classes={{root: classes.headerRoot}}>
                        {this.t('uptimeTitle')}
                    </Typography>
                    <Typography variant="body2" classes={{root: classes.content}} data-test-id={`${hostname}-${sn}-uptime`}>
                        {displayUptime}
                    </Typography>
                </span>
            </Grid>
        );

        const uptimeGrid = (
            <Grid item xs={5} data-test-id={`${hostname}-${sn}-uptimeGrid`}>
                <Typography variant="body2" classes={{root: classes.headerRoot}}>
                    {this.t('uptimeTitle')}
                </Typography>
                <Typography variant="body2" classes={{root: classes.content}} data-test-id={`${hostname}-${sn}-uptime-obsoleted`}>
                    {displayUptime}
                </Typography>
            </Grid>
        );
        // console.log('kyle_debug: OverviewBox -> uptimeGrid', uptimeGrid);

        const neighborGrid = (
            <Grid item xs={3} data-test-id={`${hostname}-${sn}-neightborGrid`}>
                <Typography variant="body2" classes={{root: classes.headerRoot}}>
                    {this.t('neighborTitle')}
                </Typography>
                <Typography variant="body2" classes={{root: classes.content}}>
                    <span style={{color: colors.activeGreen, paddingRight: '5px'}} data-test-id={`${hostname}-${sn}-neighbor`}>
                        {activeNeighborsNum}
                    </span>
                </Typography>
            </Grid>
        );

        const ethernetGrid = (
            <Grid item xs={12} style={{paddingTop: '0px'}} data-test-id={`${hostname}-${sn}-ethernetGrid`}>
                <Grid container spacing={2}>
                    <Grid item style={{paddingTop: '0px', paddingBottom: '0px'}}>
                        <Typography variant="body2" classes={{root: classes.headerRoot}}>
                            {this.t('ethernetTitle')}
                        </Typography>
                    </Grid>
                    <Grid item xs={6} style={{paddingTop: '0px', paddingBottom: '0px'}}>
                            <Button
                                color="primary"
                                variant="contained"
                                classes={{
                                    containedSizeSmall: classes.mdopBtn
                                }}
                                size="small"
                                onClick={this.openMdopDialog}
                                disabled={!this.shouldMdopBtnShow(topologyNodes[ipv4])}
                            >
                                {this.t('mdopInformationBtn')}
                            </Button>
                    </Grid>
                    {this.createEth(hostname, sn)}
                </Grid>
            </Grid>
        );

        const radioGrid = (
            <Grid item xs={12} style={{marginTop: '4px'}} data-test-id={`${hostname}-${sn}-radioGrid`}>
                <Grid container spacing={2}>
                    <Grid item xs={12} style={{paddingBottom: '0px'}}>
                        <Typography variant="body2" classes={{root: classes.headerRoot}}>
                            {this.t('radioTitle')}
                        </Typography>
                    </Grid>
                    {this.createRadio(hostname, sn)}
                </Grid>
            </Grid>
        );

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
                />
                <MdopInfoOverviewDialog
                    open={this.state.mdopDialog.open}
                    closeFunc={this.closeMdopDialog}
                    nodeIp={ipv4}
                    nodeData={nodeData}
                    initEth={this.state.mdopDialog.initEth}
                />
                <div style={{padding: '20px 40px', overflowX: 'hidden'}} 
                    id={`${this.props.nodeData[this.props.nodes[0].ipv4].hostname}-${this.props.nodeData[this.props.nodes[0].ipv4].sn}`}
                >
                    <Grid container spacing={2}>
                        <Grid item xs={12}> 
                            <Grid container spacing={2} style={{height: '80px'}}>
                                {snGrid}
                                {modelGrid}
                                {neighborGrid}
                                {productImgGrid}
                            </Grid>
                        </Grid>
                        <Grid item xs={12} style={{paddingTop: '0px', marginBottom: '15px'}}>
                            <Grid container spacing={2}>
                                {fwVersionUptimeGrid}
                                {memoryGrid}
                            </Grid>
                        </Grid>
                        {ethernetGrid}
                        {radioGrid}
                    </Grid>
                    <P2Dialog
                        open={this.state.dialog.open}
                        handleClose={this.handleDialogOnClose}
                        title={this.state.dialog.title}
                        content={this.state.dialog.content}
                        actionTitle={this.state.dialog.submitButton}
                        actionFn={this.state.dialog.submitAction}
                    />
                </div>
            </MuiThemeProvider>
        );
    }
}

OverviewBox.propTypes = {
    nodes: PropTypes.arrayOf(
        PropTypes.shape({
            ipv4: PropTypes.string.isRequired,
            hostname: PropTypes.string.isRequired,
            model: PropTypes.string.isRequired,
            fwVersion: PropTypes.string.isRequired,
            mac: PropTypes.string.isRequired,
        })
    ).isRequired,
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    csrf: PropTypes.string.isRequired,
    close: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    tReady: PropTypes.bool.isRequired,
    nodeData: PropTypes.objectOf(
        PropTypes.shape({
            ethStatus: PropTypes.arrayOf(PropTypes.string).isRequired,
            cpuUsage: PropTypes.string.isRequired,
            ramUsage: PropTypes.shape({
                total: PropTypes.number,
                available: PropTypes.number,
            }).isRequired,
            firmwareVersion: PropTypes.string.isRequired,
            hostname: PropTypes.string.isRequired,
            mac: PropTypes.string.isRequired,
            model: PropTypes.string.isRequired,
            sn: PropTypes.string.isRequired,
            radioStatus: PropTypes.arrayOf(PropTypes.string).isRequired,
            uptime: PropTypes.number.isRequired,
        })
    ).isRequired,
    // nodeDataStatus: PropTypes.objectOf(PropTypes.string).isRequired,
    topologyNodes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

function mapStateToProps(store) {
    return {
        csrf: store.common.csrf,
        nodeData: store.meshTopology.nodeInfo,
        // nodeDataStatus: store.meshTopology.nodeInfo.successNode,
        topologyNodes: store.meshTopology.graph.nodes,
        mdopTable: store.meshTopology.graph.mdopTable,
    };
}
const mapDispatchToProps = {
    fetchEthLinkSegments,
};
export default compose(
    withTranslation(['node-overview']),
    connect(mapStateToProps, mapDispatchToProps),
    withStyles(styles)
)(OverviewBox);