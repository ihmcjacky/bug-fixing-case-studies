/**
 * @Author: mango
 * @Date:   2018-05-15T14:02:50+08:00
 * @Last modified by:   mango
 * @Last modified time: 2018-05-15T16:11:01+08:00
 */
export function insertZero(dateValue) {
    if (dateValue < 10) {
        return `0${dateValue.toString()}`;
    }
    return dateValue;
}

export function getCurrentDate(type) {
    const date = new Date();
    const day = insertZero(date.getDate());
    const month = insertZero(date.getMonth() + 1);
    const year = insertZero(date.getFullYear());
    const hour = insertZero(date.getHours());
    const minute = insertZero(date.getMinutes());
    const second = insertZero(date.getSeconds());

    let returnDate = date;
    switch (type) {
        case 'date':
            returnDate = `${year}-${month}-${day}`;
            break;
        case 'dateTime':
            returnDate = `${year}-${month}-${day} ${hour}:${minute}:${second}`;
            break;
        default:
            returnDate = date;
    }
    return returnDate;
}
