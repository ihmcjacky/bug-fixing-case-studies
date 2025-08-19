/**
 * @ Author: Kyle Suen
 * @ Create Time: 2020-02-10 13:24:57
 * @ Modified by: Kyle Suen
 * @ Modified time: 2020-12-30 16:04:40
 * @ Description:
 */

import React, {useState} from 'react';
import {useSelector} from 'react-redux';
import PropTypes from 'prop-types';
import {useTranslation} from 'react-i18next';
import {
    Card,
    CardContent,
    CardActions,
    Button,
    Typography,
    Select,
    MenuItem,
    ListItemText,
    FormControl,
    InputLabel,
    TextField,
    Input,
    Checkbox,
} from '@material-ui/core';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import P2Table from '../../../components/common/P2Table';
import P2PointsToNote from '../../../components/nodeMaintenances/P2PointsToNote';
import P2SearchBar from '../../../components/common/P2SearchBar';
import P2Dialog from '../../../components/common/P2Dialog';
import Constant from '../../../constants/common';
import LockLayer from '../../../components/common/LockLayer';
import useSystemLogExport from '../../../components/common/useSystemLogExport';
import { useEffect } from 'react';
const tblHeaders = {
    parentHeaders: [],
    Headers: [
        {
            header: 'hostname',
            headerLabel: 'Hostname',
            canSort: true,
        },
        {
            header: 'mac',
            headerLabel: 'MAC',
            canSort: true,
        },
        {
            header: 'model',
            headerLabel: 'MODEL',
            canSort: true,
        },
        {
            header: 'firmwareVersion',
            headerLabel: 'VERSION',
            canSort: true,
        },
        {
            header: 'status',
            headerLabel: 'STATUS',
            canSort: true,
        },
    ]
};
const sourceApiList = ['GET /mesh-topology', 'POST /node-info', 'POST /link-info', 'GET /project-list'];

const tblFooter = {
    rowsPerPageOptions: [1, 5, 10, 15, 20],
    helper: <span />,
};

const parseTableData = (tableData) => {
    return tableData.map(node => ({
        id: node[4].id,
        hostname: node[0].ctx,
        mac: node[1].ctx,
        model: node[2].ctx,
        firmwareVersion: node[3].ctx,
        status: node[4].ctx,
    }));
};

