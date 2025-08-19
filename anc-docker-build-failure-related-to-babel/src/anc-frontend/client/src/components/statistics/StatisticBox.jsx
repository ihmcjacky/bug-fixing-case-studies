import React, {useState, useEffect} from 'react';
import {useSelector, useDispatch} from 'react-redux';
import PropTypes from 'prop-types'
import {useTranslation} from 'react-i18next';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Card from '@material-ui/core/Card';
import P2Dialog from '../common/P2Dialog';
import LockLayer from '../common/LockLayer';
import StatisticControllPannel from './StatisticControllPannel';
import StatisticContent from './StatisticContent';
import StatisticDetailView from './StatisticDetailView';
import useStatWorker from './useStatWorker';
import StatisticConstants from '../../constants/statistic';
import {toggleSnackBar} from '../../redux/common/commonActions';

const {
    interfaceOpt, timeRangeOpt, intervalOpt,
    dataUnitOpt, packetUnitOpt,
    radioInterface, radioStatisticOpt,
    viewArr, defaultSelectedInterface,
    interfaceOrder,
} = StatisticConstants;

let tempOnView;

const useStyles = makeStyles({
    plannelRoot: {
        margin: '20px 20px 10px 20px',
        overflowY: 'auto',
        padding: '10px 15px',
    },
});

