import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import {withStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ToggleButton from '@material-ui/lab/ToggleButton';
import Typography from '@material-ui/core/Typography';
import Slider from '@material-ui/core/Slider';
import Grid from '@material-ui/core/Grid';
import SpectrumHeatmapGraph from './SpectrumHeatmapGraph';
import SpectrumWaterfallGraph from './SpectrumWaterfallGraph';
import Constant from '../../constants/common';
import LockLayer from '../../components/common/LockLayer';


const {themeObj} = Constant;

const SpectrumGraph = ({
    t, importExportGroup, fullSizeGraph, needWarning,
    isAnalysisData,
}) => {
    const [graphType, setGraphType] = useState('waveform');
    const [dspType, setDspType] = useState('avg');
    const [colorScale, setColorScale] = useState([0, 4]);
    const [lockState, setLockState] = useState({
        loading: true,
        message: '',
    });
    const {color, graphData: {startTime, filename, hasData}} = useSelector(store => store.spectrumScan);

    const setLoader = (loading) => {
        console.log('setLoader input isLoading: ', loading);
        setLockState({
            loading,
            message: '',
        });
        // setState((prevState) => {
        //     console.log('setLoader prevState isLoading: ', prevState.loading);
        //     return {
        //         ...prevState,
        //         loading,
        //         message: '',
        //     };
        // });
    };

    const RainbowSlider = withStyles({
        root: {
            color: 'transparent',
            background: 'linear-gradient(to right,blue,cyan,green,yellow,red)',
            height: 3,
            padding: '3px 0px 5px 0px',
        },
        thumb: {
            height: 1,
            width: 1,
            backgroundColor: 'transparent',
            border: 'none',
            '&:focus, &:hover, &$active': {
                boxShadow: 'none',
            },

        },
        active: {},
        track: {
            height: 3,
        },
        rail: {
            color: 'transparent',
            opacity: 1,
            height: 3,
        },
    })(Slider);

    function arrowComponent(props) {
        return (
            <span {...props}>
                <span style={{
                    paddingTop: '34px',
                    marginLeft: '11px',
                    width: 0,
                    height: 0,
                    borderStyle: 'solid',
                    borderWidth: '0 4px 8px 4px',
                    borderColor: `transparent transparent ${themeObj.primary.main} transparent`,

                }}
                />
            </span>
        );
    }

    const colorIncrement = (color.max - color.min) / 4;

    return (
        <React.Fragment>
            <LockLayer
                display={lockState.loading}
                message={lockState.message}
            />
            {isAnalysisData &&
                <span
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                        margin: '15px 0px',
                    }}
                >
                    <span
                        style={{
                            color: themeObj.primary.main,
                            border: `solid 2px ${themeObj.primary.main}`,
                            borderRadius: '3px',
                            padding: '10px',
                            display: 'flex',
                        }}
                    >
                        <Typography style={{marginRight: 5}}>{t('filenameTitle')}</Typography>
                        <Typography style={{fontWeight: 500}}>{filename}</Typography>
                        <Typography style={{marginRight: 5, marginLeft: 10}}>{t('exportTimeTitle')}</Typography>
                        <Typography style={{fontWeight: 500}}>{startTime}</Typography>
                    </span>
                </span>
            }
            <span
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    width: '100%',
                    margin: '10px 50px',
                    height: 48,
                    alignItems: 'flex-end',
                }}
            >
                <ToggleButtonGroup
                    size="small"
                    exclusive
                    value={graphType}
                    onChange={(e, newGraphType) => { if (newGraphType) setGraphType(newGraphType); }}
                >
                    <ToggleButton
                        value="waveform"
                        style={{
                            height: 24,
                            border: `1px solid ${themeObj.primary.main}`,
                            color: graphType === 'waveform' ?
                                'white' :
                                themeObj.primary.main,
                            backgroundColor: graphType === 'waveform' ?
                                themeObj.primary.main :
                                'white',
                        }}
                    >
                        {t('waveformLbl')}
                    </ToggleButton>
                    <ToggleButton
                        value="waterfall"
                        style={{
                            height: 24,
                            border: `1px solid ${themeObj.primary.main}`,
                            color: graphType === 'waterfall' ?
                                'white' :
                                themeObj.primary.main,
                            backgroundColor: graphType === 'waterfall' ?
                                themeObj.primary.main :
                                'white',
                        }}
                    >
                        {t('waterfallLbl')}
                    </ToggleButton>
                </ToggleButtonGroup>
                {graphType === 'waterfall' &&
                    <span style={{display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
                        <Typography
                            style={{
                                fontSize: 12,
                                color: themeObj.primary.main,
                                marginBottom: 3,
                            }}
                        >
                            {t('dspCalLbl')}
                        </Typography>
                        <ToggleButtonGroup
                            size="small"
                            exclusive
                            value={dspType}
                            onChange={(e, newDspType) => { if (newDspType) setDspType(newDspType); }}
                        >
                            <ToggleButton
                                value="avg"
                                style={{
                                    height: 24,
                                    border: `1px solid ${themeObj.primary.main}`,
                                    color: dspType === 'avg' ?
                                        'white' :
                                        themeObj.primary.main,
                                    backgroundColor: dspType === 'avg' ?
                                        themeObj.primary.main :
                                        'white',
                                }}
                            >
                                {t('averageLbl')}
                            </ToggleButton>
                            <ToggleButton
                                value="max"
                                style={{
                                    height: 24,
                                    border: `1px solid ${themeObj.primary.main}`,
                                    color: dspType === 'max' ?
                                        'white' :
                                        themeObj.primary.main,
                                    backgroundColor: dspType === 'max' ?
                                        themeObj.primary.main :
                                        'white',
                                }}
                            >
                                {t('maxLbl')}
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </span>
                }
                <span style={{display: 'flex', alignItems: 'flex-end'}}>
                    <span style={{display: 'flex', flexDirection: 'column', marginBottom: '-7px'}}>
                        <Typography
                            style={{
                                fontSize: 12,
                                color: themeObj.primary.main,
                                marginBottom: 3,
                                // padding: '0px 7px',
                            }}
                        >
                            {graphType === 'waveform' ? t('noOfHitsLbl') : t('powerLvlLbl')}
                        </Typography>
                        <span style={{
                            display: 'flex',
                            width: '196px',
                            height: '14px',
                            // padding: '0px 7px',
                            flexDirection: 'column',
                        }}
                        >
                            {
                                graphType === 'waveform' && hasData ?
                                    (<RainbowSlider
                                        min={0}
                                        max={4}
                                        value={colorScale}
                                        ThumbComponent={arrowComponent}
                                        defaultValue={[0, 4]}
                                        onChangeCommitted={(e, value) => {
                                            console.log('RainbowSlide onChange', value);
                                            if (value[0] !== value[1]) {
                                                setColorScale(value);
                                            }
                                        }}
                                    />)
                                    :
                                    (<span
                                        style={{
                                            width: '196px',
                                            height: '14px',
                                            // eslint-disable-next-line max-len
                                            background: 'linear-gradient(to right,blue,cyan,green,yellow,red)',
                                        }}
                                    />)
                            }
                        </span>
                        <Grid
                            container
                            style={{
                                marginTop: 6,
                                color: themeObj.primary.main,
                            }}
                        >
                            <Grid item xs={3}>
                                <Typography style={{fontSize: 9, transform: 'translateX(-50%)', textAlign: 'center'}}>
                                    {color.min}
                                </Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography style={{fontSize: 9, transform: 'translateX(-50%)', textAlign: 'center'}}>
                                    {Math.round(color.min + colorIncrement)}
                                </Typography>
                            </Grid>
                            <Grid item xs={3}>
                                <Typography style={{fontSize: 9, transform: 'translateX(-50%)', textAlign: 'center'}}>
                                    {Math.round(color.min + (colorIncrement * 2))}
                                </Typography>
                            </Grid>
                            <Grid item xs={3} style={{display: 'flex', justifyContent: 'space-between'}}>
                                <Typography style={{fontSize: 9, transform: 'translateX(-50%)', textAlign: 'center'}}>
                                    {Math.round(color.min + (colorIncrement * 3))}
                                </Typography>
                                <Typography style={{fontSize: 9, transform: 'translateX(50%)', textAlign: 'center'}}>
                                    {color.max}
                                </Typography>
                            </Grid>
                        </Grid>
                    </span>
                    {importExportGroup}
                </span>
            </span>
            {
                graphType === 'waterfall' ?
                    <SpectrumWaterfallGraph
                        t={t}
                        dspType={dspType}
                        fullSizeGraph={fullSizeGraph}
                        needWarning={needWarning}
                        isAnalysisData={isAnalysisData}
                        setLoader={setLoader}
                        isLoading={lockState.loading}
                    /> :
                    <SpectrumHeatmapGraph
                        t={t}
                        colorScale={colorScale}
                        fullSizeGraph={fullSizeGraph}
                        needWarning={needWarning}
                        isAnalysisData={isAnalysisData}
                        setLoader={setLoader}
                        isLoading={lockState.loading}
                    />
            }
        </React.Fragment>
    );
};

SpectrumGraph.propTypes = {
    t: PropTypes.func.isRequired,
    isAnalysisData: PropTypes.bool.isRequired,
    importExportGroup: PropTypes.element.isRequired,
    fullSizeGraph: PropTypes.bool.isRequired,
    needWarning: PropTypes.bool.isRequired,
};

export default SpectrumGraph;
