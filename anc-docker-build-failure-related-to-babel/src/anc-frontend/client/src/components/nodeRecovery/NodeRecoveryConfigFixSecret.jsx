import React, {useCallback} from 'react';
import PropTypes from 'prop-types';
import {useImmer} from 'use-immer';
import {useDispatch, useSelector} from 'react-redux';
import {
    InputAdornment,
    IconButton,
    Button,
} from '@material-ui/core';
import {
    Visibility,
    VisibilityOff,
} from '@material-ui/icons';
import {notifyChangeSecret} from '../../redux/nodeRecovery/nodeRecoveryActions';
import {formValidator} from '../../util/inputValidator';
import {resetManagementSecret} from '../../util/apiCall';
import FormInputCreator from '../common/FormInputCreator';
import {wrapper} from '../../util/commonFunc';
import Constant from '../../constants/common';

const NodeRecoveryConfigFixSecret = (
    {setIsLostNodeAuth, t, nodeIp, handleLockLayerUpdate, handleUpdateNodeInfo}
) => {
    const dispatch = useDispatch();
    const {
        common: {csrf},
        projectManagement: {projectId},
    } = useSelector(store => store);
    const [inputStatus, updateInputStatus] = useImmer({
        value: '',
        helperText: t('lostNodeSecretMismatchHelperText'),
        error: true,
        showPassword: false,
    });

    const handleClickShowPasssword = useCallback(() => {
        updateInputStatus(draft => {
            draft.showPassword = !draft.showPassword;
        });
    }, [updateInputStatus]);

    const handleChange = useCallback((event) => {
        const inputValue = event.target.value;
        const regexPattern = /^[\x20-\x7E]{8,32}$/;
        let validObj = formValidator('isRequired', inputValue);
        if (validObj.result) {
            validObj = formValidator('matchRegex', inputValue, regexPattern);
            validObj.text = t('lostNodeSecretMismatchHelperText');
        }
        updateInputStatus(draft => {
            draft.value = inputValue;
            draft.error = !validObj.result;
            draft.helperText = !validObj.result ? validObj.text : ' ';
        });
    }, [t, updateInputStatus]);

    const fixMistmatchSecret = useCallback(async () => {
        handleLockLayerUpdate({
            loading: true,
            message: t('lostNodeSecretMismatchLoadingMsg'),
        });
        const bodyMsg = {
            currentManagementSecret: inputStatus.value,
            nodes: [nodeIp],
        };
        const {error} = await wrapper(resetManagementSecret(csrf, projectId, bodyMsg));
        if (error) {
            updateInputStatus(draft => {
                draft.value = '';
                draft.error = true;
                draft.helperText = 'update Fail, Please Try Again';
            });
            handleLockLayerUpdate({
                loading: false,
                message: '',
            });
        } else {
            dispatch(notifyChangeSecret())
            // add  grace period for update node info and config after change secret
            setTimeout(() => {
                handleUpdateNodeInfo(nodeIp);
                setIsLostNodeAuth('YES');
            }, Constant.nodeRecoveryManagmentSecretFixGracePeriod);
        }
    }, [csrf, dispatch, handleLockLayerUpdate, inputStatus.value,
        nodeIp, projectId, setIsLostNodeAuth, t, updateInputStatus]);

    return (
        <>
            <FormInputCreator
                key="lost-node-secret"
                errorStatus={inputStatus.error}
                inputLabel={t('lostNodeSecretMismatchTitle')}
                inputID="lost-node-secret"
                inputValue={inputStatus.value}
                onChangeField={handleChange}
                autoFocus
                margin="normal"
                placeholder=""
                helperText={inputStatus.helperText}
                inputType={inputStatus.showPassword ? 'text' : 'password'}
                endAdornment={(
                    <InputAdornment position="end">
                        <IconButton onClick={handleClickShowPasssword} >
                            {inputStatus.showPassword ? <Visibility /> : <VisibilityOff />}
                        </IconButton>
                    </InputAdornment>
                )}
            />
            <div style={{float: 'right'}} >
                <Button
                    color="primary"
                    variant="contained"
                    onClick={fixMistmatchSecret}
                    disabled={inputStatus.value === ''}
                >
                    {t('lostNodeSecretMismatchFixButton')}
                </Button>
            </div>
        </>
    )
}

NodeRecoveryConfigFixSecret.propTypes = {
    t: PropTypes.func.isRequired,
    setIsLostNodeAuth: PropTypes.func.isRequired,
    handleLockLayerUpdate: PropTypes.func.isRequired,
    nodeIp: PropTypes.string.isRequired,
    handleUpdateNodeInfo: PropTypes.func.isRequired,
}

export default React.memo(NodeRecoveryConfigFixSecret)
