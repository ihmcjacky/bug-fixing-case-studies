/**
 * @ Author: Kyle Suen
 * @ Create Time: 2019-07-18 15:13:37
 * @ Modified by: Kyle Suen
 * @ Modified time: 2020-12-30 19:45:46
 * @ Description:
 */

import React, {Component} from 'react';
import moment from 'moment';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withTranslation} from 'react-i18next';
import saveAs from '../../../../util/nw/saveAs';
import {withStyles} from '@material-ui/core/styles';
import IconButton from '@material-ui/core/IconButton';
import Tooltip from '@material-ui/core/Tooltip';
import Typography from '@material-ui/core/Typography';
import AddCircleIcon from '@material-ui/icons/AddCircle';
import RemoveCircleIcon from '@material-ui/icons/RemoveCircle';
import CloseIcon from '@material-ui/icons/Close';
import SearchIcon from '@material-ui/icons/Search';
import PropTypes from 'prop-types';
import {ReactComponent as FunnelOutlineIcon} from '../../../../icon/svg/ic_funnel_outline2.svg';
import {ReactComponent as ExportIcon} from '../../../../icon/svg/ic_export.svg';
import {getNodeColor, getNodeIconImage} from '../topology/topologyGraphHelperFunc';
import Constant from '../../../../constants/common';
import {convertIpToMac} from '../../../../util/formatConvertor';
import P2CardContainer from '../../../../components/common/P2CardContainer';
import P2Table from '../../../../components/common/P2Table';
import P2Tooltip from '../../../../components/common/P2Tooltip';
import P2MenuList from '../../../../components/common/P2MenuList';
import P2SearchBar from '../../../../components/common/P2SearchBar';
import {updateStatusKey, updateSearchKey, toggleSearch} from '../../../../redux/dashboard/dashboardActions';
import {toggleSnackBar} from '../../../../redux/common/commonActions';
import CsvZipFactory from '../../../../components/common/CsvZipFactory';
import '../../../../css/topologyGraph.css'
import {convertSpeed} from '../../../../util/formatConvertor';
import {getOemNameOrAnm} from '../../../../util/common';

const {colors, theme} = Constant;

const capitalize = (s) => {
    if (typeof s !== 'string') return '';
    return `${s.charAt(0).toUpperCase()}${s.slice(1)}`;
};


function formatDate(date) {
    const d = new Date(date);
    let month = (d.getMonth() + 1).toString();
    let day = d.getDate().toString();
    const year = d.getFullYear();
    const hour = d.getHours();
    let minute = d.getMinutes();
    let second = d.getSeconds();

    minute = minute < 10 ? `0${minute}` : minute;
    second = second < 10 ? `0${second}` : second;

    if (month.length < 2) month = `0${month}`;
    if (day.length < 2) day = `0${day}`;

    return [year, month, day, hour, minute, second].join('-');
}

const wrapper = promise => (
    promise
        .then(data => ({data, error: null}))
        .catch(error => ({error, data: null}))
);

const get = (o, p) =>
    p.reduce(
        (xs, x) =>
            ((xs && xs[x]) ?
                xs[x] : null), o);

const filterByKey = (Data, key) => {
    const statusKey = (searchKey) => {
        if (searchKey === 'managed') {
            return data => (data.status === 'reachable' || data.status === 'unreachable');
        }
        return data => data.status === searchKey;
    };
    return Data.filter(statusKey(key));
};

const deepClone = object => JSON.parse(JSON.stringify(object));

const convertUnit = (value, t, exportArray, ethFormat = false) => {
    if (value === '-' ||
     value === undefined ||
     value === 'notSupport' ||
      !(typeof value === 'string' || typeof value === 'number')) {
        return '-';
    }

    const bits = parseInt(value, 10);

    if (bits <= 0) {
        return `0 ${t('Mbps')}`;
    }
    const k = 1000;
    const sizes = [t('bps'), t('kbps'), t('Mbps'), t('Gbps'), t('Tbps')];

    const i = Math.floor(Math.log(bits) / Math.log(k));
    return ethFormat ?
        `${parseFloat((bits / (k ** i)).toFixed(0))}${sizes[i][0]}`
        :
        `${parseFloat((bits / (k ** i)).toFixed(0))} ${sizes[i]}`;
};

const searchData = (Data, searchKey, t) => {
    const lowSearchKey = searchKey.toLowerCase();
    if (lowSearchKey === '') {
        return Data;
    }
    return Data.filter(obj => {
        return Object.keys(obj).some((key) => {
            let included = false;
            if (typeof obj[key] === 'object') {
                included = Object.keys(obj[key]).some((objKey) => {
                    if (objKey === 'tx' ||
                    objKey === 'rx' ||
                    objKey === 'status') {
                        return false;
                    } else if (objKey === 'max') {
                        return convertUnit(obj[key][objKey], t, false)
                            .toLowerCase().includes(lowSearchKey) ||
                            convertSpeed(obj[key][objKey], t)
                            .toLowerCase().includes(lowSearchKey);
                    }
                    return obj[key][objKey].toString().toLowerCase().includes(lowSearchKey);
                }
                );
            } else if (typeof obj[key] === 'number') {
                included = false;
            } else if (typeof obj[key] === 'boolean') {
                included = false;
            } else {
                included = obj[key].toLowerCase().includes(lowSearchKey);
            }
            return included;
        })
    }
    );
};

