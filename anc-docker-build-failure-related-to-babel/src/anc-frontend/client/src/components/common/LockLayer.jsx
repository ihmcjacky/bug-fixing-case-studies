import React from 'react';
import PropTypes from 'prop-types';
import CommonConstants from '../../constants/common';
import CountdownBar from './CountdownBar';

const {zIndexLevel} = CommonConstants;

const LockLayer = (props) => {
    const {
        color,
        opacity,
        top,
        left,
        display,
        hasCircularProgress,
        marginLeft,
        circularMargin,
        position,
        zIndex,
        message,
        countdown,
        height,
    } = props;
    if (display) {
        if (countdown.display) {
            return (
                <CountdownBar
                    displayNumber={countdown.displayNumber}
                    duration={countdown.duration}
                    completeMsg={countdown.completeMsg}
                    progressingMsg={countdown.progressingMsg}
                />
            );
        }
        return (
            <div
                style={{
                    position,
                    width: '100%',
                    height: height ? height : '100%',
                    top,
                    left,
                    zIndex,
                    backgroundColor: color,
                    opacity,
                    marginLeft,
                }}
            >
                <img
                    src="/img/loading.gif"
                    alt="loading"
                    style={{
                        display: hasCircularProgress ? 'block' : 'none',
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        marginLeft: circularMargin,
                        marginTop: circularMargin,
                        width: '60px',
                        height: '60px',
                    }}
                />
                <span
                    style={{
                        display: 'block',
                        position: 'absolute',
                        top: 'calc(46% + 73px)',
                        width: '100%',
                        textAlign: 'center',
                        zIndex: 100,
                        color: '#DE357C',
                    }}
                >
                    {message}
                </span>
            </div>
        );
    }
    return <span />
};

LockLayer.propTypes = {
    color: PropTypes.string,
    opacity: PropTypes.number,
    top: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
    left: PropTypes.oneOfType([PropTypes.number, PropTypes.bool]),
    display: PropTypes.bool,
    hasCircularProgress: PropTypes.bool,
    marginLeft: PropTypes.string,
    circularMargin: PropTypes.string,
    position: PropTypes.string,
    zIndex: PropTypes.number,
    message: PropTypes.string,
    countdown: PropTypes.shape({
        display: PropTypes.bool,
        displayNumber: PropTypes.bool,
        duration: PropTypes.number,
        completeMsg: PropTypes.string,
        progressingMsg: PropTypes.string,
    }),
};

const defaultPropsObj = {
    color: 'white',
    opacity: 0.9,
    top: 0,
    left: 0,
    hasCircularProgress: true,
    marginLeft: '0px',
    circularMargin: '-30px',
    position: 'absolute',
    zIndex: zIndexLevel.low,
    display: true,
    message: '',
    countdown: {
        display: false,
        displayNumber: false,
        duration: -1,
        completeMsg: '',
        projgressingMsg: '',
    },
};

LockLayer.defaultProps = defaultPropsObj;

export default LockLayer;