const {colors} = Constant;
const useStyles = makeStyles((theme) => ({
    textField: {
        marginLeft: theme.spacing(1),
        marginRight: theme.spacing(1),
        width: 300,
    },
  }));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
      width: 250,
    },
  },
};
const MeshWideLogExport = ({type, refreshFunc, tableData}) => {
    const classes = useStyles();
    const theme = useTheme();
    const {labels} = useSelector((state) => state.common);
    const {t: _t, ready} = useTranslation('exportLog');
    const t = (tKey, options) => _t(tKey, {...labels, ...options}); 
    const {
        exportType, exportLog, setExportType,
        handleSelectClick, handleSelectAllClick,
        dialog, isLock, selectedId,
        selectedDateFrom,
        selectedDateTo,
        selectedApiList,
        setSelectedDateFrom,
        setSelectedDateTo,
        setSelectedApiList
    } = useSystemLogExport({type, t});
    const {
        enableExportAnmRawLog,
    } = useSelector(store => store.devMode);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [currentPage, setCurrentPage] = useState(0);
    const [{sorting, sortBy}, setSortObject] = useState({sortBy: 'hostname', sorting: 'asc'});
    const [searchKey, setSearchKey] = useState('');
    const [helperText, setHelperText] = useState('');
    // const [selectedDateFrom, setSelectedDateFrom] = useState(moment().format('YYYY-MM-DDTHH:mm'));
    // const [selectedDateTo, setSelectedDateTo] = useState(moment().format('YYYY-MM-DDTHH:mm'));
    // const [selectedApiList, setSelectedApiList] = React.useState(sourceApiList);

    // useEffect(
    //     () => {
    //         console.log('selectedDateFrom')
    //         console.log(selectedDateFrom)
    //     }, [selectedDateFrom]
    // );
    useEffect (
        () => {
            if (exportType === 'anmRawLog') {
                const from = new Date(selectedDateFrom).getTime();
                const to = new Date(selectedDateTo).getTime();
                if (from >= to) {
                    setHelperText(t('dateRangeErrorHelperText'))
                } else {
                    setHelperText('')
                }
            }
        }, [selectedDateFrom, selectedDateTo]
    )
    let timeout = 0;

    if (!ready) {
        return <span />;
    }

    const handleDateChange = (type, event) => {
        console.log('handleDateChange');
        console.log(event);
        console.log(event.target.value);
        if (type === 'from' ) {
            setSelectedDateFrom(event.target.value);
        } else {
            setSelectedDateTo(event.target.value);
        }
    };

    const handleSourceApiListChange = (event) => {
        setSelectedApiList(event.target.value);
    };
    
    const handleChangePage = (event, page) => {
        setCurrentPage(page);
    };

    const handleChangeItemsPerPage = (event) => {
        setItemsPerPage(event.target.value);
    };

    const handleRequestSort = (event, property) => {
        let sort = 'asc';
        if (sortBy === property && sorting === 'asc') {
            sort = 'desc';
        }

        setSortObject({
            sortBy: property,
            sorting: sort,
        });
    };

    const handleSearch = (newSearchKey) => {
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(() => {
            setSearchKey(newSearchKey);
        }, 500);
    };

    const sortByHeader = (data) => {
        const sortingFunc = (order, orderBy) => (order === 'desc' ?
            (a, b) => (b[orderBy] < a[orderBy] ? -1 : 1)
            :
            (a, b) => (a[orderBy] < b[orderBy] ? -1 : 1)
        );

        return data.sort(
            sortingFunc(sorting, sortBy)
        );
    };

    const searchData = (Data) => {
        const lowSearchKey = searchKey.toLowerCase();
        if (lowSearchKey === '') {
            return Data;
        }
        return Data.filter(obj =>
            Object.keys(obj).some((key) => {
                if (key === 'id') {
                    return false;
                } else {
                    let included = false;
                    if (typeof obj[key] === 'object') {
                        included = obj[key].props.children.toLowerCase().includes(lowSearchKey);
                    } else if (typeof obj[key] === 'string'){
                        included = obj[key].toLowerCase().includes(lowSearchKey);
                    }
                    return included;
                }
            })
        );
    }

    const shouldExportBtnDisabled = () => {
        if (exportType === 'anmRawLog') {
            const from = new Date(selectedDateFrom).getTime();
            const to = new Date(selectedDateTo).getTime();
            return from >= to;
        }
        return (exportType === 'clusterSpecificNodes' && selectedId.length === 0)
    }

    const restoreTypeSelectMenu = (
        <FormControl
            fullWidth
        >
            <InputLabel>
                {t('logTypes')}
            </InputLabel>
            <Select
                MenuProps={{
                    anchorOrigin: {
                        vertical: "bottom",
                        horizontal: "left"
                    },
                    transformOrigin: {
                        vertical: "top",
                        horizontal: "left"
                    },
                    getContentAnchorEl: null
                }}
                style={{fontSize: '22px',}}
                value={exportType}
                onChange={e => setExportType(e.target.value)}
            >
                <MenuItem value="clusterAllNodes">
                    <ListItemText primary={t('clusterLogFiles')} />
                </MenuItem>
                <MenuItem value="clusterSpecificNodes">
                    <ListItemText primary={t('clusterSpecificNodes')} />
                </MenuItem>
                <MenuItem value="clusterAnmLogs">
                    <ListItemText primary={t('clusterAnmLogs')} />
                </MenuItem>
                {
                    enableExportAnmRawLog ? (
                        <MenuItem value="anmRawLog">
                            <ListItemText primary={t('anmRawLog')} />
                        </MenuItem>
                    ) : null
                }
            </Select>
        </FormControl>
    );


    return (
        <Card style={{background: colors.background}} elevation={0}>
            <CardContent
                style={{
                    height: 'calc(100vh - 278px)',
                    overflowY: 'auto',
                    padding: '0 52px 0 52px',
                }}
            >
                <P2PointsToNote
                    noteTitle={t('noteTitle')}
                    noteCtxArr={[
                        {ctx: t('exportLogNote1'), key: t('exportLogNote1')},
                        {ctx: t('exportLogNote2'), key: t('exportLogNote2')},
                    ]}
                />
                <Typography style={{padding: "20px 0px", fontSize: '20px'}}>
                    {t('exportHeading')}
                </Typography>
                {restoreTypeSelectMenu}
                {exportType === 'clusterSpecificNodes' &&
                    <div style={{paddingTop: '30px'}}>
                        <P2SearchBar
                            onRequestSearch={handleSearch}
                            disableCloseButton
                        />
                        <div style={{paddingTop: '20px'}}>
                            <P2Table
                                tblHeaders={{...tblHeaders, sortBy, sorting}}
                                tblFooter={{...tblFooter, itemsPerPage, currentPage}}
                                tblFunction={{
                                    handleSelectClick,
                                    handleSelectAllClick,
                                    handleChangePage,
                                    handleChangeItemsPerPage,
                                    handleRequestSort,
                                }}
                                tblSelector={{
                                    selectedId,
                                }}
                                tblToggle={{
                                    enableSort: true,
                                    enableFooter: true,
                                    enableHeader: true,
                                    enableSelect: true,
                                }}
                                tblData={searchData(sortByHeader(parseTableData(tableData)))}
                            />
                        </div>
                    </div>
                }
                {
                    exportType === 'anmRawLog' &&
                    <div style={{paddingTop: '30px'}}>
                        <div style={{paddingLeft: '10px'}}>
                            <TextField
                                id="from"
                                type="datetime-local"
                                label="From"
                                // defaultValue={new Date().toDateString()}
                                value={selectedDateFrom}
                                className={classes.textField}
                                InputLabelProps={{
                                shrink: true,
                                }}
                                onChange={(e) => handleDateChange('from', e)}
                            />
                            <TextField
                                id="to"
                                label="To"
                                type="datetime-local"
                                // defaultValue={new Date().toDateString()}
                                value={selectedDateTo}
                                className={classes.textField}
                                InputLabelProps={{
                                shrink: true,
                                }}
                                onChange={(e) => handleDateChange('to', e)}
                            />
                        </div>
                        <div style={{fontSize: '10px', marginLeft: '20px', marginTop: '5px', color: 'red', }}>{helperText}</div>
                        <div style={{paddingLeft: '18px', paddingTop: '30px'}}>
                            <FormControl fullWidth className={classes.formControl}>
                                <InputLabel id="source-api">API type</InputLabel>
                                <Select
                                    labelId="source-api"
                                    id="source-api-list"
                                    multiple
                                    value={selectedApiList}
                                    onChange={handleSourceApiListChange}
                                    renderValue={(selected) => selected.join(', ')}
                                    input={<Input />}
                                    MenuProps={MenuProps}
                                >
                                    {sourceApiList.map((sourceApi) => (
                                        <MenuItem key={sourceApi} value={sourceApi}>
                                            <Checkbox checked={selectedApiList.indexOf(sourceApi) > -1} />
                                            <ListItemText primary={sourceApi} />
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        </div>
                    </div>
                }
            </CardContent>
            <CardActions style={{padding: '30px', paddingRight: '52px'}}>
                <div style={{flex: 1}} />
                <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={exportLog}
                    disabled={shouldExportBtnDisabled()}
                >
                    {t('exportLbl')}
                </Button>
            </CardActions>
            <P2Dialog
                open={dialog.open}
                handleClose={dialog.handleClose}
                title={t(dialog.title)}
                content={t(dialog.content)}
                actionTitle={t(dialog.submitButton)}
                actionFn={dialog.submitAction}
                cancelActTitle={t(dialog.cancelButton)}
                cancelActFn={dialog.cancelAction}
            />
            <LockLayer
                display={isLock}
                top={0}
                left={0}
                zIndex={200}
                opacity={1}
                color={colors.lockLayerBackground}
                hasCircularProgress
            />
        </Card>
    );
};

MeshWideLogExport.propTypes = {
    type: PropTypes.string.isRequired,
    refreshFunc: PropTypes.func.isRequired,
    tableData: PropTypes.arrayOf(
        PropTypes.arrayOf(PropTypes.shape({
            type: PropTypes.string,
            ctx: PropTypes.oneOfType([
                PropTypes.string,
                PropTypes.element,
            ]),
        })),
    ).isRequired,
};

export default MeshWideLogExport;

