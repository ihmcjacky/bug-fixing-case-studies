import React from 'react';
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import FormHelperText from '@material-ui/core/FormHelperText';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';

const FromInput = (props) => {
    const {
        errorStatus,
        inputLabel,
        inputID,
        inputValue,
        onChangeField,
        autoFocus,
        onKeyPressField,
        helperText,
        inputType,
        endAdornment,
        showPassword,
    } = props;
    return (
        <FormControl key={inputID} error={errorStatus} fullWidth>
            <InputLabel>{inputLabel}</InputLabel>
            <Input
                id={inputID}
                value={inputValue}
                onChange={onChangeField}
                autoFocus={autoFocus}
                onKeyPress={onKeyPressField}
                type={showPassword ? 'text' : inputType}
                endAdornment={endAdornment}
                style={{alignItems: 'center'}}
            />
            <FormHelperText>{helperText}</FormHelperText>
        </FormControl>
    );
};

FromInput.propTypes = {
    errorStatus: PropTypes.bool,
    inputLabel: PropTypes.string.isRequired,
    inputID: PropTypes.string.isRequired,
    inputValue: PropTypes.string.isRequired,
    onChangeField: PropTypes.func,
    autoFocus: PropTypes.bool,
    onKeyPressField: PropTypes.func,
    helperText: PropTypes.string,
    inputType: PropTypes.string,
    endAdornment: PropTypes.element,
    showPassword: PropTypes.bool,
};

FromInput.defaultProps = {
    onChangeField: () => {},
    onKeyPressField: () => {},
    showPassword: false,
    endAdornment: <span />,
    errorStatus: false,
    autoFocus: false,
    inputType: 'text',
    helperText: ''
};

export default FromInput;
