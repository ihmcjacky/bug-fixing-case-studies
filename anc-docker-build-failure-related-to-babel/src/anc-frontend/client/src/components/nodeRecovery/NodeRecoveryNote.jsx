import React from 'react';
import PropTypes from 'prop-types';
import Grid from '@material-ui/core/Grid';
import Typography from '@material-ui/core/Typography';

const NodeRecoveryNote = (props) => {
    const {t} = props;

    const noteArr = [
        t('note1'),
        t('note2'),
        t('note3'),
        t('note4'),
    ];

    return (
        <Grid item xs={12} sm={12}>
            <Typography variant="h6">
                <b>{t('noteTitle')}</b>
            </Typography>
            {
                noteArr.map((ctx, idx) => (
                    <Typography
                        key={`note-${idx}`}
                        variant="body2"
                        style={{paddingTop: 5}}
                    >
                        <b>{idx + 1}. </b>
                        {ctx}
                    </Typography>
                ))
            }
        </Grid>
    )
};

NodeRecoveryNote.propTypes = {
    t: PropTypes.func.isRequired,
};

export default NodeRecoveryNote;