const createHostnameElement = (hostname, isHostNode, isAuth, isReachable, isManaged, operationMode, ip, preloadIcon, handleContextMenuOpen) =>
    (hostname.length > 12 ?
        (<P2Tooltip
            direction="right"
            title={<div style={{
                fontSize: '12px',
                padding: '2px',
                cursor: 'pointer',
            }}
            >
                {hostname}
            </div>}
            content={
                <div 
                    style={{
                        width: '170px',
                        display: 'flex',
                        justifyContent: 'start',
                        cursor: 'pointer',
                    }}
                    onContextMenu={(e) => {
                        if (isAuth !== 'yes') {
                            e.preventDefault();
                            return;
                        }
                        handleContextMenuOpen(e, ip, isManaged ? 'nodeMenu' : 'unmanagedNodeMenu');
                    }}
                >
                    <div
                        style={{
                            width: '35px',
                            height: '35px',
                            backgroundColor: getNodeColor(isManaged, isReachable, false , false, false, false),
                            borderRadius: '50%',
                            marginLeft: '15px',
                        }}
                    >
                        <img
                            src={
                                getNodeIconImage(isAuth, isReachable, isManaged, false, false, operationMode, preloadIcon)
                            }
                            alt="node-icon"
                            style={{
                                width: '24px',
                                height: '24px',
                                marginLeft: '1px',
                                marginTop: '4px',
                            }}
                        />
                    </div>
                    <div
                        style={{
                            marginTop: '5px',
                            // marginLeft: '10px',
                            width: '120px',
                        }}
                    >
                        {`${hostname.substring(0, 12)}...`}{isHostNode &&
                        (
                            <span style={{color: theme.palette.primary.main, paddingLeft: '2px'}}>
                                *
                            </span>
                        )}
                    </div>
                </div>
            }
        />) :
        (<div
            style={{
                width: '170px',
                display: 'flex',
                justifyContent: 'start',
                cursor: 'pointer',
            }}
            onContextMenu={(e) => {
                if (isAuth !== 'yes') {
                    e.preventDefault();
                    return;
                }
                handleContextMenuOpen(e, ip, isManaged ? 'nodeMenu' : 'unmanagedNodeMenu');
            }}
        >
            <div
                style={{
                    width: '35px',
                    height: '35px',
                    backgroundColor: getNodeColor(isManaged, isReachable, false , false, false, false),
                    borderRadius: '50%',
                    marginLeft: '15px',
                }}
            >
                <img
                    src={
                        getNodeIconImage(isAuth, isReachable, isManaged, false, false, operationMode, preloadIcon)
                    }
                    alt="node-icon"
                    style={{
                        width: '24px',
                        height: '24px',
                        marginLeft: '1px',
                        marginTop: '4px',
                    }}
                />
            </div>
            <div
                style={{
                    marginTop: '5px',
                    // marginLeft: '10px',
                    width: '120px',
                }}
            >
                {hostname}{isHostNode &&
                (
                    <span style={{color: theme.palette.primary.main, paddingLeft: '2px'}}>
                        *
                    </span>
                )}
            </div>
        </div>));


const createChipElement = (status, checked, t) => {
    let color = '';
    switch (status) {
        case 'reachable':
            color = theme.palette.primary.main;
            break;
        case 'unreachable':
            color = colors.inactiveRed;
            break;
        case 'managed':
            color = 'lime';
            break;
        case 'unmanaged':
            color = colors.borderColor;
            break;
        default:
            color = theme.palette.primary.main;
    }
    return (
        <div
            style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
            }}
        >
            <div
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '27px',
                    width: '112px',
                    backgroundColor: !checked ? 'transparent' : color,
                    border: `1px solid ${checked ? 'transparent' : color}`,
                    borderRadius: '16px',
                }}
            >
                <Typography
                    style={{
                        fontSize: '13px',
                        color: !checked ? color : 'white',
                        fontWeight: '500',
                    }}
                >
                    {t(`${status}Chip`)}
                </Typography>
            </div>
        </div>
    );
};

const createRadioElement = (radio, t) => (typeof radio !== 'string' ?
    (
        <span
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-around',
                height: '58px',
            }}
        >
            <span
                style={{
                    padding: '0px 14px 3px',
                    fontSize: '14px',
                    borderBottom: `0.5px solid ${colors.borderColor}`,
                    fontWeight: '300',
                    minWidth: '50px',
                    marginBottom: '3px',
                }}
            >
                {radio.channelBandwidth}
            </span>
            <span
                style={{
                    display: 'flex',
                    fontSize: '12px',
                    fontWeight: '300',
                }}
            >
                <span style={{fontWeight: '500', paddingRight: '3px'}}>{t('txLbl')}</span>
                <span style={{minWidth: '40px'}}>{convertUnit(radio.tx, t, false)}</span>
            </span>
            <span
                style={{
                    display: 'flex',
                    fontSize: '12px',
                    fontWeight: '300',
                }}
            >
                <span style={{fontWeight: '500', paddingRight: '3px'}}>{t('rxLbl')}</span>
                <span style={{minWidth: '40px'}}>{convertUnit(radio.rx, t, false)}</span>
            </span>
        </span>
    ) : (
        <span
            style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'space-around',
                height: '56px',
                color: colors.tagTxt,
            }}
        >{t(radio)}</span>));


