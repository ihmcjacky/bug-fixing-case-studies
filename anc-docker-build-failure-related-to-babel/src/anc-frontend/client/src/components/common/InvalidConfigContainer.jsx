/* eslint-disable react/prop-types */
/* eslint-disable react/forbid-prop-types */
/**
 * @ Author: Kyle Suen
 * @ Create Time: 2020-01-13 11:12:11
 * @ Modified by: Kyle Suen
 * @ Modified time: 2021-01-27 17:43:40
 * @ Description:
 */

import React, {useState, useEffect} from 'react';
import {makeStyles} from '@material-ui/core/styles';
import PropTypes from 'prop-types';
import {withTranslation} from 'react-i18next';
import Typography from '@material-ui/core/Typography';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import Accordion from '@material-ui/core/Accordion';
import Chip from '@material-ui/core/Chip';
import Grid from '@material-ui/core/Grid';
import Constant from '../../constants/common';

const useStyles = makeStyles({
    chip: {
        height: '25px',
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
    },
});

const InvalidConfigContainer = ({
    meshSettings, radioSettings, nodeSettings,
    ethernetSettings, profileSettings, expanded, children, hostnameMap,
    macMap, t, open,
}) => {
    const [expandedMesh, setExpandedMesh] = useState(expanded.meshSettings);
    const [expandedNode, setExpandedNode] = useState(expanded.node);
    const {colors} = Constant;
    const classes = useStyles();

    useEffect(() => {
        setExpandedMesh(expanded.meshSettings);
        setExpandedNode(expanded.node);
    }, [expanded]);

    const handleExpand = (userExpanded, nodeIp) => {
        if (nodeIp !== 'meshSettings') {
            setExpandedNode(prevState => ({
                ...prevState,
                [nodeIp]: userExpanded,
            }));
        } else {
            setExpandedMesh(userExpanded);
        }
    };

    const createInvalidExpansionPanel = (
        {
            invalidMeshSettings = {},
            invalidRadioSettings = {},
            invalidNodeSettings = {},
            invalidEthernetSettings = {},
            invalidProfileSettings = {},
        },
        hostname = 'meshSettings',
        mac,
        nodeIp,
        invalidExpanded,
        isMeshSettings) => {
        const title = isMeshSettings ?
            (<span
                style={{
                    display: 'flex',
                    alignItems: 'baseline',
                    color: colors.dialogText,
                }}
            >
                <Typography variant="h6" color="inherit">
                    {t('meshSettingsLbl')}
                </Typography>
            </span>)
            : (
                <span
                    style={{
                        display: 'flex',
                        alignItems: 'baseline',
                        color: colors.dialogText,
                    }}
                >
                    {!invalidExpanded ?
                        <Typography
                            style={{
                                overflow: 'hidden',
                                whiteSpace: 'nowrap',
                                textOverflow: 'ellipsis',
                                maxWidth: '140px',
                            }}
                            variant="h6"
                            color="inherit"
                        >
                            {hostname}
                        </Typography> :
                        <Typography
                            variant="h6"
                            color="inherit"
                        >
                            {hostname}
                        </Typography>
                    }
                    <Typography style={{marginLeft: '5px'}} variant="subtitle2" color="inherit">
                        {`  (${mac})`}
                    </Typography>
                </span>
            );

        const gridContent = (
            <Grid container>
                {
                    Object.keys(invalidMeshSettings).length > 0 && (
                        <span
                            style={{
                                display: 'flex',
                                flexDirection: 'column',
                            }}
                        >
                            {Object.keys(invalidMeshSettings).map(opt =>
                                (
                                    <span
                                        style={{
                                            display: 'flex',
                                            padding: '5px 0px 5px 20px',
                                        }}
                                        key={`${invalidMeshSettings}_${opt}`}
                                    >
                                        <Typography
                                            style={{color: colors.dialogText, paddingRight: '5px'}}
                                        >
                                            {t('meshSettings', {returnObjects: true})[opt]}
                                        </Typography>
                                        <Typography
                                            style={{color: 'red'}}
                                        >
                                            {`(${
                                                t('invalidType', {returnObjects: true})[invalidMeshSettings[opt]]
                                            })`}
                                        </Typography>
                                    </span>
                                )
                            )}
                        </span>
                    )
                }
                {
                    (Object.keys(invalidNodeSettings).length > 0 ||
                    Object.keys(invalidProfileSettings).length > 0) && (
                        <Grid
                            item
                            xs={12}
                            style={{
                                textAlign: 'left',
                                paddingBottom: '15px',
                            }}
                            // key={radioName}
                        >
                            <span
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                {
                                    Object.keys(invalidNodeSettings).length > 0 &&
                                    Object.keys(invalidNodeSettings).map((opt) => {
                                        console.log(invalidNodeSettings);
                                        return (
                                            <span
                                                style={{
                                                    display: 'flex',
                                                    padding: '5px 0px 5px 20px',
                                                }}
                                                key={`${invalidNodeSettings}_${opt}`}
                                            >
                                                <Typography
                                                    style={{
                                                        color: colors.dialogText,
                                                        paddingRight: '5px',
                                                        fontSize: '0.8rem',
                                                    }}
                                                >
                                                    {t('nodeSettings', {returnObjects: true})[opt]}
                                                </Typography>
                                                <Typography
                                                    style={{color: 'red', fontSize: '0.8rem'}}
                                                >
                                                    {`(${
                                                        t('invalidType',
                                                            {returnObjects: true})[invalidNodeSettings[opt]]
                                                    })`}
                                                </Typography>
                                            </span>
                                        )
                                    })
                                }
                                {Object.keys(invalidProfileSettings).length > 0 &&
                                Object.keys(invalidProfileSettings).map(profileOpt =>
                                    Object.keys(invalidProfileSettings[profileOpt]).map(profileId =>
                                        Object.keys(invalidProfileSettings[profileOpt][profileId]).map(opt =>
                                            (
                                                <span
                                                    style={{
                                                        display: 'flex',
                                                        padding: '5px 0px 5px 20px',
                                                    }}
                                                    key={`${invalidProfileSettings}_${profileOpt}_${profileId}_${opt}`}
                                                >
                                                    <Typography
                                                        style={{
                                                            color: colors.dialogText,
                                                            paddingRight: '5px',
                                                            fontSize: '0.8rem',
                                                        }}
                                                    >
                                                        {t('profileSettings', {returnObjects: true})[opt]}
                                                    </Typography>
                                                    <Typography
                                                        style={{color: 'red', fontSize: '0.8rem'}}
                                                    >
                                                        {`(${
                                                            t('invalidType',
                                                                {returnObjects: true})
                                                                [invalidProfileSettings[profileOpt][profileId][opt]]
                                                        })`}
                                                    </Typography>
                                                </span>
                                            )
                                        )
                                    )
                                )}
                            </span>
                        </Grid>
                    )
                }
                {
                    Object.keys(invalidRadioSettings).length > 0 &&
                    Object.keys(invalidRadioSettings).map(radioName => (
                        <Grid
                            item
                            xs={12 / Object.keys(invalidRadioSettings).length}
                            style={{
                                textAlign: 'left',
                                paddingBottom: '15px',
                            }}
                            key={radioName}
                        >
                            <span
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <Typography
                                    style={{
                                        color: colors.dialogText,
                                        padding: '0px 0px 5px 20px',
                                        marginBottom: '5px',
                                        borderBottom: '0.032em solid rgba(33, 33, 33, 0.5)',
                                    }}
                                >
                                    {t('radioTitle', {returnObjects: true})[radioName]}
                                </Typography>
                                {
                                    Object.keys(invalidRadioSettings[radioName]).map(opt =>
                                        (
                                            <span
                                                style={{
                                                    display: 'flex',
                                                    padding: '5px 0px 5px 20px',
                                                }}
                                                key={`${radioName}_${opt}`}
                                            >
                                                <Typography
                                                    style={{
                                                        color: colors.dialogText,
                                                        paddingRight: '5px',
                                                        fontSize: '0.8rem',
                                                    }}
                                                >
                                                    {t('radioSettings', {returnObjects: true})[opt]}
                                                </Typography>
                                                <Typography
                                                    style={{color: 'red', fontSize: '0.8rem'}}
                                                >
                                                    {`(${t('invalidType',
                                                        {returnObjects: true})[invalidRadioSettings[radioName][opt]]})`}
                                                </Typography>
                                            </span>
                                        )
                                    )
                                }
                            </span>
                        </Grid>
                    ))
                }
                {
                    Object.keys(invalidEthernetSettings).length > 0 &&
                    Object.keys(invalidEthernetSettings).map(ethName => (
                        <Grid
                            item
                            xs={12 / Object.keys(invalidEthernetSettings).length}
                            style={{
                                textAlign: 'left',
                                paddingBottom: '15px',
                            }}
                            key={ethName}
                        >
                            <span
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                }}
                            >
                                <Typography
                                    style={{
                                        color: colors.dialogText,
                                        padding: '0px 0px 5px 20px',
                                        marginBottom: '5px',
                                        borderBottom: '0.032em solid rgba(33, 33, 33, 0.5)',
                                    }}
                                >
                                    {t('ethTitle', {returnObjects: true})[ethName]}
                                </Typography>
                                {
                                    Object.keys(invalidEthernetSettings[ethName]).map(opt =>
                                        (
                                            <span
                                                style={{
                                                    display: 'flex',
                                                    padding: '5px 0px 5px 20px',
                                                }}
                                                key={`${ethName}_${opt}`}
                                            >
                                                <Typography
                                                    style={{
                                                        color: colors.dialogText,
                                                        paddingRight: '5px',
                                                        fontSize: '0.8rem',
                                                    }}
                                                >
                                                    {t('ethernetSettings', {returnObjects: true})[opt]}
                                                </Typography>
                                                <Typography
                                                    style={{color: 'red', fontSize: '0.8rem'}}
                                                >
                                                    {`(${t('invalidType',
                                                        {returnObjects: true})[invalidEthernetSettings[ethName][opt]]
                                                    })`}
                                                </Typography>
                                            </span>
                                        )
                                    )
                                }
                            </span>
                        </Grid>
                    ))
                }
            </Grid>
        );

        return (
            <span key={hostname}>
                <Accordion
                    classes={{
                        expanded: classes.expansionPanelExpanded,
                        root: classes.expansionPanelRoot,
                    }}
                    style={{
                        boxShadow: 'none',
                        marginBottom: '0px',
                    }}
                    expanded={invalidExpanded}
                    square
                    onChange={(event, expand) => handleExpand(expand, nodeIp)}
                >
                    <AccordionSummary
                        expandIcon={<i className="material-icons">expand_more</i>}
                        style={{
                            maxHeight: '40px',
                            minHeight: '40px',
                            paddingRight: '15px',
                            paddingLeft: '5px',
                        }}
                    >
                        {title}
                        {(!invalidExpanded && !isMeshSettings) &&
                            <div
                                style={{
                                    marginLeft: 'auto',
                                }}
                            >
                                {
                                    Object.keys(invalidRadioSettings).map(radioName => (
                                        <Chip
                                            style={{
                                                padding: '0px 2px',
                                                margin: '5px 0px 0px 10px',
                                            }}
                                            key={radioName}
                                            label={t('radioTitle', {returnObjects: true})[radioName]}
                                            variant="outlined"
                                            classes={{
                                                root: classes.chip,
                                            }}
                                        />
                                    ))
                                }
                                {
                                    Object.keys(invalidEthernetSettings).map(ethName => (
                                        <Chip
                                            style={{
                                                padding: '0px 2px',
                                                margin: '5px 0px 0px 10px',
                                            }}
                                            key={ethName}
                                            label={t('ethTitle', {returnObjects: true})[ethName]}
                                            variant="outlined"
                                            classes={{
                                                root: classes.chip,
                                            }}
                                        />
                                    ))
                                }
                            </div>
                        }
                    </AccordionSummary>
                    <AccordionDetails
                        style={{padding: '10px 24px 20px 24px', display: 'block'}}
                    >
                        {gridContent}
                    </AccordionDetails>
                </Accordion>
                <hr style={{border: '0.032em solid rgba(33, 33, 33, 0.10)'}} />
            </span>
        );
    };

    const genContent = () => (open ? (
        <div
            style={{
                marginTop: '15px',
                overflowY: 'auto',
                maxHeight: '40vh',
            }}
        >
            <hr style={{border: '0.032em solid rgba(33, 33, 33, 0.10)'}} />
            {
                Object.keys(meshSettings).length > 0 && createInvalidExpansionPanel(
                    {invalidMeshSettings: meshSettings},
                    'meshSettings',
                    null,
                    'meshSettings',
                    expandedMesh,
                    true
                )
            }
            {
                Object.keys(expandedNode).map(nodeIp => createInvalidExpansionPanel(
                    {
                        ...(radioSettings[nodeIp] && {invalidRadioSettings: radioSettings[nodeIp]}),
                        ...(nodeSettings[nodeIp] && {invalidNodeSettings: nodeSettings[nodeIp]}),
                        ...(ethernetSettings[nodeIp] && {invalidEthernetSettings: ethernetSettings[nodeIp]}),
                        ...(profileSettings[nodeIp] && {invalidProfileSettings: profileSettings[nodeIp]}),
                    },
                    hostnameMap[nodeIp],
                    macMap[nodeIp],
                    nodeIp,
                    expandedNode[nodeIp],
                    false
                ))
            }
        </div>
    ) : <span />);

    return children(open, genContent());
};

InvalidConfigContainer.propTypes = {
    children: PropTypes.func.isRequired,
    open: PropTypes.bool.isRequired,
    meshSettings: PropTypes.object.isRequired,
    nodeSettings: PropTypes.object.isRequired,
    radioSettings: PropTypes.object.isRequired,
    ethernetSettings: PropTypes.object.isRequired,
    profileSettings: PropTypes.object.isRequired,
    expanded: PropTypes.shape({
        meshSettings: PropTypes.oneOfType([PropTypes.object, PropTypes.bool]).isRequired,
        node: PropTypes.object.isRequired,
    }).isRequired,
    hostnameMap: PropTypes.objectOf(PropTypes.string).isRequired,
    macMap: PropTypes.objectOf(PropTypes.string).isRequired,
};

export default withTranslation(['invalid-config'])(InvalidConfigContainer);
