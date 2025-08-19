import React, {Component} from 'react';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {withTranslation} from 'react-i18next';
import {Grid, Tooltip, IconButton, FormControl, InputLabel, MenuItem, Select, Input} from '@material-ui/core';
import Constant from '../../../../constants/common';
import P2CardContainer from '../../../../components/common/P2CardContainer';
import P2Dialog from '../../../../components/common/P2Dialog';
import {updateSearchKey} from '../../../../redux/dashboard/dashboardActions';
import {updateTrafficLoadSettings, syncUiSettings} from '../../../../redux/uiSettings/uiSettingsActions';
import {convertIpToMac} from '../../../../util/formatConvertor';
import {ReactComponent as SettingsIcon} from '../../../../icon/svg/ic_settings.svg';

const txColor = Constant.colors.appBarMenuItem;
const rxColor = Constant.theme.palette.secondary.main;
const cardContentMargin = '0 16px';
const barFontStyle = 'normal 11px Roboto';
const blockLineHeight = '15px';

const styles = {
    cardContent: {
        margin: cardContentMargin,
    },
    tag: {
        fontFamily: 'Roboto',
        fontStyle: 'normal',
        fontWeight: 'normal',
        fontSize: '13px',
        lineHeight: blockLineHeight,
        letterSpacing: '0.25px',
        color: Constant.colors.dataTxt,
        marginBlockEnd: 0,
        marginBlockStart: 0,
    },
    bar: {
        color: Constant.colors.white,
        textAlign: 'center',
        fontSize: '9px',
        fontWeight: '500',
        padding: '0 0',
        cursor: 'pointer',
        font: barFontStyle,
        lineHeight: blockLineHeight,
    },
    tooltipStyles: {
        backgroundColor: '#323232',
        boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.24), 0px 0px 2px rgba(0, 0, 0, 0.12)',
        borderRadius: '0px',
    },
};


class Bar {
    constructor(hostname, mac, ethTx, ethRx, radioTx, radioRx, tx, rx, txWidth, rxWidth, txID, rxID,
        ethTxTag, ethRxTag, radioTxTag, radioRxTag, txTag, rxTag) {
        this.hostname = hostname;
        this.mac = mac;
        this.ethTx = ethTx;
        this.ethRx = ethRx;
        this.radioTx = radioTx;
        this.radioRx = radioRx;
        this.tx = tx;
        this.rx = rx;
        this.txWidth = txWidth;
        this.rxWidth = rxWidth;
        this.txID = txID;
        this.rxID = rxID;
        this.ethTxTag = ethTxTag;
        this.ethRxTag = ethRxTag;
        this.radioTxTag = radioTxTag;
        this.radioRxTag = radioRxTag;
        this.txTag = txTag;
        this.rxTag = rxTag;
    }
}

function getTextWidth(text, font) {
    const myCanvas = getTextWidth.canvas || (getTextWidth.canvas = document.createElement('canvas'));
    const context = myCanvas.getContext('2d');
    context.font = font;

    const metrics = context.measureText(text);
    return metrics.width;
}

