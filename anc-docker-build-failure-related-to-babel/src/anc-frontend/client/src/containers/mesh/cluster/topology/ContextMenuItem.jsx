import React, {forwardRef} from 'react';
import PropTypes from 'prop-types';
import MenuItem from '@material-ui/core/MenuItem';

const ContextMenuItem = forwardRef((props, ref) => (
    <MenuItem
        style={{
            paddingTop: '12px',
            paddingBottom: '10px',
        }}
        disableTouchRipple
        ref={ref}
        onClick={props.onClickFunc}
    >
        {props.icon}
        <div style={{paddingLeft: '8px'}}>
            {props.title}
        </div>
    </MenuItem>
));

ContextMenuItem.propTypes = {
    icon: PropTypes.element.isRequired,
    title: PropTypes.string.isRequired,
    onClickFunc: PropTypes.func.isRequired,
};

export default ContextMenuItem;
