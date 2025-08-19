import React, {useState, useEffect} from 'react';
import PropTypes from 'prop-types';

const CountdownBar = (props) => {
    const {
        displayNumber,
        duration,
        progressingMsg,
        completeMsg,
    } = props;
    const [time, setTime] = useState(0);
    useEffect(() => {
        const timer = setInterval(() => {
            if (time > duration) {
                clearInterval(timer);
            } else {
                setTime(time + 1);
            }
        }, 1000);
        return () => {
            if (timer) clearInterval(timer);
        };
    });

    return (
        <div >
            <div
                style={{
                    position: 'absolute',
                    width: 'calc(100% - 48px)',
                    height: 'calc(100% - 112px)',
                    zIndex: '100',
                    backgroundColor: 'white',
                    opacity: '0.9',
                }}
            >
                <img
                    src="/img/loading.gif"
                    alt="loading"
                    style={{
                        display: 'block',
                        position: 'absolute',
                        top: '46%',
                        left: '50%',
                        marginLeft: '-50px',
                        marginTop: '-50px',
                        width: '100px',
                        height: '100px',
                    }}
                />
            </div>
            {time <= duration && displayNumber ? (<span
                style={{
                    display: 'block',
                    position: 'absolute',
                    top: 'calc(46% + 28px)',
                    width: 'calc(100% - 48px)',
                    textAlign: 'center',
                    zIndex: 100,
                    color: '#DE357C',
                }}
            >
                {duration - time}s
            </span>) : null}
            <span
                style={{
                    display: 'block',
                    position: 'absolute',
                    top: 'calc(46% + 100px)',
                    width: 'calc(100% - 48px)',
                    textAlign: 'center',
                    zIndex: 100,
                    color: '#DE357C',
                }}
            >
                {time > duration ? completeMsg : progressingMsg}
            </span>
        </div>
    );
};

CountdownBar.propTypes = {
    displayNumber: PropTypes.bool,
    duration: PropTypes.number.isRequired,
    progressingMsg: PropTypes.string,
    completeMsg: PropTypes.string,
};

CountdownBar.defaultProps = {
    displayNumber: true,
    progressingMsg: '',
    completeMsg: '',
};

export default CountdownBar;
