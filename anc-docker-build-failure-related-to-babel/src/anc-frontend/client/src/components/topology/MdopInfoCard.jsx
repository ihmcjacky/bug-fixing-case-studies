import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Card from '@material-ui/core/Card';
import {Transition} from 'react-transition-group';
import { useTranslation } from 'react-i18next';
import Typography from '@material-ui/core/Typography';
import PeopleIcon from '@material-ui/icons/People';
import PersonIcon from '@material-ui/icons/Person';
import PlaceIcon from '@material-ui/icons/Place';
import {useSelector} from 'react-redux';
import Badge from '@material-ui/core/Badge';
import {withStyles} from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import MeshInfoCard from './MeshInfoCard';
import Constant from '../../constants/common';
import P2Tooltip from '../../components/common/P2Tooltip';
import {convertIpToMac} from '../../util/formatConvertor';
import {convertSpeed} from '../../util/formatConvertor';

const duration = 500;
const {theme} = Constant;
const StyledWrapper = styled.div`
  & .button {
    transform: scale(0.8);
  }
  & .button1 {
    transform: scale(0.8) rotate(65deg);
  }
  & .button2 {
    transform: scale(0.8) rotate(22.5deg);
  }
  & .button3 {
    transform: scale(0.8) rotate(-22.5deg);
  }
  & .button4 {
    transform: scale(0.8) rotate(-65deg);
  }
  & .button0 {
    transform: scale(0.8) rotate(110deg);
  }
`;
const fadeOrg = {
    transition: `opacity ${duration}ms ease-in-out`,
    position: 'fixed',
    opacity: 0,
    bottom: 0,
    right: 0,
};
const fade = {
    entering: {
        position: 'static',
        opacity: 0,
    },
    entered: {
        position: 'static',
        opacity: 1,
    },
    exiting: {
        position: 'static',
        display: 'none',
        opacity: 0,
    },
    exited: {
        position: 'fixed',
        top: -600,
        right: 0,
        opacity: 0,
    },
};

const ethNumber2DeviceName = ['eth0', 'eth1'];

const StyledBadge = withStyles((theme) => ({
    badge: {
      right: 7,
      top: 22,
    },
}))(Badge);

