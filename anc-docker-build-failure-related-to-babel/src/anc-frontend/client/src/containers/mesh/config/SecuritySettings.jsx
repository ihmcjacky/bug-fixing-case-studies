/**
 * @Author: mango
 * @Date:   2018-12-12T17:14:08+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-12-12T17:15:36+08:00
 */
import React from 'react';
import PropTypes from 'prop-types';
// import {compose} from 'redux';
import {connect} from 'react-redux';
import {withRouter} from 'react-router-dom';
import {Trans} from 'react-i18next';
import Cookies from 'js-cookie';
import P2Dialog from '../../../components/common/P2Dialog';
import LockLayer from '../../../components/common/LockLayer';
import EncKeySetting from './EncKeySetting';
import MgmtSecretSetting from './MgmtSecretSetting';
import EndToEndEncKeySetting from './EndToEndEncKeySetting';
import {setConfig} from '../../../util/apiCall';
import {toggleSnackBar, closeSnackbar, updateProgressBar} from '../../../redux/common/commonActions';
import {formValidator} from '../../../util/inputValidator';
import {isUnreachedNode} from '../../../util/common';

class SecuritySettings extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hash: {},
            haveDiscrepancies: false,
            dialog: {
                open: false,
                title: '',
                content: '',
                submitButton: this.props.t('dialogSubmitLbl'),
                submitAction: this.handleDialogOnClose,
                cancelButton: '',
                cancelAction: this.handleDialogOnClose,
            },
            formData: {
                encKey: '',
                clusterId: '',
                managementIp: '',
                managementNetmask: '',
                country: 'HK',
                bpduFilter: '',
                e2eEnc: '',
                e2eEncKey: '',
            },
            loadData: {
                e2eEnc: '',
                e2eEncKey: '',
            },
            errorStatus: {
                e2eEnc: false,
                e2eEncKey: false,
            },
            loadErrorStatus: {
                e2eEnc: false,
                e2eEncKey: false,
            },
            statusText: {
                e2eEnc: '',
                e2eEncKey: '',
            },
            loadStatusText: {
                e2eEnc: '',
                e2eEncKey: '',
            },
            filterConfig: {
                e2eEnc: [{actualValue: '', displayValue: ''}],
                e2eEncKey: '',
            },
            sameAsWirelessEncryptionKey: false,
            isLock: true,
            isPartialLock: true,
            needRecall: false,
            showE2eEncKey: false,
        };
        // this.handleShowPasssword = this.handleShowPasssword.bind(this);
        // this.getEyeIconButton = this.getEyeIconButton.bind(this);
        // this.handleInput = this.handleInput.bind(this);
        // this.triggerFormStatus = this.triggerFormStatus.bind(this);
        // this.triggerDoubleFormStatus = this.triggerDoubleFormStatus.bind(this);
        // this.checkSaveDisable = this.checkSaveDisable.bind(this);
        // this.clickMgmtSecretReset = this.clickMgmtSecretReset.bind(this);
        // this.clickSave = this.clickSave.bind(this);
        // this.handleDialogOnClose = this.handleDialogOnClose.bind(this);
        // this.handleLockLayer = this.handleLockLayer.bind(this);
        // this.setDialog = this.setDialog.bind(this);
        // this.t = this.props.t;
        // this.handlePartialLock = this.handlePartialLock.bind(this);
        // this.handleLock = this.handleLock.bind(this);
        // this.handleSecretSettingPartialLock = this.handleSecretSettingPartialLock.bind(this);

        const fnNames = [
            'handleDialogOnClose',
            'handleLockLayer',
            'setDialog',
            'handlePartialLock',
            'handleLock',
            'handleSecretSettingPartialLock',
            'setFormData',
            'handleSecurityChange',
            'handleE2EChange',
            'setE2EFilterConfig',
            'validateE2EEncKey',
            'validateE2EEnc',
            'triggerFormStatus',
            'handleReset',
            'handleSave',
            'saveProcess',
            'saveSuccessHandler',
            'saveProcessError',
            'onFailReturn',
            'onFail',
        ];

        window.__.each(fnNames, (fnName) => {
            this[fnName] = this[fnName].bind(this);
        });
        this.t = this.props.t;
    }

    componentDidMount() {
        Cookies.set('meshConfigActiveTab', 2);
        this.props.handleLock(this.handleLock);
    }

    componentWillUnmount() {
        this.props.dispatch(closeSnackbar());
    }


    onFailReturn() {
        const dialog = {
            open: true,
            title: this.t('headNodeUnreachableFailTitle'),
            content: this.t('headNodeUnreachableFailCtx'),
            submitButton: this.t('backClusterTopo'),
            submitAction: () => {
                // const currentOrigin = window.location.origin;
                // window.location.replace(`${currentOrigin}/mesh/`);
                // this.props.history.push('/mesh');
                window.location.assign(`${window.location.origin}/index.html`);
            },
            cancelButton: '',
            cancelAction: this.handleDialogOnClose,
        };
        this.setState(dialog);
    }

    onFail() {
        const dialog = {
            open: true,
            title: this.t('remoteNodeUnreachableFailTitle'),
            content: this.t('remoteNodeUnreachableFailCtx'),
            submitButton: this.t('dialogSubmitLbl'),
            submitAction: () => {
                this.handleDialogOnClose();
                this.getMeshConfig(true, false);
                this.setState({
                    isPartialLock: true,
                });
            },
            cancelButton: '',
            cancelAction: this.handleDialogOnClose,
        };
        this.setState(dialog);
    }

    setFormData(formData, hash, haveDiscrepancies) {
        console.log('setFormData: ', formData);
        const e2eEncHelperText = this.t('encKeyErrorHelperTextForRegex');
        const e2eEncValidateObj = this.validateE2EEnc(
            formData.e2eEnc, e2eEncHelperText,
            'enum',
            this.state.filterConfig.e2eEnc
        );
        const e2eEncKeyHelperText = this.t('encKeyErrorHelperTextForRegex');
        const e2eEncKeyValidateObj = this.validateE2EEncKey(
            formData.e2eEncKey,
            e2eEncKeyHelperText,
            'regex',
            this.state.filterConfig.e2eEncKey
        );
        this.setState({
            haveDiscrepancies,
            hash,
            formData,
            loadData: {
                ...this.state.loadData,
                e2eEnc: formData.e2eEnc,
                e2eEncKey: formData.e2eEncKey,
            },
            errorStatus: {
                ...this.state.errorStatus,
                e2eEnc: !e2eEncValidateObj.result,
                e2eEncKey: !e2eEncKeyValidateObj.result,
            },
            loadErrorStatus: {
                ...this.state.loadErrorStatus,
                e2eEnc: !e2eEncValidateObj.result,
                e2eEncKey: !e2eEncKeyValidateObj.result,
            },
            statusText: {
                ...this.state.statusText,
                e2eEnc: e2eEncValidateObj.text,
                e2eEncKey: e2eEncKeyValidateObj.text,
            },
            loadStatusText: {
                ...this.state.loadStatusText,
                e2eEnc: e2eEncValidateObj.text,
                e2eEncKey: e2eEncKeyValidateObj.text,
            },
        }, () => { this.props.onLoadingAct(false); });
    }

    setDialog(dialog, cb) {
        this.setState({
            ...this.state,
            dialog,
        }, () => {
            if (cb) cb();
        });
    }

    setE2EFilterConfig(filterConfig) {
        this.setState({
            filterConfig,
        });
    }

    validateE2EEncKey(inputValue, helperText) {
        const e2eEncKeyPattern = new RegExp(this.state.filterConfig.e2eEncKey);
        let isValidObj = formValidator('isRequired', inputValue, null, helperText);
        if (isValidObj.result) {
            isValidObj = formValidator('matchRegex', inputValue, e2eEncKeyPattern, helperText);
            if (!isValidObj.result) {
                isValidObj.text = this.t('e2eEncKeyErrorHelperTextForRegex');
            }
        }
        return isValidObj;
    }

    validateE2EEnc(inputValue, inputHelperText, optionType, configOption) {
        let isValidObj = formValidator('isRequired', inputValue, inputHelperText);
        if (optionType !== 'enum') {
            isValidObj.result = false;
            isValidObj.text = this.t('retrieveTypeFail');
        } else if (isValidObj.result) {
            isValidObj = formValidator('enum', inputValue, configOption, inputHelperText);
            if (!isValidObj.result) {
                isValidObj.text = this.t('invalidEnumVal');
            }
        }
        return isValidObj;
    }

    handleSecurityChange(encKey) {
        console.log('handleSecurtiyChange: ', encKey);
        this.setState({
            formData: {
                ...this.state.formData,
                encKey,
            },
        });
    }

    handleE2EChange(data, key) {
        if (key === 'sameAsWirelessEncryptionKey') {
            this.setState({
                ...(data && {
                    formData: {
                        ...this.state.formData,
                        e2eEncKey: this.state.formData.encKey,
                    },
                }),
                sameAsWirelessEncryptionKey: data,
            }, () => {
                if (data) {
                    this.handleE2EChange(this.state.formData.encKey, 'e2eEncKey');
                }
            });
        } else if (key === 'e2eEnc') {
            console.log('handleE2EChange(EndToEnd): ', data);
            const e2eEncHelperText = this.t('invalidEnumVal');
            const e2eEncValidateObj = this.validateE2EEnc(
                data, e2eEncHelperText,
                'enum',
                this.state.filterConfig.e2eEnc
            );
            this.triggerFormStatus(key, e2eEncValidateObj.result, e2eEncValidateObj.text, data);
        } else if (key === 'e2eEncKey') {
            const e2eEncKeyHelperText = this.t('e2eEncKeyErrorHelperTextForRegex');
            const e2eEncKeyValidateObj = this.validateE2EEncKey(
                data, e2eEncKeyHelperText,
                'regex',
                this.state.filterConfig.e2eEncKey
            );
            this.triggerFormStatus(key, e2eEncKeyValidateObj.result, e2eEncKeyValidateObj.text, data);
        }
    }

    triggerFormStatus(field, status, text, inputValue) {
        this.setState({
            ...this.state,
            errorStatus: {...this.state.errorStatus, [field]: !status},
            statusText: {...this.state.statusText, [field]: text},
            formData: {...this.state.formData, [field]: inputValue},
        }, () => {
            if (field === 'e2eEnc' && inputValue === 'disable') {
                this.setState({
                    ...this.state,
                    formData: {
                        ...this.state.formData,
                        e2eEncKey: this.state.loadData.e2eEncKey,
                    },
                    showE2eEncKey: false,
                });
            }
        });
    }

    handleSave() {
        console.log('-----clickEncKeySave-----');
        const saveConfigObj = {};
        saveConfigObj.checksums = this.state.hash;
        saveConfigObj.diff = {
            meshSettings: {},
        };
        saveConfigObj.diff.meshSettings.e2eEnc = this.state.formData.e2eEnc;
        saveConfigObj.diff.meshSettings.e2eEncKey = this.state.formData.e2eEncKey;

        const dialog = {};
        dialog.open = true;
        dialog.title = this.t('confirmSaveTitle');
        dialog.content =
            (
                <span>
                    <span style={{marginBottom: '15px', display: 'block'}}>
                        <Trans
                            defaults={this.t('confirmSaveContent')}
                            components={{ bold: <strong /> }}
                        />
                    </span>
                    {this.t('confirmSaveContent2')}
                </span>
            );
        dialog.nonTextContent = (<span />);
        dialog.submitButton = this.t('confirmSubmitLbl');
        dialog.submitAction = () => {
            this.handleDialogOnClose();
            this.saveProcess(saveConfigObj);
        };
        dialog.cancelButton = this.t('confirmCancelLbl');
        dialog.cancelAction = () => { this.handleDialogOnClose(); };
        // this.props.setDialog(dialog);
        this.setState({dialog});
    }

    async saveProcess(saveConfigObj) {
        const {dispatch} = this.props;

        dispatch(toggleSnackBar(this.t('savingConfigSnackbar')));
        this.props.onLoadingAct(true);
        try {
            const value = await setConfig(this.props.csrf, Cookies.get('projectId'), saveConfigObj);
            setTimeout(() => {
                this.saveSuccessHandler();
            }, value.rtt * 1000);
        } catch (error) {
            this.saveProcessError(error);
        }
    }

    saveSuccessHandler() {
        const {dispatch} = this.props;

        dispatch(closeSnackbar());
        const dialog = {};
        dialog.open = true;
        dialog.title = this.t('saveSuccessDialogTitle');
        dialog.content = (
            <span>
                <span style={{marginBottom: '15px', display: 'block'}}>
                    {this.t('saveSuccessDialogContent')}
                </span>
            </span>
        );
        dialog.submitButton = this.t('saveSuccessDialogSbmtLbl');
        dialog.submitAction = () => {
            // const currentOrigin = window.location.origin;
            // window.location.replace(`${currentOrigin}/mesh/`);
            // this.props.history.push('/');
            window.location.assign(`${window.location.origin}/index.html`);
        };
        dialog.cancelButton = '';
        dialog.cancelAction = this.handleDialogOnClose;

        // stop progress bar
        this.props.dispatch(updateProgressBar(false));
        this.props.onLoadingAct(false);
        console.log('-----saveSuccessHandler-----');
        this.setState({
            dialog,
            loadData: {
                ...this.state.loadData,
                e2eEnc: this.state.formData.e2eEnc,
                e2eEncKey: this.state.formData.e2eEncKey,
            },
            loadErrorStatus: {
                ...this.state.loadErrorStatus,
                e2eEnc: this.state.errorStatus.e2eEnc,
                e2eEncKey: this.state.errorStatus.e2eEncKey,
            },
            loadStatusText: {
                ...this.state.loadStatusText,
                e2eEnc: this.state.statusText.e2eEnc,
                e2eEncKey: this.state.statusText.e2eEncKey,
            },
        });
    }

    saveProcessError(error) {
        const {dispatch} = this.props;
        const unreachedNode = isUnreachedNode(error);
        // Something wrong, show error message with reason
        dispatch(closeSnackbar());
        this.props.dispatch(updateProgressBar(false));
        this.props.onLoadingAct(false);
        if (unreachedNode === 'headNodeUnreachable') {
            this.onFailReturn();
        } else if (unreachedNode === 'unreachable') {
            this.onFail();
        } else {
            const dialog = {
                open: true,
                title: this.t('saveFailDialogTitle'),
                content: this.t('saveFailDialogContent'),
                nonTextContent: <span />,
                submitButton: this.t('dialogSubmitLbl'),
                submitAction: this.handleDialogOnClose,
                cancelButton: '',
                cancelAction: this.handleDialogOnClose,
            };
            this.setState(dialog);
        }
    }


    handleReset() {
        this.setState({
            formData: {
                ...this.state.formData,
                e2eEnc: this.state.loadData.e2eEnc,
                e2eEncKey: this.state.loadData.e2eEncKey,
            },
            errorStatus: {
                ...this.state.errorStatus,
                e2eEnc: this.state.loadErrorStatus.e2eEnc,
                e2eEncKey: this.state.loadErrorStatus.e2eEncKey,
            },
            statusText: {
                ...this.state.statusText,
                e2eEnc: this.state.loadStatusText.e2eEnc,
                e2eEncKey: this.state.loadStatusText.e2eEncKey,
            },
            showE2eEncKey: false,
        });
    }


    handlePartialLock(isLock) {
        console.log('handlePartialLock(SecuritySettings):', isLock);
        this.setState({
            ...this.state,
            isPartialLock: isLock,
        });
    }

    handleLock(isLock, isPartialLock) {
        this.setState({
            ...this.state,
            isLock,
            isPartialLock,
        });
    }

    handleSecretSettingPartialLock(isLock, needRecall, closeDialog) {
        console.log('handleSecretSettingPartialLock(SecuritySettings):', isLock);
        this.setState({
            ...this.state,
            isPartialLock: isLock,
            needRecall,
            dialog: {
                ...this.state.dialog,
                open: closeDialog,
            },
        }, () => {
            if (needRecall) {
                this.setState({
                    ...this.state,
                    needRecall: false,
                });
            }
        });
    }

    handleDialogOnClose(cb = false) {
        this.setState({
            ...this.state,
            dialog: {
                ...this.state.dialog,
                open: false,
            },
        }, () => {
            if (typeof cb === 'function') {
                cb();
            }
        });
    }

    handleLockLayer(lock) {
        this.setState({
            ...this.state,
            isLock: lock,
        });
    }

    render() {
        console.log('partialLock(SecuritySettings):', this.state.isPartialLock);
        const {
            formData, errorStatus, statusText, haveDiscrepancies, isPartialLock,
            sameAsWirelessEncryptionKey, filterConfig, showE2eEncKey,
        } = this.state;
        return (
            <div 
                style={
                    {
                        overflowY: 'auto',
                        height: this.props.isAllNodesReachable ?
                                 'inherit' : 'calc(100vh - 380px)',
                    }
                }
            >
                <EncKeySetting
                    isAllNodesReachable={this.props.isAllNodesReachable}
                    checkIfAllNodesReachable={this.props.checkIfAllNodesReachable}
                    onLoadingAct={this.props.onLoadingAct}
                    handleLockLayer={this.handleLockLayer}
                    setDialog={this.setDialog}
                    handleDialogOnClose={this.handleDialogOnClose}
                    handleSync={this.props.handleSync}
                    setFilteredConfig={this.props.setFilteredConfig}
                    addDiscrepancies={this.props.addDiscrepancies}
                    handlePartialLock={this.handlePartialLock}
                    isPartialLock={this.state.isPartialLock}
                    needRecall={this.state.needRecall}
                    setFormData={this.setFormData}
                    setE2EFilterConfig={this.setE2EFilterConfig}
                    handleSecurityChange={this.handleSecurityChange}
                    handleGetMeshConfig={(getMeshConfig) => { this.getMeshConfig = getMeshConfig; }}
                    t={this.props.t}
                    endToEndEncKeySetting={{
                        component:
                        (<EndToEndEncKeySetting
                            handleLockLayer={this.handleLockLayer}
                            setDialog={this.setDialog}
                            handleDialogOnClose={this.handleDialogOnClose}
                            handlePartialLock={this.handleSecretSettingPartialLock}
                            isPartialLock={this.state.isPartialLock}
                            data={{
                                formData,
                                sameAsWirelessEncryptionKey,
                                errorStatus,
                                statusText,
                                filterConfig,
                                haveDiscrepancies,
                                isPartialLock,
                            }}
                            handleE2EChange={this.handleE2EChange}
                            // handleReset={this.handleReset}
                            // handleSave={this.handleSave}
                            handleShowPassword={() => {
                                this.setState({
                                    ...this.state,
                                    showE2eEncKey: !this.state.showE2eEncKey,
                                });
                            }}
                            showE2eEncKey={showE2eEncKey}
                            t={this.props.t}
                        />),
                        resetFn: this.handleReset,
                        haveDiscrepancies,
                        errorStatus,
                        e2eEnc: formData.e2eEnc,
                        e2eEncKey: formData.e2eEncKey,
                    }}
                />
                <MgmtSecretSetting
                    isAllNodesReachable={this.props.isAllNodesReachable}
                    handleLockLayer={this.handleLockLayer}
                    setDialog={this.setDialog}
                    handleDialogOnClose={this.handleDialogOnClose}
                    handlePartialLock={this.handleSecretSettingPartialLock}
                    isPartialLock={this.state.isPartialLock}
                    t={this.props.t}
                />
                <P2Dialog
                    open={this.state.dialog.open}
                    handleClose={this.handleDialogOnClose}
                    title={this.state.dialog.title}
                    content={this.state.dialog.content}
                    actionTitle={this.state.dialog.submitButton}
                    actionFn={this.state.dialog.submitAction}
                    cancelActTitle={this.state.dialog.cancelButton}
                    cancelActFn={this.state.dialog.cancelAction}
                    disableBackdropClick
                    disableEscapeKeyDown
                />
                <LockLayer
                    display={this.state.isLock}
                    top={0}
                    left={0}
                    zIndex={200}
                    hasCircularProgress
                />
            </div>
        );
    }
}
SecuritySettings.propTypes = {
    history: PropTypes.object.isRequired, /* eslint-disable-line */
    csrf: PropTypes.string.isRequired,
    onLoadingAct: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    handleLock: PropTypes.func.isRequired,
    handleSync: PropTypes.func.isRequired,
    addDiscrepancies: PropTypes.func.isRequired,
    setFilteredConfig: PropTypes.func.isRequired,
    dispatch: PropTypes.func.isRequired,
    isAllNodesReachable:PropTypes.bool.isRequired,
    checkIfAllNodesReachable: PropTypes.func.isRequired,
    // display: PropTypes.bool,
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

export const ConnectedSecuritySettings = connect(mapStateToProps)(SecuritySettings);

export default connect(mapStateToProps)(withRouter(SecuritySettings));

