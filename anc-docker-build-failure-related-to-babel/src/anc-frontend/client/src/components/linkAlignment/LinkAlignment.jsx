import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import {connect} from 'react-redux';
import moment from 'moment';
import Cookies from 'js-cookie';
// import {saveAs} from 'file-saver';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import ErrorIcon from '@material-ui/icons/Error';
import Card from '@material-ui/core/Card';
import Grid from '@material-ui/core/Grid';
import {withStyles} from '@material-ui/core/styles';
import DialogContent from '@material-ui/core/DialogContent';
import AppBar from '@material-ui/core/AppBar';
// import Collapse from '@material-ui/core/Collapse';
import Snackbar from '@material-ui/core/Snackbar';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import CloseIcon from '@material-ui/icons/ArrowBackIos';
import Checkbox from '@material-ui/core/Checkbox';
import {Select, MenuItem, ListItemText} from '@material-ui/core';
import {Transition} from 'react-transition-group';
import LinkAlignmentGraph from './LinkAlignmentGraph';
import CsvZipFactory from '../common/CsvZipFactory';
import LinkAlignmentToXLS from './LinkAlignmentXlsFactory';
import {insertZero} from '../../util/dateHandler';
import P2Dialog from '../common/P2Dialog';
import {
    toggleAlignmentDialog,
    handleRadioInfoRes,
    clearRadioInfoData,
    setRadio,
    radioInfoPolling,
    clearCurrentGraphData,
    setLinkAlignmentChartData,
    toggleSearch,
    toggleColumn,
    setFilter,
} from '../../redux/linkAlignment/linkAlignmentActions';
import {toggleSnackBar} from '../../redux/common/commonActions';
import {
    resumePolling,
    abortPolling,
} from '../../redux/pollingScheduler/pollingActions';
import {
    getClusterInformation,
    resetClusterInformation,
} from '../../redux/dashboard/dashboardActions';
import ConfigurationBox from '../topology/ConfigurationBox';
import SwipeableMenu from '../common/SwipeableMenu';
import LinkAlignmentTableComponent from './LinkAlignmentTableComponent';
import LinkAlignmentTableContainer from './LinkAlignmentTableContainer';
import LinkAlignmentFullScreen from './LinkAlignmentFullScreen';
import LinkAlignmentNodeInformation from './LinkAlignmentNodeInformation';
import AlignmentSettings from './AlignmentSettings';
import {linkAlignment} from '../../util/apiCall';
import Constant from '../../constants/common';
import {
    formatDate,
    get,
    iff,
    getStatus,
    startGraphDataChecker,
    stopGraphDataChecker,
    drawSelectItem,
} from './linkAlignmentHelperFunc';
import LinkAlignmentNodeDetail from './LinkAlignmentNodeDetail';
import {getOemNameOrAnm} from '../../util/common';
// import {linkAlignmentExportXLS} from '../../util/apiCall';
// import FormSelectCreator from '../../components/common/FormSelectCreator';

const {colors} = Constant;

const radioInfoApiCallRetriesLimit = 5;

// const wrapper = promise => (
//     promise
//         .then(data => ({data, error: null}))
//         .catch(error => ({error, data: null}))
// );

const collapseAni = {
    entering: {
        width: '0px',
    },
    entered: {
        width: '30%',
    },
    exiting: {
        width: '30%',
    },
    exited: {
        width: '0px',
    },
};
const expandAni = {
    entering: {
        width: 'calc(100% - 0.5vw)',
    },
    entered: {
        width: 'calc(70% - 0.5vw)',
    },
    exiting: {
        width: 'calc(70% - 0.5vw)',
    },
    exited: {
        width: 'calc(100% - 0.5vw)',
    },
};

class LinkAlignment extends React.Component {
    constructor(props) {
        super(props);
        this.t = this.props.t;
        this.radioInfoTimer = null;
        this.updateGraphTime = null;
        this.dotDotDotTimer = null;
        this.handleClose = this.handleClose.bind(this);
        this.handleFullDialogClose = this.handleFullDialogClose.bind(this);
        this.handleFullDialogOpen = this.handleFullDialogOpen.bind(this);
        this.handleSwipeableMenuOpen = this.handleSwipeableMenuOpen.bind(this);
        this.handleSwipeableMenuClose = this.handleSwipeableMenuClose.bind(this);
        this.setRadioInfoInterval = this.setRadioInfoInterval.bind(this);
        this.stopRadioInfoInterval = this.stopRadioInfoInterval.bind(this);
        this.startRadioInfoInterval = this.startRadioInfoInterval.bind(this);
        this.handleDataSourceChange = this.handleDataSourceChange.bind(this);
        this.handleThresholdLinesOption = this.handleThresholdLinesOption.bind(this);
        this.handleExport = this.handleExport.bind(this);
        this.handleDialogOnClose = this.handleDialogOnClose.bind(this);
        this.handleRadioInfoResErr = this.handleRadioInfoResErr.bind(this);
        this.exportCSV = this.exportCSV.bind(this);
        // this.exportXLS = this.exportXLS.bind(this);
        this.getDisplayData = this.getDisplayData.bind(this);
        this.setDotDotDotTimer = this.setDotDotDotTimer.bind(this);
        this.refreshNodeConfig = this.refreshNodeConfig.bind(this);
        this.getNodeConfiguration = this.getNodeConfiguration.bind(this);
        this.setCountryLabel = this.setCountryLabel.bind(this);
        this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
        this.bufferSize = 2;
        this.radioInfoApiCallRetries = 0;
        this.starting = false;
        this.hideShowNodeInfo = this.hideShowNodeInfo.bind(this);
        this.setUpThresholdLinesOption = this.setUpThresholdLinesOption.bind(this);
        this.updateDisplayThresholdLines = this.updateDisplayThresholdLines.bind(this);
        this.inputRef = React.createRef();
        this.state = {
            dialog: {
                open: false,
                handleClose: this.handleDialogOnClose,
                title: '',
                content: '',
                submitButton: 'OK',
                submitAction: this.handleDialogOnClose,
                cancelActTitle: '',
                cancelActFn: () => {},
            },
            // open: true,
            nodeInfo: this.props.graphNodeInfo[this.props.nodeIp],
            rssiFullDialog: {
                open: false,
            },
            swipeableMenu: {
                open: false,
            },
            initialRadioData: {},
            thresholdLines: {},
            rssiDataSource: {
                local: true,
                remote: true,
            },
            thresholdLinesOption: {},
            displayThresholdLines: [],
            thresholdLinesOptionDisable: {},
            // startTime: '',
            dotDotDot: 3,
            countryLabel: '-',
            hasCountryDiscrepancies: false,
            radioSelectMenu: {
                anchorEl: null,
            },
            width: window.innerWidth,
            height: window.innerHeight,
            accumData: {},
            nodeDetail: true,
            getConfigSuccess: false,
            loadingConfig: true,
        };
    }

    componentDidMount() {
        this.updateWindowDimensions();
        window.addEventListener('resize', this.updateWindowDimensions);
        this.props.resetClusterInformation();

        this.setUpThresholdLinesOption();
        this.getNodeConfiguration();

        // const {country, hasCountryDiscrepancies, getConfigFwversionFail} = this.props.clusterInformation;
        // let countryLabel = '-';
        // if (country.displayValue !== '-' && country.actualValue !== '' && !getConfigFwversionFail) {
        //     countryLabel = `${country.displayValue} (${country.actualValue.toUpperCase()})`;
        // }
    }

