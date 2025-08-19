import React, { useEffect, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Tooltip from '@material-ui/core/Tooltip';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import CancelIcon from '@material-ui/icons/Cancel';
import CheckCircle from '@material-ui/icons/CheckCircle';
import KeyboardArrowDownIcon from '@material-ui/icons/KeyboardArrowDown';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Slide from '@material-ui/core/Slide';
import CloseIcon from '@material-ui/icons/ArrowBackIos';
import Typography from '@material-ui/core/Typography';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Constant from '../../constants/common';
import { getVersion } from '../../util/apiCall';
import {convertIpToMac} from '../../util/formatConvertor';
import P2Tooltip from '../../components/common/P2Tooltip';
import {convertSpeed} from '../../util/formatConvertor';

const {colors, theme} = Constant;

const get = (o, p) =>
    p.reduce(
        (xs, x) =>
            ((xs && xs[x]) ?
                xs[x] : null), o);

const useStyles = makeStyles({
    mdopDialog: {
        position: 'absolute',
        top: '0',
        left: '0',
        width: '780px',
        minHeight: '600px',
        backgroundColor: 'rgb(250, 250, 250)',
        zIndex: '99',
        padding: '10px',
    },
    topSection: {
        display: 'flex',
        alignItems: 'center',
    },
    middleSection: {
        marginTop: '20px',
    },
    bottomSection: {

    },
    tableWrapper: {
        // padding: '22px'
    },
    table: {
        width: '722px',
        margin: '0 auto',
    },
    bottomSectionTitle: {
        marginTop: '40px',
        paddingLeft: '30px',
        fontWeight: 500,
    },
    customTooltip: {
        backgroundColor: '#323232',
        boxShadow: '0px 2px 2px rgba(0, 0, 0, 0.24), 0px 0px 2px rgba(0, 0, 0, 0.12)',
        borderRadius: '0px',
    },
    ethSelectBtn: {
        // marginLeft: 'auto',
    },
    title: {
        marginRight: 'auto'
    }
});

const MdopInfoOverviewDialog = (props) => {
    const {
        closeFunc,
        initEth
        // open,
        // t,
    } = props;
    const classes = useStyles();
    const [t, ready] = useTranslation('node-overview-mdop-table');
    const {
        graph: {
            mdopTable,
            nodes,
            ethernetDirectEnabledList,
        },
        nodeStat,
    } = useSelector(store => store.meshTopology);

    const [curNodeData, setCurNodeData] = useState({});
    const [curMdopSection, setCurMdopSection] = useState({});
    const [mdopSectionList, setMdopSectionList] = useState([]);
    
    // eth selection icon
    const [anchorEl, setAnchorEl] = React.useState(null);
    const open = Boolean(anchorEl);
    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
      };
    const handleClose = (e) => {
        console.log(e);
        setAnchorEl(null);
    };
    const handleChangeEth = (idx) => {
        setCurMdopSection(mdopSectionList[idx]);
        setAnchorEl(null);
    };


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
                                {convertUnit(ethObj.tx, t, false)}
                            </span>
                            <span
                                style={{
                                    display: 'flex',
                                    fontSize: '10px',
                                    // fontWeight: '300',
                                }}
                            >
                                <span style={{paddingRight: '3px'}}>RX Rate:</span>
                                {convertUnit(ethObj.rx, t, false)}
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

        if (props.open) {

            // Get nodeData
            const {nodeData} = props;
            const curNode = nodes.filter(n => n.id === props.nodeIp)[0];

            if (curNode) {
                setCurNodeData(curNode);
            }
            if (curNode.mdopInfo && curNode.mdopInfo.mdopIdList) {
                const mdopIdList = curNode.mdopInfo.mdopIdList;
                const mdopSectionData = mdopIdList.map(
                    (mdopId) => {
                        if (mdopTable[mdopId]) {
                            const leader = mdopTable[mdopId]?.leader;
                            const leaderInfo = nodeData[leader];

                            const leaderHostname = leaderInfo ? leaderInfo.hostname : '';

                            const leaderMac = leaderInfo ? leaderInfo.mac : convertIpToMac(leader);     

                            const ethOfCurNode = mdopTable[mdopId]?.neighbors[props.nodeIp]?.eth;
                            
                            const neiList = Object.keys(mdopTable[mdopId].neighbors).map(
                                (neiIp) => {
                                    const nodeInfo = nodeData[neiIp] ? nodeData[neiIp] : {
                                        mac: convertIpToMac(neiIp),
                                        model: '-',
                                        hostname: '-',
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
                                    // do not dislay eth info if node is not managed
                                    if (!nodeData[neiIp]) {
                                        ethDirectEnabled = '-';
                                    }
                                    return {
                                        eth,
                                        ethStat,
                                        ethDirectEnabled,
                                        ...nodeInfo,
                                    };
                                }
                            );

                            return {
                                mdopId,
                                leader,
                                leaderInfo,
                                leaderHostname,
                                leaderMac,
                                ethOfCurNode,
                                neiList,
                            };
                        }
                    }
                );
                setMdopSectionList(mdopSectionData);
                if (mdopSectionData.length === 1) {
                    setCurMdopSection(mdopSectionData[0]);
                } else if (initEth === 'eth1' && mdopSectionData[1].ethOfCurNode === 1) {
                    setCurMdopSection(mdopSectionData[1]);
                } else {
                    setCurMdopSection(mdopSectionData[0]);
                }

            }

        }
    }, [props.open]);

    const ethOptTranslate = {
        'Eth0': t('eth0'),
        'Eth1': t('eth1')
    };

    return (
        <Slide direction="left" in={props.open} mountOnEnter unmountOnExit>
            <div
                className={classes.mdopDialog}
            >
                <div className={classes.topSection}>
                    <IconButton aria-label="delete" onClick={closeFunc}>
                        <CloseIcon />
                    </IconButton>
                    <Typography variant='body1' classes={{root: classes.title}}>
                        {t('mdopDialogHeader1')}<b>{t('mdopDialogHeader2')}</b>
                    </Typography>
                    <div>
                        {ethOptTranslate[`Eth${curMdopSection?.ethOfCurNode}`]}
                        <IconButton
                            aria-label="more"
                            aria-controls="long-menu"
                            aria-haspopup="true"
                            onClick={handleClick}
                            classes={{root: classes.ethSelectBtn}}
                        >

                            <KeyboardArrowDownIcon />
                        </IconButton>
                        <Menu
                            id="long-menu"
                            anchorEl={anchorEl}
                            keepMounted
                            open={open}
                            onClose={handleClose}
                            PaperProps={{
                            style: {
                                // maxHeight: ITEM_HEIGHT * 4.5,
                                // width: '20ch',
                            },
                            }}
                        >
                            {mdopSectionList.map((option, idx) => (
                                <MenuItem key={option?.ethOfCurNode} onClick={() => {handleChangeEth(idx)}}>
                                    {ethOptTranslate[`Eth${option?.ethOfCurNode}`]}
                                </MenuItem>
                            ))}
                        </Menu>
                    </div>
                </div>
                <div className={classes.middleSection}>
                    <Grid container>
                        <Grid item xs={6}>
                            <Typography variant='body1' align="center">
                                <b>{t('leaderLabel')}</b>
                            </Typography>
                            <Typography variant='body1' align="center">
                                {
                                    curMdopSection.leaderHostname && curMdopSection.leaderHostname.length > 36 ?
                                    (
                                        <P2Tooltip
                                            direction="right"
                                            title={<div style={{
                                                fontSize: '12px',
                                                padding: '2px',
                                            }}
                                            >
                                                {curMdopSection.leaderHostname}
                                            </div>}
                                            content={
                                                <div
                                                    style={{
                                                        marginTop: '5px',
                                                        // marginLeft: '10px',
                                                        textAlign: 'center'
                                                    }}
                                                >
                                                    {`${curMdopSection.leaderHostname.substring(0, 36)}...`}
                                                </div>
                                            }
                                        />
                                    ): (
                                        <div
                                            style={{
                                                marginTop: '5px',
                                                // marginLeft: '10px',
                                                // width: '200px',
                                                // flexBasis: 'max-content',
                                            }}
                                        >
                                            {curMdopSection.leaderHostname}
                                        </div>
                                    )
                                }
                                {`(${curMdopSection.leaderMac})`}
                            </Typography>
                        </Grid>
                        <Grid item xs={6}>
                            <Typography variant='body1' align="center">
                                <b>{t('noOfMdopMembersLabel')}</b>
                            </Typography>
                            <Typography variant='body1' align="center">
                                {curMdopSection.neiList?.length}
                            </Typography>
                        </Grid>
                    </Grid>
                </div>
                <div className={classes.bottomSection}>
                    <Typography variant='body1' align="left" classes={{body1: classes.bottomSectionTitle}}>
                        {t('mdopTableHeader')}
                    </Typography>
                    <TableContainer classes={{root: classes.tableWrapper}}>
                        <Table className={classes.table}>
                            <TableHead>
                                <TableRow>
                                    <TableCell align="center">{t('hotnameHeader')}</TableCell>
                                    <TableCell align="center">{t('modelHeader')}</TableCell>
                                    <TableCell align="center">{t('macHeader')}</TableCell>
                                    <TableCell align="center" style={{width: '170px'}}>{t('portStatusHeader')}</TableCell>
                                    <TableCell align="center">{t('ethernetDirectLinkHeader')}</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {curMdopSection.neiList?.map((row) => (
                                    <TableRow key={row.mac}>
                                    <TableCell align="center">
                                        {
                                            row && row.hostname.length > 30 ?
                                            (
                                                <P2Tooltip
                                                    direction="right"
                                                    title={<div style={{
                                                        fontSize: '12px',
                                                        padding: '2px',
                                                    }}
                                                    >
                                                        {row.hostname}
                                                    </div>}
                                                    content={
                                                        <div
                                                            style={{
                                                                marginTop: '5px',
                                                                // marginLeft: '10px',
                                                                width: '200px',
                                                                textAlign: 'center'
                                                            }}
                                                        >
                                                            {`${row.hostname.substring(0, 30)}...`}
                                                        </div>
                                                    }
                                                />
                                            ): (
                                                <div
                                                    style={{
                                                        marginTop: '5px',
                                                        // marginLeft: '10px',
                                                        width: '200px',
                                                        flexBasis: 'max-content',
                                                    }}
                                                >
                                                    {row.hostname}
                                                </div>
                                            )
                                        }
                                    </TableCell>
                                    <TableCell align="center">{row.model}</TableCell>
                                    <TableCell align="center">{row.mac}</TableCell>
                                    <TableCell align="center" style={{padding: '6px'}}>
                                        {createEthElement(row.ethStat, classes, t, `${row.eth}`)}
                                    </TableCell>
                                    <TableCell align="center">
                                        {
                                            row.ethDirectEnabled === '-' ? '-' : 
                                            (row.ethDirectEnabled ? (<CheckCircle style={{color: 'rgb(15 157 88)'}}/>) :
                                            (<CancelIcon style={{color: 'rgb(222, 53, 124)'}}/>))
                                        }
                                    </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </div>
            </div>
        </Slide>
    );
};

MdopInfoOverviewDialog.propTypes = {
    // t: PropTypes.func.isRequired,
    closeFunc: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    nodeIp: PropTypes.string.isRequired,
};

export default MdopInfoOverviewDialog;