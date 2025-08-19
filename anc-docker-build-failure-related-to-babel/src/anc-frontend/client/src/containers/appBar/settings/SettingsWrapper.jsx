import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {useTranslation} from 'react-i18next';
import Dialog from '@material-ui/core/Dialog';
import {closeSettingsDialog} from '../../../redux/common/commonActions';
import TransitionEff from '../../../components/common/Transition';
import Settings from './Settings';
import CommonConstants from '../../../constants/common';

const {colors} = CommonConstants;

/**
 * A Dialog wrapper for Settings Component
 */
const SettingsWrapper = () => {
    const {labels, settingsDialog: {open}} = useSelector(store => store.common);
    const {t: _t, ready} = useTranslation('settings');
    const t = (tKey, options) => _t(tKey, {...labels, ...options});
    const dispatch = useDispatch();

    const handleClose = () => { dispatch(closeSettingsDialog()); };

    return ready ? (
        <Dialog
            fullScreen
            open={open}
            onClose={handleClose}
            TransitionComponent={TransitionEff}
            PaperProps={{
                style: {
                    background: colors.background,
                    overflowY: 'hidden',
                }
            }}
        >
            <Settings t={t}/>
        </Dialog>
    ) : <span />;
};

export default SettingsWrapper;