function createTooltipTitle(props) {
    if (props.settings.device === 'eth') {
        switch (props.settings.dataType) {
            case 'tx': return (
                <tr>
                    <th style={{borderRight: '1px solid white', paddingRight: '5px'}}>
                        {props.t('eth')}
                    </th>
                    <td>
                        {props.t('eth-tx')}<b>{props.ethTxTag}</b>
                    </td>
                </tr>
            );
            case 'rx': return (
                <tr>
                    <th style={{borderRight: '1px solid white', paddingRight: '5px'}}>
                        {props.t('eth')}
                    </th>
                    <td>
                        {props.t('eth-rx')}<b>{props.ethRxTag}</b>
                    </td>
                </tr>
            );
            default: return (
                <React.Fragment>
                    <tr>
                        <th rowSpan="2" style={{borderRight: '1px solid white', paddingRight: '5px'}}>
                            {props.t('eth')}
                        </th>
                        <td>
                            {props.t('eth-tx')}<b>{props.ethTxTag}</b>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            {props.t('eth-rx')}<b>{props.ethRxTag}</b>
                        </td>
                    </tr>
                </React.Fragment>
            );
        }
    } else if (props.settings.device === 'radio') {
        switch (props.settings.dataType) {
            case 'tx': return (
                <tr>
                    <th style={{borderRight: '1px solid white', paddingRight: '5px'}}>
                        {props.t('radio')}
                    </th>
                    <td>
                        {props.t('radio-tx')}<b>{props.radioTxTag}</b>
                    </td>
                </tr>
            );
            case 'rx': return (
                <tr>
                    <th style={{borderRight: '1px solid white', paddingRight: '5px'}}>
                        {props.t('radio')}
                    </th>
                    <td>
                        {props.t('radio-rx')}<b>{props.radioRxTag}</b>
                    </td>
                </tr>
            );
            default: return (
                <React.Fragment>
                    <tr>
                        <th rowSpan="2" style={{borderRight: '1px solid white', paddingRight: '5px'}}>
                            {props.t('radio')}
                        </th>
                        <td>
                            {props.t('radio-tx')}<b>{props.radioTxTag}</b>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            {props.t('radio-rx')}<b>{props.radioRxTag}</b>
                        </td>
                    </tr>
                </React.Fragment>
            );
        }
    } else {
        switch (props.settings.dataType) {
            case 'tx': return (
                <React.Fragment>
                    <tr>
                        <th style={{borderRight: '1px solid white'}}>
                            {props.t('eth')}
                        </th>
                        <td>
                            {props.t('eth-tx')}<b>{props.ethTxTag}</b>
                        </td>
                    </tr>
                    <tr style={{height: '5px', border: 'none'}}>
                        <td>
                            <span>{' '}</span>
                        </td>
                    </tr>
                    <tr>
                        <th style={{borderRight: '1px solid white', paddingRight: '5px'}}>
                            {props.t('radio')}
                        </th>
                        <td>
                            {props.t('radio-tx')}<b>{props.radioTxTag}</b>
                        </td>
                    </tr>
                </React.Fragment>
            );
            case 'rx': return (
                <React.Fragment>
                    <tr>
                        <th style={{borderRight: '1px solid white'}}>
                            {props.t('eth')}
                        </th>
                        <td>
                            {props.t('eth-rx')}<b>{props.ethRxTag}</b>
                        </td>
                    </tr>
                    <tr style={{height: '5px', border: 'none'}}>
                        <td>
                            <span>{' '}</span>
                        </td>
                    </tr>
                    <tr>
                        <th style={{borderRight: '1px solid white', paddingRight: '5px'}}>
                            {props.t('radio')}
                        </th>
                        <td>
                            {props.t('radio-rx')}<b>{props.radioRxTag}</b>
                        </td>
                    </tr>
                </React.Fragment>
            );
            default: return (
                <React.Fragment>
                    <tr>
                        <th rowSpan="2" style={{borderRight: '1px solid white'}}>
                            {props.t('eth')}
                        </th>
                        <td>
                            {props.t('eth-tx')}<b>{props.ethTxTag}</b>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            {props.t('eth-rx')}<b>{props.ethRxTag}</b>
                        </td>
                    </tr>
                    <tr style={{height: '5px', border: 'none'}}>
                        <td>
                            <span>{' '}</span>
                        </td>
                    </tr>
                    <tr>
                        <th rowSpan="2" style={{borderRight: '1px solid white', paddingRight: '5px'}}>
                            {props.t('radio')}
                        </th>
                        <td>
                            {props.t('radio-tx')}<b>{props.radioTxTag}</b>
                        </td>
                    </tr>
                    <tr>
                        <td>
                            {props.t('radio-rx')}<b>{props.radioRxTag}</b>
                        </td>
                    </tr>
                </React.Fragment>
            );
        }
    }
}

function TrafficTooltip(props) {
    return (
        <Tooltip
            title={
                <table>
                    <tbody>
                        {createTooltipTitle(props)}
                    </tbody>
                </table>
            }
            aria-label="bar-label"
            placement="bottom-end"
            classes={{
                tooltip: props.classes,
            }}
        >
            {props.content}
        </Tooltip>
    );
}

TrafficTooltip.propTypes = {
    content: PropTypes.element.isRequired,
    classes: PropTypes.string.isRequired,
    settings: PropTypes.object.isRequired, //eslint-disable-line
};

