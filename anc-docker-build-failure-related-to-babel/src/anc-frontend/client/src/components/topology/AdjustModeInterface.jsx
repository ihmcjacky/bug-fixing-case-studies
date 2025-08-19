import React, {useState, useEffect, useRef} from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import CheckIcon from '@material-ui/icons/Done';
import ColorPickIcon from '@material-ui/icons/ColorLens';
import FixDimensionIcon from '@material-ui/icons/Lock';
import FitViewIcon from '@material-ui/icons/Adjust';
import ResetIcon from '@material-ui/icons/Refresh';
import Badge from '@material-ui/core/Badge';
import ButtonBase from '@material-ui/core/ButtonBase';
import Checkbox from '@material-ui/core/Checkbox';
import Fade from '@material-ui/core/Fade';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grow from '@material-ui/core/Grow';
import IconButton from '@material-ui/core/IconButton';
import Slider from '@material-ui/core/Slider';
import Snackbar from '@material-ui/core/Snackbar';
import Typography from '@material-ui/core/Typography';
import ToggleButton from '@material-ui/lab/ToggleButton';
import ToggleButtonGroup from '@material-ui/lab/ToggleButtonGroup';
import ColorPicker from '../common/ColorPicker';
import P2Tooltip from '../../components/common/P2Tooltip';

const useStyles = makeStyles({
    opacity: {
        width: '200px',
        maxWidth: '200px',
    },
    fixDimension: {width: '140px'},
    colorPicker: {width: '260px'},
    fitView: {},
    active: {
        '&$active': {
            boxShadow: '0px 0px 0px 7px',
        },
    },
    sliderRoot: {width: '170px'},
    thumb: {
        '&$focusVisible,&:hover': {
            boxShadow: 'none',
            '@media (hover: none)': {
                boxShadow: '0px 0px 0px 7px',
            },
        },
        '&$active': {boxShadow: 'none'},
    },
});

const opacityIcon = (<svg id="opacity-icon" width="25" height="25" viewBox="0 0 25 25" fill="white" xmlns="http://www.w3.org/2000/svg">
    <path
        d="M8.35596e-07 15.4417C3.74844e-07 20.7121 4.28772 24.9998 9.55811
            24.9998C13.7259 24.9998 17.2787 22.3181 18.5829 18.5898C19.9291 18.1227
            21.1632 17.3539 22.2004 16.3166C24.0057 14.5113 25 12.1111 25 9.55795C25
            7.00497 24.0057 4.60457 22.2004 2.79945C20.3951 0.994148 17.9949 3.75346e-05
            15.4419 3.73114e-05C12.8889 3.70882e-05 10.4887 0.994147 8.6834 2.79945C7.62978
            3.85288 6.87447 5.09323 6.41651 6.41464C2.68479 7.71698 1.20017e-06 11.2715
            8.35596e-07 15.4417ZM16.2136 1.50131C17.1679 1.59096 18.0868 1.84654 18.9369
            2.25414L14.1369 7.05379C13.3539 6.62483 12.5048 6.30249 11.6089 6.10584L16.2136
            1.50131ZM13.0495 8.14117L8.14076 13.0497C7.7282 12.1849 7.47719 11.2618 7.38888
            10.326L10.3294 7.38548C11.2951 7.47723 12.212 7.7391 13.0495 8.14117ZM16.081
            10.6568L10.6535 16.0843C10.3252 15.8425 10.0128 15.5743 9.71909 15.2808C9.42383
            14.9853 9.15604 14.6727 8.91609 14.346L14.3433 8.91899C15.0066 9.40689 15.5931
            9.9934 16.081 10.6568ZM23.4987 8.78624L18.894 13.391C18.6974 12.4953 18.3752
            11.6461 17.9462 10.8632L22.7461 6.06331C23.1535 6.91322 23.4091 7.83218 23.4987
            8.78624ZM16.8221 17.5347L17.5329 16.8236C17.4986 17.0224 17.457 17.2184 17.4084
            17.412C17.215 17.4599 17.0195 17.5009 16.8221 17.5347ZM17.6144 14.6706L14.6702
            17.6148C13.7161 17.5251 12.7974 17.2696 11.9473 16.8621L16.8589 11.9505C17.2609
            12.788 17.5226 13.7047 17.6144 14.6706ZM7.47147 8.17188C7.50504 7.97676 7.54585
            7.78259 7.59392 7.58995C7.78542 7.54207 7.97959 7.50107 8.17623 7.46693L7.47147
            8.17188ZM21.1647 15.281C20.5271 15.9184 19.8017 16.436 19.0161 16.8234C19.0817
            16.3721 19.1162 15.9109 19.1162 15.4417C19.1162 15.3754 19.1151 15.309 19.1137
            15.2428L23.4184 10.9381C23.139 12.575 22.3629 14.0826 21.1647 15.281ZM21.9683
            4.76955L17.1265 9.61136C16.6239 8.96057 16.0395 8.37616 15.3887 7.87357L20.2307
            3.03177C20.5587 3.27362 20.8712 3.5416 21.1647 3.83514C21.4584 4.12888 21.7264
            4.4413 21.9683 4.76955ZM9.71909 3.83514C10.9173 2.63714 12.425 1.86104 14.0619
            1.58142L9.75704 5.88611C9.69086 5.88478 9.62467 5.88364 9.55811 5.88364C9.09023
            5.88364 8.63037 5.91797 8.18043 5.9832C8.56171 5.2071 9.0744 4.47983 9.71909 3.83514Z"
    />
</svg>);

