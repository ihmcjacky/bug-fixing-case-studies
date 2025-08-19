import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import Button from '@material-ui/core/Button';
import Slider from '@material-ui/core/Slider';
import Typography from '@material-ui/core/Typography';
import {colorStringToObj} from '../../util/formatConvertor';

const useStyles = makeStyles({
    sliderRoot: {
        width: ({width}) => `${width - 24}px`,
    },
    active: {
        '&$active': {
            boxShadow: ({activeColor, value}) => (value === 0 || value === 255 ?
                `0px 0px 0px 7px ${activeColor}` : 'none'),
        },
    },
    thumb: {
        backgroundColor: ({color}) => color,
        '&$focusVisible,&:hover': {
            boxShadow: 'none',
            '@media (hover: none)': {
                boxShadow: 'none',
            },
        },
        '&$active': {
            boxShadow: 'none',
        },
    },
    track: {
        backgroundColor: ({color}) => color,
    },
});

const ColorPicker = (props) => {
    const {
        initColor,
        onChange, onConfirm, onChangeCommitted,
        width,
        t,
    } = props;
    const [state, setState] = useState(() => colorStringToObj(initColor));
    const handleOnChange = (value, type) => {
        onChange(state);
        setState({
            ...state,
            [type]: value,
        });
    };
    const handleOnChangeCommitted = (value, type) => {
        onChangeCommitted(state);
        setState({
            ...state,
            [type]: value,
        });
    };
    const redClasses = useStyles({
        width,
        color: 'rgb(255, 0, 0)',
        activeColor: 'rgb(255, 0, 0, 0.2)',
        value: state.r,
    });
    const greenClasses = useStyles({
        width,
        color: 'rgb(0, 255, 0)',
        activeColor: 'rgb(0, 255, 0, 0.2)',
        value: state.g,
    });
    const blueClasses = useStyles({
        width,
        color: 'rgb(0, 0, 255)',
        activeColor: 'rgb(0, 0, 255, 0.2)',
        value: state.b,
    });


    return (
        <div
            style={{
                margin: '0 0 10px 0',
                width,
            }}
            align="center"
        >
            <div
                style={{
                    background: `rgb(${state.r}, ${state.g}, ${state.b})`,
                    height: '140px',
                    marginBottom: '10px',
                }}
            />
            <Typography
                style={{
                    fontSize: 14,
                    position: 'absolute',
                    color: 'rgb(255, 0, 0)',
                    userSelect: 'none',
                    paddingLeft: `${(state.r / 255) * (width - 25)}px`,
                    width: '20px',
                }}
            >
                {state.r}
            </Typography>
            <Slider
                classes={{
                    root: redClasses.sliderRoot,
                    track: redClasses.track,
                    thumb: redClasses.thumb,
                    active: redClasses.active,
                }}
                style={{margin: '20px 10px 0 10px'}}
                value={state.r}
                min={0}
                max={255}
                onChange={(e, value) => { handleOnChange(value, 'r'); }}
                onChangeCommitted={(e, value) => { handleOnChangeCommitted(value, 'r'); }}
            />
            <Typography
                style={{
                    fontSize: 14,
                    position: 'absolute',
                    color: 'rgb(0, 255, 0)',
                    userSelect: 'none',
                    paddingLeft: `${(state.g / 255) * (width - 25)}px`,
                    width: '20px',
                }}
            >
                {state.g}
            </Typography>
            <Slider
                classes={{
                    root: greenClasses.sliderRoot,
                    track: greenClasses.track,
                    thumb: greenClasses.thumb,
                    active: greenClasses.active,
                }}
                style={{margin: '20px 10px 0 10px'}}
                value={state.g}
                min={0}
                max={255}
                onChange={(e, value) => { handleOnChange(value, 'g'); }}
                onChangeCommitted={(e, value) => { handleOnChangeCommitted(value, 'g'); }}
            />
            <Typography
                style={{
                    fontSize: 14,
                    position: 'absolute',
                    color: 'rgb(0, 0, 255)',
                    userSelect: 'none',
                    paddingLeft: `${(state.b / 255) * (width - 25)}px`,
                    width: '20px',
                }}
            >
                {state.b}
            </Typography>
            <Slider
                classes={{
                    root: blueClasses.sliderRoot,
                    track: blueClasses.track,
                    thumb: blueClasses.thumb,
                    active: blueClasses.active,
                }}
                style={{margin: '20px 10px 5px 10px'}}
                value={state.b}
                min={0}
                max={255}
                onChange={(e, value) => { handleOnChange(value, 'b'); }}
                onChangeCommitted={(e, value) => { handleOnChangeCommitted(value, 'b'); }}
            />
            <Button
                color="primary"
                variant="contained"
                onClick={() => { onConfirm(state); }}
            >
                {t('confirm')}
            </Button>
        </div>
    );
};

ColorPicker.propTypes = {
    initColor: PropTypes.string,
    onChange: PropTypes.func,
    onChangeCommitted: PropTypes.func,
    onConfirm: PropTypes.func,
    width: PropTypes.number,
};

ColorPicker.defaultProps = {
    initColor: 'rgb(0, 0, 0)',
    onChange: () => {},
    onChangeCommitted: () => {},
    onConfirm: () => {},
    width: 260,
};

export default ColorPicker;
