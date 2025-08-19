import React from 'react';
import { Typography } from '@material-ui/core';
import { makeStyles } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import CommonConstants from '../constants/common';

const { footerStyleFn } = CommonConstants
const useStyles = makeStyles(footerStyleFn);

const Footer = ({t}) => {
    const classes = useStyles();
    const theme = useTheme();
    console.log(theme)
    return (
        <div className={classes.footerDiv}>
            <Typography
                align='right'
                className={classes.paddedTypography}
            >
                <span>{t("translate:poweredBy")}</span>
            </Typography>
        </div>
    )
}

export default Footer;