/* eslint-disable no-unused-expressions */
import React from 'react'
import {expect} from 'chai';
import {act} from 'react-dom/test-utils';
import {shallow, configure, mount} from 'enzyme';
import Adapter from "enzyme-adapter-react-16";
import Cookies from 'js-cookie';
import {spy, stub, createSandbox} from 'sinon';
import * as ReactRedux from 'react-redux';
import * as uiSettingsActions from '../../../redux/uiSettings/uiSettingsActions';
import * as projectActions from '../../../redux/projectManagement/projectActions';
import * as commonActions from '../../../redux/common/commonActions';
import * as apiCall from '../../../util/apiCall';
import useProjectManager from '../../../components/projectManagement/useProjectManager';

configure({ adapter: new Adapter() });

describe('useProjectManager', function () {
    let sandbox;

    beforeEach(function () {
        // Create a new sandbox for each test
        sandbox = createSandbox();
    });

    afterEach(function () {
        // Restore all stubs created in this sandbox
        sandbox.restore();
    });

    describe('on didmount state', () => {
        it('should dispatch a update ui settings action', async () => {
            // mock store
            const mockStore = {
                common: {
                    csrf: 'mock csrf',
                    location: 'HK',
                    meshView: 'topology',
                },
                uiSettings: {
                    shouldHelpDialogPopUp: false,
                    secret: {
                        project1: 'secret 1',
                    },
                },
                projectManagement: {
                    projectList: [],
                    projectId: 'mock id',
                    projectDialog: {onView: ''},
                    backupRestoredialog: false,
                    changeToStaging: false,
                    hasLogin: true,
                },
            };
            const stubUseSelector = stub(ReactRedux, 'useSelector').returns(mockStore);

            const stubUpdateUiSettings = stub(uiSettingsActions, 'updateUiSettings');
            const stubDispatch = () => new Promise(() => {});
            const stubUseDispatch = stub(ReactRedux, 'useDispatch').returns(stubDispatch);

            const HookMockWrapper = () => {
                useProjectManager();
                return <div />;
            };

            expect(stubUpdateUiSettings.callCount).to.be.equal(0);
            await act(async function () {
                mount(<HookMockWrapper />);
            });
            expect(stubUpdateUiSettings.callCount).to.be.equal(1);

            stubUseDispatch.restore();
            stubUseSelector.restore();
            stubUpdateUiSettings.restore();
        });
    });

    describe('returned state related to store value', () => {
        it('should return store projectDialog onView state', async () => {
            const mockOnView = 'this is a mock on view value';
            // mock store
            const mockStore = {
                common: {
                    csrf: 'mock csrf',
                    location: 'HK',
                    meshView: 'topology',
                },
                uiSettings: {
                    shouldHelpDialogPopUp: false,
                    secret: {
                        project1: 'secret 1',
                    },
                },
                projectManagement: {
                    projectList: [],
                    projectId: 'mock id',
                    projectDialog: {onView: mockOnView},
                    backupRestoredialog: false,
                    changeToStaging: false,
                    hasLogin: true,
                },
            };
            const stubUseSelector = stub(ReactRedux, 'useSelector').returns(mockStore);
            const stubDispatch = () => new Promise(() => {});
            const stubUseDispatch = stub(ReactRedux, 'useDispatch').returns(stubDispatch);

            let returnedState;
            const HookMockWrapper = () => {
                returnedState = useProjectManager();
                return <div />;
            };

            await act(async function () {
                mount(<HookMockWrapper />);
            });

            expect(returnedState.state.onView).to.be.equal(mockOnView);

            stubUseSelector.restore();
            stubUseDispatch.restore();
        });

        it('should return project id on the store and hasLogin true', async () => {
            const mockProjectId = 'this is a mock project id';
            // mock store
            const mockStore = {
                common: {
                    csrf: 'mock csrf',
                    location: 'HK',
                    meshView: 'topology',
                },
                uiSettings: {
                    shouldHelpDialogPopUp: false,
                    secret: {
                        project1: 'secret 1',
                    },
                },
                projectManagement: {
                    projectList: [],
                    projectId: mockProjectId,
                    projectDialog: {onView: 'welcome'},
                    backupRestoredialog: false,
                    changeToStaging: false,
                    hasLogin: true,
                },
            };
            const stubUseSelector = stub(ReactRedux, 'useSelector').returns(mockStore);
            const stubDispatch = () => new Promise(() => {});
            const stubUseDispatch = stub(ReactRedux, 'useDispatch').returns(stubDispatch);

            let returnedState;
            const HookMockWrapper = () => {
                returnedState = useProjectManager();
                return <div />;
            };

            await act(async function () {
                mount(<HookMockWrapper />);
            });

            expect(returnedState.state.currentProjectId).to.be.equals(mockProjectId);
            expect(returnedState.state.hasLogin).to.be.true;

            stubUseSelector.restore();
            stubUseDispatch.restore();
        });

        it('should return empty project id on the store and hasLogin false', async () => {
            const mockProjectId = '';
            // mock store
            const mockStore = {
                common: {
                    csrf: 'mock csrf',
                    location: 'HK',
                    meshView: 'topology',
                },
                uiSettings: {
                    shouldHelpDialogPopUp: false,
                    secret: {
                        project1: 'secret 1',
                    },
                },
                projectManagement: {
                    projectList: [],
                    projectId: mockProjectId,
                    projectDialog: {onView: 'welcome'},
                    backupRestoredialog: false,
                    changeToStaging: false,
                    hasLogin: true,
                },
            };
            const stubUseSelector = stub(ReactRedux, 'useSelector').returns(mockStore);
            const stubDispatch = () => new Promise(() => {});
            const stubUseDispatch = stub(ReactRedux, 'useDispatch').returns(stubDispatch);

            let returnedState;
            const HookMockWrapper = () => {
                returnedState = useProjectManager();
                return <div />;
            };

            await act(async function () {
                mount(<HookMockWrapper />);
            });
            expect(returnedState.state.currentProjectId).to.be.equals(mockProjectId);
            expect(returnedState.state.hasLogin).to.be.false;

            stubUseSelector.restore();
            stubUseDispatch.restore();
        });

        it('should return project list on the store', async () => {
            const mockProjectList = [
                {
                    projectName: '111',
                },
                {
                    projectName: '222',
                },
            ];
            // mock store
            const mockStore = {
                common: {
                    csrf: 'mock csrf',
                    location: 'HK',
                    meshView: 'topology',
                },
                uiSettings: {
                    shouldHelpDialogPopUp: false,
                    secret: {
                        project1: 'secret 1',
                    },
                },
                projectManagement: {
                    projectList: mockProjectList,
                    projectId: '',
                    projectDialog: {onView: 'welcome'},
                    backupRestoredialog: false,
                    changeToStaging: false,
                    hasLogin: true,
                },
            };
            const stubUseSelector = stub(ReactRedux, 'useSelector').returns(mockStore);
            const stubDispatch = () => new Promise(() => {});
            const stubUseDispatch = stub(ReactRedux, 'useDispatch').returns(stubDispatch);

            let returnedState;
            const HookMockWrapper = () => {
                returnedState = useProjectManager();
                return <div />;
            };

            await act(async function () {
                mount(<HookMockWrapper />);
            });

            expect(returnedState.state.projectList).to.be.deep.equals(mockProjectList);

            stubUseSelector.restore();
            stubUseDispatch.restore();
        });

        it('should return backupRestoreDialog state on the store', async () => {
            const mockBackupRestoreDialogOpen = false;
            // mock store
            const mockStore = {
                common: {
                    csrf: 'mock csrf',
                    location: 'HK',
                    meshView: 'topology',
                },
                uiSettings: {
                    shouldHelpDialogPopUp: false,
                    secret: {
                        project1: 'secret 1',
                    },
                },
                projectManagement: {
                    projectList: [],
                    projectId: '',
                    projectDialog: {onView: 'welcome'},
                    backupRestoreDialog: mockBackupRestoreDialogOpen,
                    changeToStaging: false,
                    hasLogin: true,
                },
            };
            const stubUseSelector = stub(ReactRedux, 'useSelector').returns(mockStore);
            const stubDispatch = () => new Promise(() => {});
            const stubUseDispatch = stub(ReactRedux, 'useDispatch').returns(stubDispatch);

            let returnedState;
            const HookMockWrapper = () => {
                returnedState = useProjectManager();
                return <div />;
            };

            await act(async function () {
                mount(<HookMockWrapper />);
            });

            expect(returnedState.backupRestoreDialog).to.be.equals(mockBackupRestoreDialogOpen);

            stubUseSelector.restore();
            stubUseDispatch.restore();
        });
    });

    describe('returned handler', () => {
        describe('handler for welcome dialog', () => {
            let stubUseSelector;
            let stubUseDispatch;
            let returnedState;
            let mockDisplayReturn = {};
            beforeEach(async () => {
                mockDisplayReturn = [
                    {
                        projectName: '111',
                    },
                    {
                        projectName: '222',
                    },
                ];
                const mockStore = {
                    common: {
                        csrf: 'mock csrf',
                        location: 'HK',
                        meshView: 'topology',
                    },
                    uiSettings: {
                        shouldHelpDialogPopUp: false,
                        secret: {
                            project1: 'secret 1',
                        },
                    },
                    projectManagement: {
                        projectList: [],
                        projectId: '',
                        projectDialog: {onView: 'welcome'},
                        backupRestoreDialog: false,
                        changeToStaging: false,
                        hasLogin: true,
                    },
                };
                stubUseSelector = stub(ReactRedux, 'useSelector').returns(mockStore);
                const stubDispatch = () => new Promise(resolve => resolve(mockDisplayReturn));
                stubUseDispatch = stub(ReactRedux, 'useDispatch').returns(stubDispatch);

                const HookMockWrapper = () => {
                    returnedState = useProjectManager();
                    return <div />;
                };

                await act(async function () {
                    mount(<HookMockWrapper />);
                });
            });

            afterEach(() => {
                stubUseSelector.restore();
                stubUseDispatch.restore();
                returnedState = null;
            });

            it('should call logout anm api call when call welcomeHandleLogout', () => {
                const stubLogoutAnm = stub(apiCall, 'logoutAnm').returns(new Promise(() => {}));
                returnedState.handler.welcome.welcomeHandleLogout();
                expect(stubLogoutAnm.calledOnce).to.be.true;

                stubLogoutAnm.restore()
            });

            it('should dispatch a changeOnView action when call handle close', () => {
                const stubChangeOnView = stub(projectActions, 'changeOnView').returns(new Promise(() => {}));
                returnedState.handler.welcome.welcomeHandleClose();
                expect(stubChangeOnView.calledOnce).to.be.true;
                expect(stubChangeOnView.args[0][0]).to.be.equals('');

                stubChangeOnView.restore();
            });

            it('should dispatch a changeOnView action when click to management', () => {
                const stubChangeOnView = stub(projectActions, 'changeOnView').returns(new Promise(() => {}));
                returnedState.handler.welcome.welcomeHandleClickToManagement();
                expect(stubChangeOnView.calledOnce).to.be.true;

                stubChangeOnView.restore();
            });

            it('should dispatch a openSettingsDialog action when click open settings', () => {
                const stubChangeOnView = stub(commonActions, 'openSettingsDialog').returns(new Promise(() => {}));
                returnedState.handler.welcome.welcomeHandleSettingsOnClick();
                expect(stubChangeOnView.calledOnce).to.be.true;

                stubChangeOnView.restore();
            });

            it('should update project list and create project when change to staging', async () => {
                mockDisplayReturn = [
                    {
                        projectName: '111',
                    },
                    {
                        projectName: '222',
                    },
                ];
                const mockLocation = new URL('http://localhost:8000');
                mockLocation.assign = jest.fn();
                mockLocation.replace = jest.fn();
                mockLocation.reload = jest.fn();

                delete window.location;
                window.location = mockLocation;

                // const stubAssign = stub(window.location, 'assign');
                const stubCreatProject = stub(apiCall, 'createProject').returns(
                    new Promise(resolve => resolve({projectId: 'mock staging id'}))
                );

                const stubUpdateProjectList = stub(projectActions, 'updateProjectList').returns(new Promise(() => {}));

                expect(stubUpdateProjectList.notCalled).to.be.true;
                await act(async () => {
                    returnedState.handler.welcome.welcomeHandleClickQuickStaging();
                });
                expect(stubUpdateProjectList.calledOnce).to.be.true;
                expect(stubCreatProject.calledOnce).to.be.true;

                stubCreatProject.restore();
                stubUpdateProjectList.restore();
                // stubAssign.restore();
            });
        });

        describe('handler for tour dialog', () => {
            let stubUseSelector;
            let stubUseDispatch;
            let returnedState;
            let mockDisplayReturn = {};
            let mockWrapper;
            beforeEach(async () => {
                mockDisplayReturn = [
                    {
                        projectName: '111',
                    },
                    {
                        projectName: '222',
                    },
                ];
                const mockStore = {
                    common: {
                        csrf: 'mock csrf',
                        location: 'HK',
                        meshView: 'topology',
                    },
                    uiSettings: {
                        shouldHelpDialogPopUp: false,
                        secret: {
                            project1: 'secret 1',
                        },
                    },
                    projectManagement: {
                        projectList: [],
                        projectId: '',
                        projectDialog: {onView: 'welcome'},
                        backupRestoreDialog: false,
                        changeToStaging: false,
                        hasLogin: true,
                    },
                };
                stubUseSelector = stub(ReactRedux, 'useSelector').returns(mockStore);
                const stubDispatch = () => new Promise(resolve => resolve(mockDisplayReturn));
                stubUseDispatch = stub(ReactRedux, 'useDispatch').returns(stubDispatch);

                const HookMockWrapper = () => {
                    returnedState = useProjectManager();
                    return <div />;
                };

                await act(async function () {
                    mockWrapper = mount(<HookMockWrapper />);
                });
            });

            afterEach(() => {
                stubUseSelector.restore();
                stubUseDispatch.restore();
                returnedState = null;
                mockWrapper = null;
            });

            it('should update dont show state when call tourHandleCheckboxOnClick', async () => {
                expect(returnedState.state.dontShow).to.be.true;
                act(() => {
                    returnedState.handler.tour.tourHandleCheckboxOnClick();
                    mockWrapper.update();
                });
                expect(returnedState.state.dontShow).to.be.false;
            });

            it('should dispatch a changeOnView action when call handle close', () => {
                const stubChangeOnView = stub(projectActions, 'changeOnView').returns(new Promise(() => {}));
                returnedState.handler.tour.tourHandleOnClose();
                expect(stubChangeOnView.calledOnce).to.be.true;
                expect(stubChangeOnView.args[0][0]).to.be.equals('list');

                stubChangeOnView.restore();
            });
        });

        describe('handler for list dialog', () => {
            let stubUseSelector;
            let stubUseDispatch;
            let returnedState;
            let mockDisplayReturn = {};
            let mockWrapper;
            beforeEach(async () => {
                mockDisplayReturn = [
                    {
                        projectName: '111',
                        projectId: '111-id',
                    },
                    {
                        projectName: '222',
                        projectid: '222-id',
                    },
                ];
                const mockStore = {
                    common: {
                        csrf: 'mock csrf',
                        location: 'HK',
                        meshView: 'topology',
                    },
                    uiSettings: {
                        shouldHelpDialogPopUp: false,
                        secret: {
                            '111-id': '111-secret',
                            '222-id': '222-secret',
                        },
                    },
                    projectManagement: {
                        projectList: [
                            {
                                projectName: '111',
                                projectId: '111-id',
                            },
                            {
                                projectName: '222',
                                projectId: '222-id',
                            },
                        ],
                        projectId: '',
                        projectDialog: {onView: 'welcome'},
                        backupRestoreDialog: false,
                        changeToStaging: false,
                        hasLogin: true,
                    },
                };
                stubUseSelector = stub(ReactRedux, 'useSelector').returns(mockStore);
                const stubDispatch = () => new Promise(resolve => resolve(mockDisplayReturn));
                stubUseDispatch = stub(ReactRedux, 'useDispatch').returns(stubDispatch);

                const HookMockWrapper = () => {
                    returnedState = useProjectManager();
                    return <div />;
                };

                await act(async function () {
                    mockWrapper = mount(<HookMockWrapper />);
                });
            });

            afterEach(() => {
                stubUseSelector.restore();
                stubUseDispatch.restore();
                returnedState = null;
                mockWrapper = null;
            });

            it('should dispatch a changeOnView action when call handle back', () => {
                const stubChangeOnView = stub(projectActions, 'changeOnView').returns(new Promise(() => {}));
                returnedState.handler.list.listHandleBackOnClick();
                expect(stubChangeOnView.calledOnce).to.be.true;
                expect(stubChangeOnView.args[0][0]).to.be.equals('welcome');

                stubChangeOnView.restore();
            });

            it('should dispatch a changeOnView action when call connect and update the state', () => {
                const stubChangeOnView = stub(projectActions, 'changeOnView').returns(new Promise(() => {}));
                act(() => {
                    returnedState.handler.list.listHandleConnectOnClick('222-id');
                    mockWrapper.update();
                });
                expect(stubChangeOnView.calledOnce).to.be.true;
                expect(stubChangeOnView.args[0][0]).to.be.equals('login');
                expect(returnedState.state.projectName).to.be.equals('222');
                expect(returnedState.state.savedSecret).to.be.equals('222-secret');

                stubChangeOnView.restore();
            });

            it('should dispatch a changeOnView action when call handle close', () => {
                const stubChangeOnView = stub(projectActions, 'changeOnView').returns(new Promise(() => {}));
                returnedState.handler.list.listHandleOnClose();
                expect(stubChangeOnView.calledOnce).to.be.true;
                expect(stubChangeOnView.args[0][0]).to.be.equals('');

                stubChangeOnView.restore();
            });

            it('should dispatch a changeOnView action when call handle guide open', () => {
                const stubChangeOnView = stub(projectActions, 'changeOnView').returns(new Promise(() => {}));
                returnedState.handler.list.listHandleGuideOnClick();
                expect(stubChangeOnView.calledOnce).to.be.true;
                expect(stubChangeOnView.args[0][0]).to.be.equals('tour');

                stubChangeOnView.restore();
            });

            it('should call deleteProject api when call handle project remove', async () => {
                const stubDeleteProject = stub(apiCall, 'deleteProject').returns(new Promise(() => {}));

                await act(async () => {
                    returnedState.handler.list.listHandleProjectRemove('remove-project-id');
                });
                expect(stubDeleteProject.calledOnce).to.be.true;
                expect(stubDeleteProject.args[0][1]).to.be.equal('remove-project-id');

                stubDeleteProject.restore();
            });

            it('should call updateProject api when call handle project edit', async () => {
                const stubDeleteProject = stub(apiCall, 'updateProject').returns(new Promise(() => {}));

                await act(async () => {
                    returnedState.handler.list.listHandleProjectEdit('id', {});
                });
                expect(stubDeleteProject.calledOnce).to.be.true;

                stubDeleteProject.restore();
            });

            it('should call createProject api when call handle project add', async () => {
                const stubDeleteProject = stub(apiCall, 'createProject').returns(new Promise(() => {}));

                await act(async () => {
                    returnedState.handler.list.listHandleProjectAdd({});
                });
                expect(stubDeleteProject.calledOnce).to.be.true;

                stubDeleteProject.restore();
            });

            it('should dispatch a openProjectBackupRestore action when call handle open', () => {
                const stubChangeOnView = stub(projectActions, 'openProjectBackupRestore').returns(new Promise(() => {}));
                returnedState.handler.list.listHandleProjectBackupRestoreOpen();
                expect(stubChangeOnView.calledOnce).to.be.true;

                stubChangeOnView.restore();
            });
        });

        describe('handler for login dialog', () => {
            let stubUseSelector;
            let stubUseDispatch;
            let returnedState;
            let mockDisplayReturn = {};
            let mockWrapper;
            beforeEach(async () => {
                mockDisplayReturn = [
                    {
                        projectName: '111',
                        projectId: '111-id',
                    },
                    {
                        projectName: '222',
                        projectid: '222-id',
                    },
                ];
                const mockStore = {
                    common: {
                        csrf: 'mock csrf',
                        location: 'HK',
                        meshView: 'topology',
                    },
                    uiSettings: {
                        shouldHelpDialogPopUp: false,
                        secret: {
                            '111-id': '111-secret',
                            '222-id': '222-secret',
                        },
                    },
                    projectManagement: {
                        projectList: [
                            {
                                projectName: '111',
                                projectId: '111-id',
                            },
                            {
                                projectName: '222',
                                projectId: '222-id',
                            },
                        ],
                        projectId: '',
                        projectDialog: {onView: 'welcome'},
                        backupRestoreDialog: false,
                        changeToStaging: false,
                        hasLogin: true,
                    },
                };
                stubUseSelector = stub(ReactRedux, 'useSelector').returns(mockStore);
                const stubDispatch = (action) => {
                    // If it's a function (thunk), call it with dispatch and getState
                    if (typeof action === 'function') {
                        return action(stubDispatch, () => mockStore);
                    }
                    // If it's a plain action object, just return a resolved promise
                    return new Promise(resolve => resolve(mockDisplayReturn));
                };
                stubUseDispatch = stub(ReactRedux, 'useDispatch').returns(stubDispatch);

                const HookMockWrapper = () => {
                    returnedState = useProjectManager();
                    return <div />;
                };

                await act(async function () {
                    mockWrapper = mount(<HookMockWrapper />);
                });
            });

            afterEach(() => {
                stubUseSelector.restore();
                stubUseDispatch.restore();
                returnedState = null;
                mockWrapper = null;
            });

            it('should dispatch a changeOnView action and reset all state when call handle back', async () => {
                const stubChangeOnView = stub(projectActions, 'changeOnView').returns(new Promise(() => {}));
                await act(async () => {
                    returnedState.handler.login.loginHandleBackOnClick();
                    mockWrapper.update();
                });
                expect(stubChangeOnView.calledOnce).to.be.true;
                expect(stubChangeOnView.args[0][0]).to.be.equals('list');
                expect(returnedState.state.projectName).to.be.equals('');
                expect(returnedState.state.savedSecret).to.be.equals('');

                stubChangeOnView.restore();
            });

            it('should remove current project session data when login project success', async () => {
                const stubSetProjectInfo = sandbox.stub(projectActions, 'setProjectInfo').callsFake((info) => {
                    return { type: 'SET_PROJECT_INFO', info };
                });
                const stubPingHostNode = sandbox.stub(apiCall, 'pingHostNode').returns(new Promise((resolve, reject) => resolve({})));
                const stubLoginProject = sandbox.stub(apiCall, 'loginProject').returns(new Promise((resolve, reject) => resolve({})));

                // Create a custom dispatch that actually calls setProjectInfo when it's dispatched
                const originalDispatch = stubUseDispatch;
                const customDispatch = (action) => {
                    // If it's a setProjectInfo action, call the stub
                    if (action && action.type === 'SET_PROJECT_INFO') {
                        stubSetProjectInfo(action.info);
                        return new Promise(resolve => resolve(mockDisplayReturn));
                    }
                    // For other actions, use the original dispatch logic
                    return originalDispatch(action);
                };

                stubUseDispatch.returns(customDispatch);

                // Set up the login status with required project data
                act(() => {
                    returnedState.handler.list.listHandleConnectOnClick('111-id');
                    mockWrapper.update();
                });

                Cookies.set('projectId', 'mock-project-id');
                await act(async () => {
                    await returnedState.handler.login.loginHandleLoginOnClick('test-secret');
                    mockWrapper.update();
                });
                expect(Cookies.get('projectId')).to.be.equals('111-id');
                expect(stubSetProjectInfo.callCount).to.be.equals(4);
                // First two calls should clear the session data
                expect(stubSetProjectInfo.args[0][0]).to.be.deep.equals({
                    projectId: '',
                    projectName: '',
                    hasLogin: false,
                });
                expect(stubSetProjectInfo.args[1][0]).to.be.deep.equals({
                    projectId: '',
                    projectName: '',
                    hasLogin: false,
                });
                // Last two calls should set the new project data
                expect(stubSetProjectInfo.args[2][0]).to.be.deep.equals({
                    projectId: '111-id',
                    projectName: '111',
                    hasLogin: true,
                });
                expect(stubSetProjectInfo.args[3][0]).to.be.deep.equals({
                    projectId: '111-id',
                    projectName: '111',
                    hasLogin: true,
                });
                // After successful login, the project should be set to the new project
                expect(returnedState.state.projectName).to.be.equals('111');
                expect(returnedState.state.savedSecret).to.be.equals('111-secret');
            });

            it('should throw error when cant ping hostnode', async () => {
                const stubSetProjectInfo = sandbox.stub(projectActions, 'setProjectInfo').returns(false);
                const stubPingHostNode = sandbox.stub(apiCall, 'pingHostNode').returns(new Promise((resolve, reject) => reject({})));

                Cookies.set('projectId', 'mock-project-id');
                let returnErr;
                await act(async () => {
                    returnedState.handler.login.loginHandleLoginOnClick().catch((e) => { returnErr = e; });
                });

                expect(returnErr).to.not.be.undefined;
                expect(returnErr.state).to.be.equal('ping');
            });

            it('should throw error when login failed', async () => {
                const stubSetProjectInfo = sandbox.stub(projectActions, 'setProjectInfo').returns(false);
                const stubPingHostNode = sandbox.stub(apiCall, 'pingHostNode').returns(new Promise(resolve => resolve({})));
                const stubLoginProject = sandbox.stub(apiCall,'loginProject').returns(new Promise((resolve, reject) => reject({})));

                Cookies.set('projectId', 'mock-project-id');
                let returnErr;
                await act(async () => {
                    returnedState.handler.login.loginHandleLoginOnClick().catch((e) => { returnErr = e; });
                });

                expect(returnErr).to.not.be.undefined;
                expect(returnErr.state).to.be.equal('login');
            });
        });

        describe('handler for save dialog', () => {
            let stubUseSelector;
            let stubUseDispatch;
            let returnedState;
            let mockDisplayReturn = {};
            let mockWrapper;
            beforeEach(async () => {
                mockDisplayReturn = [
                    {
                        projectName: '111',
                        projectId: '111-id',
                    },
                    {
                        projectName: '222',
                        projectid: '222-id',
                    },
                ];
                const mockStore = {
                    common: {
                        csrf: 'mock csrf',
                        location: 'HK',
                        meshView: 'topology',
                    },
                    uiSettings: {
                        shouldHelpDialogPopUp: false,
                        secret: {
                            '111-id': '111-secret',
                            '222-id': '222-secret',
                        },
                    },
                    projectManagement: {
                        projectList: [
                            {
                                projectName: '111',
                                projectId: '111-id',
                            },
                            {
                                projectName: '222',
                                projectId: '222-id',
                            },
                        ],
                        projectId: '',
                        projectDialog: {onView: 'welcome'},
                        backupRestoreDialog: false,
                        changeToStaging: false,
                        hasLogin: true,
                    },
                };
                stubUseSelector = stub(ReactRedux, 'useSelector').returns(mockStore);
                const stubDispatch = () => new Promise(resolve => resolve(mockDisplayReturn));
                stubUseDispatch = stub(ReactRedux, 'useDispatch').returns(stubDispatch);

                const HookMockWrapper = () => {
                    returnedState = useProjectManager();
                    return <div />;
                };

                await act(async function () {
                    mockWrapper = mount(<HookMockWrapper />);
                });
            });

            afterEach(() => {
                stubUseSelector.restore();
                stubUseDispatch.restore();
                returnedState = null;
                mockWrapper = null;
            });

            it('should dispatch a changeOnView action when call handle cancel', async () => {
                const stubChangeOnView = stub(projectActions, 'changeOnView').returns(new Promise(() => {}));
                returnedState.handler.save.saveHandleCancel();

                expect(stubChangeOnView.calledOnce).to.be.true;
                expect(stubChangeOnView.args[0][0]).to.be.equals('');

                stubChangeOnView.restore();
            });

            it('should dispatch action when call handle cancel', async () => {
                const stubChangeOnView = sandbox.stub(projectActions, 'changeOnView').returns(new Promise(() => {}));
                const stubSetProjectInfo = sandbox.stub(projectActions, 'setProjectInfo').returns(new Promise(() => {}));

                returnedState.handler.save.saveHandleLoginFail();

                expect(stubChangeOnView.calledOnce).to.be.true;
                expect(stubChangeOnView.args[0][0]).to.be.equals('list');
                expect(stubSetProjectInfo.args[0][0]).to.be.deep.equals({
                    hasLogin: false,
                    projectName: '',
                    projectId: '',
                });
            });

            it('should update and login project and setup project info when handle project save as', async () => {
                const stubChangeOnView = sandbox.stub(projectActions, 'changeOnView').returns(new Promise(() => {}));
                const stubUpdateProjectList = sandbox.stub(projectActions, 'updateProjectList').returns(false);
                const stubSetProjectInfo = sandbox.stub(projectActions, 'setProjectInfo').returns(false);

                const stubUpdateProject = sandbox.stub(apiCall, 'updateProject').returns(new Promise(resolve => resolve({})));
                const stubLoginProject = sandbox.stub(apiCall,'loginProject').returns(new Promise(resolve => resolve({})));

                const mockProjectname = 'mock-name';
                await act(async () => {
                    returnedState.handler.save.saveHandleSaveAs(mockProjectname);
                });

                expect(stubUpdateProject.calledOnce).to.be.true;
                expect(stubLoginProject.calledOnce).to.be.true;
                expect(stubChangeOnView.calledOnce).to.be.true;
                expect(stubChangeOnView.args[0][0]).to.be.equals('');
                expect(stubSetProjectInfo.calledOnce).to.be.true;
                expect(stubSetProjectInfo.args[0][0]).to.be.deep.equals({projectName: mockProjectname});
            });
        });
    });
});