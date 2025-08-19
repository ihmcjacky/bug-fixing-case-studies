import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import UpdateIcon from '@material-ui/icons/Update';
import Card from '@material-ui/core/Card';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import CommonConstant from '../../../constants/common';
import TextField from '@material-ui/core/TextField';
import interalSettingsConstant from '../../../constants/interalSettings';


const useStyles = makeStyles({
});

const {themeObj} = CommonConstant;

const {pbfTypeToTranslationNameMap} = interalSettingsConstant;

const InternalSettingsItemInt = (props) => {
    const [error, setError] = useState(false);
    const [helperText, setHelperText] = useState(' ');
    const classes = useStyles();
    const {
        t,
        name,
        value,
        handleOnChange,
    } = props;

    const handleValidation = (event) => {
        const value = parseInt(event.target.value, 10);
        if (value < 2 || value > 300) {
          // Set error state and helper text
          setError(true);
          setHelperText(`${t('errorHelperText1')} 2 ${t('errorHelperText2')} 300 ${t('errorHelperText3')}`);
        } else {
          // Clear error state and helper text
          setError(false);
          setHelperText(' ');
        }
    }

    return (
        <Grid
            container
            direction="row"
            style={{padding: '30px 25px 30px 25px'}}
            alignItems="center"
            justify="space-between"
            spacing={2}
        >
            <Grid item xs={6} sm={6}>
                <div
                    style={{
                        display: 'inline-block',
                        verticalAlign: 'middle',
                    }}
                >
                    <UpdateIcon style={{fontSize: '41px'}} />
                </div>
                <div
                    style={{
                        display: 'inline-block',
                        verticalAlign: 'middle',
                    }}
                >
                    <Typography
                        color="primary"
                        style={{
                            paddingLeft: '10px',
                        }}
                    >
                        <strong>{t(pbfTypeToTranslationNameMap[name])}</strong>
                    </Typography>
                </div>
            </Grid>
            <Grid item xs={3} sm={3}>
                <TextField
                    label={t('queueSize')}
                    type="number"
                    value={value}
                    onChange={(e) => {handleOnChange(e, name, 'value');}}
                    onBlur={(e) => {handleValidation(e);}}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    helperText={helperText}
                    error={error}
                />
            </Grid>
        </Grid>
    );
};


