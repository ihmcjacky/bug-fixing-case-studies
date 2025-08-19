import React, { useEffect, useRef, useState, useMemo } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Tooltip from '@material-ui/core/Tooltip';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import Box from '@material-ui/core/Box';
import Collapse from '@material-ui/core/Collapse';
import CheckCircle from '@material-ui/icons/CheckCircle';
import CancelIcon from '@material-ui/icons/Cancel';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import {convertIpToMac} from '../../../../util/formatConvertor';
import TablePagination from '@material-ui/core/TablePagination';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Slide from '@material-ui/core/Slide';
import CloseIcon from '@material-ui/icons/ArrowBackIos';
import KeyboardArrowUpIcon from '@material-ui/icons/KeyboardArrowUp';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import TableFooter from '@material-ui/core/TableFooter';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import P2Tooltip from '../../../../components/common/P2Tooltip';
import P2CardContainer from '../../../../components/common/P2CardContainer';
import Constant from '../../../../constants/common';
import {getNodeColor, getNodeIconImage} from '../topology/topologyGraphHelperFunc';
import {convertSpeed} from '../../../../util/formatConvertor';

const {colors, theme} = Constant;

const get = (o, p) =>
    p.reduce(
        (xs, x) =>
            ((xs && xs[x]) ?
                xs[x] : null), o);



const useRowStyles = makeStyles({
    root: {
        '& > *': {
        borderBottom: 'unset',
        },
        '&:hover': {
            backgroundColor: 'rgba(66, 85, 129, 0.1)',
        }
    },
});

