import React, {useEffect, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Cookies from 'js-cookie';
import {fetchMeshTopology, fetchNodeInfo} from '../../../redux/meshTopology/meshTopologyActions';
import {fetchCachedMeshTopology, fetchCachedNodeInfo} from '../../../redux/meshTopology/cachedMeshTopologyActions';
import {toggleSnackBar} from '../../../redux/common/commonActions';
import {meshTopologyErrDeterminer} from '../../../components/pollingManagement/errorDeterminer';
import {convertIpToMac} from '../../../util/formatConvertor';
import Constants from '../../../constants/common';
import {iff} from '../../../util/commonFunc';

const {colors} = Constants;

const useMeshWideMaintenanceCommon = ({t, ready}) => {
    const dispatch = useDispatch();
    const {
        common: {logoutDialog},
        meshTopology: {
            graph: {nodes},
            nodeInfo,
            initState,
        },
        projectManagement: {projectId},
    } = useSelector(store => store);
    const [isLoading, setIsLoading] = useState(false);
    const [loadNodeInfoSuccess, setLoadNodeInfoSuccess] = useState(false);
    const [isInit, setIsInit] = useState(true);
    const [error, setError] = useState('');
    const [tableData, setTableData] = useState([]);

    const handleFetchingError = (e, reload = false) => {
        let needReload = reload;
        if (e?.data?.type === 'errors') {
            let error = e.data.data[0].type;
            if (error === 'timelimitreached' || error === 'headnodeunreachable' || error === 'unreachable.headnodeunreachable') {
                if (error === 'unreachable.headnodeunreachable') {
                    error = 'headnodeunreachable';
                }
                needReload = false;
                setError(error);
            } else {
                const messages = meshTopologyErrDeterminer(e.data.data[0].type, t);
                dispatch(toggleSnackBar(messages));
            }
        }
        if (needReload && !logoutDialog.open) {
            dispatch(toggleSnackBar(t('getMgmtListFailReload')));
            setTimeout(refreshFunc, 5000);
        } else {
            dispatch(toggleSnackBar(t('getMgmtListFail')));
            setIsLoading(false);
        }
    };

    const refreshNodeInfoFunc = () => {
        dispatch(fetchCachedNodeInfo()).then(() => {
            setIsLoading(false);
            setLoadNodeInfoSuccess(true);
            dispatch(toggleSnackBar(t('getMgmtListOk')));
        }).catch((err) => {
            setIsLoading(false);
            if (err?.data?.type !== 'specific') {
                setTimeout(refreshNodeInfoFunc, 5000);
            } else {
                setLoadNodeInfoSuccess(true);
            }
        });
    };

    const refreshFunc = () => {
        setTimeout(() => {
            dispatch(toggleSnackBar(t('getMgmtList')));
        }, 100);
        setIsLoading(true);
        setLoadNodeInfoSuccess(false);
        setIsInit(true);
        setTableData([]);
        dispatch(fetchCachedMeshTopology()).then(() => {
            if (isInit) {
                setIsInit(false);
            }
            refreshNodeInfoFunc();
        }).catch((e) => {
            if (e?.data?.type === 'specific') {
                if (isInit) {
                    setIsInit(false);
                }
                dispatch(fetchCachedNodeInfo()).then(() => {
                    setIsLoading(false);
                }).catch(() => { setIsLoading(false); });
            } else {
                handleFetchingError(e, true);
            }
        });
    };

    const firstUpdate = () => {
        if (projectId !== '' && ready) {
            const quickStagingLoginRequest = Cookies.get('quickStagingLoginRequest');
            if (quickStagingLoginRequest === 'true') {
                setError('notLoggedIn');
                setIsLoading(false);
            } else {
                refreshFunc();
            }
        }
    };
    useEffect(firstUpdate, [projectId, ready]);

    const getStatusContent = status => (
        <div style={{color: colors[status], fontWeight: 'bold'}}>
            {t(status)}
        </div>
    );

    const updateTableData = () => {
        if (!initState.graph) return;
        const newTableData = [];
        let hasMismatch = false;
        nodes.forEach((node) => {
            if (node.isManaged) {
                if (node.isAuth === 'no') {
                    hasMismatch = true;
                }
                const row = [];
                const nodeData = nodeInfo[node.id];
                row.push({
                    type: 'string',
                    ctx: nodeData ? nodeData.hostname : '-',
                });
                row.push({
                    type: 'string',
                    ctx: nodeData ? nodeData.mac : convertIpToMac(node.id),
                });
                row.push({
                    type: 'string',
                    ctx: nodeData ? nodeData.model : '-',
                });
                row.push({
                    type: 'string',
                    ctx: nodeData ? nodeData.firmwareVersion : '-',
                });
                const status = node.isAuth === 'no' ? 'mismatch' : iff(!node.isReachable, 'unreachable', 'reachable');
                row.push({
                    type: 'component',
                    ctx: getStatusContent(status),
                    id: node.id,
                    status,
                });
                newTableData.push(row);
            }
        });
        setTableData(newTableData);
        if (hasMismatch) {
            setError('mismatchDevice');
        }
    };
    useEffect(updateTableData, [nodeInfo, nodes]);

    return {
        isLoading,
        tableData,
        error,
        nodeInfo,
        nodes,
        isInit,
        loadNodeInfoSuccess,
        refreshFunc,
    };
};

export default useMeshWideMaintenanceCommon;
