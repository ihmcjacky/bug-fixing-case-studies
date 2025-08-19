import React from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import Dialog from '@material-ui/core/Dialog';
import TransitionEff from '../../../../components/common/Transition';
import {toggleAlignmentDialog} from '../../../../redux/linkAlignment/linkAlignmentActions';
import LinkAlignment from '../../../../components/linkAlignment/LinkAlignment';

const LinkAlignmentWrapper = () => {
    const {t, ready} = useTranslation('link-alignment');
    const dispatch = useDispatch();
    const {open} = useSelector(store => store.linkAlignment);

    const handleClose = () => {
        dispatch(toggleAlignmentDialog(false));
    };

    if (!ready) return <span />;
    return (
        <Dialog
            fullScreen
            disableBackdropClick
            open={open}
            onClose={handleClose}
            TransitionComponent={TransitionEff}
        >
            <LinkAlignment t={t} />
        </Dialog>
    );
};

export default LinkAlignmentWrapper;