const createHostnameElement = (hostname, isHostNode, isAuth, isReachable, isManaged, operationMode, preloadIcon) => {
    return (hostname.length > 20 ?
        (<P2Tooltip
            direction="right"
            title={<div style={{
                fontSize: '12px',
                padding: '2px',
            }}
            >
                {hostname}
            </div>}
            content={
                <div 
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        cursor: 'pointer',
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
                display: 'flex',
                justifyContent: 'center',
                cursor: 'pointer',
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
                    flexBasis: 'max-content',
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
}

function Row(props) {
    const {row, preloadIcon, helperFunc:{ createEthElement, t, handleContextMenuOpen}} = props;
    const [open, setOpen] = React.useState(false);
    const classes = useRowStyles();

    const getEthDirectIcon = (enabled) => {
        if (enabled) {
            return (<CheckCircle style={{color: 'rgb(15 157 88)'}}/>);
        }
        return (<CancelIcon style={{color: 'rgb(222, 53, 124)'}}/>);
    }

    return (
        <React.Fragment>
            <TableRow className={classes.root}>
                <TableCell width="10%" align="center">
                    <IconButton aria-label="expand row" size="small" onClick={() => setOpen(!open)}>
                        {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                    </IconButton>
                </TableCell>
                <TableCell
                    align="center"
                    onContextMenu={(e) => {
                        if (row.leaderIsAuth !== 'yes') {
                            e.preventDefault();
                            return
                        }
                        handleContextMenuOpen(e, row.leader, row.leaderIsManaged ? 'nodeMenu' : 'unmanagedNodeMenu');
                    }}
                >
                    {/* {row.leaderHostname} */}
                    {
                        createHostnameElement(
                            row.leaderHostname,
                            row.leaderIsHostNode,
                            row.leaderIsAuth,
                            row.leaderIsReachable,
                            row.leaderIsManaged,
                            row.leaderOperationMode,
                            preloadIcon
                        )
                    }
                </TableCell>
                <TableCell align="center">{row.leaderModel}</TableCell>
                <TableCell align="center">{row.leaderMac}</TableCell>
                <TableCell align="center">{row.neiList.length}</TableCell>
                <TableCell align="center" style={{padding: '6px'}}>
                    {row.leaderEthStat ? createEthElement(row.leaderEthStat, classes, t, `${row.leaderEth}`) : '-'}
                </TableCell>
                <TableCell align="center">
                    {
                        row.leaderHostname === '-' ? '-' : getEthDirectIcon(row.ethDirectEnabled)
                    }
                </TableCell>
            </TableRow>
            <TableRow>
                <TableCell style={{padding: 0}} colSpan={7}>
                    <Collapse in={open} timeout="auto" unmountOnExit>
                        <div>
                            {/* <Typography variant="h6" gutterBottom component="div">
                                History
                            </Typography> */}
                            <Table >
                                <TableHead>
                                    <TableRow style={{visibility: 'collapse'}}>
                                        <TableCell width="10%" align="center"></TableCell>
                                        <TableCell width="20%" align="center">Hostname</TableCell>
                                        <TableCell width="10%" align="center">Model</TableCell>
                                        <TableCell width="10%" align="center">MAC</TableCell>
                                        <TableCell width="15%" align="center">No. of MDOP members</TableCell>
                                        <TableCell width="400px" align="center">Port Status</TableCell>
                                        <TableCell width="15%" align="center">Ethernet Direct</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {
                                        row.neiList
                                        // only show non-leader node
                                        .filter(n => n.ip !== row.leader)
                                        .map(
                                            (nei) => {
                                                return (
                                                    <TableRow key={nei.mac} className={classes.root}>
                                                        <TableCell width="10%" align="center">
                                                            {/* <IconButton aria-label="expand row" size="small" style={{opacity: 0}}>
                                                                {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                                                            </IconButton> */}
                                                        </TableCell>
                                                        <TableCell
                                                            align="center"
                                                            onContextMenu={
                                                                (e) => {
                                                                    if (nei.isAuth !== 'yes') {
                                                                        e.preventDefault();
                                                                        return;
                                                                    }
                                                                    handleContextMenuOpen(e, nei.ip, nei.isManaged ? 'nodeMenu' : 'unmanagedNodeMenu');
                                                                }
                                                            }
                                                        >
                                                            {
                                                                createHostnameElement(
                                                                    nei.hostname,
                                                                    nei.isHostNode,
                                                                    nei.isAuth,
                                                                    nei.isReachable,
                                                                    nei.isManaged,
                                                                    nei.operationMode,
                                                                    preloadIcon
                                                                )
                                                            }
                                                        </TableCell>
                                                        <TableCell align="center">{nei.model}</TableCell>
                                                        <TableCell align="center">{nei.mac}</TableCell>
                                                        <TableCell align="center">/</TableCell>
                                                        <TableCell align="center" style={{padding: '6px'}}>
                                                            {nei.ethStat ? createEthElement(nei.ethStat, classes, t, `${nei.eth}`) : '-'}
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            {
                                                                nei.hostname === '-' ? '-' : getEthDirectIcon(nei.ethDirectEnabled)
                                                            }
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            }
                                        )
                                    }
                                </TableBody>
                            </Table>
                        </div>
                    </Collapse>
                </TableCell>
            </TableRow>
        </React.Fragment>
    );
};

const useStyles = makeStyles({
    titleWrapper: {
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        fontFamily: 'Roboto',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        verticalAlign: 'middle',
        // color: 'rgba(33, 33, 33, 0.785)',
        color: Constant.theme.palette.txt.normal,
        marginBlockStart: '20px',
        marginBlockEnd: '20px',
    },
    pagination: {
        paddingRight: 25,
    },
});

const MdopInformation = (props) => {
    const {
        closeFunc,
        // open,
        // t,
        handleContextMenuOpen,
        preloadIcon,
    } = props;
    const classes = useStyles();
    const [t, ready] = useTranslation('mdop-information');
    const {
        graph: {
            mdopTable,
            nodes,
            ethernetDirectEnabledList
        },
        nodeStat,
        nodeInfo
    } = useSelector(store => store.meshTopology);
    
    const headerInfo = [
        {
            header: 'hostname',
            headerLabel: t('hostname'),
            canSort: true,
            width: '20%'
        },
        {
            header: 'model',
            headerLabel: t('model'),
            canSort: true,
            width: '10%'
        },
        {
            header: 'mac',
            headerLabel: t('mac'),
            canSort: true,
            width: '10%'
        },
        {
            header: 'numberOfMDOPMembers',
            headerLabel: t('noOfMdopMember'),
            canSort: true,
            width: '15%'
        },
        {
            header: 'leaderEthStat',
            headerLabel: t('portStatus'),
            canSort: true,
            width: '400px'
        },
        {
            header: 'ethernetDirect',
            headerLabel: t('ethernetDirectLink'),
            canSort: true,
            width: '15%'
        },
    ];

    const [curNodeData, setCurNodeData] = useState({});
    const [curMdopSection, setCurMdopSection] = useState({});
    const [mdopSectionList, setMdopSectionList] = useState([]);
    const [selectedIdx, setSelectedIdx] = useState(0);

    const [sortingInfo, setSortingInfo] = useState({
        sortBy: 'Hostname',
        order: 'asc'
    });

    const [pagingInfo, setPagingInfo] = useState(
        {
            itemsPerPage: 5,
            currentPage: 0,
            rowsPerPageOptions: [1, 5, 10, 15, 20],
        }
    );

    const handleChangeItemsPerPageTableFn = (event) => {
        setPagingInfo({
            ...pagingInfo,
            itemsPerPage: event.target.value,
            currentPage: 0,
        });
    }

    const handleChangePageTableFn = (event, page) => {
        setPagingInfo({
            ...pagingInfo,
            currentPage: page,
        });
    }

    const searchNodeStatus = (nodeIp) => {

        if (nodes.find(node => node.id === nodeIp)) {
            const {isManaged, isReachable} = nodes.find(node => node.id === nodeIp);
            return isManaged ? (() => (isReachable ? 'reachable' : 'unreachable'))() : 'unmanaged';
        }
        return 'unmanaged';
    }
    
    const createEth = (nodeIp, eth, ethStatus = false) => {
        let status = 'up';
        let tx = '-';
        let rx = '-';
        let max = '-';
        if (searchNodeStatus(nodeIp) === 'unmanaged') {
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

    const getEthDirect = (nodeIp, eth) => {
        
        if (!ethernetDirectEnabledList) {
            return false;
        }
        if (ethernetDirectEnabledList[nodeIp] && typeof ethernetDirectEnabledList[nodeIp][eth] !== undefined) {
            return ethernetDirectEnabledList[nodeIp][eth];
        }
        return false;
    }

    // onEnter function 
    useEffect(() => {
        const nodeData = nodeInfo;
        const nodeMap = {};
        nodes.forEach(
            (node) => {
                nodeMap[node.id] = node;
            }
        );
        // const curNode = nodes.filter(n => n.id === props.nodeIp)[0];
        const mdopSectionData = Object.keys(mdopTable).map(
            (mdopId) => {
                if (mdopTable[mdopId]) {
                    const leader = mdopTable[mdopId]?.leader;

                    if (!leader) return;

                    
                    const leaderNode = nodeMap[leader];
                    const leaderInfo = nodeData[leader];
                    const leaderHostname = leaderInfo ? leaderInfo.hostname : '-';
                    const leaderModel = leaderInfo ? leaderInfo.model : '-';
                    const leaderMac = leaderInfo ? leaderInfo.mac : convertIpToMac(leader);

                    const leaderOperationMode = leaderNode && leaderNode.operationMode ? leaderNode.operationMode : 'meshOnly';
                    const leaderIsHostNode = leaderNode ? leaderNode.isHostNode : false;
                    const leaderIsManaged = leaderNode ? leaderNode.isManaged : false;
                    const leaderIsAuth = leaderNode ? leaderNode.isAuth : false;
                    const leaderIsReachable = leaderNode ? leaderNode.isReachable : false;
                    

                    let leaderEth;
                    let leaderEthStat;
                    const neiList = Object.keys(mdopTable[mdopId].neighbors).map(
                        (neiIp) => {
                            const node = nodeMap[neiIp];
                            const operationMode = node && node.operationMode ? node.operationMode : 'meshOnly';
                            const isHostNode = node ? node.isHostNode : false;
                            const isManaged = node ? node.isManaged : false;
                            const isAuth = node ? node.isAuth : false;
                            const isReachable = node ? node.isReachable : false;

                            const nodeInfo = nodeData[neiIp] ? nodeData[neiIp] : {
                                hostname: '-',
                                model: '-',
                                mac: convertIpToMac(neiIp),
                            };
                            const eth = mdopTable[mdopId]?.neighbors[neiIp]?.eth;
                            let ethName = null;
                            let ethStat = null;
                            let ethDirectEnabled = null;
                            if (eth !== undefined ) {
                                ethName = eth === 0 ? 'eth0' : 'eth1';
                                ethStat = createEth(neiIp, ethName, nodeInfo.ethStatus);
                                ethDirectEnabled = getEthDirect(neiIp, eth);
                            }
                            if (nodeInfo.mac === leaderMac) {
                                leaderEth = eth;
                                leaderEthStat = ethStat;
                            }
                            return {
                                ip: neiIp,
                                eth,
                                ethStat,
                                ethDirectEnabled,
                                operationMode,
                                isHostNode,
                                isManaged,
                                isAuth,
                                isReachable,
                                ...nodeInfo,
                            };
                        }
                    );
                    
                    const numberOfMDOPMembers = neiList.length;
                    const ethDirectEnabled = getEthDirect(leader, leaderEth);
                    // console.log('getEthDirect- kenny');
                    // console.log(ethDirectEnabled);
                    return {
                        mdopId,
                        leader,
                        leaderOperationMode,
                        leaderModel,
                        leaderIsHostNode,
                        leaderIsManaged,
                        leaderIsAuth,
                        leaderIsReachable,
                        leaderInfo,
                        leaderHostname,
                        leaderMac,
                        leaderEth,
                        leaderEthStat,
                        numberOfMDOPMembers,
                        ethDirectEnabled,
                        neiList,
                    };
                }
            }
        );
        setMdopSectionList(mdopSectionData);
        setCurMdopSection(mdopSectionData[selectedIdx]);
    }, [nodeStat, nodeInfo, mdopTable, nodes]);

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

    let numberOfSegments = 0;
    if (mdopTable) {
        numberOfSegments = Object.keys(mdopTable).length;
    }

    const cardTitle = (
        <div className={classes.titleWrapper}>
            <Typography variant='body1' align="left">
                {`${t('title')} (${t('titleNoOfSeg')} ${numberOfSegments})`}
            </Typography>
        </div>
    );
    
    const handleRequestSort = (label) => {
        // console.log('handleRequestSort');
        if (sortingInfo.sortBy === label) {
            setSortingInfo({
                sortBy: label,
                order: sortingInfo.order === 'asc' ? 'desc' : 'asc',
            });
        } else {
            setSortingInfo({
                sortBy: label,
                order: sortingInfo.order,
            });
        }
    }
    const listForDisplay = useMemo(
        () => {
            // console.log('request to sort');
            // console.log(sortingInfo);
            let list = [...mdopSectionList];
            // console.log(mdopSectionList);
            const sortingFunc = (order, orderBy) => (order === 'desc' ?
                (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
                :
                (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1)
            );
            const txRxSortingFunc = (order, orderBy) => (order === 'desc' ?
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
                    // console.log('a')
                    // console.log(a)
                    // console.log('b')
                    // console.log(b)
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
            if (sortingInfo.sortBy === 'leaderEthStat') {
                list.sort(
                    txRxSortingFunc(sortingInfo.order, sortingInfo.sortBy)
                );
            } else {
                list.sort(
                    sortingFunc(sortingInfo.order, sortingInfo.sortBy)
                );
            }
            // console.log(pagingInfo);
            // console.log(pagingInfo.currentPage * pagingInfo.itemsPerPage);
            // console.log((pagingInfo.currentPage * pagingInfo.itemsPerPage) + pagingInzfo.itemsPerPage);
            list = list.slice(
                pagingInfo.currentPage * pagingInfo.itemsPerPage,
                (pagingInfo.currentPage * pagingInfo.itemsPerPage) + pagingInfo.itemsPerPage
            );
            return list;

        }, [sortingInfo, mdopSectionList, pagingInfo]
    );

    const getTableCell  = (header) => {
        return (
            <TableSortLabel
                active={sortingInfo.sortBy === header.header}
                direction={sortingInfo.order}
                onClick={() => {handleRequestSort(header.header)}}
            >
                <span style={{paddingLeft: '20px'}}>
                    {header.headerLabel}
                </span>
            </TableSortLabel>
        );
    };

    const cardContent = (
        <React.Fragment>
            <TableContainer classes={{root: classes.tableWrapper}}>
                <Table className={classes.table}>
                    {/* <caption>* Leader Node</caption> */}
                    <TableHead>
                        <TableRow>
                            <TableCell align="center" width="10%"></TableCell>
                            {
                                headerInfo.map(
                                    (header) => {
                                        return (
                                            <TableCell width={header.width} align="center">
                                                {getTableCell(header)}
                                            </TableCell>
                                        );
                                    }
                                )
                            }
                            {/* <TableCell width="20%" align="center">{getTableCell('Hostname')}</TableCell>
                            <TableCell width="10%" align="center">{getTableCell('Model')}</TableCell>
                            <TableCell width="10%" align="center">{getTableCell('MAC')}</TableCell>
                            <TableCell width="200px" align="center">{getTableCell('No. of MDOP members')}</TableCell>
                            <TableCell width="20%" align="center">{getTableCell('Port Status')}</TableCell>
                            <TableCell width="10%" align="center">{getTableCell('Ethernet Direct')}</TableCell> */}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {listForDisplay.map((row) => (
                            <Row key={row.mdopId} row={row} preloadIcon={preloadIcon} helperFunc={{createEthElement, t, handleContextMenuOpen}}/>
                        ))}
                    </TableBody>
                    {/* <TableFooter>

                    </TableFooter> */}
                </Table>
                <div style={{marginTop: 'auto', paddingRight: '10px'}}>
                    {/* <Typography variant='subtitle1' align="left" classes={{subtitle1: classes.footer}}>
                        * Leader Node
                    </Typography> */}
                    <TablePagination
                        component="div"
                        count={mdopSectionList.length}
                        rowsPerPage={pagingInfo.itemsPerPage}
                        page={pagingInfo.currentPage}
                        rowsPerPageOptions={pagingInfo.rowsPerPageOptions}
                        backIconButtonProps={{
                            'aria-label': t('previousPageLbl'),
                        }}
                        nextIconButtonProps={{
                            'aria-label': t('nextPageLbl'),
                        }}
                        labelRowsPerPage={t('labelRowsPerPage')}
                        labelDisplayedRows={({from, to, count}) => (<span>{t('labelDisplayedRows1')}
                            {from}{t('labelDisplayedRows2')}{to}{t('labelDisplayedRows3')}{count}</span>)}
                        onChangePage={handleChangePageTableFn}
                        onChangeRowsPerPage={handleChangeItemsPerPageTableFn}
                        classes={{
                            toolbar: classes.pagination,
                        }}
                    />
                </div>
            </TableContainer>
        </React.Fragment>
    );

    return (
        <P2CardContainer
            cardTitle={cardTitle}
            cardTitleLimit={50}
            cardTools={null}
            cardContent={cardContent}
            minWidth="1240px"
            minHeight="200px"
            showHelperTooltip={false}
        />
    );
};

MdopInformation.propTypes = {
};

export default MdopInformation;