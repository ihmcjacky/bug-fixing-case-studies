import React, {useState} from 'react';
import PropTypes from 'prop-types';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import WarningIcon from '@material-ui/icons/Error';
import FromInput from '../../../components/common/FormInput';
import P2Dialog from '../../../components/common/P2Dialog';
import {formValidator} from '../../../util/inputValidator';
import {validateUserCredential} from '../../../util/apiCall';
import CommonConstante from '../../../constants/common';

const {zIndexLevel} = CommonConstante;

const FwDowngradeDialog = (props) => {
    const {
        t,
        content,
        open,
        handleSubmit,
        handleCancel,
        csrf,
    } = props;

    const [input, setInput] = useState({
        value: '',
        error: false,
        helperText: ' ',
    });
    const [showPwd, setShowPwd] = useState(false);

    const handleClickShowPasssword = () => {
        setShowPwd(!showPwd);
    };

    const inputOnChange = (event) => {
        const inputValue = event.target.value;
        const pwdReg = /^[0-9a-zA-Z]{8,32}$/;
        let validObj = formValidator('isRequired', inputValue);
        if (validObj.result) {
            validObj = formValidator('matchRegex', inputValue, pwdReg);
            validObj.text = t('pwdInputTips');
        }
        setInput({
            ...input,
            value: inputValue,
            error: !validObj.result,
            helperText: !validObj.result ? validObj.text : ' ',
        });
    };

    const handleConfirmOnClick = () => {
        const bodyMsg = {
            username: 'admin',
            password: input.value,
        };
        validateUserCredential(csrf, bodyMsg).then((res) => {
            if (res.isValid) {
                setInput({
                    ...input,
                    value: '',
                    error: false,
                    helperText: ' ',
                });
                handleSubmit();
            } else {
                setInput({
                    ...input,
                    error: true,
                    helperText: t('worngPwd'),
                });
            }
        }).catch((err) => {
            if (err.errors) {
                setInput({
                    ...input,
                    error: true,
                    helperText: t('errorRes') + err?.errors[0]?.message,
                });
            } else {
                setInput({
                    ...input,
                    error: true,
                    helperText: t('errorRes') + err.message,
                });
            }
        });
    };

    const handleClose = () => {
        setInput({
            ...input,
            value: '',
            error: false,
            helperText: ' ',
        });
        handleCancel();
    }

    const eyeIconButton = (
        <InputAdornment position="end">
            <IconButton onClick={handleClickShowPasssword} >
                {showPwd ? <Visibility /> : <VisibilityOff />}
            </IconButton>
        </InputAdornment>
    );
    const title = (
        <div>
            <WarningIcon
                color="error"
                fontSize="large"
                style={{
                    marginRight: '10px',
                    fontSize: '30px',
                }}
            />
            <div
                style={{
                    transform: 'translate(0%, -25%)',
                    fontWeight: 'bold',
                    display: 'inline-block',
                }}
            >
                {t('dialogTitle')}
            </div>
        </div>
    );
    const displayContent = content === '' ? t('dialogContent') : content;
    const nonTextContent = (
        <React.Fragment>
            <div style={{marginTop: '25px'}} >
                <FromInput
                    errorStatus={input.error}
                    inputLabel={t('password')}
                    inputID="anm-password-input"
                    inputValue={input.value}
                    onChangeField={inputOnChange}
                    onKeyPressField={(event) => {
                        if (event.key === 'Enter' && input.value !== '' && !input.error) {
                            handleConfirmOnClick();
                        }
                    }}
                    helperText={input.helperText}
                    inputType="password"
                    endAdornment={eyeIconButton}
                    showPassword={showPwd}
                />
            </div>
        </React.Fragment>
    );

    return (
        <P2Dialog
            open={open}
            handleClose={handleClose}
            title={title}
            content={displayContent}
            nonTextContent={nonTextContent}
            actionTitle={t('confirm')}
            actionFn={handleConfirmOnClick}
            diableActionFn={input.value === '' || input.error}
            cancelActTitle={t('cancel')}
            cancelActFn={handleClose}
            zIndex={zIndexLevel.mediumHigh}
        />
    )
};

FwDowngradeDialog.propTypes = {
    t: PropTypes.func.isRequired,
    csrf: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    handleSubmit: PropTypes.func.isRequired,
    handleCancel: PropTypes.func.isRequired,
    content: PropTypes.string,
};

FwDowngradeDialog.defaultProps = {
    content: '',
};

export default FwDowngradeDialog;
