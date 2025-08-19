/**
 * @ Author: Kyle Suen
 * @ Create Time: 2019-11-07 10:45:35
 * @ Modified by: Kyle Suen
 * @ Modified time: 2020-12-30 15:58:21
 * @ Description:
 */

import React from 'react';
import {useTranslation} from 'react-i18next';
import {makeStyles, MuiThemeProvider} from '@material-ui/core/styles';
import {useSelector} from 'react-redux';
import styled from 'styled-components';
import {
    Typography, IconButton, Dialog, DialogContent,
    Toolbar, AppBar, Grid, Paper,
    Button, InputBase, Popover,
} from '@material-ui/core';
import * as TabsModule from 'react-simpletabs';
import Constant from '../../constants/common';
import P2Dialog from '../common/P2Dialog';
import P2Table from '../common/P2Table';
import P2Tooltip from '../common/P2Tooltip';
import Transition from '../common/Transition';
import LockLayer from '../common/LockLayer';
import P2PointsToNote from '../nodeMaintenances/P2PointsToNote';
import useProjectBackupRestore from './useProjectBackupRestore';
// import P2FileUpload from '../../components/common/P2FileUpload';

const {theme, themeObj, colors} = Constant;
const Tabs = TabsModule.default;

const useStyles = makeStyles({
    textAlignment: {
        textAlign: 'center',
    },
    buttonSize: {
        width: '100%',
        height: '100%',
    },
    buttonHeader: {
        fontSize: '36px',
        lineHeight: '42px',
    },
    buttonContent: {
        fontSize: '12px',
        lineHeight: '14px',
        padding: '10px 0',
    },
    root: {
        flexGrow: 1,
    },
    tabGridClass: {
        marginLeft: 0,
    },
    menuItemClass: theme.typography.title,
    popover: {
        pointerEvents: 'none',
    },
});

const StyledTabs = styled(Tabs)`
    .tabs-navigation {
      padding: 0 30px;
      border-bottom: 1px solid ${props => props.theme.tabBorder};
    }
    .tabs-menu {
      display: table;
      list-style: none;
      padding: 0;
      margin: 0;
      font-family: "Roboto", "Helvetica", "Arial", sans-serif;
    }
    .tabs-menu-item {
      float: left;
      cursor: pointer;
      max-height: 42px;
    }
    .tabs-menu-item a {
      display: block;
      padding: 0 60px;
      height: 40px;
      line-height: 40px;
      border-bottom: 0;
      color: ${props => props.theme.txt.halfOpa};
    }
    .tabs-menu-item:not(.is-active) a:hover {
      color: ${props => props.theme.primary.light};
    }
    .tabs-menu-item.is-active a {
      background: white;
      border: 1px solid ${props => props.theme.tabBorder};
      border-top: 3px solid ${props => props.theme.primary.main};
      border-bottom: 0;
      color: ${props => props.theme.primary.main};
      font-weight: bold;
    }
    .tabs-panel {
      display: none;
      padding: 30px;
    }
    .tabs-panel.is-active {
      display: block;
    }
`;

const tabData = [
    {
        id: 0,
        titleKey: 'backupTabTitle',
    },
    {
        id: 1,
        titleKey: 'retoreTabTitle',
    },
];

const createInvalidProjectContent = (project, getFailMsg) => (
    <span
        style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
        }}
    >
        <span style={{width: 18, height: 18, paddingRight: 5}} />
        <Typography>{project}</Typography>
        <P2Tooltip
            title={getFailMsg}
            content={(<i
                className="material-icons"
                style={{
                    fontSize: '18px',
                    marginLeft: '5px',
                    color: colors.inactiveRed,
                }}
            >error</i>)}
        />
    </span>
);

