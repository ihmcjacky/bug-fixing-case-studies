import React, {useState, useEffect} from 'react';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import DraggableModel from '../../../../components/topology/DraggableModel';

const styles = {
    wrapper: {
        // width: '100%',
        // height: '100%',
        position: 'absolute',
        top: 0,
        left: 0,
        backgroundColor: 'rgb(0, 0, 0, 0)',
        zIndex: '100',
    },
};
const useStyle = makeStyles(styles);

const DraggableModelCtrl = (props) => {
    const {
        close, pollingHandler,
        nodes, nodeInfo,
        clickPos,
        initIndex,
        initData,
        containerX, containerY,
    } = props;
    const {lastUpdateTime, graph: {nodes: graphNodeData}} = useSelector((state) => state.meshTopology);
    
    const classes = useStyle();
    const [onTop, setOnTop] = useState('');

    useEffect(() => {
        setOnTop(nodes[nodes.length - 1]);
    }, [nodes]);

    function getZIndex(ip) {
        if (onTop === ip) return 200;
        return 100;
    }

    function handleClickTitle(ip) {
        setOnTop(ip);
    }

    function getGraphData(ip) {
        if (graphNodeData) {
            return graphNodeData.find(node => node.id === ip);
        }
        return null;
    }

    if (nodes.length === 0) return null;
    let xPos = clickPos.x;
    let yPos = clickPos.y;
    if (containerX - xPos < 800) xPos = containerX - 800;
    if (containerY - yPos < 650) yPos = containerY - 650;
    if (yPos < 0) yPos = 0;
    if (xPos < 0) xPos = 0;

    return (
        <div className={classes.wrapper} >
            {nodes.map(nodeIp => (
                <div
                    style={{
                        position: 'absolute',
                        zIndex: getZIndex(nodeIp),
                        width: 0,
                    }}
                    key={nodeIp}
                >
                    <DraggableModel
                        nodes={[{
                            ipv4: nodeIp,
                            hostname: nodeInfo[nodeIp].hostname,
                            model: nodeInfo[nodeIp].model,
                            fwVersion: nodeInfo[nodeIp].firmwareVersion,
                        }]}
                        nodeInfo={nodeInfo[nodeIp]}
                        close={close}
                        handleClickTitle={handleClickTitle}
                        initPos={{x: xPos, y: yPos}}
                        initIndex={initIndex}
                        pollingHandler={pollingHandler}
                        initData={initData}
                        graphNodeData={getGraphData(nodeIp)}
                        lastUpdateTime={lastUpdateTime}
                    />
                </div>
            ))}
        </div>
    );
};

DraggableModelCtrl.propTypes = {
    close: PropTypes.func.isRequired,
    nodes: PropTypes.arrayOf(PropTypes.string).isRequired,
    nodeInfo: PropTypes.objectOf(
        PropTypes.shape({
            ip: PropTypes.string,
            model: PropTypes.string,
            firmwareVersion: PropTypes.string,
            hostname: PropTypes.string,
        })).isRequired,
    clickPos: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
    initIndex: PropTypes.number.isRequired,
    pollingHandler: PropTypes.shape({
        restartInterval: PropTypes.func.isRequired,
        stopInterval: PropTypes.func.isRequired,
    }).isRequired,
    containerX: PropTypes.number.isRequired,
    containerY: PropTypes.number.isRequired,
};


export default DraggableModelCtrl;
