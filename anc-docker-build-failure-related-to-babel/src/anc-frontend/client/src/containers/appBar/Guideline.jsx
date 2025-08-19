import React, {useState, useEffect} from 'react';
import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import CloseIcon from '@material-ui/icons/Close';
import KeyboardArrowLeft from '@material-ui/icons/KeyboardArrowLeft';
import KeyboardArrowRight from '@material-ui/icons/KeyboardArrowRight';
import Checkbox from '@material-ui/core/Checkbox';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import MobileStepper from '@material-ui/core/MobileStepper';
import IconButton from '@material-ui/core/IconButton';

const useStyles = makeStyles({
    guidelineStepper: {
        justifyContent: 'center',
        backgroundColor: '#fff',
        paddingTop: '0px',
        paddingBottom: '0px',
    },
    guidelineStepperDot: {
        margin: '0 5px',
    },
    guidelineDialogContent: {
        paddingBottom: '12px',
    },
});

const filename = {
    quickStaging: [
        'QuickStagingP1.png',
        'QuickStagingP2.gif',
        'QuickStagingP3.gif',
        'QuickStagingP4.png',
        'QuickStagingP5.gif',
        'QuickStagingP6.png',
        'QuickStagingP7.gif',
    ],
    meshTopology: [
        'HelpP1.gif',
        'HelpP2.png',
        'HelpP3.gif',
        'HelpP4.png',
        'HelpP5.gif',
    ],
};

const guidelineLocation = '/img/hints';

const Guideline = ({notShowAgain, closeDialog, type}) => {
    const classes = useStyles();
    const {lang, labels} = useSelector(state => state.common);
    const {t, ready} = useTranslation('guideline-dialog');
    const [checkbox, setCheckbox] = useState(notShowAgain);
    const [step, setStep] = useState(0);

    useEffect(() => {
        setCheckbox(notShowAgain);
    }, [notShowAgain]);
    if (!ready) { return <span />; }

    const handleCheckboxOnClick = () => {
        setCheckbox(!checkbox);
    };

    const handleNextStep = () => { setStep(step + 1); };

    const handleBackStep = () => { setStep(step - 1); };

    const closeBtn = (
        <IconButton
            color="inherit"
            onClick={() => { closeDialog(checkbox); }}
            style={{
                position: 'absolute',
                top: '10px',
                right: '10px',
            }}
        >
            <CloseIcon />
        </IconButton>
    );

    return (
        <>
            <DialogTitle id="alert-dialog-title">
                <span style={{display: 'flex'}} >
                    {t('guidelineTitle', labels)}
                    <div style={{marginLeft: 'auto'}}>
                        {closeBtn}
                    </div>
                </span>
            </DialogTitle>
            <DialogContent>
                <DialogContentText id="alert-dialog-description">
                    <span
                        style={{
                            maxWidth: '100%',
                            width: '100%',
                            overflowY: 'auto',
                            overflowX: 'auto',
                            display: 'block',
                        }}
                    >
                        <React.Fragment>
                            <span>
                                <img
                                    style={{
                                        pointerEvents: 'none',
                                        WebkitTouchCallout: 'none',
                                        WebkitUserSelect: 'none',
                                        MozUserSelect: 'none',
                                        msUserSelect: 'none',
                                        userSelect: 'none',
                                    }}
                                    src={`${guidelineLocation}/${lang}/${type}/${filename[type][step]}`}
                                    alt={`guideline-${step}`}
                                />
                            </span>
                        </React.Fragment>
                    </span>
                </DialogContentText>
                <React.Fragment>
                    <MobileStepper
                        variant="dots"
                        steps={filename[type].length}
                        position="static"
                        activeStep={step}
                        className={classes.guidelinStepper}
                        classes={{
                            root: classes.guidelineStepper,
                            dot: classes.guidelineStepperDot,
                        }}
                        nextButton={
                            <Button
                                size="small"
                                onClick={handleNextStep}
                                disabled={step === (filename[type].length - 1)}
                                style={{marginLeft: '10px'}}
                            >
                                {t('stepperForwardLbl')}
                                {<KeyboardArrowRight />}
                            </Button>
                        }
                        backButton={
                            <Button
                                size="small"
                                onClick={handleBackStep}
                                disabled={step === 0}
                                style={{marginRight: '10px'}}
                            >
                                {<KeyboardArrowLeft />}
                                {t('stepperBackwardLbl')}
                            </Button>
                        }
                    />
                    <span
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <FormControlLabel
                            control={
                                <Checkbox
                                    checked={checkbox}
                                    onChange={(handleCheckboxOnClick)}
                                    value="showHint"
                                    color="primary"
                                />
                            }
                            label={t('showHintLbl')}
                            style={{minWidth: 'fit-content'}}
                            id="showHint"
                        />
                    </span>
                </React.Fragment>
            </DialogContent>
        </>
    );
};

Guideline.propTypes = {
    notShowAgain: PropTypes.bool.isRequired,
    closeDialog: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
};

export default Guideline;
