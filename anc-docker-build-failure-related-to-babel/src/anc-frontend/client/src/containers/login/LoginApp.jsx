import React, {useState} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import Cookies from 'js-cookie';
import {makeStyles} from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import InputAdornment from '@material-ui/core/InputAdornment';
import LanguageIcon from '@material-ui/icons/Language';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Typography from '@material-ui/core/Typography';
import LinearProgress from '@material-ui/core/LinearProgress';
import Footer from '../../init/Footer';
import InfoDialogWrapper from './InfoDialogWrapper';
import FromInput from '../../components/common/FormInput';
import P2Dialog from '../../components/common/P2Dialog';
import CommonConstants from '../../constants/common';
import {formValidator} from '../../util/inputValidator';
import {setLoggedinAmn, setCsrfToken} from '../../redux/common/commonActions';
import {loginAmn, setLanguage} from '../../util/apiCall';
import {changeLang} from '../../I18n';

const {colors, langList} = CommonConstants;


const styles = {
    root: {
        height: 2,
    },
    langBtnWrapper: {
        // display: 'none',
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        marginTop: '17px',
    },
    langBtn: {
        minWidth: '26px',
        minHeight: '36px',
        fontSize: '12px',
        padding: '0px',
    },
    endLanBtn: {
        minWidth: '26px',
        minHeight: '36px',
        fontSize: '12px',
        padding: '0px',
    },
    langInUsed: {
        // cursor: 'not-allowed',
        fontWeight: 800,
    },
    langNotInUsed: {
        opacity: 0.5,
    },
};

const useStyles = makeStyles(styles);

/**
 * Login page
 * According to `hasUser` value to render login or register content
 */
