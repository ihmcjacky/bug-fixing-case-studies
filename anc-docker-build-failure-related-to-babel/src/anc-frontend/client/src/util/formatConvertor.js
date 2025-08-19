/**
 * @Author: mango
 * @Date:   2018-05-25T10:55:45+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-09-05T11:16:28+08:00
 */
import i18n from '../I18n';

export function convertUptime(time) {
    const secNum = parseInt(time, 10);
    let days = Math.floor(secNum / (3600 * 24));
    let hours = Math.floor((secNum / 3600) % 24);
    let minutes = Math.floor((secNum % 3600) / 60);
    const times = i18n.t('timeUnit', {returnObjects: true});
    if (days < 10) {
        days = `0${days}`;
    }
    if (hours < 10) {
        hours = `0${hours}`;
    }
    if (minutes < 10) {
        minutes = `0${minutes}`;
    }
    const returnTime = `${days}${times.day}:${hours}${times.hour}:${minutes}${times.minute}`;
    return returnTime;
}

export function convertBytes(bytes) {
    const storage = i18n.t('storageUnit', {returnObjects: true});
    const units = [storage.bytes, storage.KB, storage.MB, storage.GB,
        storage.TB, storage.PB, storage.EB, storage.ZB, storage.YB];

    let l = 0;
    let n = parseInt(bytes, 10) || 0;

    while (n >= 1000) {
        l += 1;
        n /= 1000;
    }

    const value = n.toFixed(n >= 10 || l < 1 ? 0 : 1);

    return `${value} ${units[l]}`;
}

export function convertUnit(value) {
    const number = i18n.t('numberUnit', {returnObjects: true});
    let returnValue = value;
    if (value >= 10 ** 3 && value < 10 ** 6) {
        returnValue = value / (10 ** 3);
        returnValue = `${returnValue.toFixed(0)} ${number.kilo}`;
    } else if (value >= 10 ** 6 && value < 10 ** 9) {
        returnValue = value / (10 ** 6);
        returnValue = `${returnValue.toFixed(0)} ${number.mega}`;
    } else if (value >= 10 ** 9 && value < 10 ** 12) {
        returnValue = value / (10 ** 9);
        returnValue = `${returnValue.toFixed(0)} ${number.giga}`;
    } else if (value >= 10 ** 12 && value < 10 ** 15) {
        returnValue = value / (10 ** 12);
        returnValue = `${returnValue.toFixed(0)} ${number.tera}`;
    }

    return returnValue;
}

export function isValidIP(ip) {
    const ipPattern = /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    return ipPattern.test(ip);
}

export function convertIpToMac(ip) {
    try {
        if (!isValidIP(ip) || typeof ip !== 'string') return '-';
        const ipParts = ip.split('.').splice(1).map(n => parseInt(n, 10).toString(16).toUpperCase().padStart(2, '0'));
        let mac = '64:9A:12:';
        mac += ipParts[0][1];
        for (let i = 1; i <= 2; i += 1) {
            mac += ipParts[i][0];
            mac += ':';
            mac += ipParts[i][1];
        }
        mac += '0';
        return mac;
    } catch (e) {
        console.log(ip)
        console.error(e);
    }
}


export function getBitRate(bitRate) {
    const unit = i18n.t('bitRateUnit', {returnObjects: true});
    if (typeof bitRate === 'number') {
        if (bitRate === 0) {
            return '-';
        } else if (bitRate % 1000000000 === 0) {
            return `${bitRate / 1000000000} ${unit['gbps']}`;
        } else if (bitRate % 1000000 === 0) {
            return `${bitRate / 1000000} ${unit['mbps']}`;
        } else if (bitRate % 1000 === 0) {
            return `${bitRate / 1000} ${unit['kbps']}`;
        }
        return `${bitRate} ${unit['bps']}`;
    }
    if (typeof bitRate === 'string' && bitRate === '') {
        return unit['hyphen'];
    }
    return bitRate;
}

// convertor color code to rgb object
export function colorStringToObj(color) {
    const rgb = {r: 0, g: 0, b: 0};
    if (color.match(/^#[0-9a-fA-F]{6}/)) { // case for string #aaaaaa
        rgb.r = parseInt(color[1] + color[2], 16);
        rgb.g = parseInt(color[3] + color[4], 16);
        rgb.b = parseInt(color[5] + color[6], 16);
    } else if (color.match(/^#[0-9a-fA-F]{3}/)) { // case for string #aaa
        rgb.r = parseInt(color[1] + color[1], 16);
        rgb.g = parseInt(color[2] + color[2], 16);
        rgb.b = parseInt(color[3] + color[3], 16);
    } else if (color.match(/rgb\((\d{1,3}),( |)(\d{1,3}),( |)(\d{1,3})\)/)) { // case for string rgb(255, 255, 255)
        const rex = /rgb\((\d{1,3}),( |)(\d{1,3}),( |)(\d{1,3})\)/;
        const arr = rex.exec(color);
        rgb.r = parseInt(arr[1], 10);
        rgb.g = parseInt(arr[3], 10);
        rgb.b = parseInt(arr[5], 10);
    }
    return rgb;
}

export function convertSpeed(value, t, shortFormUnit) {
    // Check for invalid input
    if (
        value === '-' ||
        value === undefined ||
        value === 'notSupport' ||
        !(typeof value === 'string' || typeof value === 'number')
    ) {
        return '-';
    }

    const bits = Number(value);

    if (bits <= 0) {
        return `0 ${t('Mbps')}`;
    }
    let units = ['bps', 'kbps', 'Mbps', 'Gbps', 'Tbps'];
    if (shortFormUnit) {
        units = ['b', 'k', 'M', 'G', 'T'];
    }
    const thresholds = [1e0, 1e3, 1e6, 1e9, 1e12];

    let i = thresholds.findIndex(threshold => bits < threshold);

    if (i === -1) i = units.length; // If speed is higher than Tbps

    // Convert to the correct unit
    const convertedValue = bits / thresholds[i - 1];

    // If the decimal part of convertedValue is 0, return as integer
    if (Math.floor(convertedValue) === convertedValue) {
        if (shortFormUnit) return `${Math.floor(convertedValue)}${t(units[i - 1])}`;
        return `${Math.floor(convertedValue)} ${t(units[i - 1])}`;
    }

    // Otherwise, return with one decimal place
    return `${convertedValue.toFixed(1)} ${t(units[i - 1])}`;
};
