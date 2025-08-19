/**
 * @Author: mango
 * @Date:   2018-08-15T16:17:53+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-08-15T16:19:46+08:00
 */
import React from 'react';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {compose} from 'redux';
import {withStyles} from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';
import CommonConstant from '../../constants/common';

const {theme} = CommonConstant;

const styles = {
    colorSecondary: {
        backgroundColor: theme.palette.secondary.main,
    },
    barColorSecondary: {
        backgroundColor: theme.palette.primary.main,
    },
};

class ProgressBar extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        return (
            <LinearProgress
                classes={this.props.classes}
                color="secondary"
                variant={this.props.isActive ? 'indeterminate' : 'determinate'}
                value={100}
                style={{
                    position: 'absolute',
                    top: '0',
                    left: '0',
                    minWidth: '600px',
                    width: '100%',
                }}
            />
        );
    }
}

ProgressBar.propTypes = {
    classes: PropTypes.shape({colorSecondary: PropTypes.string.isRequired}).isRequired,
    isActive: PropTypes.bool.isRequired,
};

function mapStateToProps(store) {
    return {
        isActive: store.common.progressBar.isActive,
    };
}

export default compose(
    connect(
        mapStateToProps,
        {}
    ),
    withStyles(styles)
)(ProgressBar);
