/**
 * @Author: mango
 * @Date:   2018-03-28T13:53:17+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-07-28T15:12:09+08:00
 */
import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {InputAdornment, IconButton} from '@material-ui/core';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Visibility from '@material-ui/icons/Visibility';
import VisibilityOff from '@material-ui/icons/VisibilityOff';
import Checkbox from '@material-ui/core/Checkbox';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Input from '@material-ui/core/Input';
import Constant from '../../constants/common';


const {colors} = Constant;
const styles = {
    root: {
        backgroundColor: colors.multilineInputBackground,
    },
    // input: {
    //     color: 'white'
    // }
};

class FormInputCreator extends React.Component {
    constructor(props) {
        super(props);
        this.timeout = 0;
        this.state = {
            showPassword: false,
            inputValue: props.inputValue,
            loadValue: props.inputValue,
        };
        const fnNames = [
            'handleCheck',
            'handleShowPassword',
            'handleValueChange',
        ];

        window.__.each(fnNames, (fnName) => {
            this[fnName] = this[fnName].bind(this);
        });
    }

    static getDerivedStateFromProps(nextProps, prevState) {
        if ((prevState.inputValue !== nextProps.inputValue) && nextProps.delayInput) {
            return {
                ...prevState,
                ...(prevState.loadValue !== nextProps.inputValue && {inputValue: nextProps.inputValue}),
                loadValue: nextProps.inputValue,
            }
        }
        return {
            ...prevState,
            loadValue: nextProps.inputValue,
        };
    }

    componentDidMount() {
        if (this.props.autoFocus) {
            this.focusTimeout = setTimeout(() => {
                // timeout is  needed as a bug for material ui
                // reference: https://github.com/mui-org/material-ui/issues/1594
                if (this.props.reference.current) {
                    this.props.reference.current.focus();
                }
            }, 1000);
        }
        this.props.handleShowPassword(this.handleShowPassword);
    }

    componentDidUpdate() {
        if (this.props.autoFocus) {
            this.focusTimeoutTwo = setTimeout(() => {
                // timeout is  needed as a bug for material ui
                // reference: https://github.com/mui-org/material-ui/issues/1594
                if (this.props.reference.current) {
                    this.props.reference.current.focus();
                }
            }, 1000);
        }
    }

    componentWillUnmount() {
        // clear timeout to prevent resource accumulation
        if (this.props.autoFocus) {
            clearTimeout(this.focusTimeout);
            clearTimeout(this.focusTimeoutTwo);
        }
        clearTimeout(this.timer);
    }

    handleShowPassword(showPassword) {
        const stateShowPassword = this.state.showPassword;
        const state = typeof showPassword === 'boolean' ? {showPassword} : {showPassword: !stateShowPassword};
        this.setState(state);
    }

    handleValueChange(e) {
        const inputID = (e.target.id || e.target.name);
        const inputValue = e.target.value;
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.timeout = setTimeout(() => {
            this.props.onChangeField(e, inputID, inputValue);
        }, 1000);
        this.setState({
            inputValue,
        });
    }


    handleCheck(event) {
        if (this.props.delayInput) {
            const checked = event.target.checked ? 'auto' : ''
            this.props.onChangeField(
                event, (event.target.id || event.target.name), checked);
        } else {
            const e = {
                target: {
                    id: this.props.inputID,
                    value: event.target.checked ? 'Auto' : '',
                },
            };
            this.props.onChangeField(e);
        }
    }

