import React, {useState, useEffect} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {makeStyles} from '@material-ui/styles';
import CloseIcon from '@material-ui/icons/Close';
import {ReactComponent as SettingsIcon} from '../../icon/svg/ic_settings.svg';
import Button from '@material-ui/core/Button';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import CardHeader from '@material-ui/core/CardHeader';
import DialogTitle from '@material-ui/core/DialogTitle';
import DialogContent from '@material-ui/core/DialogContent';
import Divider from '@material-ui/core/Divider';
import IconButton from '@material-ui/core/IconButton';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';
import P2Tooltip from '../common/P2Tooltip';
import {projectWelcomeStyles} from './styles';
import P2Dialog from '../common/P2Dialog';
import {
    openSettingsDialog,
} from '../../redux/common/commonActions';
const useStyles = makeStyles(projectWelcomeStyles);

const ProjectWelcome = (props) => {
    const classes = useStyles();
    const dispatch = useDispatch();
    const {needInitialSetup} = useSelector(store => store.uiSettings);

    const [warningDialogOpen, setWarningDialogOpen] = useState(false);
    const {
        t,
        hasLogin,
        welcomeHandleLogout,
        welcomeHandleClose,
        welcomeHandleClickToManagement,
        welcomeHandleClickQuickStaging,
        welcomeHandleSettingsOnClick,
    } = props;

    useEffect(() => {
        console.warn('ProjectWelcome useEffect')
        if (needInitialSetup) {
            setWarningDialogOpen(true);
        }
    }, [needInitialSetup]);

    const closeBtn = (
        <IconButton
            color="inherit"
            onClick={welcomeHandleClose}
            classes={{root: classes.closeBtn}}
        >
            <CloseIcon />
        </IconButton>
    );

    const settingButton = (
        <IconButton
            color="inherit"
            onClick={welcomeHandleSettingsOnClick}
            data-testid="proj-list-icon-gl-btn"
        >
            <SettingsIcon style={{fill: 'rgb(77, 77, 77)'}}/>
        </IconButton>
    );

    const openSettings = () => {
        setWarningDialogOpen(false);
        dispatch(openSettingsDialog());
    };

    return (
        <div>
            <P2Dialog
                open={warningDialogOpen}
                handleClose={() => {}}
                title={t("initSetupRequiredTitle")}
                content={t('initSetupRequiredContent')}
                actionTitle={t('initSetupRequiredBtn')}
                actionFn={openSettings}
            />
            <DialogTitle>
                <div style={{userSelect: 'none'}}>
                    <Typography variant="h6" color="inherit" className={classes.title}>
                        {t('welcome')}
                    </Typography>
                    <Typography variant="h6" color="inherit" className={classes.subTitle}>
                        {t('tips')}
                    </Typography>
                    {hasLogin ? closeBtn : null}
                    <div
                        className={classes.guidelineBtnWrapper}
                        style={{right: hasLogin ? '50px' : '10px'}}
                    >
                        <P2Tooltip
                            title={t('settingTooltip')}
                            content={settingButton}
                            key="guidelineBtn"
                        />
                    </div>
                </div>
            </DialogTitle>
            <DialogContent classes={{root: classes.dialogContent}} >
                <div className={classes.dialogWrapper}>
                    <div className={classes.wrapper}>
                        <Grid container justify="space-between" spacing={5} className={classes.gridRoot}>
                            <Grid className={classes.grid} item md={6}>
                                <Card
                                    className={classes.gridBtnQ}
                                    onClick={welcomeHandleClickQuickStaging}
                                >
                                    <CardHeader
                                        title={t('quickStaging')}
                                        classes={{root: classes.cardHeader, title: classes.cardTitle}}
                                    />
                                    <Divider classes={{root: classes.divider}} />
                                    <CardContent classes={{root: classes.cardContent}}>
                                        <Typography
                                            variant="body2"
                                            color="inherit"
                                            className={classes.discription}
                                        >
                                            {t('quickStagingLan')}
                                            <br />
                                            <br />
                                            {t('quickStagingLanCoun')}
                                        </Typography>
                                    </CardContent>
                                    <div className={classes.discriptionIcon}>
                                        <i className="material-icons" style={{fontSize: '48px'}}>
                                            filter_none
                                        </i>
                                    </div>
                                </Card>
                            </Grid>
                            <Grid className={classes.grid} item md={6}>
                                <Card
                                    className={classes.gridBtnP}
                                    onClick={welcomeHandleClickToManagement}
                                >
                                    <CardHeader
                                        title={t('projectmanagement')}
                                        classes={{root: classes.cardHeader, title: classes.cardTitle}}
                                    />
                                    <Divider classes={{root: classes.divider}} />
                                    <CardContent classes={{root: classes.cardContent}}>
                                        <Typography
                                            color="inherit"
                                            className={classes.discription}
                                            variant="body2"
                                        >
                                            {t('projectManagementLan')}
                                            <br />
                                            <br />
                                            {t('projectManagementLanCoun')}
                                        </Typography>
                                    </CardContent>
                                    <div className={classes.discriptionIcon}>
                                        <i className="material-icons" style={{fontSize: '48px'}}>
                                            queue_play_next
                                        </i>
                                    </div>
                                </Card>
                            </Grid>
                        </Grid>
                    </div>
                </div>
            </DialogContent>
            <div className={classes.btnWrapper}>
                <Button
                    color="primary"
                    style={{paddingLeft: '0', marginLeft: '0', marginTop: '20px'}}
                    onClick={welcomeHandleLogout}
                >
                    <i className="material-icons">keyboard_arrow_left</i>
                    {t('logout')}
                </Button>
            </div>
        </div>
    );
};

ProjectWelcome.propTypes = {
    t: PropTypes.func.isRequired,
    hasLogin: PropTypes.bool.isRequired,
    welcomeHandleLogout: PropTypes.func.isRequired,
    welcomeHandleClose: PropTypes.func.isRequired,
    welcomeHandleClickToManagement: PropTypes.func.isRequired,
    welcomeHandleClickQuickStaging: PropTypes.func.isRequired,
    welcomeHandleSettingsOnClick: PropTypes.func.isRequired,
};

export default ProjectWelcome;
