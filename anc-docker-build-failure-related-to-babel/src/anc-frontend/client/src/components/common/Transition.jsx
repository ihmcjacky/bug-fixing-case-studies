import React from 'react';
import Slide from '@material-ui/core/Slide';
import PropTypes from 'prop-types';

const Transition = React.forwardRef((props, ref) => <Slide direction={props.direction} {...props} ref={ref} />);

Transition.propTypes = {
    direction: PropTypes.string,
};

Transition.defaultProps = {
    direction: 'left',
};

export default Transition;
