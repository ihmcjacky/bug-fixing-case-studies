import React from 'react';
import PropTypes from 'prop-types';
import Popover from '@material-ui/core/Popover';
import ContextMenuItem from './ContextMenuItem';

const TopologyContextMenu = (props) => {
    const {
        open,
        items,
        pos,
        contextMenuClose,
        origin: {anchor, transform},
    } = props;

    return (
        <Popover
            id="project-menu"
            open={open}
            anchorReference="anchorPosition"
            anchorPosition={{
                left: pos.x,
                top: pos.y,
            }}
            onClose={contextMenuClose}
            anchorOrigin={anchor}
            transformOrigin={transform}
            onContextMenu={(e) => e.preventDefault()}
        >
            {items.map((item) => (
                <ContextMenuItem
                    key={item.title}
                    {...item}
                />
            ))}
        </Popover>
    );
};

TopologyContextMenu.propTypes = {
    open: PropTypes.bool.isRequired,
    items: PropTypes.arrayOf(PropTypes.shape({
        icon: PropTypes.element.isRequired,
        title: PropTypes.string.isRequired,
        onClickFunc: PropTypes.func.isRequired,
    })).isRequired,
    pos: PropTypes.shape({
        x: PropTypes.number.isRequired,
        y: PropTypes.number.isRequired,
    }).isRequired,
    origin: PropTypes.shape({
        anchor: PropTypes.shape({
            vertical: PropTypes.string.isRequired,
            horizontal: PropTypes.string.isRequired,
        }).isRequired,
        transform: PropTypes.shape({
            vertical: PropTypes.string.isRequired,
            horizontal: PropTypes.string.isRequired,
        }).isRequired,
    }).isRequired,
    contextMenuClose: PropTypes.func.isRequired,
};

export default TopologyContextMenu;
