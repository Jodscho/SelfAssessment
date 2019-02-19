const sinon = require('sinon');

const PincodeController = require('../../../app/core/user/pincode.controller');
const UserModel = require('../../../app/core/user/user.model');
const TestDocuments = require('./user.data');

describe('PincodeController', () => {
    beforeEach( () => {
        // test data
        this.docs = TestDocuments;

        // common response object with spies
        this.res = {
            json: sinon.spy(),
            status: sinon.stub().returns({
                json: sinon.spy(),
                send: sinon.spy()
            })
        };
    });

    afterEach( () => {
        // cleanup and remove stubs
        sinon.restore();
    });

    describe('PincodeController.create', () => {
        it('should create a pseudo-random pincode (8 digits)', async () => {
            sinon.stub(UserModel, 'find').resolves(this.docs);
            sinon.stub(UserModel, 'create').resolves(this.docs[0]);

            const req = {
                // dummy
            };

            await PincodeController.create(req, this.res);
            sinon.assert.calledOnce(UserModel.find);
            sinon.assert.calledOnce(UserModel.create);
            sinon.assert.calledOnce(this.res.status);
            sinon.assert.calledWith(this.res.status, 201);
            sinon.assert.calledOnce(this.res.status().json);
            sinon.assert.calledWith(this.res.status().json, this.docs[0].pin);
        });
    });
});
