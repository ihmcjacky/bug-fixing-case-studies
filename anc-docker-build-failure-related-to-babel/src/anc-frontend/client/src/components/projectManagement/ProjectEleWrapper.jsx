import React from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import Transition from '../../components/common/Transition';

/**
 * A wrapper component for all project related dialog
 */
const ProjectEleWrapper = (props) => {
    const {
        open,
        handleClose,
        paperClasses,
        children,
    } = props
    return (
        <Dialog
            disableBackdropClick
            disableEscapeKeyDown
            fullWidth
            maxWidth="md"
            open={open}
            onClose={handleClose}
            TransitionComponent={Transition}
            transitionDuration={500}
            TransitionProps={{direction: 'up'}}
            classes={{paperWidthMd: paperClasses}}
        >
            {children}
        </Dialog>
    )
};

ProjectEleWrapper.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    paperClasses: PropTypes.string.isRequired,
    children: PropTypes.element.isRequired,
}

export default ProjectEleWrapper;
