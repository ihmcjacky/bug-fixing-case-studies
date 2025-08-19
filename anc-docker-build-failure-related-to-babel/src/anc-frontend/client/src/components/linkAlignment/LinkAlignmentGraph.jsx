import React from 'react';
import PropTypes from 'prop-types';
import {compose} from 'redux';
import {connect} from 'react-redux';
import {withStyles} from '@material-ui/core/styles';
import RssiLineChart from './RssiLinkChart';

const LinkAlignmentGraph = (props) => {
    const {
        classes,
        numOfTotalRes,
        graphRadioData,
        startTime,
        thresholdLines,
    } = props;
    return (
        <div className={classes.wrapper} id="rssi-line-chart-wrapper">
            <RssiLineChart
                dataLength={numOfTotalRes}
                data={graphRadioData[props.ip]}
                selectedRadio={props.selectedRadio}
                selectedLink={props.selectedLink}
                lastTimestamp={props.lastTimestamp}
                dataSource={props.dataSource}
                isPolling={props.isPolling}
                startTime={startTime}
                mac={props.mac}
                animationState={props.animationState}
                totalWidth={props.width}
                stopGraphUpdate={props.stopGraphUpdate}
                thresholdLines={thresholdLines}
            />
        </div>
    );
};

LinkAlignmentGraph.propTypes = {
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    numOfTotalRes: PropTypes.number.isRequired,
    graphRadioData: PropTypes.object.isRequired, // eslint-disable-line
    ip: PropTypes.string.isRequired,
    lastTimestamp: PropTypes.string.isRequired,
    selectedLink: PropTypes.array.isRequired, // eslint-disable-line
    selectedRadio: PropTypes.arrayOf(PropTypes.string).isRequired,
    dataSource: PropTypes.object.isRequired, // eslint-disable-line
    isPolling: PropTypes.bool.isRequired,
    startTime: PropTypes.string.isRequired,
    mac: PropTypes.string.isRequired,
    animationState: PropTypes.string.isRequired,
    width: PropTypes.number.isRequired,
    stopGraphUpdate: PropTypes.bool.isRequired,
    // thresholdLines: PropTypes.arrayOf(PropTypes.shape({
    //     radio: PropTypes.string,
    //     data: PropTypes.arrayOf(PropTypes.number),
    // })).isRequired,
    thresholdLines: PropTypes.arrayOf(PropTypes.shape({
        radio: PropTypes.string,
        displayRadio: PropTypes.string,
        value: PropTypes.number,
    })).isRequired,
};

const styles = {
    wrapper: {
        padding: '20px 10px 0px 0px',
        paddingBottom: '0px',
    },
};
function mapStateToProps(store) {
    return {
        ip: store.linkAlignment.ip,
        numOfTotalRes: store.linkAlignment.numOfTotalRes,
        graphRadioData: store.linkAlignment.graphRadioData,
        lastTimestamp: store.linkAlignment.lastTimestamp,
        selectedRadio: store.linkAlignment.selectedRadio,
        selectedLink: store.linkAlignment.selectedLink,
        isPolling: store.linkAlignment.isPolling,
    };
}
export default compose(
    connect(
        mapStateToProps,
        {}
    ),
    withStyles(styles))(LinkAlignmentGraph);
