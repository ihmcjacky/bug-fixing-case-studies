/* eslint-disable no-unused-expressions */
import {expect} from 'chai';
import {stub} from 'sinon';
import configureMockStore from 'redux-mock-store'
import thunk from 'redux-thunk'
import * as actions from '../../../redux/projectManagement/projectActions';
import Constants from '../../../redux/projectManagement/projectConstants';
import * as apiCall from '../../../util/apiCall';

describe('projectManagement actions', () => {
    it('should pass an action to set the project id', () => {
        const mockId = 'this is a mock project id';
        const expectedAction = {
            type: Constants.SET_PROJECT_ID,
            id: mockId,
        };
        expect(actions.setProjectId(mockId)).to.be.deep.equals(expectedAction);
    });

    it('should pass an action to set project info', () => {
        const mockProjectName = 'mock project name';
        const mockId = 'this is a mock project id';
        const mockInfo = {
            projectName: mockProjectName,
            projectId: mockId,
        };
        const expectedAction = {
            type: Constants.SET_PROJECT_INFO,
            info: mockInfo,
        };
        expect(actions.setProjectInfo(mockInfo)).to.be.deep.equals(expectedAction);

        const mockEmptyProjectName = '';
        const mockEmptyId = '';
        const mockEmptyInfo = {
            projectName: mockEmptyProjectName,
            projectId: mockEmptyId,
        };
        const expectedEmptyAction = {
            type: Constants.SET_PROJECT_INFO,
            info: mockEmptyInfo,
        };
        expect(actions.setProjectInfo(mockEmptyInfo)).to.be.deep.equals(expectedEmptyAction);
    });

    describe('update project list', () => {
        it('should call getProjectList api call and pass the handled data to store', async () => {
            const mockRes = [
                {
                    projectId: 'mock-id-1',
                    managementIp: '1.1.1.1',
                    numOfNode: 2,
                    projectName: '111',
                    projectImages: {
                        'mock-image-id': 'mock-image-name',
                    },
                },
                {
                    projectId: 'mock-id-2',
                    managementIp: '2.2.2.2',
                    numOfNode: 2,
                    projectName: '222',
                    projectImages: {
                        'mock-image-id': 'mock-image-name',
                    },
                },
            ];
            const stubGetProjectList = stub(apiCall, 'getProjectList')
                .returns(new Promise(resolve => resolve(mockRes)));
            const middlewares = [thunk];
            const mockStore = configureMockStore(middlewares);
            const initState = {
                projectId: '',
                projectName: '',
                projectList: [],
                projectDialog: {
                    onView: '',
                },
                hasLogin: false,
                projectIdToNameMap: {},
                backupRestoreDialog: false,
                changeToStaging: false,
            }
            const store = mockStore({
                projectManagement: initState,
            });
            const expectedAction = {
                type: Constants.UDPATE_PROJECT_LIST,
                list: mockRes,
                idToNameMap: {
                    'mock-id-1': '111',
                    'mock-id-2': '222',
                },
            };

            return store.dispatch(actions.updateProjectList()).then(() => {
                expect(stubGetProjectList.calledOnce).to.be.true;

                const actionCalled = store.getActions()[0];
                expect(actionCalled).to.be.deep.equals(expectedAction);
                stubGetProjectList.restore();
            });
        });

        it('should throw an error when get project list failed', async () => {
            const mockRes = {
                success: false,
                error: [{
                    type: 'mock error',
                }],
            };
            const stubGetProjectList = stub(apiCall, 'getProjectList')
                .returns(new Promise((resolve, reject) => reject(mockRes)));
            const middlewares = [thunk];
            const mockStore = configureMockStore(middlewares);
            const initState = {
                projectId: '',
                projectName: '',
                projectList: [],
                projectDialog: {
                    onView: '',
                },
                hasLogin: false,
                projectIdToNameMap: {},
                backupRestoreDialog: false,
                changeToStaging: false,
            }
            const store = mockStore({
                projectManagement: initState,
            });

            return store.dispatch(actions.updateProjectList()).then(() => { /* it should throw an error */})
                .catch((err) => {
                    expect(stubGetProjectList.calledOnce).to.be.true;
                    expect(store.getActions()).to.have.length(0);
                    expect(err).to.be.deep.equals(mockRes);

                    stubGetProjectList.restore();
                });
        });

        it('should pass an action to change project dialog view', () => {
            const mockView = {
                close: '',
                welcome: 'welcome',
                tour: 'tour',
                list: 'list',
            };
            const changeWelcomeAction = {
                type: Constants.PROJECT_DIALOG_CHANGE_VIEW,
                view: mockView.welcome,
            };
            expect(actions.changeOnView(mockView.welcome)).to.be.deep.equals(changeWelcomeAction);

            const changeTourAction = {
                type: Constants.PROJECT_DIALOG_CHANGE_VIEW,
                view: mockView.tour,
            };
            expect(actions.changeOnView(mockView.tour)).to.be.deep.equals(changeTourAction);

            const changeListAction = {
                type: Constants.PROJECT_DIALOG_CHANGE_VIEW,
                view: mockView.list,
            };
            expect(actions.changeOnView(mockView.list)).to.be.deep.equals(changeListAction);

            const changeCloseAction = {
                type: Constants.PROJECT_DIALOG_CHANGE_VIEW,
                view: mockView.close,
            };
            expect(actions.changeOnView(mockView.close)).to.be.deep.equals(changeCloseAction);
        });
    });

    it('should pass an action to open project backup restore dialog', () => {
        const expectedAction = {
            type: Constants.OPEN_PROJECT_BACKUP_RESTORE,
        };
        expect(actions.openProjectBackupRestore()).to.be.deep.equals(expectedAction);
    });

    it('should pass an action to open project backup restore dialog', () => {
        const expectedAction = {
            type: Constants.CLOSE_PROJECT_BACKUP_RESTORE,
        };
        expect(actions.closeProjectBackupRestore()).to.be.deep.equals(expectedAction);
    });

    it('should pass an action to change to stagging', () => {
        const expectedAction = {
            type: Constants.CHANGE_TO_STAGING,
        };
        expect(actions.changeToStaging()).to.be.deep.equals(expectedAction);
    });
});