const createEthElement = (eth, classes, trans, ethernetNumber) => {
    const progressBar = (ethObj, color, key, t, ethNo) => (
        <Tooltip
            title={
                <span
                    style={{
                        display: 'flex',
                        fontSize: '10px',
                        fontWeight: '500',
                        justifyContent: 'space-between',
                        width: '142px',
                        height: '66px',
                        padding: '5px',
                        color: 'white',
                    }}
                >
                    <span
                        style={{
                            fontWeight: '500',
                            paddingRight: '5px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRight: '1px solid white',
                            flexGrow: '1',
                        }}
                    >
                        {`ETH ${ethNo}`}
                    </span>
                    <span
                        style={{
                            fontWeight: '400',
                            paddingRight: '3px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexGrow: '2',
                        }}
                    >
                        <span
                            style={{
                                display: 'flex',
                                fontSize: '10px',
                                // fontWeight: '400',
                                borderBottom: '1px solid white',
                                marginBottom: '5px',
                                paddingBottom: '5px',
                            }}
                        >
                            <span style={{paddingRight: '3px'}}>Speed:</span>
                            {ethObj.max === '-' ? '-' : convertSpeed(ethObj.max, t)}
                        </span>
                        <span
                            style={{
                                display: 'flex',
                                fontSize: '10px',
                                // fontWeight: '400',
                                paddingBottom: '2px',
                            }}
                        >
                            <span style={{paddingRight: '3px'}}>TX Rate:</span>
                            {convertSpeed(ethObj.tx, t)}
                        </span>
                        <span
                            style={{
                                display: 'flex',
                                fontSize: '10px',
                                // fontWeight: '300',
                            }}
                        >
                            <span style={{paddingRight: '3px'}}>RX Rate:</span>
                            {convertSpeed(ethObj.rx, t)}
                        </span>
                    </span>
                </span>
            }
            placement={key === 'tx' ? 'top' : 'bottom'}
            classes={{
                tooltip: classes.customTooltip,
            }}
            disableFocusListener
            disableTouchListener
        >
            <div
                style={{
                    display: 'flex',
                    backgroundColor: `${color}99`,
                    margin: '2px 15px',
                    position: 'relative',
                }}
            >
                <div
                    style={{
                        display: 'flex',
                        height: '24px',
                        width: `${ethObj.max === '-' ? 0 : (parseInt(ethObj[key], 10) / ethObj.max) * 100}%`,
                        backgroundColor: color,
                    }}
                />
                <Typography
                    style={{
                        display: 'flex',
                        color: 'white',
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        fontWeight: '600',
                    }}
                >
                    {ethObj.max === '-' ? '-' : convertSpeed(ethObj.max, t, true)}
                </Typography>
            </div>
        </Tooltip>
    );

    if (eth.max === 'notSupport') {
        return (
            <span
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    height: '56px',
                    color: colors.tagTxt,
                }}
            >{trans('radioNotAvailableLbl')}</span>);
    } else if (eth.status === 'notAvailable') {
        return (
            <span
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    height: '56px',
                    color: colors.tagTxt,
                }}
            >{trans('radioNotAvailableLbl')}</span>
        );
    } else if (eth.status === 'down') {
        return (
            <span
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'space-around',
                    height: '56px',
                    color: colors.tagTxt,
                }}
            >{trans('downLbl')}</span>
        );
    }
    return (<div
        className="progress"
        style={{
            display: 'flex',
            flexDirection: 'column',
            margin: '5px 0px',
        }}
    >
        {progressBar(eth, theme.palette.primary.light, 'tx', trans, ethernetNumber)}
        {progressBar(eth, theme.palette.secondary.main, 'rx', trans, ethernetNumber)}
    </div>);
};

const styles = {
    customTooltip: {
        backgroundColor: '#323232',
        boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.24), 0px 0px 2px rgba(0, 0, 0, 0.12)',
        borderRadius: '0px',
    },
};

class NodeInformation extends Component {
    constructor(props) {
        super(props);

        const fnNames = [
            'handleRequestSortTableFn',
            'handleSelectAllClickTableFn',
            'handleSelectClickTableFn',
            'handleChangePageTableFn',
            'handleChangeItemsPerPageTableFn',
            'handleSelectRadioClickTableFn',
            'handleSearchTableFn',
            'handleContextMenuTableFn',
            'handleContextMenuCloseTableFn',
            'createContextMenuOptions',
            'createFilterMenuOptions',
            'convertTblData',
            'sortByHeader',
            'handlefilterMenuOpen',
            'setFilter',
            'searchNodeStatus',
            'handleExport',
            'getTableHeader'
        ];

        window.__.each(fnNames, (fnName) => {
            this[fnName] = this[fnName].bind(this);
        });
        this.t = this.props.t;
        this.timeout = 0;
        this.state = {
            filterMenu: {
                anchorEl: null,
                clientX: 0,
                clientY: 0,
                listItems: [],
            },
            contextMenu: {
                anchorEl: null,
                clientX: 0,
                clientY: 0,
                listItems: [],
            },
            searchKey: '',
            cachedSearchKey: '',
            table: {
                tblHeaders: {
                    Headers: [
                        {
                            header: 'hostname',
                            headerLabel: this.props.t('hostname'),
                            canSort: true,
                        },
                        {
                            header: 'sn',
                            headerLabel: this.props.t('sn'),
                            canSort: true,
                        },
                        {
                            header: 'mac',
                            headerLabel: this.props.t('mac'),
                            canSort: true,
                        },
                        {
                            header: 'status',
                            headerLabel: this.props.t('status'),
                            canSort: true,
                        },
                        {
                            header: 'model',
                            headerLabel: this.props.t('model'),
                            canSort: true,
                        },
                        {
                            header: 'firmwareVersion',
                            headerLabel: this.props.t('firmwareVersion'),
                            canSort: true,
                        },
                        {
                            header: 'eth0',
                            headerLabel: this.props.t('eth0'),
                            canSort: true,
                        },
                        {
                            header: 'eth1',
                            headerLabel: this.props.t('eth1'),
                            canSort: true,
                        },
                        {
                            header: 'radio0',
                            headerLabel: this.props.t('radio0'),
                            canSort: true,
                        },
                        {
                            header: 'radio1',
                            headerLabel: this.props.t('radio1'),
                            canSort: true,
                        },
                        {
                            header: 'radio2',
                            headerLabel: this.props.t('radio2'),
                            canSort: true,
                        },
                    ],
                    sortBy: 'hostname',
                    sorting: 'asc',
                },
                tblFooter: {
                    itemsPerPage: 5,
                    currentPage: 0,
                    rowsPerPageOptions: [1, 5, 10, 15, 20],
                    helper: <span />,
                },
                tblSelector: {
                    selectedId: [
                        // '001',
                    ],
                },
                tblToggle: {
                    enableSort: true,
                    enableFooter: true,
                    enableHeader: true,
                    // enableSelect: true,
                    // enablePaper: true,
                    // enableContextMenu: true,
                    // enableRadioSelect: true,
                },
            },
        };
    }

