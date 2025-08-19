import React from 'react';
import {useSelector, useDispatch} from 'react-redux';
import i18n from '../../../../I18n';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Fab from '@material-ui/core/Fab';
import Tooltip from '@material-ui/core/Tooltip';
import {ReactComponent as ManagedDeviceListIcon} from '../../../../icon/svg/ic_managed_device_list.svg';
import {ReactComponent as NotAuthManagedDeviceListIcon} from '../../../../icon/svg/ic_not_auth_managed_device_list.svg';
import CommonConstants from '../../../../constants/common';
import {openDeviceListDialog} from '../../../../redux/common/commonActions';

const {theme, colors} = CommonConstants;

const useStyles = makeStyles({
    fab: {
        backgroundColor: 'white',
        color: theme.palette.primary.main,
    },
    tooltipRoot: {
        whiteSpace: 'nowrap',
        transform: 'scale(1.4)',
        position: 'fixed',
        top: -10,
        right: 0,
        zIndex: 10,
    },
})

const ManagedDevicelistBtn = () => {
    const classes = useStyles();
    const {graph: {nodes}} = useSelector(store => store.meshTopology);
    const dispatch = useDispatch();
    let allAuth = true;
    nodes.some((node) => {
        if (node.isManaged && node.isAuth === 'no') {
            allAuth = true;
            return true;
        }
        return false;
    });

    const icon = allAuth ? (
        <ManagedDeviceListIcon
            fill={colors.appBarMenuItem}
            stroke="white"
        />
        ) : (
        <NotAuthManagedDeviceListIcon
            fill={colors.inactiveRed}
            stroke="white"
        />
    );

    return (
        <Tooltip
            title={i18n.t('managedDevice')}
            placement="left"
            classes={{tooltip: classes.tooltipRoot}}
            disableFocusListener
            disableTouchListener
        >
            <Fab
                classes={{root: classes.fab}}
                onClick={() => { dispatch(openDeviceListDialog()); }}
            >
                {icon}
            </Fab>
        </Tooltip>
    );
};

export default ManagedDevicelistBtn;
