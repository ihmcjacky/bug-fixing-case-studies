/**
 * @Author: mango
 * @Date:   2018-03-27T15:05:44+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-09-28T10:00:14+08:00
 */
import React from 'react';
import PropTypes from 'prop-types';
import FormControl from '@material-ui/core/FormControl';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import ListItemText from '@material-ui/core/ListItemText';
import FormHelperText from '@material-ui/core/FormHelperText';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import {withStyles} from '@material-ui/core/styles';
import SearchSelect from './SearchSelect';

// import ReactSelect from 'react-select';

// const SearchSelectStyles = {
//     noOptionsMessage: styles => ({
//         ...styles,
//         color: 'red',
//     }),
//     control: styles => ({
//         ...styles,
//         display: 'flex',
//         padding: 0,
//         width: '100%',
//     }),
//     placeholder: styles => ({
//         ...styles,
//         fontSize: 16,
//     }),
//     singleValue: styles => ({
//         ...styles,
//         fontSize: 16,
//     }),
//     valueContainer: styles => ({
//         ...styles,
//         display: 'flex',
//         flexWrap: 'wrap',
//         flex: 1,
//         alignItems: 'center',
//         overflow: 'hidden',
//     }),
// };

const styles = {
    select: {
        '&:before': {
            borderColor: '#FFA400',
        },
        '&:after': {
            borderColor: '#FFA400',
        },
        '&:hover:not(.Mui-disabled):before': {
            borderColor: '#FFA400',
        },
    },
    icon: {
        fill: '#FFA400',
    },
};

class FormSelectCreator extends React.Component {
    constructor(props) {
        super(props);

        const fnNames = [
            'handleCheck',
        ];

        window.__.each(fnNames, (fnName) => {
            this[fnName] = this[fnName].bind(this);
        });

        this.searchSelect = React.createRef();
    }

    handleCheck() {
        this.props.onCheckField();
    }


    render() {
        const {
            inputID, errorStatus, warnStatus, margin, inputLabel, inputValue, onChangeField,
            disabled, menuItemObj, helperText, enableButton, buttonLabel, checked,
            checkedToDisabled, showDisable, showHelpTooltip, helpTooltip, canSearch,
            classes, multiple, onCloseField
        } = this.props;

        let checkboxElement = null;
        const disabledVal = checkedToDisabled ? checked : !checked;
        const suggestions = canSearch ? menuItemObj.map(item => ({
            value: item.actualValue,
            label: item.displayValue,
        })) : null;

        if (enableButton) {
            checkboxElement = (
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={checked}
                            onChange={this.handleCheck}
                            value="checkedB"
                            color="primary"
                            disabled={disabled}
                            disableRipple
                        />
                    }
                    label={buttonLabel}
                    style={{
                        marginTop: 10,
                        marginLeft: 5,
                        marginRight: 5,
                        minWidth: 'fit-content',
                    }}
                />
            );
        }

        return (
            <div style={{display: inputID !== 'globalLinkMetric' ? 'flex' : 'none'}}>
                <FormControl
                    key={inputID}
                    error={errorStatus}
                    fullWidth
                    margin={margin}
                >
                    {/* <InputLabel>{inputLabel}</InputLabel> */}
                    {canSearch ?
                        <SearchSelect
                            inputId={inputID}
                            options={suggestions}
                            value={(disabled || disabledVal) && showDisable ? buttonLabel : inputValue}
                            onChangeField={onChangeField}
                            disabled={disabled || disabledVal}
                            inputLabel={{
                                label: showHelpTooltip ? helpTooltip : inputLabel,
                                InputLabelProps: {
                                    htmlFor: inputID,
                                    shrink: true,
                                },
                            }}
                        /> :
                        <React.Fragment>
                            <InputLabel shrink htmlFor={inputID}>{showHelpTooltip ? helpTooltip
                                : inputLabel}
                            </InputLabel>
                            <Select
                                value={(disabled || disabledVal) && showDisable ? buttonLabel : inputValue}
                                onChange={onChangeField}
                                onClose={onCloseField}
                                className={warnStatus ? classes.select : ""}
                                multiple={multiple}
                                renderValue={multiple ? (selected) => selected.join(', ') : null}
                                inputProps={{
                                    name: inputID,
                                    id: inputID,
                                    ...warnStatus && {
                                        classes: {
                                            icon: classes.icon,
                                        }
                                    }
                                }}
                                disabled={disabled || disabledVal || (menuItemObj.length === 1 &&
                                    menuItemObj[0].actualValue === inputValue)}
                            >
                                {
                                    (disabled || disabledVal) && showDisable ? (
                                        <MenuItem
                                            value={buttonLabel}
                                            key={buttonLabel}
                                        >
                                            {buttonLabel}
                                        </MenuItem>
                                    ) : menuItemObj.map(item => (
                                            multiple ? (
                                                <MenuItem
                                                    value={item.actualValue}
                                                    key={item.actualValue}
                                                >
                                                    <Checkbox checked={inputValue.indexOf(item.actualValue) > -1} />
                                                    <ListItemText primary={item.displayValue} />
                                                </MenuItem> 
                                            ) : (
                                                <MenuItem
                                                    value={item.actualValue}
                                                    key={item.actualValue}
                                                >
                                                    {item.displayValue}
                                                </MenuItem>
                                            )
                                        )
                                    )
                                }
                            </Select>
                        </React.Fragment>
                    }
                    <FormHelperText>{helperText}</FormHelperText>
                </FormControl>
                {checkboxElement}
            </div>
        );
    }
}

FormSelectCreator.propTypes = {
    multiple: PropTypes.bool,
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    showHelpTooltip: PropTypes.bool,
    helpTooltip: PropTypes.element,
    margin: PropTypes.string.isRequired,
    errorStatus: PropTypes.bool,
    warnStatus: PropTypes.bool,
    inputLabel: PropTypes.string.isRequired,
    inputID: PropTypes.string.isRequired,
    inputValue: PropTypes.oneOfType(
        [PropTypes.string, PropTypes.number, PropTypes.object, PropTypes.array]
    ).isRequired,
    // inputValue: PropTypes.object.isRequired, //eslint-disable-line
    onChangeField: PropTypes.func.isRequired,
    onCloseField: PropTypes.func,
    menuItemObj: PropTypes.array.isRequired, // eslint-disable-line
    helperText: PropTypes.string.isRequired,
    disabled: PropTypes.bool,
    enableButton: PropTypes.bool,
    buttonLabel: PropTypes.string,
    onCheckField: PropTypes.func,
    checked: PropTypes.bool,
    checkedToDisabled: PropTypes.bool,
    showDisable: PropTypes.bool,
    canSearch: PropTypes.bool,
};
FormSelectCreator.defaultProps = {
    multiple: false,
    showHelpTooltip: false,
    helpTooltip: <span />,
    disabled: false,
    errorStatus: false,
    warnStatus: false,
    enableButton: false,
    buttonLabel: 'Label',
    onCheckField: () => null,
    checked: false,
    checkedToDisabled: true,
    showDisable: false,
    canSearch: false,
};

export default withStyles(styles)(FormSelectCreator);