    render() {
        const {
            inputID, inputLabel, errorStatus, inputValue: parentInputValue, margin, enableButton,
            placeholder, onChangeField, autoFocus, onKeyPressField, disabled,
            helperText, buttonLabel, enableEyeButton, endAdornment, showPassword,
            compareValue, multiline, classes, autoComplete, helpTooltip, showHelpTooltip, reference,
            delayInput,
        } = this.props;

        const inputValue = delayInput ? this.state.inputValue : parentInputValue;

        const inputAdorment = enableEyeButton ? (
            <InputAdornment position="end">
                <IconButton
                    onClick={this.handleShowPassword}
                >
                    {this.state.showPassword ? <Visibility /> : <VisibilityOff />}
                </IconButton>
            </InputAdornment>
        ) : endAdornment;

        const inputType = enableEyeButton ?
            (() => (this.state.showPassword ? 'text' : 'password'))() :
            (() => (showPassword ? 'text' : this.props.inputType))();

        return (
            <FormControl
                key={inputID}
                error={errorStatus}
                fullWidth
                margin={margin}
            >
                {enableButton ?
                    <div style={{display: 'flex'}}>
                        <span style={{width: '100%'}}>
                            <InputLabel shrink>{showHelpTooltip ? helpTooltip
                                : inputLabel}</InputLabel>
                            <Input
                                inputProps={{
                                    spellCheck: false,
                                }}
                                placeholder={placeholder}
                                id={inputID}
                                value={inputValue === compareValue ? buttonLabel : inputValue}
                                onChange={delayInput ? this.handleValueChange : onChangeField}
                                autoFocus={autoFocus}
                                onKeyPress={onKeyPressField}
                                disabled={disabled || (inputValue === compareValue)}
                                type={inputType}
                                style={{alignItems: 'center'}}
                                fullWidth
                                multiline={multiline}
                                rowsMax="3"
                                autoComplete={autoComplete}
                                inputRef={reference}
                                endAdornment={inputAdorment}
                            />
                            <FormHelperText>{helperText}</FormHelperText>
                        </span>
                        <span style={{marginLeft: 'auto'}}>
                            <FormControlLabel
                                control={
                                    <Checkbox
                                        checked={inputValue === compareValue}
                                        onChange={this.handleCheck}
                                        value={compareValue}
                                        color="primary"
                                    />
                                }
                                label={buttonLabel}
                                style={{
                                    marginTop: 10,
                                    marginLeft: 5,
                                }}
                            />
                        </span>
                    </div>
                    :
                    <React.Fragment>
                        <InputLabel shrink>{showHelpTooltip ? helpTooltip
                            : inputLabel}</InputLabel>
                        <Input
                            inputProps={{
                                spellCheck: false,
                            }}
                            classes={multiline ? {
                                formControl: classes.root,
                            } : {}}
                            placeholder={placeholder}
                            id={inputID}
                            value={inputValue}
                            onChange={delayInput ? this.handleValueChange : onChangeField}
                            autoFocus={autoFocus}
                            onKeyPress={onKeyPressField}
                            disabled={disabled}
                            type={inputType}
                            style={{alignItems: 'center'}}
                            fullWidth
                            multiline={multiline}
                            rows="3"
                            rowsMax="3"
                            autoComplete={autoComplete}
                            inputRef={reference}
                            endAdornment={inputAdorment}
                        />
                        <FormHelperText>{helperText}</FormHelperText>
                    </React.Fragment>
                }
            </FormControl>
        );
    }
}

function defaultKeyPress() {
    return false;
}

FormInputCreator.propTypes = {
    showHelpTooltip: PropTypes.bool,
    helpTooltip: PropTypes.element,
    errorStatus: PropTypes.bool.isRequired,
    inputLabel: PropTypes.string.isRequired,
    inputID: PropTypes.string.isRequired,
    inputValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    onChangeField: PropTypes.func.isRequired,
    autoFocus: PropTypes.bool.isRequired,
    margin: PropTypes.string.isRequired,
    onKeyPressField: PropTypes.func,
    helperText: PropTypes.string.isRequired,
    inputType: PropTypes.string.isRequired,
    endAdornment: PropTypes.oneOfType([PropTypes.string, PropTypes.object]), // eslint-disable-line
    showPassword: PropTypes.bool,
    disabled: PropTypes.bool,
    placeholder: PropTypes.string,
    enableButton: PropTypes.bool,
    enableEyeButton: PropTypes.bool,
    buttonLabel: PropTypes.string,
    compareValue: PropTypes.string,
    multiline: PropTypes.bool,
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    autoComplete: PropTypes.string,
    reference: PropTypes.shape({current: PropTypes.instanceOf(Element)}),
    handleShowPassword: PropTypes.func,
    delayInput: PropTypes.bool,
};

FormInputCreator.defaultProps = {
    showHelpTooltip: false,
    helpTooltip: <span />,
    showPassword: false,
    endAdornment: '',
    onKeyPressField: defaultKeyPress,
    disabled: false,
    placeholder: '',
    enableButton: false,
    enableEyeButton: false,
    buttonLabel: 'Label',
    compareValue: 'label',
    multiline: false,
    autoComplete: 'on',
    reference: React.createRef(),
    handleShowPassword: () => null,
    delayInput: false,
};

export default withStyles(styles)(FormInputCreator);