    getTableHeader() {
        return {
            ...this.state.table.tblHeaders,
            Headers: this.state.table.tblHeaders.Headers.map(
                (header) => {
                    return {
                        ...header,
                        headerLabel: this.props.t(header.header)
                    }
                }
            ),
        }
    }

    componentDidMount() {
        this.mounted = true;
        document.addEventListener('click', (e) => {
            if (this.mounted) {
                this.setState({
                    contextMenu: {
                        ...this.state.contextMenu,
                        anchorEl: null,
                    },
                    ...((
                        e.target.id !== 'funnelIconButton' &&
                        e.target.id !== 'funnelIconImage' &&
                        e.target.id !== 'funnelIconImageSvg' &&
                        e.target.id !== 'funnelIconSvg') && {
                        filterMenu: {
                            ...this.state.filterMenu,
                            anchorEl: null,
                        },
                    }),
                });
            }
        });
        // this.mounted = true;
    }

    componentWillUnmount() {
        this.mounted = false;
    }

    static getDerivedStateFromProps(props, state) {
        if ((props.searchKey !== state.cachedSearchKey)) {
            return {
                searchKey: props.searchKey,
                cachedSearchKey: props.searchKey,
            };
        }
        return null;
    }

    setFilter(key) {
        this.setState({
            filterMenu: {
                ...this.state.filterMenu,
                anchorEl: null,
            },
        }, () => this.props.updateStatusKey(key));
    }

    async handleExport() {
        const checkHyphens = value => (value === '-' || value === undefined ? '-' : value);
        const checkRadio = (value) => {
            if (typeof value === 'object') {
                return 'Enabled';
            }
            if (typeof value === 'string') {
                if (value === 'radioNotAvailableLbl') {
                    return '-';
                }
                if (value === 'radioDisableLbl') {
                    return 'Disabled';
                }
            }
            return '-';
        };
        const checkEth = (value, key) => {
            if (typeof value === 'object') {
                return value[key];
            }
            return '-';
        };

        const {t, projectIdList, projectId} = this.props;
        const projectName = projectIdList[projectId] ?? '';
        const nwManifestName = typeof window.nw !== 'undefined' ? window.nw.App.manifest.window.title : undefined;
        const namePrefix = getOemNameOrAnm(nwManifestName);
        const currentTime = moment().format('YYYY-MM-DD-hh-mm-ss');
        const exportName = `${namePrefix}_${projectName}_node-info_${currentTime}.csv`;

        const tableData = this.convertTblData(true);
        const exportDataRows = tableData.map((tableRow) => {
            let radio2 = ['-', '-', '-'];
            if (tableRow.radio2) {
                radio2 = [
                    checkRadio(tableRow.radio2),
                    checkHyphens(tableRow.radio2.channelBandwidth),
                    convertUnit(tableRow.radio2.tx, t, true), convertUnit(tableRow.radio2.rx, t, true)];
            }
            const exportDataRow = [
                checkHyphens(tableRow.hostname), checkHyphens(tableRow.sn),
                checkHyphens(tableRow.mac), checkHyphens(capitalize(tableRow.status)),
                checkHyphens(tableRow.model), checkHyphens(tableRow.firmwareVersion),
                tableRow.eth0.status === 'up' ? 'Up' : (() =>
                    (tableRow.eth0.status === 'down' ? 'Down' : '-'))(),
                convertSpeed(checkEth(tableRow.eth0, 'max'), t),
                convertUnit(checkEth(tableRow.eth0, 'tx'), t, true),
                convertUnit(checkEth(tableRow.eth0, 'rx'), t, true),
                tableRow.eth1.status === 'up' ? 'Up' : (() =>
                    (tableRow.eth1.status === 'down' ? 'Down' : '-'))(),
                convertSpeed(checkEth(tableRow.eth1, 'max'), t),
                convertUnit(checkEth(tableRow.eth1, 'tx'), t, true),
                convertUnit(checkEth(tableRow.eth1, 'rx'), t, true),
                checkRadio(tableRow.radio0),
                checkHyphens(tableRow.radio0.channelBandwidth) !== '-' ?
                    checkHyphens(tableRow.radio0.channelBandwidth.split('|')[0].trim()).split('|')[0].trim() :
                    '-',
                checkHyphens(tableRow.radio0.channelBandwidth) !== '-' ?
                    checkHyphens(tableRow.radio0.channelBandwidth.split('|')[1].trim()).split('|')[0].trim() :
                    '-',
                convertUnit(tableRow.radio0.tx, t, true), convertUnit(tableRow.radio0.rx, t, true),
                checkRadio(tableRow.radio1),
                checkHyphens(tableRow.radio1.channelBandwidth) !== '-' ?
                    checkHyphens(tableRow.radio1.channelBandwidth.split('|')[0].trim()).split('|')[0].trim() :
                    '-',
                checkHyphens(tableRow.radio1.channelBandwidth) !== '-' ?
                    checkHyphens(tableRow.radio1.channelBandwidth.split('|')[1].trim()).split('|')[0].trim() :
                    '-',
                convertUnit(tableRow.radio1.tx, t, true), convertUnit(tableRow.radio1.rx, t, true), ...radio2,
                tableRow.isHostNode ? 'Yes' : 'No',
            ];
            return exportDataRow;
        });

        const arrayHeader = [
            'Hostname', 'S/N', 'MAC', 'Status', 'Model', 'Version',
            'ETH 0 Status', 'ETH 0 Speed', 'ETH 0 TX RATE', 'ETH 0 RX RATE',
            'ETH 1 Status', 'ETH 1 Speed', 'ETH 1 TX RATE', 'ETH 1 RX RATE',
            'Radio 0 Status', 'Radio 0 Channel/Central Frequency',
            'Radio 0 Channel Bandwidth', 'Radio 0 TX Rate', 'Radio 0 RX Rate',
            'Radio 1 Status', 'Radio 1 Channel/Central Frequency',
            'Radio 1 Channel Bandwidth', 'Radio 1 TX Rate', 'Radio 1 RX Rate',
            'Radio 2 Status', 'Radio 2 Channel Bandwidth', 'Radio 2 TX Rate', 'Radio 2 RX Rate',
            'Is Host Node',
        ];
        const exportArray = [arrayHeader, ...exportDataRows];
        const linkAlignmentCsvFactory = new CsvZipFactory();
        let csv = ''
        exportArray.forEach((line) => {
            csv += linkAlignmentCsvFactory.createLine(line);
        })
        const blobData = [csv];
        const blob = new Blob(blobData, {type: 'application/octet-stream'});
        const {data} = await wrapper(saveAs(blob, exportName, '.csv'));
        if (data.success) {
            this.props.toggleSnackBar(this.t('downloadCompleted'));
        }
    }

