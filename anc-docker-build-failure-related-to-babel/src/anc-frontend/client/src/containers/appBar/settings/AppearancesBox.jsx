import React from 'react';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';
import LanguageIcon from '@material-ui/icons/Language';
import LinearScaleIcon from '@material-ui/icons/LinearScale';
import BarChartIcon from '@material-ui/icons/BarChart';
import HomeIcon from '@material-ui/icons/HomeOutlined';
import DashboardIcon from '@material-ui/icons/DesktopMac';
import { ButtonGroup, Button } from '@material-ui/core';
import Card from '@material-ui/core/Card';
import Divider from '@material-ui/core/Divider';
import Grid from '@material-ui/core/Grid';
import IconButton from '@material-ui/core/IconButton';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import {ReactComponent as TopologyIcon} from '../../../icon/svg/ic_mesh.svg';
import P2Tooltip from '../../../components/common/P2Tooltip';
import RangeSlider from '../../../components/common/RangeSlider';
import CommonConstant from '../../../constants/common';
import { Slider } from '@material-ui/core';

const useStyles = makeStyles({
    topologyIcon: {
        width: '24px',
        height: '24px',
        padding: 0,
        color: 'rgba(0, 0, 0, 0.87)',
        '&:hover': {
            backgroundColor: 'transparent',
        },
    },
});

const {langList, pixiPreferenceList, landingViewList, themeObj} = CommonConstant;

