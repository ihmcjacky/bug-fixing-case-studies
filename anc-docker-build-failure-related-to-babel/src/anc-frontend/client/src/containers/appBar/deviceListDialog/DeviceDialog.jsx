/**
 * @Author: mango
 * @Date:   2018-05-24T09:58:36+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-10-31T16:44:40+08:00
 */
import React from 'react';
import {compose} from 'redux';
import {withTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {withRouter} from 'react-router';
import Cookies from 'js-cookie';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import InputAdornment from '@material-ui/core/InputAdornment';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import ArrowBackIOS from '@material-ui/icons/ArrowBackIos';
import Typography from '@material-ui/core/Typography';
import {withStyles, MuiThemeProvider} from '@material-ui/core/styles';
import {formValidator} from '../../../util/inputValidator';
import LockLayer from '../../../components/common/LockLayer';
import FormInputCreator from '../../../components/common/FormInput';
import {ReactComponent as LogoutProjIcon} from '../../../icon/svg/ic_logoutProj.svg';
// import {convertIpToMac} from '../../util/formatConvertor';
import Constant from '../../../constants/common';
import P2Tooltip from '../../../components/common/P2Tooltip';
import P2Dialog from '../../../components/common/P2Dialog';
import DeviceListTable from './DeviceListTable';
import {resetManagementSecret} from '../../../util/apiCall';
import Transition from '../../../components/common/Transition';
import {changeOnView, setProjectInfo} from '../../../redux/projectManagement/projectActions';

const {theme, colors} = Constant;

const styles = {
    root: {
        color: 'white',
        backgroundColor: colors.inactiveRed,
        textTransform: 'none',
        '&:hover': {
            backgroundColor: colors.inactiveRedHover,
        },
    },
};
class DeviceDialog extends React.Component {
    constructor(props) {
        super(props);

        const fnNames = [
            'handleCloseChange',
            'isMismatch',
            'handleFixMismatch',
            'handleClickShowPasssword',
            'handleMismatchDialogOnClose',
            'handleResultDialogOnClose',
            'updateSecret',
            'triggerFormStatus',
            'handleChange',
            'enterToUpdate',
            'handleNodeInfo',
            'onLogout',
            'setLock',
            'handleDialogOnClose',
        ];

        window.__.each(fnNames, (fnName) => {
            this[fnName] = this[fnName].bind(this);
        });
        
        this.t = (tKey, options) => this.props.t(tKey, {...this.props.labels, ...options}); 

        this.state = {
            disableCloseBtn: true,
            mismatchDevice: [],
            errorStatus: false,
            formData: '',
            formStatus: false,
            statusText: '',
            showPassword: false,
            mismatchDialog: false,
            resultDialog: {
                open: false,
                status: '',
                content: (<span />),
            },
            node: [],
            isLock: true,
            dialog: {
                open: false,
                title: '',
                content: '',
                submitButton: '',
                cancelButton: '',
                submitAction: this.handleDialogOnClose,
                cancelAction: this.handleDialogOnClose,
                disableBackdropClick: false,
                disableEscapeKeyDown: false,
            },
        };
    }

    onLogout() {
        this.setState({
            ...this.state,
            dialog: {
                ...this.state.dialog,
                open: true,
                title: this.t('logoutProjTitle'),
                content: this.t('logoutProjContent'),
                submitButton: this.t('logoutProjSubmitTitle'),
                cancelButton: this.t('logoutProjCancelTitle'),
                submitAction: () => {
                    Cookies.remove('projectId');
                    // window.location.reload();
                    
                    this.props.close();
                    this.props.changeOnView('list');
                    this.props.setProjectInfo({
                        projectId: '',
                        projectName: '',
                        hasLogin: false,
                    });
                    window.location.assign(`${window.location.origin}/index.html`);
                },
                cancelAction: () => {
                    this.handleDialogOnClose();
                },
            },
        });
    }

    handleDialogOnClose() {
        this.setState({
            dialog: {
                ...this.state.dialog,
                open: false,
            },
        });
    }


    async updateSecret() {
        const {csrf, projectId} = this.props;
        const {formData, mismatchDevice} = this.state;
        const bodyMsg = {
            currentManagementSecret: formData,
            nodes: mismatchDevice,
        };
        try {
            await resetManagementSecret(csrf, projectId, bodyMsg);

            const resultDialogContent = (
                <React.Fragment>
                    <span>
                        {this.t('updateSecretSuceessContent')}
                    </span>
                    <br /><br />
                </React.Fragment>
            );
            this.setLock(false);
            this.setState({
                ...this.state,
                mismatchDialog: false,
                resultDialog: {
                    ...this.state.resultDialog,
                    open: true,
                    status: this.t('updateSecretSuceessTitle'),
                    content: resultDialogContent,
                },
            });
        } catch (err) {
            // console.log('----------error----------');
            // console.log(err.data);
            let content = (
                <React.Fragment>
                    <span>
                        {this.t('updateSecretFailContent')}
                    </span>
                    <br /><br />
                </React.Fragment>
            );
            let status = this.t('updateSecretFailTitle');
            if (err.data.type === 'specific') {
                const {node} = this.state;
                const defaultValue = this.t('defaultValue');
                // console.log(this.state.node);
                const partialList = [];
                Object.keys(err.data.data).forEach((key) => {
                    if (err.data.data[key].success === false) {
                        const nodeInfo = {};
                        nodeInfo.hostname = defaultValue;
                        nodeInfo.mac = defaultValue;
                        nodeInfo.nodeIp = defaultValue;
                        node.forEach((item) => {
                            if (item[3].ctx === key) {
                                nodeInfo.hostname = item[0].ctx;
                                nodeInfo.mac = item[4].ctx;
                                nodeInfo.nodeIp = item[3].ctx;
                            }
                        });
                        partialList.push(nodeInfo);
                    }
                }
                );
                // console.log(partialList);
                status = this.t('updateSecretPartialTitle');
                content = (
                    <React.Fragment>
                        <span>
                            {this.t('updateSecretPartialContent')}
                        </span>
                        <br /><br />
                        {partialList.map(nodeInfo => (
                            <React.Fragment key={nodeInfo.nodeIp}>
                                <span>
                                    {nodeInfo.hostname || defaultValue} ({nodeInfo.mac || defaultValue})
                                </span><br />
                            </React.Fragment>)
                        )}
                        <br />
                    </React.Fragment>
                );
            }
            this.setLock(false);
            this.setState({
                ...this.state,
                mismatchDialog: false,
                resultDialog: {
                    ...this.state.resultDialog,
                    open: true,
                    status,
                    content,
                },
            });
        }
        // console.log(csrf);
        // console.log(formData);
    }

    handleCloseChange(isDisable) {
        this.setState({
            disableCloseBtn: isDisable,
        });
    }

    // handleMismatch(event) {
    //     console.log(this.state.mismatchDevice);
    //     console.log(convertIpToMac(this.state.mismatchDevice[0]));
    //     console.log(event);
    // }

    handleFixMismatch() {
        if (this.state.mismatchDevice.length > 0) {
            this.setState({
                ...this.state,
                mismatchDialog: true,
            });
        }
    }

    setLock(isLock) {
        this.setState({isLock});
    }

    handleMismatchDialogOnClose() {
        this.setState({
            mismatchDialog: false,
            formData: '',
            errorStatus: false,
            statusText: this.t('mismatchSecretStatusText'),
            formStatus: false,
            showPassword: false,
        });
    }

    handleResultDialogOnClose() {
        this.setState({
            ...this.state,
            resultDialog: {
                ...this.state.resultDialog,
                open: false,
            },
        });
    }

    handleClickShowPasssword() {
        this.setState({showPassword: !this.state.showPassword});
    }

    handleChange(event) {
        const inputID = event.target.id || event.target.name;
        const inputValue = event.target.value;
        const {helperText} = this.t('mismatchSecretStatusText');
        const regexPattern = /^[\x20-\x7E]{8,32}$/;

        let isValidObj = {};
        switch (inputID) {
            case 'password':
                isValidObj = formValidator('isRequired', inputValue);
                if (isValidObj.result) {
                    isValidObj = formValidator('matchRegex', inputValue, regexPattern);
                    if (!isValidObj.result) {
                        isValidObj.text = this.t('regexStatusText');
                    }
                }
                if (isValidObj.text === '') {
                    isValidObj.text = this.t('mismatchSecretStatusText');
                }
                break;
            default:
                isValidObj = formValidator('isRequired', inputValue, null, helperText);
        }
        this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text, inputValue);
    }

    triggerFormStatus(field, status, text, inputValue) {
        this.setState({
            ...this.state,
            formStatus: status,
            errorStatus: !status,
            statusText: text,
            formData: inputValue,
        });
    }

    enterToUpdate(event) {
        if (event.key === 'Enter') {
            this.setLock(true);
            this.handleMismatchDialogOnClose();
            this.updateSecret();
        }
    }

    handleNodeInfo(nodeInfo) {
        // console.log('-----handleNodeInfo(Parent)-----');
        // console.log(nodeInfo);
        this.setState({
            ...this.state,
            node: nodeInfo,
        }, () => {
            // console.log('-----this.state.node(Parent)-----');
            // console.log(this.state.node);
        });
    }

    isMismatch(mismatch) {
        // console.log('-----isMismatch(Parent before)-----');
        // console.log(mismatch);
        this.setState({
            ...this.state,
            mismatchDevice: mismatch,
        }, () => {
            // console.log('-----this.state.mismatchDevice(Parent after)-----');
            // console.log(this.state.mismatchDevice);
        });
    }

    render() {
        const {classes} = this.props;
        const {
            errorStatus, formData, formStatus, statusText,
            showPassword, mismatchDialog, resultDialog,
        } = this.state;
        const closeIconButton = (
            <div>
                <IconButton
                    color="inherit"
                    aria-label="Back"
                    disabled={this.state.disableCloseBtn}
                    onClick={this.props.close}
                >
                    <ArrowBackIOS />
                </IconButton>
            </div>
        );

        const closeButton = (
            <P2Tooltip
                title={this.t('closeLbl')}
                content={closeIconButton}
            />
        );

        const refreshIconButton = (
            <IconButton color="inherit" onClick={this.handleRefresh} aria-label="refresh">
                <i className="material-icons">refresh</i>
            </IconButton>
        );

        const refreshButton = (
            <P2Tooltip
                title={this.t('refshLbl')}
                content={refreshIconButton}
            />
        );

        const logoutIconButton = (
            <IconButton color="inherit" onClick={this.onLogout} aria-label="logout">
                <LogoutProjIcon style={{fontSize: '19px', paddingTop: '2px'}} />
            </IconButton>
        );

        const logoutButton = (
            <div style={{paddingRight: '15px'}}>
                <P2Tooltip
                    title={this.t('logoutLbl')}
                    content={logoutIconButton}
                />
            </div>
        );

        const fixSecretMismatchHandler = (
            <Button
                variant="contained"
                classes={{
                    root: classes.root,
                }}
                onClick={this.handleFixMismatch}
                disableFocusRipple
            >
                <i
                    style={{
                        marginRight: 10,
                        fontSize: '14px',
                    }}
                    className="material-icons"
                >vpn_key</i>
                {this.t('fixMismatchLbl')}
            </Button>
        );

        const fixSecretMismatchButton = this.state.mismatchDevice.length > 0 && (

            <div style={{paddingRight: '10px'}}>
                <P2Tooltip
                    title={this.t('fixMismatchLbl')}
                    content={fixSecretMismatchHandler}
                />
            </div>
        );

        const passwordDisabled = !formStatus;
        let isEnterToUpdate = function () { return false; };
        if (!passwordDisabled) {
            isEnterToUpdate = this.enterToUpdate;
        }

        const submitFn = () => {
            // console.log('Accept');
            // console.log('------handleLock(true)-----');
            this.setLock(true);
            this.handleMismatchDialogOnClose();
            this.updateSecret();
        };

        const resultSubmitFn = () => {
            // console.log('close Result');
            this.setState({
                ...this.state,
                formData: '',
                errorStatus: false,
                statusText: this.t('mismatchSecretStatusText'),
                formStatus: false,
                showPassword: false,
                resultDialog: {
                    ...this.state.resultDialog,
                    open: false,
                },
            }, this.handleRefresh);
        };


        const cancelFn = () => {
            // console.log('Cancel');
            this.handleMismatchDialogOnClose();
        };

        const eyeIconButton = (
            <InputAdornment position="end">
                <IconButton
                    onClick={this.handleClickShowPasssword}
                >
                    {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
            </InputAdornment>
        );

        const loginPassword = (
            <FormInputCreator
                key="password"
                errorStatus={errorStatus}
                inputLabel={this.t('loginPwdLbl')}
                inputID="password"
                inputValue={formData}
                onChangeField={this.handleChange}
                autoFocus={false}
                margin="dense"
                onKeyPressField={isEnterToUpdate}
                helperText={statusText}
                inputType="password"
                endAdornment={eyeIconButton}
                showPassword={showPassword}
            />
        );

        const dialogContent = (
            <React.Fragment>
                <span>
                    {this.t('mismatchDialogConetent')}
                </span>
                <br /><br />
            </React.Fragment>
        );

        const changeMismatchDialog = (
            <Dialog
                open={mismatchDialog}
                onClose={this.handleMismatchDialogOnClose}
                disableBackdropClick
                disableEscapeKeyDown
                maxWidth="md"
            >
                <DialogTitle id="alert-dialog-title">{this.t('mismatchDialogTitle')}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {dialogContent}
                    </DialogContentText>
                    {loginPassword}
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={cancelFn}
                        color="primary"
                        autoFocus
                        style={{display: 'inline'}}
                        disableRipple
                    >
                        {this.t('cancelLbl')}
                    </Button>
                    <Button
                        onClick={submitFn}
                        disabled={passwordDisabled}
                        color="primary"
                        autoFocus
                        disableRipple
                    >
                        {this.t('fixLbl')}
                    </Button>
                </DialogActions>
            </Dialog>
        );

        const changeResultDialog = (
            <Dialog
                open={resultDialog.open}
                onClose={this.handleResultDialogOnClose}
                disableBackdropClick
                disableEscapeKeyDown
                maxWidth="md"
            >
                <DialogTitle id="alert-dialog-title">{resultDialog.status}</DialogTitle>
                <DialogContent>
                    <DialogContentText id="alert-dialog-description">
                        {resultDialog.content}
                    </DialogContentText>
                </DialogContent>
                <DialogActions>
                    <Button
                        onClick={resultSubmitFn}
                        color="primary"
                        autoFocus
                        disableRipple
                    >
                        {this.t('continueLbl')}
                    </Button>
                </DialogActions>
            </Dialog>
        );

        return !this.props.tReady ? <span /> : (
            <React.Fragment>
                <Dialog
                    fullScreen
                    open={this.props.open}
                    onClose={this.props.close}
                    TransitionComponent={Transition}
                    disableBackdropClick
                    disableEscapeKeyDown
                >
                    <MuiThemeProvider theme={theme}>
                        {this.state.isLock &&
                            <LockLayer
                                display
                                top={0}
                                left={0}
                                opacity={1}
                                color={colors.lockLayerBackground}
                                hasCircularProgress
                            />
                        }
                        <AppBar style={{position: 'relative'}}>
                            <Toolbar style={{minHeight: 'auto', padding: '0px'}}>
                                {closeButton}
                                <Typography variant="h6" color="inherit">
                                    {this.t('menubarLbl')}
                                </Typography>
                                <div style={{flex: 1}} />
                                {fixSecretMismatchButton}
                                {refreshButton}
                                {logoutButton}
                            </Toolbar>
                        </AppBar>
                        <DialogContent style={{backgroundColor: colors.background, padding: 0}}>
                            {
                                this.props.open ?
                                    <DeviceListTable
                                        handleRefresh={(click) => { this.handleRefresh = click; }}
                                        // handleLock={(status) => { this.handleLock = status; }}
                                        t={this.props.t}
                                        setLock={this.setLock}
                                        handleNodeInfo={this.handleNodeInfo}
                                        isMismatch={this.isMismatch}
                                        disableClose={this.handleCloseChange}
                                        handleCloseDialog={this.props.close}
                                    /> : <div />
                            }
                        </DialogContent>
                    </MuiThemeProvider>
                </Dialog>
                {changeMismatchDialog}
                {changeResultDialog}
                <P2Dialog
                    open={this.state.dialog.open}
                    handleClose={this.handleDialogOnClose}
                    title={this.state.dialog.title}
                    content={this.state.dialog.content}
                    actionTitle={this.state.dialog.submitButton}
                    actionFn={this.state.dialog.submitAction}
                    cancelActTitle={this.state.dialog.cancelButton}
                    cancelActFn={this.state.dialog.cancelAction}
                    disableBackdropClick={this.state.dialog.disableBackdropClick}
                    disableEscapeKeyDown={this.state.dialog.disableEscapeKeyDown}
                />
            </React.Fragment>
        );
    }
}

DeviceDialog.propTypes = {
    csrf: PropTypes.string.isRequired,
    lang: PropTypes.string.isRequired,
    projectId: PropTypes.string.isRequired,
    open: PropTypes.bool.isRequired,
    close: PropTypes.func.isRequired,
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    t: PropTypes.func.isRequired,
    tReady: PropTypes.bool.isRequired,
    changeOnView: PropTypes.func.isRequired,
};

function mapStateToProps(state) {
    const {csrf, lang, labels} = state.common;
    const {projectId} = state.projectManagement;
    return {
        csrf,
        lang,
        projectId,
        labels
    };
}

export default compose(
    connect(
        mapStateToProps,
        {changeOnView, setProjectInfo}
    ),
    withTranslation(['managed-device-list']),
    withStyles(styles)
)(DeviceDialog);