    searchNodeStatus(nodeIp) {
        const {nodeStatus} = this.props;

        if (nodeStatus.find(node => node.id === nodeIp)) {
            const {isManaged, isReachable} = nodeStatus.find(node => node.id === nodeIp);
            // if (isAuth && isAuth === 'unknown') {
            //     return 'unknown';
            // }
            return isManaged ? (() => (isReachable ? 'reachable' : 'unreachable'))() : 'unmanaged';
        }
        return 'unmanaged';
    }

    convertTblData(exportArray) {
        const {
            table: {
                tblToggle,
                tblSelector,
            },
        } = this.state;
        const {
            nodeStatus,
            nodeStat,
            nodeLinkInfo,
            nodeInfo,
            statusKey,
            searchKey,
            enableSearch,
            t
        } = this.props;

        const searchChannelBandWidth = (nodeIp, radio) => {
            const selectedLink = Object.keys(nodeLinkInfo)
                .filter(link => nodeLinkInfo[link].latestUpdate)
                .find(link => link.includes(`${nodeIp}${radio}`));
            return selectedLink ? (() => {
                const {info} = nodeLinkInfo[selectedLink];
                return info.band === '5' ?
                    `CH ${info.channel} | ${info.channelBandwidth}` :
                    `${info.frequency} | ${info.channelBandwidth}`;
            })() : '-';
        };

        const createRadio = (nodeIp, radio, radioStatus = false) => {
            if (this.searchNodeStatus(nodeIp) === 'unmanaged') {
                return 'radioNotAvailableLbl';
            }
            if (radioStatus) {
                const idx = parseInt(radio[radio.length - 1], 10);
                if (radioStatus[idx] === '2' ||
                    radioStatus[idx] === '0') {
                    return 'radioDisableLbl';
                }
            }
            if (searchChannelBandWidth(nodeIp, radio) === '-') {
                return {tx: '-', rx: '-', channelBandwidth: '-'};
            }
            return {
                tx: get(nodeStat[nodeIp], [`radio${radio[radio.length - 1]}`, 'speed', 'tx', 'runtime']) || '-',
                rx: get(nodeStat[nodeIp], [`radio${radio[radio.length - 1]}`, 'speed', 'rx', 'runtime']) || '-',
                channelBandwidth: searchChannelBandWidth(nodeIp, radio),
            };
        };

        const createEth = (nodeIp, eth, ethStatus = false) => {
            let status = 'up';
            let tx = '-';
            let rx = '-';
            let max = '-';
            if (this.searchNodeStatus(nodeIp) === 'unmanaged') {
                status = 'notAvailable';
                return {
                    status,
                    tx,
                    rx,
                    max,
                };
            }
            if (ethStatus) {
                const idx = parseInt(eth[eth.length - 1], 10);
                if (ethStatus[idx] === '0' ||
                    ethStatus[idx] === '2') {
                    status = 'down';
                    return {
                        status,
                        tx,
                        rx,
                        max,
                    };
                } else if (typeof ethStatus[idx] === 'undefined') {
                    status = 'notAvailable';
                    return {
                        status,
                        tx,
                        rx,
                        max,
                    };
                }
            }
            tx = get(nodeStat[nodeIp], [eth, 'speed', 'tx', 'runtime']) || '-';
            rx = get(nodeStat[nodeIp], [eth, 'speed', 'rx', 'runtime']) || '-';
            max = get(nodeStat[nodeIp], [eth, 'speed', 'tx', 'max']) || '-';
            return {
                status,
                tx,
                rx,
                max,
            };
        };

        const tblData = nodeStatus.map((node) => {
            const radioStatus = get(nodeInfo, [node.id, 'radioStatus']) || [];
            const ethStatus = get(nodeInfo, [node.id, 'ethStatus']) || [];
            const newData = {
                isHostNode: Boolean(node.isHostNode),
                hostname: get(nodeInfo, [node.id, 'hostname']) || '-',
                sn: get(nodeInfo, [node.id, 'sn']) || '-',
                mac: get(nodeInfo, [node.id, 'mac']) || convertIpToMac(node.id),
                model: get(nodeInfo, [node.id, 'model']) || '-',
                firmwareVersion: get(nodeInfo, [node.id, 'firmwareVersion']) || '-',
                status: this.searchNodeStatus(node.id),
                id: node.id,
                nodeIp: node.id,
                eth0: createEth(node.id, 'eth0', ethStatus),
                eth1: createEth(node.id, 'eth1', ethStatus),
                radio0: createRadio(node.id, 'R0', radioStatus),
                radio1: createRadio(node.id, 'R1', radioStatus),
                ...(radioStatus.length > 2 ? {radio2: createRadio(node.id, 'R2', radioStatus)} :
                    {radio2: 'radioNotAvailableLbl'}),
                operationMode: node.operationMode,
                isAuth: node.isAuth,
                isReachable: node.isReachable,
                isManaged: node.isManaged,
            };
            return newData;
        });

        
        let newTblData = deepClone(tblData);
        // console.log('kenny_debug --- newTblData');
        // console.log(newTblData);
        // console.log(nodeStat);

        if (statusKey !== 'all') {
            newTblData = filterByKey(newTblData, statusKey);
        }

        if (tblToggle.enableSort) {
            this.sortByHeader(newTblData);
        }

        if (enableSearch) {
            newTblData = searchData(newTblData, searchKey, this.props.t);
        }
        return exportArray ? newTblData : newTblData.map((dataRow) => {
            const newDataRow = {
                ...deepClone(dataRow),
                hostname: createHostnameElement(
                    dataRow.hostname,
                    dataRow.isHostNode,
                    dataRow.isAuth,
                    dataRow.isReachable,
                    dataRow.isManaged,
                    dataRow.operationMode,
                    dataRow.id,
                    this.props.preloadIcon,
                    this.props.handleContextMenuOpen,
                ),
                status: createChipElement(dataRow.status,
                    tblSelector.selectedId.includes(dataRow.id), t),
                eth0: createEthElement(dataRow.eth0, this.props.classes, this.props.t, '0'),
                eth1: createEthElement(dataRow.eth1, this.props.classes, this.props.t, '1'),
                radio0: createRadioElement(dataRow.radio0, this.props.t),
                radio1: createRadioElement(dataRow.radio1, this.props.t),
                radio2: createRadioElement(dataRow.radio2, this.props.t),
            };
            return newDataRow;
        });
    }

