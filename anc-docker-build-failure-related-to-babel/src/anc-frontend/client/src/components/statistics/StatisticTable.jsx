import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import P2Tooltip from '../../components/common/P2Tooltip';
import StatisticConstants from '../../constants/statistic';

const {
    byteStatisticOpt,
    statisticOpt,
    bytesToNumMap, packetToNumMap,
} = StatisticConstants;

const styles = {
    wrapper: {
        width: '100%',
        marginTop: '15px',
    },
    table: {
        width: '100%',
        display: 'block',
        overflowX: 'auto',
        minWidth: '80%',
        marginTop: '10px',
    },
    headCell: {
        width: '130px',
        paddingLeft: '0px',
        paddingRight: '0px',
        // paddingTop: '20px',
        // paddingBottom: '20px',
        color: 'rgba(0, 0, 0, 0.54)',
        fontSize: '0.75rem',
        fontWeight: 500,
        textAlign: 'center',
        '&:last-child': {
            paddingRight: '0px',
        },
    },
    firstHeadCell: {
        color: 'rgba(0, 0, 0, 0.54)',
        fontSize: '0.75rem',
        fontWeight: 500,
        width: '10%',
        paddingLeft: '0px',
        paddingRight: '0px',
        // paddingTop: '20px',
        // paddingBottom: '20px',
        textAlign: 'center',
        '&:last-child': {
            paddingRight: '0px',
        },
    },
    cellRoot: {
        width: '130px',
        paddingLeft: '0px',
        paddingRight: '0px',
        // paddingTop: '20px',
        // paddingBottom: '20px',
        textAlign: 'center',
        '&:last-child': {
            paddingRight: '0px',
        },
    },
};
const useStyles = makeStyles(styles);

const numberWithCommas = function (numStr, unitNum,  unit) {
    if (typeof numStr !== 'undefined') {
        const num = Number(Number(parseInt(numStr, 10) / unitNum).toFixed(2), 10);
        return `${num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')} ${unit}`;
    }
    return '-';
};

const StatisticTable = (props) => {
    const {
        t,
        data,
        dataUnit, packetUnit,
        interfaceStatus,
        statisitcSupport,
    } = props;
    const classes = useStyles();
    const header = [];
    const allRow = {
        txBytes: [],
        rxBytes: [],
        rxPackets: [],
        txPackets: [],
        txRetries: [],
        rxErrors: [],
        txDropped: [],
        rxDropped: [],
    };

    function creatTableCell(key, content, isHead) {
        return (
            <TableCell
                key={key}
                classes={{root: isHead ? classes.headCell : classes.cellRoot}}
            >
                {content}
            </TableCell>
        );
    }

    function creatNotSupportCell(content, title, key) {
        return (
            <P2Tooltip
                direction="top"
                title={title}
                content={content}
                key={key}
            />
        );
    };

    Object.keys(data).sort().forEach(interfaceName => {
        header.push(creatTableCell(`head-${interfaceName}`, t(`${interfaceName}Space`),));

        const interfaceStat = data[interfaceName];
        const isOpen = interfaceStatus[interfaceName] !== '2';
        statisticOpt.forEach((opt) => {
            if (statisitcSupport[opt]) {
                const dataExist = isOpen && interfaceStat[opt];
                const isBytes = byteStatisticOpt.includes(opt);
                const unitNum = isBytes ? bytesToNumMap[dataUnit] : packetToNumMap[packetUnit];
                const unit = isBytes ? dataUnit : `${packetUnit}Unit`;

                allRow[opt].push(
                    creatTableCell(`${interfaceName}-${opt}`, dataExist ?
                        numberWithCommas(interfaceStat[opt], unitNum, t(unit)) : t('N/A'))
                );
            } else {
                allRow[opt].push(
                    creatNotSupportCell(t('N/A'), t('notSupport'), `${interfaceName}-${opt}`)
                );
            }
        });
    });
    return (
        <div className={classes.wrapper}>
            <Table className={classes.table}>
                <TableHead>
                    <TableRow>
                        <TableCell classes={{root: classes.firstHeadCell}}>
                            {t('interface')}
                        </TableCell>
                        {header}
                    </TableRow>
                </TableHead>
                <TableBody>
                    {Object.keys(allRow).map(opt => (
                        <TableRow key={`row-${opt}`}>
                            <TableCell
                                key={`start-${opt}`}
                                component="th"
                                scope="row"
                                classes={{root: classes.cellRoot}}
                            >
                                {t(opt)}
                            </TableCell>
                            {allRow[opt]}
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

StatisticTable.propTypes = {
    t: PropTypes.func.isRequired,
    data: PropTypes.objectOf(PropTypes.oneOfType([
        PropTypes.objectOf(PropTypes.number), PropTypes.objectOf(PropTypes.string)
    ])).isRequired,
    dataUnit: PropTypes.string.isRequired,
    packetUnit: PropTypes.string.isRequired,
    interfaceStatus: PropTypes.objectOf(PropTypes.string).isRequired,
    statisitcSupport: PropTypes.objectOf(PropTypes.bool).isRequired,
};

export default StatisticTable;
