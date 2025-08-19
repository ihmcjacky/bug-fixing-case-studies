import {useEffect, useState, useCallback} from 'react'
import PropTypes from 'prop-types'
import {useSelector} from 'react-redux';
import {useImmer} from 'use-immer';
import {getFilteredConfigOptions} from './apiCall';


const useGetOptions = ({skip, options, sourceConfig, lockFunc, unlockFunc, withGetConfig, action}) => {
    const [configOptions, updateConfigOptions] = useImmer({});
    const [error, updateError] = useState(false);
    const {
        common: {csrf},
        projectManagement: {projectId},
    } = useSelector(store => store);

    const fetchOptions = useCallback(
        async (refetch = false) => {
            try {
                if (!withGetConfig || action === 'UPDATE') lockFunc();
                if (refetch)  updateConfigOptions(draft => ({}));
                const data = await getFilteredConfigOptions(
                    csrf,
                    projectId,
                    {options: JSON.parse(options), sourceConfig: JSON.parse(sourceConfig)}
                );
                updateConfigOptions(draft => data);
                unlockFunc();
            } catch (e) {
                updateError(true);
                unlockFunc();
            }
        },
        [
            options, action, sourceConfig, csrf, projectId,
            updateError, updateConfigOptions, lockFunc,
            unlockFunc, withGetConfig,
        ],
    )

    useEffect(() => {
        if (!skip) {
            (async () => {
                fetchOptions()
            })();
        }
    }, [skip, fetchOptions]);

    return [
        configOptions,
        {
            error, updateError, updateConfigOptions,
            refetchGetOptions:  () => fetchOptions(true)
        }
    ]
}

useGetOptions.propTypes = {
    skip: PropTypes.bool,
    options: PropTypes.string.isRequired,
    sourceConfig: PropTypes.string.isRequired,
    lockFunc: PropTypes.func,
    unlockFunc: PropTypes.func,
    withGetConfig: PropTypes.bool,
    action: PropTypes.string,
}

useGetOptions.defaultProps = {
    skip: false,
    lockFunc: () => null,
    unlockFunc: () => null,
    withGetConfig: false,
    action: 'FETCH',
}

export default useGetOptions
