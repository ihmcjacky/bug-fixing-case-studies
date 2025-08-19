
import React, { useRef, useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import TablePagination from '@material-ui/core/TablePagination';
import TableSortLabel from '@material-ui/core/TableSortLabel';
import Tooltip from '@material-ui/core/Tooltip';
import { getNetworkEvent, getHistoricalData } from '../../util/apiCall';
import {
    closeNetworkEventCenter,
    setNetworkEventTableData,
    setNetworkEventTableMetaData,
    setNetworkEventTableSort
} from '../../redux/networkEventCenter/networkEventActions';
import {getEventCell, retrieveHostname} from './eventHelperFunc';
import Constant from '../../constants/common';
import {convertIpToMac, isValidIP} from '../../util/formatConvertor';

const TableCellWithTooltip = ({ className, children }) => {
    return (
        <Tooltip title={children} placement="top" enterDelay={500}>
            <TableCell className={className}>{children}</TableCell>
        </Tooltip>
    );
};

// const TruncatedTableCell = ({ className, children }) => {
//     const cellRef = useRef(null);
//     const contentRef = useRef(null);
//     const [showTooltip, setShowTooltip] = useState(false);
  
//     useEffect(() => {
//       if (cellRef.current && contentRef.current) {
//         // Temporarily remove constraints on content
//         contentRef.current.style.whiteSpace = 'normal';
//         contentRef.current.style.textOverflow = 'clip';
  
//         // Measure the widths
//         const cellWidth = cellRef.current.clientWidth;
//         const contentWidth = contentRef.current.scrollWidth;
  
//         // Reapply constraints on content
//         contentRef.current.style.whiteSpace = 'nowrap';
//         contentRef.current.style.textOverflow = 'ellipsis';
  
//         // Set tooltip visibility
//         setShowTooltip(contentWidth > cellWidth);
//       }
//     }, []);
  
//     return (
//       <Tooltip title={children} placement="top" enterDelay={500} disableHoverListener={!showTooltip}>
//         <TableCell className={className} ref={cellRef}>
//           <div ref={contentRef} style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
//             {children}
//           </div>
//         </TableCell>
//       </Tooltip>
//     );
//   };

const { severityEnumToName, severityEnumToTranslateKey, evtCatTranslateKey, eventTypeTranslateKey } = Constant;
const useStyles = makeStyles({
    table: {
    },
    divider: {
        borderTop: '2px solid rgb(10 1 1 / 12%)',
    },
    dateHeaderCell: {
        width: '180px',
    },
    categoryHeaderCell: {
        width: '180px',
    },
    severityHeaderCell: {
        width: '180px',
    },
    targetDeviceHeaderCell: {
        width: '180px',
    },
    eventHeaderCell: {
        // width: '200px',
    },
    eventDateCell: {
        // maxWidth: '200px', // Set the desired max-width for the data cells
        // overflow: 'hidden',
        // textOverflow: 'ellipsis',
        // whiteSpace: 'nowrap',
        // padding: '16px', // Add padding to match the default TableCell padding
    }
});


function NetworkEventTable() {
    const classes = useStyles();
    const {labels} = useSelector((state) => state.common);
    const {t: _t, ready} = useTranslation('cluster-maintenance-network-event');
    const t = (tKey, options) => _t(tKey, {...labels, ...options});
    const dispatch = useDispatch();
    const { nodeInfo } = useSelector((state) => state.meshTopology);
    const {
        data, page, rowsPerPage, sort, total
    } = useSelector(store => store.networkEventReducer);


    const handleRequestSort = (event, property) => {
        let order = 'asc';
        if (sort[property] && sort[property] === 'asc') {
            order = 'desc';
        }
        const newSort = {
            [property]: order,
        };
        dispatch(setNetworkEventTableSort(newSort));
    };

    const isSortActive = (property) => {
        return sort[property] !== undefined;
    }

    const handleChangePage = (event, newPage) => {
        dispatch(setNetworkEventTableMetaData({
            page: newPage,
            rowsPerPage,
        }))
    };

    const handleChangeRowsPerPage = (event) => {
        dispatch(setNetworkEventTableMetaData({
            page: 0,
            rowsPerPage: parseInt(event.target.value, 10),
        }))
    };

    const getTargetDeviceCell = (row) => {
        if (
            row.targetDevices &&
            row.targetDevices.devices &&
            row.targetDevices.devices.length > 0
        ) {
            return (
                <div>
                    {row.targetDevices.devices.map(
                        (device, idx) => {
                            const node = nodeInfo[device];
                            if (node) {
                                return (
                                    <div key={idx}>
                                        {`${node.hostname} (${node.mac})`}
                                    </div>
                                );
                            } else if (isValidIP(device)) {
                                return (
                                    <div key={idx}>
                                        {`${convertIpToMac(device)}`}
                                    </div>
                                );
                            }
                            return <span />;
                        }
                    )}
                </div>
            );
        }
        return null;
    }

    return (
        <div>
            <TableContainer classes={{ root: classes.table }}>
                <Table aria-label="network event table">
                    <TableHead>
                        <TableRow>
                            <TableCell className={classes.dateHeaderCell}>
                                <TableSortLabel
                                    active={isSortActive('eventLogTime')}
                                    direction={sort['eventLogTime'] !== 'asc' ? 'desc' : 'asc'}
                                    onClick={e => handleRequestSort(e, 'eventLogTime')}
                                >
                                    {t('tableHeaderDate')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className={classes.categoryHeaderCell}>
                                <TableSortLabel
                                    active={isSortActive('eventCategory')}
                                    direction={sort['eventCategory'] !== 'asc' ? 'desc' : 'asc'}
                                    onClick={e => handleRequestSort(e, 'eventCategory')}
                                >
                                    {t('tableHeaderEventCategory')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className={classes.severityHeaderCell}>
                                <TableSortLabel
                                    active={isSortActive('severity')}
                                    direction={sort['severity'] !== 'asc' ? 'desc' : 'asc'}
                                    onClick={e => handleRequestSort(e, 'severity')}
                                >
                                    {t('tableHeaderSeverity')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell className={classes.targetDeviceHeaderCell}>
                                <TableSortLabel
                                    active={isSortActive('targetDevices')}
                                    direction={sort['targetDevices'] !== 'asc' ? 'desc' : 'asc'}
                                    onClick={e => handleRequestSort(e, 'targetDevices')}
                                >
                                    {t('tableHeaderTargetDevice')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell>
                                <TableSortLabel
                                    active={isSortActive('eventType')}
                                    direction={sort['eventType'] !== 'asc' ? 'desc' : 'asc'}
                                    onClick={e => handleRequestSort(e, 'eventType')}
                                >
                                    {t('tableHeaderEventType')}
                                </TableSortLabel>
                            </TableCell>
                            <TableCell  className={classes.eventHeaderCell}>
                                {t('tableHeaderEvent')}
                            </TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {data.map((row, index) => (
                            <TableRow key={row._id} >
                                <TableCell className={index === 0 ? classes.divider : ''}>
                                    {new Date(row.eventLogTime).toLocaleString()}
                                </TableCell>
                                <TableCell className={index === 0 ? classes.divider : ''}>
                                    {t(evtCatTranslateKey[row.eventCategory])}
                                </TableCell>
                                <TableCell className={index === 0 ? classes.divider : ''}>
                                    {t(severityEnumToTranslateKey[severityEnumToName[row.severity]])}
                                </TableCell>
                                <TableCell className={index === 0 ? classes.divider : ''}>{getTargetDeviceCell(row)}</TableCell>
                                <TableCell className={index === 0 ? classes.divider : ''}>
                                    {t(eventTypeTranslateKey[row.eventType])}
                                </TableCell>
                                <TableCell className={`${index === 0 ? classes.divider : ''} ${classes.eventDateCell}`}>
                                    {getEventCell(row, nodeInfo, t)}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>
            <TablePagination
                rowsPerPageOptions={[10, 20, 50, 100]}
                component="div"
                count={total}
                rowsPerPage={rowsPerPage}
                page={page}
                onChangePage={handleChangePage}
                onChangeRowsPerPage={handleChangeRowsPerPage}
                labelRowsPerPage={t('labelRowsPerPage')}
                labelDisplayedRows={({ from, to, count }) => (<span>{t('labelDisplayedRows1')}
                    {from}{t('labelDisplayedRows2')}{to}{t('labelDisplayedRows3')}{count}</span>)}
            />
        </div>
    );
}

export default NetworkEventTable;