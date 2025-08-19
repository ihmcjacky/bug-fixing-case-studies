import React from 'react';
import {withStyles} from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import Constant from '../../constants/common';

const {colors} = Constant;

export const StyledDivider = withStyles({
    root: props => ({
        borderTop: `2px dashed ${props.color}`,
        height: 0,
        backgroundColor: 'rgba(0,0,0,0)',
    }),
})(Divider);

export const getLoadingWrapper = (isLoading, classes) => {
    if (isLoading) {
        return (
            <div className={classes.loadingWrapper}>
                <img
                    src="/img/loading.gif"
                    alt="loading"
                    className={classes.progress}
                />
            </div>
        );
    }
    return null;
};

export const duration = 300;
export const fadeOrg = {
    transition: `opacity ${duration}ms ease-in-out`,
};
export const fade = {
    entering: {
        opacity: 0,
    },
    entered: {
        opacity: 1,
    },
    exiting: {
        opacity: 0,
        display: 'none',
    },
    exited: {
        display: 'none',
    },
};

export const styles = {
    bottom: {
        marginTop: '-40px',
        fontSize: '10px',
        textAlign: 'center',
    },
    bottomRadio: {
        marginTop: '-55px',
        fontSize: '10px',
        textAlign: 'center',
    },
    radioRssiWrapper: {
        marginTop: '-10px',
        // marginLeft: '30px',
        fontSize: '10px',
        textAlign: 'center',
    },
    duplex: {
        textAlign: 'center',
        fontSize: '10px',
    },
    center: {
        textAlign: 'center',
        fontSize: '10px',
    },
    iconWrapperLeft: {
        marginTop: '-15px',
        float: 'right',
    },
    iconWrapperRight: {
        marginTop: '-15px',
    },
    iconWrapperLeftRadio: {
        marginTop: '-25px',
        float: 'right',
    },
    iconWrapperRightRadio: {
        marginTop: '-25px',
    },
    nodeAColor: {
        backgroundColor: colors.activeGreen,
    },
    nodeBColor: {
        backgroundColor: colors.hoverGreen,
    },
    unmanagedNodeColor: {
        backgroundColor: colors.unmanagedIcon,
    },
    middle: {
        paddingTop: '10px',
        textAlign: 'center',
        height: '100%',
        fontSize: '10px',
    },
    contentRoot: {
        paddingTop: '25px',
        // paddingBottom: '30px',
        '&:last-child': {
            paddingBottom: '20px',
        },
    },
    progress: {
        display: 'block',
        position: 'absolute',
        top: '50%',
        left: '50%',
        marginLeft: '-30px',
        marginTop: '-30px',
        width: '60px',
        height: '60px',
    },
    loadingWrapper: {
        position: 'absolute',
        opacity: '0.7',
        width: '100%',
        height: '100%',
        zIndex: '1000',
        backgroundColor: 'white',
    },
    paper: {
        textAlign: 'center',
        maxWidth: '100px',
        fontSize: '10.05px',
        fontWeight: '500',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        marginTop: '-4px',
    },
    dataRateBack: {
        textAlign: 'center',
        // height: '100%',
        fontSize: '10px',
        color: colors.activeGreen,
    },
    dataRateForward: {
        textAlign: 'center',
        // height: '100%',
        fontSize: '10px',
        color: colors.inactiveRed,
    },
};