function getDataTag(val) {
    let tag = '';
    if (Number(val) >= 1024 * 1024 * 1024 * 1024 && Number(val) < 1024 * 1024 * 1024 * 1024 * 1024) {
        tag = `${Math.round((Number(val) / 1024 / 1024 / 1024 / 1024) * 100) / 100}TB`;
    } else if (Number(val) >= 1024 * 1024 * 1024 && Number(val) < 1024 * 1024 * 1024 * 1024) {
        tag = `${Math.round((Number(val) / 1024 / 1024 / 1024) * 100) / 100}GB`;
    } else if (Number(val) >= 1024 * 1024 && Number(val) < 1024 * 1024 * 1024) {
        tag = `${Math.round((Number(val) / 1024 / 1024) * 100) / 100}MB`;
    } else if (Number(val) >= 1024 && Number(val) < 1024 * 1024) {
        tag = `${Math.round((Number(val) / 1024) * 100) / 100}KB`;
    } else if (Number(val) >= 1 && Number(val) < 1024) {
        tag = `${val}B`;
    }
    return tag;
}

function getTitleLabel(dataType) {
    switch (dataType) {
        case 'tx': return 'TX';
        case 'rx': return 'RX';
        default: return 'TX & RX';
    }
}

function getFooterLabel(settings) {
    switch (settings.dataType) {
        case 'tx+rx': return (
            <React.Fragment>
                <i className="material-icons" style={{color: txColor, fontSize: '9px'}}>
                    brightness_1
                </i>
                <span style={{paddingLeft: '2px', paddingRight: '5px'}}>
                    TX
                </span>
                <i className="material-icons" style={{color: rxColor, fontSize: '9px'}}>
                    brightness_1
                </i>
                <span style={{paddingLeft: '2px'}}>
                    RX
                </span>
            </React.Fragment>
        );
        default: return (
            <React.Fragment>
                <i
                    className="material-icons"
                    style={{color: settings.dataType === 'tx' ? txColor : rxColor, fontSize: '9px'}}
                >
                    brightness_1
                </i>
                <span style={{paddingLeft: '2px'}}>
                    {getTitleLabel(settings.dataType)}
                </span>
            </React.Fragment>
        );
    }
}

function getSettingConstant(settings) {
    if (settings.device === 'radio+eth' && settings.dataType === 'tx') {
        return 'tx';
    } else if (settings.device === 'eth' && settings.dataType === 'tx') {
        return 'eth_tx';
    } else if (settings.device === 'radio' && settings.dataType === 'tx') {
        return 'radio_tx';
    } else if (settings.device === 'radio+eth' && settings.dataType === 'rx') {
        return 'rx';
    } else if (settings.device === 'eth' && settings.dataType === 'rx') {
        return 'eth_rx';
    } else if (settings.device === 'radio' && settings.dataType === 'rx') {
        return 'radio_rx';
    } else if (settings.device === 'eth' && settings.dataType === 'tx+rx') {
        return 'eth_tx_rx';
    } else if (settings.device === 'radio' && settings.dataType === 'tx+rx') {
        return 'radio_tx_rx';
    }
    return 'tx_rx';
}

function sortData(dataType, data) {
    switch (dataType) {
        case 'tx': return data.sort((a, b) => (Number(b.eth.tx) + Number(b.radio.tx)) -
                (Number(a.eth.tx) + Number(a.radio.tx)));
        case 'eth_tx': return data.sort((a, b) => (Number(b.eth.tx) - Number(a.eth.tx)));
        case 'radio_tx': return data.sort((a, b) => (Number(b.radio.tx) - Number(a.radio.tx)));
        case 'rx': return data.sort((a, b) => (Number(b.eth.rx) + Number(b.radio.rx)) -
                (Number(a.eth.rx) + Number(a.radio.rx)));
        case 'eth_rx': return data.sort((a, b) => (Number(b.eth.rx) - Number(a.eth.rx)));
        case 'radio_rx': return data.sort((a, b) => (Number(b.radio.rx) - Number(a.radio.rx)));
        case 'eth_tx_rx': return data.sort((a, b) => ((Number(b.eth.tx) + Number(b.eth.rx)) -
            (Number(a.eth.tx) + Number(a.eth.rx))));
        case 'radio_tx_rx': return data.sort((a, b) => ((Number(b.radio.tx) + Number(b.radio.rx)) -
            (Number(a.radio.tx) + Number(a.radio.rx))));
        default: return data.sort((a, b) => (Number(b.eth.tx) + Number(b.radio.tx) +
                            Number(b.eth.rx) + Number(b.radio.rx)) -
                            (Number(a.eth.tx) + Number(a.radio.tx) + Number(a.eth.rx) + Number(a.radio.rx)));
    }
}

