/**
 * @Author: mango
 * @Date:   2018-04-17T14:50:41+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-11-13T10:56:28+08:00
 */
import React from 'react';
import PropTypes from 'prop-types';
import {useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import {makeStyles, MuiThemeProvider} from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Typography from '@material-ui/core/Typography';
import Constant from '../../constants/common';
import {seriesDeterminer} from '../../util/common'
import FWUpgradeApp from '../nodeMaintenances/FWUpgradeApp';
import FactoryReset from '../nodeMaintenances/FactoryReset';
import SystemRestart from '../nodeMaintenances/SystemRestart';
import ConfigBackupApp from '../nodeMaintenances/ConfigBackApp';
import ConfigRestoreApp from '../nodeMaintenances/ConfigRestoreApp';
import FirmwareDowngradeApp from '../nodeMaintenances/FirmwareDowngradeApp';
import SystemLogNodeExportApp from '../nodeMaintenances/SystemLogNodeExportApp';

const {theme} = Constant;

const useStyles = makeStyles({
    expansionPanelExpanded: {
        margin: '0px 0px 15px 0px',
    },
    expansionPanelRoot: {
        marginBottom: '20px',
        '&:before': {
            display: 'none',
        },
        borderRadius: '2px',
    },
});

const MaintenancesBox = ({
    updateIsLock, pollingHandler, close, nodes
}) => {
    const {t, ready} = useTranslation('cluster-topology-maintenances-box');
    const {enableFwDowngrade} = useSelector(store => store.uiSettings);
    const classes = useStyles();
    if (!ready) {
        return <span />;
    }

    const createExpansionPanel = (title, content, defaultExpanded) => {
        return (
            <Accordion
                classes={{
                    expanded: classes.expansionPanelExpanded,
                    root: classes.expansionPanelRoot,
                }}
                defaultExpanded={defaultExpanded}
            >
                <AccordionSummary
                    expandIcon={<i className="material-icons">expand_more</i>}
                    style={{maxHeight: '40px', minHeight: '40px'}}
                >
                    <Typography variant="body2" style={{fontSize: '16px'}}>{title}</Typography>
                </AccordionSummary>
                <AccordionDetails
                    style={{padding: '0px 30px 20px 30px', display: 'block'}}
                >
                    {content}
                </AccordionDetails>
            </Accordion>
        );
    }

    return (
        <MuiThemeProvider theme={theme}>
            <div style={{padding: '20px', overflowY: 'auto', height: 'auto'}}>
                {createExpansionPanel(
                    t('configurationBackup'),
                    <ConfigBackupApp
                        nodes={nodes}
                        close={close}
                        pollingHandler={pollingHandler}
                    />,
                    true
                )}
                {createExpansionPanel(
                    t('configurationRestore'),
                    <ConfigRestoreApp
                        nodes={nodes}
                        close={close}
                        pollingHandler={pollingHandler}
                        updateIsLock={updateIsLock}
                    />,
                    false
                )}
                {createExpansionPanel(
                    t('fwUpgrade'),
                    <FWUpgradeApp
                        nodes={nodes}
                        nodeIp={nodes[0].ipv4}
                        close={close}
                        pollingHandler={pollingHandler}
                        updateIsLock={updateIsLock}
                    />,
                    false
                )}
                {createExpansionPanel(
                    t('factoryReset'),
                    <FactoryReset
                        nodeIp={nodes[0].ipv4}
                        close={close}
                        pollingHandler={pollingHandler}
                        updateIsLock={updateIsLock}
                    />,
                    false
                )}
                {createExpansionPanel(
                    t('systemRestart'),
                    <SystemRestart
                        nodeIp={nodes[0].ipv4}
                        close={close}
                    />,
                    false
                )}
                {enableFwDowngrade && seriesDeterminer(nodes[0].model) !== 'ax50' ? createExpansionPanel(
                    t('fwwareDowngrade'),
                    <FirmwareDowngradeApp
                        nodes={nodes}
                        close={close}
                        nodeIp={nodes[0].ipv4}
                        pollingHandler={pollingHandler}
                        updateIsLock={updateIsLock}
                    />,
                    false
                ) : null}
                {createExpansionPanel(
                    t('systemLog'),
                    <SystemLogNodeExportApp
                        nodeIp={nodes[0].ipv4}
                        hostname={nodes[0].hostname}
                        pollingHandler={pollingHandler}
                        type="node"
                    />,
                    false
                )}
            </div>
        </MuiThemeProvider>
    );
}

MaintenancesBox.propTypes = {
    nodes: PropTypes.arrayOf(
        PropTypes.shape({
            ipv4: PropTypes.string.isRequired,
            hostname: PropTypes.string.isRequired,
            model: PropTypes.string.isRequired,
            fwVersion: PropTypes.string.isRequired,
        })
    ).isRequired,
    close: PropTypes.func.isRequired,
    pollingHandler: PropTypes.shape(
        {
            restartInterval: PropTypes.func.isRequired,
            stopInterval: PropTypes.func.isRequired,
        }
    ).isRequired,
    updateIsLock: PropTypes.func.isRequired,
};


export default MaintenancesBox;
