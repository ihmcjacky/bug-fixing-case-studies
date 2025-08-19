/**
 * @Author: mango
 * @Date:   2018-05-24T14:55:04+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-07-27T17:45:36+08:00
 */
import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Tooltip from '@material-ui/core/Tooltip';

const defaultPropsObj = {
    direction: 'bottom',
};

const styles = {
    tooltipStyle: {
        textAlign: 'justify !important',
        textJustify: 'inter-character !important',
        maxWidth: '500px !important',
    },
};

function P2Tooltip(props) {
    return (
        <Tooltip
            title={props.title}
            placement={props.direction}
            disableFocusListener
            disableTouchListener
            classes={{
                tooltip: props.classes.tooltipStyle,
            }}
        >
            {props.content}
        </Tooltip>
    );
}

P2Tooltip.propTypes = {
    title: PropTypes.oneOfType([
        PropTypes.string,
        PropTypes.element,
    ]).isRequired,
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    direction: PropTypes.string,
    content: PropTypes.element.isRequired,
};

P2Tooltip.defaultProps = defaultPropsObj;

export default withStyles(styles)(P2Tooltip);
