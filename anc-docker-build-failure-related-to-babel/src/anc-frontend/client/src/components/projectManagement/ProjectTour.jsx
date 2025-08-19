import React from 'react';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {makeStyles} from '@material-ui/styles';
import CloseIcon from '@material-ui/icons/Close';
import Checkbox from '@material-ui/core/Checkbox';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import IconButton from '@material-ui/core/IconButton';
import Typography from '@material-ui/core/Typography';
import {projectTourStyles} from './styles';

const useStyles = makeStyles(projectTourStyles);

const ProjectTour = (props) => {
    const classes = useStyles();
    const {lang} = useSelector(state => state.common);
    const {
        t,
        dontShow,
        tourHandleCheckboxOnClick,
        tourHandleOnClose,
    } = props;

    const closeBtn = (
        <IconButton
            color="inherit"
            onClick={tourHandleOnClose}
            classes={{root: classes.closeBtn}}
        >
            <CloseIcon />
        </IconButton>
    );

    return (
        <div>
            <DialogTitle>
                <div style={{userSelect: 'none'}}>
                    <Typography variant="h6" color="inherit" className={classes.title}>
                        {t('tourWelcomeTitle')}
                    </Typography>
                </div>
                {closeBtn}
            </DialogTitle>
            <DialogContent classes={{root: classes.dialogContent}} >
                <div className={classes.picWrapper}>
                    <img
                        src={`/img/hints/${lang}/projectManagement/Project_Management.png`}
                        alt="tour"
                    />
                </div>
            </DialogContent>
            <div className={classes.checkboxWrapper}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={dontShow}
                            onChange={tourHandleCheckboxOnClick}
                            value="showHint"
                            color="primary"
                        />
                    }
                    label={t('showHintLbl')}
                    style={{minWidth: 'fit-content', userSelect: 'none'}}
                    id="showHint"
                />
            </div>
        </div>
    );
};

ProjectTour.propTypes = {
    t: PropTypes.func.isRequired,
    dontShow: PropTypes.bool.isRequired,
    tourHandleCheckboxOnClick: PropTypes.func.isRequired,
    tourHandleOnClose: PropTypes.func.isRequired,
};

export default ProjectTour;
