import React, {useMemo} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Dialog from '@material-ui/core/Dialog';
import {closeGuidelineDialog} from '../../redux/common/commonActions';
import {updateShouldHelpDialogPopUp, syncUiSettings} from '../../redux/uiSettings/uiSettingsActions';
import Guideline from './Guideline';
import constants from '../../constants/project';

const {project: {quickStagingName}} = constants;

const useStyles = makeStyles({
    dialogWidth: {
        width: '958px',
        minHeight: '60%',
    },
});

const GuidelineDialog = () => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const {
        common: {
            guidelineDialog: {open},
        },
        projectManagement: {projectName},
        uiSettings: {shouldHelpDialogPopUp},
    } = useSelector(store => store);

    const type = useMemo(() => projectName === quickStagingName ? 'quickStaging' : 'meshTopology', [projectName]);

    const handleCloseDialog = (change) => {
        if (change === shouldHelpDialogPopUp[type]) {
            dispatch(updateShouldHelpDialogPopUp(type, !change));
            dispatch(syncUiSettings());
        }
        dispatch(closeGuidelineDialog());
    };

    return (
        <Dialog
            open={open}
            onClose={() => { dispatch(closeGuidelineDialog()); }}
            disableBackdropClick
            disableEscapeKeyDown
            maxWidth="md"
            style={{zIndex: 1400}}
            classes={{paperWidthMd: classes.dialogWidth}}
        >
            <Guideline
                notShowAgain={!shouldHelpDialogPopUp[type]}
                closeDialog={handleCloseDialog}
                type={type}
            />
        </Dialog>
    )
};

export default GuidelineDialog;