const hoverBool = {
    opacity: {
        popoverArea: false,
        btnArea: false,
        dragging: false,
    },
    fixDimension: {
        popoverArea: false,
        btnArea: false,
    },
    colorPicker: {
        popoverArea: false,
        btnArea: false,
        dragging: false,
    },
    reset: {
        popoverArea: false,
        btnArea: false,
    },
};
let popoverTimeoutFunc;
let btnTimeoutFunc;

const setHoverBoolToFalse = (except = '') => {
    Object.keys(hoverBool).forEach((type) => {
        if (type !== except) {
            hoverBool[type].popoverArea = false;
            hoverBool[type].btnArea = false;
        }
    });
};

const AdjustMode = (props) => {
    const {
        t,
        closeAdjustMode, resetAll, confirmFunc,
        opacityPreview,
        initState,
        setDimensionView, setViewport,
        resetMapDimension, resetToDefault,
        open, fixViewBool,
        initColor, setBackgroundColor,
    } = props;
    const classes = useStyles();
    const colorPickerRef = useRef();
    const resetRef = useRef();
    const fixDimensionRef = useRef();
    const opacityRef = useRef();
    const [state, setState] = useState({
        ...initState,
        open: '',
        btnArea: false,
        popoverArea: false,
        fixDimension: {
            width: fixViewBool.fixWidth,
            height: fixViewBool.fixHeight,
        },
        mapColor: initColor,
    });
    const handleOpenOnChange = () => {
        if (!open) {
            setState({
                ...initState,
                ...state,
                mapColor: initColor,
                open: '',
                btnArea: false,
                popoverArea: false,
            });
        }
    };
    useEffect(handleOpenOnChange, [open]);

    // const snackBarConfirmBtn = (
    //     <Button
    //         size="small"
    //         onClick={() => {
    //             confirmFunc();
    //             closeAdjustMode();
    //         }}
    //         style={{color: 'white'}}
    //     >
    //         {t('confirm')}
    //     </Button>
    // );

    const handleChangeOpacity = (value) => {
        setState({...state, opacity: value});
        opacityPreview((value / 100));
    };

    const colorOnSave = (colorObj) => {
        const color = `rgb(${colorObj.r}, ${colorObj.g}, ${colorObj.b})`;
        setBackgroundColor(color);
        setState({
            ...state,
            open: '',
            mapColor: color,
        });
    };

    const colorOnDragEnd = (colorObj) => {
        setBackgroundColor(`rgb(${colorObj.r}, ${colorObj.g}, ${colorObj.b})`);
    };

    const resetColorPreview = () => { setBackgroundColor(state.mapColor); };

    const resetOnClick = () => {
        resetAll();
        setState({
            ...initState,
            open: '',
            fixDimension: {
                width: false,
                height: false,
            },
            fitView: false,
            mapColor: initColor,
        });
    };

    const popoverContent = {
        opacity: (
            <div style={{width: 'calc(100% - 20px)', margin: '5px 15px'}}>
                <Typography
                    style={{fontSize: 16, color: '#122D54'}}
                >{t('opacity')}</Typography>
                <Typography
                    style={{
                        fontSize: 14,
                        position: 'absolute',
                        userSelect: 'none',
                        left: `${12 + ((state.opacity / 100) * 160)}px`,
                        paddingTop: '3px',
                    }}
                >
                    {state.opacity.toFixed(0)}%
                </Typography>
                <Slider
                    classes={{
                        root: classes.sliderRoot,
                        thumb: classes.thumb,
                    }}
                    style={{margin: '20px 5px 10px 5px'}}
                    value={state.opacity}
                    min={0}
                    max={100}
                    onChange={(e, value) => {
                        hoverBool.opacity.dragging = true;
                        handleChangeOpacity(value);
                    }}
                    onChangeCommitted={(e, value) => {
                        hoverBool.opacity.dragging = false;
                        handleChangeOpacity(value);
                        popoverTimeoutFunc = setTimeout(() => {
                            if (!hoverBool.opacity.btnArea && !hoverBool.opacity.popoverArea) {
                                setHoverBoolToFalse();
                                setState({...state, open: ''});
                            }
                        }, 1000);
                    }}
                />
            </div>
        ),
        fixDimension: (
            <div style={{width: '110px', margin: '5px 10px'}}>
                <FormControlLabel
                    control={
                        <Checkbox
                            color="primary"
                            checked={state.fixDimension.width}
                            onChange={() => {
                                setDimensionView('width', !state.fixDimension.width);
                                setState({
                                    ...state,
                                    fixDimension: {...state.fixDimension, width: !state.fixDimension.width},
                                });
                            }}
                        />
                    }
                    style={{marginRight: '0px', color: '#122D54'}}
                    label={t('fixWidth')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            color="primary"
                            checked={state.fixDimension.height}
                            onChange={() => {
                                setDimensionView('height', !state.fixDimension.height);
                                setState({
                                    ...state,
                                    fixDimension: {...state.fixDimension, height: !state.fixDimension.height},
                                });
                            }}
                        />
                    }
                    style={{marginRight: '0px', color: '#122D54'}}
                    label={t('fixHeight')}
                />
            </div>
        ),
        fitView: (
            <div style={{width: '100%'}}>
                <span>fitView</span>
                <Slider
                    style={{margin: '20px 10px 5px 10px'}}
                    value={state.opacity}
                    min={0}
                    max={100}
                    onChange={(e, value) => { handleChangeOpacity(value); }}
                />
            </div>
        ),
        colorPicker: state.open !== 'colorPicker' ? null : (
            <ColorPicker
                t={t}
                initColor={state.mapColor}
                onConfirm={colorOnSave}
                onChange={(colorObj) => {
                    colorOnDragEnd(colorObj);
                    hoverBool.colorPicker.dragging = true;
                }}
                onChangeCommitted={(colorObj) => {
                    colorOnDragEnd(colorObj);
                    hoverBool.colorPicker.dragging = false;
                    popoverTimeoutFunc = setTimeout(() => {
                        if (!hoverBool.colorPicker.btnArea && !hoverBool.colorPicker.popoverArea) {
                            setHoverBoolToFalse();
                            setState({...state, open: ''});
                            resetColorPreview();
                        }
                    }, 1000);
                }}
            />
        ),
        reset: (
            <div style={{width: '180px'}}>
                <ButtonBase
                    style={{
                        fontSize: '1rem',
                        paddingLeft: '13px',
                        height: '42px',
                        fontWeight: 400,
                        color: '#122D54',
                    }}
                    onClick={() => {
                        resetMapDimension();
                        setState({...state, open: ''});
                    }}
                >
                    {t('resetMapDimension')}
                </ButtonBase>
                <ButtonBase
                    style={{
                        fontSize: '1rem',
                        paddingLeft: '13px',
                        height: '42px',
                        fontWeight: 400,
                        color: '#122D54',
                    }}
                    onClick={() => {
                        resetToDefault();
                        setState({
                            ...state,
                            open: '',
                            opacity: 100,
                            mapColor: '#e5e5e5',
                        });
                    }}
                >
                    {t('resetMapToDefault')}
                </ButtonBase>
            </div>

        ),
    };

    const opIcon = document.getElementById('opacity-icon');
    if (opIcon !== null) opIcon.setAttribute('fill', state.open === 'opacity' ? '#122D54' : 'white');

    const getPopoverContent = (type, ref, leftOffset, isDragComponent, hoverOutCB) => (
        <Grow in={state.open === type} >
            <div
                style={{
                    boxShadow: `0px 5px 5px -3px rgba(0,0,0,0.2),
                        0px 8px 10px 1px rgba(0,0,0,0.14),
                        0px 3px 14px 2px rgba(0,0,0,0.12)`,
                    position: 'fixed',
                    zIndex: 1400,
                    background: 'white',
                    borderRadius: '4px',
                    top: ref.current ? ref.current.getBoundingClientRect().top + 56 : 0,
                    left: ref.current ? ref.current.getBoundingClientRect().left + leftOffset : 0,
                }}
                onMouseOver={() => {
                    hoverBool[type].popoverArea = true;
                    clearTimeout(popoverTimeoutFunc);
                    clearTimeout(btnTimeoutFunc);
                }}
                onMouseLeave={() => {
                    hoverBool[type].popoverArea = false;
                    if (isDragComponent && hoverBool[type].dragging) return;
                    popoverTimeoutFunc = setTimeout(() => {
                        if (!hoverBool.reset.btnArea) {
                            setHoverBoolToFalse();
                            setState({...state, open: ''});
                            if (typeof hoverOutCB === 'function') hoverOutCB();
                        }
                    }, 350);
                }}
                onFocus={() => null}
            >
                {popoverContent[type]}
            </div>
        </Grow>
    );

    const buttonHoverFunc = (type) => {
        if (hoverBool.opacity.dragging || hoverBool.colorPicker.dragging) return;
        if (hoverBool.colorPicker) resetColorPreview();
        if (hoverBool[type].btnArea) return;
        hoverBool[type].btnArea = true;
        setHoverBoolToFalse(type);
        clearTimeout(popoverTimeoutFunc);
        clearTimeout(btnTimeoutFunc);
        setState({...state, open: type});
    };
    const buttonHoverLeave = (type) => {
        if (hoverBool.opacity.dragging || hoverBool.colorPicker.dragging) return;
        hoverBool[type].btnArea = false;
        btnTimeoutFunc = setTimeout(() => {
            if (!hoverBool[type].popoverArea) {
                setHoverBoolToFalse();
                setState({...state, open: ''});
            }
        }, 350);
    };
    const getButtonStyle = (type, head = false) => ({
        background: state.open === type ? 'white' : '#122D54',
        color: state.open === type ? '#122D54' : 'white',
        borderLeft: head ? '' : '1px solid #ffffff8f',
    });

    return (
        <Fade in={open} timeout={{enter: 100, exit: 0}} >
            <div >
                <P2Tooltip
                    title={t('confirmButtonTooltip')}
                    direction="left"
                    content={<IconButton
                        disableTouchRipple
                        style={{
                            position: 'fixed',
                            zIndex: 1400,
                            right: '60px',
                            top: '100px',
                            background: '#008000',
                        }}
                        onClick={() => {
                            confirmFunc();
                            closeAdjustMode();
                            setState({
                                ...state,
                                open: '',
                                fixDimension: {
                                    width: fixViewBool.fixWidth,
                                    height: fixViewBool.fixHeight,
                                },
                            });
                        }}
                    >
                        <CheckIcon style={{color: '#e5e5e5'}} />
                    </IconButton>}
                />
                <ToggleButtonGroup
                    style={{
                        position: 'fixed',
                        zIndex: 1400,
                        right: 'calc(50% - 97px)',
                        top: '100px',
                        background: '#122D54',
                    }}
                >
                    <P2Tooltip
                        title={t('mapOpacityTooltip')}
                        direction="top"
                        content={<ToggleButton
                            ref={opacityRef}
                            value="opacity"
                            onClick={() => {
                                setState({...state, open: state.open === 'opacity' ? '' : 'opacity'});
                            }}
                            onMouseOver={() => { buttonHoverFunc('opacity'); }}
                            onMouseLeave={() => { buttonHoverLeave('opacity'); }}
                            onFocus={() => null}
                            style={getButtonStyle('opacity', true)}
                        >
                            {opacityIcon}
                        </ToggleButton>}
                    />
                    <P2Tooltip
                        title={t('fixDimensionTooltip')}
                        direction="top"
                        content={<ToggleButton
                            ref={fixDimensionRef}
                            value="fixDimension"
                            onClick={() => {
                                setState({...state, open: state.open === 'fixDimension' ? '' : 'fixDimension'});
                            }}
                            onMouseOver={() => { buttonHoverFunc('fixDimension'); }}
                            onMouseLeave={() => { buttonHoverLeave('fixDimension'); }}
                            onFocus={() => null}
                            style={getButtonStyle('fixDimension')}
                        >
                            <Badge
                                color="secondary"
                                variant="dot"
                                invisible={!(state.fixDimension.width || state.fixDimension.height)}
                            >
                                <FixDimensionIcon />
                            </Badge>
                        </ToggleButton>}
                    />
                    <P2Tooltip
                        title={t('fitViewTooltip')}
                        direction="top"
                        content={<ToggleButton
                            value="fitView"
                            onClick={setViewport}
                            style={getButtonStyle('fitView')}
                            onMouseOver={() => {
                                if (hoverBool.opacity.dragging || hoverBool.colorPicker.dragging) return;
                                clearTimeout(popoverTimeoutFunc);
                                clearTimeout(btnTimeoutFunc);
                                setState({...state, open: ''});
                            }}
                            onFocus={() => null}
                        >
                            <FitViewIcon />
                        </ToggleButton>}
                    />
                    <P2Tooltip
                        title={t('mapColorTooltip')}
                        direction="top"
                        content={<ToggleButton
                            ref={colorPickerRef}
                            value="color-picker"
                            onClick={() => {
                                setState({...state, open: state.open === 'colorPicker' ? '' : 'colorPicker'});
                            }}
                            onMouseOver={() => { buttonHoverFunc('colorPicker'); }}
                            onMouseLeave={() => { buttonHoverLeave('colorPicker'); }}
                            onFocus={() => null}
                            style={getButtonStyle('colorPicker')}
                        >
                            <ColorPickIcon />
                        </ToggleButton>}
                    />
                    <P2Tooltip
                        title={t('resetTooltip')}
                        direction="top"
                        content={<ToggleButton
                            ref={resetRef}
                            value="reset"
                            onClick={resetOnClick}
                            onMouseOver={() => { buttonHoverFunc('reset'); }}
                            onMouseLeave={() => { buttonHoverLeave('reset'); }}
                            onFocus={() => null}
                            style={getButtonStyle('reset')}
                        >
                            <ResetIcon />
                        </ToggleButton>}
                    />
                </ToggleButtonGroup>
                {getPopoverContent('opacity', opacityRef, -75, true)}
                {getPopoverContent('fixDimension', fixDimensionRef, -40)}
                {getPopoverContent('colorPicker', colorPickerRef, -100, true, resetColorPreview)}
                {getPopoverContent('reset', resetRef, -46)}
                <Snackbar
                    open
                    message={t('adjustMapSnackbarContent')}
                    // action={snackBarConfirmBtn}
                    style={{
                        zIndex: 2500,
                    }}
                />
            </div>
        </Fade>
    );
};

AdjustMode.propTypes = {
    t: PropTypes.func.isRequired,
    closeAdjustMode: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    resetAll: PropTypes.func.isRequired,
    opacityPreview: PropTypes.func.isRequired,
    confirmFunc: PropTypes.func.isRequired,
    initState: PropTypes.shape({
        opacity: PropTypes.number.isRequired,
    }).isRequired,
    setDimensionView: PropTypes.func.isRequired,
    setViewport: PropTypes.func.isRequired,
    fixViewBool: PropTypes.shape({
        fixWidth: PropTypes.bool.isRequired,
        fixHeight: PropTypes.bool.isRequired,
    }).isRequired,
    resetMapDimension: PropTypes.func.isRequired,
    resetToDefault: PropTypes.func.isRequired,
    initColor: PropTypes.string.isRequired,
    setBackgroundColor: PropTypes.func.isRequired,
};

export default AdjustMode;
