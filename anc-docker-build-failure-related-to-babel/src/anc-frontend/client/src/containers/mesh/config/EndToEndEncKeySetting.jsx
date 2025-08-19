import React from 'react';
import PropTypes from 'prop-types';
import {Typography, Tooltip, IconButton, InputAdornment} from '@material-ui/core';
// import Visibility from '@material-ui/icons/Visibility';
// import VisibilityOff from '@material-ui/icons/VisibilityOff';
// import {compose} from 'redux';
import {connect} from 'react-redux';
// import {withTranslation} from 'react-i18next';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
// import {formValidator} from '../../util/inputValidator';
// import {getConfig, getFilteredConfigOptions} from '../../util/apiCall';
// import {formValidator} from '../../util/inputValidator';
import FormInputCreator from '../../../components/common/FormInputCreator';
import FormSelectCreator from '../../../components/common/FormSelectCreator';


function EndToEndEncKeySetting(props) {
    const {
        data: {
            formData, errorStatus, statusText,
            sameAsWirelessEncryptionKey, filterConfig,
            haveDiscrepancies,
        },
        t,
        isPartialLock,
    } = props;

    const inputAdorment = (
        <InputAdornment position="end">
            <IconButton
                disabled={formData.e2eEnc === 'disable' || haveDiscrepancies || isPartialLock}
                onClick={() => props.handleShowPassword()}
            >
                {props.showE2eEncKey ? <Visibility /> : <VisibilityOff />}
            </IconButton>
            <Tooltip
                disableHoverListener={formData.e2eEnc === 'disable' || haveDiscrepancies || isPartialLock}
                title={
                    <React.Fragment>
                        <p style={{marginBlockStart: 0, marginBlockEnd: 0}}>
                            {props.t('tooltip0')}
                        </p>
                        {/* <p style={{marginBlockStart: 0, marginBlockEnd: 0}}>
                            {props.t('tooltip1')}
                        </p> */}
                    </React.Fragment>
                }
            >
                <div>
                    <IconButton
                        disabled={formData.e2eEnc === 'disable' || haveDiscrepancies || isPartialLock}
                        onClick={() => props.handleE2EChange(formData.encKey, 'e2eEncKey')}
                    >
                        <i style={{fontSize: '20px'}} className="material-icons">content_copy</i>
                    </IconButton>
                </div>
            </Tooltip>
        </InputAdornment>
    );

    console.log('EndToEndEncKeySetting(props): ', props);

    return (
        <React.Fragment>
            <div style={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
                flex: 1,
                paddingTop: '16px',
            }}
            >
                <div style={{display: 'flex', alignItems: 'center', flex: 1}}>
                    <Typography component="p" style={{display: 'flex', fontSize: '18px'}}>
                        <b>{t('e2eEncLbl')}</b>
                    </Typography>
                    <Tooltip
                        title={
                            <div style={{
                                fontSize: '12px',
                                padding: '2px',
                            }}>
                                <div>{t('e2eEncTooltip1')}</div>
                                <div style={{paddingTop: '10px', fontStyle: 'italic'}}>{t('e2eEncTooltip2')}</div>
                            </div>
                        }
                        aria-label="end-to-end-encryption-tooltip"
                    >
                        <i
                            style={{
                                fontSize: '13px',
                                color: '#122D54',
                                display: 'flex',
                                marginLeft: '10px',
                            }}
                            className="material-icons"
                        >
                            help
                        </i>
                    </Tooltip>
                </div>
            </div>
            <div style={{padding: '16px 0'}}>
                <FormSelectCreator
                    errorStatus={errorStatus.e2eEnc}
                    margin="dense"
                    inputID="encryption"
                    inputLabel={t('statusLbl')}
                    inputValue={formData.e2eEnc}
                    onChangeField={e => props.handleE2EChange(e.target.value, 'e2eEnc')}
                    menuItemObj={filterConfig.e2eEnc}
                    helperText={errorStatus.e2eEnc ?
                        statusText.e2eEnc :
                        t('e2eEncHelperText')}
                    disabled={haveDiscrepancies || isPartialLock}
                />
            </div>
            <div style={{display: 'flex', padding: '16px 0'}}>
                <FormInputCreator
                    inputLabel={t('e2eEncKeyLbl')}
                    errorStatus={errorStatus.e2eEncKey}
                    inputID="encryptionKey"
                    inputValue={formData.e2eEncKey}
                    onChangeField={e => props.handleE2EChange(e.target.value, 'e2eEncKey')}
                    autoFocus={false}
                    margin="dense"
                    helperText={errorStatus.e2eEncKey ?
                        statusText.e2eEncKey :
                        t('e2eEncKeyHelperText')
                    }
                    inputType="password"
                    disabled={sameAsWirelessEncryptionKey || formData.e2eEnc === 'disable' ||
                     haveDiscrepancies || isPartialLock}
                    // handleShowPassword={props.handleShowPassword}
                    // enableEyeButton
                    enableEyeButton={false}
                    endAdornment={inputAdorment}
                    showPassword={props.showE2eEncKey}
                    autoComplete="new-password"
                />
            </div>
            {/* <div style={{
                display: 'flex',
                justifyContent: 'flex-end',
                flex: 1,
                alignItems: 'center',
                paddingTop: '30px',
                paddingBottom: '10px',
            }}
            >
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    disabled={haveDiscrepancies}
                    onClick={props.handleReset}
                >
                    {t('resetLbl')}
                </Button>
                <Button
                    style={{marginLeft: '8px'}}
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={props.handleSave}
                    disabled={errorStatus.e2eEncKey || errorStatus.e2eEnc || haveDiscrepancies}
                >
                    {t('saveLbl')}
                </Button>
            </div> */}
        </React.Fragment>
    );
}

