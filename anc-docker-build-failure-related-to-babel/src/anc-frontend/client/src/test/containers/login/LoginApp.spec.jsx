/* eslint-disable no-unused-expressions */
import React from 'react';
import {expect} from 'chai';
import {shallow, configure} from 'enzyme';
import Adapter from "enzyme-adapter-react-16";
import {stub} from 'sinon';
import * as reactRedux from 'react-redux';
// import * as i18n from 'react-i18next';
// import {act} from 'react-dom/test-utils';
// import * as apiCall from '../../util/apiCall';
import LoginApp from '../../../containers/login/LoginApp';

configure({ adapter: new Adapter() });

// mock i18n
jest.mock('react-i18next', () => {
    const lng = require('../../../../public/locales/en/login.json');
    return {
        useTranslation: () => ({
            t: key => lng[key],
            ready: true,
        }),
    };
});

// jest.mock('react', () => ({
//     ...jest.requireActual('react'),
//     useLayoutEffect: jest.requireActual('react').useEffect,
// }));

describe('LoginApp component', function () {
    let stubUseDispatch;

    beforeEach(async function () {
        stubUseDispatch = stub(reactRedux, 'useDispatch').returns(() => {});
    });

    afterEach(async function () {
        stubUseDispatch.restore();
    });

    describe('render different form', function () {
        it('should render register form when hasUser false', async function () {
            const store = {
                anm: {hasUser: false},
                lang: 'en',
                csrf: 'test csrf',
            };
            const stubUseSelector = stub(reactRedux, 'useSelector').returns(store);
            const wrapper = shallow(<LoginApp />);

            expect(wrapper.find('#password-input').prop('test-id')).to.be.equals('register-password-form');
            stubUseSelector.restore();
        });

        it('should render login form when hasUser true', async function () {
            const store = {
                anm: {hasUser: true},
                lang: 'en',
                csrf: 'test csrf',
            };
            const stubUseSelector = stub(reactRedux, 'useSelector').returns(store);
            const wrapper = shallow(<LoginApp />);

            expect(wrapper.find('#password-input').prop('test-id')).to.be.equals('login-password-form');
            stubUseSelector.restore();
        });
    });
});
