import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
// import FormControl from '@material-ui/core/FormControl';
// import FormHelperText from '@material-ui/core/FormHelperText';
import Grid from '@material-ui/core/Grid';
// import Input from '@material-ui/core/Input';
// import InputLabel from '@material-ui/core/InputLabel';
import Switch from '@material-ui/core/Switch';
import Typography from '@material-ui/core/Typography';
import {updateSettings} from '../../redux/nodeRecovery/nodeRecoveryActions';
import './NodeRecoveryCss.css';

const useStyles = makeStyles({
    dialogTitle: {
        userSelect: 'none',
        padding: '0px 0px 0px',
    },
    title: {
        flex: 1,
        fontWeight: 500,
        fontSize: 24,
        paddingTop: 20,
        paddingLeft: 20,
    },
    inputRoot: {
        marginBottom: 20,
    },
    inputProps: {
        '-webkit-appearance': 'none',
        margin: 0,
    }
});

const NodeRecoverySettings = (props) => {
    const {
        t,
        closeDialog,
    } = props;
    const classes = useStyles();
    const {
        settings: {
            // timeout,
            resumeWhenTimeout,
        },
    } = useSelector(store => store.nodeRecovery);
    const dispatch = useDispatch();
    const [enableResume, setEnableResume] = useState(resumeWhenTimeout);
    // const [timeoutInput, setTimeoutInput] = useState({
    //     value: timeout,
    //     error: false,
    // });

    const switchOnChangeFunc = () => {
        setEnableResume(!enableResume);
    };

    const handleConfirmOnClick = () => {
        dispatch(updateSettings({
            // timeout: timeoutInput.value,
            resumeWhenTimeout: enableResume,
        }));
        closeDialog();
    };

    // const handleTimeoutInputChange = (event, b, c) => {
    //     let error = false;
    //     const {value} = event.target;
    //     if (value >60 || value < 30) {
    //         error = true;
    //     }
    //     setTimeoutInput({
    //         value,
    //         error,
    //     });
    // };

    return (
        <div style={{width: 600}}>
            <DialogTitle classes={{root: classes.dialogTitle}} >
                <Typography
                    data-testid="proj-list-main-title"
                    color="inherit"
                    className={classes.title}
                    variant="body2"
                >
                    {t('settingsTitle')}
                </Typography>
            </DialogTitle>
            <DialogContent style={{paddingBottom: '20px'}}>
                <Grid
                    container
                    direction="row"
                    style={{padding: '15px 0px'}}
                    alignItems="center"
                    justify="space-between"
                >
                    {/* <Grid item xs={12} sm={12}>
                        <FormControl
                            fullWidth
                            error={timeoutInput.error}
                            classes={{root: classes.inputProps}}
                            style={{paddingBottom: 20}}
                        >
                            <InputLabel shrink>
                                {t('timeoutInputLabel')}
                            </InputLabel>
                            <Input
                                fullWidth
                                type="number"
                                value={timeoutInput.value}
                                onChange={handleTimeoutInputChange}
                                inputProps={{
                                    className: classes.inputProps,
                                    onKeyPress: (event) => {
                                        if (event.key === 'e' || event.key === '-' || event.key === '+') {
                                            event.preventDefault();
                                        }
                                    },
                                }}
                            />
                            <FormHelperText>{timeoutInput.error ? t('timeoutInputOutRangeText') : t('timeoutInputHelperText')}</FormHelperText>
                        </FormControl>
                    </Grid> */}
                    <Grid item xs={12} sm={10}>
                        <div
                            style={{
                                display: 'inline-block',
                                verticalAlign: 'middle',
                            }}
                        >
                            <Typography color="inherit" >
                                {t('resumeTittle')}
                            </Typography>
                            <Typography
                                color="inherit"
                                style={{
                                    fontSize: '12px',
                                    opacity: 0.46,
                                }}
                            >
                                {t('resumeSubTittle')}
                            </Typography>
                        </div>
                    </Grid>
                    <Grid item xs={12} sm={2}>
                        <div style={{float: 'right'}}>
                            <Switch
                                checked={enableResume}
                                onChange={switchOnChangeFunc}
                                style={{height: 'auto'}}
                                color="primary"
                                disableRipple
                            />
                        </div>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions style={{paddingBottom: '15px'}}>
                <Button
                    color="primary"
                    onClick={closeDialog}
                    style={{display: 'inline'}}
                    disableRipple
                >
                    {t('cancel')}
                </Button>
                <Button
                    color="primary"
                    onClick={handleConfirmOnClick}
                    disableRipple
                >
                    {t('confirm')}
                </Button>
            </DialogActions>
        </div>
    );
};

NodeRecoverySettings.propTypes = {
    t: PropTypes.func.isRequired,
    closeDialog: PropTypes.func.isRequired,
};

export default NodeRecoverySettings;
