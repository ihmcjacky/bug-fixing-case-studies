import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';
import TimeIcon from '@material-ui/icons/Schedule';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import Switch from '@material-ui/core/Switch';
import TextField from '@material-ui/core/TextField';
import Typography from '@material-ui/core/Typography';
import {ReactComponent as DowngradeIcon} from '../../../icon/svg/ic_fw_downgrade.svg';
import {isIPv4} from '../../../util/inputValidator';

const AdvancedBox = (props) => {
    const {
        t,
        enableDownGrade,
        handleEnableDowngradeOnCheck,
        supportNtpSer,
        timeDiff,
        handleInputCallback,
        handleNtpServerOnClick,
        resetIpInput,
    } = props;

    const [input, setInput] = useState({
        value: '',
        error: false,
        helperText: ' ',
    });

    useEffect(() => {
        setInput({
            value: '',
            error: false,
            helperText: ' ',
        })
    }, [resetIpInput]);

    const inputOnChange = (event) => {
        const inputValue = event.target.value;
        const isvalid = inputValue !== '' ? isIPv4(inputValue) : true;

        setInput({
            value: inputValue,
            error: !isvalid,
            helperText: isvalid ? ' ' : t('notAIpAddress'),
        });
        handleInputCallback(inputValue !== '');
    };

    return (
        <div>
            <Typography
                color="primary"
                style={{
                    fontWeight: 'bold',
                    paddingBottom: '20px',
                    paddingTop: '20px',
                }}
            >
                {t('advancedFeatures')}
            </Typography>
            <Card>
                <Grid
                    container
                    direction="row"
                    style={{padding: '30px 25px 30px 25px'}}
                    alignItems="center"
                    justify="space-between"
                >
                    <Grid item xs={12} sm={6}>
                        <div
                            style={{
                                display: 'inline-block',
                                verticalAlign: 'middle',
                            }}
                        >
                            <DowngradeIcon style={{fill: 'rgba(0, 0, 0, 0.87)'}} />
                        </div>
                        <div
                            style={{
                                display: 'inline-block',
                                verticalAlign: 'middle',
                            }}
                        >
                            <Typography
                                color="primary"
                                style={{paddingLeft: '4px'}}
                            >
                                <strong>{t('enableFwDowngradeContent')}</strong>
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <div style={{float: 'right'}}>
                            <Switch
                                checked={enableDownGrade}
                                onChange={handleEnableDowngradeOnCheck}
                                style={{height: 'auto'}}
                                color="primary"
                                disableRipple
                            />
                        </div>
                    </Grid>
                </Grid>
                <Divider />
                {/* --------------ntp server part ---------------------*/}
                {supportNtpSer ?
                    <Grid
                        container
                        direction="row"
                        style={{padding: '30px 25px 30px 25px'}}
                        alignItems="center"
                        justify="space-between"
                    >
                        <Grid item xs={12} sm={10}>
                            <div
                                style={{
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                }}
                            >
                                <TimeIcon style={{fontSize: '41px'}} />
                            </div>
                            <div
                                style={{
                                    display: 'inline-block',
                                    verticalAlign: 'middle',
                                    width: '85%',
                                }}
                            >
                                <TextField
                                    id="ntp-input-field"
                                    label={
                                        <Typography
                                            color="primary"
                                            style={{fontSize: '22px'}}
                                        >
                                            <strong>{t('ntpServer')}</strong> ({
                                                t('lastSyncTime')}: {timeDiff})
                                        </Typography>
                                    }
                                    style={{margin: 8}}
                                    placeholder={t('ntpServerInputTips')}
                                    fullWidth
                                    margin="normal"
                                    InputLabelProps={{shrink: true}}
                                    error={input.error}
                                    InputProps={{inputProps: {style: {marginTop: '14px'}}}}
                                    value={input.value}
                                    onChange={inputOnChange}
                                    helperText={input.helperText}
                                />
                            </div>
                        </Grid>
                        <Grid item xs={12} sm={2}>
                            <div style={{float: 'right'}}>
                                <Button
                                    disabled={input.error || input.value === ''}
                                    style={{height: 'auto'}}
                                    color="primary"
                                    variant="contained"
                                    disableRipple
                                    onClick={() => { handleNtpServerOnClick(input.value); }}
                                >
                                    {t('synchronize')}
                                </Button>
                            </div>
                        </Grid>
                    </Grid> : <span />}
            </Card>
        </div>
    );
};

AdvancedBox.propTypes = {
    t: PropTypes.func.isRequired,
    enableDownGrade: PropTypes.bool.isRequired,
    handleEnableDowngradeOnCheck: PropTypes.func.isRequired,
    supportNtpSer: PropTypes.bool.isRequired,
    timeDiff: PropTypes.string.isRequired,
    handleInputCallback: PropTypes.func.isRequired,
    handleNtpServerOnClick: PropTypes.func.isRequired,
    resetIpInput: PropTypes.number.isRequired,
}

export default AdvancedBox;