const AppearancesBox = (props) => {
    const classes = useStyles();
    const {
        t,
        lang,
        handleLangOnChange,
        landingView,
        handleLandingViewOnChange,
        enableRssiColor,
        sliderValue,
        handleSliderEnableOnChange,
        handleSliderOnChange,
        pixiSettings,
        handlePixiSettingsOnChange,
    } = props;

    const {
        enableGraphicSettings,
    } = useSelector(store => store.devMode);

    function getLandingViewOpt(view) {
        return (
            <div
                style={{
                    fontSize: '20px',
                    verticalAlign: 'middle',
                }}
            >
                {view === 'topology' ? (
                    <IconButton
                        classes={{root: classes.topologyIcon}}
                        disableRipple
                        disableFocusRipple
                    >
                        <TopologyIcon />
                    </IconButton>
                ) : (
                    <IconButton
                        classes={{root: classes.topologyIcon}}
                        disableRipple
                        disableFocusRipple
                    >
                        <DashboardIcon />
                    </IconButton>
                )}
                <span style={{
                    verticalAlign: 'middle',
                    fontSize: '1rem',
                    paddingLeft: '10px'
                }} >
                    {t(view)}
                </span>
            </div>
        );
    }

    return (
        <div>
            <Typography
                color="primary"
                style={{fontWeight: 'bold', paddingBottom: '20px'}}
            >
                {t('appearances')}
            </Typography>
            <Card>
                {/* -------------Language------------- */}
                <Grid
                    container
                    direction="row"
                    style={{padding: '30px 25px 30px 25px'}}
                    alignItems="center"
                    justify="space-between"
                >
                    <Grid item xs={9} sm={6}>
                        <div
                            style={{
                                display: 'inline-block',
                                verticalAlign: 'middle',
                            }}
                        >
                            <LanguageIcon style={{fontSize: '41px'}} />
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
                                <strong>{t('language')}</strong>
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={3} sm={3}>
                        <Select
                            value={lang}
                            name="language"
                            onChange={handleLangOnChange}
                            style={{flex: 1, float: 'right', width: '150px'}}
                        >
                            {langList.map(lang => (
                                    <MenuItem value={lang} key={lang}>
                                        {t(lang)}
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </Grid>
                </Grid>
                <Divider />
                {/* -------------Landing view------------- */}
                <Grid
                    container
                    direction="row"
                    style={{padding: '30px 25px 30px 25px'}}
                    alignItems="center"
                    justify="space-between"
                >
                    <Grid item xs={9} sm={6}>
                        <div
                            style={{
                                display: 'inline-block',
                                verticalAlign: 'middle',
                            }}
                        >
                            <HomeIcon style={{fontSize: '41px'}} />
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
                                <strong>{t('landingView')}</strong>
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={3} sm={3}>
                        <Select
                            value={landingView}
                            renderValue={value => (
                                <div style={{paddingLeft: '10px'}}>
                                    {getLandingViewOpt(value)}
                                </div>
                            )}
                            name="landingView"
                            onChange={handleLandingViewOnChange}
                            style={{flex: 1, float: 'right', width: '220px'}}
                        >
                            {landingViewList.map((view) => (
                                    <MenuItem
                                        value={view}
                                        key={view}
                                    >
                                        {getLandingViewOpt(view)}
                                    </MenuItem>
                                )
                            )}
                        </Select>
                    </Grid>
                </Grid>
                <Divider />
                { /* ------------------rssi color ------------------------------*/}
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
                            <LinearScaleIcon style={{fontSize: '41px'}} />
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
                                <strong>{t('rssiColorIndicator')}</strong>
                                <P2Tooltip
                                    direction="right"
                                    title={<div style={{
                                        fontSize: '12px',
                                        padding: '2px',
                                        width: ' 250px',
                                    }}
                                    >
                                        {t('rssiColorIndicaterTooltip')}
                                    </div>}
                                    content={(<i
                                        className="material-icons"
                                        style={{
                                            color: themeObj.primary.light,
                                            fontSize: '20px',
                                            marginLeft: '5px',
                                            verticalAlign: 'middle',
                                        }}
                                    >help</i>)}
                                />
                            </Typography>
                        </div>
                    </Grid>
                    <div style={{float: 'right'}}>
                        <Switch
                            checked={enableRssiColor}
                            onChange={handleSliderEnableOnChange}
                            style={{height: 'auto'}}
                            color="primary"
                            disableRipple
                        />
                    </div>
                    <Grid item xs={12} sm={12}>
                        <div style={{margin: '50px 10px -4px 10px'}}>
                            <RangeSlider
                                enable={enableRssiColor}
                                value={sliderValue}
                                unit="dBm"
                                min={-95}
                                max={0}
                                handleSliderOnChange={handleSliderOnChange}
                                showLevelLabel
                                enableRailColor
                            />
                        </div>
                    </Grid>
                </Grid>
                <Divider />
                <Grid
                    container
                    direction="row"
                    style={{padding: '30px 25px 30px 25px'}}
                    alignItems="center"
                    justify="space-between"
                >
                    <Grid item xs={6} sm={6}>
                        <div
                            style={{
                                display: 'inline-block',
                                verticalAlign: 'middle',
                            }}
                        >
                            <BarChartIcon style={{fontSize: '41px'}} />
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
                                <strong>{t('graphicSettingsTitle')}</strong>
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={6} sm={6}>
                        <div style={{float: 'right'}}>
                            <ButtonGroup color="primary" aria-label="performance mode button group">
                                <Button 
                                    variant={pixiSettings.performanceMode === 'quality' ? 'contained' : 'outlined'} 
                                    onClick={() => handlePixiSettingsOnChange('performanceMode', 'quality')}
                                >
                                    {t('graphicProfileQuality')}
                                </Button>
                                <Button 
                                    variant={pixiSettings.performanceMode === 'balanced' ? 'contained' : 'outlined'} 
                                    onClick={() => handlePixiSettingsOnChange('performanceMode', 'balanced')}
                                >
                                    {t('graphicProfileBalanced')}
                                </Button>
                                <Button 
                                    variant={pixiSettings.performanceMode === 'performance' ? 'contained' : 'outlined'} 
                                    onClick={() => handlePixiSettingsOnChange('performanceMode', 'performance')}
                                >
                                    {t('graphicProfilePerformance')}
                                </Button>
                                {
                                    enableGraphicSettings ?
                                        (<Button 
                                            variant={pixiSettings.performanceMode === 'custom' ? 'contained' : 'outlined'} 
                                            onClick={() => handlePixiSettingsOnChange('performanceMode', 'custom')}
                                        >
                                            {t('graphicProfileCustom')}
                                        </Button>) : null 
                                }
                            </ButtonGroup>

                        </div>
                    </Grid>
                </Grid>
                {enableGraphicSettings ? (
                    <React.Fragment>
                        <Grid
                            container
                            direction="row"
                            style={{padding: '30px 25px 30px 25px'}}
                            alignItems="center"
                            justify="space-between"
                        >
                            <Grid item xs={9} sm={6}>
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
                                        <strong>{t('antialiasOptionTitle')}</strong>
                                    </Typography>
                                </div>
                            </Grid>
                            <Grid item xs={3} sm={3}>
                                <div style={{float: 'right'}}>
                                    <Switch
                                        checked={pixiSettings.antialias}
                                        onChange={() => handlePixiSettingsOnChange('antialias', !pixiSettings.antialias)}
                                        style={{height: 'auto'}}
                                        color="primary"
                                        disableRipple
                                    />
                                </div>
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            direction="row"
                            style={{padding: '30px 25px 30px 25px'}}
                            alignItems="center"
                            justify="space-between"
                        >
                            <Grid item xs={9} sm={6}>
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
                                        <strong>{t('resolutionOptionTitle')}</strong>
                                    </Typography>
                                </div>
                            </Grid>
                            <Grid item xs={3} sm={3}>
                                <Slider
                                    value={pixiSettings.resolution}
                                    onChange={(e, value) => handlePixiSettingsOnChange('resolution', value)}
                                    aria-labelledby="resolution-slider"
                                    step={0.1} // Adjust the step for finer control
                                    marks
                                    min={0.5}
                                    max={2}
                                    valueLabelDisplay="auto"
                                    valueLabelFormat={(value) => `${value}x`}
                                />
                                <Typography variant="body2">Current Resolution: {pixiSettings.resolution}</Typography>
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            direction="row"
                            style={{padding: '30px 25px 30px 25px'}}
                            alignItems="center"
                            justify="space-between"
                        >
                            <Grid item xs={9} sm={6}>
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
                                        <strong>{t('clearBeforeRenderOptionTitle')}</strong>
                                    </Typography>
                                </div>
                            </Grid>
                            <Grid item xs={3} sm={3}>
                                <div style={{float: 'right'}}>
                                    <Switch
                                        checked={pixiSettings.clearBeforeRender}
                                        onChange={() => handlePixiSettingsOnChange('clearBeforeRender', !pixiSettings.clearBeforeRender)}
                                        style={{height: 'auto'}}
                                        color="primary"
                                        disableRipple
                                    />
                                </div>
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            direction="row"
                            style={{padding: '30px 25px 30px 25px'}}
                            alignItems="center"
                            justify="space-between"
                        >
                            <Grid item xs={9} sm={6}>
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
                                        <strong>{t('preferenceOptionTitle')}</strong>
                                    </Typography>
                                </div>
                            </Grid>
                            <Grid item xs={3} sm={3}>
                                <Select
                                    value={pixiSettings.preference}
                                    name="language"
                                    onChange={(e) => handlePixiSettingsOnChange('preference', e.target.value)}
                                    style={{flex: 1, float: 'right', width: '150px'}}
                                >
                                    {pixiPreferenceList.map(opt => (
                                            <MenuItem value={opt.actualValue} key={opt.actualValue}>
                                                {opt.displayValue}
                                            </MenuItem>
                                        )
                                    )}
                                </Select>
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            direction="row"
                            style={{padding: '30px 25px 30px 25px'}}
                            alignItems="center"
                            justify="space-between"
                        >
                            <Grid item xs={9} sm={6}>
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
                                        <strong>{t('maxFPSOptionTitle')}</strong>
                                    </Typography>
                                </div>
                            </Grid>
                            <Grid item xs={3} sm={3}>
                                <Slider
                                    value={pixiSettings.maxFPS}
                                    onChange={(e, value) => handlePixiSettingsOnChange('maxFPS', value)}
                                    aria-labelledby="maxfps-slider"
                                    step={1} // Adjust the step for finer control
                                    min={10}
                                    max={60}
                                    valueLabelDisplay="auto"
                                    valueLabelFormat={(value) => `${value}`}
                                />
                                <Typography variant="body2">Current Max FPS: {pixiSettings.maxFPS}</Typography>
                            </Grid>
                        </Grid>
                        <Grid
                            container
                            direction="row"
                            style={{padding: '30px 25px 30px 25px'}}
                            alignItems="center"
                            justify="space-between"
                        >
                            <Grid item xs={9} sm={6}>
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
                                        <strong>{t('minFPSOptionTitle')}</strong>
                                    </Typography>
                                </div>
                            </Grid>
                            <Grid item xs={3} sm={3}>
                                <Slider
                                    value={pixiSettings.minFPS}
                                    onChange={(e, value) => handlePixiSettingsOnChange('minFPS', value)}
                                    aria-labelledby="minFPS-slider"
                                    step={1} // Adjust the step for finer control
                                    min={10}
                                    max={60}
                                    valueLabelDisplay="auto"
                                    valueLabelFormat={(value) => `${value}`}
                                />
                                <Typography variant="body2">Current Min FPS: {pixiSettings.minFPS}</Typography>
                            </Grid>
                        </Grid>
                    </React.Fragment>
                ) : null}
            </Card>
        </div>
    );
};

AppearancesBox.propTypes = {
    t: PropTypes.func.isRequired,
    lang: PropTypes.string.isRequired,
    handleLangOnChange: PropTypes.func.isRequired,
    landingView: PropTypes.string.isRequired,
    handleLandingViewOnChange: PropTypes.func.isRequired,
    enableRssiColor: PropTypes.bool.isRequired,
    sliderValue: PropTypes.arrayOf(PropTypes.number).isRequired,
    handleSliderOnChange: PropTypes.func.isRequired,
};

export default AppearancesBox;