    createContextMenuOptions(selectedId) {
        const {nodeStatus} = this.props;

        const addToList = selectedId.some(id =>
            nodeStatus.some(node =>
                node.id === id &&
                !node.isManaged
            )
        );
        const removeFromList = selectedId.some(id =>
            nodeStatus.some(node =>
                node.id === id &&
                node.isManaged
            )
        );

        return [
            (addToList && {
                key: 'addManagedList',
                title: 'MANAGED DEVICE LIST',
                icon: <AddCircleIcon style={{color: colors.black75, fontSize: '20px'}} />,
                callback: () => console.log('clickAddManagedDeviceList'),
                selected: false,
            }),
            (removeFromList && {
                key: 'removeManagedList',
                title: 'MANAGED DEVICE LIST',
                icon: <RemoveCircleIcon style={{color: colors.black75, fontSize: '20px'}} />,
                callback: () => console.log('clickRemoveManagedDeviceList'),
                selected: false,
            }),
        ].filter(Boolean);
    }

    createFilterMenuOptions() {
        const {statusKey} = this.props;
        return [
            {
                key: 'all',
                title: this.props.t('filterMenuTitleAll'),
                callback: () => this.setFilter('all'),
                selected: statusKey === 'all',
            },
            {
                key: 'reachable',
                title: this.props.t('filterMenuTitleReachable'),
                callback: () => this.setFilter('reachable'),
                selected: statusKey === 'reachable',
            },
            {
                key: 'unreachable',
                title: this.props.t('filterMenuTitleUnreachable'),
                callback: () => this.setFilter('unreachable'),
                selected: statusKey === 'unreachable',
            },
            {
                key: 'managed',
                title: this.props.t('filterMenuTitleManaged'),
                callback: () => this.setFilter('managed'),
                selected: statusKey === 'managed',
            },
            {
                key: 'unmanaged',
                title: this.props.t('filterMenuTitleUnmanaged'),
                callback: () => this.setFilter('unmanaged'),
                selected: statusKey === 'unmanaged',
            },
        ];
    }

    handleContextMenuTableFn(event, id) {
        let {selectedId} = this.state.table.tblSelector;
        event.preventDefault();
        console.log('handleContextMenuTableFn(event): ', event.type, id);
        if (event.type === 'contextmenu') {
            selectedId = selectedId.includes(id) ? selectedId : [id];
            const listItems = this.createContextMenuOptions(selectedId);
            this.setState({
                contextMenu: {
                    ...this.state.contextMenu,
                    clientX: event.clientX,
                    clientY: event.clientY - 48,
                    anchorEl: event.currentTarget,
                    listItems,
                },
                table: {
                    ...this.state.table,
                    tblSelector: {
                        ...this.state.table.tblSelector,
                        selectedId,
                    },
                },
            });
        }
    }

    handleContextMenuCloseTableFn(event) {
        event.preventDefault();
        this.setState({
            contextMenu: {
                ...this.state.contextMenu,
                anchorEl: null,
            },
        });
    }

    handleSearchTableFn(searchKey) {
        this.setState({
            searchKey,
        }, () => {
            if (this.timeout) {
                clearTimeout(this.timeout);
            }
            this.timeout = setTimeout(() => {
                this.props.updateSearchKey(searchKey);
            }, 500);
        });
    }

    handleRequestSortTableFn(event, property) {
        const {tblHeaders} = this.state.table;

        let sorting = 'asc';
        if (tblHeaders.sortBy === property && tblHeaders.sorting === 'asc') {
            sorting = 'desc';
        }
        this.setState({
            table: {
                ...this.state.table,
                tblHeaders: {
                    ...this.state.table.tblHeaders,
                    sortBy: property,
                    sorting,
                },
            },
        });
    }

    handleChangePageTableFn(event, page) {
        this.setState({
            table: {
                ...this.state.table,
                tblFooter: {
                    ...this.state.table.tblFooter,
                    currentPage: page,
                },
            },
        });
    }

    handleChangeItemsPerPageTableFn(event) {
        this.setState({
            table: {
                ...this.state.table,
                tblFooter: {
                    ...this.state.table.tblFooter,
                    itemsPerPage: event.target.value,
                    currentPage: 0,
                },
            },
        });
    }