function mapStateToProps(store) {
    return {
        csrf: store.common.csrf,
    };
}

EndToEndEncKeySetting.propTypes = {
    // csrf: PropTypes.string.isRequired,
    t: PropTypes.func.isRequired,
    data: PropTypes.shape(
        {
            formData: PropTypes.shape(
                {
                    encKey: PropTypes.string.isRequired,
                    clusterId: PropTypes.string.isRequired,
                    managementIp: PropTypes.string.isRequired,
                    managementNetmask: PropTypes.string.isRequired,
                    country: PropTypes.string.isRequired,
                    bpduFilter: PropTypes.string.isRequired,
                    e2eEnc: PropTypes.string.isRequired,
                    e2eEncKey: PropTypes.string.isRequired,
                }
            ).isRequired,
            errorStatus: PropTypes.shape(
                {
                    e2eEnc: PropTypes.bool.isRequired,
                    e2eEncKey: PropTypes.bool.isRequired,
                }
            ).isRequired,
            statusText: PropTypes.shape(
                {
                    e2eEnc: PropTypes.string.isRequired,
                    e2eEncKey: PropTypes.string.isRequired,
                }
            ).isRequired,
            filterConfig: PropTypes.shape(
                {
                    e2eEnc: PropTypes.arrayOf(PropTypes.object).isRequired,
                    e2eEncKey: PropTypes.string.isRequired,
                }
            ).isRequired,
            sameAsWirelessEncryptionKey: PropTypes.bool.isRequired,
            haveDiscrepancies: PropTypes.bool.isRequired,
        }
    ).isRequired,
    handleE2EChange: PropTypes.func.isRequired,
    // handleReset: PropTypes.func.isRequired,
    // handleSave: PropTypes.func.isRequired,
    handleShowPassword: PropTypes.func.isRequired,
    showE2eEncKey: PropTypes.bool.isRequired,
    isPartialLock: PropTypes.bool.isRequired,
};

export default connect(mapStateToProps)(EndToEndEncKeySetting);
