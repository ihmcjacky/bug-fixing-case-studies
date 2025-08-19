import React, {useState} from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useHistory} from 'react-router-dom';
import {useTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import Cookies from 'js-cookie';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button'
import Grid from '@material-ui/core/Grid';
import LockLayer from '../../../components/common/LockLayer';
import P2DevTbl from '../../../components/common/P2DevTbl';
import P2PointsToNote from '../../../components/nodeMaintenances/P2PointsToNote';
import {toggleSnackBar, updateProgressBar} from '../../../redux/common/commonActions';
import {reboot} from '../../../util/apiCall';
import Constants from '../../../constants/common';
import P2Dialog from '../../../components/common/P2Dialog';
import {rebootErrorDeterminer} from '../../../util/errorValidator';

const {colors} = Constants;

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
        paddingLeft: 52,
        paddingRight: 52,
        width: '100%',
    },
});

const MeshWideMaintenanceReboot = (props) => {
    const {
        tableData,
        refreshFunc,
    } = props;
    const {t, ready} = useTranslation('cluster-maintenance-config-restart');
    const classes = useStyles();
    const history = useHistory();
    const dispatch = useDispatch();
    const {
        common: {csrf, labels},
        meshTopology: {
            graph: {nodes},
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
    const [rebootStatus, setRebootStatus] = useState({
        rebootClicked: false,
        success: false,
        error: null,
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

    if (!ready) return <span />;

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

    const onReset = () => {
        refreshFunc();
        setSearchBar({searchKey: ''});
        setPageSettings({
            ...pageSettings,
            currentPage: 0,
        });
        setRebootStatus({
            rebootClicked: false,
            success: false,
            error: null,
        });
    };

    const handleReboot = () => {
        setIsLock(true);
        dispatch(updateProgressBar(true));
        dispatch(toggleSnackBar(t('rebooting')));
        setRebootStatus({
            rebootClicked: true,
            success: false,
            error: null,
        });

        const nodeList = nodes.filter(node => node.isManaged).map(node => node.id);
        const projectId = Cookies.get('projectId');

        reboot(csrf, projectId, {allNodes: true}).then(() => {
            setDialog({
                ...dialog,
                open: true,
                title: t('rebootSuccessTitle'),
                content: t('rebootSuccessContent'),
                actionTitle: t('dialogSuccessButtonLbl'),
                actionFn: () => {
                    // history.push('/');
                    window.location.assign(`${window.location.origin}/index.html`);
                },
                cancelActTitle: '',
                cancelActFn: handleDialogOnClose,
            });
            dispatch(updateProgressBar(false));
            dispatch(toggleSnackBar(t('rebootSuccessTitle')));
            setRebootStatus({
                rebootClicked: true,
                success: true,
                error: null,
            });
        }).catch((err) => {
            const errObj = {};
            if (err?.data?.type === 'specific') {
                nodeList.forEach((ip) => {
                    errObj[ip] = {};
                    errObj[ip].success = err.data.data[ip].success;
                    if (!err.data.data[ip].success) {
                        errObj[ip].error = err.data.data[ip].errors[0].type;
                    }
                });
            } else if (err?.data?.type === 'errors') {
                nodeList.forEach((ip) => {
                    errObj[ip] = {};
                    errObj[ip].success = false;
                    errObj[ip].error = err.data.data[0].type;
                });
            } else {
                nodeList.forEach((ip) => {
                    errObj[ip] = {};
                    errObj[ip].success = false;
                    errObj[ip].error = err.message;
                });
            }
            setRebootStatus({
                rebootClicked: true,
                success: false,
                error: errObj,
            });
            setDialog({
                ...dialog,
                open: true,
                title: t('clusterRestartFailedTitle'),
                content: t('clusterRestartFailedContent'),
                actionTitle: t('ok'),
                actionFn: handleDialogOnClose,
                cancelActTitle: '',
                cancelActFn: handleDialogOnClose,
            });
            setIsLock(false);
            dispatch(updateProgressBar(false));
            dispatch(toggleSnackBar(t('rebootFailTitle')));
        });
    };

    const handleConfirmOnClick = () => {
        setDialog({
            ...dialog,
            open: true,
            title: t('warningTitle'),
            content: t('warningContent'),
            actionTitle: t('dialogButtonLbl'),
            actionFn: () => {
                handleDialogOnClose();
                handleReboot();
            },
            cancelActTitle: t('dialogCancelLbl'),
            cancelActFn: handleDialogOnClose,
        })
    };

    const handleDialogOnClose = () => {
        setDialog({
            ...dialog,
            open: false,
        });
    };

    const headerLabel = (content, sorted) => (
        <div
            style={{
                color: sorted ? 'rgb(0, 0, 0)' : 'rgba(0, 0, 0, 0.54)',
                fontSize: '0.75rem',
            }}
        >
            {content}
        </div>
    );
    const Headers = [
        {
            id: 'hostname',
            HeaderLabel: headerLabel(t('hostname'), sortingSettings.sortBy === 'hostname'),
            isSorted: sortingSettings.sortBy === 'hostname',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        },
        {
            id: 'mac',
            HeaderLabel: headerLabel(t('mac'), sortingSettings.sortBy === 'mac'),
            isSorted: sortingSettings.sortBy === 'mac',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        },
        {
            id: 'model',
            HeaderLabel: headerLabel(t('model'), sortingSettings.sortBy === 'model'),
            isSorted: sortingSettings.sortBy === 'model',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        },
        {
            id: 'fwVersion',
            HeaderLabel: headerLabel(t('version'), sortingSettings.sortBy === 'fwVersion'),
            isSorted: sortingSettings.sortBy === 'fwVersion',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        },
        {
            id: 'status',
            HeaderLabel: headerLabel(t('status')),
            isSorted: sortingSettings.sortBy === 'status',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        },
    ];

    let hasUnreachable = false;
    tableData.forEach((row) => {
        if (rebootStatus.rebootClicked) {
            const getStatusContent = (status) => {
                return (
                    <div
                        style={{
                            color: colors[status.status],
                            fontWeight: 'bold',
                        }}
                    >
                        {status.message}
                    </div>
                );
            };

            const status = {};
            if (rebootStatus.success) {
                status.status = 'success';
                status.message = t('success');
            } else if (rebootStatus.error) {
                const {error} = rebootStatus;
                if (error[row[4].id].success) {
                    status.status = 'success';
                    status.message = t('success');
                } else {
                    status.status = 'error';
                    status.message = `${t('success')}: ${rebootErrorDeterminer(error[row[4].id].error, t)}`;
                }
            } else {
                status.status = 'rebooting';
                status.message = t('rebooting');
            }
            row[4].ctx = getStatusContent(status);
        }
        if (row[4].status === 'unreachable') {
            hasUnreachable = true;
        }
    });

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
                <Button
                    id="rebootBtn"
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={handleConfirmOnClick}
                    style={{
                        float: 'right',
                        marginRight: '10px',
                        marginTop: '15px',
                        marginBottom: '20px',
                    }}
                    disabled={tableData.length === 0 || hasUnreachable}
                >
                    <i
                        className="material-icons"
                        style={{fontSize: '16px', paddingRight: '3px'}}
                    >
                        power_settings_new
                    </i>
                    {t('rebootLbl')}
                </Button>
                <Button
                    id="refreshBtn"
                    variant="contained"
                    color="primary"
                    size="small"
                    style={{
                        float: 'right',
                        marginRight: '10px',
                        marginTop: '15px',
                        marginBottom: '20px',
                    }}
                    onClick={onReset}
                >
                    <i
                        className="material-icons"
                        style={{fontSize: '16px', paddingRight: '3px'}}
                    >
                        refresh
                    </i>
                    {t('refreshLbl')}
                </Button>
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
            <LockLayer display={isLock} />
        </Grid>
    );
};

MeshWideMaintenanceReboot.propTypes = {
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

export default MeshWideMaintenanceReboot;
