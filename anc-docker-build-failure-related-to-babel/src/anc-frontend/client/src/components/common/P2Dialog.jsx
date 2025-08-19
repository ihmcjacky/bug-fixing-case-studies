/**
 * @Author: mango
 * @Date:   2018-04-19T16:19:10+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-10-18T16:18:35+08:00
 */
import React from 'react';
import PropTypes from 'prop-types';
import Button from '@material-ui/core/Button';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import CommonConstants from '../../constants/common';

const {zIndexLevel} = CommonConstants;

const defaultPropsObj = {
    cancelActTitle: '',
    cancelActFn: () => (false),
    enableBackdropClick: false,
    enableEscapeKeyDown: false,
    nonTextContent: <span />,
    maxWidth: 'sm',
    fullWidth: false,
    disableAction: false,
    zIndex: zIndexLevel.medium,
    dialogHelper: <span />,
    diableActionFn: false,
    diableCancelActFn: false,
    paperProps: false,
};

function P2Dialog(props) {
    let displayCancelActButton = 'none';
    if (props.cancelActTitle !== '') {
        displayCancelActButton = 'inline';
    }

    const dialogAction = props.disableAction ? <span /> : (
        <DialogActions>
            <div style={{
                marginRight: 'auto',
            }}
            >
                {props.dialogHelper}
            </div>
            <Button
                onClick={props.cancelActFn}
                color="primary"
                autoFocus
                style={{display: displayCancelActButton}}
                disableRipple
                disabled={props.diableCancelActFn}
            >
                {props.cancelActTitle}
            </Button>
            <Button
                onClick={props.actionFn}
                color="primary"
                autoFocus
                disableRipple
                disabled={props.diableActionFn}
            >
                {props.actionTitle}
            </Button>
        </DialogActions>
    );
    return (
        <Dialog
            open={props.open}
            onClose={props.handleClose}
            disableBackdropClick={!props.enableBackdropClick}
            disableEscapeKeyDown={!props.enableEscapeKeyDown}
            style={{zIndex: props.zIndex}}
            {...{
                ...(!props.paperProps && {maxWidth: props.maxWidth}),
                ...(props.paperProps && {PaperProps: props.paperProps}),
            }}
            fullWidth={props.fullWidth}
        >
            <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
            <DialogContent>
                {props.content !== '' &&
                    <DialogContentText id="alert-dialog-description">
                        {props.content}
                    </DialogContentText>
                }
                {props.nonTextContent}
            </DialogContent>
            {dialogAction}
        </Dialog>
    );
}

P2Dialog.propTypes = {
    open: PropTypes.bool.isRequired,
    handleClose: PropTypes.func.isRequired,
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.object,
    ]).isRequired,
    content: PropTypes.oneOfType(
        [PropTypes.string, PropTypes.element]
    ).isRequired,
    actionTitle: PropTypes.string.isRequired,
    actionFn: PropTypes.func.isRequired,
    nonTextContent: PropTypes.element,
    diableActionFn: PropTypes.bool,
    cancelActTitle: PropTypes.string,
    cancelActFn: PropTypes.func,
    diableCancelActFn: PropTypes.bool,
    enableBackdropClick: PropTypes.bool,
    enableEscapeKeyDown: PropTypes.bool,
    maxWidth: PropTypes.string,
    fullWidth: PropTypes.bool,
    disableAction: PropTypes.bool,
    zIndex: PropTypes.number,
    paperProps: PropTypes.oneOfType(
        [PropTypes.objectOf(
            PropTypes.objectOf(
                PropTypes.string
            )
        ), PropTypes.bool]
    ),
    dialogHelper: PropTypes.element,
};

P2Dialog.defaultProps = defaultPropsObj;

export default P2Dialog;
