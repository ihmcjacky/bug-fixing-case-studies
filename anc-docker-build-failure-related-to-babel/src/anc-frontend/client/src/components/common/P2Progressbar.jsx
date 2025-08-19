import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import {Typography} from '@material-ui/core';
import i18n from '../../I18n';
import Constant from '../../constants/common';
import useDimension from './useDimension';

const {themeObj, colors} = Constant;

const BorderLinearProgress = withStyles(theme => ({
    root: {
        height: 18,
        borderRadius: 3,
        border: `1px solid ${theme.palette.secondary.main}`,
    },
    colorPrimary: {
        backgroundColor: 'transparent',
    },
    bar: {
        borderRadius: 0,
        backgroundColor: 'rgba(222, 53, 124, 0.15)',
    },
}))(LinearProgress);

const P2Progressbar = ({
    current, currentPercentage, unit, total, aux
}) => {
    const [ref, {width}] = useDimension([current < 10]);
    const [totalRamRef, {width: totalRamLabelWidth}] = useDimension();
    let {testId} = aux;
    return (
        <React.Fragment>
            <Typography
                color="secondary"
                style={{
                    fontSize: '10px',
                    paddingBottom: '3px',
                    transform: `translateX(${currentPercentage}%)`,
                    transition: 'transform .4s linear',
                }}
            >
                <span
                    ref={ref}
                    style={{
                        position: 'relative',
                        marginLeft: `-${width / 2}px`,
                    }}
                >
                    <span style={{
                        width: 0,
                        height: 0,
                        borderStyle: 'solid',
                        borderWidth: '4px 2px 0 2px',
                        borderColor: `${themeObj.secondary.main} transparent transparent transparent`,
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, 4px)',
                    }}
                    />
                    {current}{unit}
                </span>
            </Typography>
            <div
                style={{
                    position: 'relative',
                }}
            >
                <BorderLinearProgress variant="determinate" value={currentPercentage} />
                <Typography
                    color="secondary"
                    style={{
                        fontSize: '11px',
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                    }}
                >
                    <span style={{fontWeight: '600'}} id={`${testId.hostname}-${testId.sn}-${testId.type}`}>
                        {`${currentPercentage}% `}
                    </span>
                    {i18n.t('used')}
                </Typography>
            </div>
            <p
                style={{
                    margin: '-16px 0px 0px 0px',
                    transform: `translateX(${currentPercentage}%)`,
                    transition: 'transform .4s linear',
                }}
            >
                <span style={{
                    marginLeft: '-2px',
                    width: 0,
                    height: 0,
                    borderStyle: 'solid',
                    borderWidth: '0 2px 4px 2px',
                    borderColor: ` transparent transparent ${themeObj.secondary.main} transparent`,
                }}
                />
            </p>
            <Typography
                style={{
                    display: 'flex',
                    justifyContent: 'flex-end',
                    fontSize: '10px',
                    paddingTop: '3px',
                    color: colors.black75,
                }}
            >
                <span
                    ref={totalRamRef}
                    style={{
                        marginRight: `-${totalRamLabelWidth / 2}px`,
                    }}
                >
                    {total}{unit}
                </span>
            </Typography>
        </React.Fragment>
    );
};

P2Progressbar.propTypes = {
    current: PropTypes.number.isRequired,
    currentPercentage: PropTypes.number.isRequired,
    unit: PropTypes.string.isRequired,
    total: PropTypes.number.isRequired,
    aux: PropTypes.object
};

export default P2Progressbar;
