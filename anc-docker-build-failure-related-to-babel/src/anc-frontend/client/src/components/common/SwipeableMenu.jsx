import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import CloseIcon from '@material-ui/icons/KeyboardArrowRight';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import Drawer from '@material-ui/core/Drawer';

const useStyles = makeStyles({
    paper: {
        width: ({width}) => `${width}`,
        backgroundColor: '#E5E5E5',
    },
    appBar: {
        position: 'relative',
        width: ({width}) => `${width}`,
    },
    modalRoot: {
        cursor: ({disableClose}) => (disableClose ? 'not-allowed' : 'auto'),
    },
    closeBtn: {
        cursor: ({disableClose}) => (disableClose ? 'not-allowed' : 'pointer'),
    },
});

function SwipeableMenu(props) {
    const {
        open,
        content,
        direction,
        disableBackdropClick,
        blurBackGround,
        handleMenuOnClose,
        width,
        variant,
        title,
        disableClose,
    } = props;

    const classes = useStyles({disableClose, width});

    const [show, setShow] = useState(open);

    useEffect(() => {
        setShow(open);
    }, [open]);


    return (
        <Drawer
            anchor={direction}
            open={show}
            onClose={handleMenuOnClose}
            ModalProps={{
                disableBackdropClick,
                BackdropProps: {
                    invisible: blurBackGround,
                },
            }}
            variant={variant}
            classes={{
                paper: classes.paper,
            }}
            BackdropProps={{
                classes: {
                    root: classes.modalRoot,
                },
            }}
        >
            <AppBar
                classes={{
                    root: classes.appBar,
                }}
            >
                <Toolbar>
                    <IconButton
                        edge="start"
                        color="inherit"
                        onClick={handleMenuOnClose}
                        aria-label="close"
                        classes={{root: classes.closeBtn}}
                    >
                        <CloseIcon />
                    </IconButton>
                    <Typography variant="h6">
                        {title}
                    </Typography>
                </Toolbar>
            </AppBar>
            {content}
        </Drawer>
    );
}

SwipeableMenu.propTypes = {
    // classes: PropTypes.objectOf(PropTypes.string).isRequired,
    open: PropTypes.bool.isRequired,
    handleMenuOnClose: PropTypes.func.isRequired,
    content: PropTypes.element.isRequired,
    direction: PropTypes.oneOf(['left', 'right']),
    disableBackdropClick: PropTypes.bool,
    blurBackGround: PropTypes.bool,
    width: PropTypes.string,
    variant: PropTypes.string,
    title: PropTypes.string,
    disableClose: PropTypes.bool,
};

SwipeableMenu.defaultProps = {
    width: '700px',
    direction: 'right',
    disableBackdropClick: false,
    blurBackGround: false,
    variant: 'temporary',
    title: '',
    disableClose: false,
};

export default SwipeableMenu;
