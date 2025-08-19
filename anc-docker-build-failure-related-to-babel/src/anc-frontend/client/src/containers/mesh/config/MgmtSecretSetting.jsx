/**
 * @Author: Kenny
 * @Date:   2018-11-09T15:09:06+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-11-13T11:03:40+08:00
 */
import React from 'react';
import PropTypes from 'prop-types';
// import {compose} from 'redux';
import {connect} from 'react-redux';
// import {withTranslation} from 'react-i18next';
import {withRouter} from 'react-router-dom';
import Cookies from 'js-cookie';
// import Card from '@material-ui/core/Card';
import Paper from '@material-ui/core/Paper';
import InputAdornment from '@material-ui/core/InputAdornment';
import IconButton from '@material-ui/core/IconButton';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import CardContent from '@material-ui/core/CardContent';
import CardActions from '@material-ui/core/CardActions';
import Typography from '@material-ui/core/Typography';
import Button from '@material-ui/core/Button';
import {formValidator} from '../../../util/inputValidator';
import {updateManagementSecret} from '../../../util/apiCall';
// import {convertIpToMac} from '../../util/formatConvertor';
import FormInputCreator from '../../../components/common/FormInputCreator';
import Constant from '../../../constants/common';


const {themeObj, colors} = Constant;

function createFormInput(
    title,
    errorStatus,
    inputLabel,
    inputID,
    inputValue,
    onChangeField,
    onKeyPressField,
    helperText,
    inputType,
    showPassword,
    disabled,
    endAdornment
) {
    return (
        <FormInputCreator
            key={inputID}
            errorStatus={errorStatus}
            inputLabel={title}
            inputID={inputID}
            inputValue={inputValue}
            onChangeField={onChangeField}
            margin="dense"
            onKeyPressField={onKeyPressField}
            autoFocus={false}
            helperText={errorStatus ? helperText : inputLabel}
            inputType={showPassword ? 'text' : inputType}
            endAdornment={endAdornment}
            disabled={disabled}
        />
    );
}


