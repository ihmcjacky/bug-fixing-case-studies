/**
 * @Author: mango
 * @Date:   2018-04-10T14:57:30+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-11-13T10:52:59+08:00
 */
import React from 'react';
import Grid from '@material-ui/core/Grid';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';
import {withStyles} from '@material-ui/core/styles';
import Parser from 'html-react-parser';

const styles = () => ({
    root: {
        flexGrow: 1,
    },
});

function P2PointsToNote(props) {
    return (
        <Grid item xs={12} sm={12} style={props.style.fwNoteGrid}>
            <Typography variant="h6" style={props.style.fwNoteTitle}>
                {props.noteTitle}
            </Typography>
            {
                props.noteCtxArr.map(
                    noteCtx => (
                        <Typography
                            style={props.style.fwNoteItem}
                            key={noteCtx.key}
                            variant="body2"
                        >{Parser(noteCtx.ctx)}</Typography>
                    )
                )
            }
        </Grid>
    );
}

P2PointsToNote.propTypes = {
    noteTitle: PropTypes.string.isRequired,
    noteCtxArr: PropTypes.array.isRequired,// eslint-disable-line
    style: PropTypes.objectOf(PropTypes.object),
    classes: PropTypes.object.isRequired, //eslint-disable-line
};

P2PointsToNote.defaultProps = {
    style: {
        fwNoteGrid: {
            fontSize: 14,
            marginTop: '20px',
        },
        fwNoteTitle: {
            marginBottom: '10px',
            fontSize: '14px',
        },
        fwNoteItem: {
            fontWeight: 400,
            fontSize: 12,
        },
    },
};

export default withStyles(styles)(P2PointsToNote);
