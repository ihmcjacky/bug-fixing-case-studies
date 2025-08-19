/**
 * @Author: mango
 * @Date:   2018-07-19T17:08:10+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-10-16T17:03:11+08:00
 */
import React from 'react';
import {compose} from 'redux';
import {withTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import IconButton from '@material-ui/core/IconButton';
import Icon from '@material-ui/core/Icon';
import Input from '@material-ui/core/Input';
import ClearIcon from '@material-ui/icons/Clear';
import SearchIcon from '@material-ui/icons/Search';
import {grey} from '@material-ui/core/colors';
import withStyles from '@material-ui/core/styles/withStyles';
import classNames from 'classnames';

const styles = {
    root: {
        height: 48,
        display: 'flex',
        justifyContent: 'space-between',
    },
    iconButton: {
        opacity: 0.74,
        transform: 'scale(1, 1)',
        transition: 'transform 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    },
    iconButtonHidden: {
        transform: 'scale(0, 0)',
        '& > $icon': {
            opacity: 0,
        },
    },
    iconButtonDisabled: {
        opacity: 0.38,
    },
    searchIconButton: {
        marginRight: 0,
    },
    icon: {
        opacity: 0.74,
        transition: 'opacity 200ms cubic-bezier(0.4, 0.0, 0.2, 1)',
    },
    input: {
        width: '100%',
    },
    searchContainer: {
        margin: 'auto 0px',
        width: '100%',
    },
};

class P2SearchBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: this.props.value,
        };

        const fnNames = [
            'handleInput',
            'handleCancel',
            'handleKeyUp',
        ];

        window.__.each(fnNames, (fnName) => {
            this[fnName] = this[fnName].bind(this);
        });
        this.t = this.props.t;
    }

    componentWillReceiveProps(nextProps) {
        if (nextProps.value !== this.state.value && nextProps.value !== '') {
            this.setState({
                value: nextProps.value,
            });
        }
    }

    handleInput(e) {
        this.setState({value: e.target.value});
    }

    handleCancel() {
        this.setState({value: ''});
        this.props.onRequestSearch('');
    }

    handleKeyUp(e) {
        this.props.onRequestSearch(this.state.value);
        // if (e.charCode === 13 || e.key === 'Enter') {
        //     this.props.onRequestSearch(this.state.value);
        // } else
        if (!this.props.disableEscapeCancel && (e.charCode === 27 || e.key === 'Escape')) {
            this.handleCancel();
        }
    }

    render() {
        const {value} = this.state;
        const {
            className,
            classes,
            closeIcon,
            disabled,
            onRequestSearch,
            searchIcon,
            style,
            disableEscapeCancel,
            t,
            placeholder,
            onChange,
            // eslint-disable-next-line no-unused-vars
            ...inputProps
        } = this.props;
        // console.log('-----this.props-----');
        // console.log(inputProps);

        const startAdornment = (
            <Icon
                disabled
                style={{
                    marginRight: 10,
                }}
            >
                {React.cloneElement(searchIcon, {
                    classes: {root: classes.icon},
                })}
            </Icon>
        );

        const endAdorment = !this.props.disableCloseButton ? (
            <IconButton
                onClick={this.handleCancel}
                classes={{
                    root: classNames(classes.iconButton, {
                        [classes.iconButtonHidden]: value === '',
                    }),
                    disabled: classes.iconButtonDisabled,
                }}
                disabled={disabled}
            >
                {React.cloneElement(closeIcon, {
                    classes: {root: classes.icon},
                })}
            </IconButton>
        ) : <span />;

        return (
            <div className={classes.searchContainer}>
                <Input
                    placeholder={t('searchBarPlaceholder')}
                    value={value}
                    onChange={this.handleInput}
                    onKeyUp={this.handleKeyUp}
                    fullWidth
                    label="Search"
                    className={classes.input}
                    disableUnderline
                    disabled={disabled}
                    startAdornment={startAdornment}
                    endAdornment={endAdorment}
                />
            </div>
        );
    }
}

P2SearchBar.defaultProps = {
    className: '',
    closeIcon: <ClearIcon style={{color: grey[500]}} />,
    disabled: false,
    placeholder: 'Search',
    searchIcon: <SearchIcon style={{color: grey[500]}} />,
    style: null,
    value: '',
    disableEscapeCancel: false,
    disableCloseButton: false,
};

P2SearchBar.propTypes = {
    /** Custom top-level class */
    className: PropTypes.string,
    /** Override or extend the styles applied to the component. */
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    /** Override the close icon. */
    closeIcon: PropTypes.node,
    disableCloseButton: PropTypes.bool,
    /** Disables text field. */
    disabled: PropTypes.bool,
    /** Sets placeholder for the embedded text field. */
    placeholder: PropTypes.string,
    /** Fired when the search icon is clicked. */
    onRequestSearch: PropTypes.func.isRequired,
    /** Override the search icon. */
    searchIcon: PropTypes.node,
    /** Override the inline-styles of the root element. */
    style: PropTypes.objectOf(PropTypes.object),
    /** The value of the text field. */
    value: PropTypes.string,
    disableEscapeCancel: PropTypes.bool,
    t: PropTypes.func.isRequired,
};

export default compose(withTranslation(['managed-device-list']))(withStyles(styles)(P2SearchBar));