class MgmtSecretSetting extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            disableMgmtSecretSave: true,
            showPassword: false,
            errorStatus: {
                currentSecret: false,
                newSecret: false,
                confirmNewSecret: false,
            },
            formData: {
                currentSecret: '',
                newSecret: '',
                confirmNewSecret: '',
            },
            statusText: {
                currentSecret: '',
                newSecret: '',
                confirmNewSecret: '',
            },
            isPartialLock: this.props.isPartialLock,
        };
        this.handleShowPasssword = this.handleShowPasssword.bind(this);
        this.getEyeIconButton = this.getEyeIconButton.bind(this);
        this.handleInput = this.handleInput.bind(this);
        this.triggerFormStatus = this.triggerFormStatus.bind(this);
        this.triggerDoubleFormStatus = this.triggerDoubleFormStatus.bind(this);
        this.checkSaveDisable = this.checkSaveDisable.bind(this);
        this.clickMgmtSecretReset = this.clickMgmtSecretReset.bind(this);
        this.clickSave = this.clickSave.bind(this);
        this.t = this.props.t;
        this.enterToSubmit = this.enterToSubmit.bind(this);
    }

    componentDidMount() {
        console.log('----enter to MgmtSecretSetting----');
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.isPartialLock !== this.state.isPartialLock) {
            this.setState({
                ...this.state,
                isPartialLock: nextProps.isPartialLock,
            });
        }
    }

    getEyeIconButton() {
        return (
            <InputAdornment position="end">
                <IconButton
                    onClick={this.handleShowPasssword}
                >
                    {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
            </InputAdornment>
        );
    }

    handleInput(event) {
        const inputID = event.target.id;
        const inputValue = event.target.value;
        const regexPattern = /^[!-~]{8,32}$/;

        let isValidObj = {};
        let cb = null;

        isValidObj = formValidator('isRequired', inputValue);
        if (isValidObj.result) {
            isValidObj = formValidator('matchRegex', inputValue, regexPattern);
            if (!isValidObj.result) {
                isValidObj.text = this.t('secretErrorHelperTextForRegex');
            }
        }

        if (inputID === 'currentSecret') {
            const value = 'newSecret';
            let status = true;
            let text = '';
            const inputText = this.state.formData.newSecret;
            if (this.state.formData.newSecret !== '') {
                if (inputValue === this.state.formData.newSecret) {
                    status = false;
                    text = this.t('secretErrorHelperTextForSameAsCurrentSecret');
                }
            }
            if (isValidObj.result) {
                cb = () => {
                    this.triggerFormStatus(value, status, text, inputText);
                };
            }
            this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text, inputValue, cb);
        } else if (inputID === 'newSecret') {
            const value = 'newSecret';
            let status = true;
            let text;
            const inputText = inputValue;

            const value2 = 'confirmNewSecret';
            let status2 = true;
            let text2;
            const inputText2 = this.state.formData.confirmNewSecret;

            if (this.state.formData.currentSecret === inputValue) {
                status = false;
                text = this.t('secretErrorHelperTextForSameAsCurrentSecret');
            } else {
                status = true;
                text = '';
            }
            if (this.state.formData.confirmNewSecret !== '') {
                if (this.state.formData.confirmNewSecret !== inputValue) {
                    status2 = false;
                    text2 = this.t('secretErrorHelperTextForNotSameAsNewSecret');
                } else {
                    status2 = true;
                    text2 = '';
                }
            }
            if (!isValidObj.result) {
                cb = () => {
                    this.triggerDoubleFormStatus(
                        value, isValidObj.result, isValidObj.text, inputText, value2, status2, text2, inputText2);
                };
            } else {
                cb = () => {
                    this.triggerDoubleFormStatus(value, status, text, inputText, value2, status2, text2, inputText2);
                };
            }
            this.triggerFormStatus(inputID, isValidObj.result, isValidObj.text, inputValue, cb);
        } else if (inputID === 'confirmNewSecret') {
            let status = true;
            let text = '';

            if (inputValue !== this.state.formData.newSecret) {
                status = false;
                text = this.t('secretErrorHelperTextForNotSameAsNewSecret');
            }
            this.triggerFormStatus(inputID, status, text, inputValue, cb);
        }
    }

    enterToSubmit(event) {
        if (event.key === 'Enter') {
            if (!this.state.disableMgmtSecretSave) {
                this.clickSave();
            }
        }
    }

    triggerFormStatus(field, status, text, inputValue, cb) {
        this.setState({
            errorStatus: {...this.state.errorStatus, [field]: !status},
            statusText: {...this.state.statusText, [field]: text},
            formData: {...this.state.formData, [field]: inputValue},
        }, (() => {
                if (cb) cb();
                this.checkSaveDisable();
            })
        );
    }

    triggerDoubleFormStatus(field, status, text, inputValue, field2, status2, text2, inputValue2) {
        this.setState({
            errorStatus: {...this.state.errorStatus, [field]: !status, [field2]: !status2},
            statusText: {...this.state.statusText, [field]: text, [field2]: text2},
            formData: {...this.state.formData, [field]: inputValue, [field2]: inputValue2},
        }, (() => {
                this.checkSaveDisable();
            }));
    }

    checkSaveDisable() {
        if (this.state.errorStatus.newSecret ||
                this.state.errorStatus.currentSecret ||
                this.state.errorStatus.confirmNewSecret ||
                this.state.formData.newSecret === '' ||
                this.state.formData.currentSecret === '' ||
                this.state.formData.confirmNewSecret === '') {
            this.setState({
                disableMgmtSecretSave: true,
            });
        } else {
            this.setState({
                disableMgmtSecretSave: false,
            });
        }
    }

    clickMgmtSecretReset() {
        console.log('-----clickMgmtSecretReset-----');
        console.log(this.state);
        this.setState({
            ...this.state,
            disableMgmtSecretSave: true,
            showPassword: false,
            errorStatus: {
                ...this.state.errorStatus,
                currentSecret: false,
                newSecret: false,
                confirmNewSecret: false,
            },
            formData: {
                ...this.state.formData,
                currentSecret: '',
                newSecret: '',
                confirmNewSecret: '',
            },
            statusText: {
                ...this.state.statusText,
                currentSecret: '',
                newSecret: '',
                confirmNewSecret: '',
            },
        });
    }

    clickSave() {
        this.props.handleLockLayer(true);
        const body = {};
        body.currentManagementSecret = this.state.formData.currentSecret;
        body.updateManagementSecret = this.state.formData.newSecret;
        updateManagementSecret(this.props.csrf, Cookies.get('projectId'), body).then(() => {
            const dialog = {
                open: true,
                title: this.t('successTitleForChangeSecret'),
                content: this.t('successContentForChangeSecret'),
                submitButton: this.t('logoutProjectButtonLabel'),
                submitAction: () => {
                    Cookies.remove('projectId');
                    window.location.assign(`${window.location.origin}/index.html`);
                },
                cancelButton: '',
                cancelAction: this.props.handleDialogOnClose,
            };
            this.props.setDialog(dialog, () => { this.props.handleLockLayer(false); });
            // this.setState({
            //     isLock: false,
            //     dialog: {
            //         ...this.state.dialog,
            //         open: true,
            //         title: this.t('successTitleForChangeSecret'),
            //         content: this.t('successContentForChangeSecret'),
            //         submitButton: this.t('logoutProjectButtonLabel'),
            //         submitAction: () => {
            //             Cookies.set('projectID', '');
            //             toMeshTab();
            //         },
            //         cancelButton: '',
            //         cancelAction: this.handleDialogOnClose,
            //     },
            // });
        }).catch((error) => {
            const updateError = error.data;

            // Some of the node cannot update management secret
            if (updateError.type === 'specific') {
                let hasNodeUnreachable = false;

                Object.keys(updateError.data).forEach((nodeIp) => {
                    if (updateError.data[nodeIp].errors &&
                        updateError.data[nodeIp].errors[0].type === 'unreachable') {
                        hasNodeUnreachable = true;
                    }
                });

                let dialog;
                if (hasNodeUnreachable) {
                    dialog = {
                        open: true,
                        title: this.t('remoteNodeUnreachableFailTitle'),
                        content: this.t('remoteNodeUnreachableFailCtx'),
                        submitButton: this.t('dialogSubmitLbl'),
                        submitAction: () => {
                            this.props.handlePartialLock(true, true, false);
                        },
                        cancelButton: '',
                        cancelAction: this.props.handleDialogOnClose,
                    };
                } else {
                    dialog = {
                        open: true,
                        title: this.t('failTitle'),
                        content: this.t('failContentMessageForPartialSuccess'),
                        submitButton: this.t('failActionLabelForPartialSuccess'),
                        submitAction: () => {
                            // this.props.history.push('/');
                            window.location.assign(`${window.location.origin}/index.html`);
                            
                        },
                        cancelButton: '',
                        cancelAction: this.props.handleDialogOnClose,
                    };
                }
                this.props.setDialog(dialog, () => { this.props.handleLockLayer(false); });
            } else if (updateError.type === 'errors') {
                if (updateError.data && updateError.data.length > 0 &&
                        updateError.data[0].type === 'hostnodeisnotmanaged') {
                    const dialog = {
                        open: true,
                        title: this.t('unmanagedHostnodeErrTitle'),
                        content: this.t('unmanagedHostnodeErrContent'),
                        submitButton: this.t('unmanagedHostnodeErrBtn'),
                        submitAction: () => {
                            // const currentOrigin = window.location.origin;
                            // window.location.replace(`${currentOrigin}/mesh/`);
                            // this.props.history.push('/');
                            window.location.assign(`${window.location.origin}/index.html`);
                        },
                        cancelButton: '',
                        cancelAction: this.props.handleDialogOnClose,
                    };
                    this.props.setDialog(dialog, () => { this.props.handleLockLayer(false); });
                } else if (updateError.data && updateError.data.length > 0 &&
                        updateError.data[0].type === 'unreachable.headnodeunreachable') {
                    const dialog = {
                        open: true,
                        title: this.t('unreachableHeadnodeErrTitle'),
                        content: this.t('unreachableHeadnodeErrContent'),
                        submitButton: this.t('unmanagedHostnodeErrBtn'),
                        submitAction: () => {
                            // const currentOrigin = window.location.origin;
                            // window.location.replace(`${currentOrigin}/mesh/`);
                            // this.props.history.push('/');
                            window.location.assign(`${window.location.origin}/index.html`);
                        },
                        cancelButton: '',
                        cancelAction: this.props.handleDialogOnClose,
                    };
                    this.props.setDialog(dialog, () => { this.props.handleLockLayer(false); });
                } else if (updateError.data && updateError.data.length > 0 &&
                    updateError.data[0].type === 'timelimitreached') {
                    const dialog = {
                        open: true,
                        title: this.t('timelimitreachedErrTitle'),
                        content: this.t('timelimitreachedeErrContent'),
                        submitButton: this.t('unmanagedHostnodeErrBtn'),
                        submitAction: () => {
                            // const currentOrigin = window.location.origin;
                            // window.location.replace(`${currentOrigin}/mesh/`);
                            // this.props.history.push('/');
                            window.location.assign(`${window.location.origin}/index.html`);
                        },
                        cancelButton: '',
                        cancelAction: this.props.handleDialogOnClose,
                    };
                    this.props.setDialog(dialog, () => { this.props.handleLockLayer(false); });
                } else if (updateError.data && updateError.data.length > 0
                    && updateError.data[0].type === 'auth.password') {
                    this.props.handleLockLayer(false);
                    this.setState({
                        ...this.state,
                        errorStatus: {
                            currentSecret: true,
                            newSecret: false,
                            confirmNewSecret: false,
                        },
                        statusText: {
                            currentSecret: this.t('mismatchSecretHelperText'),
                            newSecret: '',
                            confirmNewSecret: '',
                        },
                    });
                } else {
                    const dialog = {
                        open: true,
                        title: this.t('failTitle'),
                        content: this.t('failContentMessageForPartialSuccess'),
                        submitButton: this.t('failActionLabelForPartialSuccess'),
                        submitAction: () => {
                            // this.props.history.push('/');
                            window.location.assign(`${window.location.origin}/index.html`);
                        },
                        cancelButton: '',
                        cancelAction: this.props.handleDialogOnClose,
                    };
                    this.props.setDialog(dialog, () => { this.props.handleLockLayer(false); });
                }
            } else {
                const dialog = {
                    open: true,
                    title: this.t('failTitle'),
                    content: this.t('failContentMessageForPartialSuccess'),
                    submitButton: this.t('failActionLabelForPartialSuccess'),
                    submitAction: () => {
                        // this.props.history.push('/');
                        window.location.assign(`${window.location.origin}/index.html`);
                    },
                    cancelButton: '',
                    cancelAction: this.props.handleDialogOnClose,
                };
                this.props.setDialog(dialog, () => { this.props.handleLockLayer(false); });
                // this.setState({
                //     ...this.state,
                //     isLock: false,
                //     dialog: {
                //         ...this.state.dialog,
                //         open: true,
                //         title: this.t('failTitle'),
                //         content: this.t('failContentMessageForPartialSuccess'),
                //         submitButton: this.t('failActionLabelForPartialSuccess'),
                //         submitAction: () => {
                //             toMeshTab(false);
                //         },
                //         cancelButton: '',
                //         cancelAction: this.handleDialogOnClose,
                //     },
                // });
            }
        });
    }

    handleShowPasssword() {
        this.setState({
            showPassword: !this.state.showPassword,
        });
    }

    render() {
        return (
            <Paper style={{background: colors.paperBackground, margin: '20px 52px'}} elevation={1}>
                <CardContent
                    style={{
                        // margin: '0 10px 10px 0px',
                        // height: 'calc(100vh - 380px)',
                        overflowY: 'auto',
                    }}
                >
                    <Typography
                        variant="body2"
                        style={{
                            color: themeObj.txt.normal,
                            fontSize: '18px',
                            paddingBottom: '16px',
                        }}
                    >
                        <b>{this.t('secretTitle')}</b>
                    </Typography>
                    {createFormInput(
                        this.t('currentSecretLabel'),
                        this.state.errorStatus.currentSecret,
                        this.t('currentSecretDescription'),
                        'currentSecret',
                        this.state.formData.currentSecret,
                        this.handleInput,
                        this.enterToSubmit,
                        this.state.statusText.currentSecret,
                        'password',
                        this.state.showPassword,
                        this.state.isPartialLock,
                        this.getEyeIconButton('currentSecret')
                    )}
                    {createFormInput(
                        this.t('newSecretLabel'),
                        this.state.errorStatus.newSecret,
                        this.t('newSecretDescription'),
                        'newSecret',
                        this.state.formData.newSecret,
                        this.handleInput,
                        this.enterToSubmit,
                        this.state.statusText.newSecret,
                        'password',
                        this.state.showPassword,
                        this.state.isPartialLock
                    )}
                    {createFormInput(
                        this.t('confirmSecretLabel'),
                        this.state.errorStatus.confirmNewSecret,
                        this.t('confirmSecretDescription'),
                        'confirmNewSecret',
                        this.state.formData.confirmNewSecret,
                        this.handleInput,
                        this.enterToSubmit,
                        this.state.statusText.confirmNewSecret,
                        'password',
                        this.state.showPassword,
                        this.state.isPartialLock
                    )}
                </CardContent>
                <div style={{paddingBottom: '10px'}}>
                    <CardActions style={{padding: '8px 12px 8px 4px'}}>
                        <div style={{flex: 1}} />
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={this.clickMgmtSecretReset}
                            disabled={this.state.isPartialLock || !this.props.isAllNodesReachable}
                        >
                            {this.t('resetLbl')}
                        </Button>
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={this.clickSave}
                            disabled={this.state.disableMgmtSecretSave || this.state.isPartialLock || !this.props.isAllNodesReachable}
                        >
                            {this.t('saveLbl')}
                        </Button>
                    </CardActions>
                </div>
            </Paper>
        );
    }
}


MgmtSecretSetting.propTypes = {
    history: PropTypes.object.isRequired, /* eslint-disable-line */
    csrf: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired,
    handleLockLayer: PropTypes.func.isRequired,
    setDialog: PropTypes.func.isRequired,
    handleDialogOnClose: PropTypes.func.isRequired,
    // display: PropTypes.bool,
    handlePartialLock: PropTypes.func.isRequired,
    isPartialLock: PropTypes.bool.isRequired,
    isAllNodesReachable: PropTypes.bool.isRequired,
};

// SecuritySettings.defaultProps = {
//     display: false,
// };

function mapStateToProps(state) {
    const {csrf} = state.common;
    return {
        csrf,
    };
}

export default connect(mapStateToProps)(withRouter(MgmtSecretSetting));