const StatisticBox = (props) => {
    const {ip, hostname, close} = props;
    const classes = useStyles();
    const {t, ready} = useTranslation('node-statistic');
    const {
        graphData, normalzieRef,
        interfaceStatus,
        startStatPolling,
        startNormalzie,
        restartPollingInterval,
        updateTimeRange,
        exportCsv,
        exportNormalzieCsv,
        exportFullPageCsv,
    } = useStatWorker(ip, hostname);

    const dispatch = useDispatch();
    const {nodeInfo} = useSelector(store => store.meshTopology);

    const [lock, setLock] = useState(true);
    const [selectedInterface, setSelectedInterface] = useState(
        defaultSelectedInterface[nodeInfo[ip].model] || defaultSelectedInterface.unlistedModel
    );
    const [ifOpt, setIfOpt] = useState(interfaceOpt);
    const [statisitcSupport, setStatisticSupport] = useState({
        txBytes: true,
        rxBytes: true,
        txPackets: true,
        rxPackets: true,
    });
    const [selectedTimeRange, setSelectedTimeRange] = useState(timeRangeOpt[0]);
    const [selectedStatistic, setSelectedStatistic] = useState(['txBytes', 'rxBytes']);
    const [selectedInterval, setSelectedInterval] = useState(intervalOpt[0]);
    const [onView, setOnView] = useState(viewArr[1]);
    const [dataUnit, setDataUnit] = useState(dataUnitOpt[0]);
    const [packetUnit, setPacketUnit] = useState(packetUnitOpt[0]);
    const [detailViewOpen, setDetailViewOpen] = useState(false);
    const [initFailDialog, setInitFailDialog] = useState(false);
    const [exportCsvErrorDialog, setExportCsvErrorDialog] = useState({
        open: false,
        title: '',
        content: '',
    });

    const handleInterfaceChange = (event) => {
        setSelectedInterface(event.target.value);
        if (!event.target.value.some(opt=> radioInterface.includes(opt))) {
            setSelectedStatistic(selectedStatistic.filter(stat => !radioStatisticOpt.includes(stat)));
        }
    };
    const handleTimeChange = (event) => {
        const time = event.target.value;
        updateTimeRange(time);
        setSelectedTimeRange(time);
    };
    const handleStatisticChange  = (event) => {
        setSelectedStatistic(event.target.value);
    };
    const handleIntervalChange = (event) => {
        const time = event.target.value;
        restartPollingInterval(time);
        setSelectedInterval(time);
    };
    const handleChangeUnit  = (event) => {
        setDataUnit(event.target.value);
    };
    const handleChangePacketUnit  = (event) => {
        setPacketUnit(event.target.value);
    };
    const handleExportError = (res) => {
        if (!res.status) {
            let title = t('getExportDataFailTitle');
            let content = t('getExportDataFailContent');
            if (res.error === 'allEmpytDataErr') {
                title = t('noExportDataFailTitle');
                content = t('noExportDataFailContent');
            }
            setExportCsvErrorDialog({
                open: true,
                title,
                content,
            });
        }
        setLock(false);
    };
    const handleChangeView = (event, type) => {
        if (type === 'export') {
            setLock(true);
            const exportSuccessCallback = () => {
                dispatch(toggleSnackBar(t('downloadCompleted')));
            }

            if (onView === 'normalzie') {
                exportNormalzieCsv(dataUnit, packetUnit, selectedInterface, selectedStatistic, exportSuccessCallback).then(handleExportError);
            } else {
                exportCsv(dataUnit, packetUnit, selectedInterface, selectedStatistic, exportSuccessCallback).then(handleExportError);
            }
            return;
        }
        if (type === 'detail') {
            tempOnView = onView;
            setDetailViewOpen(true);
        }
        if (type === 'normalzie') {
            startNormalzie();
        }
        setOnView(type);
    };

    const didmountFunc = () => {
        startStatPolling().then((firstData) => {
            if (firstData.success) {
                const defaultInterface = [];
                const _ifOpt = [];
                const {status, supportList} = firstData.data;
                Object.keys(status).forEach((interfaceName) => {
                    const ifDisabled = status[interfaceName] === '2';
                    if (!ifDisabled && defaultInterface.length < 2) {
                        defaultInterface.push(interfaceName);
                    }
                    _ifOpt.push({
                        key: interfaceName,
                        enable: !ifDisabled,
                    });
                });
                _ifOpt.sort((a, b) => {
                    return interfaceOrder[a.key] - interfaceOrder[b.key];
                });
                setSelectedInterface(defaultInterface);
                setIfOpt(_ifOpt);
                setStatisticSupport({
                    ...statisitcSupport,
                    ...supportList,
                });
                setLock(false);
            } else {
                setInitFailDialog(true);
            }
        });
    }

    useEffect(didmountFunc, []);

    if (!ready) {
        return (
            <div className={classes.wrapper}>
                <Card classes={{root: classes.plannelRoot}} />
            </div>
        );
    }
    return (
        <div>
            <Card classes={{root: classes.plannelRoot}}>
                <StatisticControllPannel
                    t={t}
                    onView={onView}
                    handleChangeView={handleChangeView}
                    // interfaceStatus={interfaceStatus}
                    interfaceOpt={ifOpt}
                    statisitcSupport={statisitcSupport}
                    interfaceSelect={{selectedInterface, handleInterfaceChange}}
                    timeSelect={{selectedTimeRange, handleTimeChange}}
                    statisticSelect={{selectedStatistic, handleStatisticChange}}
                    intervalSelect={{selectedInterval, handleIntervalChange}}
                    unitSelect={{
                        data: {dataUnit, handleChangeUnit},
                        packet: {packetUnit, handleChangePacketUnit},
                    }}
                />
                <StatisticContent
                    t={t}
                    interfaceStatus={interfaceStatus}
                    statisitcSupport={statisitcSupport}
                    onView={onView}
                    graphData={graphData}
                    normalzieRef={normalzieRef}
                    dataUnit={dataUnit}
                    packetUnit={packetUnit}
                    selectedInterface={selectedInterface}
                    selectedStatistic={selectedStatistic}
                />
            </Card>
            <StatisticDetailView
                t={t}
                open={detailViewOpen}
                handleClose={() => {
                    setDetailViewOpen(false);
                    setOnView(tempOnView);
                }}
                hostname={hostname}
                graphData={graphData}
                interfaceList={ifOpt}
                dataUnit={dataUnit}
                packetUnit={packetUnit}
                exportFullPageCsv={(unitObj, selectedInterface) => {
                    const downloadSuccessCallback = () => {
                        dispatch(toggleSnackBar(t('downloadCompleted')));
                    }
                    exportFullPageCsv(unitObj, selectedInterface, downloadSuccessCallback).then(handleExportError);
                }}
            />
            <LockLayer
                display={lock}
                left={false}
            />
            <P2Dialog
                open={initFailDialog}
                handleClose={() => { setInitFailDialog(false); }}
                title={t('getNodeFailTitle')}
                content={t('getNodeFailContent')}
                actionTitle={t('ok')}
                actionFn={close}
            />
            <P2Dialog
                open={exportCsvErrorDialog.open}
                handleClose={() => { setExportCsvErrorDialog({...exportCsvErrorDialog, open: false}); }}
                title={exportCsvErrorDialog.title}
                content={exportCsvErrorDialog.content}
                actionTitle={t('ok')}
                actionFn={() => { setExportCsvErrorDialog({...exportCsvErrorDialog, open: false}); }}
            />
        </div>
    );
};

StatisticBox.propTypes = {
    ip: PropTypes.string.isRequired,
    hostname: PropTypes.string.isRequired,
    close: PropTypes.func.isRequired,
};

export default StatisticBox;