function calculateRatio(dataType, sortedData, tx, rx, ethTx, radioTx, ethRx, radioRx) {
    switch (dataType) {
        case 'tx': return ((tx) / (Number(sortedData[0].eth.tx) + Number(sortedData[0].radio.tx)));
        case 'eth_tx': return (ethTx / Number(sortedData[0].eth.tx));
        case 'radio_tx': return (radioTx / Number(sortedData[0].radio.tx));
        case 'rx': return ((rx) / (Number(sortedData[0].eth.rx) + Number(sortedData[0].radio.rx)));
        case 'eth_rx': return (ethRx / Number(sortedData[0].eth.rx));
        case 'radio_rx': return (radioRx / Number(sortedData[0].radio.rx));
        case 'eth_tx_rx': return ((ethTx + ethRx) / (Number(sortedData[0].eth.tx) + Number(sortedData[0].eth.rx)));
        case 'radio_tx_rx': return ((radioTx + radioRx) /
            (Number(sortedData[0].radio.tx) + Number(sortedData[0].radio.rx)));
        default: return ((tx + rx) / (Number(sortedData[0].eth.tx) + Number(sortedData[0].radio.tx) +
                    Number(sortedData[0].eth.rx) + Number(sortedData[0].radio.rx)));
    }
}

function calculateWidth(dataType, ethTx, ethRx, radioTx, radioRx, tx, rx, ratio, isTx) {
    switch (dataType) {
        case 'eth_tx_rx': return isTx ? `${(ethTx / (ethTx + ethRx)) * ratio * 100}%` :
            `${(ethRx / (ethTx + ethRx)) * ratio * 100}%`;
        case 'radio_tx_rx': return isTx ? `${(radioTx / (radioTx + radioRx)) * ratio * 100}%` :
            `${(radioRx / (radioTx + radioRx)) * ratio * 100}%`;
        case 'tx_rx': return isTx ? `${(tx / (tx + rx)) * ratio * 100}%` : `${(rx / (tx + rx)) * ratio * 100}%`;
        default: return `${ratio * 100}%`;
    }
}

function getTag(dataType, bar, isTx) {
    switch (dataType) {
        case 'tx': return bar.txTag;
        case 'eth_tx': return bar.ethTxTag;
        case 'radio_tx': return bar.radioTxTag;
        case 'rx': return bar.rxTag;
        case 'eth_rx': return bar.ethRxTag;
        case 'radio_rx': return bar.radioRxTag;
        case 'eth_tx_rx': return isTx ? bar.ethTxTag : bar.ethRxTag;
        case 'radio_tx_rx': return isTx ? bar.radioTxTag : bar.radioRxTag;
        default: return isTx ? bar.txTag : bar.rxTag;
    }
}

class TopXTrafficLoad extends Component {
    constructor(props) {
        super(props);
        this.state = {
            bars: [],
            openTrafficLoadSettingsToggle: false,
            trafficLoadSettings: props.trafficLoadSettings,
            nodeStat: {},
            nodeInfo: {},
        };
        this.t = this.props.t;
        this.openTrafficLoadSettings = this.openTrafficLoadSettings.bind(this);
        this.handleSettingsChange = this.handleSettingsChange.bind(this);
        this.submitSettings = this.submitSettings.bind(this);
        this.updateBarData = this.updateBarData.bind(this);
        this.checkBarLabelWidth = this.checkBarLabelWidth.bind(this);
        this.calculateTrafficLoad = this.calculateTrafficLoad.bind(this);
    }

    componentDidMount() {
        this.updateBarData(this.props);
    }

    componentWillReceiveProps(nextProps) {
        this.updateBarData(nextProps);
    }

    openTrafficLoadSettings(toggle) {
        this.setState({
            trafficLoadSettings: this.props.trafficLoadSettings,
            openTrafficLoadSettingsToggle: toggle,
        });
    }

    handleSettingsChange(event) {
        this.setState({
            ...this.state,
            trafficLoadSettings: {
                ...this.state.trafficLoadSettings,
                [event.target.name]: event.target.value,
            },
        });
    }

    submitSettings() {
        this.props.updateTrafficLoadSettings(this.state.trafficLoadSettings);
        this.props.syncUiSettings();
        this.setState({
            openTrafficLoadSettingsToggle: false,
        }, () => this.updateBarData(this.props));
    }

