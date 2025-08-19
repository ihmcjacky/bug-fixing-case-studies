import React from 'react';
import PropTypes from 'prop-types';
import {Transition} from 'react-transition-group';

const wrapperStyle = {
    position: 'absolute',
    display: 'flex',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    zIndex: '100',
    backgroundColor: 'white',
    opacity: '0.9',
    top: '0px',
    transition: 'top 500ms ease-in-out 500ms, opacity 500ms ease-in-out 750ms',
};
const wrapperAniStyle = {
    entering: {
        top: '0px',
        opacity: 1,
    },
    entered: {
        top: '100%',
        opacity: 0,
    },
    exiting: {
    },
    exited: {
    },
};
const loadingImgStyle = {
    display: 'block',
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: '-30px',
    marginTop: '-30px',
    width: '60px',
    height: '60px',
};
const imageDefaultStyle = {
    display: 'block',
    margin: 'auto',
    opacity: 0,
    width: 'calc(100% - 10px)',
    height: 'calc(100% - 10px)',
    transition: 'opacity 500ms ease-in-out',
};
const imageAniStyle = {
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

// Transition wrapper for loading and finish amination for screen capture
// Use image from prop for finish amination
const ScreenCapEffect = (props) => {
    const {
        loading, done,
        image,
        animationEndCallback,
    } = props;
    if (done || loading) {
        return (
            <Transition
                in={done}
                timeout={1250}
                onEntered={animationEndCallback}
            >
                {state => (
                    <div
                        style={
                            done ? {
                                ...wrapperStyle,
                                ...wrapperAniStyle[state],
                            } : wrapperStyle
                        }
                    >
                        <img
                            src={done ? image : '/img/loading.gif'}
                            style={done ? {
                                ...imageDefaultStyle,
                                ...imageAniStyle[state],
                            } : loadingImgStyle}
                            alt="loading"
                        />
                    </div>
                )}
            </Transition>
        );
    }
    return null;
};

ScreenCapEffect.propTypes = {
    loading: PropTypes.bool.isRequired,
    done: PropTypes.bool.isRequired,
    image: PropTypes.string.isRequired,
    animationEndCallback: PropTypes.func,
};

ScreenCapEffect.defaultProps = {
    animationEndCallback: () => {},
};

export default ScreenCapEffect;
