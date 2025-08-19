import React from 'react';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
// import {connect} from 'react-redux';
// import {compose} from 'redux';
// import {withStyles} from '@material-ui/core/styles';
import NodeInfoCard from '../../../../components/topology/NodeInfoCard';

function searchNodeStatus(nodeIp, nodeStatus) {
    if (nodeStatus.find(node => node.id === nodeIp)) {
        const {isManaged, isReachable} = nodeStatus.find(node => node.id === nodeIp);
        // if (isAuth && isAuth === 'unknown') {
        //     return 'unknown';
        // }
        return isManaged ? (() => (isReachable ? 'reachable' : 'unreachable'))() : 'unmanaged';
    }
    return 'unmanaged';
}

const NodeInfoCardCtrl = (props) => {
    const nodes = useSelector((state) => state.meshTopology.graph.nodes);
    const {
        open,
        clickPos: {x, y},
        containerY,
        graphNodeInfo,
        targetIp,
    } = props;

    if (targetIp === '' || !open) return null;

    const nodeInfo = graphNodeInfo[targetIp] || {};
    const nodeStatus = searchNodeStatus(targetIp, nodes);
    const isLoading = typeof graphNodeInfo[targetIp] === 'undefined';
    let xPos = x - 240;
    let yPos = y - 80;
    if (x < 280) {
        xPos += 300;
    }
    if (y < 90) {
        yPos = 44;
    }
    if (y + 150 > containerY) {
        yPos -= 150;
    }

    return (
        <div>
            <NodeInfoCard
                open={open}
                x={xPos}
                y={yPos}
                containerHeight={containerY}
                nodeInfo={nodeInfo}
                isLoading={isLoading}
                targetIp={targetIp}
                nodeStatus={nodeStatus}
            />
        </div>
    );
};

NodeInfoCardCtrl.defaultProps = {
    containerY: 0,
};

NodeInfoCardCtrl.propTypes = {
    open: PropTypes.bool.isRequired,
    clickPos: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
    containerY: PropTypes.number,
    targetIp: PropTypes.string.isRequired,
    graphNodeInfo: PropTypes.object.isRequired, // eslint-disable-line
};

export default NodeInfoCardCtrl;
