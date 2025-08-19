import React, {useState} from 'react';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Button from '@material-ui/core/Button';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Grid from '@material-ui/core/Grid';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import LockLayer from '../../../components/common/LockLayer';
import InvalidConfigContainer from '../../../components/common/InvalidConfigContainer';
import P2DevTbl from '../../../components/common/P2DevTbl';
import P2Dialog from '../../../components/common/P2Dialog';
import P2FileUpload from '../../../components/common/P2FileUpload';
import P2PointsToNote from '../../../components/nodeMaintenances/P2PointsToNote';

const useStyles = makeStyles({
    root: {
        flexGrow: 1,
        paddingLeft: 52,
        paddingRight: 52,
        width: '100%',
    },
});

const MeshWideMaintenanceRestore = (props) => {
    const {
        tableData,
        refreshFunc,
    } = props;
    const {t, ready} = useTranslation('cluster-maintenance-config-restore');
    const classes = useStyles();

    const [isLock, setIsLock] = useState(false);
    const [disableRestore, setDisableRestore] = useState(false);
    const [disabledRefresh, setDisabledRefresh] = useState(false);
    const [restoreType, setRestoreType] = useState('meshOnly');
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
    const [fileSelect, setFileSelect] = useState({
        lock: false,
        file: '',
        fileName: '',
        fileSize: '',
    });
    const [dialog, setDialog] = useState({
        open: false,
        title: '',
        content: '',
        actionTitle: t('ok'),
        actionFn: () => {},
        cancelActTitle: '',
        cancelActFn: () => {},
        disableBackdropClick: true,
        disableEscapeKeyDown: true,
    });

    if (!ready) return <span />;

    const handleSearch = (event) => {
        setSearchBar({searchKey: event});
    };

    const handleinitiateSearch = () => {
        setSearchBar({searchKey: ''});
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

    const handleDialogOnClose = () => {
        setDialog({
            ...dialog,
            open: false,
        });
    };

    const handleRestoreTypeRadioChange = (event) => {
        const restoreType = event.target.value;
        setRestoreType(restoreType);
    }

    const handleConfirmOnClick = () => {

    };

    const selectFileHandler = () => {

    };

    const onReset = () => {
        refreshFunc();
        setSearchBar({searchKey: ''});
        setPageSettings({
            ...pageSettings,
            currentPage: 0,
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
            HeaderLabel: headerLabel(t('hstnmeHdr'), sortingSettings.sortBy === 'hostname'),
            isSorted: sortingSettings.sortBy === 'hostname',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        },
        {
            id: 'mac',
            HeaderLabel: headerLabel(t('macHdr'), sortingSettings.sortBy === 'mac'),
            isSorted: sortingSettings.sortBy === 'mac',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        },
        {
            id: 'model',
            HeaderLabel: headerLabel(t('modelHdr'), sortingSettings.sortBy === 'model'),
            isSorted: sortingSettings.sortBy === 'model',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        },
        {
            id: 'fwVersion',
            HeaderLabel: headerLabel(t('fwVerHdr'), sortingSettings.sortBy === 'fwVersion'),
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

    const restoreTypeCell = [];

    if (restoreType === 'all') {
        Headers.push({
            id: 'restore',
            HeaderLabel: headerLabel(t('restoreFromLbl'), sortingSettings.sortBy === 'restore'),
            isSorted: sortingSettings.sortBy === 'restore',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        });
        Headers.push({
            id: 'action',
            HeaderLabel: headerLabel(t('actionLbl'), sortingSettings.sortBy === 'action'),
            isSorted: sortingSettings.sortBy === 'action',
            sortType: sortingSettings.orderBy,
            canSort: true,
            width: 'auto',
        });
    }

    tableData.forEach((row, index) => {
        restoreTypeCell.push([]);
        if (restoreType === 'all') {
            restoreTypeCell[index].push({
                type: 'string',
                ctx: 'temp restore',
            });
            restoreTypeCell[index].push({
                type: 'string',
                ctx: 'temp action',
            });
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
                noteCtxArr={t('noteCtxArr', {returnObjects: true})}
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
                tblData={tableData.map((row, index) => {
                    return [...row, ...restoreTypeCell[index]];
                })}
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
            <RadioGroup
                id="restoreType"
                aria-label="restoreType"
                name="restoreType"
                value={restoreType}
                onChange={handleRestoreTypeRadioChange}
                style={{
                    margin: '10px 0px 10px 0px',
                    display: 'flex',
                    flexDirection: 'row',
                    // width: '100%',
                    // justifyContent: 'center',
                }}
            >
                <FormControlLabel
                    value="meshOnly"
                    control={<Radio color="primary" style={{height: '36px'}} />}
                    label={<div
                        dangerouslySetInnerHTML={{__html: t('restoreRadioDialogContentMesh')}}
                    />}
                    style={{marginRight: '10vw'}}
                    disabled={fileSelect.lock}
                />
                <FormControlLabel
                    value="all"
                    control={<Radio color="primary" style={{height: '36px'}} />}
                    label={<div
                        dangerouslySetInnerHTML={{__html: t('restoreRadioDialogContentAll')}}
                    />}
                    style={{marginRight: '10vw'}}
                    disabled={fileSelect.lock}
                />
            </RadioGroup>
            <div style={{marginTop: '10px', width: '100%'}}>
                <P2FileUpload
                    inputId="configFile"
                    selectFileHandler={selectFileHandler}
                    fileName={fileSelect.fileName}
                    disabledSelectFile={fileSelect.lock}
                    fileSize={fileSelect.fileSize}
                    placeholder={t('fileUpPlaceholder')}
                    acceptType=".config"
                />
            </div>
            <div style={{marginTop: '10px', width: '100%'}}>
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
                    onClick={handleConfirmOnClick}
                    disabled={disableRestore}
                >
                    <i
                        className="material-icons"
                        style={{fontSize: '16px', paddingRight: '3px'}}
                    >
                        restore
                    </i>
                    {t('restoreButtonLabel')}
                </Button>
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
                    onClick={onReset}
                    disabled={disabledRefresh}
                >
                    <i
                        className="material-icons"
                        style={{fontSize: '16px', paddingRight: '3px'}}
                    >
                        refresh
                    </i>
                    {t('resetButtonLabel')}
                </Button>
            </div>
            <LockLayer display={isLock} />
            <P2Dialog
                open={dialog.open}
                handleClose={handleDialogOnClose}
                title={dialog.title}
                content={dialog.content}
                actionTitle={dialog.actionTitle}
                actionFn={dialog.actionFn}
                cancelActTitle={dialog.cancelActTitle}
                cancelActFn={dialog.cancelActFn}
                disableBackdropClick={dialog.disableBackdropClick}
                disableEscapeKeyDown={dialog.disableEscapeKeyDown}
            />
        </Grid>
    );
};

MeshWideMaintenanceRestore.propTypes = {
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

export default MeshWideMaintenanceRestore;
