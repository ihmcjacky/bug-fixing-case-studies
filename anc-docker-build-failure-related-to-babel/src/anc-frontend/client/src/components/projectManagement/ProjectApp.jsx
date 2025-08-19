import React, { useEffect } from 'react';
import {useTranslation} from 'react-i18next';
import {useDispatch, useSelector} from 'react-redux';
import makeStyles from '@material-ui/core/styles/makeStyles';
import { toggleLockLayer } from  '../../redux/common/commonActions';
import P2Dialog from '../common/P2Dialog';
import useProjectManager from './useProjectManager';
import ProjectWelcome from './ProjectWelcome';
import ProjectTour from './ProjectTour';
import ProjectList from './ProjectList';
import ProjectLogin from './ProjectLogin';
import ProjectSave from './ProjectSave';
import ProjectEleWrapper from './ProjectEleWrapper';
import Constants from '../../constants/common';
import LockLayer from '../common/LockLayer';

const {colors} = Constants;

const useStyles = makeStyles({
    welcomePapper: {
        backgroundColor: colors.projectLandingDialogBackground,
        width: '850px',
    },
    tourPapper: {
        backgroundColor: colors.projectLandingDialogBackground,
        width: '990px',
    },
    listPapper: {
        backgroundColor: colors.projectLandingDialogBackground,
        width: '960px',
    },
    loginPapper: {
        backgroundColor: colors.projectLandingDialogBackground,
        width: '850px',
    },
    savePapper: {
        backgroundColor: colors.projectLandingDialogBackground,
        width: '650px',
    },
});

/**
 * A wrapper to render all the proejct management related components
 */
const ProjectApp = () => {
    const {
        labels, lock, misc: {
            isAutoLogin, projectAppDialogTitle,
            projectAppDialogContent, projectAppDialogOpen
        }
    } = useSelector(store => store.common);
    const dispatch = useDispatch();
    const {t: _t, ready} = useTranslation('project-landing');
    const t = (tKey, options) => _t(tKey, {...labels, ...options});
    const {
        state, handler, dialog, backupRestoreDialog
    } = useProjectManager();
    const classes = useStyles();


    useEffect(() => {
        console.warn(lock)
        console.log("isAutoLogin:", isAutoLogin)
    }, [lock, isAutoLogin]);
    
    if (!ready) return <span />;

    return (
        <>
            {/* Lock layer (highest z-index lv), controlled by redux */}
            {/* change z-index for display snackBar */}
            <LockLayer
                display={lock || isAutoLogin}
                opacity={1}
                zIndex={isAutoLogin ? Constants.zIndexLevel.extremeHigh: null}
                top={!isAutoLogin ? '48px' : 0}
                height={!isAutoLogin ? 'calc(100% - 48px)' : 0}
            />
            <ProjectEleWrapper
                open={state.onView === 'welcome'}
                handleClose={handler.welcome.welcomeHandleClose}
                paperClasses={classes.welcomePapper}
            >
                <ProjectWelcome
                    t={t}
                    hasLogin={state.hasLogin}
                    {...handler.welcome}
                />
            </ProjectEleWrapper>
            <ProjectEleWrapper
                open={state.onView === 'tour'}
                handleClose={handler.tour.tourHandleOnClose}
                paperClasses={classes.tourPapper}
            >
                <ProjectTour
                    t={t}
                    dontShow={state.dontShow}
                    {...handler.tour}
                />
            </ProjectEleWrapper>
            <ProjectEleWrapper
                open={state.onView === 'list'}
                handleClose={handler.list.listHandleOnClose}
                paperClasses={classes.listPapper}
            >
                <ProjectList
                    t={t}
                    hasLogin={state.hasLogin}
                    list={state.projectList}
                    currentProjectId={state.currentProjectId}
                    backupRestoreDialog={backupRestoreDialog}
                    {...handler.list}
                />
            </ProjectEleWrapper>
            <ProjectEleWrapper
                open={state.onView === 'login'}
                handleClose={handler.login.loginHandleBackOnClick}
                paperClasses={classes.loginPapper}
            >
                <ProjectLogin
                    t={t}
                    list={state.projectList}
                    rememberSecret={state.rememberSecret}
                    projectName={state.projectName}
                    savedSecret={state.savedSecret}
                    isAutoLogin={isAutoLogin}
                    {...handler.login}
                />
            </ProjectEleWrapper>
            <ProjectEleWrapper
                open={state.onView === 'save'}
                handleClose={handler.save.saveHandleCancel}
                paperClasses={classes.savePapper}
            >
                <ProjectSave
                    t={t}
                    list={state.projectList}
                    {...handler.save}
                />
            </ProjectEleWrapper>
            <P2Dialog
                open={dialog.open}
                handleClose={() => {}}
                title={t('lcoationCheckingErrorTitle')}
                content={t('notCompatibleLocationCountryContent')}
                actionTitle={t('loginFailDialogAct')}
                actionFn={dialog.actionFn}
            />
            <P2Dialog
                open={projectAppDialogOpen}
                handleClose={() => { }}
                title={projectAppDialogTitle}
                content={projectAppDialogContent}
                actionTitle={t('loginFailDialogAct')}
                actionFn={dialog.actionFn}
            />
        </>
    );
};

ProjectApp.whyDidYouRender = false;

export default ProjectApp;