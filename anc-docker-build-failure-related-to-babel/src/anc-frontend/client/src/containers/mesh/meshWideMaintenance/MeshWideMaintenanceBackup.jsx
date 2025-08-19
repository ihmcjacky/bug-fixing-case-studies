import React, { useState } from 'react';
import moment from 'moment';
import {useSelector, useDispatch} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import saveAs from '../../../util/nw/saveAs';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid';
import LockLayer from '../../../components/common/LockLayer';
import P2DevTbl from '../../../components/common/P2DevTbl';
import P2PointsToNote from '../../../components/nodeMaintenances/P2PointsToNote';
import {getConfig, getVersion, getFilteredConfigOptions} from '../../../util/apiCall';
import InvalidConfigContainer from '../../../components/common/InvalidConfigContainer';
import {getCurrentDate} from '../../../util/dateHandler';
import checkConfigValue, {getOptionsFromGetConfigObj} from '../../../util/configValidator';
import {isUnreachedNode} from '../../../util/common';
import check from '../../../util/errorValidator';
import P2Dialog from '../../../components/common/P2Dialog';
import {checkFwVersion} from '../../../util/commonFunc';
import {toggleSnackBar} from '../../../redux/common/commonActions';
import {getOemNameOrAnm} from '../../../util/common';

function deepClone(object) {
    return JSON.parse(JSON.stringify(object));
}

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
        paddingLeft: 52,
        paddingRight: 52,
        width: '100%',
    },
    chip: {
        height: '25px',
    },
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

