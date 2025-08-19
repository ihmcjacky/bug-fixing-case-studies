import React,{ useState, useEffect } from 'react';
import {useDispatch, useSelector} from 'react-redux';
import {useTranslation} from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Input from '@material-ui/core/Input';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import SettingsIcon from '@material-ui/icons/Settings';
import {getNetworkEvent, getHistoricalData} from '../../util/apiCall';
import SearchIcon from '@material-ui/icons/Search';
import {
    closeNetworkEventCenter,
    setNetworkEventTableData,
    setNetworkEventTableMetaData,
    setNetworkEventSearchKeyword,
    openExportNetworkEventDialog,
} from '../../redux/networkEventCenter/networkEventActions';
import NetworkEventTable from './NetworkEventTable';
import Slide from '@material-ui/core/Slide';
import FormControl from '@material-ui/core/FormControl';
import InputAdornment from '@material-ui/core/InputAdornment';
import {ReactComponent as ExportIcon} from '../../icon/svg/ic_export.svg';
import ExportNetworkEventLogDialog from './ExportNetworkEventLogDialog';

const useStyles = makeStyles({
    closeButton: {
        position: 'absolute',
        right: '5px',
        top: '5px',
    },
    root: {
        margin: 0
    },
    searchBar: {
        margin: '10px',
    },
    searchBarElem: {
        margin: '20px',
    },
    wrapper: {
        padding: '0 52px',
    }
});


const NetworkEventCenter = (props) => {
    const {labels} = useSelector((state) => state.common);
    const {t: _t, ready} = useTranslation('cluster-maintenance-network-event');
    const t = (tKey, options) => _t(tKey, {...labels, ...options}); 
    const classes = useStyles();
    const {
        page, rowsPerPage, sort, searchKeyword
    } = useSelector(store => store.networkEventReducer);
    const {
        csrf
    } = useSelector(state => state.common);
    const projectId = useSelector(store => store.projectManagement.projectId);
    const dispatch = useDispatch();

    const handleOnEnter = () => {
        const filter = {
            projectId,
            limit: rowsPerPage,
            skip: page * rowsPerPage,
            sort,
            searchKeyword,
        };
        getNetworkEvent(csrf, projectId, {data: filter}).then(
            (res) => {
                console.log('getNetworkEvent');
                console.log(res);
                dispatch(setNetworkEventTableData(res.eventLogs, res.totalCount));
            },
            (e) => {console.log(e)}
        );
    }
    
    const handleClearSearch = () => {
        dispatch(setNetworkEventSearchKeyword(''));
        const filter = {
            projectId,
            limit: rowsPerPage,
            skip: page * rowsPerPage,
            sort,
            searchKeyword: '',
        };
        getNetworkEvent(csrf, projectId, {data: filter}).then(
            (res) => {
                console.log('getNetworkEvent');
                console.log(res);
                dispatch(setNetworkEventTableData(res.eventLogs, res.totalCount));
            },
            (e) => {console.log(e)}
        );
    }


    useEffect(() => {
        handleOnEnter();
    }, [page, rowsPerPage, sort]);


    const handleSearchKeyDown = (event) => {
        if (event.key === 'Enter') {
            handleOnEnter();
        }
    };

    return (
        <div className={classes.wrapper}>
            <ExportNetworkEventLogDialog />
            <div>
                <div className={classes.searchBar}>
                    <FormControl fullWidth classes={{root: classes.searchBarElem}}>
                        <Input
                            id="search-keyword"
                            disableUnderline
                            value={searchKeyword}
                            onChange={(e) => {
                                dispatch(setNetworkEventSearchKeyword(e.target.value));
                            }}
                            onKeyDown={handleSearchKeyDown}
                            startAdornment={<InputAdornment position="start"><SearchIcon style={{opacity: '0.7'}}/></InputAdornment>}
                            endAdornment={
                                <InputAdornment position="end">
                                    <IconButton
                                        onClick={() => {handleClearSearch()}}
                                    >
                                        <CloseIcon />
                                    </IconButton>
                                    <IconButton
                                        onClick={() => {dispatch(openExportNetworkEventDialog())}}
                                    >
                                        <ExportIcon style={{opacity: '0.7'}}/>
                                    </IconButton>
                                    {/* <IconButton
                                        onClick={() => {}}
                                    >
                                        <SettingsIcon />
                                    </IconButton> */}
                                </InputAdornment>
                            }
                            placeholder={t('searchBarPlaceHolder')}
                            inputProps={{ 'aria-label': 'search' }}
                        />
                    </FormControl>
                </div>
                <NetworkEventTable />
            </div>
        </div>
    );
};

NetworkEventCenter.propTypes = {
    // t: PropTypes.func.isRequired,
    // handleClose: PropTypes.func.isRequired,
};

export default NetworkEventCenter;
