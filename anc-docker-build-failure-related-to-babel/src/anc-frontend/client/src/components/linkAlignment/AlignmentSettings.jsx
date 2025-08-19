import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import {withTranslation} from 'react-i18next';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import {Button, InputLabel, Select, FormControl} from '@material-ui/core';
import {withStyles, createMuiTheme, MuiThemeProvider} from '@material-ui/core/styles';
import Constant from '../../constants/common';
import {ReactComponent as SettingsIcon} from '../../icon/svg/ic_settings.svg';

const {colors} = Constant;

const styles = {
    tags: {
        padding: '0 4px',
        color: colors.tagTxt,
    },
};

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

const AlignmentSettings = (props) => {
    const {
        width,
        setRadio,
        clearCurrentGraphData,
        handleSwipeableMenuOpen,
        startRadioInfoInterval,
        stopRadioInfoInterval,
        handleExport,
        radioDevice,
        radioOptions,
        deviceInfo,
        isPolling,
        starting,
        radioNeighbor,
        disableAdjustConfig,
        classes,
        t,
    } = props;
    return (
        <Grid
            item
            style={{
                display: 'flex',
                flex: '1 0 50%',
                flexDirection: 'column',
                minWidth: '650px',
            }}
        >
            {
                width < 1422 ? <div
                    style={
                        {
                            marginLeft: '8vw',
                            borderTop: `1px solid ${colors.tagTxt}`,
                            width: '70vw',
                        }}
                /> : null
            }
            <div style={{margin: '50px'}}>
                <MuiThemeProvider theme={customSelectStyles}>
                    <FormControl
                        fullWidth
                    >
                        <InputLabel
                            style={{
                                fontSize: '28px',
                            }}
                            htmlFor="radio-device-select"
                        >
                            {t('radioDeviceSelectInputLabel')}
                        </InputLabel>
                        <Select
                            multiple
                            MenuProps={{
                                anchorOrigin: {
                                  vertical: "bottom",
                                  horizontal: "left"
                                },
                                transformOrigin: {
                                  vertical: "top",
                                  horizontal: "left"
                                },
                                getContentAnchorEl: null
                            }}
                            style={{fontSize: '22px'}}
                            value={radioDevice}
                            onChange={(e) => {
                                // console.log('kyle_debug: AlignmentSettings - e', e.target);
                                if (e.target.value.length !== 0) {
                                    setRadio(e.target.value.sort());
                                }
                            }}
                            renderValue={(selected) => {
                                // console.log('kyle_debug: AlignmentSettings -> selected', selected);
                                const translatedArray = selected.map(radio =>
                                    t('menuItemLabel', {returnObjects: true})[radio]);
                                // console.log('kyle_debug: AlignmentSettings -> translatedArray', translatedArray);
                                return translatedArray.join(', ');
                            }}
                        >
                            {radioOptions}
                        </Select>
                    </FormControl>
                </MuiThemeProvider>
                <div style={{display: 'block', height: '105px'}}>
                    {deviceInfo.map(info => (
                        <div
                            key={info.radio}
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                paddingTop: '10px',
                                fontSize: '22px',
                            }}
                        >
                            <SettingsIcon width="16px" height="16px" fill={colors.tagTxt}/>
                            <Typography className={classes.tags}>
                                {`R${info.radio.slice(info.radio.length - 1)}: ${info.info}`}
                            </Typography>
                        </div>
                    ))}
                </div>
                <div style={{display: 'block', paddingTop: '20px'}}>
                    <Button
                        variant="contained"
                        color="primary"
                        style={{
                            marginRight: '5px',
                        }}
                        onClick={handleSwipeableMenuOpen}
                        disabled={disableAdjustConfig}
                    >
                        {t('adjustConfigBtn')}
                    </Button>
                    <Button
                        color="primary"
                        variant="contained"
                        style={{
                            marginRight: '5px',
                        }}
                        onClick={() => {
                            if (isPolling || starting) {
                                stopRadioInfoInterval();
                            } else {
                                clearCurrentGraphData();
                                startRadioInfoInterval();
                            }
                        }}
                        disabled={starting}
                    >
                        {isPolling || starting ?
                            t('stopAlignmentBtn') : t('startAlignmentBtn')}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={handleExport}
                        color="primary"
                        autoFocus
                        disableRipple
                        disabled={isPolling || radioNeighbor.length === 0}
                    >
                        {t('exportLbl')}
                    </Button>
                </div>
                <Typography
                    component="p"
                    className={classes.tags}
                    style={{
                        fontSize: '12px',
                        padding: '10px 0',
                    }}
                >
                    {t('scanIntervalRemarks')}
                </Typography>
            </div>
        </Grid>
    );
};

AlignmentSettings.propTypes = {
    width: PropTypes.number.isRequired,
    radioDevice: PropTypes.arrayOf(PropTypes.string).isRequired,
    radioOptions: PropTypes.arrayOf(PropTypes.element).isRequired,
    deviceInfo: PropTypes.arrayOf(PropTypes.object).isRequired,
    isPolling: PropTypes.bool.isRequired,
    starting: PropTypes.bool.isRequired,
    radioNeighbor: PropTypes.array.isRequired, //eslint-disable-line
    setRadio: PropTypes.func.isRequired,
    clearCurrentGraphData: PropTypes.func.isRequired,
    handleSwipeableMenuOpen: PropTypes.func.isRequired,
    startRadioInfoInterval: PropTypes.func.isRequired,
    stopRadioInfoInterval: PropTypes.func.isRequired,
    handleExport: PropTypes.func.isRequired,
    disableAdjustConfig: PropTypes.bool.isRequired,
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    t: PropTypes.func.isRequired,
};

export default compose(
    withTranslation(['link-alignment']),
    withStyles(styles)
)(AlignmentSettings);
