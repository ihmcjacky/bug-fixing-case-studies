import React, {useState} from 'react';
import useWindowOnChange from '../../../../components/common/useWindowOnChange';
import LinkInformationTable from './LinkInformationTable';
import LinkDistributionGraph from './LinkDistributionGraph';
import NodeInformation from './NodeInformation';
import MdopInformation from './MdopInformation';
import TopXTrafficLoad from './TopXTrafficLoad';
import ClusterInformation from './ClusterInformation';
import ManagedNodesStatus from './ManagedNodesStatus';
import CommonConstant from '../../../../constants/common';
import DashBoardContestMenu from './DashBoardContestMenu';

const {colors} = CommonConstant;


const DashBoard = (props) => {
    const {height, width} = useWindowOnChange();

    const [menuPosition, setMenuPosition] = useState({
        open: false,
        top: 0,
        left: 0,
        ip: '',
        type: '',
    });

    const handleContextMenuOpen = (event, nodeIp, type) => {
        event.preventDefault();
        setMenuPosition({
            open: true,
            top: event.pageY,
            left: event.pageX,
            ip: nodeIp,
            type,
        });
    };

    const handleContextMenuClose = () => {
        setMenuPosition({
            ...menuPosition,
            open: false,
        });
    }

    return (
        <div
            id="meshTopologyMainWrapper"
            style={{
                padding: '20px',
                display: 'flex',
                overflow: 'auto',
                background: colors.background,
                flexDirection: 'column',
                minWidth: '600px',
                height: `${height - 88}px`, // 48px from appbar and 40px from padding
            }}
        >
            <DashBoardContestMenu
                menuPosition={menuPosition}
                handleContextMenuOpen={handleContextMenuOpen}
                handleContextMenuClose={handleContextMenuClose}
                topologyEventHandler={props.topologyEventHandler}
            />
            <div style={{display: 'flex', background: colors.background}}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            // marginTop: '8px',
                            marginBottom: '10px',
                            width: '100%',
                        }}
                    >
                        <div style={{display: 'flex', flexBasis: '33.33%'}}>
                            <ManagedNodesStatus />
                        </div>
                        <div style={{display: 'flex', flexBasis: '33.33%', margin: '0 20px'}}>
                            <ClusterInformation />
                        </div>
                        <div style={{display: 'flex', flexBasis: '33.33%'}}>
                            <TopXTrafficLoad />
                        </div>
                    </div>
                </div>
                <div style={{display: 'flex', background: colors.background}}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            marginTop: '10px',
                            marginBottom: '10px',
                            width: '100%',
                        }}
                    >
                        <div style={{display: 'flex', flexBasis: '99.99%'}}>
                            <NodeInformation
                                handleContextMenuOpen={handleContextMenuOpen}
                                preloadIcon={props.preloadIcon}
                                maxWidth={width}
                                menuPosition={menuPosition}
                            />
                        </div>
                    </div>
                </div>
                <div style={{display: 'flex', background: colors.background}}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'row',
                            marginTop: '10px',
                            marginBottom: '10px',
                            width: '100%',
                        }}
                    >
                        <div style={{display: 'flex', flexBasis: '99.99%'}}>
                            <MdopInformation
                                handleContextMenuOpen={handleContextMenuOpen}
                                preloadIcon={props.preloadIcon}
                                maxWidth={width}
                                menuPosition={menuPosition}
                            />
                        </div>
                    </div>
                </div>
                <div
                    style={{
                        display: 'flex',
                        background: colors.background,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexBasis: '99.99%',
                            marginTop: '10px',
                            marginBottom: '10px',
                            width: '100%',
                        }}
                    >
                        <LinkDistributionGraph />
                    </div>
                </div>
                <div
                    style={{
                        display: 'flex',
                        background: colors.background,
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexBasis: '99.99%',
                            marginTop: '10px',
                            marginBottom: '10px',
                            width: '100%',
                        }}
                    >
                        <LinkInformationTable menuPosition={menuPosition} handleContextMenuOpen={handleContextMenuOpen} preloadIcon={props.preloadIcon}/>
                    </div>
                </div>
        </div>
    );
};

export default DashBoard;
