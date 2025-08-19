/**
* @Author: Jacky Lam <jacky>
* @Date:   21-05-2018 01:36:32
* @Email:  jackylam@p2wireless.com
 * @Last modified by:   mango
 * @Last modified time: 2018-11-13T16:09:53+08:00
* @Copyright: P2 Wireless Techologies
*/

import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import {withStyles} from '@material-ui/core/styles';
import ret from '../../constants/common';

const {theme} = ret;

export const styles = _theme => ({
    root: {
        flex: '1 1 auto',
    },
    horizontal: {},
    vertical: {
        marginLeft: 12, // half icon
        padding: `0 0 ${_theme.spacing()}px`,
    },
    alternativeLabel: {
        position: 'absolute',
        top: _theme.spacing() + 4,
        left: 'calc(50% + 20px)',
        right: 'calc(-50% + 20px)',
    },
    active: {},
    completed: {},
    disabled: {},
    line: {
        display: 'block',
        borderColor: _theme.palette.type === 'light' ? _theme.palette.grey[400] : _theme.palette.grey[600],
    },
    lineHorizontal: {
        borderTopStyle: 'solid',
        borderTopWidth: 1,
    },
    lineVertical: {
        borderLeftStyle: 'solid',
        borderLeftWidth: 1,
        minHeight: _theme.spacing(3),
    },
});

/**
* @ignore - internal component.
*/
function P2StepConnector(props) {
    const {
        active,
        alternativeLabel,
        className: classNameProp,
        classes,
        completed,
        disabled,
        index,
        orientation,
        stepperItems,
        ...other
    } = props;
    const className = classNames(
        classes.root,
        classes[orientation],
        {
            [classes.alternativeLabel]: alternativeLabel,
            [classes.active]: active,
            [classes.completed]: completed,
            [classes.disabled]: disabled,
        },
        classNameProp
    );
    const lineClassName = classNames(classes.line, {
        [classes.lineHorizontal]: orientation === 'horizontal',
        [classes.lineVertical]: orientation === 'vertical',
    });
    const coloredStyle = {
        borderColor: theme.palette.primary.main,
        borderWidth: '2px',
    };
    const determineLineColor = (el, _stepperItems) => {
        // Introduced by Jacky Lam 23/5/2018
        // Using refs to control the animation outside react mechanism
        // Reason: material-ui-next lacks customization on each connector,
        // as material-ui-next must remain intact, refs provide best solution
        // to customize actions and outlook from the assist of jQuery
        const _self = window.$(el).parent();
        const stepperMain = window.$(el).closest('div[class^="MuiPaper-root"]');
        const _key = window.$(stepperMain).find('div[class^="P2StepConnector-root"]').index(_self);
        const re = _key >= 0 && _key < _stepperItems.length - 1
            && _stepperItems[_key].isStepCompleted
            ? coloredStyle
            : {borderColor: '', borderWidth: ''};

        window.$(stepperMain).find('div[class^="P2StepConnector-root"]')
            .eq(_key)
            .children('span')
            .first()
            .css(re);
    };
    return (
        <div className={className} {...other}>
            <span
                className={lineClassName}
                ref={el => determineLineColor(el, stepperItems)}
            />
        </div>
    );
}

P2StepConnector.propTypes = {
    stepperItems: PropTypes.arrayOf(PropTypes.shape({
        stepLbl: PropTypes.string.isRequired,
        isStepActive: PropTypes.bool.isRequired,
        isStepCompleted: PropTypes.bool.isRequired,
    })).isRequired,
    /**
    * @ignore
    */
    active: PropTypes.bool,
    /**
    * @ignore
    * Set internally by Step when it's supplied with the alternativeLabel property.
    */
    alternativeLabel: PropTypes.bool,
    /**
    * Useful to extend the style applied to components.
    */
    classes: PropTypes.object.isRequired, /* eslint-disable-line */
    /**
    * @ignore
    */
    className: PropTypes.string,
    /**
    * @ignore
    */
    completed: PropTypes.bool,
    /**
     * @ignore
     */
    disabled: PropTypes.bool,
    /**
     * @ignore
     */
    index: PropTypes.number,
    /**
    * @ignore
    */
    orientation: PropTypes.oneOf(['horizontal', 'vertical']),
};

P2StepConnector.defaultProps = {
    active: false,
    completed: false,
    disabled: false,
    index: 0,
    alternativeLabel: false,
    orientation: 'horizontal',
    className: '',
};

export default withStyles(styles)(P2StepConnector);