    handleSelectAllClickTableFn(event, checked, selectedId) {
        if (checked) {
            this.setState({
                table: {
                    ...this.state.table,
                    tblSelector: {
                        ...this.state.table.tblSelector,
                        selectedId,
                    },
                },
            });
            return;
        }
        this.setState({
            table: {
                ...this.state.table,
                tblSelector: {
                    ...this.state.table.tblSelector,
                    selectedId: [],
                },
            },
        });
    }

    handleSelectRadioClickTableFn(event, id) {
        const newSelectedId = [id];

        this.setState({
            table: {
                ...this.state.table,
                tblSelector: {
                    ...this.state.table.tblSelector,
                    selectedId: newSelectedId,
                },
            },
        });
    }

    handleSelectClickTableFn(event, id) {
        const {selectedId} = this.state.table.tblSelector;
        const selectedIdIndex = selectedId.indexOf(id);
        let newSelectedId = [];


        if (selectedIdIndex === -1) {
            newSelectedId = newSelectedId.concat(selectedId, id);
        } else if (selectedIdIndex === 0) {
            newSelectedId = newSelectedId.concat(selectedId.slice(1));
        } else if (selectedIdIndex === selectedId.length - 1) {
            newSelectedId = newSelectedId.concat(selectedId.slice(0, -1));
        } else if (selectedIdIndex > 0) {
            newSelectedId = newSelectedId.concat(
                selectedId.slice(0, selectedIdIndex),
                selectedId.slice(selectedIdIndex + 1)
            );
        }

        this.setState({
            table: {
                ...this.state.table,
                tblSelector: {
                    ...this.state.table.tblSelector,
                    selectedId: newSelectedId,
                },
            },
        });
    }

