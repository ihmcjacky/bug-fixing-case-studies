import {useEffect, useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import Cookies from 'js-cookie';
import {fetchMeshTopology} from '../../../redux/meshTopology/meshTopologyActions';
import {toggleSnackBar} from '../../../redux/common/commonActions';
import {meshTopologyErrDeterminer} from '../../../components/pollingManagement/errorDeterminer';


const useConfigCommon = ({t}) => {
    const dispatch = useDispatch();
    const {
        meshTopology: {
            graph: {nodes},
            initState,
        },
        projectManagement: {projectId},
    } = useSelector(store => store);
    const [isLoading, setIsLoading] = useState(false);
    const [isInit, setIsInit] = useState(true);
    const [error, setError] = useState('');

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
        if (needReload) {
            setTimeout(refreshFunc, 5000);
        } else {
            setIsLoading(false);
        }
    };

    const refreshFunc = () => {
        setIsLoading(true);
        setIsInit(true);
        dispatch(fetchMeshTopology()).then(() => {
            if (isInit) {
                setIsInit(false);
            }
            setIsLoading(false);
        }).catch((e) => {
            if (e?.data?.type === 'specific') {
                if (isInit) {
                    setIsInit(false);
                }
                setIsLoading(false);
            } else {
                handleFetchingError(e, true);
            }
        });
    };

    const firstUpdate = () => {
        if (projectId !== '') {
            const quickStagingLoginRequest = Cookies.get('quickStagingLoginRequest');
            if (quickStagingLoginRequest === 'true') {
                setError('notLoggedIn');
                setIsLoading(false);
            } else {
                refreshFunc();
            }
        }
    };
    useEffect(firstUpdate, [projectId]);

    const checkIsAuth = () => {
        if (!initState.graph) return;
        let hasMismatch = false;
        nodes.forEach((node) => {
            if (node.isManaged) {
                if (node.isAuth === 'no') {
                    hasMismatch = true;
                }
            }
        });
        if (hasMismatch) {
            setError('mismatchDevice');
        }
    };
    useEffect(checkIsAuth, [nodes]);

    return {
        isLoading,
        error,
        nodes,
        isInit,
        refreshFunc,
    };
};

export default useConfigCommon;
