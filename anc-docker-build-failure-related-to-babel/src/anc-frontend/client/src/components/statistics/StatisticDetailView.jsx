import React, {useEffect, useState} from 'react';
import PropTypes from 'prop-types';
import Dialog from '@material-ui/core/Dialog';
import TransitionEff from '../common/Transition';
import StatisticDetailContent from './StatisticDetailContent';
import CommonConstants from '../../constants/common';
import StatisticConstants from '../../constants/statistic';

const {byteStatisticOpt} = StatisticConstants;
const {colors} = CommonConstants;

const StatisticDetailView = (props) => {
    const {
        t,
        open, handleClose,
        hostname,
        interfaceList,
        graphData,
        exportFullPageCsv,
    } = props;
    const [dataUnit, setDataUnit] = useState({});
    const [packetUnit, setPacketUnit] = useState({});


    const didmountFunc = () => {
        if (open) {
            const interfaceRef = graphData[graphData.length - 1].interface;
            const dataUnitInit = {
                hasChange: false,
            };
            const packetUnitInit = {
                hasChange: false,
            };
            Object.keys(interfaceRef).sort().forEach((interfaceName) => {
                Object.keys(interfaceRef[interfaceName]).forEach((statName) => {
                    if (byteStatisticOpt.includes(statName)) {
                        dataUnitInit[`${interfaceName}-${statName}`] = 'bytes';
                    } else {
                        packetUnitInit[`${interfaceName}-${statName}`] = 'packets';
                    }
                });
            });
            setDataUnit(dataUnitInit);
            setPacketUnit(packetUnitInit);
        }
    }
    useEffect(didmountFunc, [open]);

    return (
        <Dialog
            fullScreen
            open={open}
            onClose={handleClose}
            TransitionComponent={TransitionEff}
            PaperProps={{
                style: {
                    background: colors.background,
                    overflowY: 'hidden',
                }
            }}
        >
            <StatisticDetailContent
                t={t}
                hostname={hostname}
                handleClose={handleClose}
                interfaceList={interfaceList}
                graphData={graphData}
                dataUnitInit={dataUnit}
                packetUnitInit={packetUnit}
                exportFullPageCsv={exportFullPageCsv}
            />
        </Dialog>
    );
};

StatisticDetailView.propTypes = {
    t: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    hostname: PropTypes.string.isRequired,
    handleClose: PropTypes.func.isRequired,
    interfaceList: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        enable: PropTypes.bool.isRequired,
    })).isRequired,
    graphData: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        interface: PropTypes.objectOf(PropTypes.objectOf(PropTypes.string)),
        timestamp: PropTypes.string,
    })).isRequired,
    exportFullPageCsv: PropTypes.func.isRequired,
};

export default StatisticDetailView;