    componentWillReceiveProps(nextProps) {
        if (!window.__.isEqual(this.props.tempNodeConfig, nextProps.tempNodeConfig)) {
            this.refreshNodeConfig(nextProps);
            this.updateDisplayThresholdLines();
        }
        if (!window.__.isEqual(this.props.clusterInformation, nextProps.clusterInformation)) {
            this.setCountryLabel(nextProps.clusterInformation);
        }
        if (!window.__.isEqual(this.props.radioDevices, nextProps.radioDevices)) {
            this.updateDisplayThresholdLines(nextProps.radioDevices);
        }
        if (this.props.graphTime !== nextProps.graphTime) {
            const {accumData} = this.state;
            Object.keys(nextProps.graphRadioData).forEach((nodeIp) => {
                Object.keys(nextProps.graphRadioData[nodeIp]).forEach((radioDevice) => {
                    accumData[radioDevice] = accumData[radioDevice] || {};
                    Object.keys(nextProps.graphRadioData[nodeIp][radioDevice]).forEach((nei) => {
                        const dataPoint = nextProps.graphRadioData[nodeIp][radioDevice][nei]
                            .find(data => data.timestamp === nextProps.graphTime);
                        if (dataPoint) {
                            const localRssi = dataPoint.rssi.local;
                            const remoteRssi = dataPoint.rssi.remote;

                            accumData[radioDevice][nei] = accumData[radioDevice][nei] || {
                                counter: 0,
                                time: nextProps.graphTime,
                                local: {
                                    accum: 0,
                                    max: localRssi,
                                    min: localRssi,
                                    displayData: localRssi,
                                },
                                remote: {
                                    accum: 0,
                                    max: remoteRssi,
                                    min: remoteRssi,
                                    displayData: remoteRssi,
                                },
                            };
                            accumData[radioDevice][nei].counter += 1;
                            accumData[radioDevice][nei].local.accum += localRssi;
                            accumData[radioDevice][nei].local.display = localRssi;
                            if (accumData[radioDevice][nei].local.max < localRssi) {
                                accumData[radioDevice][nei].local.max = localRssi;
                            } else if (accumData[radioDevice][nei].local.min > localRssi) {
                                accumData[radioDevice][nei].local.min = localRssi;
                            }

                            accumData[radioDevice][nei].remote.accum += remoteRssi;
                            accumData[radioDevice][nei].remote.display = remoteRssi;
                            if (accumData[radioDevice][nei].remote.max < remoteRssi) {
                                accumData[radioDevice][nei].remote.max = remoteRssi;
                            } else if (accumData[radioDevice][nei].remote.min > remoteRssi) {
                                accumData[radioDevice][nei].remote.min = remoteRssi;
                            }
                        }
                    });
                });
            });
            this.setState({
                ...this.state,
                accumData,
            });
        }
    }

    componentWillUnmount() {
        this.props.resetClusterInformation();
        this.props.toggleSearch(true);
        this.props.toggleColumn('all');
        this.props.setFilter('all');
        window.removeEventListener('resize', this.updateWindowDimensions);
    }

    setUpThresholdLinesOption() {
        const thresholdLinesOption = {};
        const {nodeIp} = this.props;
        const {model} = this.props.graphNodeInfo[nodeIp];
        Object.keys(Constant.modelOption[model].radioSettings).forEach((radio) => {
            thresholdLinesOption[radio] = false;
        });
        this.setState({
            ...this.state,
            thresholdLinesOption,
        });
    }

    getNodeConfiguration() {
        const initialRadioData = {};
        const {thresholdLines} = this.state;
        const {nodeIp} = this.props;
        const thresholdLinesOptionDisable = {};
        const {model} = this.props.graphNodeInfo[nodeIp];
        const radioSettings = {
            [nodeIp]: {},
        };
        Object.keys(Constant.modelOption[model].radioSettings).forEach((radio) => {
            radioSettings[nodeIp][radio] = {};
            radioSettings[nodeIp][radio] = Constant.modelOption[model].radioSettings[radio];
        });
        let getConfigSuccess = false;
        this.setState({...this.state, loadingConfig: true});
        this.props.getClusterInformation(radioSettings, nodeIp).then((data) => {
            if (nodeIp && data) {
                Object.keys(data.config.radioSettings[nodeIp]).forEach((radio) => {
                    try {
                        const {
                            band, channel, centralFreq, channelBandwidth, txpower,
                            rssiFilterLower, rssiFilterUpper,
                        } = data.config.radioSettings[nodeIp][radio];
                        thresholdLines[radio] = {};
                        thresholdLines[radio].rssiFilterLower = rssiFilterLower;
                        thresholdLines[radio].rssiFilterUpper = rssiFilterUpper;
                        let dataOptions = {};
                        switch (data.type) {
                            case 'success': dataOptions = data.options.radioSettings[nodeIp][radio]; break;
                            case 'partialretrieve': dataOptions = data.options.radioSettings.data[nodeIp][radio]; break;
                            default: dataOptions = null; break;
                        }
                        // const dataOptions = data.type === 'success' ? data.options.radioSettings[nodeIp][radio] :
                        //     data.options.radioSettings.data[nodeIp][radio];
                        if (dataOptions) {
                            thresholdLinesOptionDisable[radio] = dataOptions.rssiFilterLower.type === 'mixed';
                            const channelData = dataOptions
                            .channel.type !== 'invalid' ? dataOptions.channel.data.filter(ch =>
                                    ch.actualValue === channel) : [{displayValue: '-'}];
                            const centralFreqData = dataOptions
                            .centralFreq.type !== 'invalid' ? dataOptions
                                .centralFreq.data.filter(ch => ch.actualValue === centralFreq) : [{displayValue: '-'}];
                            const channelBandwidthData = dataOptions
                            .channelBandwidth.type !== 'invalid' ? dataOptions
                                .channelBandwidth.data.filter(ch => ch.actualValue === channelBandwidth)
                                : [{displayValue: '-'}];
                            const txpowerData = dataOptions
                            .txpower.type !== 'invalid' ? dataOptions
                                .txpower.data.filter(ch => ch.actualValue === txpower) : [{displayValue: '-'}];
                            initialRadioData[radio] = {
                                band,
                                channel: band === '5' ? channelData[0].displayValue : centralFreqData[0].displayValue,
                                channelBandwidth: channelBandwidthData[0].displayValue,
                                txpower: txpowerData[0].displayValue,
                            };
                            getConfigSuccess = true;
                        }
                    } catch (e) {
                        console.log('Invalid get-filtered-config options : ', e);
                    }
                });
            }
            this.setState({
                ...this.state,
                initialRadioData,
                thresholdLines,
                thresholdLinesOptionDisable,
                getConfigSuccess,
                loadingConfig: false,
            }, this.updateDisplayThresholdLines);
        });
    }

