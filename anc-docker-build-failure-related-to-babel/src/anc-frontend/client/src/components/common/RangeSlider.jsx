import React from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';

function getMidPoint(value, min, max) {
    if (value.length < 2) {
        return 0;
    }
    return (((((value[1] - value[0]) / 2) + (value[0] - (min))) / (max - min)) * 100);
}
const useStyles = makeStyles({
    root: {
        opacity: ({disabled}) => (!disabled ? 1 : 0.5),
    },
    labelWrapper: {
        // display: 'flex',
        height: '30px',
        position: 'relative',
    },
    valueLabelWrapper: {
        height: '30px',
        position: 'relative',
    },
    thumb: {
        width: 0,
        height: 0,
        borderLeft: ({thumbStyle}) => `${thumbStyle.width}px solid transparent`,
        borderRight: ({thumbStyle}) => `${thumbStyle.width}px solid transparent`,
        borderTop: ({thumbStyle, disableScroll}) =>
            `${thumbStyle.height}px solid ${disableScroll ? 'rgba(33, 33, 33, 0.37)' : thumbStyle.color}`,
        borderRadius: '0',
        backgroundColor: 'transparent',
        marginLeft: ({thumbStyle}) => `${-thumbStyle.width}px`,
        marginTop: ({thumbStyle}) => `${-thumbStyle.height}px`,
        '&:hover': {
            boxShadow: 'none',
            opacity: 0.5,
            '@media (hover: none)': {
                boxShadow: 'none',
            },
        },
        '&$active': {
            boxShadow: 'none',
        },
    },
    active: {
        boxShadow: 'none',
    },
    track: {
        height: ({trackStyle}) => trackStyle.height,
        // backgroundColor: '#FFA400',
        backgroundColor: ({enableRailColor, trackStyle}) => {
            if (enableRailColor) {
                return '#FFA400';
            }
            return trackStyle.color;
        },
    },
    rail: {
        height: ({trackStyle}) => trackStyle.height,
        // backgroundImage: 'linear-gradient(to right, #DC4639 50%, #92c352 50%)',
        backgroundImage: ({
            value, min, max, enableRailColor, trackStyle,
        }) => {
            if (value.length < 2 || !enableRailColor) {
                return `linear-gradient(to left, ${trackStyle.tailColor}, ${trackStyle.headColor})`;
            }
            const mid = getMidPoint(value, min, max);
            if (mid < 50) {
                return `linear-gradient(to left, #92c352 ${100 - mid}%, #DC4639 ${mid}%)`;
            }
            return `linear-gradient(to right, #DC4639 ${mid}%, #92c352 ${100 - mid}%)`;
        },
        opacity: 1,
    },
});

