import React from 'react';
import PropTypes from 'prop-types';

function NationalFlag(props) {
    const flag = `/img/flags/${props.countryCode}.png`;
    return (
        props.countryCode === 'db' ?
            <span /> :
            <img
                src={flag}
                alt={props.countryCode}
                style={{
                    width: props.flagWidth,
                    height: props.flagHeight,
                    boxSizing: 'border-box',
                    boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.2), ' +
                    '0px 1px 1px 0px rgba(0,0,0,0.14), ' +
                    '0px 2px 1px -1px rgba(0,0,0,0.12)',
                }}
            />
    );
}

NationalFlag.propTypes = {
    countryCode: PropTypes.string.isRequired,
    flagWidth: PropTypes.string.isRequired,
    flagHeight: PropTypes.string.isRequired,
};

export default NationalFlag;
