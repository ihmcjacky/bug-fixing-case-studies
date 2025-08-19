import React from 'react';
import PropTypes from 'prop-types';
import makeStyles from '@material-ui/core/styles/makeStyles';
import Card from '@material-ui/core/Card';
import FormControl from '@material-ui/core/FormControl';
import ListItemText from '@material-ui/core/ListItemText';
import MenuItem from '@material-ui/core/MenuItem';
import Select from '@material-ui/core/Select';
import Typography from '@material-ui/core/Typography';
import {
    CartesianGrid,
    LineChart,
    Line,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    Label,
} from 'recharts';
import {NotAxisTickButLabel, YAxisTickButLabel} from './StatisticGraphLabel';
import StatisticConstants from '../../constants/statistic';

const useStyles = makeStyles({
    cardRoot: {
        margin: 'auto',
        marginBottom: '25px',
        width: '400px',
        height: '400px',
        display: 'inline-block',
    },
    title: {
        width: '95%',
        padding: '10px',
        paddingLeft: '35px',
        flex: 1,
    },
    titleWrapper: {
        display: 'flex',
    },
    unitFormControl: {
        minWidth: '8%',
        width: '8%',
        position: 'absolute',
        marginLeft: '5px',
    },
});

const MenuProps = {
    getContentAnchorEl: null,
    anchorOrigin: {
        vertical: 'top',
        horizontal: 'left',
    },
};

const {byteStatisticOpt, dataUnitOpt, packetUnitOpt} = StatisticConstants

const StatisticDetailGraph = (props) => {
    const {
        t,
        title, color,
        unit,
        data,
        interfaceName, statName,
        handleUnitChange,
    } = props;
    const classes = useStyles();

    const isBytesUnit = byteStatisticOpt.includes(statName);
    const unitOpt = isBytesUnit ? dataUnitOpt : packetUnitOpt;

    return (
        <Card classes={{root: classes.cardRoot}} >
            <FormControl className={classes.unitFormControl} >
                <Select
                    disableUnderline
                    value={unit}
                    onChange={handleUnitChange}
                    MenuProps={MenuProps}
                    renderValue={() => (
                        <Typography className={classes.label} >
                            {t(unit)}
                        </Typography>
                    )}
                >
                    {unitOpt.map(opt => (
                        <MenuItem key={opt} value={opt} >
                            <ListItemText primary={t(opt)} />
                        </MenuItem>
                    ))}
                </Select>
            </FormControl>
            <div className={classes.titleWrapper}>
                <Typography
                    variant="body1"
                    align="center"
                    classes={{root: classes.title}}
                    gutterBottom
                >
                    {title}
                </Typography>
            </div>
            <ResponsiveContainer
                width="100%"
                height="85%"
                minHeight="320px"
                minWidth="400px"
            >
                <LineChart
                    margin={{
                        top: 5,
                        right: 20,
                        bottom: 5,
                        left: 0,
                    }}
                    data={data}
                >
                    <XAxis
                        interval={0}
                        dataKey="timestamp"
                        tick={<NotAxisTickButLabel fontSize="8px" angle={-45} color="#232425" />}
                    />
                    <YAxis
                        axisLine={false}
                        minTickGap={10}
                        tick={<YAxisTickButLabel angle={-45} color="#232425" />}
                    >
                        <Label
                            position="top"
                            angle={0}
                            style={{
                                fontFamily: 'Roboto',
                                fontSize: '12px',
                                transform: 'translate(10px, -20px)',
                                fontWeight: 'bold',
                            }}
                        />
                    </YAxis>
                    <Line
                        type="monotone"
                        dataKey={`${interfaceName}-${statName}`}
                        stroke={color}
                        activeDot={{stroke: color, strokeWidth: 2, r: 4}}
                        isAnimationActive={false}
                        dot={{stroke: color, strokeWidth: 2, r: 4}}
                        unit={t(unit)}
                    />
                    <Tooltip
                        wrapperStyle={{fontSize: '10px', fontFamily: 'Roboto'}}
                        formatter={(value, name) => [`${value} `, t(name)]}
                    />
                    <CartesianGrid vertical={false} />
                </LineChart>
            </ResponsiveContainer>
        </Card>
    );
};

StatisticDetailGraph.propTypes = {
    t: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    unit: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    interfaceName: PropTypes.string.isRequired,
    statName: PropTypes.string.isRequired,
    data: PropTypes.arrayOf(PropTypes.shape({
        id: PropTypes.number,
        timestamp: PropTypes.string,
    })).isRequired,
    handleUnitChange: PropTypes.func.isRequired,
};

export default StatisticDetailGraph;
