import React from 'react';
import PropTypes from 'prop-types';
import {filterRange} from '../../redux/dashboard/dashboardConstants';
import RangeSlider from './RangeSlider';
import P2Dialog from './P2Dialog';

export default function SliderDialog(props) {
    const {
        t,
        open,
        confirmFunc,
        closeFunc,
        title,
        subTitle,
        sliderItems,
        nonSliderItems,
        selectedLinkType,
    } = props;
    const [value, setValue] = React.useState(sliderItems);

    const handleSliderOnChange = (type, data) => {
        const temp = value.slice();
        const target = temp.find(d => d.title === type);
        target.min = data[0] <= data[1] ? data[0] : data[1];
        target.max = data[0] > data[1] ? data[0] : data[1];
        setValue(temp);
    };

    const handleSliderOnClose = () => {
        // setValue(value);
        props.closeFunc();
    };

    const dialogTitle = (
        <div
            style={{
                userSelect: 'none',
            }}
        >
            <div>
                {title}
            </div>
            <div
                style={{
                    color: 'rgba(33, 33, 33, 0.37)',
                    fontSize: '15px',
                    fontWeight: 400,
                }}
            >
                {subTitle}
            </div>
        </div>
    );

    return (
        <P2Dialog
            open={open}
            handleClose={closeFunc}
            title={dialogTitle}
            content=""
            nonTextContent={
                <div
                    style={{
                        width: '750px',
                        paddingLeft: '10px',
                        paddingRight: '10px',
                    }}
                >
                    {nonSliderItems}
                    { selectedLinkType !== 'eth' ?
                        value.map((v, i) => (
                            <div
                                key={`slider-${v.title}`}
                                style={{
                                    paddingTop: i === 0 ? '0px' : '25px',
                                    paddingBottom: i === value.length - 1 ? '20px' : '0px',
                                }}
                            >
                                <div
                                    style={{
                                        userSelect: 'none',
                                        fontFamily: 'roboto',
                                        paddingBottom: '10px',
                                        marginLeft: '-10px',
                                    }}
                                >
                                    {t(v.title)}
                                </div>
                                <RangeSlider
                                    value={[v.min, v.max]}
                                    min={filterRange[v.title].min}
                                    max={filterRange[v.title].max}
                                    handleSliderOnChange={data => handleSliderOnChange(v.title, data)}
                                    unit={filterRange[v.title].unit}
                                    thumbStyle={{
                                        width: 10,
                                        height: 15,
                                        color: '#425581',
                                        levelFontSize: 14,
                                    }}
                                    trackStyle={{
                                        color: '#425581',
                                        headColor: '#425581',
                                        tailColor: '#425581',
                                    }}
                                    labelStyle={{
                                        fontSize: 14,
                                        color: 'rgba(33, 33, 33, 0.37)',
                                    }}
                                />
                            </div>
                        )) : null
                    }
                </div>
            }
            actionTitle={t('confirm')}
            actionFn={() => confirmFunc(value)}
            cancelActTitle={t('cancel')}
            cancelActFn={handleSliderOnClose}
            maxWidth="md"
        />
    );
}

SliderDialog.propTypes = {
    open: PropTypes.bool.isRequired,
    confirmFunc: PropTypes.func.isRequired,
    closeFunc: PropTypes.func.isRequired,
    title: PropTypes.string.isRequired,
    subTitle: PropTypes.string.isRequired,
    sliderItems: PropTypes.arrayOf(PropTypes.shape({
        title: PropTypes.string.isRequired,
        min: PropTypes.number.isRequired,
        max: PropTypes.number.isRequired,
    })).isRequired,
    t: PropTypes.func.isRequired,
    nonSliderItems: PropTypes.element,
    selectedLinkType: PropTypes.string,
};

SliderDialog.defaultProps = {
    nonSliderItems: null,
    selectedLinkType: 'both',
};