const MdopInfoCard = function (props) {

    const graph = useSelector(store => store.meshTopology.graph);
    const allNodeInfo = useSelector(store => store.meshTopology.nodeInfo);
    const allNodeStat = useSelector(store => store.meshTopology.nodeStat);
    const {mdopTable, ethernetDirectEnabledList} = graph;
    const [t, ready] = useTranslation('node-overview-mdop-table');
    const style = {
        position: 'absolute',
        left: 0,
        top: 0,
        width: '0px',
        height: '0px',
        zIndex: '10',
    };
    const {
        open,
        x, y,
        nodeInfo,
        isLoading,
        targetIp,
        classes,
        mdopId,
    } = props;
    const cardStyle = {
        position: 'absolute',
        left: x,
        top: y,
        width: '250px',
        zIndex: '11',
        // height: '352px',
    };
    const getEthSpeed = () => {
        console.log('getEthSpeed');
        try {
            const eth = mdopTable[mdopId].neighbors[targetIp].eth;
            console.log(eth);
            if (eth === undefined || (eth !== 0 && eth !== 1)) return;
            const deviceName = ethNumber2DeviceName[eth];
            console.log(deviceName);
            if (
                allNodeStat[targetIp] &&
                allNodeStat[targetIp][deviceName])
            {
                const nodeEthStat = allNodeStat[targetIp][deviceName]?.speed?.tx?.max;
                if (nodeEthStat !== undefined) {
                    console.log(nodeEthStat);
                    return convertSpeed(nodeEthStat, t);
                }
            }
            return '-';
        } 
        catch(e) {
            return '-';
        }
    }

    const getEth = () => {
        if (!mdopTable || !mdopTable[mdopId]) {
            return 'eth0';
        }
        const number = mdopTable[mdopId].neighbors[targetIp].eth;
        if (number === undefined) {
            return 'eth0';
        }
        return `eth${number}`;
    }
    const getEthImg = () => {
        if (!mdopTable || !mdopTable[mdopId]) {
            return '/img/mdop_eth0.png';
        }
        const number = mdopTable[mdopId].neighbors[targetIp].eth;
        if (number === undefined) {
            return '/img/mdop_eth0.png';
        }
        return `/img/eth${number}_active.png`;
    }
    const isMdopLeader = (ip) => {
        if (!mdopTable || !mdopTable[mdopId]) {
            return false;
        }
        const mdopLeader = mdopTable[mdopId].leader;
        if (ip === mdopLeader) {
            return true;
        }
        return false;
    }
    const getEthDirectIcon = () => {
        let link = '/img/eth_direct_off.svg';
        try {
            const eth = mdopTable[mdopId].neighbors[targetIp].eth;
            const isEthDirectEnable = ethernetDirectEnabledList[targetIp][eth];
            if (isEthDirectEnable) {
                link = '/img/eth_direct_on.svg';
            }
        } catch(e) {
            console.log('getEthDirectIcon');
            console.log(e);
            link = '/img/eth_direct_off.svg';
        }
        return link;
    }
    const getEthDirectTooltipTitle = () => {
        let link = t('ethernetDirectNotEstablishedLabelTooltip');
        try {
            const eth = mdopTable[mdopId].neighbors[targetIp].eth;
            const isEthDirectEnable = ethernetDirectEnabledList[targetIp][eth];
            if (isEthDirectEnable) {
                link = t('ethernetDirectLabelEstablishedTooltip');
            }
        } catch(e) {
            console.log('getEthDirectTooltipTitle');
            console.log(e);
            link = t('ethernetDirectNotEstablishedLabelTooltip');
        }
        return link;
    }
    const numberOfMdopMember = () => {
        if (!mdopTable || !mdopTable[mdopId] || !mdopTable[mdopId].neighbors) {
            return "0";
        }
        return Object.keys(mdopTable[mdopId].neighbors).length;
    }
    const getMdopMemberList = () =>  {
        if (!mdopTable || !mdopTable[mdopId]) {
            return (<div />);
        }
        const mdopList = Object.keys(mdopTable[mdopId].neighbors).filter(ip => ip !== targetIp);
        let listToShow = mdopList;
        if (isMdopLeader(targetIp) && mdopList.length > 2) {
            listToShow = [
                mdopList[0],
                mdopList[1]
            ]
        } else if (!isMdopLeader(targetIp) && mdopList.length > 2) {
            const mdopLeader = listToShow.filter(ip => isMdopLeader(ip))[0];
            const nonMdopLeader = listToShow.filter(ip => !isMdopLeader(ip))[0];
            listToShow = [
                mdopLeader,
                nonMdopLeader,
            ]
        }
        return listToShow.map(
            (ip) => {
                if (!allNodeInfo[ip]) {
                    return (
                        <Typography
                            style={{
                                fontSize: '12px',
                                fontWeight: '400',
                                padding: '10px',
                                paddingBottom: '0px',
                                color: theme.palette.primary.main,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                width: '140px'
                            }}
                            variant="body2"
                        >
                            {convertIpToMac(ip)}
                        </Typography>
                    );
                }
                const info = allNodeInfo[ip];
                return (
                    <div key={ip}>
                        <div className={classes.listItemWrapper}>
                            <img
                                src={`/img/king.svg`}
                                alt="eth"
                                // width="48"
                                style={{
                                    width: '19px',
                                    marginLeft: '19px',
                                    marginTop: '6px',
                                    marginRight: '4px',
                                    opacity: isMdopLeader(ip) ? 1 : 0,
                                }}
                            />
                            <Typography
                                style={{
                                    fontSize: '12px',
                                    fontWeight: '400',
                                    padding: '10px',
                                    paddingBottom: '0px',
                                    color: theme.palette.primary.main,
                                    overflow: 'hidden',
                                    whiteSpace: 'nowrap',
                                    textOverflow: 'ellipsis',
                                    width: '140px'
                                }}
                                variant="body2"
                            >
                                {info.hostname}
                                <br />
                                <span style={{color: 'rgb(122, 122, 122)'}}>
                                    {info.mac}
                                </span>
                            </Typography>
                            <PlaceIcon
                                style={{
                                    marginLeft: '18px',
                                    marginTop: '22px',
                                    cursor: 'pointer',
                                    color: 'rgba(226, 62, 87, 1)',
                                }}
                                onClick={() => props.zoomToNode(ip)}
                            />
                        </div>
                    </div>
                );
            }
        );
    }
    function getCard() {
            return (
                <Card style={cardStyle}>
                    <Typography
                        style={{
                            fontSize: '18px',
                            padding: '10px',
                            paddingBottom: '0px',
                            color: theme.palette.primary.main,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                        }}
                        variant="body2"
                    >
                        <b>{props.nodeInfo.hostname}</b>
                    </Typography>
                    <Typography
                        style={{
                            fontSize: '16px',
                            fontWeight: '400',
                            padding: '10px',
                            paddingBottom: '0px',
                            paddingTop: '0px',
                            color: theme.palette.primary.main,
                            overflow: 'hidden',
                            whiteSpace: 'nowrap',
                            textOverflow: 'ellipsis',
                        }}
                        variant="subtitle1"
                    >
                        {t('mdopCardTitle')}
                    </Typography>
                    <div className={classes.iconListWrapper}>
                        <StyledBadge
                            color="secondary"
                            badgeContent={numberOfMdopMember()}
                            anchorOrigin={{
                                vertical: 'bottom',
                                horizontal: 'right',
                            }}
                        >
                            <PersonIcon
                                style={{
                                    marginLeft: '10px',
                                    // marginTop: '6px',
                                    fontSize:"55px"
                                }}
                            />
                        </StyledBadge>
                        <div
                            style={
                                {
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                }
                            }
                        >
                            <img
                                src={`${getEthImg()}`}
                                alt="eth"
                                // width="48"
                                style={{
                                    width: '34px',
                                    height: '34px',
                                    marginLeft: '2px',
                                }}
                            />
                            <Typography>
                                {getEthSpeed()}
                            </Typography>
                        </div>

                        {/* <img
                            src={`/img/mdop_eth_speed_1g.svg`}
                            alt="eth"
                            // width="48"
                            style={{
                                width: '38px',
                                marginLeft: '43px',
                                marginRight: '58px',
                            }}
                        /> */}
                        {/* <img
                            src={`${getEthDirectIcon()}`}
                            alt="eth"
                            // width="48"
                            style={{
                                width: '33px',
                                marginLeft: '10px',
                                marginRight: '21px',
                                marginTop: '-10px',
                            }}
                        /> */}
                        <P2Tooltip
                            key={'ethDirect'}
                            direction="top"
                            title={getEthDirectTooltipTitle()}
                            // title={'Ethernet Direct Link established'}
                            content={
                                <img
                                    src={`${getEthDirectIcon()}`}
                                    alt="eth"
                                    // width="48"
                                    style={{
                                        width: '33px',
                                        marginLeft: '10px',
                                        marginRight: '21px',
                                        marginTop: '-10px',
                                    }}
                                />
                            }
                        />
                    </div>
                    <Divider variant="middle"/>
                    <div className={classes.titleWrapper}>
                        <PeopleIcon
                            style={{
                                marginLeft: '18px',
                                marginTop: '6px',
                                opacity: 0,
                            }}
                        />
                        <Typography
                            style={{
                                fontSize: '12px',
                                fontWeight: '400',
                                padding: '10px',
                                paddingBottom: '0px',
                                color: theme.palette.primary.main,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                width: '140px'
                            }}
                            variant="body2"
                        >
                            {t('mdopCardMemberListTitle')}
                        </Typography>
                        <PlaceIcon
                            style={{
                                marginLeft: '18px',
                                marginTop: '6px',
                                color: 'rgba(226, 62, 87, 1)',
                                opacity: '0'
                            }}
                            // onClick={() => props.zoomToNode(ip)}
                        />
                    </div>
                    <div className={classes.listItemWrapper}>
                        <img
                            src={`/img/king.svg`}
                            alt="eth"
                            // width="48"
                            style={{
                                width: '19px',
                                marginLeft: '19px',
                                marginTop: '6px',
                                marginRight: '4px',
                                opacity: isMdopLeader(targetIp) ? 1 : 0,
                            }}
                        />
                        <Typography
                            style={{
                                fontSize: '12px',
                                fontWeight: '400',
                                padding: '10px',
                                paddingBottom: '0px',
                                color: theme.palette.primary.main,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                width: '140px'
                            }}
                            variant="body2"
                        >
                            {nodeInfo.hostname}({t('mdopCardCurrentLabel')})
                            <br />
                            <span style={{color: 'rgb(122, 122, 122)'}}>
                                {nodeInfo.mac}
                            </span>
                        </Typography>
                        <PlaceIcon
                            style={{
                                marginLeft: '18px',
                                marginTop: '22px',
                                color: 'rgba(226, 62, 87, 1)',
                                cursor: 'pointer',
                            }}
                            onClick={() => props.zoomToNode(targetIp)}
                        />
                    </div>
                    {getMdopMemberList()}
                    <Typography
                            style={{
                                fontSize: '13px',
                                fontWeight: '400',
                                marginTop: '10px',
                                marginBottom: '10px',
                                color: theme.palette.primary.main,
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                width: '100%',
                                textAlign: 'center',
                                cursor: 'pointer',
                            }}
                            variant="body2"
                            onClick={
                                (e) => {
                                    props.openDraggableBox(targetIp, 0, {x: e.clientX, y: e.clientY}, true, getEth());
                                }
                            }
                        >
                            {t('mdopCardLoadMoreLabel')}
                        </Typography>
                </Card>
            );
    }
    return (
        <StyledWrapper style={style} className="wrapper">
            <Transition in={open} timeout={duration}>
                {state => (
                    <div
                        style={{
                            ...fadeOrg,
                            ...fade[state],
                        }}
                    >
                        {getCard()}
                    </div>
                )}
            </Transition>
        </StyledWrapper>
    );
};
MdopInfoCard.propTypes = {
    // containerWidth: PropTypes.number.isRequired,
    open: PropTypes.bool.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    nodeInfo: PropTypes.object.isRequired, // eslint-disable-line
    // t: PropTypes.func.isRequired, // eslint-disable-line
    isLoading: PropTypes.bool.isRequired,
    targetIp: PropTypes.string.isRequired,
    mdopId: PropTypes.string.isRequired,
    zoomToNode: PropTypes.func.isRequired,
    openDraggableBox: PropTypes.func.isRequired,
};

// export default PopupMenu;
const styles = {
    tooltipRoot: {
        whiteSpace: 'nowrap',
        backgroundColor: '#323232',
        transform: 'scale(1.4)',
    },
    iconListWrapper: {
        // height: '10px',
        // paddingLeft: '5px',
        padding: '5px',
        marginBottom: '10px',
        display: 'flex',
        justifyContent: 'space-between',
    },
    iconList: {
        // height: '10px',
        width: '20%',
        color: 'red',
        padding: '0',
    },
    titleWrapper: {
        display: 'flex'
    },
    listItemWrapper: {
        display: 'flex'
    }
};

// export default compose(
//     translate(['cluster-topology-node-info-card']),
//     withStyles(styles))(MdopInfoCard);

export default withStyles(styles)(MdopInfoCard);