    sortByHeader(data) {
        const {tblHeaders} = this.state.table;
        const sorting = (order, orderBy) => (order === 'desc' ?
            (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
            :
            (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1)
        );
        const txRxSorting = (order, orderBy) => (order === 'desc' ?
            (a, b) => {
                if (typeof b[orderBy] === 'string' || typeof a[orderBy] === 'string') {
                    if (typeof b[orderBy] === 'string' && typeof a[orderBy] === 'string') {
                        return 0;
                    }
                    return typeof b[orderBy] === 'string' ? -1 : 1;
                } else if (b[orderBy].tx === '-' || a[orderBy].tx === '-') {
                    if (b[orderBy].tx === '-' && a[orderBy].tx === '-') {
                        return 0;
                    }
                    return b[orderBy].tx === '-' ? -1 : 1;
                }
                return (parseInt(b[orderBy].tx, 10) + parseInt(b[orderBy].rx, 10)) <
                (parseInt(a[orderBy].tx, 10) + parseInt(a[orderBy].rx, 10)) ? -1 : 1;
            }
            :
            (a, b) => {
                if (typeof b[orderBy] === 'string' || typeof a[orderBy] === 'string') {
                    if (typeof b[orderBy] === 'string' && typeof a[orderBy] === 'string') {
                        return 0;
                    }
                    return typeof a[orderBy] === 'string' ? -1 : 1;
                } else if (b[orderBy].tx === '-' || a[orderBy].tx === '-') {
                    if (b[orderBy].tx === '-' && a[orderBy].tx === '-') {
                        return 0;
                    }
                    return a[orderBy].tx === '-' ? -1 : 1;
                }
                return (parseInt(a[orderBy].tx, 10) + parseInt(a[orderBy].rx, 10)) <
                (parseInt(b[orderBy].tx, 10) + parseInt(b[orderBy].rx, 10)) ? -1 : 1;
            }
        );
        if (tblHeaders.sortBy.startsWith('radio') || tblHeaders.sortBy.startsWith('eth')) {
            data.sort(
                txRxSorting(tblHeaders.sorting, tblHeaders.sortBy)
            );
        } else {
            data.sort(
                sorting(tblHeaders.sorting, tblHeaders.sortBy)
            );
        }
    }

    handlefilterMenuOpen(e) {
        this.setState({
            filterMenu: {
                ...this.state.filterMenu,
                anchorEl: document.getElementById('funnelIconImage'),
                clientX: e.clientX - 142,
                clientY: e.clientY - 48,
                listItems: this.createFilterMenuOptions(),
            },
        });
    }

    render() {
        const {
            table, filterMenu, searchKey,
        } = this.state;
        const {
            t, statusKey, isHostNodeFetch, enableSearch, nodeStatus,
        } = this.props;

        const exportACL = nodeStatus.length !== 0 ? (
            <div
                key="export"
            >
                <P2Tooltip
                    title={t('exportButtonLbl')}
                    content={
                        <IconButton
                            style={{
                                padding: '7px',
                                paddingTop: '7px',
                                width: '30px',
                                height: '30px',
                            }}
                            onClick={this.handleExport}
                            key="exportIconButton"
                            id="exportIconButton"
                            aria-label="remove"
                        >
                            <ExportIcon fill={colors.popupMenuItem} />
                        </IconButton>
                    }
                />
            </div>
        )
            :
            (<span key="export" />);

        const managedNodeCardTools = [
            (
                <P2Tooltip
                    key={t('searchTooltip')}
                    direction="bottom"
                    title={t('searchTooltip')}
                    content={<IconButton
                        style={{padding: '7px'}}
                        key="search-tool-1"
                        aria-label="remove"
                        onClick={() => this.props.toggleSearch()}
                    >
                        {enableSearch ?
                            <CloseIcon style={{width: '17px', height: '17px'}} /> :
                            <SearchIcon style={{width: '17px', height: '17px'}} />
                        }
                    </IconButton>}
                />
            ),
            (
                <P2Tooltip
                    key="funnelIconButton"
                    id="funnelIconButton"
                    title={t('filterTooltip')}
                    content={(
                        <IconButton
                            id="funnelIconImage"
                            style={{padding: '7px'}}
                            aria-label="remove"
                            onClick={() => { this.handlefilterMenuOpen(true); }}
                        >
                            <FunnelOutlineIcon
                                id="funnelIconImageSvg"
                                style={{paddingTop: '3px'}}
                                stroke={colors.popupMenuItem}
                                strokeWidth="1.5px"
                                fill={this.props.statusKey !== 'all' ? colors.popupMenuItem : '#ffffff00'}
                            />
                        </IconButton>
                    )}
                />
            ),
            exportACL,
        ];


        const searchBar =
        (<P2SearchBar
            value={searchKey}
            onChange={
                newValue => this.setState({searchKey: newValue})
            }
            onRequestSearch={this.handleSearchTableFn}
            disableCloseButton
        />);

        const cardContent = (
            <React.Fragment>
                <P2Table
                    tblHeaders={{
                        ...this.getTableHeader(),
                        parentHeaders: [
                        {
                            idx: 6,
                            colspan: 5,
                            header: this.props.t('portStatus'),
                            helper: <P2Tooltip
                                direction="right"
                                title={<div style={{
                                    fontSize: '12px',
                                    padding: '2px',
                                }}
                                >
                                    {this.props.t('portStatusTooltip0')}
                                    <br />
                                    {this.props.t('portStatusTooltip1')}
                                    {/* portStatusTooltip */}
                                </div>}
                                content={(<i
                                    className="material-icons"
                                    style={{
                                        color: theme.palette.primary.light,
                                        width: '14px',
                                        fontSize: '14px',
                                        marginLeft: '5px',
                                        marginTop: '-1px',
                                    }}
                                >help</i>)}
                            />,
                        },
                    ]}}
                    tblData={this.convertTblData(false)}
                    // tblDataKey={table.tblDataKey}
                    // tblFooter={this.state.table.tblFooter}
                    tblFooter={{
                        ...table.tblFooter,
                        helper: isHostNodeFetch ?
                            (<Typography
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
                            </Typography>) : <span />,
                    }}
                    tblFunction={{
                        handleRequestSort: this.handleRequestSortTableFn,
                        handleSelectAllClick: this.handleSelectAllClickTableFn,
                        handleSelectClick: this.handleSelectClickTableFn,
                        handleChangePage: this.handleChangePageTableFn,
                        handleChangeItemsPerPage: this.handleChangeItemsPerPageTableFn,
                        handleSelectRadioClick: this.handleSelectRadioClickTableFn,
                        handleContextMenu: this.handleContextMenuTableFn,
                        handleRowSelectClick: this.handleSelectClickTableFn,
                    }}
                    tblSelector={table.tblSelector}
                    tblToggle={table.tblToggle}
                    maxWidth={(this.props.maxWidth - 70) < 1260 ? '1240px' : '100%'}
                    rowHoverEffect
                    menuPosition={this.props.menuPosition}
                />
                <P2MenuList
                    subHeader={this.t('status')}
                    key="2"
                    menuOptions={filterMenu.listItems}
                    positionX={filterMenu.clientX}
                    positionY={filterMenu.clientY}
                    anchorEl={filterMenu.anchorEl}
                />
            </React.Fragment>
        );
        const cardTItle = statusKey === 'all' ? t('title') : `${t('title')} (${t(statusKey + 'TitleStatus')})`;

        return (
            <P2CardContainer
                cardTitle={enableSearch ? searchBar : cardTItle}
                cardTitleLimit={50}
                cardTools={managedNodeCardTools}
                cardContent={cardContent}
                minWidth="1240px"
                minHeight="200px"
                showHelperTooltip={false}
            />
        );
    }
}

NodeInformation.propTypes = {
    t: PropTypes.func.isRequired,
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    updateStatusKey: PropTypes.func.isRequired,
    updateSearchKey: PropTypes.func.isRequired,
    toggleSearch: PropTypes.func.isRequired,
    toggleSnackBar: PropTypes.func.isRequired,
    searchKey: PropTypes.string.isRequired,
    statusKey: PropTypes.string.isRequired,
    enableSearch: PropTypes.bool.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    nodeInfo: PropTypes.object.isRequired,
    nodeStatus: PropTypes.arrayOf(PropTypes.object).isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    nodeStat: PropTypes.object.isRequired,
    // eslint-disable-next-line react/forbid-prop-types
    nodeLinkInfo: PropTypes.object.isRequired,
    isHostNodeFetch: PropTypes.bool.isRequired,
    projectIdList: PropTypes.objectOf(PropTypes.string).isRequired,
    projectId: PropTypes.string.isRequired,
    maxWidth: PropTypes.number,
    // eslint-disable-next-line react/forbid-prop-types
    menuPosition: PropTypes.object,
};

NodeInformation.defaultProps = {
    maxWidth: undefined,
    menuPosition: {
        open: false,
        top: 0,
        left: 0,
        ip: '',
        type: '',
    },
};


function mapStateToProps(store) {
    return {
        statusKey: store.dashboard.nodeInformation.statusKey,
        searchKey: store.dashboard.nodeInformation.searchKey,
        enableSearch: store.dashboard.nodeInformation.enableSearch,
        nodeInfo: store.meshTopology.nodeInfo,
        nodeStatus: store.meshTopology.graph.nodes.filter(node => node.id !== '127.0.0.1'),
        nodeStat: store.meshTopology.nodeStat,
        nodeLinkInfo: store.meshTopology.linkInfo,
        isHostNodeFetch: store.meshTopology.graph.nodes
            .filter(node => node.id !== '127.0.0.1').some(node => node.isHostNode),
        projectIdList: store.projectManagement.projectIdToNameMap,
        projectId: store.projectManagement.projectId,
    };
}

export default compose(
    connect(
        mapStateToProps,
        {
            updateStatusKey,
            updateSearchKey,
            toggleSearch,
            toggleSnackBar,
        }
    ),
    withTranslation(['node-information']),
    withStyles(styles)
)(NodeInformation);
