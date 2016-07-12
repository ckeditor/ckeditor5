/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

'use strict';

const mockery = require( 'mockery' );
const sinon = require( 'sinon' );
const chai = require( 'chai' );
const expect = chai.expect;

describe( 'exec-tasks', () => {
	let sandbox;
	const config = {
		WORKSPACE_DIR: '/path/exec/'
	};
	const getDevDirectoriesResult = [
		{
			repositoryPath: '/path/1',
			repositoryURL: 'ckeditor/test1'
		},
		{
			repositoryPath: '/path/2',
			repositoryURL: 'ckeditor/test2'
		}
	];

	beforeEach( () => {
		mockery.enable( {
			useCleanCache: true,
			warnOnReplace: false,
			warnOnUnregistered: false
		} );
		sandbox = sinon.sandbox.create();
	} );

	afterEach( () => {
		mockery.disable();
		sandbox.restore();
	} );

	describe( 'execOnRepositories', () => {
		it( 'should throw error when there is no specified task', () => {
			const errorMessage = 'Missing task parameter: --task task-name';
			const log = require( '../../utils/log' );
			const logErrSpy = sandbox.stub( log, 'err' );

			mockery.registerMock( 'minimist', () => {
				return { };
			} );
			const tasks = require( '../../tasks/exec/tasks' )( config );

			tasks.execOnRepositories();

			sinon.assert.calledOnce( logErrSpy );
			expect( logErrSpy.firstCall.args[ 0 ] ).to.be.an( 'error' );
			expect( logErrSpy.firstCall.args[ 0 ].message ).to.equal( errorMessage );
		} );

		it( 'should throw error when task cannot be found', () => {
			const log = require( '../../utils/log' );
			const logErrSpy = sandbox.stub( log, 'err' );

			mockery.registerMock( 'minimist', () => {
				return { task: 'task-to-run' };
			} );
			const tasks = require( '../../tasks/exec/tasks' )( config );

			tasks.execOnRepositories();

			sinon.assert.calledOnce( logErrSpy );
			expect( logErrSpy.firstCall.args[ 0 ] ).to.be.an( 'error' );
			expect( logErrSpy.firstCall.args[ 0 ].code ).to.equal( 'MODULE_NOT_FOUND' );
		} );

		it( 'should load task module', () => {
			const ckeditor5Dirs = require( '../../utils/ckeditor5-dirs' );
			const log = require( '../../utils/log' );
			const logErrSpy = sandbox.stub( log, 'err' );

			sandbox.stub( ckeditor5Dirs, 'getDevDirectories' ).returns( [] );
			mockery.registerMock( 'minimist', () => {
				return { task: 'task-to-run' };
			} );
			mockery.registerMock( './functions/task-to-run', () => {} );
			const tasks = require( '../../tasks/exec/tasks' )( config );

			tasks.execOnRepositories();

			sinon.assert.notCalled( logErrSpy );
		} );

		it( 'should log error when task is throwing exceptions', () => {
			const ckeditor5Dirs = require( '../../utils/ckeditor5-dirs' );
			const taskStub = sinon.stub();
			const log = require( '../../utils/log' );
			const logErrSpy = sandbox.stub( log, 'err' );

			taskStub.onSecondCall().throws();

			mockery.registerMock( 'minimist', () => {
				return { task: 'task-to-run' };
			} );
			sandbox.stub( ckeditor5Dirs, 'getDevDirectories' ).returns( getDevDirectoriesResult );
			mockery.registerMock( './functions/task-to-run', taskStub );
			const tasks = require( '../../tasks/exec/tasks' )( config );

			tasks.execOnRepositories();

			sinon.assert.calledOnce( logErrSpy );
			expect( logErrSpy.firstCall.args[ 0 ] ).to.be.an( 'error' );
			sinon.assert.calledTwice( taskStub );
			sinon.assert.calledWith( taskStub, '/path/1', { task: 'task-to-run' } );
			sinon.assert.calledWith( taskStub, '/path/2', { task: 'task-to-run' } );
		} );

		it( 'should execute task over directories', () => {
			const ckeditor5Dirs = require( '../../utils/ckeditor5-dirs' );
			const taskStub = sinon.stub();

			mockery.registerMock( 'minimist', () => {
				return { task: 'task-to-run' };
			} );
			sandbox.stub( ckeditor5Dirs, 'getDevDirectories' ).returns( getDevDirectoriesResult );
			mockery.registerMock( './functions/task-to-run', taskStub );
			const tasks = require( '../../tasks/exec/tasks' )( config );

			tasks.execOnRepositories();

			sinon.assert.calledTwice( taskStub );
			sinon.assert.calledWith( taskStub, '/path/1', { task: 'task-to-run' } );
			sinon.assert.calledWith( taskStub, '/path/2', { task: 'task-to-run' } );
		} );

		it( 'should execute task over specific directory', () => {
			const Stream = require( 'stream' );
			const ckeditor5Dirs = require( '../../utils/ckeditor5-dirs' );
			const taskStub = sinon.stub().returns( new Stream() );

			mockery.registerMock( 'minimist', () => {
				return {
					task: 'task-to-run',
					repository: 'test1'
				};
			} );
			sandbox.stub( ckeditor5Dirs, 'getDevDirectories' ).returns( getDevDirectoriesResult );
			mockery.registerMock( './functions/task-to-run', taskStub );
			const tasks = require( '../../tasks/exec/tasks' )( config );

			tasks.execOnRepositories();

			sinon.assert.calledOnce( taskStub );
			sinon.assert.calledWith( taskStub, '/path/1', { task: 'task-to-run', repository: 'test1' } );
			sinon.assert.neverCalledWith( taskStub, '/path/2', { task: 'task-to-run', repository: 'test1' } );
		} );
	} );
} );
