/**
 * @Author: Jacky Lam
 * @Date:   2018-04-04T15:05:44+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-11-12T16:54:29+08:00
 *
 * Component for showing information snackbar
 * Shared component, used by everyone
 */
import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';

const styles = theme => ({
    snackbar: {
        margin: theme.spacing(),
    },
    close: {
        width: theme.spacing(4),
    },
});

/* Stateless functional component */
class P2SnackBar extends React.Component {
    constructor(props) {
        super(props);
        this.closeSnack = this.props.closeSnack;
    }
    render() {
        const {
            messages,
            classes,
            closeLbl,
            open,
            duration,
        } = this.props;

        return (
            <div>
                <Snackbar
                    className={classes.snackbar}
                    message={messages}
                    open={open}
                    autoHideDuration={duration}
                    onClose={this.closeSnack}
                    // ClickAwayListenerProps={{
                    //     onClickAway: () => {},
                    // }}
                    action={
                        [
                            <Button key="undo" color="secondary" size="small" onClick={this.closeSnack}>
                                {closeLbl}
                            </Button>,
                            <IconButton
                                key="close"
                                aria-label="Close"
                                color="inherit"
                                className={classes.close}
                                onClick={this.closeSnack}
                                style={{padding: '3px'}}
                            >
                                <CloseIcon />
                            </IconButton>,
                        ]
                    }
                />
            </div>
        );
    }
}

P2SnackBar.defaultProps = {
    closeLbl: '',
    duration: 3000,
};

P2SnackBar.propTypes = {
    closeSnack: PropTypes.func.isRequired,
    messages: PropTypes.string.isRequired,
    classes: PropTypes.object.isRequired, //eslint-disable-line
    closeLbl: PropTypes.string,
    open: PropTypes.bool.isRequired,
    duration: PropTypes.number,
};

export default withStyles(styles)(P2SnackBar);
