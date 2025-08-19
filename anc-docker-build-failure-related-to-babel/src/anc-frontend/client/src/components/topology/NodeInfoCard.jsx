import React from 'react';
import PropTypes from 'prop-types';
// import {compose} from 'redux';
// import {translate} from 'react-i18next';
// import Icon from '@material-ui/core/Icon';
import styled from 'styled-components';
import {Transition} from 'react-transition-group';
import {withStyles} from '@material-ui/core/styles';
import MeshInfoCard from './MeshInfoCard';
// import BusyInfoCard from './busyInfoCard';

// import {withStyles} from '@material-ui/core/styles';x
/* eslint-disable react/forbid-prop-types */
// class PopupMenu extends React.Component {
//     render() {
//         if(!this.props.open)
//             return null;
//         return <div>123</div>;
//
//     }
// }
const duration = 500;

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

const NodeInfoCard = function (props) {
    const style = {
        position: 'absolute',
        left: 0,
        top: 0,
        // backgroundColor: 'red',
        width: '0px',
        height: '0px',
        zIndex: '10',
        // width: '0px',
        // height: '0px',
    };
    const {
        open,
        x, y,
        nodeInfo,
        isLoading,
        targetIp,
        nodeStatus,
    } = props;
    function getCard() {
        // console.log(yPos);
        if (isLoading) {
            return (
                <MeshInfoCard
                    x={x}
                    y={y}
                    status="loading"
                    info={{
                        hostname: '',
                        ip: targetIp,
                        sn: '...',
                        model: '...',
                        mac: '...',
                        fwVersion: '...',
                        uptime: '...',
                        interface: {
                            eth: [{ifName: 'eth0', status: '1'}],
                            radio: [{ifName: 'radio0', status: '1'}],
                        },
                        lastUpdateTime: '...',
                        nodeStatus: '...',
                    }}
                />
            );
        }
        if (nodeInfo && nodeInfo.sn) {
            const ethStatus = nodeInfo.ethStatus.map(
                (i, idx) => ({
                    ifName: `eth${idx}`,
                    status: i,
                })
            );
            const radioStatus = nodeInfo.radioStatus.map(
                (i, idx) => ({
                    ifName: `radio${idx}`,
                    status: i,
                })
            );
            return (
                <MeshInfoCard
                    x={x}
                    y={y}
                    status="notLoading"
                    info={{
                        ip: targetIp,
                        hostname: nodeInfo.hostname,
                        fwVersion: nodeInfo.firmwareVersion,
                        sn: nodeInfo.sn,
                        model: nodeInfo.model,
                        mac: nodeInfo.mac,
                        uptime: `${nodeInfo.uptime}`,
                        interface: {
                            eth: ethStatus,
                            radio: radioStatus,
                        },
                        lastUpdateTime: nodeInfo.lastUpdateTime,
                        nodeStatus: nodeStatus,
                    }}
                />
            );
        }
        //  else if (props.nodeData.all[props.nodeData.cur] === 'The node is busy. Please try again later') {
        //     return (
        //         <BusyInfoCard
        //             x={xPos}
        //             y={yPos}
        //             ip={targetIp}
        //             msg={props.t('deviceBusy')}
        //         />
        //     );
        // }
        return (
            <MeshInfoCard
                x={x}
                y={y}
                status="loading"
                info={{
                    hostname: '',
                    ip: targetIp,
                    fwVersion: '-',
                    sn: '-',
                    model: '-',
                    mac: '-',
                    uptime: '0',
                    interface: {
                        eth: [{ifName: '1', status: 0}],
                        radio: [{ifName: '0', status: 0}],
                    },
                    lastUpdateTime: '-',
                    nodeStatus: '-',
                }}
            />
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
NodeInfoCard.propTypes = {
    // containerWidth: PropTypes.number.isRequired,
    open: PropTypes.bool.isRequired,
    x: PropTypes.number.isRequired,
    y: PropTypes.number.isRequired,
    nodeInfo: PropTypes.object.isRequired, // eslint-disable-line
    // t: PropTypes.func.isRequired, // eslint-disable-line
    isLoading: PropTypes.bool.isRequired,
    targetIp: PropTypes.string.isRequired,
    nodeStatus: PropTypes.string.isRequired,
};

// export default PopupMenu;
const styles = {
    tooltipRoot: {
        whiteSpace: 'nowrap',
        backgroundColor: '#323232',
        transform: 'scale(1.4)',
    },
};

// export default compose(
//     translate(['cluster-topology-node-info-card']),
//     withStyles(styles))(NodeInfoCard);

export default withStyles(styles)(NodeInfoCard);
