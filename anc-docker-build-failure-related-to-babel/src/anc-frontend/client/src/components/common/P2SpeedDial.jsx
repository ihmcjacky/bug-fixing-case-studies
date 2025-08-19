import React from 'react';
import SpeedDial from '@material-ui/lab/SpeedDial';
import SpeedDialAction from '@material-ui/lab/SpeedDialAction';
import PropTypes from 'prop-types';

class P2SpeedDial extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
            direction: props.direction,
        };
        this.setOpen = this.setOpen.bind(this);
        this.handleClick = this.handleClick.bind(this);
        this.handleClose = this.handleClose.bind(this);
        this.handleOpen = this.handleOpen.bind(this);
    }

    setOpen(open) {
        this.setState({
            open,
        });
    }

    handleClick() {
        this.props.defaultIconClick();
        this.handleOpen();
    }

    handleClose() {
        this.setOpen(false);
    }

    handleOpen() {
        this.setOpen(true);
    }

    render() {
        const {actions} = this.props;
        return (
            <SpeedDial
                ariaLabel="Speed Dial"
                icon={this.props.defaultIcon}
                onOpen={(e, reason) => {
                    console.log('SpeedDial onOpen reason: ', reason);
                    if (reason === 'toggle') {
                        this.handleClick();
                    } else if (reason === 'mouseEnter') {
                        this.handleOpen();
                    }
                }}
                onClose={(e, reason) => {
                    console.log('SpeedDial onClose reason: ', reason);
                    if (reason === 'toggle') {
                        this.handleClick();
                    } else if (reason === 'mouseLeave') {
                        this.handleClose();
                    }
                }}
                open={this.state.open}
                direction={this.state.direction}
            >
                {actions.map(action => (
                    <SpeedDialAction
                        key={action.name}
                        icon={action.icon}
                        tooltipTitle={action.name}
                        onClick={action.fn}
                    />
                ))}
            </SpeedDial>
        );
    }
}

P2SpeedDial.propTypes = {
    direction: PropTypes.string,
    actions: PropTypes.array.isRequired, //eslint-disable-line
    defaultIcon: PropTypes.node.isRequired,
    defaultIconClick: PropTypes.func,
};

P2SpeedDial.defaultProps = {
    direction: 'down',
    defaultIconClick: () => {},
};

export default P2SpeedDial;
