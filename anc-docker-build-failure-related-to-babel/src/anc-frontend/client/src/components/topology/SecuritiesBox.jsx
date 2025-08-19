/**
 * @Author: mango
 * @Date:   2018-04-17T14:50:41+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-08-03T17:48:54+08:00
 */
import React from 'react';
import {compose} from 'redux';
import {withTranslation} from 'react-i18next';
import PropTypes from 'prop-types';
import {withStyles, MuiThemeProvider} from '@material-ui/core/styles';
import Accordion from '@material-ui/core/Accordion';
import Chip from '@material-ui/core/Chip';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
// import Typography from '@material-ui/core/Typography';
import Constant from '../../constants/common';
// import ConfigRestoreApp from '../../containers/topology/configRestore';
import AccessControlList from '../nodeSecurities/AccessControlList';
import NeighborAccessControlList from '../nodeSecurities/NeighborAccessControlList';

// const {colors} = Constant;
const styles = theme => ({
    root: {
    },
    expansionPanelExpanded: {
        margin: '0px 0px 15px 0px',
    },
    expansionPanelRoot: {
        marginBottom: '20px',
        '&:before': {
            display: 'none',
        },
        borderRadius: '2px',
        ...theme.typography,
    },
    titleChip: {
        borderRadius: '4px',
        marginLeft: '8px',
        backgroundColor: Constant.themeObj.primary.light,
        color: 'white',
        fontWeight: 'bolder',
        height: '23px',
        paddingRight: '0px !important',
    },
});

class SecuritiesBox extends React.Component {
    constructor(props) {
        super(props);
        this.createAccordion = this.createAccordion.bind(this);
        this.t = this.props.t;
        this.state = {
            firstActivate: {
                neighbouACL: true,
                acl: false,
            },
        };
    }

    createAccordion(title, content, defaultExpanded, key, activateCB) {
        const {classes} = this.props;
        return (
            <Accordion
                classes={{
                    expanded: classes.expansionPanelExpanded,
                    root: classes.expansionPanelRoot,
                }}
                defaultExpanded={defaultExpanded}
                onChange={(event, expanded) => {
                    if (!this.state.firstActivate[key] && expanded) {
                        if (activateCB) activateCB();
                        this.setState({
                            ...this.state,
                            firstActivate: {
                                ...this.state.firstActivate,
                                acl: true,
                            },
                        });
                    }
                }}
            >
                <AccordionSummary
                    expandIcon={<i className="material-icons">expand_more</i>}
                    style={{maxHeight: '40px', minHeight: '40px'}}
                >
                    {title}
                </AccordionSummary>
                <AccordionDetails
                    style={{padding: '0px 24px 20px 24px', display: 'block'}}
                >
                    {content}
                </AccordionDetails>
            </Accordion>
        );
    }

    render() {
        const {classes} = this.props;
        const {theme} = Constant;
        const aclTitle = (
            <React.Fragment>
                <div
                    style={{display: 'flex', alignItems: 'center'}}
                >
                    {this.t('aclTitle')}
                </div>
                <Chip
                    label={this.t('beta')}
                    className={classes.titleChip}
                    variant="outlined"
                />
            </React.Fragment>
        );
        const neighbourACLTitle = (
            <div
                style={{display: 'flex', alignItems: 'center'}}
            >
                {this.t('neighbourACLTitle')}
            </div>
        );

        return (
            <MuiThemeProvider theme={theme}>
                <div style={{padding: '20px', overflowY: 'auto', height: 'auto'}}>
                    {this.createAccordion(
                        neighbourACLTitle,
                        <NeighborAccessControlList
                            nodes={this.props.nodes}
                            close={this.props.close}
                            pollingHandler={this.props.pollingHandler}
                            updateIsLock={this.props.updateIsLock}
                        />,
                        true,
                        'neighbouACL'
                    )}
                    {this.createAccordion(
                        aclTitle,
                        <AccessControlList
                            nodes={this.props.nodes}
                            close={this.props.close}
                            pollingHandler={this.props.pollingHandler}
                            updateIsLock={this.props.updateIsLock}
                            activate={(activate) => { this.activateACL = activate; }}
                        />,
                        false,
                        'acl',
                        this.activateACL
                    )}
                </div>
            </MuiThemeProvider>
        );
    }
}

SecuritiesBox.propTypes = {
    nodes: PropTypes.arrayOf(
        PropTypes.shape({
            ipv4: PropTypes.string.isRequired,
            hostname: PropTypes.string.isRequired,
            model: PropTypes.string.isRequired,
            fwVersion: PropTypes.string.isRequired,
        })
    ).isRequired,
    close: PropTypes.func.isRequired,
    classes: PropTypes.objectOf(PropTypes.string).isRequired,
    pollingHandler: PropTypes.shape(
        {
            restartInterval: PropTypes.func.isRequired,
            stopInterval: PropTypes.func.isRequired,
        }
    ).isRequired,
    updateIsLock: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
};

const tSecuritiesBox = SecuritiesBox;
export {tSecuritiesBox};

export default compose(
    withTranslation(['node-security']),
    withStyles(styles)
)(SecuritiesBox);
