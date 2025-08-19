import React, {Component} from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import {Tooltip} from '@material-ui/core';
import Constant from '../../constants/common';
// import LockLayer from './LockLayer';

const styles = {
    cardContainer: {
        display: 'flex',
        flexDirection: 'column',
        flex: '1',
        whiteSpace: 'nowrap',
        // backgroundColor: '#FAFAFA',
        backgroundColor: Constant.colors.overviewBoxBackground,
        boxSizing: 'border-box',
        boxShadow: '0px 1px 3px 0px rgba(0,0,0,0.2), ' +
                   '0px 1px 1px 0px rgba(0,0,0,0.14), ' +
                   '0px 2px 1px -1px rgba(0,0,0,0.12)',
        width: '100%',
    },
    cardTitleContainer: {
        // flexGrow: '1',
        alignItems: 'center',
        padding: '0 20px',
        display: 'flex',
        width: '100%',
    },
    cardTitle: {
        fontFamily: 'Roboto',
        whiteSpace: 'nowrap',
        textOverflow: 'ellipsis',
        overflow: 'hidden',
        verticalAlign: 'middle',
        // color: 'rgba(33, 33, 33, 0.785)',
        color: Constant.theme.palette.txt.normal,
        marginBlockStart: '20px',
        marginBlockEnd: '20px',
    },
    cardToolsContainer: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'flex-end',
        // flexGrow: '1',
        alignItems: 'center',
        marginLeft: 'auto',
    },
    cardContentContainer: {
        display: 'flex',
        flexDirection: 'row',
        flex: '1',
    },
};

class P2CardContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            open: false,
        };
        this.handleTooltipClose = this.handleTooltipClose.bind(this);
        this.handleTooltipOpen = this.handleTooltipOpen.bind(this);
    }

    handleTooltipClose() {
        this.setState({
            open: false,
        });
    }

    handleTooltipOpen() {
        if (this.props.cardTitle.length > this.props.cardTitleLimit) {
            this.setState({
                open: true,
            });
        }
    }

    render() {
        const {classes} = this.props;
        // console.log(this.state);
        return (
            <div
                className={classes.cardContainer}
                style={{
                    minWidth: this.props.minWidth,
                    minHeight: this.props.minHeight,
                }}
            >
                {/* <LockLayer
                    display={this.props.isLoading}
                    top={false}
                    left={false}
                    zIndex={200}
                    opacity={1}
                    color="rgb(250, 250, 250, 0.5)"
                    hasCircularProgress
                    circularMargin="-40px"
                /> */}
                <div style={{height: '50px', flex: 0}} className={classes.cardContentContainer}>
                    <div className={classes.cardTitleContainer}>
                        {typeof this.props.cardTitle === 'string' ?
                            <Tooltip
                                title={this.props.cardTitle}
                                open={this.state.open}
                            >
                                <p
                                    onMouseOver={this.handleTooltipOpen}
                                    onFocus={this.handleTooltipOpen}
                                    onMouseOut={this.handleTooltipClose}
                                    onBlur={this.handleTooltipClose}
                                    className={classes.cardTitle}
                                >
                                    {(this.props.cardTitle.length > this.props.cardTitleLimit) ?
                                        `${this.props.cardTitle.substring(0, this.props.cardTitleLimit)} ...` :
                                        this.props.cardTitle}
                                </p>
                            </Tooltip>
                            :
                            <React.Fragment>
                                {this.props.cardTitle}
                            </React.Fragment>
                        }
                        {this.props.showHelperTooltip ?
                            <Tooltip
                                title={this.props.helperTooltip}
                                aria-label="helper-tooltip"
                            >
                                <i
                                    style={{
                                        marginLeft: '5px',
                                        fontSize: '15px',
                                        // color: '#122D54',
                                        color: Constant.theme.palette.primary.main,
                                    }}
                                    className="material-icons"
                                >
                                    help
                                </i>
                            </Tooltip> :
                            <span />}
                    </div>
                    <div style={{marginRight: '5px'}} className={classes.cardToolsContainer}>
                        {this.props.cardTools}
                    </div>
                </div>
                <div className={classes.cardContentContainer}>
                    {this.props.cardContent}
                </div>
            </div>
        );
    }
}

P2CardContainer.propTypes = {
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    cardTitle: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired,
    cardTitleLimit: PropTypes.number.isRequired,
    cardTools: PropTypes.arrayOf(PropTypes.element),
    cardContent: PropTypes.oneOfType([PropTypes.element, PropTypes.string]).isRequired,
    minWidth: PropTypes.string.isRequired,
    minHeight: PropTypes.string.isRequired,
    showHelperTooltip: PropTypes.bool.isRequired,
    helperTooltip: PropTypes.string,
    // isLoading: PropTypes.bool,
};

P2CardContainer.defaultProps = {
    cardTools: [],
    helperTooltip: '',
    // isLoading: false,
};

export default withStyles(styles)(P2CardContainer);
