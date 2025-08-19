import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Checkbox from '@material-ui/core/Checkbox';
import Button from '@material-ui/core/Button';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import Typography from '@material-ui/core/Typography';
import LockLayer from '../common/LockLayer';
import FromInput from '../common/FormInput';
import P2Tooltip from '../common/P2Tooltip';
import {formValidator} from '../../util/inputValidator';
import {projectLoginStyles} from './styles';
import ProjectConstants from '../../constants/project';
import { useHistory } from 'react-router-dom';


const {project: {defaultManagementSecret}} = ProjectConstants;
const useStyles = makeStyles(projectLoginStyles);
const ProjectLogin = (props) => {
    const history = useHistory();
    const classes = useStyles();
    const {
        t,
        projectName,
        savedSecret,
        rememberSecret,
        loginHandleRememberOnClick,
        loginHandleBackOnClick,
        loginHandleLoginOnClick,
    } = props;

    const [lock, setLock] = useState(false);
    const [pwdInput, setPwdInput] = useState({
        password: savedSecret,
        error: false,
        helperText: ' ',
        showPassword: false,
        disableBtn: savedSecret === '' ? true : false,
    });

    const handleClickShowPasssword = () => {
        setPwdInput({
            ...pwdInput,
            showPassword: !pwdInput.showPassword,
        });
    }

    const handleDefaultPasswordOnClick = () => {
        setPwdInput({
            ...pwdInput,
            password: defaultManagementSecret,
            disableBtn: false,
        });
    }

    const handlePwsInputOnChange = (e) => {
        const inputValue = e.target.value;
        const pwdReg = /^[!-~]{8,32}$/;
        let validObj = formValidator('isRequired', inputValue);
        if (validObj.result) {
            validObj = formValidator('matchRegex', inputValue, pwdReg);
            validObj.text = t('ProjectLoginHelperTextInvalidManagementSecret');
        }
        setPwdInput({
            ...pwdInput,
            password: inputValue,
            error: !validObj.result,
            helperText: validObj.result ? ' ' : validObj.text,
            disableBtn: !validObj.result,
        });
    }

    const handleLogin = () => {
        setLock(true);
        loginHandleLoginOnClick(pwdInput.password)
            .then((loginRes) => {
                // login succeed
                console.warn(loginRes);
                setLock(false);// close the dialog (ProjectEleWrapper)
                history.push('/', { replace: true });
            }).catch((e) => {
                let helperText = e.message;
                console.warn(e)
                if (e.state === 'ping') {
                    const err = e?.data?.data[0];
                    console.log(err);
                    if (err.type === 'nodebusy.headnodebusy') {
                        helperText = t('ProjectLoginHelperTextNodeBusy');
                    } else {
                        helperText = t('ProjectLoginHelperTextNodeUnreachable');
                    }
                } else if (e.state === 'login') {
                    const err = e?.data?.data[0];
                    if (err) {
                        if (err.type === 'runtime' && err.message === 'App is busy!') {
                            helperText = t('ProjectLoginHelperTextRuntimeErr');
                        } else if (err.type === 'auth.password') {
                            helperText = t('ProjectLoginHelperTextInCorrectManagementSecret');
                        } else if (err.type === 'runtime') {
                            helperText = t('runtimeError');
                        } else {
                            helperText = t('ProjectLoginHelperTextNodeUnreachable');
                        }
                    }
                } else if (e.state === 'getMeshTopology') {
                    helperText = t('getMeshTopologyFail');
                } else if (e.state === 'getConfig') {
                    helperText = t('getConfigFail');
                } else if (e.state === 'location') {
                    helperText = t('locationNotCompatible');
                }
            });
    }

    const handleEnterToLogin = (e) => {
        if (e.key === 'Enter') {
            if (!pwdInput.disableBtn) {
                handleLogin();
            }
        }
    }

    const eyeIconButton = (
        <InputAdornment position="end">
            <IconButton onClick={handleClickShowPasssword} >
                {pwdInput.showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
        </InputAdornment>
    );

    return (
        <div>
            <LockLayer display={lock} />
            <DialogTitle>
                <div style={{userSelect: 'none'}}>
                    <Typography variant="h6" color="inherit" className={classes.title}>
                        {t('ProjectLoginHeaderFirstHalf')}
                        {projectName}
                        {t('ProjectLoginHeaderEnding')}
                    </Typography>
                    <Typography variant="h6" color="inherit" className={classes.subTitle}>
                        {t('ProjectLoginSubHeader')}
                    </Typography>
                </div>
            </DialogTitle>
            <DialogContent classes={{root: classes.dialogContent}} >
                <Typography
                    variant="body2"
                    className={classes.bodyWord}
                >
                    {t('ProjectLoginDiscription')}
                    <P2Tooltip
                        title={t('SetPasswordTooltip')}
                        content={
                            <Button
                                style={{
                                    textTransform: 'none',
                                    padding: 0,
                                }}
                                classes={{label: classes.btnPwdLbl}}
                                value={defaultManagementSecret}
                                onClick={handleDefaultPasswordOnClick}
                            >
                                {defaultManagementSecret}
                            </Button>
                        }
                        key="popup"
                    />
                    {t('ProjectLoginPasswordClosing')}
                </Typography>
                <div className={classes.inputWrapper}>
                    <div className={classes.input}>
                        <FromInput
                            errorStatus={pwdInput.error}
                            inputLabel={t('managementSecret')}
                            inputID="login-password-input"
                            inputValue={pwdInput.password}
                            onChangeField={handlePwsInputOnChange}
                            onKeyPressField={handleEnterToLogin}
                            helperText={pwdInput.helperText}
                            inputType="password"
                            endAdornment={eyeIconButton}
                            showPassword={pwdInput.showPassword}
                        />
                    </div>
                    <div className={classes.rememberBtn}>
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={rememberSecret}
                                    onChange={loginHandleRememberOnClick}
                                    value="remember"
                                    color="primary"
                                />
                            }
                            label={t('ProjectLoginRememberLabel')}
                            classes={{
                                label: classes.rememberLabel,
                                root: classes.rememberLabelRoot,
                            }}
                        />
                    </div>
                </div>
            </DialogContent>
            <div className={classes.btnWrapper}>
                <Button
                    color="primary"
                    style={{paddingLeft: '0', marginLeft: '0', marginRight: 'auto'}}
                    onClick={loginHandleBackOnClick}
                >
                    <i className="material-icons">
                        keyboard_arrow_left
                    </i>
                    {t('ProjectLoginBackBtnLabel')}
                </Button>
                <Button
                    color="primary"
                    onClick={handleLogin}
                    style={{marginLeft: 'auto', marginRight: '0'}}
                    disabled={pwdInput.disableBtn}
                >
                    {t('ProjectLoginProcessBtnLabel')}
                    <i className="material-icons">
                        keyboard_arrow_right
                    </i>
                </Button>
            </div>
        </div>
    );
};

ProjectLogin.propTypes = {
    t: PropTypes.func.isRequired,
    projectName: PropTypes.string.isRequired,
    savedSecret: PropTypes.string.isRequired,
    rememberSecret: PropTypes.bool.isRequired,
    loginHandleRememberOnClick: PropTypes.func.isRequired,
    loginHandleBackOnClick: PropTypes.func.isRequired,
    loginHandleLoginOnClick: PropTypes.func.isRequired,
    isAutoLogin: PropTypes.bool.isRequired
};

ProjectLogin.defaultProps = {
    isAutoLogin: false
}

export default ProjectLogin;