    calculateTrafficLoad(nodeData) {
        const nodesStat = [];
        Object.entries(nodeData.nodes).forEach(([ip, stat]) => {
            let isManagedNode = false;
            this.props.allNodes.forEach((node) => {
                if (node.id === ip && node.isManaged) {
                    isManagedNode = true;
                }
            });
            if (isManagedNode) {
                const hostname = nodeData.nodesInfo[ip] ? nodeData.nodesInfo[ip].hostname : '-';
                const mac = convertIpToMac(ip);
                // const {hostname, mac} = this.props.nodesInfo[ip];
                let ethTx = 0;
                let ethRx = 0;
                let radioTx = 0;
                let radioRx = 0;
                Object.entries(stat).forEach(([type, traffic]) => {
                    if (type.includes('eth')) {
                        ethTx += Number(traffic.txBytes);
                        ethRx += Number(traffic.rxBytes);
                    } else if (type.includes('radio')) {
                        radioTx += Number(traffic.txBytes);
                        radioRx += Number(traffic.rxBytes);
                    }
                });
                nodesStat.push({
                    hostname,
                    mac,
                    eth: {
                        tx: ethTx,
                        rx: ethRx,
                    },
                    radio: {
                        tx: radioTx,
                        rx: radioRx,
                    },
                });
            }
        });
        return nodesStat;
    }

    updateBarData(nodeData) {
        if (nodeData.nodesInfo && nodeData.nodes) {
            const displayBars = [];
            const settingConstant = getSettingConstant(nodeData.trafficLoadSettings);
            const data = this.calculateTrafficLoad(nodeData);
            const sortedData = sortData(settingConstant, data);
            const length = sortedData.length < 3 ? sortedData.length : 3;
            for (let index = 0; index < length; index += 1) {
                const node = sortedData[index];
                const {hostname, mac} = node;
                const ethTx = Number(node.eth.tx);
                const ethRx = Number(node.eth.rx);
                const ethTxTag = getDataTag(node.eth.tx);
                const ethRxTag = getDataTag(node.eth.rx);
                const radioTx = Number(node.radio.tx);
                const radioRx = Number(node.radio.rx);
                const radioTxTag = getDataTag(node.radio.tx);
                const radioRxTag = getDataTag(node.radio.rx);
                const tx = Number(node.eth.tx) + Number(node.radio.tx);
                const rx = Number(node.eth.rx) + Number(node.radio.rx);
                const ratio = calculateRatio(settingConstant, sortedData, tx, rx,
                    ethTx, radioTx, ethRx, radioRx);
                const txWidth = (nodeData.trafficLoadSettings.dataType === 'rx') ? '0%' :
                    calculateWidth(settingConstant, ethTx, ethRx, radioTx, radioRx, tx, rx, ratio, true);
                const rxWidth = (nodeData.trafficLoadSettings.dataType === 'tx') ? '0%' :
                    calculateWidth(settingConstant, ethTx, ethRx, radioTx, radioRx, tx, rx, ratio, false);
                const txTag = getDataTag(tx);
                const rxTag = getDataTag(rx);
                const txID = `tx-${index}`;
                const rxID = `rx-${index}`;
                displayBars.push(new Bar(hostname, mac, ethTx, ethRx, radioTx, radioRx,
                    tx, rx, txWidth, rxWidth, txID, rxID, ethTxTag, ethRxTag, radioTxTag, radioRxTag, txTag, rxTag));
            }
            this.setState({
                bars: displayBars,
            }, () => this.checkBarLabelWidth());
        }
    }

    checkBarLabelWidth() {
        this.state.bars.map((bar) => {
            const txTag = getTag(getSettingConstant(this.props.trafficLoadSettings), bar, true);
            const txTextWidth = getTextWidth(txTag, barFontStyle);
            if (txTextWidth > document.getElementById(bar.txID).getBoundingClientRect().width) {
                document.getElementById(bar.txID).innerText = '';
            } else {
                document.getElementById(bar.txID).innerText = txTag;
            }
            const rxTag = getTag(getSettingConstant(this.props.trafficLoadSettings), bar, false);
            const rxTextWidth = getTextWidth(rxTag, barFontStyle);
            if (rxTextWidth > document.getElementById(bar.rxID).getBoundingClientRect().width) {
                document.getElementById(bar.rxID).innerText = '';
            } else {
                document.getElementById(bar.rxID).innerText = rxTag;
            }
            return true;
        });
    }