const LoginApp = () => {
    let history = useHistory();
    const {anm: {hasUser}, lang, csrf, labels} = useSelector(store => store.common);
    const dispatch = useDispatch();
    const { t: _t, ready } = useTranslation(['login', 'translate']);
    const t = (tKey, options) => _t(tKey, {...labels, ...options}); 
    const handleDialogClose = () => {
        setDialog({
            ...dialog,
            open: false,
        });
    };

    const [loginInputStatus, setLoginInputStatus] = useState({
        username: 'admin',
        password: '',
        helperText: ' ',
        error: false,
    });
    const [registerInputStatus, setRegisterInputStatus] = useState({
        password: '',
        helperText: ' ',
        error: false,
        passwordConfirm: '',
        helperTextConfirm: ' ',
        errorConfirm: false,
    });

    const [commonStatus, setCommonStatus] = useState({
        showPassword: false,
    });
    const [linearProgressType, setLinearProgressType] = useState('determinate');
    const [dialog, setDialog] = useState({
        open: false,
        handleClose: handleDialogClose,
        title: '',
        content: '',
        actionTitle: '',
        actionFn: () => {},
        cancelActTitle: '',
        cancelActFn: () => {},
    });
    const classes = useStyles();

    // const changeLang = () => {};

    const loginPwdInputOnChange = (event) => {
        const inputValue = event.target.value;
        const pwdReg = /^[0-9a-zA-Z]{8,32}$/;
        let validObj = formValidator('isRequired', inputValue);
        if (validObj.result) {
            validObj = formValidator('matchRegex', inputValue, pwdReg);
            validObj.text = t('pwdInputTips');
        }
        setLoginInputStatus({
            ...loginInputStatus,
            password: inputValue,
            error: !validObj.result,
            helperText: !validObj.result ? validObj.text : ' ',
        });
    };

    const registerInputOnChange = (event) => {
        const {passwordConfirm, errorConfirm} = registerInputStatus;
        const inputValue = event.target.value;
        const pwdReg = /^[0-9a-zA-Z]{8,32}$/;

        let validObj = formValidator('isRequired', inputValue);
        if (validObj.result) {
            validObj = formValidator('matchRegex', inputValue, pwdReg);
            validObj.text = t('pwdInputTips');
        }

        setRegisterInputStatus({
            ...registerInputStatus,
            password: inputValue,
            error: !validObj.result,
            helperText: !validObj.result ? validObj.text : ' ',
            errorConfirm: (passwordConfirm !== inputValue && passwordConfirm !== '') ||
                (passwordConfirm === '' && errorConfirm),
        });
    };

    const registerConfirmInputOnChange = (event) => {
        const inputValue = event.target.value;
        let validObj = formValidator('isRequired', inputValue);
        if (validObj.result) {
            validObj.result = inputValue === registerInputStatus.password;
            validObj.text = t('shoudSameAsPwd');
        }
        setRegisterInputStatus({
            ...registerInputStatus,
            passwordConfirm: inputValue,
            errorConfirm: !validObj.result,
            helperTextConfirm: !validObj.result ? validObj.text : ' ',
        });
    };

    const enterToSubmit = (event, func) => {
        if (event.key === 'Enter') {
            func();
        }
    };

    const onLogin = () => {
        setLinearProgressType('indeterminate');
        const body = new FormData();
		body.append('username', 'admin');
		body.append('password', loginInputStatus.password);
		loginAmn(csrf, body).then(() => {
            setLinearProgressType('determinate');
            dispatch(setLoggedinAmn(true));
            Cookies.remove('needLoginAfterRegister');
            Cookies.remove('projectId');
            Cookies.remove('quickStagingLoginRequest');

             // csrf token update, 
            dispatch(setCsrfToken(Cookies.get('csrftoken')));
            history.replace('/');
		}).catch((e) => {
            console.log('fail');
            setLinearProgressType('determinate');
			setLoginInputStatus({
                ...loginInputStatus,
                helperText: t('invalidPassword'),
                error: true,
            });
		});
    };

    const onRegister = () => {
        setLinearProgressType('indeterminate');
        const body = new FormData();
		body.append('username', 'admin');
		body.append('password', registerInputStatus.password);
		loginAmn(csrf, body).then(() => {
            setLinearProgressType('determinate');
            setDialog({
                ...dialog,
                open: true,
                title: t('regSuccessTitle'),
                content: <span>
                    {t('regSuccessContent1')}
                    <b>{t('regSuccessContent2')}</b>
                    {t('regSuccessContent3')}
                </span>,
                actionTitle: t('continue'),
                actionFn: () => {
                    // Cookies to request user should login again
                    Cookies.set('needLoginAfterRegister', true);

                    // window.location.reload();
                    // window.nw.Window.get().reloadIgnoringCache();
                    // window.location.assign(`${window.location.origin}/index.html`);
                    window.location.assign(`${window.location.origin}/index.html`);

                },
            });
		}).catch(() => {
            setLinearProgressType('determinate');
            setDialog({
                ...dialog,
                open: true,
                title: t('regFailTitle'),
                content: t('regFailContent'),
                actionTitle: t('ok'),
                actionFn: () => {
                    handleDialogClose();
                },
            });
		});
    };

    const handleClickShowPasssword = () => {
        setCommonStatus({
            ...commonStatus,
            showPassword: !commonStatus.showPassword,
        });
    };

    const eyeIconButton = (
        <InputAdornment position="end">
            <IconButton onClick={handleClickShowPasssword} >
                {commonStatus.showPassword ? <Visibility /> : <VisibilityOff />}
            </IconButton>
        </InputAdornment>
    );

    let inputFieldsDrawer = <span />;

    if (hasUser) {
        inputFieldsDrawer = (
            <div
                id="password-input"
                test-id="login-password-form"
            >
                <FromInput
                    errorStatus={loginInputStatus.error}
                    inputLabel={t('password')}
                    inputID="login-password-input"
                    inputValue={loginInputStatus.password}
                    onChangeField={loginPwdInputOnChange}
                    onKeyPressField={(event) => {
                        if (loginInputStatus.password !== '' && !loginInputStatus.error) {
                            enterToSubmit(event, onLogin);
                        }
                    }}
                    helperText={loginInputStatus.helperText}
                    inputType="password"
                    endAdornment={eyeIconButton}
                    showPassword={commonStatus.showPassword}
                />
            </div>
        );
    } else {
        inputFieldsDrawer = (
            <div
                id="password-input"
                test-id="register-password-form"
            >
                <FromInput
                    errorStatus={registerInputStatus.error}
                    inputLabel={t('password')}
                    inputID="register-password-input"
                    inputValue={registerInputStatus.password}
                    onChangeField={registerInputOnChange}
                    onKeyPressField={(event) => {
                        if (registerInputStatus.password !== '' &&
                            registerInputStatus.passwordConfirm !== '' &&
                            !registerInputStatus.error && !registerInputStatus.errorConfirm) {
                            enterToSubmit(event, onRegister);
                        }
                    }}
                    helperText={registerInputStatus.helperText}
                    inputType="password"
                    endAdornment={eyeIconButton}
                    showPassword={commonStatus.showPassword}
                />
                <FromInput
                    errorStatus={registerInputStatus.errorConfirm}
                    inputLabel={t('comfirmPassword')}
                    inputID="register-password-confirm-input"
                    inputValue={registerInputStatus.passwordConfirm}
                    onChangeField={registerConfirmInputOnChange}
                    onKeyPressField={(event) => {
                        if (registerInputStatus.password !== '' &&
                            registerInputStatus.passwordConfirm !== '' &&
                            !registerInputStatus.error && !registerInputStatus.errorConfirm) {
                            enterToSubmit(event, onRegister);
                        }
                    }}
                    helperText={registerInputStatus.helperTextConfirm}
                    inputType="password"
                    endAdornment={null}
                    showPassword={commonStatus.showPassword}
                />
            </div>
        );
    }

    let submitBtnDisabled = false;
    if (hasUser) {
        submitBtnDisabled = loginInputStatus.error || loginInputStatus.password === '';
    } else {
        submitBtnDisabled = (registerInputStatus.error ||registerInputStatus.errorConfirm ||
            registerInputStatus.password === '' || registerInputStatus.passwordConfirm === '');
    }

    const submitDrawer = (
        <Button
            color="primary"
            style={{
                float: 'right',
                paddingRight: '0px',
                minWidth: 'auto',
            }}
            onClick={hasUser ? onLogin : onRegister}
            disabled={submitBtnDisabled}
            size="small"
        >
            {hasUser ? t('login') : t('register')}
            <i className="material-icons">keyboard_arrow_right</i>
        </Button>
    );

    const [anchorEl, setAnchorEl] = React.useState(null);

    const handleClickChangeLang = (event) => {
      setAnchorEl(event.currentTarget);
    };
  
    const handleCloseChangeLangMenu = () => {
      setAnchorEl(null);
    };

    const handleSetLanguage = (langCode) => {
        // window.location.assign(`${window.location.origin}/index.html`);
        // window.location.assign(`${window.location.origin}/index.html/login`);
        // window.nw.Window.get().reloadIgnoringCache();
        setLanguage(csrf, {language: langCode}).then(() => {
            setAnchorEl(null);
            changeLang(langCode);
        })
    }
    const langBtnDrawer = (
        <div className={classes.langBtnWrapper}>
            <div>
                <Button aria-controls="lang-menu" aria-haspopup="true" onClick={handleClickChangeLang}>
                    <LanguageIcon />
                </Button>
                <Menu
                    id="lang-menu"
                    anchorEl={anchorEl}
                    keepMounted
                    open={Boolean(anchorEl)}
                    onClose={handleCloseChangeLangMenu}
                >
                    {
                        langList.map(
                            (langCode) => {
                                return (
                                    <MenuItem
                                        key={langCode}
                                        onClick={() => {
                                            handleSetLanguage(langCode);
                                        }}
                                    >
                                        {t(langCode)}
                                    </MenuItem>
                                );
                            }
                        )
                    }
                </Menu>
            </div>
        </div>
    );

    const logoDrawer = (
        <img
            src="/img/company_logo.png"
            alt=""
            width="130%"
            style={{marginLeft: '-8px', marginTop: '-5px'}}
        />
    );
    if (!ready) {
        return <span />;
    }
    return (
        <div style={{display: "relative"}}>
            <div style={{height: '100vh'}} >
                <Grid
                    container
                    style={{
                        minHeight: '100%',
                        backgroundColor: colors.background,
                        paddingTop: '5%',
                    }}
                    justifyContent="center"
                >
                    <Grid item xs={12} sm={8} md={4} lg={4} xl={4} style={{maxWidth: '450px'}}>
                        <LinearProgress
                            classes={{root: classes.root}}
                            variant={linearProgressType}
                            value={100}
                            color="primary"
                        />
                        <Card style={{padding: '20px'}} elevation={8}>
                            <CardContent style={{padding: '16px'}}>
                                <Grid container justify="space-between" >
                                    <Grid item xs={6} sm={4} md={4} lg={4} xl={4}>
                                        {logoDrawer}
                                    </Grid>
                                    <Grid item xs={6} sm={4} md={4} lg={4} xl={4}>
                                        {langBtnDrawer}
                                    </Grid>
                                    <Grid item xs={12} sm={12} md={12} lg={12} xl={12}>
                                        <Typography
                                            color="primary"
                                            style={{
                                                paddingTop: '15px',
                                                paddingBottom: '15px',
                                                fontSize: '16px',
                                            }}
                                            variant="body2"
                                        >
                                            {t('welcomeMessage', labels)}
                                        </Typography>
                                        <Typography
                                            variant="h6"
                                            color="primary"
                                            style={{
                                                paddingBottom: '10px',
                                                fontSize: '14px',
                                            }}
                                        >
                                            <span
                                                style={{
                                                    paddingBottom: '10px',
                                                    color: '#00000',
                                                    opacity: '0.54',
                                                    lineHeight: '1.6',
                                                    marginRight: '10px',
                                                    fontWeight: 'normal',
                                                }}
                                            >
                                                {hasUser ? t('signInPwd') : t('signUpMessage')}
                                            </span>
                                        </Typography>
                                        {inputFieldsDrawer}
                                    </Grid>
                                    <Grid item xs={12}>
                                        {submitDrawer}
                                    </Grid>
                                </Grid>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            </div>
            <InfoDialogWrapper t={t} />
            <P2Dialog
                open={dialog.open}
                handleClose={handleDialogClose}
                title={dialog.title}
                content={dialog.content}
                actionTitle={dialog.actionTitle}
                actionFn={dialog.actionFn}
                cancelActTitle={dialog.cancelTitle}
                cancelActFn={dialog.cancelFn}
            />
            <Footer t={t} />
        </div>
    );
};

LoginApp.whyDidYouRender = false;

export default LoginApp;