    setCountryLabel(clusterInformation) {
        const {country, hasCountryDiscrepancies, getConfigFwversionFail} = clusterInformation;
        let countryLabel = '-';
        if (country.displayValue !== '-' && country.actualValue !== '' && !getConfigFwversionFail) {
            countryLabel = `${country.displayValue} (${country.actualValue.toUpperCase()})`;
        }
        this.setState({
            ...this.state,
            countryLabel,
            hasCountryDiscrepancies,
        });
    }

    setRadioInfoInterval() {
        this.starting = false;
        // this.startRadioInfoInterval();
        this.radioInfoTimer = setInterval(() => {
            const temp = {};
            temp[this.props.nodeIp] = {
                interval: 1,
                enableRemote: false,
            };
            const projectId = Cookies.get('projectId');
            linkAlignment(this.props.csrf, projectId, {targets: temp}).then((res) => {
                this.props.handleRadioInfoRes(res);
            }).catch(e => this.props.handleRadioInfoRes(e));
        }, 10000);
        startGraphDataChecker(this.bufferSize);
    }

    setDotDotDotTimer() {
        if (this.dotDotDotTimer === null) {
            this.dotDotDotTimer = setInterval(() => {
                this.setState({
                    ...this.state,
                    dotDotDot: (this.state.dotDotDot + 1) % 4,
                });
            }, 500);
        }
    }

    getDisplayData(graphRadioData, nodeIp, data, focusedLink) {
        const returnData = {
            local: {
                rssi: '-',
                avg: '-',
                min: '-',
                max: '-',
            },
            remote: {
                rssi: '-',
                avg: '-',
                min: '-',
                max: '-',
            },
        };
        if (!data) return returnData;

        const radioDevice = data.radio;
        if (focusedLink.length > 0 && graphRadioData[nodeIp] && graphRadioData[nodeIp][radioDevice] &&
            graphRadioData[nodeIp][radioDevice][focusedLink[0].nodeIp]) {
            if (this.state.accumData[radioDevice] && this.state.accumData[radioDevice][focusedLink[0].nodeIp]) {
                const accumData = this.state.accumData[radioDevice][focusedLink[0].nodeIp];
                returnData.local.max = accumData.local.max.toString();
                returnData.local.min = accumData.local.min.toString();
                returnData.local.avg = (accumData.local.accum / accumData.counter).toFixed(0).toString();
                returnData.local.rssi = accumData.local.display.toString();

                returnData.remote.max = accumData.remote.max.toString();
                returnData.remote.min = accumData.remote.min.toString();
                returnData.remote.avg = (accumData.remote.accum / accumData.counter).toFixed(0).toString();
                returnData.remote.rssi = accumData.remote.display.toString();
            }
        }

        return returnData;
    }

