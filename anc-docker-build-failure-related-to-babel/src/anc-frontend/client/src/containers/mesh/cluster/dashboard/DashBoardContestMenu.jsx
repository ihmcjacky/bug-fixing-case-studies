import React, { useState } from "react";
import NestedMenuItem from "material-ui-nested-menu-item";
import {useTranslation} from 'react-i18next';
import { Menu, MenuItem, Typography } from "@material-ui/core";

const getIcon = (name) => {
    return (
        <div
            style={{
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                marginRight: '10px',
                backgroundColor: 'rgb(82, 82, 82)',
            }}
        >
            <img
                src={`/img/icons/${name}.svg`}
                alt="menu-icon"
                style={{
                    width: '12px',
                    height: '12px',
                    marginLeft: '4px',
                    marginTop: '0px',
                }}
            />      
        </div>
    );
}

export const DashBoardContestMenu = (props) => {
    
    const {
        menuPosition,
        handleContextMenuOpen,
        handleContextMenuClose,
        topologyEventHandler: {
            node: {
                menuFunc: {
                    openDraggableBox,
                    openLinkAlignment,
                    openSpectrumScan,
                    openNodeRecovery,
                    openRssiBox,
                    addDeviceToList,
                }
            },
            link: {
                menuFunc: {blocklink: handleBlockLink},
            },
        }
    } = props;

    let type = 'nodeMenu';

    if (menuPosition && menuPosition.type) {
        type = menuPosition.type;
    }

    const {t} = useTranslation('cluster-topology');

    const handleOpenDraggableBox = (idx) => {
        console.log('handleOpenDraggableBox');
        console.log(menuPosition);
        openDraggableBox(
            menuPosition.ip,
            idx,
            {x: menuPosition.left, y: menuPosition.top}
        );
        handleContextMenuClose();
    };

    if (type === 'unmanagedNodeMenu') {
        return (
            <Menu
                open={menuPosition.open}
                onClose={handleContextMenuClose}
                anchorReference="anchorPosition"
                anchorPosition={menuPosition}
            >
                <MenuItem
                    onClick={
                        () => {
                            addDeviceToList(menuPosition.ip);
                            handleContextMenuClose();
                        }
                    }
                >
                    {getIcon('add')}
                    {t('add')}
                </MenuItem>
            </Menu>
        );
    }

    if (type === 'radioLinkMenu') {
        return (
            <Menu
                open={menuPosition.open}
                onClose={handleContextMenuClose}
                anchorReference="anchorPosition"
                anchorPosition={menuPosition}
            >
                <MenuItem
                    onClick={
                        () => {
                            handleBlockLink(menuPosition.ip);
                            handleContextMenuClose();
                        }
                    }
                >
                    {getIcon('blocklink')}
                    {t('eliminatelink')}
                </MenuItem>
            </Menu>
        );
    }

    return (
        <Menu
            open={menuPosition.open}
            onClose={handleContextMenuClose}
            anchorReference="anchorPosition"
            anchorPosition={menuPosition}
        >
            <MenuItem
                onClick={
                    () => handleOpenDraggableBox(0)
                }
            >
                {getIcon('info')}
                {t('info')}
            </MenuItem>
            <MenuItem
                onClick={
                    () => handleOpenDraggableBox(1)
                }
            >
                {getIcon('statistic')}
                {t('statistic')}
            </MenuItem>
            <MenuItem
                onClick={
                    () => handleOpenDraggableBox(2)
                }
            >
                {getIcon('settings')}
                {t('configuration')}
            </MenuItem>
            <MenuItem 
                onClick={
                    () => handleOpenDraggableBox(3)
                }
            >
                {getIcon('maintenance')}
                {t('maintenance')}
            </MenuItem>
            <MenuItem 
                onClick={
                    () => handleOpenDraggableBox(4)
                }
            >
                {getIcon('security')}
                {t('security')}
            </MenuItem>

            <NestedMenuItem
                label={
                    (<div
                        style={{
                            display: 'flex'
                        }}
                    >
                        {getIcon('networkTools')}
                        {t('tools')}
                    </div>)
                }
                parentMenuOpen={!!menuPosition}
            >
                <MenuItem
                    onClick={
                        () => {
                            openLinkAlignment(menuPosition.ip);
                            handleContextMenuClose();
                        }
                    }
                >
                    {getIcon('linkalignment')}
                    {t('linkalignment')}
                </MenuItem>
                <MenuItem
                    onClick={
                        () => {
                            openSpectrumScan(menuPosition.ip);
                            handleContextMenuClose();
                        }
                    }
                >
                    {getIcon('spectrumscan')}
                    {t('spectrumscan')}
                </MenuItem>
                <MenuItem
                    onClick={
                        () => {
                            openNodeRecovery(menuPosition.ip);
                            handleContextMenuClose();
                        }
                    }
                >
                    {getIcon('noderecovery')}
                    {t('noderecovery')}
                </MenuItem>
            </NestedMenuItem>
        </Menu>
    );
};

export default DashBoardContestMenu;
