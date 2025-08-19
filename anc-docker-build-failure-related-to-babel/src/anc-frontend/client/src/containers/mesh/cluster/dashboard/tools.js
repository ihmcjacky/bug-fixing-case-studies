export function getRadioRange(channel, channelBandwidth, frequency) {
    const channelBandwidthNum = parseInt(channelBandwidth.replace(' MHz', ''), 10);
    const frequencyNum = parseInt(frequency.replace('MHz'), 10);

    if (parseInt(frequencyNum / 100, 10) === 49) {
        return [
            frequencyNum - (channelBandwidthNum / 2),
            frequencyNum,
            frequencyNum + (channelBandwidthNum / 2),
        ];
    }

    const channelNum = parseInt(channel, 10);
    const frequencyRange = [
        frequencyNum - (channelBandwidthNum / 2),
        frequencyNum + (channelBandwidthNum / 2),
    ];
    const channelRange = [
        (frequencyRange[0] - 5000) / 5,
        (frequencyRange[1] - 5000) / 5,
    ];
    return [
        channelRange[0],
        channelNum,
        channelRange[1],
    ];
}
