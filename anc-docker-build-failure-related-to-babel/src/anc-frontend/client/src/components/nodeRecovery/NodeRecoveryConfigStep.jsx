import React, {useEffect, useState, useCallback, useMemo} from 'react'
import PropTypes from 'prop-types'
import {useDispatch, useSelector} from 'react-redux';
import NodeRecoveryConfigFixSecret from './NodeRecoveryConfigFixSecret';
import NodeRecoveryConfigAdjust from './NodeRecoveryConfigAdjust';
import {fetchNodeInfo} from '../../redux/meshTopology/meshTopologyActions';

let nodeInfoApiCallCounter = 0;
const FETCH_API_MAX_RETRY = 7;
const NodeRecoveryConfigStep = ({
    skip, t, handleLockLayerUpdate, handleDialogOnClose,
    handleBackFunc, handleNextFunc, handleDialogPopup,
    handleUnreachableNodeInfo, handleUpdateTopologyFailed, handleStopRecoverNode
}) => {
    const {
        nodeRecovery: {recoverState: {recoveryResult}, ip},
        meshTopology: {graph: {nodes}},
    } = useSelector(store => store);
    const [isLostNodeAuth, setIsLostNodeAuth] = useState('INITIALIZED');
    const lostNodeIp = useMemo(() => recoveryResult?.info?.nodeIp ?? '', [recoveryResult?.info?.nodeIp]);
    const getConfigLockFunc = useCallback(() => {
        handleLockLayerUpdate({
            loading: true,
            message: t('fetchingConfigDataMsg'),
        });
    }, [t, handleLockLayerUpdate]);
    const getOptionsLockFunc = useCallback(() => {
        handleLockLayerUpdate({
            loading: true,
            message: t('fetchingOptionsDataMsg'),
        });
    }, [t, handleLockLayerUpdate]);
    const setConfigLockFunc = useCallback(() => {
        handleLockLayerUpdate({
            loading: true,
            message: t('settingsConfigDataMsg'),
        });
    }, [t, handleLockLayerUpdate]);
    const unlockFunc = useCallback(() => {
        handleLockLayerUpdate({
            loading: false,
            message: '',
        });
    }, [handleLockLayerUpdate]);
    const dispatch = useDispatch();
    const handleUpdateNodeInfo = useCallback((lostNodeIp) => {
        nodeInfoApiCallCounter += 1;
        dispatch(fetchNodeInfo()).then(() => {
            nodeInfoApiCallCounter = 0;
        }).catch((err) => {
            if (nodeInfoApiCallCounter > FETCH_API_MAX_RETRY) {
                nodeInfoApiCallCounter = 0;
                handleLockLayerUpdate({
                    loading: false,
                    message: '',
                });
                handleUpdateTopologyFailed();
            } else {
                if (err.data.type === 'specific') {
                    const failedNodeList = [];
                    Object.keys(err.data.data).forEach((nodeInfoIP) => {
                        if (!(nodeInfoIP === lostNodeIp || nodeInfoIP === ip) && !err.data.data[nodeInfoIP].success) {
                            failedNodeList.push(nodeInfoIP);
                        }
                    });
                    if (failedNodeList.length > 0) {
                        handleUnreachableNodeInfo(failedNodeList);
                    }
                }
            }
        });
    }, [dispatch, handleLockLayerUpdate, handleUnreachableNodeInfo, handleUpdateTopologyFailed, ip]);
    
    useEffect(() => {
        if (!skip && lostNodeIp) {
            const lostNode = nodes.find(node => node.id === lostNodeIp);
            console.log(lostNode)
            if (lostNode?.isAuth === 'yes') {
                console.log('lost node is authed')
                setIsLostNodeAuth('YES');
                handleUpdateNodeInfo(lostNodeIp)
            } else {
                setIsLostNodeAuth('NO');
                unlockFunc();
            }
        }
    }, [skip, nodes, lostNodeIp, unlockFunc]);

    if (skip) return <span />;

    switch (isLostNodeAuth) {
        case 'INITIALIZED':
            return <span />;
        case 'NO':
            return (
                <NodeRecoveryConfigFixSecret
                    nodeIp={lostNodeIp}
                    setIsLostNodeAuth={setIsLostNodeAuth}
                    handleLockLayerUpdate={handleLockLayerUpdate}
                    handleUpdateNodeInfo={handleUpdateNodeInfo}
                    t={t}
                />
            );
        case 'YES':
            return (
                <NodeRecoveryConfigAdjust
                    t={t}
                    skip={!Boolean(lostNodeIp)}
                    lostNodeIp={lostNodeIp}
                    handleBackFunc={handleBackFunc}
                    handleNextFunc={handleNextFunc}
                    setIsLostNodeAuth={setIsLostNodeAuth}
                    getConfigLockFunc={getConfigLockFunc}
                    getOptionsLockFunc={getOptionsLockFunc}
                    setConfigLockFunc={setConfigLockFunc}
                    unlockFunc={unlockFunc}
                    handleDialogPopup={handleDialogPopup}
                    handleDialogOnClose={handleDialogOnClose}
                    handleStopRecoverNode={handleStopRecoverNode}
                />
            );
        default:
            return <span />;
    }
}
NodeRecoveryConfigStep.whyDidYouRender = true;
NodeRecoveryConfigStep.propTypes = {
    t: PropTypes.func.isRequired,
    skip: PropTypes.bool.isRequired,
    handleBackFunc: PropTypes.func.isRequired,
    handleNextFunc: PropTypes.func.isRequired,
    handleLockLayerUpdate: PropTypes.func.isRequired,
    handleDialogPopup: PropTypes.func.isRequired,
    handleDialogOnClose: PropTypes.func.isRequired,
    handleStopRecoverNode: PropTypes.func.isRequired,
    handleUpdateTopologyFailed: PropTypes.func.isRequired,
    handleUnreachableNodeInfo: PropTypes.func.isRequired
}

export default React.memo(NodeRecoveryConfigStep)
