/**
 * @Author: mango
 * @Date:   2018-05-02T16:13:13+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-09-07T14:50:18+08:00
 */
import i18n from '../I18n';

export function isRequired(value) {
    if (value === '') {
        return false;
    }
    return true;
}

export function isIPv4(value) {
    const uint8Pattern = '(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)';
    const ipv4Regx = RegExp(`^((${uint8Pattern}\\.){3}${uint8Pattern})$`);

    if (ipv4Regx.test(value)) {
        return true;
    }
    return false;
}

export function matchRegex(value, regex) {
    if (regex.test(value)) {
        return true;
    }
    return false;
}

export function checkRange(value, min, max) {
    const valueInt = parseInt(value, 10);

    if ((typeof min !== 'undefined' && typeof max !== 'undefined')
    && (min <= valueInt && valueInt <= max)) {
        return true;
    } else if ((typeof min !== 'undefined' && typeof max === 'undefined') && min <= valueInt) {
        return true;
    } else if ((typeof min === 'undefined' && typeof max === 'undefined') && valueInt <= max) {
        return true;
    }
    return false;
}

export function formValidator(type, value, regex, helperText) {
    let textStr = '';
    const enumArr = [];

    if (typeof helperText !== 'undefined') {
        textStr = helperText;
    }
    switch (type) {
        case 'isRequired':
            if (!isRequired(value)) {
                textStr = i18n.t('requiredField');
            }
            return {result: isRequired(value), text: textStr};
        case 'isIPv4':
            if (!isIPv4(value)) {
                textStr = i18n.t('notIPv4Field');
            }
            return {result: isIPv4(value), text: textStr};
        case 'matchRegex':
            if (!matchRegex(value, regex)) {
                textStr = i18n.t('regexField');
            }
            return {result: matchRegex(value, regex), text: textStr};
        case 'enum':
            // check whether the input value is within the option range values
            regex.forEach((optionValueObj) => {
                enumArr.push(optionValueObj.actualValue);
            });
            if (!enumArr.includes(value)) {
                textStr = i18n.t('enumField');
            }
            return {result: enumArr.includes(value), text: textStr};
        case 'multiEnum':
            // "value" becomes array of user selected items
            // "regex" contains available options
            // check whether the input value is within the option range values for multiple options like acs channel list
            let normalCheckRes = true;
            
            regex.forEach((optionValueObj) => {
                enumArr.push(optionValueObj.actualValue);
            });
            
            value.forEach((eachSelVal) => {
                if (!enumArr.includes(eachSelVal)) {
                    textStr = i18n.t('enumField');
                    normalCheckRes = false;
                }
            });
            
            return { result: normalCheckRes, text: textStr };
        case 'checkRange':
            if (!checkRange(value, regex.min, regex.max)) {
                textStr = i18n.t('checkRangeField');
            }
            return {result: checkRange(value, regex.min, regex.max), text: textStr};
        default:
            return {result: false, text: i18n.t('runtimeErr')};
    }
}

export function isMacAddr(mac) {
    const regex = /^([a-fA-F0-9]{2}[:]){5}([a-fA-F0-9]{2})$/;

    return regex.test(mac);
}