    updateWindowDimensions() {
        this.setState({
            ...this.state,
            width: window.innerWidth,
            height: window.innerHeight,
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

    exportCSV() {
        const {
            nodeIp, radioDevices, radioDataArr,
            graphRadioData, graphNodeInfo, projectIdToNameMap
        } = this.props;
        const {nodeInfo: {hostname, mac}} = this.state;
        let radioNeighbor = [];
        try {
            const linkAlignmentCsvFactory = new CsvZipFactory();
            const projectId = Cookies.get('projectId');
            const projectName = projectIdToNameMap[projectId];
            const nwManifestName = typeof window.nw !== 'undefined' ? window.nw.App.manifest.window.title : undefined;
            const namePrefix = getOemNameOrAnm(nwManifestName);
            const currentTime = moment().format('YYYY-MM-DD-hh-mm-ss');

            const zipName = `${namePrefix}_${projectName}_${hostname}_link-alignment_${currentTime}.zip`;
            const template = (data) => {
                const {
                    history, neighbor, linkAlignmentHostname, linkAlignmentMac,
                    radio, neighborMac,
                } = data;
                let csv = '';
                const neighborHostname = get(graphNodeInfo, [neighbor]) ?
                    graphNodeInfo[neighbor].hostname : '-';
                const neighborModel = get(graphNodeInfo, [neighbor]) ?
                    graphNodeInfo[neighbor].model : '-';
                const createTime = (date) => {
                    const newDate = new Date(date.getTime());
                    const hour = insertZero(newDate.getHours());
                    const minute = insertZero(newDate.getMinutes());
                    const second = insertZero(newDate.getSeconds());
                    const time = `${hour}:${minute}:${second}`;
                    return time;
                };
                const checkRssiChain = (rssiChain) => {
                    if (typeof rssiChain === 'number' && rssiChain !== 0) {
                        return rssiChain.toString();
                    }
                    return '-';
                };
                csv += linkAlignmentCsvFactory
                    .createLine([`Alignment Result (${linkAlignmentMac} <> ${neighborMac})`]);
                csv += linkAlignmentCsvFactory
                    .createLine(['Hostname', linkAlignmentHostname]);
                csv += linkAlignmentCsvFactory
                    .createLine(['MAC', linkAlignmentMac]);
                csv += linkAlignmentCsvFactory
                    .createLine(['Alignment Radio', `Radio ${radio.replace('radio', '')}`]);
                csv += linkAlignmentCsvFactory
                    .createLine(['Neighbor Hostname', neighborHostname]);
                csv += linkAlignmentCsvFactory
                    .createLine(['Neighbor MAC', neighborMac]);
                csv += linkAlignmentCsvFactory
                    .createLine(['Neighbor Model', neighborModel]);
                csv += linkAlignmentCsvFactory.createLine([]);
                csv += linkAlignmentCsvFactory
                    .createLine(['Captured Time', '"RSSI (Local), dBm"', '"Data Rate (Local), Mbps"',
                        '"RSSI (Remote), dBm"', '"Data Rate (Remote), Mbps"',
                        '"RSSI Chain 0, dBm"',
                        '"RSSI Chain 1, dBm"']);
                history[neighbor]
                    .map(res => ([
                        createTime(new Date(res.timestamp)),
                        res.rssi.local,
                        res.bitrate.local / 1000000,
                        res.rssi.remote,
                        res.bitrate.remote / 1000000,
                        checkRssiChain(res.chainData.rssiChain0),
                        checkRssiChain(res.chainData.rssiChain1)
                    ]))
                    .forEach((line) => {
                        csv += linkAlignmentCsvFactory.createLine(line);
                    });
                return csv;
            };
            const addTemplateErr = linkAlignmentCsvFactory.addTemplate('linkAlignmentCsv', template);
            if (addTemplateErr.status) {
                throw new Error(addTemplateErr.msg);
            }
            radioDevices.forEach((radio) => {
                radioNeighbor = Object.keys(graphRadioData[nodeIp][radio]);
                radioNeighbor.forEach((radioNeighborNodeIp) => {
                    let neighborMac = '';
                    radioDataArr.some((timeResponse) => {
                        if (get(timeResponse, [nodeIp, radio,
                            'radioNeighbors', radioNeighborNodeIp, 'mac'])) {
                            neighborMac = get(timeResponse,
                                [nodeIp, radio, 'radioNeighbors', radioNeighborNodeIp, 'mac']);
                            return true;
                        }
                        return false;
                    });
                    const csvName =
                        `${hostname}-${radio}-link-alignment-result-with-${neighborMac.split(':').join('-')}.csv`;
                    const csvErr = linkAlignmentCsvFactory.createCsv(csvName, 'linkAlignmentCsv', {
                        history: graphRadioData[nodeIp][radio],
                        neighbor: radioNeighborNodeIp,
                        linkAlignmentHostname: hostname,
                        linkAlignmentMac: mac,
                        radio,
                        neighborMac,
                    });
                    if (csvErr.status) {
                        throw new Error(csvErr.msg);
                    }
                });
            });
            const createZipErr = linkAlignmentCsvFactory.createZip(zipName);
            if (createZipErr.status) {
                throw new Error(createZipErr.msg);
            }
            linkAlignmentCsvFactory.csvArray.forEach((csv) => {
                const addZipErr = linkAlignmentCsvFactory.addCsvToZip(zipName, csv.csvName);
                if (addZipErr.status) {
                    throw new Error(addZipErr.msg);
                }
            });
            const exportZipErr = linkAlignmentCsvFactory.exportZip(zipName, () => {
                this.props.toggleSnackBar(this.t('downloadCompleted'));
            });
            if (exportZipErr.status) {
                throw new Error(exportZipErr.msg);
            }
        } catch (err) {
            // console.log('kyle_debug: LinkAlignmentTableContainer -> exportCSV -> err', err.message);
        }
    }

    // async exportXLS(linkAlignmentData) {
    //     const {nodeInfo: {hostname}} = linkAlignmentData;
    //     const createDate = formatDate(new Date());
    //     const {error, data} = await wrapper(linkAlignmentExportXLS(this.props.csrf, linkAlignmentData));
    //     if (error) {
    //         console.log('kyle_debug: exportXLS -> error', error);
    //         return;
    //     }
    //     saveAs(data, `${hostname}-link-alignment-result-${createDate}.xlsx`);
    // }

    handleExport() {
        const {
            nodeIp, radioDevices, radioDataArr, graphRadioData, graphNodeInfo, projectIdToNameMap
        } = this.props;
        const {nodeInfo: {hostname, mac}} = this.state;
        // radioDataArr.forEach((resByTime) => {
        //     const radioNeighborObj = get(resByTime, [nodeIp, radioDevice, 'radioNeighbors']) || {};
        //     const radioNeighbourListArray = Object.keys(radioNeighborObj);
        //     radioNeighbor = [...new Set([...radioNeighbor, ...radioNeighbourListArray])];
        // });
        // console.log('kyle_debug: LinkAlignmentTableContainer -> handleExport -> hostname', hostname);
        // console.log('kyle_debug: LinkAlignmentTableContainer -> handleExport -> mac', mac);
        const linkAlignmentData = {
            nodeIp,
            radioDevices,
            nodeInfo: {hostname, mac},
            radioDataArr,
            graphRadioData,
            graphNodeInfo,
            projectIdToNameMap
        };
        console.log('kyle_debug: LinkAlignment -> handleExport -> linkAlignmentData', linkAlignmentData);

        this.setState({
            ...this.state,
            dialog: {
                ...this.state.dialog,
                open: true,
                title: <div>
                    <Typography
                        style={{
                            color: Constant.colors.dataTxt,
                            fontSize: '27px',
                        }}
                    >
                        {this.t('exportDialogTitle')}
                    </Typography>
                    <Typography
                        style={{
                            color: Constant.colors.tagTxt,
                            fontSize: '18px',
                        }}
                    >
                        {this.t('exportDialogSubtitle')}
                    </Typography>
                </div>,
                content: <span style={{display: 'flex', justifyContent: 'space-evenly'}}>
                    <IconButton
                        onClick={this.exportCSV}
                    >
                        <img
                            src="/img/csv.png"
                            alt="export-to-csv"
                            width="80px"
                            height="80px"
                        />
                    </IconButton>
                    {/* <IconButton
                        onClick={() => this.exportXLS(linkAlignmentData)}
                    >
                        <img
                            src="img/xls.png"
                            alt="export-to-xls"
                            width="80px"
                            height="80px"
                        />
                    </IconButton> */}
                    <LinkAlignmentToXLS
                        downloadBtn={
                            <IconButton>
                                <img
                                    src="/img/xls.png"
                                    alt="export-to-xls"
                                    width="80px"
                                    height="80px"
                                />
                            </IconButton>
                        }
                        data={linkAlignmentData}
                    />
                </span>,
                submitButton: this.t('cancelBtn'),
                cancelActTitle: '',
                cancelActFn: () => {},
            },
        });
    }

    stopRadioInfoInterval() {
        stopGraphDataChecker();
        this.starting = false;
        this.props.radioInfoPolling(false);
        // this.props.pollingHandler.restartInterval();
        clearInterval(this.radioInfoTimer);
        clearInterval(this.updateGraphTime);
        clearInterval(this.dotDotDotTimer);
        this.dotDotDotTimer = null;
    }

    startRadioInfoInterval() {
        this.starting = true;
        // this.props.pollingHandler.stopInterval();
        const temp = {};
        this.radioInfoApiCallRetries += 1;
        temp[this.props.nodeIp] = {
            interval: 1,
            enableRemote: false,
        };
        this.setDotDotDotTimer();
        this.setState({
            ...this.state,
            accumData: {},
        }, () => {
            const projectId = Cookies.get('projectId');
            linkAlignment(this.props.csrf, projectId, {targets: temp}).then((res) => {
                this.props.handleRadioInfoRes({success: true, data: res});
                this.starting = false;
                this.props.radioInfoPolling(true);
                this.setRadioInfoInterval();
            }).catch((e) => {
                if (e.data.type === 'specific' && e.data.data[this.props.nodeIp] &&
                    e.data.data[this.props.nodeIp].specific) {
                    this.props.handleRadioInfoRes(e);
                    this.starting = false;
                    this.radioInfoApiCallRetries = 0;
                    this.props.radioInfoPolling(true);
                    this.setRadioInfoInterval();
                } else if (this.radioInfoApiCallRetries <= radioInfoApiCallRetriesLimit) {
                    this.startRadioInfoInterval();
                } else {
                    this.radioInfoApiCallRetries = 0;
                    this.starting = false;
                    this.props.radioInfoPolling(false);
                    this.handleRadioInfoResErr();
                }
            });
        });
    }

    handleRadioInfoResErr() {
        this.setState({
            ...this.state,
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('radioInfoResErrTitle'),
                content: this.t('radioInfoResErrContent'),
                cancelActTitle: this.t('cancelBtn'),
                cancelActFn: () => {
                    // this.props.pollingHandler.restartInterval();
                    this.handleDialogOnClose();
                },
                submitButton: this.t('retry'),
                submitAction: () => {
                    this.handleDialogOnClose();
                    this.startRadioInfoInterval();
                },
            },
        });
    }

    handleClose() {
        this.props.clearRadioInfoData();
        this.props.toggleAlignmentDialog(false, '', true);
        this.props.setRadio(['radio0']);
        this.stopRadioInfoInterval();
        this.setState({
            ...this.state,
            swipeableMenu: {
                open: false,
            },
        });
    }

    handleFullDialogClose() {
        this.setState({
            ...this.state,
            rssiFullDialog: {
                open: false,
            },
        });
    }

    handleFullDialogOpen() {
        this.setState({
            ...this.state,
            rssiFullDialog: {
                open: true,
            },
        });
    }

    handleSwipeableMenuClose() {
        if (this.props.configProcessing) return;
        this.setState({
            ...this.state,
            swipeableMenu: {
                open: false,
            },
        });
    }

    handleSwipeableMenuOpen() {
        this.setState({
            ...this.state,
            swipeableMenu: {
                open: true,
            },
        });
    }

    handleDataSourceChange(e) {
        this.setState({
            ...this.state,
            rssiDataSource: {
                ...this.state.rssiDataSource,
                [e.target.value[1]]: !this.state.rssiDataSource[e.target.value[1]],
            },
        });
    }

    handleThresholdLinesOption(e) {
        this.setState({
            ...this.state,
            thresholdLinesOption: {
                ...this.state.thresholdLinesOption,
                [e.target.value[1]]: !this.state.thresholdLinesOption[e.target.value[1]],
            },
        }, this.updateDisplayThresholdLines);
    }

    refreshNodeConfig(props) {
        try {
            const initialRadioData = {};
            const {tempNodeConfig, nodeIp} = props;
            if (tempNodeConfig[nodeIp]) {
                const {open} = tempNodeConfig[nodeIp];
                const {radioSettings} = tempNodeConfig[nodeIp].config;
                const {thresholdLines} = this.state;
                const options = tempNodeConfig[nodeIp].filteredConfig.radioSettings[nodeIp];
                Object.keys(radioSettings).forEach((radio) => {
                    const {
                        band, channel, centralFreq, channelBandwidth, txpower,
                        rssiFilterLower, rssiFilterUpper,
                    } = radioSettings[radio];

                    thresholdLines[radio] = {};
                    thresholdLines[radio].rssiFilterLower = rssiFilterLower;
                    thresholdLines[radio].rssiFilterUpper = rssiFilterUpper;
                    const channelData = options[radio].channel.data.filter(ch =>
                        ch.actualValue === channel);
                    const centralFreqData = options[radio].centralFreq.data.filter(ch =>
                        ch.actualValue === centralFreq);
                    const channelBandwidthData = options[radio].channelBandwidth.data.filter(ch =>
                        ch.actualValue === channelBandwidth);
                    const txpowerData = options[radio].txpower.data.filter(ch => ch.actualValue === txpower);
                    initialRadioData[radio] = {
                        band,
                        channel: band === '5' ? channelData[0].displayValue : centralFreqData[0].displayValue,
                        channelBandwidth: channelBandwidthData[0].displayValue,
                        txpower: txpowerData[0].displayValue,
                    };
                });
                this.setState({
                    ...this.state,
                    swipeableMenu: {
                        open,
                    },
                }, () => {
                    this.setState({
                        ...this.state,
                        initialRadioData,
                    });
                });
            }
        } catch (err) {
            console.log('Invalid options!', err);
        }
    }

    hideShowNodeInfo() {
        this.setState({
            ...this.state,
            nodeDetail: !this.state.nodeDetail,
        });
    }

    /*
        lines example:
        lines: [
            {
                value: -34,
                radio: 'radio0'
                displayRadio: t(radio)
            }
        ]
    */
    updateDisplayThresholdLines() {
        const {nodeIp, graphNodeInfo} = this.props;
        const {model} = graphNodeInfo[nodeIp];
        const allRadio = Constant.modelOption[model].radioSettings;
        const {
            thresholdLines,
            thresholdLinesOption,
        } = this.state;
        const displayThresholdLines = [];
        Object.keys(allRadio).forEach((radio) => {
            if (!thresholdLines[radio]) return;
            const {rssiFilterUpper, rssiFilterLower} = thresholdLines[radio];
            if (thresholdLinesOption[radio]) {
                displayThresholdLines.push({
                    radio,
                    displayRadio: this.t(radio),
                    value: rssiFilterUpper === 255 ? 0 : rssiFilterUpper,
                    levelOffset: 0,
                    show: true,
                });
                displayThresholdLines.push({
                    radio,
                    displayRadio: this.t(radio),
                    value: rssiFilterLower === 255 ? -95 : rssiFilterLower,
                    levelOffset: 0,
                    show: true,
                });
            }
        });
        this.setState({
            ...this.state,
            displayThresholdLines,
        });
    }

    render() {
        const {
            classes,
            nodeIp,
            graphNodeInfo,
            graphRadioData,
            graphLinkInfo,
            radioDataArr,
            selectedLink,
            focusedLink,
            radioDevices,
            isPolling,
        } = this.props;
        const {
            initialRadioData,
            thresholdLinesOption,
            displayThresholdLines,
            thresholdLinesOptionDisable,
        } = this.state;
        const {model} = graphNodeInfo[nodeIp];
        const allRadio = Constant.modelOption[model].radioSettings;
        const focusedLinkData = selectedLink.find(e => e.linkId === focusedLink[0].linkId);
        // const displayData = this.getDisplayData(graphRadioData, nodeIp, radioDevice, focusedLink);
        const displayData = this.getDisplayData(graphRadioData, nodeIp, focusedLinkData, focusedLink);
        const localNodeColor = focusedLinkData ? focusedLinkData.colors.local : '#425581';
        const remoteNodeColor = focusedLinkData ? focusedLinkData.colors.remote : '#DE357C';
        const shouldShowLocalData = displayData.local.rssi !== '-';
        const shouldShowRemoteData = displayData.remote.rssi !== '-';
        const neiData = focusedLink.length > 0 && graphNodeInfo[focusedLink[0].nodeIp] ?
            graphNodeInfo[focusedLink[0].nodeIp] : undefined;
        const linkData = focusedLink.length > 0 && graphLinkInfo[focusedLink[0].linkId] ?
            graphLinkInfo[focusedLink[0].linkId] : undefined;

        const displayFrq = linkData && focusedLink.length > 0 ?
            iff(linkData.info.channel === '4.9', linkData.info.frequency.replace('MHz', ' MHz'),
                `CH ${linkData.info.channel} (${linkData.info.frequency.replace('MHz', ' MHz')})`
            ) : '-';

        const started = isPolling || this.starting;
        const status = getStatus(isPolling, this.starting, this.state.dotDotDot, this.t);

        // Set device information
        const radioOptions = [];
        if (nodeIp) {
            const modelTemp = graphNodeInfo[nodeIp].model;
            const isZ500OrX10Series = modelTemp.match(/^[X][1]/g) || modelTemp.match(/^[Z][5][0][0]/g);
            Object.keys(Constant.modelOption[modelTemp]
                .radioSettings).forEach((radio, index) => {
                    radioOptions[index] = (
                        <MenuItem
                            key={radio}
                            value={radio}
                            disabled={isZ500OrX10Series && radio === 'radio0'}
                        >
                            <Checkbox checked={radioDevices.indexOf(radio) > -1} />
                            <ListItemText
                                primary={`${this.t('menuItemLabel', {returnObjects: true})[radio]} ${isZ500OrX10Series && radio === 'radio0' ?
                                    `(${this.t('isZ500OrX10Series')})` : ''}`}
                            />
                            {/* {this.t('menuItemLabel', {returnObjects: true})[radio]} */}
                        </MenuItem>
                    );
                });
        }
        let channel = '-';
        let channelBandwidth = '-';
        let txpower = '-';
        const deviceInfo = [];
        // if (radioDataArr.length > 0 && nodeIp && latestRadioData[nodeIp]) {
        //     ({channel, channelBandwidth, txpower} = latestRadioData[nodeIp][radioDevice]);
        // } else if (initialRadioData) {
        if (initialRadioData) {
            radioDevices.forEach((radio) => {
                if (initialRadioData[radio]) {
                    channel = '-';
                    channelBandwidth = '-';
                    txpower = '-';
                    ({channel} = initialRadioData[radio]);
                    channelBandwidth = `${initialRadioData[radio].channelBandwidth}`;
                    txpower = `${initialRadioData[radio].txpower}`;
                    deviceInfo.push({
                        info: `${this.t('channel-freq')}: ${channel} |
                        ${this.t('bandwidth')}: ${channelBandwidth} | ${this.t('txpower')}: ${txpower}`,
                        radio,
                    });
                }
            });
        } else {
            deviceInfo.push({
                info: `${this.t('channel-freq')}: ${channel} |
                ${this.t('bandwidth')}: ${channelBandwidth} | ${this.t('txpower')}: ${txpower}`,
                radio: '-',
            });
        }

        let radioNeighbor = [];
        radioDataArr.forEach((resByTime) => {
            radioDevices.forEach((radio) => {
                const radioNeighborObj = get(resByTime, [nodeIp, radio, 'radioNeighbors']) || {};
                const radioNeighbourListArray = Object.keys(radioNeighborObj);
                radioNeighbor = [...new Set([...radioNeighbor, ...radioNeighbourListArray])];
            });
        });

        const componentsWidth = window.innerWidth - 48 - 40 - 40;

        // const {getConfigSuccess, loadingConfig} = this.state;
        // console.log('kyle_debug: LinkAlignment -> render -> loadingConfig', loadingConfig);
        // console.log('kyle_debug: LinkAlignment -> render -> getConfigSuccess', getConfigSuccess);

        return (
            <>
                <AppBar className={classes.appBar} position="fixed" >
                    <Toolbar>
                        <IconButton
                            edge="start"
                            color="inherit"
                            onClick={this.handleClose}
                            aria-label="close"
                        >
                            <CloseIcon />
                        </IconButton>
                        <Typography variant="h6" className={classes.title}>
                            {this.state.nodeInfo ? this.state.nodeInfo.hostname : '-'} - {this.t('linkAlignmentTitle')}
                        </Typography>
                    </Toolbar>
                </AppBar>
                <SwipeableMenu
                    open={this.state.swipeableMenu.open}
                    handleMenuOnClose={this.handleSwipeableMenuClose}
                    content={
                        <ConfigurationBox
                            disableEthernetConfig
                            nodes={[{
                                fwVersion: this.state.nodeInfo ? this.state.nodeInfo.firmwareVersion : '',
                                hostname: this.state.nodeInfo ? this.state.nodeInfo.hostname : '',
                                ipv4: this.props.nodeIp,
                                model: this.state.nodeInfo ? this.state.nodeInfo.model : '',
                                mac: this.state.nodeInfo ? this.state.nodeInfo.mac : '',
                            }]}
                            close={this.handleSwipeableMenuClose}
                            pollingHandler={{
                                restartInterval: () => {},
                                stopInterval: () => {},
                            }}
                        />
                    }
                    title={this.t('configurationTitle')}
                    disableClose={this.props.configProcessing}
                />
                <DialogContent className={classes.wrapper}>
                    <Card classes={{root: classes.cardWrapper}} >
                        <Card
                            classes={{root: classes.detailWrapper}}
                            elevation={0}
                        >
                            <Grid
                                container
                                style={
                                    {
                                        display: 'flex',
                                        flex: 1,
                                        height: '100%',
                                        position: 'relative',
                                    }
                                }
                            >
                                {/* {true &&
                                    <span style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        borderRadius: '3px',
                                        backgroundColor: colors.warningBackground,
                                        padding: '5px 10px',
                                        position: 'absolute',
                                        left: '50%',
                                        transform: 'translate(-50%, 0%)',
                                    }}
                                    >
                                        <i
                                            className="material-icons"
                                            style={{
                                                fontSize: '25px',
                                                paddingRight: '16px',
                                                color: colors.warningColor,
                                            }}
                                        >error_outline</i>
                                        <span style={{fontSize: 14, lineHeight: '140%'}}>
                                            <Interpolate
                                                i18nKey={warningContentKey}
                                                useDangerouslySetInnerHTML
                                            />
                                        </span>
                                        <Typography
                                            style={{
                                                fontSize: 14,
                                                lineHeight: '140%',
                                                color: colors.warningColor,
                                            }}
                                        >
                                            <b>
                                                Failed to retrieve node configuration,
                                                please click “RELOAD” to retrieve again
                                            </b>
                                        </Typography>
                                        <Button style={{color: colors.warningColor, marginLeft: 20}}>
                                            RELOAD
                                        </Button>
                                    </span>

                                } */}
                                <LinkAlignmentNodeInformation
                                    graphNodeInfo={graphNodeInfo}
                                    nodeIp={nodeIp}
                                    hasCountryDiscrepancies={this.state.hasCountryDiscrepancies}
                                    width={this.state.width}
                                    countryLabel={this.state.countryLabel}
                                />
                                <AlignmentSettings
                                    radioDevice={radioDevices}
                                    radioOptions={radioOptions}
                                    deviceInfo={deviceInfo}
                                    isPolling={isPolling}
                                    starting={this.starting}
                                    radioNeighbor={radioNeighbor}
                                    setRadio={this.props.setRadio}
                                    clearCurrentGraphData={this.props.clearCurrentGraphData}
                                    handleSwipeableMenuOpen={this.handleSwipeableMenuOpen}
                                    startRadioInfoInterval={this.startRadioInfoInterval}
                                    stopRadioInfoInterval={this.stopRadioInfoInterval}
                                    handleExport={this.handleExport}
                                    disableAdjustConfig={this.state.loadingConfig}
                                    width={this.state.width}
                                />
                            </Grid>
                        </Card>
                        <P2Dialog
                            open={this.state.dialog.open}
                            handleClose={this.state.dialog.handleClose}
                            title={this.state.dialog.title}
                            content={this.state.dialog.content}
                            cancelActFn={this.state.dialog.cancelActFn}
                            cancelActTitle={this.state.dialog.cancelActTitle}
                            actionTitle={this.state.dialog.submitButton}
                            actionFn={this.state.dialog.submitAction}
                        />
                        <Card
                            classes={{
                                root: this.props.filterKey === 'all' ?
                                    this.props.classes.neiTableWrapper :
                                    this.props.classes.neiTableWrapperFlex,
                            }}
                            elevation={0}
                        >
                            <LinkAlignmentTableContainer
                                importRadioData={this.state.initialRadioData}
                                currentTime={this.props.graphTime}
                                neighborData={neiData}
                            >
                                {({
                                    neighborTableBar,
                                    neighborTableData,
                                    dialog,
                                    style,
                                }) =>
                                    (<LinkAlignmentTableComponent
                                        neighborTableBar={neighborTableBar}
                                        neighborTableData={neighborTableData}
                                        style={style}
                                        dialog={dialog}
                                    />)
                                }
                            </LinkAlignmentTableContainer>
                        </Card>
                        <Typography
                            variant="h6"
                            style={{
                                textDecorationLine: 'underline',
                                color: 'rgba(33, 33, 33, 0.785)',
                                marginLeft: '20px',
                            }}
                        >
                            {this.t('remoteNodeInfo')}
                        </Typography>
                        <Card
                            classes={{root: classes.rssiWrapper}}
                            elevation={0}
                        >
                            <Transition
                                in={this.state.nodeDetail}
                                timeout={0}
                            >
                                {state => (
                                    <div style={{width: '100%', display: 'flex', height: '631px'}}>
                                        <Card
                                            classes={{root: classes.rssiNodeDetailWrapp}}
                                            elevation={0}
                                            style={{
                                                transition: 'width 250ms ease-in-out',
                                                ...collapseAni[state],
                                            }}
                                        >
                                            <div style={{width: componentsWidth * 0.3}}>
                                                <LinkAlignmentNodeDetail
                                                    t={this.t}
                                                    openFullPage={this.handleFullDialogOpen}
                                                    openSwipeableMenu={this.handleSwipeableMenuOpen}
                                                    stopRadioInfoInterval={this.stopRadioInfoInterval}
                                                    startRadioInfoInterval={() => {
                                                        this.props.clearCurrentGraphData();
                                                        this.startRadioInfoInterval();
                                                    }}
                                                    stateTitle={status}
                                                    focusedLink={focusedLink}
                                                    neiData={neiData || {}}
                                                    displayData={displayData}
                                                    shouldShowLocalData={shouldShowLocalData}
                                                    shouldShowRemoteData={shouldShowRemoteData}
                                                    localNodeColor={localNodeColor}
                                                    remoteNodeColor={remoteNodeColor}
                                                    displayFrq={displayFrq}
                                                    isPolling={isPolling}
                                                    starting={this.starting}
                                                    linkData={linkData || {}}
                                                    graphNodeInfo={graphNodeInfo}
                                                    disableAdjustConfig={this.state.loadingConfig}
                                                />
                                            </div>
                                        </Card>
                                        <Tooltip
                                            id="expand"
                                            title={this.state.nodeDetail ? this.t('collapse') : this.t('expand')}
                                            placement="left"
                                        >
                                            <Button
                                                disableRipple
                                                variant="contained"
                                                color="primary"
                                                className={classes.hideBtn}
                                                onClick={this.hideShowNodeInfo}
                                                classes={{root: classes.hideBtnRoot}}
                                                style={{
                                                    borderRadius: this.state.nodeDetail ?
                                                        '8px 0 0 8px' : '0 8px 8px 0',
                                                }}
                                            >
                                                {this.state.nodeDetail ?
                                                    <KeyboardArrowLeft /> : <KeyboardArrowRight />}
                                            </Button>
                                        </Tooltip>
                                        <Card
                                            classes={{root: classes.rssiChartWrapp}}
                                            elevation={0}
                                            style={{
                                                transition: 'width 250ms ease-in-out',
                                                ...expandAni[state],
                                            }}
                                        >
                                            <div style={{width: '100%'}}>
                                                <div style={{display: 'flex', float: 'right'}}>
                                                    {this.state.getConfigSuccess ? (
                                                        <Select
                                                            style={{
                                                                zIndex: 2,
                                                                marginRight: '20px',
                                                            }}
                                                            multiple
                                                            value={['']}
                                                            renderValue={() => this.t('thresholdLinesOption')}
                                                            onChange={this.handleThresholdLinesOption}
                                                        >
                                                            {Object.keys(allRadio).map((radio) => {
                                                                if (!thresholdLinesOptionDisable[radio]) {
                                                                    return null;
                                                                }
                                                                return drawSelectItem(radio,
                                                                    thresholdLinesOption[radio], this.t(radio));
                                                            })}
                                                        </Select>
                                                    ) : (
                                                        <Tooltip
                                                            id="warning-no-config"
                                                            placement="top"
                                                            title={this.t('failedGetConfigTitle')}
                                                        >
                                                            <div style={{margin: '4px 10px 0 0'}}>
                                                                <ErrorIcon style={{color: '#FF0000'}} />
                                                            </div>
                                                        </Tooltip>
                                                    )}
                                                    <Select
                                                        style={{
                                                            zIndex: 2,
                                                            marginRight: '20px',
                                                        }}
                                                        multiple
                                                        value={['']}
                                                        renderValue={() => this.t('dataSource')}
                                                        onChange={this.handleDataSourceChange}
                                                    >
                                                        {Object.keys(this.state.rssiDataSource).map(source =>
                                                            drawSelectItem(source,
                                                                this.state.rssiDataSource[source],
                                                                this.t(`${source}Source`)))}
                                                    </Select>
                                                </div>
                                                <LinkAlignmentGraph
                                                    dataSource={this.state.rssiDataSource}
                                                    mac={this.state.nodeInfo ? this.state.nodeInfo.mac : ''}
                                                    startTime={this.props.graphTime}
                                                    width={componentsWidth}
                                                    animationState={state}
                                                    stopGraphUpdate={this.state.rssiFullDialog.open}
                                                    thresholdLines={displayThresholdLines}
                                                />
                                            </div>
                                        </Card>
                                    </div>
                                )}
                            </Transition>
                        </Card>
                    </Card>
                </DialogContent>
                {this.state.rssiFullDialog.open ? <LinkAlignmentFullScreen
                    t={this.t}
                    open={this.state.rssiFullDialog.open}
                    displayData={{
                        local: {
                            ...displayData.local,
                            shouldShow: shouldShowLocalData,
                            color: localNodeColor,
                        },
                        remote: {
                            ...displayData.remote,
                            shouldShow: shouldShowRemoteData,
                            color: remoteNodeColor,
                        },
                    }}
                    displayNodeInfo={{
                        local: {
                            hostname: this.state.nodeInfo ? this.state.nodeInfo.hostname : '-',
                            model: graphNodeInfo[nodeIp] ? graphNodeInfo[nodeIp].model : '-',
                            mac: graphNodeInfo[nodeIp] ? graphNodeInfo[nodeIp].mac : '-',
                        },
                        remote: {
                            hostname: neiData && neiData.hostname ? neiData.hostname : '-',
                            model: neiData && neiData.model ? neiData.model : '-',
                            mac: neiData && neiData.mac ? neiData.mac : '-',
                        },
                    }}
                    focusedLink={focusedLink[0] || {radio: radioDevices[0]}}
                    initialRadioData={initialRadioData}
                    handleRadioDeviceChange={(radio) => {
                        this.props.setRadio([radio]);
                    }}
                    handlePollingFunc={started ? this.stopRadioInfoInterval : () => {
                        this.props.clearCurrentGraphData();
                        this.startRadioInfoInterval();
                    }}
                    handleOpenConfigBoxFunc={this.handleSwipeableMenuOpen}
                    handleFullDialogClose={this.handleFullDialogClose}
                    pollingStatus={{
                        pollingStatusTitle: status,
                        isPolling,
                        isStarting: this.starting,
                    }}
                    width={this.state.width >= 1280 ? this.state.width : 1280}
                    height={this.state.height >= 720 ? this.state.height : 720}
                    disableAdjustConfig={this.state.loadingConfig}
                /> : null}
                <Snackbar
                    anchorOrigin={{vertical: 'top', horizontal: 'center'}}
                    open={!this.state.getConfigSuccess && !this.state.loadingConfig}
                    style={{
                        marginTop: 45,
                        backgroundColor: colors.black75,
                        padding: '10px 15px',
                        borderRadius: '3px',
                    }}
                    transitionDuration={{enter: 250, exit: 0}}
                >
                    <React.Fragment>
                        <i
                            className="material-icons"
                            style={{
                                fontSize: '25px',
                                paddingRight: '16px',
                                color: 'white',
                                opacity: 1,
                                transform: 'none',
                            }}
                        >error_outline</i>
                        <Typography
                            style={{
                                fontSize: 14,
                                lineHeight: '140%',
                                color: 'white',
                                userSelect: 'none',
                            }}
                        >
                            <b>
                                {this.t('configRetieveFailSnackbarContent')}
                            </b>
                        </Typography>
                        <Button
                            size="small"
                            style={{
                                color: 'white',
                                marginLeft: 20,
                                fontWeight: 700,
                            }}
                            onClick={() => this.getNodeConfiguration()}
                        >
                            {this.t('reload')}
                        </Button>
                    </React.Fragment>
                </Snackbar>
            </>
        );
    }
}

LinkAlignment.propTypes = {
    csrf: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired, // eslint-disable-line
    toggleAlignmentDialog: PropTypes.func.isRequired,
    // t: PropTypes.func.isRequired,
    nodeIp: PropTypes.string.isRequired,
    graphNodeInfo: PropTypes.object.isRequired, //eslint-disable-line
    graphLinkInfo: PropTypes.object.isRequired, //eslint-disable-line
    handleRadioInfoRes: PropTypes.func.isRequired,
    // clearRadioInfoData: PropTypes.func.isRequired,
    radioDataArr: PropTypes.array.isRequired,  // eslint-disable-line
    clusterInformation: PropTypes.object.isRequired, //eslint-disable-line
    getClusterInformation: PropTypes.func.isRequired,
    radioDevices: PropTypes.arrayOf(PropTypes.string).isRequired,
    setRadio: PropTypes.func.isRequired,
    radioInfoPolling: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    isPolling: PropTypes.bool.isRequired,
    clearRadioInfoData: PropTypes.func.isRequired,
    selectedLink: PropTypes.array.isRequired, // eslint-disable-line
    focusedLink: PropTypes.array.isRequired, // eslint-disable-line
    clearCurrentGraphData: PropTypes.func.isRequired,
    resetClusterInformation: PropTypes.func.isRequired,
    tempNodeConfig: PropTypes.object.isRequired, // eslint-disable-line
    setLinkAlignmentChartData: PropTypes.func.isRequired, // eslint-disable-line
    graphRadioData: PropTypes.object.isRequired, // eslint-disable-line
    filterKey: PropTypes.string.isRequired,
    graphTime: PropTypes.string.isRequired,
    configProcessing: PropTypes.bool.isRequired,
    resumePolling: PropTypes.func.isRequired,
    abortPolling: PropTypes.func.isRequired,
    toggleSearch: PropTypes.func.isRequired,
    toggleColumn: PropTypes.func.isRequired,
    toggleSnackBar: PropTypes.func.isRequired,
    setFilter: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    return {
        csrf: state.common.csrf,
        nodeIp: state.linkAlignment.ip,
        radioDataArr: state.linkAlignment.radioData,
        graphNodeInfo: state.meshTopology.nodeInfo,
        graphLinkInfo: state.meshTopology.linkInfo,
        graphRadioData: state.linkAlignment.graphRadioData,
        clusterInformation: state.dashboard.clusterInformation,
        radioDevices: state.linkAlignment.selectedRadio,
        isPolling: state.linkAlignment.isPolling,
        selectedLink: state.linkAlignment.selectedLink,
        focusedLink: state.linkAlignment.focusedLink,
        tempNodeConfig: state.dashboard.tempNodeConfig,
        filterKey: state.linkAlignment.filterKey,
        graphTime: state.linkAlignment.graphCurrentTime,
        configProcessing: state.linkAlignment.configProcessing,
        projectIdToNameMap: state.projectManagement.projectIdToNameMap,
    };
}

const styles = theme => ({
    appBar: {
        position: 'relative',
    },
    fab: {
        // minHeight: '24px',
        boxShadow: '0px 0px rgba(0,0,0,0.0)',
        width: '1.3vw',
        height: '1.3vw',
        minHeight: '1.3vw',
    },
    icon: {
        fontSize: '0.9vw',
    },
    title: {
        marginLeft: theme.spacing(2),
        flex: 1,
    },
    wrapper: {
        // width: '100%',
        // height: '100%',
        backgroundColor: '#E5E5E5',
        fontFamily: 'Roboto',
    },
    cardWrapper: {
        margin: '20px',
        width: 'auto',
        // height: '800px',
    },
    detailWrapper: {
        margin: '15px',
        width: 'auto',
        // height: '300px',
        overflowY: 'auto',
    },
    neiTableWrapper: {
        margin: '20px 0px',
        width: 'auto',
        height: '510px',
        // background: 'black',
    },
    neiTableWrapperFlex: {
        margin: '20px 0px',
        width: 'auto',
        height: '100%',
        // background: 'black',
    },
    rssiWrapper: {
        margin: '20px',
        width: 'auto',
    },
    nodeInfoWrapper: {
        width: '30%',
    },
    rssiChartWrapp: {
        // width: 'auto',
        overflowX: 'auto',
        // maxWidth: '70%',
    },
    rssiNodeDetailWrapp: {
        // width: '30%',
        // minWidth: '30%',
        overflowX: 'hidden',
    },
    rssiData: {
        fontSize: '1.5vw',
        paddingTop: '0.3vw',
    },
    deviceDescriptionHeader: {
        fontSize: '22px',
        color: colors.deviceDescriptionHeader,
    },
    deviceDescriptionContent: {
        fontSize: '22px',
        fontWeight: 'bold',
    },
    tags: {
        padding: '0 4px',
        color: colors.tagTxt,
    },
    dotdot: {
        minWidth: '0px',
    },
    hideBtn: {
        margin: 'auto 0',
    },
    hideBtnRoot: {
        minWidth: '0.5vw',
        width: '0.5vw',
        padding: '0.5vw',
        height: '80px',
    },
});

export default compose(
    connect(
        mapStateToProps,
        {
            toggleAlignmentDialog,
            handleRadioInfoRes,
            clearRadioInfoData,
            getClusterInformation,
            setRadio,
            radioInfoPolling,
            clearCurrentGraphData,
            resetClusterInformation,
            setLinkAlignmentChartData,
            resumePolling,
            abortPolling,
            toggleSearch,
            toggleColumn,
            toggleSnackBar,
            setFilter,
        }
    ),
    withStyles(styles)
)(LinkAlignment);