const InternalSettingsItemObj = (props) => {
    const classes = useStyles();
    const [errorForLastRunSuccess, setErrorForLastRunSuccess] = useState(false);
    const [errorForLastRunFail, setErrorForLastRunFail] = useState(false);
    const [helperTextForLastRunSuccess, setHelperTextForLastRunSuccess] = useState(' ');
    const [helperTextForLastRunFail, setHelperTextForLastRunFail] = useState(' ');
    const {
        t,
        name,
        interval_for_last_run_success,
        interval_for_last_run_fail,
        handleOnChange,
    } = props;

    const handleValidation = (event, name) => {
        const value = parseInt(event.target.value, 10);
        if (value < 1 || value > 300) {
          // Set error state and helper text
          if (name === 'interval_for_last_run_success') {
            setErrorForLastRunSuccess(true);
            setHelperTextForLastRunSuccess(`${t('errorHelperText1')} 1 ${t('errorHelperText2')} 300 ${t('errorHelperText3')}`);
          } else {
            setErrorForLastRunFail(true);
            setHelperTextForLastRunFail(`${t('errorHelperText1')} 1 ${t('errorHelperText2')} 300 ${t('errorHelperText3')}`);
          }
        } else {
          // Clear error state and helper text
            if (name === 'interval_for_last_run_success') {
                setErrorForLastRunSuccess(false);
                setHelperTextForLastRunSuccess(' ');
            } else {
                setErrorForLastRunFail(false);
                setHelperTextForLastRunFail(' ');
            }
        }
    };


    
    return (
        <Grid
            container
            direction="row"
            style={{padding: '30px 25px 30px 25px'}}
            alignItems="center"
            justify="space-between"
            spacing={2}
        >
            <Grid item xs={6} sm={6}>
                <div
                    style={{
                        display: 'inline-block',
                        verticalAlign: 'middle',
                    }}
                >
                    <UpdateIcon style={{fontSize: '41px'}} />
                </div>
                <div
                    style={{
                        display: 'inline-block',
                        verticalAlign: 'middle',
                    }}
                >
                    <Typography
                        color="primary"
                        style={{
                            paddingLeft: '10px',
                        }}
                    >
                        <strong>{t(pbfTypeToTranslationNameMap[name])}</strong>
                    </Typography>
                </div>
            </Grid>
            <Grid item xs={3} sm={3}>
                <TextField
                    label={t('intervalForLastRunSuccess')}
                    type="number"
                    value={interval_for_last_run_success}
                    onChange={(e) => {handleOnChange(e, name, 'interval_for_last_run_success');}}
                    onBlur={(e) => {handleValidation(e, 'interval_for_last_run_success');}}
                    error={errorForLastRunSuccess}
                    helperText={helperTextForLastRunSuccess}
                    inputProps={{ min: 1, max: 300 }}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    FormHelperTextProps={{ error: true }} // ensures the text is styled as an error
                />
            </Grid>
            <Grid item xs={3} sm={3}>
                <TextField
                    label={t('intervalForLastRunFail')}
                    type="number"
                    value={interval_for_last_run_fail}
                    onChange={(e) => {handleOnChange(e, name, 'interval_for_last_run_fail');}}
                    onBlur={(e) => {handleValidation(e, 'interval_for_last_run_fail');}}
                    error={errorForLastRunFail}
                    helperText={helperTextForLastRunFail}
                    inputProps={{ min: 1, max: 300 }}
                    variant="outlined"
                    fullWidth
                    margin="normal"
                    FormHelperTextProps={{ error: true }} // ensures the text is styled as an error
                />
            </Grid>
        </Grid>
    );
};

const InternalSettingsBox = (props) => {
    const classes = useStyles();
    const {
        t,
        internalSettings,
        setInternalSettings,
    } = props;
    const handleOnChange = (event, name, type) => {
        const value = parseInt(event.target.value, 10);
        setInternalSettings(
            {
                ...internalSettings,
                [name]: {
                    ...internalSettings[name],
                    value: {
                        ...internalSettings[name].value,
                        [type]: value,
                    }
                }
            }
        );
    };

    const handleOnIntChange = (event, name) => {
        const value = parseInt(event.target.value, 10);
        setInternalSettings(
            {
                ...internalSettings,
                [name]: {
                    ...internalSettings[name],
                    value: value,
                }
            }
        );
    };

    return (
        <div>
            <Typography
                color="primary"
                style={{fontWeight: 'bold', paddingBottom: '20px', paddingTop: '20px',}}
            >
                {t('internalSettings')}
            </Typography>
            <Card>

                {
                    Object.keys(internalSettings).map((key) => {
                        if (internalSettings[key].value_type === 'int') {
                            return (
                                <div key={key}>
                                    <InternalSettingsItemInt
                                        t={t}
                                        name={key}
                                        value={internalSettings[key].value}
                                        handleOnChange={handleOnIntChange}
                                    />
                                    <Divider />
                                </div>
                            );
                        }
                        return (
                            <div key={key}>
                                <InternalSettingsItemObj
                                    t={t}
                                    name={key}
                                    interval_for_last_run_fail={internalSettings[key].value.interval_for_last_run_fail}
                                    interval_for_last_run_success={internalSettings[key].value.interval_for_last_run_success}
                                    handleOnChange={handleOnChange}
                                />
                                <Divider />
                            </div>
                        );
                    })
                }

            </Card>
        </div>
    );
};

InternalSettingsBox.propTypes = {
    t: PropTypes.func.isRequired,
};

export default InternalSettingsBox;
