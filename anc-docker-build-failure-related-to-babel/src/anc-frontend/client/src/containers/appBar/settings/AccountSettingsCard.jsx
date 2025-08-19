import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles'
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import ArrowBackIosIcon from '@material-ui/icons/ArrowBackIos';
import Drawer from '@material-ui/core/Drawer';
import Grid from '@material-ui/core/Grid';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import FromInput from '../../../components/common/FormInput';
import {formValidator} from '../../../util/inputValidator';

const styles = {
    paperStyle: {
        width: ({width, fullWidth}) => fullWidth - 980 < 0 ? `${fullWidth - 200}px`  : `${width + 5}px`,
        marginTop: '48px',
        left: '200px',
        height: 'calc(100% - 48px)',
        boxShadow: ['none'],
    },
    rootStyle: {
        width: 0,
    },
    backdropColor: {
        color: 'rgba(0, 0, 0, 0)',
        backgroundColor: 'transparent',
    }
};
const useStyles = makeStyles(styles);

const AccountSettingsCard = (props) => {
    const {
        t,
        open,
        width,
        fullWidth,
        handleClose,
        inputCallback,
        reset,
    } = props
    const classes = useStyles({width, fullWidth});

    const [showPwd, setShowPwd] = useState(false);
    const [currentPwdInput, setCurrentPwdInput] = useState({
        value: '',
        error: false,
        helperText: ' ',
    });

    const [newPwdInput, setNewPwdInput] = useState({
        value: '',
        error: false,
        helperText: ' ',
    });

    const [confirmPwdInput, setConfirmPwdInput] = useState({
        value: '',
        error: false,
        helperText: ' ',
    });

    useEffect(() => {
        setShowPwd(false);
        setCurrentPwdInput({
            value: '',
            error: false,
            helperText: ' ',
        });
        setNewPwdInput({
            value: '',
            error: false,
            helperText: ' ',
        });
        setConfirmPwdInput({
            value: '',
            error: false,
            helperText: ' ',
        });
    }, [reset]);

    const callback = () => {
        const update = {
            currentPassword: currentPwdInput.value,
            newPassword: newPwdInput.value,
            hasChanged: currentPwdInput.value !== '' || newPwdInput.value !== '' ||  confirmPwdInput.value !== '',
            ableToSend: currentPwdInput.value !== '' && !currentPwdInput.error &&
                newPwdInput.value !== ''  && !newPwdInput.error &&
                confirmPwdInput.value !== ''  && !confirmPwdInput.error,
        };
        inputCallback(update);
    };

    useEffect(callback, [currentPwdInput, newPwdInput, confirmPwdInput]);

    const currentPwdInputOnChange = (event) => {
        const inputValue = event.target.value;
        const pwdReg = /^[0-9a-zA-Z]{8,32}$/;

        let validObj = formValidator('isRequired', inputValue);
        if (validObj.result) {
            validObj = formValidator('matchRegex', inputValue, pwdReg);
            validObj.text = t('pwdInputTips');
        }

        setCurrentPwdInput({
            ...currentPwdInput,
            value: inputValue,
            error: !validObj.result,
            helperText: !validObj.result ? validObj.text : ' ',
        });

        if (inputValue === newPwdInput.value && newPwdInput.value !== '') {
            setNewPwdInput({
                ...newPwdInput,
                error: true,
                helperText: t('shouldNotSameWithCurerntPwd'),
            });
        } else if (newPwdInput.helperText === t('shouldNotSameWithCurerntPwd')) {
            setNewPwdInput({
                ...newPwdInput,
                error: false,
                helperText: ' ',
            });
        }
    };

    const newPwdInputOnChange = (event) => {
        const inputValue = event.target.value;
        const pwdReg = /^[0-9a-zA-Z]{8,32}$/;

        let validObj = formValidator('isRequired', inputValue);
        if (validObj.result) {
            validObj = formValidator('matchRegex', inputValue, pwdReg);
            validObj.text = t('pwdInputTips');
        }

        if (inputValue === currentPwdInput.value) {
            validObj.result = false;
            validObj.text = t('shouldNotSameWithCurerntPwd');
        }

        setNewPwdInput({
            ...newPwdInput,
            value: inputValue,
            error: !validObj.result,
            helperText: !validObj.result ? validObj.text : ' ',
        });

        if (inputValue !== confirmPwdInput.value && confirmPwdInput.value !== '') {
            setConfirmPwdInput({
                ...confirmPwdInput,
                error: true,
                helperText: t('shoudlSameWithNewPwd'),
            });
        } else if (confirmPwdInput.helperText === t('shoudlSameWithNewPwd')) {
            setConfirmPwdInput({
                ...confirmPwdInput,
                error: false,
                helperText: ' ',
            });
        }
    };

    const confirmPwdInputOnChange = (event) => {
        const inputValue = event.target.value;

        let validObj = formValidator('isRequired', inputValue);
        if (inputValue !== newPwdInput.value) {
            validObj.result = false;
            validObj.text = t('shoudlSameWithNewPwd');
        }
        setConfirmPwdInput({
            ...confirmPwdInput,
            value: inputValue,
            error: !validObj.result,
            helperText: !validObj.result ? validObj.text : ' ',
        });
    };


    const eyeIconButton = (
        <InputAdornment position="end">
            <IconButton onClick={() => { setShowPwd(!showPwd); }} >
                {showPwd ? <Visibility /> : <VisibilityOff />}
            </IconButton>
        </InputAdornment>
    );

    return (
        <Drawer
            anchor='right'
            open={open}
            onClose={handleClose}
            classes={{
                root: classes.rootStyle,
                paper: classes.paperStyle,
            }}
            disableBackdropClick
            hideBackdrop
        >
            <div
                style={{
                    padding: '30px 20px 0px 20px',
                    minWidth: '740px',
                    overflowX: 'auto',
                }}
            >
                <Grid
                    item
                    xs={12}
                    sm={6}
                >
                    <IconButton onClick={handleClose} >
                        <ArrowBackIosIcon
                            style={{
                                display: 'inline-block',
                                verticalAlign: 'middle',
                            }}
                        />
                    </IconButton>
                    <div
                        style={{
                            display: 'inline-block',
                            verticalAlign: 'middle',
                        }}
                    >
                        <i className="material-icons" style={{fontSize: '41px'}}>
                            account_circle</i>
                    </div>
                    <div
                        style={{
                            display: 'inline-block',
                            verticalAlign: 'middle',
                        }}
                    >
                        <Typography style={{paddingLeft: '10px'}} >
                            <strong>{t('userAccount')}</strong>
                        </Typography>
                    </div>
                </Grid>
                <Grid container style={{padding: '20px 30px 20px 50px'}} alignItems="center">
                    <Grid item xs={12} md={12}>
                        <FromInput
                            errorStatus={currentPwdInput.error}
                            inputLabel={t('currentPassword')}
                            inputID="current-password-input"
                            inputValue={currentPwdInput.value}
                            onChangeField={currentPwdInputOnChange}
                            helperText={currentPwdInput.helperText}
                            inputType="password"
                            endAdornment={eyeIconButton}
                            showPassword={showPwd}
                        />
                    </Grid>
                </Grid>
                <Grid container style={{padding: '20px 30px 20px 50px'}} alignItems="center">
                    <Grid item xs={12} md={12}>
                        <FromInput
                            errorStatus={newPwdInput.error}
                            inputLabel={t('newPassword')}
                            inputID="new-password-input"
                            inputValue={newPwdInput.value}
                            onChangeField={newPwdInputOnChange}
                            helperText={newPwdInput.helperText}
                            inputType="password"
                            endAdornment={null}
                            showPassword={showPwd}
                        />
                    </Grid>
                </Grid>
                <Grid container style={{padding: '20px 30px 20px 50px'}} alignItems="center">
                    <Grid item xs={12} md={12}>
                        <FromInput
                            errorStatus={confirmPwdInput.error}
                            inputLabel={t('confirmNewPassword')}
                            inputID="confirm-password-input"
                            inputValue={confirmPwdInput.value}
                            onChangeField={confirmPwdInputOnChange}
                            helperText={confirmPwdInput.helperText}
                            inputType="password"
                            endAdornment={null}
                            showPassword={showPwd}
                        />
                    </Grid>
                </Grid>
            </div>
        </Drawer>
    );
};

AccountSettingsCard.propTypes = {
    t: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    width: PropTypes.number.isRequired,
    fullWidth: PropTypes.number.isRequired,
    inputCallback: PropTypes.func.isRequired,
    reset: PropTypes.number.isRequired,
};

export default AccountSettingsCard;