const MeshWideMaintenanceBackup = ({refreshFunc, tableData, loadNodeInfoSuccess}) => {
    const {t, ready} = useTranslation('cluster-maintenance-config-backup');
    const classes = useStyles();
    const dispatch = useDispatch();
    const history = useHistory();
    const {
        common: {csrf, labels},
        projectManagement: {
            projectId,
            projectIdToNameMap
        },
        meshTopology: {
            ipToHostnameMap,
            ipToMacMap,
        },
    } = useSelector(store => store);

    const [isLock, setIsLock] = useState(false);
    const [searchBar, setSearchBar] = useState({
        searchKey: '',
    });
    const [sortingSettings, setSortingSettings] = useState({
        orderBy: 0,
        sortBy: 'hostname',
    });
    const [pageSettings, setPageSettings] = useState({
        currentPage: 0,
        itemsPerPage: 10,
    });
    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        content: '',
        actionTitle: t('ok'),
        actionFn: () => {},
        cancelActTitle: '',
        cancelActFn: () => {},
    });
    const [invalidConfigDialogOpen, setInvalidConfigDialogOpen] = useState(false);
    const [invalidFilterConfig, setInvalidFilterConfig] = useState({
        meshSettings: {},
        radioSettings: {},
        nodeSettings: {},
        ethernetSettings: {},
        profileSettings: {},
        expanded: {
            meshSettings: false,
            node: {},
        },
        // meshSettings: {},
        // radioSettings: {
        //     '127.0.17.10': {
        //         radio0: {
        //             centralFreq: 'invalid',
        //             channel: 'invalid',
        //             txpower: 'invalid',
        //         },
        //         radio1: {
        //             centralFreq: 'wrongEnum',
        //             channel: 'wrongEnum',
        //             txpower: 'wrongEnum',
        //         },
        //     },
        // },
        // nodeSettings: {
        //     '127.0.17.10': {
        //         hostname: 'wrongRegex',
        //     },
        // },
        // ethernetSettings: {
        //     '127.0.17.10': {
        //         eth0: {
        //             ethernetLink: 'wrongEnum',
        //         },
        //         eth1: {
        //             ethernetLink: 'wrongEnum',
        //         },
        //     },
        // },
        // profileSettings: {
        //     '127.0.17.10': {
        //         nbr: {
        //             '1': {
        //                 maxNbr: 'wrongEnum'
        //             }
        //         }
        //     }
        // },
        // expanded: {
        //     meshSettings: false,
        //     node: {
        //         '127.0.17.10': true,
        //     },
        // },
    });

    if (!ready) return <span />;

    const updateInvalidConfigDialog = () => {
        setInvalidConfigDialogOpen(true);
        setIsLock(false);
    };

    const handleInvalidDialogOnClose = () => {
        setInvalidConfigDialogOpen(false);
        setInvalidFilterConfig({
            meshSettings: {},
            radioSettings: {},
            nodeSettings: {},
            ethernetSettings: {},
            profileSettings: {},
            expanded: {
                meshSettings: false,
                node: {},
            },
        });
    };

    const createBackupFile = async (apiResArr) => {
        try {
            const {
                meshSettings, checksums, radioSettings, nodeSettings, ethernetSettings, profileSettings,
            } = apiResArr[0];
            const {version, build} = apiResArr[1];
            const dateString = getCurrentDate('date');
            const datetimeString = getCurrentDate('dateTime');

            const uiVersion = process.env.REACT_APP_UI_DISPLAY_VER ?? 'dev';
            const uiVersionArr = process.env.REACT_APP_UI_DISPLAY_VER ?
                uiVersion.replace('v', '').split('.') : [uiVersion];
            const fullVersion = `${checkFwVersion(version)}.${uiVersionArr[uiVersionArr.length - 1]}`;

            const backupObj = {};
            backupObj.p2BackupConfig = {};
            backupObj.p2BackupConfig.type = 'mesh';
            backupObj.p2BackupConfig.anmVersion = fullVersion;
            backupObj.p2BackupConfig.uiVersion = uiVersion;
            backupObj.p2BackupConfig.controllerVersion = version;
            backupObj.p2BackupConfig.controllerBuild = build;
            backupObj.p2BackupConfig.createdTimestamp = datetimeString;
            backupObj.p2BackupConfig.meshSettings = meshSettings;
            backupObj.p2BackupConfig.nodes = {};

            tableData.forEach((row) => {
                const mac = row[1].ctx;
                const nodeIp = row[4].id;
                const model = row[2].ctx;
                const fwVersion = row[3].ctx;

                if (typeof checksums[nodeIp] === 'undefined' ||
                    typeof radioSettings[nodeIp] === 'undefined' ||
                    typeof nodeSettings[nodeIp] === 'undefined'
                ) {
                    throw new Error('Outdated Device List');
                }

                Object.keys(radioSettings[nodeIp]).forEach((radioName) => {
                    delete radioSettings[nodeIp][radioName].acl;
                });

                backupObj.p2BackupConfig.nodes[mac] = {};
                backupObj.p2BackupConfig.nodes[mac].fwVersion = fwVersion;
                backupObj.p2BackupConfig.nodes[mac].model = model;
                backupObj.p2BackupConfig.nodes[mac].config = {};
                backupObj.p2BackupConfig.nodes[mac].config.checksums = checksums[nodeIp];
                backupObj.p2BackupConfig.nodes[mac].config.radioSettings = radioSettings[nodeIp];
                backupObj.p2BackupConfig.nodes[mac].config.nodeSettings = nodeSettings[nodeIp];
                backupObj.p2BackupConfig.nodes[mac].config.ethernetSettings = ethernetSettings[nodeIp];
                backupObj.p2BackupConfig.nodes[mac].config.profileSettings = profileSettings[nodeIp];

                delete backupObj.p2BackupConfig.nodes[mac].config.nodeSettings.acl;
            });

            const projectName = projectIdToNameMap[projectId];
            const nwManifestName = typeof window.nw !== 'undefined' ? window.nw.App.manifest.window.title : undefined;
            const namePrefix = getOemNameOrAnm(nwManifestName);
            const currentTime = moment().format('YYYY-MM-DD-hh-mm-ss');
            
            const filename = `${namePrefix}_${projectName}_cluster-config_${currentTime}.config`;
            const encodeBackup = btoa(JSON.stringify(backupObj));
            const blobData = [encodeBackup];
            const blob = new Blob(blobData, {type: 'application/octet-stream'});
            const res = await saveAs(blob, filename, '.config');
            
            if (res.success) {
                dispatch(toggleSnackBar(t('downloadCompleted')));
            }
            setIsLock(false);
        } catch (error) {
            let dialogTitle = t('backupFailTitle');
            let dialogContent = t('backupFailContent');
            let dialogSubmitLbl = t('dialogSubmitLbl');
            let dialogSubmitFnc = () => {
                handleDialogOnClose();
            };
            setDialog(prevDialog => ({
                ...prevDialog,
                open: true,
                title: dialogTitle,
                content: dialogContent,
                actionTitle: dialogSubmitLbl,
                actionFn: dialogSubmitFnc,
                cancelActTitle: '',
                cancelActFn: handleDialogOnClose,
            }));
            setIsLock(false);
        }
    };

    const getConfigErrorDueToDiscrepancies = () => {
        setDialog(prevDialog => ({
            ...prevDialog,
            open: true,
                title: t('inSyncTitle'),
                content: t('inSyncContent'),
                actionTitle: t('inSyncAction'),
                actionFn: () => {
                    history.push('/config');
                    // window.location.assign(`${window.location.origin}/index.html/mesh/config`);
                },
                cancelActTitle: '',
                cancelActFn: null,
        }));
        setIsLock(false);
    };

    const onFailReturn = () => {
        setDialog(prevDialog => ({
            ...prevDialog,
            open: true,
                title: t('headNodeUnreachableFailTitle'),
                content: t('headNodeUnreachableFailCtx'),
                actionTitle: t('backClusterTopo'),
                actionFn: () => {
                    // history.push('/mesh');
                    window.location.assign(`${window.location.origin}/index.html`);
                },
                cancelActTitle: '',
                cancelActFn: null,
        }));
    };

    const onFail = () => {
        setDialog(prevDialog => ({
            ...prevDialog,
            open: true,
                title: t('remoteNodeUnreachableFailTitle'),
                content: t('remoteNodeUnreachableFailCtx'),
                actionTitle: t('dialogSubmitLbl'),
                actionFn: () => {
                    refreshFunc();
                    handleDialogOnClose();
                },
                cancelActTitle: '',
                cancelActFn: null,
        }));
        setIsLock(false);
    }

    const createGetFilteredConfigBodyMsg = (getConfigValue) => {
        const {checksums, ...sourceConfig} = deepClone(getConfigValue);
        const options = getOptionsFromGetConfigObj(sourceConfig);
        const bodyMsg = {
            options,
            sourceConfig: deepClone(sourceConfig),
        };

        return bodyMsg;
    }

    const onBackup = async () => {
        setIsLock(true);
        const nodeArr = tableData.map((rowArr) => rowArr[4].id);

        try {
            const value = await getConfig(csrf, projectId, {nodes: nodeArr});
            if (value?.meshSettings?.discrepancies) {
                getConfigErrorDueToDiscrepancies();
            } else {
                const bodyMsg = createGetFilteredConfigBodyMsg(deepClone(value));
                const filteredConfig = await getFilteredConfigOptions(csrf, projectId, bodyMsg);

                const {success, invalidFilterConfigRes} = checkConfigValue(
                    invalidFilterConfig, filteredConfig, deepClone(bodyMsg.sourceConfig), nodeArr
                );
                console.log(invalidFilterConfigRes)
                if (success) {
                    const version = await getVersion();
                    createBackupFile([value, version]);
                } else {
                    setInvalidFilterConfig(invalidFilterConfigRes);
                    updateInvalidConfigDialog();
                }
            }
        } catch (error) {
            console.log('backupError');
            const unreachedNode = isUnreachedNode(error);
            const {title, content} = check(error);
            if (title !== '') {
                setDialog(prevDialog => ({
                    ...prevDialog,
                    open: true,
                        title,
                        content,
                        actionTitle: t('dialogSubmitLbl'),
                        actionFn: handleDialogOnClose,
                        cancelActTitle: '',
                        cancelActFn: null,
                }));
                setIsLock(false);
            } else if (unreachedNode === 'headNodeUnreachable') {
                onFailReturn();
            } else if (unreachedNode === 'unreachable') {
                onFail();
            } else {
                setDialog(prevDialog => ({
                    ...prevDialog,
                    open: true,
                        title: t('backupFailTitle'),
                        content: t('backupFailContent'),
                        actionTitle: t('dialogSubmitLbl'),
                        actionFn: handleDialogOnClose,
                        cancelActTitle: '',
                        cancelActFn: null,
                }));
                setIsLock(false);
            }
        }
    }



    const handleSearch = (event) => {
        setSearchBar({searchKey: event});
    };

    const handleinitiateSearch = () => {
        setSearchBar({searchKey: ''});
    };

    const handleChangePage = (event, page) => {
        setPageSettings({
            ...pageSettings,
            currentPage: page,
        });
    };

    const handleChangeItemsPerPage = (event) => {
        setPageSettings({
            ...pageSettings,
            itemsPerPage: event.target.value,
        });
    };

    const handleRequestSort = (event, property) => {
        if (property === sortingSettings.sortBy) {
            setSortingSettings({
                ...sortingSettings,
                orderBy: sortingSettings.orderBy === 0 ? 1 : 0,
            });
        } else{
            setSortingSettings({
                ...sortingSettings,
                sortBy: property,
                orderBy: 0,
            });
        }
    };

    const handleDialogOnClose = () => {
        setDialog({
            ...dialog,
            open: false,
        });
    };

    const headerLabel = (content) => (
        <div style={{color: 'rgba(0, 0, 0, 0.54)', fontSize: '0.75rem'}}>
            {content}
        </div>
    );
    const Headers = [
        {
            id: 'hostname',
            HeaderLabel: headerLabel(t('hstnmeHdr')),
            isSorted: sortingSettings.sortBy === 'hostname',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        },
        {
            id: 'mac',
            HeaderLabel: headerLabel(t('macHdr')),
            isSorted: sortingSettings.sortBy === 'mac',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        },
        {
            id: 'model',
            HeaderLabel: headerLabel(t('modelHdr')),
            isSorted: sortingSettings.sortBy === 'model',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        },
        {
            id: 'fwVersion',
            HeaderLabel: headerLabel(t('fwVerHdr')),
            isSorted: sortingSettings.sortBy === 'fwVersion',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        },
        {
            id: 'status',
            HeaderLabel: headerLabel(t('statusHdr')),
            isSorted: sortingSettings.sortBy === 'status',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        },
    ];

    const invalidConfigDialog = (
        <InvalidConfigContainer
            meshSettings={invalidFilterConfig.meshSettings}
            nodeSettings={invalidFilterConfig.nodeSettings}
            radioSettings={invalidFilterConfig.radioSettings}
            ethernetSettings={invalidFilterConfig.ethernetSettings}
            profileSettings={invalidFilterConfig.profileSettings}
            expanded={invalidFilterConfig.expanded}
            open={invalidConfigDialogOpen}
            hostnameMap={ipToHostnameMap}
            macMap={ipToMacMap}
        >
            {(open, content) => (
                <P2Dialog
                    open={open}
                    handleClose={handleInvalidDialogOnClose}
                    title={t('configMismatchTitle')}
                    content={(
                        <span style={{marginBottom: '15px'}}>
                            {t('isFilterConfigValidContent')}
                        </span>
                    )}
                    nonTextContent={content}
                    actionTitle={t('dialogSubmitLbl')}
                    actionFn={handleInvalidDialogOnClose}
                    cancelActTitle=""
                    cancelActFn={handleInvalidDialogOnClose}
                    paperProps={{
                        style: {
                            maxWidth: '800px',
                        },
                    }}
                />
            )}
        </InvalidConfigContainer>
    );

    const hasUnreachable = tableData.some(row => row[4].status === 'unreachable');

    const backupBtn = (
        <Button
            variant="contained"
            color="primary"
            size="small"
            style={{
                float: 'right',
                marginRight: '10px',
                marginTop: '15px',
                marginBottom: '20px',
            }}
            onClick={onBackup}
            disabled={!loadNodeInfoSuccess || hasUnreachable}
        >
            <i
                className="material-icons"
                style={{fontSize: '16px', paddingRight: '3px'}}
            >backup</i>
            {t('backupLbl')}
        </Button>
    );

    const refreshTableBtn = (
        <Button
            variant="contained"
            color="primary"
            size="small"
            style={{
                float: 'right',
                marginRight: '10px',
                marginTop: '15px',
                marginBottom: '20px',
            }}
            onClick={refreshFunc}
        >
            <i
                className="material-icons"
                style={{fontSize: '16px', paddingRight: '3px'}}
            >refresh</i>
            {t('refreshLbl')}
        </Button>
    );


    return (
        <Grid
            container
            className={classes.root}
            spacing={1}
        >
            <P2PointsToNote
                noteTitle={t('noteTitle')}
                noteCtxArr={t('noteCtxArr', {returnObjects: true, ...labels})}
            />
            <P2DevTbl
                tblToolbar={{
                    handleSearch,
                    handleinitiateSearch
                }}
                tblHeaders={{
                    Headers,
                    ...searchBar,
                    searching: true,
                    handleRequestSort,
                }}
                tblData={tableData}
                tblFooter={{
                    ...pageSettings,
                    totalItems: tableData.length,
                    handleChangePage,
                    handleChangeItemsPerPage,
                }}
                disableSelect
                disablePaper
                hideSearchIcon
            />
            <div style={{marginTop: '10px', width: '100%'}}>
                {backupBtn}
                {refreshTableBtn}
            </div>
            <P2Dialog
                open={dialog.open}
                handleClose={handleDialogOnClose}
                title={dialog.title}
                content={dialog.content}
                actionTitle={dialog.actionTitle}
                actionFn={dialog.actionFn}
                cancelActTitle={dialog.cancelActTitle}
                cancelActFn={dialog.cancelActFn}
            />
            {invalidConfigDialog}
            <LockLayer display={isLock} />
        </Grid>
    );
};

MeshWideMaintenanceBackup.propTypes = {
    tableData: PropTypes.arrayOf(
            PropTypes.arrayOf(PropTypes.shape({
                type: PropTypes.string,
                ctx: PropTypes.oneOfType([
                    PropTypes.string,
                    PropTypes.element,
                ]),
            })),
        ).isRequired,
    refreshFunc: PropTypes.func.isRequired,
};

export default MeshWideMaintenanceBackup;
