import React from 'react';
import {useHistory} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import {MuiThemeProvider} from '@material-ui/core/styles/';
import Grid from '@material-ui/core/Grid';
import P2Dialog from '../../../components/common/P2Dialog';
import LockLayer from '../../../components/common/LockLayer';
import ConfigHeader from './ConfigHeader';
import ConfigContent from './ConfigContent';
import useConfigCommon from './useConfigCommon';
import Constants from '../../../constants/common';
const {theme, colors} = Constants;


const ConfigMain = () => {
    const history = useHistory();
    const {t, ready} = useTranslation('cluster-configuration');
    const {
        isLoading,
        isInit,
        refreshFunc,
        error,
    } = useConfigCommon({t});

    if (!ready) {
        return <span />;
    }

    const getTitle = () => {
        if (error === '') return '';
        return t(`${error}Title`);
    };

    const getContent = () => {
        if (error === '') return '';
        return t(`${error}Content`);
    };
    return (
        <MuiThemeProvider theme={theme}>
            <Grid
                container
                style={{
                    flexGrow: 1,
                    marginLeft: 0,
                    paddingLeft: 0,
                    background: colors.background,
                }}
            >
                <ConfigHeader
                    t={t}
                />
                <ConfigContent
                    t={t}
                    refreshFunc={refreshFunc}
                />
                <LockLayer display={isLoading} />
                <P2Dialog
                    open={error !== ''}
                    handleClose={() => {}}
                    title={getTitle()}
                    content={getContent()}
                    actionTitle={t('backToTopology')}
                    actionFn={() => {
                        // history.push('/');
                        // history.push({
                        //     pathname: '/index.html',
                        //     hash: '/'
                        // });
                        window.location.assign(`${window.location.origin}/index.html`);
                    }}
                />
            </Grid>
        </MuiThemeProvider>
    );
};

export default ConfigMain;