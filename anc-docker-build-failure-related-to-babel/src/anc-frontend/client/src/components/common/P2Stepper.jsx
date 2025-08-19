/**
 * @Author: mango
 * @Date:   2018-04-10T16:00:48+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-11-13T15:46:37+08:00
 * @descriptions
 * Customize stepper connector (P2StepConnector) suit for material-ui next
 * Conditionally color the connector according to process details
 * by Jacky Lam 30.5.2018
 */
import React from 'react';
import PropTypes from 'prop-types';
import {withStyles} from '@material-ui/core/styles';
import Stepper from '@material-ui/core/Stepper';
import Step from '@material-ui/core/Step';
import StepLabel from '@material-ui/core/StepLabel';
import StepIcon from '@material-ui/core/StepIcon';
import P2StepConnector from './P2StepConnector';
import Constant from '../../constants/common';

const {colors} = Constant;
const styles = {
    stepIconComplete: {
        color: `${colors.stepperComplete} !important`,
    },
    stepLabelActive: {
        color: 'black !important',
    },
    stepLabel_10: {
        fontSize: '10px',
    },
    stepLabel_14: {
        fontSize: '14px',
    },
};

const defaultPropsObj = {
    style: {
        stepper: {
            width: '100%',
            padding: '15px 24px',
        },
        fontSize: {
            label: 14,
        },
    },
};

class P2Stepper extends React.Component {
    constructor(props) {
        super(props);
        this.props = props;
    }

    render() {
        const {classes} = this.props;
        let labelFontSize = 'classes.stepLabel_14';
        if (typeof this.props.style.fontSize !== 'undefined' && this.props.style.fontSize.label === 10) {
            labelFontSize = classes.stepLabel_10;
        }

        const itemsElement = this.props.stepperItems.map(
            (stepperItem, index) => (
                <Step key={this.props.stepperItemLbl[index]}>
                    <StepLabel
                        active={stepperItem.isStepActive}
                        completed={stepperItem.isStepCompleted}
                        classes={{
                            active: classes.stepLabelActive,
                            label: labelFontSize,
                        }}
                        icon={<StepIcon
                            icon={(index + 1)}
                            classes={{completed: classes.stepIconComplete}}
                            active={stepperItem.isStepActive}
                            completed={stepperItem.isStepCompleted}
                        />}
                    >
                        {this.props.stepperItemLbl[index]}
                    </StepLabel>
                </Step>
            )
        );

        const aConnector = (
            <P2StepConnector
                stepperItems={this.props.stepperItems}
            />
        );

        return (
            <Stepper
                style={this.props.style.stepper || defaultPropsObj.style.stepper}
                connector={aConnector}
            >
                {itemsElement}
            </Stepper>
        );
    }
}

P2Stepper.propTypes = {
    stepperItems: PropTypes.arrayOf(PropTypes.object).isRequired,
    stepperItemLbl: PropTypes.arrayOf(PropTypes.string).isRequired,
    style: PropTypes.objectOf(PropTypes.object),
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
};

P2Stepper.defaultProps = defaultPropsObj;

export default withStyles(styles)(P2Stepper);
