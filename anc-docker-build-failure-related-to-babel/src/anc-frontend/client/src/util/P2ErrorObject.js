/**
 * @Author: Jacky Lam <jacky>
 * @Date:   30-05-2018 10:55:33
 * @Email:  jackylam@p2wireless.com
 * @Last modified by:   jacky
 * @Last modified time: 07-06-2018 01:45:12
 * @Copyright: P2 Wireless Techologies
 */

/**
 * Handle error object, by Toby Tse & Jacky Lam
 * @type {[type]}
 */
// import {errObjMap} from '../constants/common';

export default class P2ErrorObject {
    constructor(obj) {
        Object.assign(this, obj);
    }
    
    is(errType) {
        return this.type === errType || this.type.startsWith(`${errType}.`);
    }
}