const createColumn = (title, list, getFailMsg, naMsg) => (
    <span
        style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
        }}
    >
        <Typography style={{marginBottom: '10px', color: '#828282'}}>
            {title}
        </Typography>
        {list.map((listItem, idx) => (listItem === 'getFail' ?
            (
                <span
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${listItem}_${idx}`}
                    style={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginBottom: '10px',
                    }}
                >
                    <span style={{width: 18, height: 18, paddingRight: 5}} />
                    <Typography style={{color: colors.inactiveRed}}>{naMsg}</Typography>
                    <P2Tooltip
                        title={getFailMsg}
                        content={(<i
                            className="material-icons"
                            style={{
                                fontSize: '18px',
                                marginLeft: '5px',
                                color: colors.inactiveRed,
                            }}
                        >error</i>)}
                    />
                </span>
            ) :
            (
                <Typography
                    // eslint-disable-next-line react/no-array-index-key
                    key={`${listItem}_${idx}`}
                    style={{
                        marginBottom: '10px',
                        color: 'rgba(33, 33, 33, 0.54)',
                        fontWeight: '300',
                    }}
                >
                    {listItem}
                </Typography>
            ))
        )}
    </span>
);

const createExpandedCnontent = (managedDeviceList, getFailMsg, naMsg) => {
    if (managedDeviceList === 'getFail') {
        return '';
    }
    let macList = [];
    let snList = [];
    let modelList = [];

    Object.keys(managedDeviceList).forEach((nodeIp) => {
        macList = [...macList, managedDeviceList[nodeIp].mac];
        snList = [...snList, managedDeviceList[nodeIp].sn];
        modelList = [...modelList, managedDeviceList[nodeIp].model];
    });

    return (
        <span
            style={{
                margin: '10px 0px',
                display: 'flex',
                justifyContent: 'space-around',
            }}
        >
            {createColumn('S/N', snList, getFailMsg, naMsg)}
            {createColumn('Model', modelList, getFailMsg, naMsg)}
            {createColumn('MAC', macList, getFailMsg, naMsg)}
        </span>
    );
};

const checkGetFail = (value, getFailTooltip, naMsg) => {
    if (value === null) {
        return '-';
    } else if (value === 'getFail') {
        return (
            <span
                style={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                }}
            >
                <span style={{width: 18, height: 18, paddingRight: 5}} />
                <Typography style={{color: colors.inactiveRed}}>{naMsg}</Typography>
                <P2Tooltip
                    title={getFailTooltip}
                    content={(<i
                        className="material-icons"
                        style={{
                            fontSize: '18px',
                            marginLeft: '5px',
                            color: colors.inactiveRed,
                        }}
                    >error</i>)}
                />
            </span>
        );
    }
    return value;
};

const tblToggle = {
    enableSort: true,
    enableHeader: true,
    enableSelect: true,
    enableExpand: true,
    enableFooter: true,
};

const tblFooter = {
    rowsPerPageOptions: [1, 5, 10, 15, 20],
    helper: <span />,
};

const uploadIcon = dragging =>
    (
        <svg width="200px" height="200px" viewBox="0 0 112 136" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M32 104H80V56H112L56 0L0 56H32V104ZM0 120H112V136H0V120Z"
                fill={dragging ? '#425581' : '#E0E0E0'}
            />
        </svg>
    );


const ProjectBackupRestore = () => {
    const {labels} = useSelector(store => store.common);
    const {t: _t, ready} = useTranslation('project-backup-restore');
    const t = (tKey, options) => _t(tKey, {...labels, ...options});
    const {
        dialog,
        isLock,
        toggle: {
            preview,
            anchorEl,
            popOpen,
            imgSrc,
        },
        method: {
            setPreview,
            handleBackupRestoreClose,
            changeTab,
            handleChangeInput,
            getInputProps,
            getRootProps,
            dragging,
            handleReset,
            restoreBackup,
            createBackupFile,
            handleOnBlur,
            onPopOverMouseEnter,
            onPopOverClose,
        },
        tab: {
            currentTab,
            aNMVersion,
            fileCreateTime,
            disableRestore,
            disableBackup,
            secondLayerGetFailProjectList,
            duplicateProject,
            sorting,
            sortBy,
            itemsPerPage,
            currentPage,
        },
        tableData: {
            tblData,
            tblFunction,
            tblSelector,
        },
    } = useProjectBackupRestore(t);
    const projectIdList = useSelector(state => state.projectManagement.projectIdToNameMap) ?? {};
    const classes = useStyles();
    if (!ready) return <span />;
    const imageMap = (src) => {
        if (src === 'getFail') {
            return (
                <span
                    style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                    }}
                >
                    <span
                        style={{
                            height: 18,
                            width: 18,
                            marginRight: 5,
                        }}
                    />
                    <i
                        className="material-icons"
                        style={{
                            color: colors.inactiveRed,
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                        }}
                    >
                        broken_image
                    </i>
                    <P2Tooltip
                        title={t('getCustomMapFail')}
                        content={(<i
                            className="material-icons"
                            style={{
                                fontSize: '18px',
                                marginLeft: '5px',
                                color: colors.inactiveRed,
                            }}
                        >error</i>)}
                    />
                </span>
            );
        } else if (src === '') {
            return (
                <i
                    className="material-icons"
                    style={{
                        color: colors.inactiveRed,
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                    }}
                >
                    clear
                </i>
            );
        }
        return (
            <span
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                <img
                    aria-owns={'mouse-over-popover'}
                    style={{objectFit: 'contain', height: '48px'}}
                    src={src}
                    onMouseEnter={e => onPopOverMouseEnter(e, src)}
                    onMouseLeave={onPopOverClose}
                    alt="test"
                />
            </span>
        );
    };

    const checkProjectName = (projectName) => {
        const duplicateProjectName = Object.keys(projectIdList)
            .some(projectId => projectIdList[projectId] === projectName);
        // console.log('kyle_debug: checkProjectName -> projectName', projectName);
        // console.log('kyle_debug: checkProjectName -> duplicateProject', duplicateProject);
        return duplicateProjectName && duplicateProject[projectName] ?
            <span
                style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}
            >
                {duplicateProject[projectName].error ?
                    <P2Tooltip
                        title={t(duplicateProject[projectName].errorText)}
                        content={(<i
                            className="material-icons"
                            style={{
                                fontSize: '18px',
                                marginRight: '10px',
                                color: colors.inactiveRed,
                            }}
                        >error</i>)}
                    /> :
                    <span
                        style={{
                            width: '18px',
                            height: '18px',
                            marginRight: '10px',
                        }}
                    />
                }
                <InputBase
                    id={projectName}
                    onBlur={handleOnBlur}
                    error={duplicateProject[projectName].error}
                    value={duplicateProject[projectName].value}
                    onChange={handleChangeInput}
                    style={{
                        color: duplicateProject[projectName].error ?
                            colors.inactiveRed : 'rgba(0, 0, 0, 0.87)',
                        border: '2px solid',
                        paddingLeft: '5px',
                        paddingRight: '5px',
                        borderRadius: '5px',
                    }}
                />
            </span>
            :
            projectName;
    };

    const tblHeaders = {
        parentHeaders: [],
        Headers: [
            {
                header: 'projectName',
                headerLabel: t('tblHeaderPrjName'),
                canSort: currentTab === 1 || Object.keys(duplicateProject).length === 0,
            },
            {
                header: 'managementIp',
                headerLabel: t('tblHeaderManagementIp'),
                canSort: true,
            },
            {
                header: 'numOfNodes',
                headerLabel: t('tblNumOfNodes'),
                canSort: true,
            },
            {
                header: 'customMap',
                headerLabel: t('tblCustomMap'),
                canSort: false,
            },
            // {
            //     header: 'dontShowNotification',
            //     headerLabel: t('tblUnmanagedNodeNotification'),
            //     canSort: true,
            // },
        ],
        sorting,
        // sortBy: Object.keys(duplicateProject).length > 0 && sortBy === 'projectName' ? 'managementIp' : sortBy,
        sortBy,
    };

    const title = t('backupOrRestore');

    const parseTblData = (convertData, tab) => {
        if (tab === 1) {
            return convertData.map(data => ({
                id: data.id,
                projectName: secondLayerGetFailProjectList.includes(data.projectName) ?
                    createInvalidProjectContent(data.projectName, t('secondLayerGetFailToolTip')) :
                    data.projectName,
                managementIp: checkGetFail(data.managementIp, t('getFailTooltip'), t('n/a')),
                numOfNodes: checkGetFail(data.numOfNodes, t('getFailTooltip'), t('n/a')),
                customMap: imageMap(data.customMap, data.id),
                // dontShowNotification: createNodeNotificationIcon(
                //     checkGetFail(data.dontShowNotification)),
                expanded: createExpandedCnontent(data.expanded, t('getFailTooltip'), t('n/a')),
            }));
        }
        return convertData.map(data => ({
            id: data.id,
            projectName: checkProjectName(data.projectName),
            managementIp: data.managementIp,
            numOfNodes: data.numOfNodes,
            customMap: imageMap(data.customMap, data.id),
            // dontShowNotification: createNodeNotificationIcon(data.dontShowNotification),
            expanded: createExpandedCnontent(data.expanded),
        }));
    };

    const tableTab = (
        <React.Fragment>
            {currentTab === 2 ?
                (<span
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        marginBottom: '20px',
                    }}
                >
                    <Typography style={{fontSize: '18px', fontWeight: '500'}}>
                        {t('projectRestore')}
                    </Typography>
                    <span
                        style={{
                            display: 'flex',
                            color: 'rgba(0, 0, 0, 0.87)',
                        }}
                    >
                        <Typography style={{fontSize: '16px', marginRight: '5px', fontWeight: '300'}}>
                            {t('restorePreviewBackupSource')}
                        </Typography>
                        <Typography style={{fontSize: '16px', marginRight: '5px', fontWeight: '400'}}>
                            {t('restorePreviewBackupSource2')}
                        </Typography>
                        <Typography style={{fontSize: '16px', fontWeight: '400'}}>
                            {aNMVersion}
                        </Typography>
                        <Typography style={{fontSize: '16px', margin: '0px 5px', fontWeight: '300'}}>
                            {t('restorePreviewBackupAt')}
                        </Typography>
                        <Typography style={{fontSize: '16px', fontWeight: '400'}}>
                            {fileCreateTime}
                        </Typography>
                    </span>
                </span>) :
                (<span
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        marginBottom: '20px',
                    }}
                >
                    <Typography style={{fontSize: '18px', fontWeight: '500'}}>
                        {t('projectBackup')}
                    </Typography>
                    <span
                        style={{
                            display: 'flex',
                            color: '#828282',
                        }}
                    >
                        <Typography
                            style={{
                                fontSize: '16px',
                                fontWeight: '300',
                                color: 'rgba(0, 0, 0, 0.87)',
                            }}
                        >
                            {t('backupDesc')}
                        </Typography>
                    </span>
                    {/* <P2FileUpload
                        inputId="configFile"
                        selectFileHandler={selectFileHandler}
                        fileName="test"
                        placeholder="test"
                        acceptType=".zip"
                    /> */}
                </span>)
            }
            <Paper style={{
                display: 'flex',
                // margin: 30,
                flexDirection: 'column',
                backgroundColor: colors.overviewBoxBackground,
            }}
            >
                <span style={{padding: '20px'}} />
                <P2Table
                    tblHeaders={tblHeaders}
                    tblData={parseTblData(tblData, currentTab)}
                    tblFunction={tblFunction}
                    tblSelector={tblSelector}
                    tblToggle={{...tblToggle, noContentWording: t('noContentWording')}}
                    tblFooter={{...tblFooter, itemsPerPage, currentPage}}
                    style={{
                        padding: {
                            tableCell: '',
                        },
                        toolbar: {
                            minHeight: '',
                            paddingLeft: '',
                        },
                        fontSize: {
                            header: '',
                            body: '',
                            description: '',
                        },
                        footer: {
                            height: '',
                        },
                        tableRow: {
                            height: '60px',
                        },
                    }}
                />
                {/* <div style={{paddingBottom: '10px'}} /> */}
            </Paper>
            <div style={{marginTop: 'auto'}}>
                <span
                    style={{
                        display: 'flex',
                        flexDirection: 'row-reverse',
                        alignItems: 'flex-end',
                        marginBottom: '30px',
                        height: '8vh',
                    }}
                >
                    {currentTab === 1 ?
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={createBackupFile}
                            style={{height: '35px'}}
                            disabled={tblSelector.selectedId.length < 1 ||
                                disableBackup}
                        >
                            <span style={{padding: '3px 10px'}}>
                                {t('confirmBackup')}
                            </span>
                        </Button>
                        :
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={restoreBackup}
                            style={{height: '35px'}}
                            disabled={tblSelector.selectedId.length < 1 ||
                                disableRestore}
                        >
                            <span style={{padding: '3px 10px'}}>
                                {t('confirmRestore')}
                            </span>
                        </Button>
                    }
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        onClick={handleReset}
                        style={{height: '35px', marginRight: '20px'}}
                    >
                        <span style={{padding: '3px 10px'}}>
                            {t('reset')}
                        </span>
                    </Button>
                    {currentTab === 2 ?
                        <Button
                            variant="contained"
                            color="primary"
                            size="small"
                            onClick={() => setPreview(false)}
                            style={{height: '35px', marginRight: '20px'}}
                        >
                            <span style={{padding: '3px 10px'}}>
                                {t('back')}
                            </span>
                        </Button> :
                        <span />
                    }
                </span>
            </div>
        </React.Fragment>
    );

    const tabContent = [
        (<span
            style={{
                display: 'flex',
                height: 'calc(100vh - 254px)',
                margin: '40px 50px 0px 50px',
                // width: '100%',
                flexDirection: 'column',
            }}
        >
            {tableTab}
        </span>),
        preview ?
            (<span
                style={{
                    display: 'flex',
                    height: 'calc(100vh - 254px)',
                    margin: '40px 50px 0px 50px',
                    // width: '100%',
                    flexDirection: 'column',
                }}
            >
                {tableTab}
            </span>)
            :
            (<span
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    // height: 'calc(100vh - 155px)',
                    margin: '40px 50px',
                }}
            >
                <span
                    style={{
                        width: '100%',
                        display: 'flex',
                        height: '10vh',
                        alignItems: 'flex-start',
                        justifyContent: 'flex-start',
                        flexDirection: 'column',
                    }}
                >
                    <Typography style={{fontSize: '18px', fontWeight: '500'}}>
                        {t('projectRestore')}
                    </Typography>
                    <Typography style={{fontSize: '16px', fontWeight: '300'}}>
                        {t('restoreDescription')}
                    </Typography>
                </span>
                <section
                    className="container"
                    style={{
                        width: '100%',
                        height: 'calc(90vh - 305px)',
                        border: `5px dashed ${dragging ? '#425581' : '#BDBDBD'}`,
                        userSelect: 'none',
                        outline: 'none',
                    }}
                >
                    <div
                        {...getRootProps({className: 'dropzone'})}
                        style={{
                            fontSize: '2rem',
                            color: dragging ? '#425581' : '#BDBDBD',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            flexDirection: 'column',
                            height: 'calc(100% - 20px)',
                            outline: 'none',
                            cursor: 'pointer',
                            padding: '10px 0',
                        }}
                    >
                        <input {...getInputProps()} />
                        {uploadIcon(dragging)}
                        <Typography
                            style={{
                                fontSize: '32px',
                                marginBlockStart: '0.75em',
                            }}
                        >
                            {dragging ? t('dropToStart') : t('dragOrClickToStart')}
                        </Typography>
                    </div>
                </section>
            </span>),
    ];

    const backIconButton = (
        <div>
            <IconButton
                color="inherit"
                aria-label="Back"
                onClick={() => handleBackupRestoreClose()}
            >
                <i
                    className="material-icons"
                    style={{width: '24px'}}
                >arrow_back_ios</i>
            </IconButton>
        </div>
    );

    const backButton = (
        <P2Tooltip
            title={t('backBtnTooltip')}
            content={backIconButton}
        />
    );

    const TabItemComponent = (someProps) => {
        const {
            titleTxt,
        } = someProps;
        return (
            <div className={classes.itemMenuDivClass}>
                <span className={classes.itemMenuTxtClass}>{titleTxt}</span>
            </div>
        );
    };

    const TabPanels = tabData
        .map((tabItem) => {
            const someProps = {
                titleTxt: t(tabItem.titleKey),
            };
            return (
                <Tabs.Panel
                    title={<TabItemComponent {...someProps} />}
                    key={`tabData_${tabItem.id}`}
                >
                    {tabContent[tabItem.id]}
                </Tabs.Panel>
            );
        });

    const ctx = (
        <React.Fragment>
            <div
                style={{
                    margin: '0px 0px 20px',
                    paddingLeft: 40,
                }}
            >
                <P2PointsToNote
                    noteTitle={t('noteTitle')}
                    noteCtxArr={[
                        {ctx: t('cwFwNote1'), key: t('cwFwNote1')},
                        {ctx: t('cwFwNote2'), key: t('cwFwNote2')},
                        {ctx: t('cwFwNote3'), key: t('cwFwNote3')},
                    ]}
                />
            </div>
            <Grid container className={classes.root}>
                <Grid className={classes.tabGridClass} item xs={12} lg={12} xl={12}>
                    {/* Note that subsequent components should override the typography changes */}
                    <StyledTabs
                        theme={themeObj}
                        className={classes.menuItemClass}
                        tabActive={currentTab}
                        onAfterChange={idx => changeTab(idx)}
                    >
                        {TabPanels}
                    </StyledTabs>
                </Grid>
            </Grid>
        </React.Fragment>
    );

    return !ready ? <span /> : (
        <React.Fragment>
            <Dialog
                fullScreen
                open
                TransitionComponent={Transition}
                disableBackdropClick
                disableEscapeKeyDown
            >
                <MuiThemeProvider theme={theme}>
                    {isLock &&
                        <LockLayer
                            display
                            top={0}
                            left={0}
                            opacity={1}
                            color={colors.lockLayerBackground}
                            hasCircularProgress
                        />
                    }
                    <AppBar style={{position: 'relative'}}>
                        <Toolbar style={{minHeight: 'auto', paddingLeft: '0px', paddingRight: '0px'}}>
                            {backButton}
                            <span
                                style={{
                                    display: 'flex',
                                    alignItems: 'baseline',
                                }}
                            >
                                <Typography variant="h6" color="inherit">
                                    {title}
                                </Typography>
                            </span>
                        </Toolbar>
                    </AppBar>
                    <DialogContent style={{backgroundColor: 'white', padding: 0}}>
                        <Grid
                            container
                            style={{
                                flexGrow: 1,
                                width: '100%',
                                margin: 0,
                            }}
                            spacing={1}
                            direction="row"
                            justify="flex-start"
                            alignItems="flex-start"
                        >
                            {ctx}
                        </Grid>
                        <Popover
                            className={classes.popover}
                            id="mouse-over-popover"
                            open={popOpen}
                            anchorEl={anchorEl}
                            onClose={onPopOverClose}
                            anchorOrigin={{
                                vertical: 'center',
                                horizontal: 'center',
                            }}
                            transformOrigin={{
                                vertical: 'center',
                                horizontal: 'center',
                            }}
                            disableRestoreFocus
                            elevation={0}
                            PaperProps={{
                                style: {
                                    backgroundColor: 'transparent',
                                },
                            }}
                        >
                            <span>
                                <img
                                    src={imgSrc}
                                    alt="orignal_pic"
                                    style={{
                                        maxHeight: '200px',
                                        objectFit: 'contain',
                                    }}
                                />
                            </span>
                        </Popover>
                        <P2Dialog
                            open={dialog.open}
                            handleClose={dialog.handleClose}
                            title={t(dialog.title)}
                            content={t(dialog.content)}
                            actionTitle={t(dialog.submitButton)}
                            actionFn={dialog.submitAction}
                            cancelActTitle={t(dialog.cancelButton)}
                            cancelActFn={dialog.cancelAction}
                            zIndex={1301}
                        />
                    </DialogContent>
                </MuiThemeProvider>
            </Dialog>
        </React.Fragment>
    );
};

export default ProjectBackupRestore;

