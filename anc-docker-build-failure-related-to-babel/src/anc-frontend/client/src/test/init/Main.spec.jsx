/* eslint-disable no-unused-expressions */
import React from 'react';
import {expect} from 'chai';
import {shallow, configure, mount} from 'enzyme';
import Adapter from "enzyme-adapter-react-16";
import {stub, spy} from 'sinon';
import * as reactRedux from 'react-redux';
import {act} from 'react-dom/test-utils';
import {createBrowserHistory} from 'history';
import {Router} from 'react-router-dom';
import * as apiCall from '../../util/apiCall';
import Main from '../../init/Main';
import * as MainRouter from '../../init/MainRouter';
import * as InitFailPage from '../../init/InitFailPage';
import * as InitLoading from '../../init/InitLoading';
import * as i18n from '../../I18n';

configure({ adapter: new Adapter() });

describe('Main component', function () {
    let stubMainRouter;
    let stubUseDispatch;
    let stubI18nInit;
    let changeLang;
    let spyDispatch;

    beforeEach(async function () {
        window.nw = {};
        window.nw.App = {};
        window.nw.App.argv = ['hostname=localhost', 'port=8000'];

        stubMainRouter = stub(MainRouter, 'default').returns(<div test-id="mock-main-router" />);
        spyDispatch = spy();
        stubUseDispatch = stub(reactRedux, 'useDispatch').returns(spyDispatch);
        stubI18nInit = stub(i18n, 'initI18n').returns(() => {});
        changeLang = stub(i18n, 'changeLang').returns(() => {});
    });

    afterEach(async function () {
        delete window.nw;
        stubMainRouter.restore();
        stubUseDispatch.restore();
        stubI18nInit.restore();
        changeLang.restore();
    });


    describe('render content', function () {
        it('should show loading-state on first render', async function () {
            const stubInitLoadingPage = stub(InitLoading, 'default').returns(<div test-id="loading-state" />);
            const wrapper = shallow(<Main />);

            expect(wrapper.find(InitLoading.default)).to.be.exist;
            stubInitLoadingPage.restore();
        });

        it('should show loading-state on geting init data', async function () {
            const stubInitLoadingPage = stub(InitLoading, 'default').returns(<div test-id="loading-state" />);
            const stubInitFailPage = stub(InitFailPage, 'default').returns(<div test-id="loading-failed" />);
            const stubGetInitDataFunc = stub(apiCall, 'getInitData')
                .returns(new Promise((resolve, reject) => reject({})));

            let wrapper;
            await act(async function () {
                wrapper = mount(<Main />);
            });

            expect(wrapper.find(InitLoading.default)).to.be.exist;
            wrapper.update();
            expect(wrapper.find(InitFailPage.default)).to.be.exist;

            stubGetInitDataFunc.restore();
            stubInitFailPage.restore();
            stubInitLoadingPage.restore();
        });

        it('should show loading-failed on getInitData failed', async function () {
            const stubInitFailPage = stub(InitFailPage, 'default').returns(<div test-id="loading-failed" />);
            const stubGetInitDataFunc = stub(apiCall, 'getInitData')
                .returns(new Promise((resolve, reject) => reject()));

            let wrapper;
            await act(async function () {
                wrapper = mount(<Main />);
            });

            wrapper.update();
            expect(wrapper.find(InitFailPage.default)).to.be.exist;

            stubGetInitDataFunc.restore();
            stubInitFailPage.restore();
        });

        it('should show MainRouter on getInitData success', async function () {
            // since it is mount rendering will also render children components, to avoid this, stub the MainRouter component
            const stubGetInitDataFunc = stub(apiCall, 'getInitData')
                .returns(new Promise((resolve) => resolve({
                    hasUser: false,
                    loggedinAnm: false,
                    csrfToken: 'test',
                    lang: 'test',
                })));
            const mockHistory = createBrowserHistory();

            let wrapper;
            await act(async function () {
                wrapper = mount(
                    <Router history={mockHistory} >
                        <Main />
                    </Router>
                );
            });

            wrapper.update();
            expect(wrapper.find(MainRouter.default)).to.be.exist;

            stubGetInitDataFunc.restore();
        });
    });

    describe('path checker', function () {
        it('should replace the pathname to /login when not logged in anm', async function () {
            const stubGetInitDataFunc = stub(apiCall, 'getInitData')
                .returns(new Promise((resolve) => resolve({
                    hasUser: false,
                    loggedinAnm: false,
                    csrfToken: 'test',
                    lang: 'test',
                })));
            const mockHistory = createBrowserHistory();
            mockHistory.replace({
                pathname: '/index.html/mesh',
            });
            await act(async function () {
                mount(
                    <Router history={mockHistory} >
                        <Main />
                    </Router>
                );
            });

            expect(window.location.pathname).to.be.equals('/login');

            stubGetInitDataFunc.restore();
        });

        it('should replace the pathname to /mesh when user logged in anm', async function () {
            const stubGetInitDataFunc = stub(apiCall, 'getInitData')
                .returns(new Promise((resolve) => resolve({
                    hasUser: true,
                    loggedinAnm: true,
                    csrfToken: 'test',
                    lang: 'test',
                })));
            const mockHistory = createBrowserHistory();
            mockHistory.replace({
                pathname: '/index.html/login',
            });
            await act(async function () {
                mount(
                    <Router history={mockHistory} >
                        <Main />
                    </Router>
                );
            });

            expect(window.location.pathname).to.be.equals('/mesh');

            stubGetInitDataFunc.restore();
        });
    });

    describe('on get init data success state', function () {
        // it('should call change lang with the response lang', async function () {
        //     const stubGetInitDataFunc = stub(apiCall, 'getInitData')
        //         .returns(new Promise((resolve) => resolve({
        //             hasUser: false,
        //             loggedinAnm: false,
        //             csrfToken: 'test',
        //             lang: 'test-lang',
        //         })));
        //     const mockHistory = createBrowserHistory();
        //     mockHistory.replace({
        //         pathname: '/index.html',
        //         hash: '/mesh'
        //     });

        //     await act(async function () {
        //         mount(
        //             <Router history={mockHistory} >
        //                 <Main />
        //             </Router>
        //         );
        //     });

        //     expect(changeLang.getCall(0).args[0]).to.be.equals('test-lang');

        //     stubGetInitDataFunc.restore();
        //
        // });
        

        it('should call setInitData to update store', async function () {
            const stubGetInitDataFunc = stub(apiCall, 'getInitData')
                .returns(new Promise((resolve) => resolve({
                    hasUser: true,
                    loggedinAnm: true,
                    csrfToken: 'test-csrf',
                    lang: 'test-lang',
                    location: 'test-location',
                })));
            const mockHistory = createBrowserHistory();
            mockHistory.replace({
                pathname: '/index.html',
                hash: '/mesh'
            });

            await act(async function () {
                mount(
                    <Router history={mockHistory} >
                        <Main />
                    </Router>
                );
            });

            expect(spyDispatch.callCount).to.be.equals(3); // setHostInfo -> setInitData -> set dev init settings

            const spyDispatchArgs = spyDispatch.args[1][0];
            expect(spyDispatchArgs.type).to.be.equals('SET_ALL_INIT_DATA');
            expect(spyDispatchArgs.data.csrf).to.be.equals('test-csrf');
            expect(spyDispatchArgs.data.lang).to.be.equals('test-lang');
            expect(spyDispatchArgs.data.location).to.be.equals('test-location');
            expect(spyDispatchArgs.data.anm.hasUser).to.be.true;
            expect(spyDispatchArgs.data.anm.loggedin).to.be.true;

            stubGetInitDataFunc.restore();
        });

        it('should call setHostInfo to update store', async function () {
            const stubGetInitDataFunc = stub(apiCall, 'getInitData')
                .returns(new Promise((resolve) => resolve({
                    hasUser: true,
                    loggedinAnm: true,
                    csrfToken: 'test-csrf',
                    lang: 'test-lang',
                    location: 'test-location',
                })));
            const mockHistory = createBrowserHistory();
            mockHistory.replace({
                pathname: '/index.html',
                hash: '/mesh'
            });

            await act(async function () {
                mount(
                    <Router history={mockHistory} >
                        <Main />
                    </Router>
                );
            });

            expect(spyDispatch.callCount).to.be.equals(3);
            const spyDispatchArgs = spyDispatch.args[0][0];
            expect(spyDispatchArgs.type).to.be.equals('SET_HOST_INFO');
            expect(spyDispatchArgs.data.hostname).to.be.equals('localhost');
            expect(spyDispatchArgs.data.port).to.be.equals(8000);

            stubGetInitDataFunc.restore();
        });
    });
});