    render() {
        const {classes} = this.props;
        const trafficLoadSettingsDialogContent = (
            <React.Fragment>
                <FormControl
                    style={{display: 'block', marginBottom: '16px'}}
                >
                    <InputLabel htmlFor="device-select">
                        {this.t('device-select-label')}
                    </InputLabel>
                    <Select
                        value={this.state.trafficLoadSettings.device}
                        onChange={this.handleSettingsChange}
                        input={<Input name="device" id="device-select" />}
                    >
                        <MenuItem value="radio">
                            {this.t('device-menu-item-radio')}
                        </MenuItem>
                        <MenuItem value="eth">
                            {this.t('device-menu-item-eth')}
                        </MenuItem>
                        <MenuItem value="radio+eth">
                            {this.t('device-menu-item-eth-radio')}
                        </MenuItem>
                    </Select>
                </FormControl>
                <FormControl
                    style={{display: 'block'}}
                >
                    <InputLabel htmlFor="dataType-select">
                        {this.t('dataType-select-label')}
                    </InputLabel>
                    <Select
                        value={this.state.trafficLoadSettings.dataType}
                        onChange={this.handleSettingsChange}
                        input={<Input name="dataType" id="dataType-select" />}
                    >
                        <MenuItem value="tx+rx">
                            {this.t('dataType-menu-item-tx-rx')}
                        </MenuItem>
                        <MenuItem value="tx">
                            {this.t('dataType-menu-item-tx')}
                        </MenuItem>
                        <MenuItem value="rx">
                            {this.t('dataType-menu-item-rx')}
                        </MenuItem>
                    </Select>
                </FormControl>
            </React.Fragment>
        );
        const trafficLoadSettingsDialog = (
            <P2Dialog
                open={this.state.openTrafficLoadSettingsToggle}
                handleClose={() => this.openTrafficLoadSettings(false)}
                title={this.t('dialog-title')}
                content=""
                nonTextContent={trafficLoadSettingsDialogContent}
                actionTitle={this.t('dialog-confirm')}
                actionFn={this.submitSettings}
                cancelActTitle={this.t('dialog-cancel')}
                cancelActFn={() => this.openTrafficLoadSettings(false)}
                fullWidth
                zIndex={1300}
            />
        );
        const items = this.state.bars.map(bar => (
            <Grid
                container
                key={bar.mac}
                id={bar.mac}
                style={{height: '39.67px'}}
            >
                <Grid
                    style={{
                        padding: '0.2em 0',
                    }}
                    className={classes.cardContent}
                    container
                >
                    <Grid item xs={12}>
                        <TrafficTooltip
                            ethTxTag={bar.ethTxTag}
                            ethRxTag={bar.ethRxTag}
                            radioTxTag={bar.radioTxTag}
                            radioRxTag={bar.radioRxTag}
                            content={
                                <div
                                    style={{
                                        display: 'inline',
                                        cursor: 'pointer',
                                        outlineColor: Constant.colors.transparentColor,
                                    }}
                                    className={classes.tag}
                                    onClick={() => this.props.updateSearchKey(bar.mac)}
                                    onKeyPress={() => this.props.updateSearchKey(bar.mac)}
                                    role="button"
                                    tabIndex="0"
                                >
                                    {bar.hostname}
                                    <span className={classes.tag}>
                                        ({bar.mac})
                                    </span>
                                </div>
                            }
                            t={this.t}
                            classes={classes.tooltipStyles}
                            settings={this.props.trafficLoadSettings}
                        />
                    </Grid>
                    <Grid container spacing={0} style={{height: '15px'}}>
                        <Grid container>
                            <TrafficTooltip
                                ethTxTag={bar.ethTxTag}
                                ethRxTag={bar.ethRxTag}
                                radioTxTag={bar.radioTxTag}
                                radioRxTag={bar.radioRxTag}
                                content={
                                    <div
                                        id={bar.txID}
                                        className={classes.bar}
                                        style={{
                                            width: bar.txWidth,
                                            background: txColor,
                                            outlineColor: Constant.colors.transparentColor,
                                        }}
                                        onClick={() => this.props.updateSearchKey(bar.mac)}
                                        onKeyPress={() => this.props.updateSearchKey(bar.mac)}
                                        role="button"
                                        tabIndex="0"
                                    >
                                        {getTag(getSettingConstant(this.props.trafficLoadSettings), bar, true)}
                                    </div>
                                }
                                t={this.t}
                                classes={classes.tooltipStyles}
                                settings={this.props.trafficLoadSettings}
                            />
                            <TrafficTooltip
                                ethTxTag={bar.ethTxTag}
                                ethRxTag={bar.ethRxTag}
                                radioTxTag={bar.radioTxTag}
                                radioRxTag={bar.radioRxTag}
                                content={
                                    <div
                                        id={bar.rxID}
                                        className={classes.bar}
                                        style={{
                                            width: bar.rxWidth,
                                            background: rxColor,
                                            outlineColor: Constant.colors.transparentColor,
                                        }}
                                        onClick={() => this.props.updateSearchKey(bar.mac)}
                                        onKeyPress={() => this.props.updateSearchKey(bar.mac)}
                                        role="button"
                                        tabIndex="0"
                                    >
                                        {getTag(getSettingConstant(this.props.trafficLoadSettings), bar, false)}
                                    </div>
                                }
                                t={this.t}
                                classes={classes.tooltipStyles}
                                settings={this.props.trafficLoadSettings}
                            />
                        </Grid>
                    </Grid>
                </Grid>
            </Grid>
        ));
        const topXTrafficLoadCardTools = [
            (
                <Tooltip
                    title={this.t('tooltip-title')}
                    key="tool-1"
                >
                    <IconButton
                        style={{padding: '7px'}}
                        aria-label="settings"
                        onClick={() => this.openTrafficLoadSettings(true)}
                    >
                        <SettingsIcon width="16px" height="16px" fill={Constant.colors.dataTxt} />
                    </IconButton>
                </Tooltip>
            ),
        ];
        const cardContent = (
            <div style={{
                display: 'flex',
                flexDirection: 'column',
                flex: 1,
                paddingTop: '6px',
            }}
            >
                <Grid id="card" container style={{alignContent: 'flex-start'}} spacing={0}>
                    {items}
                </Grid>
                <div
                    style={{
                        fontSize: '10px',
                        fontFamily: 'Roboto',
                        height: '27px',
                        alignItems: 'flex-end',
                        width: '100%',
                        display: 'flex',
                        flex: 1,
                        flexDirection: 'row',
                        alignSelf: 'flex-end',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flex: 1,
                            lineHeight: '27px',
                        }}
                    >
                        <span
                            style={{
                                color: Constant.colors.footerTxt,
                                marginLeft: '16px',
                            }}
                        >
                            {this.t('footerTxt')}
                        </span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            flex: 1,
                            alignItems: 'center',
                            justifyContent: 'flex-end',
                            lineHeight: '27px',
                            marginRight: '16px',
                        }}
                    >
                        {getFooterLabel(this.props.trafficLoadSettings)}
                    </div>
                </div>
            </div>
        );
        return (
            <React.Fragment>
                <P2CardContainer
                    cardTitle={this.t('cardTitle') +
                        getTitleLabel(this.props.trafficLoadSettings.dataType)}
                    cardTitleLimit={20}
                    cardTools={topXTrafficLoadCardTools}
                    cardContent={cardContent}
                    minWidth="400px"
                    minHeight="200px"
                    showHelperTooltip
                    helperTooltip={this.t('helperTooltip')}
                />
                {trafficLoadSettingsDialog}
            </React.Fragment>
        );
    }
}

function mapStateToProps(store) {
    return {
        nodes: store.meshTopology.nodeStat,
        nodesInfo: store.meshTopology.nodeInfo,
        allNodes: store.meshTopology.graph.nodes,
        trafficLoadSettings: store.uiSettings.dashboard.trafficLoadSettings,
    };
}

TopXTrafficLoad.propTypes = {
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    t: PropTypes.func.isRequired,
    updateSearchKey: PropTypes.func.isRequired,
    updateTrafficLoadSettings: PropTypes.func.isRequired,
    syncUiSettings: PropTypes.func.isRequired,
    trafficLoadSettings: PropTypes.object.isRequired, //eslint-disable-line
    nodes: PropTypes.object.isRequired, //eslint-disable-line
    nodesInfo: PropTypes.object.isRequired, //eslint-disable-line
    allNodes: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default compose(
    withTranslation(['top-x-traffic-load']),
    connect(mapStateToProps, {
        updateSearchKey,
        updateTrafficLoadSettings,
        syncUiSettings,
    }),
    withStyles(styles)
)(TopXTrafficLoad);
