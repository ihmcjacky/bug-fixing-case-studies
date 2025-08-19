/**
 * @ Author: Kyle Suen
 * @ Create Time: 2019-07-19 12:57:21
 * @ Modified by: Kyle Suen
 * @ Modified time: 2019-07-29 18:07:01
 * @ Description:
 */
import React from 'react';
import PropTypes from 'prop-types';
import Menu from '@material-ui/core/Popover';
import MenuItem from '@material-ui/core/MenuItem';
import {Typography} from '@material-ui/core';
import {createMuiTheme, MuiThemeProvider} from '@material-ui/core/styles';
import Constant from '../../constants/common';

const {colors} = Constant;

function P2MenuList(props) {
    const theme = createMuiTheme({
        overrides: {
            MuiList: {
                padding: {
                    paddingTop: 0,
                    paddingBottom: 0,
                },
            },
            MuiMenuItem: {
                root: {
                    minHeight: 0,
                    lineHeight: 1.5,
                },
            },
        },
    });
    return (
        <MuiThemeProvider theme={theme}>
            <Menu
                getContentAnchorEl={null}
                anchorEl={props.anchorEl}
                open={Boolean(props.anchorEl)}
                style={{
                    padding: '5px 0px',
                }}
                anchorOrigin={{
                    vertical: 'bottom',
                    horizontal: 'left',
                }}
                transformOrigin={{
                    vertical: 'top',
                    horizontal: 'right',
                }}
            >
                {props.subHeader ?
                    <Typography
                        style={{
                            borderBottom: `0.5px solid ${colors.borderColor}`,
                            padding: '7px 16px',
                            fontSize: '14px',
                            color: colors.dataTxt,
                            fontWeight: 'bold',
                        }}
                    >
                        {props.subHeader}
                    </Typography> :
                    <span />
                }
                {props.menuOptions.map(option => (
                    <MenuItem
                        key={option.key}
                        selected={option.selected}
                        onClick={option.callback}
                        style={{
                            fontSize: '14px',
                            color: colors.dataTxt,
                            paddingTop: '8px',
                            paddingBottom: '8px',
                        }}
                    >
                        {option.title}
                    </MenuItem>
                ))}
            </Menu>
        </MuiThemeProvider>
    );
}

P2MenuList.propTypes = {
    menuOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
    anchorEl: PropTypes.oneOfType([PropTypes.object, PropTypes.string]),
    subHeader: PropTypes.string,
};

P2MenuList.defaultProps = {
    subHeader: '',
    anchorEl: null,
};

export default P2MenuList;

