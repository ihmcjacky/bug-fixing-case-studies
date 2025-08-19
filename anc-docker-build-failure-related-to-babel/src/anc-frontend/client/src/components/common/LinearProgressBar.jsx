import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import LinearProgress from '@material-ui/core/LinearProgress';

const colorArr = {
    error: '#DC4639',
    onProcess: '#425581',
    complete: '#009588',
};

class LinearProgressBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            curNum: 0,
            textColor: '',
            barColor: '',
        };
        this.randomProgress = this.randomProgress.bind(this);
        this.timer = null;
        this.mounted = false;
        this.setUp = this.setUp.bind(this);
    }

    componentDidMount() {
        this.mounted = true;
        this.setUp();
    }

    componentWillReceiveProps(nextProps) {
        if (!this.mounted) {
            return;
        }
        if (nextProps.isError) {
            clearInterval(this.timer);
            this.setState({
                curNum: 100,
                textColor: colorArr.error,
                barColor: this.props.classes.error,
            });
        } else if (nextProps.percentage !== this.props.percentage &&
                this.state.curNum === this.props.percentage) {
            this.timer = setInterval(this.randomProgress, 500);
        }
    }
    componentWillUnmount() {
        this.mounted = false;
    }

    setUp() {
        if (this.props.isError) {
            this.setState({
                curNum: 100,
                textColor: colorArr.error,
                barColor: this.props.classes.error,
            });
        } else if (this.props.percentage === 100) {
            this.setState({
                curNum: 100,
                textColor: colorArr.complete,
                barColor: this.props.classes.complete,
            });
        } else {
            this.timer = setInterval(this.randomProgress, 500);
        }
    }

    randomProgress() {
        if (!this.mounted) {
            return;
        }
        const {classes} = this.props;
        if (this.props.isError) {
            clearInterval(this.timer);
            this.setState({
                curNum: 100,
                textColor: colorArr.error,
                barColor: this.props.classes.error,
            });
        } else if (this.props.percentage === 100) {
            clearInterval(this.timer);
            this.setState({
                curNum: 100,
                textColor: colorArr.complete,
                barColor: this.props.classes.complete,
            });
        } else if (this.state.curNum === 100) {
            clearInterval(this.timer);
            this.setState({
                ...this.state,
                textColor: colorArr.complete,
                barColor: classes.complete,
            });
        } else if (this.state.curNum === this.props.percentage) {
            clearInterval(this.timer);
            this.setState({
                textColor: colorArr.onProcess,
                barColor: this.state.curNum === 100 ? classes.complete : classes.onProcess,
            });
        } else {
            const randomNum = Math.random() * 20;
            const {curNum} = this.state;
            this.setState({
                curNum: parseInt(Math.min(curNum + randomNum, this.props.percentage), 10),
                textColor: colorArr.onProcess,
            });
        }
    }

    render() {
        const {classes} = this.props;
        let displayMsg = this.props.message;
        const percentage = this.state.curNum;
        if (percentage > 20 && percentage <= 25) {
            displayMsg = this.props.t('checkingNodeStatus');
        } else if (percentage > 25 && percentage <= 30) {
            displayMsg = this.props.t('checkingUpgradeOrdering');
        } else if (percentage > 30 && percentage <= 40) {
            displayMsg = this.props.t('checkingFirmwareValidity');
        } else if (percentage > 40 && percentage <= 60) {
            displayMsg = this.props.t('checkingEnoughSpace');
        } else if (percentage > 60 && percentage <= 80) {
            displayMsg = this.props.t('hostnodeRetrievingFirmware');
        } else if (percentage > 80 && percentage < 99) {
            displayMsg = this.props.t('remotenodeRetrievingFirmware');
        } else if (percentage === 99) {
            displayMsg = this.props.t('firmwareUpgradeInProgress');
        }

        return (
            <div
                style={{
                    paddingTop: '5px',
                    width: '100%',
                }}
            >
                <span
                    style={{
                        display: 'block',
                        color: this.state.textColor,
                    }}
                >
                    {`(${this.state.curNum}%) ${displayMsg}`}
                </span>
                <LinearProgress
                    value={this.state.curNum}
                    variant="determinate"
                    classes={{
                        root: classes.LinearProgress,
                        barColorPrimary: this.state.barColor,
                        colorPrimary: classes.background,
                    }}
                />
            </div>
        );
    }
}

LinearProgressBar.propTypes = {
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    message: PropTypes.string.isRequired,
    percentage: PropTypes.number.isRequired,
    isError: PropTypes.bool.isRequired,
    // device: PropTypes.object.isRequired, // eslint-disable-line
    t: PropTypes.func.isRequired,
};

const styles = {
    error: {
        backgroundColor: colorArr.error,
    },
    onProcess: {
        backgroundColor: colorArr.onProcess,
    },
    complete: {
        backgroundColor: colorArr.complete,
    },
    background: {
        backgroundColor: '#aaaaaa',
    },
    LinearProgress: {
        width: '100%',
        marginTop: '10px',
        marginBottom: '10px',
    },
};

export default withStyles(styles)(LinearProgressBar);
