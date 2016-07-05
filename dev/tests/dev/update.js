/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

'use strict';

const sinon = require( 'sinon' );
const tools = require( '../../utils/tools' );
const ckeditor5Dirs = require( '../../utils/ckeditor5-dirs' );
const git = require( '../../utils/git' );
const path = require( 'path' );
const chai = require( 'chai' );
const expect = chai.expect;
const gulp = require( 'gulp' );

describe( 'dev-update', () => {
	const updateTask = require( '../../tasks/dev/tasks/update' );
	const ckeditor5Path = 'path/to/ckeditor5';
	const workspaceRoot = '..';
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );
	const spies = {};

	beforeEach( () => {
		spies.getDependencies = sinon.spy( ckeditor5Dirs, 'getCKEditorDependencies' );
		spies.checkout = sinon.stub( git, 'checkout' );
		spies.pull = sinon.stub( git, 'pull' );
		spies.fetchAll = sinon.stub( git, 'fetchAll' );
		spies.npmUpdate = sinon.stub( tools, 'npmUpdate' );
		spies.linkDirectories = sinon.stub( tools, 'linkDirectories' );
		spies.removeSymlink = sinon.stub( tools, 'removeSymlink' );
	} );

	afterEach( () => {
		Object.keys( spies ).forEach( ( spy ) => spies[ spy ].restore() );
	} );

	it( 'should update dev repositories', () => {
		const dirs = [ 'ckeditor5-core', 'ckeditor5-devtest' ];
		const installTask = sinon.spy();
		spies.getDirectories = sinon.stub( ckeditor5Dirs, 'getCKE5Directories' ).returns( dirs );
		spies.getCKE5Symlinks = sinon.stub( ckeditor5Dirs, 'getCKE5Symlinks' ).returns( [] );

		const json = {
			dependencies: {
				'ckeditor5-core': 'ckeditor/ckeditor5-core',
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};

		updateTask( installTask, ckeditor5Path, json, workspaceRoot, true );

		const repoPath1 = path.join( workspaceAbsolutePath, dirs[ 0 ] );
		const repoPath2 = path.join( workspaceAbsolutePath, dirs[ 1 ] );

		sinon.assert.calledThrice( spies.fetchAll );
		sinon.assert.calledWithExactly( spies.fetchAll.firstCall, ckeditor5Path );
		sinon.assert.calledWithExactly( spies.fetchAll.secondCall, repoPath1 );
		sinon.assert.calledWithExactly( spies.fetchAll.thirdCall, repoPath2 );
		sinon.assert.calledTwice( spies.checkout );
		sinon.assert.calledWithExactly( spies.checkout.firstCall, repoPath1, 'master' );
		sinon.assert.calledWithExactly( spies.checkout.secondCall, repoPath2, 'new-branch' );
		sinon.assert.calledTwice( spies.pull );
		sinon.assert.calledWithExactly( spies.pull.firstCall, repoPath1, 'master' );
		sinon.assert.calledWithExactly( spies.pull.secondCall, repoPath2, 'new-branch' );

		sinon.assert.calledThrice( spies.npmUpdate );
		sinon.assert.calledWithExactly( spies.npmUpdate.firstCall, path.join( workspaceAbsolutePath, dirs[ 0 ] ) );
		sinon.assert.calledWithExactly( spies.npmUpdate.secondCall, path.join( workspaceAbsolutePath, dirs[ 1 ] ) );
		sinon.assert.calledWithExactly( spies.npmUpdate.thirdCall, ckeditor5Path );

		sinon.assert.calledOnce( spies.getCKE5Symlinks );
		sinon.assert.notCalled( spies.removeSymlink );
		sinon.assert.notCalled( installTask );
	} );

	it( 'should install missing dependencies', () => {
		const dirs = [ 'ckeditor5-core', 'ckeditor5-devtest' ];
		const installTask = sinon.spy();
		spies.getDirectories = sinon.stub( ckeditor5Dirs, 'getCKE5Directories' ).returns( dirs );
		spies.getCKE5Symlinks = sinon.stub( ckeditor5Dirs, 'getCKE5Symlinks' ).returns( [] );

		const json = {
			dependencies: {
				'ckeditor5-core': 'ckeditor/ckeditor5-core',
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'ckeditor5-ui': 'ckeditor/ckeditor5-ui',
				'other-plugin': '1.2.3'
			}
		};

		updateTask( installTask, ckeditor5Path, json, workspaceRoot, true );

		const repoPath1 = path.join( workspaceAbsolutePath, dirs[ 0 ] );
		const repoPath2 = path.join( workspaceAbsolutePath, dirs[ 1 ] );

		sinon.assert.calledThrice( spies.fetchAll );
		sinon.assert.calledWithExactly( spies.fetchAll.firstCall, ckeditor5Path );
		sinon.assert.calledWithExactly( spies.fetchAll.secondCall, repoPath1 );
		sinon.assert.calledWithExactly( spies.fetchAll.thirdCall, repoPath2 );
		sinon.assert.calledTwice( spies.checkout );
		sinon.assert.calledWithExactly( spies.checkout.firstCall, repoPath1, 'master' );
		sinon.assert.calledWithExactly( spies.checkout.secondCall, repoPath2, 'new-branch' );
		sinon.assert.calledTwice( spies.pull );
		sinon.assert.calledWithExactly( spies.pull.firstCall, repoPath1, 'master' );
		sinon.assert.calledWithExactly( spies.pull.secondCall, repoPath2, 'new-branch' );

		sinon.assert.calledThrice( spies.npmUpdate );
		sinon.assert.calledWithExactly( spies.npmUpdate.firstCall, path.join( workspaceAbsolutePath, dirs[ 0 ] ) );
		sinon.assert.calledWithExactly( spies.npmUpdate.secondCall, path.join( workspaceAbsolutePath, dirs[ 1 ] ) );
		sinon.assert.calledWithExactly( spies.npmUpdate.thirdCall, ckeditor5Path );

		sinon.assert.calledOnce( installTask );
		sinon.assert.calledWithExactly( installTask, ckeditor5Path, workspaceRoot, 'ckeditor/ckeditor5-ui' );

		sinon.assert.calledOnce( spies.getCKE5Symlinks );
		sinon.assert.notCalled( spies.removeSymlink );
	} );

	it( 'should remove symlinks that are not needed', () => {
		const dirs = [ 'ckeditor5-core', 'ckeditor5-devtest' ];
		const installTask = sinon.spy();
		spies.getDirectories = sinon.stub( ckeditor5Dirs, 'getCKE5Directories' ).returns( dirs );
		spies.getCKE5Symlinks = sinon.stub( ckeditor5Dirs, 'getCKE5Symlinks' ).returns( [ 'ckeditor5-unused' ] );

		const json = {
			dependencies: {
				'ckeditor5-core': 'ckeditor/ckeditor5-core',
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};

		updateTask( installTask, ckeditor5Path, json, workspaceRoot, true );

		const repoPath1 = path.join( workspaceAbsolutePath, dirs[ 0 ] );
		const repoPath2 = path.join( workspaceAbsolutePath, dirs[ 1 ] );

		sinon.assert.calledThrice( spies.fetchAll );
		sinon.assert.calledWithExactly( spies.fetchAll.firstCall, ckeditor5Path );
		sinon.assert.calledWithExactly( spies.fetchAll.secondCall, repoPath1 );
		sinon.assert.calledWithExactly( spies.fetchAll.thirdCall, repoPath2 );
		sinon.assert.calledTwice( spies.checkout );
		sinon.assert.calledWithExactly( spies.checkout.firstCall, repoPath1, 'master' );
		sinon.assert.calledWithExactly( spies.checkout.secondCall, repoPath2, 'new-branch' );
		sinon.assert.calledTwice( spies.pull );
		sinon.assert.calledWithExactly( spies.pull.firstCall, repoPath1, 'master' );
		sinon.assert.calledWithExactly( spies.pull.secondCall, repoPath2, 'new-branch' );

		sinon.assert.calledThrice( spies.npmUpdate );
		sinon.assert.calledWithExactly( spies.npmUpdate.firstCall, path.join( workspaceAbsolutePath, dirs[ 0 ] ) );
		sinon.assert.calledWithExactly( spies.npmUpdate.secondCall, path.join( workspaceAbsolutePath, dirs[ 1 ] ) );
		sinon.assert.calledWithExactly( spies.npmUpdate.thirdCall, ckeditor5Path );

		sinon.assert.calledOnce( spies.getCKE5Symlinks );
		sinon.assert.notCalled( installTask );

		sinon.assert.calledOnce( spies.removeSymlink );
		sinon.assert.calledWithExactly( spies.removeSymlink, path.join( ckeditor5Path, 'node_modules', 'ckeditor5-unused' ) );
	} );

	it( 'should catch linking errors', () => {
		const log = require( '../../utils/log' );
		const dirs = [ 'ckeditor5-core', 'ckeditor5-devtest' ];
		const installTask = sinon.spy();
		const outSpy = sinon.spy();
		const errSpy = sinon.spy();
		spies.getDirectories = sinon.stub( ckeditor5Dirs, 'getCKE5Directories' ).returns( dirs );
		spies.getCKE5Symlinks = sinon.stub( ckeditor5Dirs, 'getCKE5Symlinks' ).returns( [ 'ckeditor5-unused' ] );
		spies.linkDirectories.throws();

		log.configure( outSpy, errSpy );

		const json = {
			dependencies: {
				'ckeditor5-core': 'ckeditor/ckeditor5-core',
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};

		updateTask( installTask, ckeditor5Path, json, workspaceRoot, false );

		const repoPath1 = path.join( workspaceAbsolutePath, dirs[ 0 ] );
		const repoPath2 = path.join( workspaceAbsolutePath, dirs[ 1 ] );

		sinon.assert.calledThrice( spies.fetchAll );
		sinon.assert.calledWithExactly( spies.fetchAll.firstCall, ckeditor5Path );
		sinon.assert.calledWithExactly( spies.fetchAll.secondCall, repoPath1 );
		sinon.assert.calledWithExactly( spies.fetchAll.thirdCall, repoPath2 );
		sinon.assert.calledTwice( spies.checkout );
		sinon.assert.calledWithExactly( spies.checkout.firstCall, repoPath1, 'master' );
		sinon.assert.calledWithExactly( spies.checkout.secondCall, repoPath2, 'new-branch' );
		sinon.assert.calledTwice( spies.pull );
		sinon.assert.calledWithExactly( spies.pull.firstCall, repoPath1, 'master' );
		sinon.assert.calledWithExactly( spies.pull.secondCall, repoPath2, 'new-branch' );

		sinon.assert.notCalled( spies.npmUpdate );

		sinon.assert.calledOnce( spies.getCKE5Symlinks );
		sinon.assert.notCalled( installTask );

		sinon.assert.calledOnce( spies.removeSymlink );
		sinon.assert.calledWithExactly( spies.removeSymlink, path.join( ckeditor5Path, 'node_modules', 'ckeditor5-unused' ) );
		sinon.assert.calledTwice( errSpy );
	} );

	it( 'should skip updating if no dependencies found and fetch only main repository', () => {
		spies.getDependencies.restore();
		spies.getDependencies = sinon.stub( ckeditor5Dirs, 'getCKEditorDependencies' ).returns( null );
		const dirs = [ 'ckeditor5-core', 'ckeditor5-devtest' ];
		const installTask = sinon.spy();
		spies.getDirectories = sinon.stub( ckeditor5Dirs, 'getCKE5Directories' ).returns( dirs );
		spies.getCKE5Symlinks = sinon.stub( ckeditor5Dirs, 'getCKE5Symlinks' ).returns( [] );

		const json = {
			dependencies: {
				'ckeditor5-core': 'ckeditor/ckeditor5-core',
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};

		updateTask( installTask, ckeditor5Path, json, workspaceRoot, false );

		sinon.assert.calledOnce( spies.fetchAll );
		sinon.assert.calledWithExactly( spies.fetchAll.firstCall, ckeditor5Path );

		sinon.assert.notCalled( spies.checkout );
		sinon.assert.notCalled( spies.pull );

		sinon.assert.notCalled( spies.npmUpdate );

		sinon.assert.calledOnce( spies.getCKE5Symlinks );
		sinon.assert.notCalled( installTask );

		sinon.assert.notCalled( spies.removeSymlink );
	} );
} );

describe( 'gulp task update', () => {
	const tasks = gulp.tasks;

	it( 'should be available', () => {
		expect( tasks ).to.have.property( 'update' );
		expect( tasks.update.fn ).to.be.a( 'function' );
	} );

	it( 'should have an alias', () => {
		expect( tasks ).to.have.property( 'pull' );
		expect( tasks.pull.fn ).to.be.a( 'function' );

		expect( tasks.pull.fn ).to.equal( tasks.update.fn );
	} );
} );
