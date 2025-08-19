import {useEffect, useState, useCallback} from 'react'
import PropTypes from 'prop-types'
import {useSelector} from 'react-redux';
import {useImmer} from 'use-immer';
import {getConfig} from './apiCall';
import {calDiff} from './commonFunc';


const useGetConfig = ({skip, nodeIp, lockFunc, unlockFunc, withGetOptions}) => {

    const [configData, updateConfigData] = useImmer({});
    const [loadData, updateLoadData] = useImmer({});
    const [checksums, updateChecksums] = useImmer({});
    const [action, updateAction] = useImmer('FETCH');
    const [diff, updateDiff] = useImmer({});
    const [error, updateError] = useState(false);
    const {
        common: {csrf},
        projectManagement: {projectId},
    } = useSelector(store => store);

    const resetData = useCallback(() => {
        updateConfigData(draft => loadData)
        updateAction(draft => 'UPDATE');
    }, [loadData, updateAction, updateConfigData]);

    const clearData = useCallback(
        () => {
            updateConfigData(draft => ({}))
            updateLoadData(draft => ({}))
            updateAction(draft => 'FETCH');
            updateChecksums(draft => ({}));
        },
        [updateConfigData, updateLoadData, updateAction, updateChecksums],
    )

    const fetchConfig = useCallback(
        async (refetch = false) => {
            try {
                // console.log('kyle_debug ~ file: useGetConfig.js ~ line 63 ~ useGetConfig ~ fetchConfig')
                lockFunc();
                if (refetch) {
                    updateConfigData(draft => ({}))
                    updateLoadData(draft => ({}))
                    updateAction(draft => 'FETCH');
                    updateChecksums(draft => ({}));
                }
                const data = await getConfig(
                    csrf,
                    projectId,
                    {nodes: [...JSON.parse(nodeIp)]}
                );
                console.log(data)
                const {checksums, ...sourceConfig} = data;

                updateConfigData(draft => sourceConfig)
                updateLoadData(draft => sourceConfig)
                updateAction(draft => 'FETCH');
                updateChecksums(draft => checksums);

                if (!withGetOptions) unlockFunc();
            } catch (e) {
                updateError(true);
                unlockFunc();
            }
        },
        [
            nodeIp, csrf, projectId, updateError, updateLoadData,
            updateAction, updateConfigData, lockFunc, unlockFunc, withGetOptions,
            updateChecksums,
        ],
    )

    useEffect(() => {
        if (!skip) {
            (async () => {
                fetchConfig()
            })();
        }
    }, [skip, fetchConfig]);

    useEffect(() => {
        const diff = calDiff(loadData, configData)
        console.log('kyle_debug ~ file: useGetConfig.js ~ line 83 ~ useEffect ~ diff', diff)
        updateDiff(draft => diff);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [JSON.stringify(configData), JSON.stringify(loadData), updateDiff])

    return [
        configData,
        {
            loadData, error, updateError, updateConfigData, updateAction, resetData, checksums,
            action, diff, clearData, refetchGetConfig: () => fetchConfig(true)
        }
    ];
}

useGetConfig.propTypes = {
    skip: PropTypes.bool,
    nodeIp: PropTypes.string.isRequired,
    lockFunc: PropTypes.func,
    unlockFunc: PropTypes.func,
    withGetOptions: PropTypes.bool,
}

useGetConfig.defaultProps = {
    withGetOptions: false,
    skip: true,
    lockFunc: () => null,
    unlockFunc: () => null,
}

export default useGetConfig
