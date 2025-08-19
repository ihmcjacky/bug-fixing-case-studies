import React from 'react';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import {createMuiTheme, MuiThemeProvider} from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import P2Tooltip from '../../components/common/P2Tooltip';
import FreqRangeSlider from '../../components/common/FreqRangeSlider';
import {getChannelFromFreq} from './spectrumScanHelperFunc';

const durationArr = [10, 30, 60, 120, 240, 300];

const customSelectStyles = createMuiTheme({
    overrides: {
        MuiInputBase: {
            inputSelect: {
                paddingLeft: '3px',
            },
        },
        MuiInput: {
            formControl: {
                'label + &': {
                    marginTop: 0,
                },
            },
        },
        MuiInputLabel: {
            formControl: {
                position: 'relative',
            },
        },
    },
});
const useStyles = makeStyles({
    rangeSliderTitle: {
        fontSize: '14px',
        color: 'rgba(0, 0, 0, 0.54)',
    },
    checkbox: {
        fontSize: '10px',
    },
    label: {
        fontSize: '13px',
        color: 'rgba(0, 0, 0, 0.54)',
    },
});
const bound = [5170, 5250, 5330, 5490, 5570, 5650, 5730, 5735, 5815];

const SpectrumScanControlPanel = (props) => {
    const classes = useStyles();
    const {isAnalysisData} = useSelector(store => store.spectrumScan);
    const {
        t,
        radioNameArr,
        selectedRadio,
        freqRange,
        duration,
        handleRadioChange, handleDurationChange,
        handleSliderOnChange,
        handleUncheckDefault,
        handleReset,
        handleScan,
        setScanRangeToDefault,
        hasWarning,
        oneLineDisplay,
        setDialog,
        isDefaultScan,
        setDefaultScan,
    } = props;

    const handleDefaultScanOnClick = () => {
        if (isDefaultScan) {
            const min = Math.min(...freqRange);
            const max = Math.max(...freqRange);
            if (min >= 5815) {
                handleUncheckDefault([5735, 5815]);
            } else {
                let nearestLow;
                let nearestHigh;
                bound.some((lv, idx) => {
                    if (lv > min) nearestLow = bound[idx - 1];
                    if (lv < max) nearestHigh = bound[idx + 1];
                    return nearestHigh && nearestLow;
                });
                handleUncheckDefault([nearestLow, nearestHigh]);
            }
        } else {
            setScanRangeToDefault();
        }
        // setDefaultScan(!isDefaultScan);
    };

    const handleResetOnClick = () => {
        setDefaultScan(true);
        handleReset();
    };

    const handleScanOnClick = () => {
        if (isAnalysisData) {
            setDialog({
                open: true,
                title: t('scanWarningTitle'),
                content: t('scanWarningContent'),
                actionTitle: t('ok'),
                actionFn: () => {
                    handleScan();
                    setDialog({
                        open: false,
                        cancelActTitle: '',
                        cancelActFn: () => {},
                    });
                },
                cancelActTitle: t('cancel'),
                cancelActFn: () => {
                    setDialog({
                        open: false,
                        cancelActTitle: '',
                        cancelActFn: () => {},
                    });
                },
            });
        } else {
            handleScan();
        }
    };

    const handleSelect = (value) => {
        setDefaultScan(true);
        handleRadioChange(value);
    };

    const overlapped = freqRange[0] === freqRange[1];

    return (
        <Grid
            item
            xs={6}
            style={{
                marginLeft: oneLineDisplay ? 0 : '10%',
                minWidth: oneLineDisplay ? '630px' : '80%',
                borderTop: oneLineDisplay ? '' : '1px solid rgba(33, 33, 33, 0.37)',
            }}
        >
            <div
                style={{
                    margin: oneLineDisplay ? `${hasWarning ? '25px' : '35px'} 20% 15px 4%` : '35px 10px 35px 10px',
                }}
            >
                <MuiThemeProvider theme={customSelectStyles} >
                    <FormControl fullWidth>
                        <Typography
                            component="p"
                            className={classes.rangeSliderTitle}
                        >
                            {t('radioSelecterTitle')}
                        </Typography>
                        <Select
                            style={{fontSize: '14px'}}
                            value={selectedRadio}
                            onChange={handleSelect}
                        >
                            {radioNameArr.map(radio => (<MenuItem
                                key={radio.key}
                                value={radio.key}
                                disabled={radio.disable}
                            >
                                {t('menuItemLabel', {returnObjects: true})[radio.key]}
                                {radio?.disable ? ` (${t(radio.reason)})` : ''}
                            </MenuItem>))}
                        </Select>
                    </FormControl>
                </MuiThemeProvider>
                <div style={{margin: '10px 0 10px 0'}}>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <Typography
                            component="p"
                            className={classes.rangeSliderTitle}
                        >
                            {t('rangeSliderTitle')} {`CH${getChannelFromFreq(freqRange[0])} - CH${getChannelFromFreq(freqRange[1])}`}
                        </Typography>
                        <P2Tooltip
                            direction="right"
                            title={overlapped ? t('overlapedContent') : t('freqRangeHelperContent')}
                            content={(<i
                                className="material-icons"
                                style={{
                                    color: overlapped ? '#DC4639' : '#122d54',
                                    fontSize: '14px',
                                    marginLeft: '5px',
                                    marginTop: '-1px',
                                    userSelect: 'none',
                                }}
                            >{overlapped ? 'error' : 'help'}</i>)}
                        />
                        <FormControlLabel
                            classes={{
                                label: classes.label,
                            }}
                            style={{marginLeft: 'auto'}}
                            control={
                                <Checkbox
                                    style={{padding: '0px'}}
                                    checked={isDefaultScan}
                                    onChange={handleDefaultScanOnClick}
                                    value={t('setRangeToDefault')}
                                    color="primary"
                                />
                            }
                            label={t('setRangeToDefault')}
                        />
                    </div>
                    <div
                        style={{
                            position: 'relative',
                            margin: '15px 0px',
                            height: '40px',
                        }}
                    >
                        <FreqRangeSlider
                            value={freqRange}
                            handleSliderChange={handleSliderOnChange}
                            disabled={isDefaultScan}
                        />
                    </div>
                </div>
                <MuiThemeProvider theme={customSelectStyles}>
                    <FormControl fullWidth>
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                            }}
                        >
                            <Typography
                                component="p"
                                className={classes.rangeSliderTitle}
                            >
                                {t('durationSelecterTitle')}
                            </Typography>
                            <P2Tooltip
                                direction="right"
                                title={t('durationHelperContent')}
                                content={(<i
                                    className="material-icons"
                                    style={{
                                        color: '#122d54',
                                        fontSize: '14px',
                                        marginLeft: '5px',
                                        marginTop: '-1px',
                                        userSelect: 'none',
                                    }}
                                >help</i>)}
                            />
                        </div>
                        <Select
                            style={{fontSize: '14px'}}
                            value={duration}
                            onChange={handleDurationChange}
                        >
                            {durationArr.map(time => (
                                <MenuItem key={`duration${time}`} value={time}>
                                    {`${time}s`}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </MuiThemeProvider>
                <div
                    style={{
                        marginTop: '15px',
                        display: 'block',
                    }}
                >
                    <Button
                        variant="contained"
                        color="primary"
                        style={{
                            marginRight: '5px',
                        }}
                        onClick={handleResetOnClick}
                        disableRipple
                    >
                        {t('reset')}
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        autoFocus
                        disableRipple
                        onClick={handleScanOnClick}
                        disabled={overlapped}
                    >
                        {t('scan')}
                    </Button>
                </div>
            </div>
        </Grid>
    );
};

SpectrumScanControlPanel.propTypes = {
    t: PropTypes.func.isRequired,
    radioNameArr: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        disable: PropTypes.bool.isRequired,
    })).isRequired,
    selectedRadio: PropTypes.string.isRequired,
    freqRange: PropTypes.arrayOf(PropTypes.number).isRequired,
    duration: PropTypes.number.isRequired,
    handleRadioChange: PropTypes.func.isRequired,
    handleDurationChange: PropTypes.func.isRequired,
    handleSliderOnChange: PropTypes.func.isRequired,
    handleUncheckDefault: PropTypes.func.isRequired,
    handleReset: PropTypes.func.isRequired,
    handleScan: PropTypes.func.isRequired,
    setScanRangeToDefault: PropTypes.func.isRequired,
    hasWarning: PropTypes.bool.isRequired,
    oneLineDisplay: PropTypes.bool.isRequired,
    setDialog: PropTypes.func.isRequired,
    isDefaultScan: PropTypes.bool.isRequired,
    setDefaultScan: PropTypes.func.isRequired,
};

export default SpectrumScanControlPanel;
