import React from 'react';
import Select from 'react-select';
import Typography from '@material-ui/core/Typography';
import TextField from '@material-ui/core/TextField';
import Paper from '@material-ui/core/Paper';
import MenuItem from '@material-ui/core/MenuItem';
import PropTypes from 'prop-types';
import Constant from '../../constants/common';

const {colors} = Constant;
function NoOptionsMessage(props) {
    return (
        <Typography
            color="textSecondary"
            style={{
                padding: '10px 20px',
            }}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

NoOptionsMessage.propTypes = {
    children: PropTypes.node,
    innerProps: PropTypes.object,//eslint-disable-line
    selectProps: PropTypes.object.isRequired, //eslint-disable-line
};

NoOptionsMessage.defaultProps = {
    children: null,
    innerProps: null,
};

function inputComponent({inputRef, ...props}) {
    return <div ref={inputRef} {...props} />;
}

inputComponent.propTypes = {
    inputRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
};

inputComponent.defaultProps = {
    inputRef: React.createRef(),
};

function Control(props) {
    const {
        children,
        innerProps,
        innerRef,
        selectProps: {TextFieldProps},
    } = props;
    // console.log('Control props: ', props);
    return (
        <TextField
            fullWidth
            InputProps={{
                inputComponent,
                inputProps: {
                    style: {
                        display: 'flex',
                        padding: 0,
                        height: 'auto',
                    },
                    ref: innerRef,
                    children,
                    ...innerProps,
                },
            }}
            {...TextFieldProps}
        />
    );
}

Control.propTypes = {
    children: PropTypes.node,
    innerProps: PropTypes.object,// eslint-disable-line
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    selectProps: PropTypes.object.isRequired, //eslint-disable-line
};

Control.defaultProps = {
    children: null,
    innerProps: null,
    innerRef: React.createRef(),
};

function Option(props) {
    return (
        <MenuItem
            ref={props.innerRef}
            selected={props.isFocused}
            component="div"
            style={{
                fontWeight: props.isSelected ? 500 : 400,
            }}
            {...props.innerProps}
        >
            {props.children}
        </MenuItem>
    );
}

Option.propTypes = {
    children: PropTypes.node,
    innerProps: PropTypes.object, //eslint-disable-line
    innerRef: PropTypes.oneOfType([PropTypes.func, PropTypes.object]),
    isFocused: PropTypes.bool,
    isSelected: PropTypes.bool,
};

Option.defaultProps = {
    children: null,
    innerProps: null,
    innerRef: React.createRef(),
    isFocused: false,
    isSelected: false,
};

function Placeholder(props) {
    return (
        <Typography
            color="textSecondary"
            style={{
                position: 'absolute',
                left: 2,
                bottom: 6,
                fontSize: 16,
            }}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

Placeholder.propTypes = {
    children: PropTypes.node,
    innerProps: PropTypes.object, //eslint-disable-line
    selectProps: PropTypes.object.isRequired, //eslint-disable-line
};

Placeholder.defaultProps = {
    children: null,
    innerProps: null,
};

function SingleValue(props) {
    return (
        <Typography
            style={{
                fontSize: 16,
                color: props.isDisabled ? colors.disabledText : colors.normalText,
            }}
            {...props.innerProps}
        >
            {props.children}
        </Typography>
    );
}

SingleValue.propTypes = {
    children: PropTypes.node,
    innerProps: PropTypes.object, //eslint-disable-line
    selectProps: PropTypes.object.isRequired, //eslint-disable-line
    isDisabled: PropTypes.bool.isRequired,
};

SingleValue.defaultProps = {
    children: null,
    innerProps: null,
};

function ValueContainer(props) {
    return (
        <div
            style={{
                display: 'flex',
                flexWrap: 'wrap',
                flex: 1,
                alignItems: 'center',
                overflow: 'hidden',
            }}
        >
            {props.children}
        </div>
    );
}

ValueContainer.propTypes = {
    children: PropTypes.node,
    selectProps: PropTypes.object.isRequired, //eslint-disable-line
};

ValueContainer.defaultProps = {
    children: null,
};

function Menu(props) {
    return (
        <Paper
            square
            style={{
                position: 'absolute',
                zIndex: 1,
                marginTop: '10px',
                left: 0,
                right: 0,
            }}
            {...props.innerProps}
        >
            {props.children}
        </Paper>
    );
}

Menu.propTypes = {
    children: PropTypes.node,
    innerProps: PropTypes.object, //eslint-disable-line
    selectProps: PropTypes.object, //eslint-disable-line
};

Menu.defaultProps = {
    children: null,
    innerProps: null,
    selectProps: null,
};

const components = {
    Control,
    Menu,
    NoOptionsMessage,
    Option,
    Placeholder,
    SingleValue,
    ValueContainer,
};

function SearchSelect(props) {
    return (
        <Select
            inputId={props.inputId}
            TextFieldProps={props.inputLabel}
            options={props.options}
            components={components}
            value={props.value}
            onChange={props.onChangeField}
            isSearchable
            isDisabled={props.disabled}
        />
    );
}

SearchSelect.propTypes = {
    inputId: PropTypes.string.isRequired,
    options: PropTypes.array.isRequired, //eslint-disable-line
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.object]).isRequired, //eslint-disable-line
    onChangeField: PropTypes.func.isRequired,
    inputLabel: PropTypes.object.isRequired, //eslint-disable-line
    disabled: PropTypes.bool,
};

SearchSelect.defaultProps = {
    disabled: false,
};

export default SearchSelect;