function valuetext(value) {
    return `${value}`;
}
let isDragging = false;
export default function RangeSlider(props) {
    const {
        min, max,
        showLevelLabel, enableRailColor, enable,
        value, thumbStyle, trackStyle, labelStyle, disableScroll, step,
    } = props;

    const [data, setData] = React.useState(value);
    const classes = useStyles(
        {
            value: data,
            disabled: !enable,
            min,
            max,
            enableRailColor,
            thumbStyle,
            trackStyle,
            disableScroll,
        }
    );
    React.useEffect(() => {
        if (!isDragging) {
            setData(value);
        }
    }, [value]);

    const handleChange = (event, newValue) => {
        if (disableScroll) return;
        isDragging = true;
        setData(newValue);
    };

    const handleOnChangeCommitted = (event, newValue) => {
        if (disableScroll) return;
        isDragging = false;
        props.handleSliderOnChange(newValue);
        setData(newValue);
    };

    const getPoorPos = () => (((data[0] - (min)) / (max - min)) * 100) / 2;

    const getShowFair = () => {
        if (data.length < 2) {
            return 'none';
        }
        if (data[0] === data[1]) {
            return 'none';
        }
        return 'block';
    };
    const getShowPoor = () => {
        if (data.length < 2) {
            return 'none';
        }
        if (data[0] === min) {
            return 'none';
        }
        return 'block';
    };
    const getShowGood = () => {
        if (data.length < 2) {
            return 'none';
        }
        if (data[1] === max) {
            return 'none';
        }
        return 'block';
    };
    return (
        <div className={classes.root}>
            {
                showLevelLabel ?
                    (<div
                        className={classes.labelWrapper}
                    >
                        <Typography
                            style={{
                                fontSize: 14,
                                color: '#DC4639',
                                textAlign: 'center',
                                position: 'absolute',
                                width: '40px',
                                left: `${getPoorPos()}%`,
                                marginLeft: '-20px',
                                display: getShowPoor(),
                                userSelect: 'none',
                            }}
                        >
                            POOR
                        </Typography>
                        <Typography
                            style={{
                                fontSize: 14,
                                color: '#FFA400',
                                textAlign: 'center',
                                position: 'absolute',
                                width: '40px',
                                left: `${getMidPoint(data, min, max)}%`,
                                marginLeft: '-20px',
                                display: getShowFair(),
                                userSelect: 'none',
                            }}
                        >
                            FAIR
                        </Typography>
                        <Typography
                            style={{
                                fontSize: 14,
                                textAlign: 'center',
                                position: 'absolute',
                                color: '#92C352',
                                width: '40px',
                                right: `${(((max - data[1]) / (max - min)) / 2) * 100}%`,
                                marginRight: '-20px',
                                display: getShowGood(),
                                userSelect: 'none',
                            }}
                        >
                            GOOD
                        </Typography>
                    </div>) : <span />
            }
            <div
                style={{
                    pointerEvents: !enable || disableScroll ? 'none' : 'auto',
                }}
            >
                <Slider
                    classes={
                        {
                            root: classes.root,
                            thumb: classes.thumb,
                            active: classes.active,
                            track: classes.track,
                            rail: classes.rail,
                        }
                    }
                    max={max}
                    min={min}
                    value={data}
                    onChange={handleChange}
                    onChangeCommitted={handleOnChangeCommitted}
                    valueLabelDisplay="off"
                    aria-labelledby="range-slider"
                    getAriaValueText={valuetext}
                    step={step}
                    // ValueLabelComponent={ValueLabelComponent}
                />
            </div>
            <div
                className={classes.valueLabelWrapper}
            >
                <Typography
                    style={{
                        fontWeight: 'bold',
                        fontSize: thumbStyle.levelFontSize,
                        color: thumbStyle.color,
                        textAlign: 'center',
                        position: 'absolute',
                        width: '40px',
                        left: `${((((data[0] - max)) / (max - min)) * 100) + 100}%`,
                        marginLeft: '-20px',
                        userSelect: 'none',
                    }}
                >
                    {data[0]}
                </Typography>
                {
                    typeof data[1] !== 'undefined' ? (
                        <Typography
                            style={{
                                fontWeight: 'bold',
                                fontSize: thumbStyle.levelFontSize,
                                color: thumbStyle.color,
                                textAlign: 'center',
                                position: 'absolute',
                                width: '40px',
                                left: `${((((data[1] - max)) / (max - min)) * 100) + 100}%`,
                                marginLeft: '-20px',
                                userSelect: 'none',
                            }}
                        >
                            {data[1]}
                        </Typography>
                    ) : <span />
                }
                <Typography
                    style={{
                        fontSize: thumbStyle.levelFontSize,
                        color: labelStyle.color,
                        textAlign: 'center',
                        position: 'absolute',
                        width: '40px',
                        left: 0,
                        marginLeft: '-20px',
                    }}
                >
                    {min}
                </Typography>
                <Typography
                    style={{
                        fontSize: thumbStyle.levelFontSize,
                        color: labelStyle.color,
                        textAlign: 'center',
                        position: 'absolute',
                        width: '40px',
                        left: '100%',
                        marginLeft: '-20px',
                    }}
                >
                    {max}
                </Typography>
            </div>
            <Typography
                style={{
                    fontSize: labelStyle.fontSize,
                    color: labelStyle.color,
                    textAlign: 'center',
                }}
            >
                {props.unit}
            </Typography>
        </div>
    );
}

RangeSlider.propTypes = {
    value: PropTypes.arrayOf(PropTypes.number).isRequired,
    // disabled: PropTypes.bool,
    enable: PropTypes.bool,
    disableScroll: PropTypes.bool,
    // minValue: PropTypes.number.isRequired,
    // maxValue: PropTypes.number.isRequired,
    min: PropTypes.number.isRequired,
    max: PropTypes.number.isRequired,
    handleSliderOnChange: PropTypes.func,
    unit: PropTypes.string,
    showLevelLabel: PropTypes.bool,
    enableRailColor: PropTypes.bool,
    thumbStyle: PropTypes.shape({
        height: PropTypes.number,
        width: PropTypes.number,
        color: PropTypes.string,
        levelFontSize: PropTypes.number,
    }),
    trackStyle: PropTypes.shape({
        height: PropTypes.number,
        color: PropTypes.string,
        headColor: PropTypes.string,
        tailColor: PropTypes.string,
    }),
    labelStyle: PropTypes.shape({
        color: PropTypes.string,
        fontSize: PropTypes.number,
    }),
    step: PropTypes.number,
    // isReset: PropTypes.bool,
};

RangeSlider.defaultProps = {
    unit: '',
    enableRailColor: false,
    showLevelLabel: false,
    // disabled: false,
    // isReset: false,
    enable: true,
    disableScroll: false,
    handleSliderOnChange: () => {},
    thumbStyle: {
        height: 20,
        width: 10,
        color: '#566fa8',
        levelFontSize: 14,
    },
    trackStyle: {
        height: 4,
        color: '#425581',
        headColor: '#425581',
        tailColor: '#425581',
    },
    labelStyle: {
        color: 'rgba(33, 33, 33, 0.37)',
        fontSize: 14,
    },
    step: 1,
};
