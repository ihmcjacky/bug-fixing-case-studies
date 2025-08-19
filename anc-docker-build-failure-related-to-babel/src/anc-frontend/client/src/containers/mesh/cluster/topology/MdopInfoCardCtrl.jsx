import React from 'react';
import PropTypes from 'prop-types';
// import {connect} from 'react-redux';
// import {compose} from 'redux';
// import {withStyles} from '@material-ui/core/styles';
import MdopInfoCard from '../../../../components/topology/MdopInfoCard';

const MdopInfoCardCtrl = (props) => {
    const {
        open,
        clickPos: {x, y},
        containerY,
        graphNodeInfo,
        targetIp,
        mdopId,
    } = props;

    if (targetIp === '' || !open) return null;

    const nodeInfo = graphNodeInfo[targetIp] || {};
    const isLoading = typeof graphNodeInfo[targetIp] === 'undefined';
    let xPos = x - 360;
    let yPos = y - 80;
    // let xPos = x;
    // let yPos = y;
    // console.log('xPos 0');
    // console.log(xPos);
    // console.log('yPos 0');
    // console.log(yPos);
    if (x < 360) {
        xPos += 420;
    }
    if (y < 90) {
        yPos = 44;
    }
    if (y + 300 > containerY) {
        yPos -= 300;
    }
    // console.log('xPos');
    // console.log(xPos);
    // console.log('yPos');
    // console.log(yPos);
    return (
        <div>
            <MdopInfoCard
                open={open}
                x={xPos}
                y={yPos}
                containerHeight={containerY}
                nodeInfo={nodeInfo}
                isLoading={isLoading}
                targetIp={targetIp}
                mdopId={mdopId}
                zoomToNode={props.zoomToNode}
                openDraggableBox={props.openDraggableBox}
            />
        </div>
    );
};

MdopInfoCardCtrl.defaultProps = {
    containerY: 0,
};

MdopInfoCardCtrl.propTypes = {
    open: PropTypes.bool.isRequired,
    clickPos: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
    mdopId: PropTypes.string,
    containerY: PropTypes.number,
    targetIp: PropTypes.string.isRequired,
    graphNodeInfo: PropTypes.object.isRequired, // eslint-disable-line
    zoomToNode: PropTypes.func.isRequired,
    openDraggableBox: PropTypes.func.isRequired,
};

export default MdopInfoCardCtrl;
