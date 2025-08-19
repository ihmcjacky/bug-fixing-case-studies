import {useEffect} from 'react';
import PropTypes from 'prop-types'
import {useImmer} from 'use-immer';
import merge from 'lodash/merge';
// import usePrevious from './usePrevious';
import checkConfigValue from './configValidator';


function deepReplace(obj) {
    Object.keys(obj).forEach(key => {
        if (typeof obj[key] === 'object') {
            deepReplace(obj[key])
        } else {
            obj[key] = false;
        }
    })
};

const useValidator = ({skip, configData, configOptions, nodeIp}) => {
    const [errorStatus, updateErrorStatus] = useImmer({});
    // const previousConfigOptions = usePrevious(configOptions);
    useEffect(() => {
        if (!skip) {
            console.log('kyle_debug ~ file: useValidator.js ~ line 12 ~ checkConfigValue with ConfigOptions')
            const {success, invalidFilterConfigRes} = checkConfigValue(
                undefined , JSON.parse(configOptions), JSON.parse(configData), [...JSON.parse(nodeIp)]
            );
            const errorStatus = JSON.parse(configData);
            deepReplace(errorStatus);
            if (success) {
                updateErrorStatus(draft => errorStatus);
            } else {
                const {expanded, ...rest} = invalidFilterConfigRes;
                merge(errorStatus, rest);
                updateErrorStatus(draft => errorStatus);
            }
        }
    }, [skip, configData, configOptions, updateErrorStatus, nodeIp])
    return [errorStatus, {updateErrorStatus}];
}

useValidator.propTypes = {
    skip: PropTypes.bool,
    nodeIp: PropTypes.string.isRequired,
    configData: PropTypes.string.isRequired,
    configOptions: PropTypes.string.isRequired,
}

export default useValidator
