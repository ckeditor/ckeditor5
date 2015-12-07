/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it */

'use strict';

const sinon = require( 'sinon' );
const tools = require( '../tasks/utils/tools' );
const git = require( '../tasks/utils/git' );
const path = require( 'path' );

describe( 'dev-init', () => {
	const updateTask = require( '../tasks/utils/dev-update' );
	const ckeditor5Path = 'path/to/ckeditor5';
	const workspaceRoot = '..';
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );
	const emptyFn = () => {};

	it( 'should update dev repositories', () => {
		const dirs = [ 'ckeditor5-core', 'ckeditor5-devtest' ];
		const getDependenciesSpy = sinon.spy( tools, 'getCKEditorDependencies' );
		const getDirectoriesStub = sinon.stub( tools, 'getCKE5Directories' ).returns( dirs );
		const pullStub = sinon.stub( git, 'pull' );
		const json = {
			dependencies: {
				'ckeditor5-core': 'ckeditor/ckeditor5-core',
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};

		updateTask( ckeditor5Path, json, workspaceRoot, emptyFn, emptyFn );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		pullStub.restore();

		sinon.assert.calledTwice( pullStub );
		sinon.assert.calledWithExactly( pullStub.firstCall, path.join( workspaceAbsolutePath, dirs[ 0 ] ), 'master' );
		sinon.assert.calledWithExactly( pullStub.secondCall, path.join( workspaceAbsolutePath, dirs[ 1 ] ), 'new-branch' );
	} );

	it( 'should not update when no dependencies are found', () => {
		const getDependenciesSpy = sinon.spy( tools, 'getCKEditorDependencies' );
		const getDirectoriesStub = sinon.stub( tools, 'getCKE5Directories' );
		const pullStub = sinon.stub( git, 'pull' );
		const json = {
			dependencies: {
				'other-plugin': '1.2.3'
			}
		};

		updateTask( ckeditor5Path, json, workspaceRoot, emptyFn, emptyFn );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		pullStub.restore();

		sinon.assert.notCalled( pullStub );
	} );

	it( 'should not update when no plugins in dev mode', () => {
		const getDependenciesSpy = sinon.spy( tools, 'getCKEditorDependencies' );
		const getDirectoriesStub = sinon.stub( tools, 'getCKE5Directories' ).returns( [] );
		const pullStub = sinon.stub( git, 'pull' );
		const json = {
			dependencies: {
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};

		updateTask( ckeditor5Path, json, workspaceRoot, emptyFn, emptyFn );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		pullStub.restore();

		sinon.assert.notCalled( pullStub );
	} );

	it( 'should write error message when pulling is unsuccessful', () => {
		const dirs = [ 'ckeditor5-core' ];
		const getDependenciesSpy = sinon.spy( tools, 'getCKEditorDependencies' );
		const getDirectoriesStub = sinon.stub( tools, 'getCKE5Directories' ).returns( dirs );
		const error = new Error( 'Error message.' );
		const pullStub = sinon.stub( git, 'pull' ).throws( error );
		const json = {
			dependencies: {
				'ckeditor5-core': 'ckeditor/ckeditor5-core',
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};
		const writeErrorSpy = sinon.spy();

		updateTask( ckeditor5Path, json, workspaceRoot, emptyFn, writeErrorSpy );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		pullStub.restore();

		sinon.assert.calledOnce( pullStub );
		sinon.assert.calledOnce( writeErrorSpy );
		sinon.assert.calledWithExactly( writeErrorSpy, error );
	} );
} );
