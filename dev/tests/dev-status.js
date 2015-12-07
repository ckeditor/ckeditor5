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

describe( 'dev-status', () => {
	const statusTask = require( '../tasks/utils/dev-status' );
	const ckeditor5Path = 'path/to/ckeditor5';
	const workspaceRoot = '..';
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );
	const emptyFn = () => {};

	it( 'should show status of dev repositories', () => {
		const dirs = [ 'ckeditor5-core', 'ckeditor5-devtest' ];
		const getDependenciesSpy = sinon.spy( tools, 'getCKEditorDependencies' );
		const getDirectoriesStub = sinon.stub( tools, 'getCKE5Directories' ).returns( dirs );
		const statusStub = sinon.stub( git, 'getStatus' );
		const json = {
			dependencies: {
				'ckeditor5-core': 'ckeditor/ckeditor5-core',
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};

		statusTask( ckeditor5Path, json, workspaceRoot, emptyFn, emptyFn );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		statusStub.restore();

		sinon.assert.calledTwice( statusStub );
		sinon.assert.calledWithExactly( statusStub.firstCall, path.join( workspaceAbsolutePath, dirs[ 0 ] ) );
		sinon.assert.calledWithExactly( statusStub.secondCall, path.join( workspaceAbsolutePath, dirs[ 1 ] ) );
	} );

	it( 'should not get status when no dependencies are found', () => {
		const getDependenciesSpy = sinon.spy( tools, 'getCKEditorDependencies' );
		const getDirectoriesStub = sinon.stub( tools, 'getCKE5Directories' );
		const statusStub = sinon.stub( git, 'getStatus' );
		const json = {
			dependencies: {
				'other-plugin': '1.2.3'
			}
		};

		statusTask( ckeditor5Path, json, workspaceRoot, emptyFn, emptyFn );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		statusStub.restore();

		sinon.assert.notCalled( statusStub );
	} );

	it( 'should not get status when no plugins in dev mode', () => {
		const getDependenciesSpy = sinon.spy( tools, 'getCKEditorDependencies' );
		const getDirectoriesStub = sinon.stub( tools, 'getCKE5Directories' ).returns( [] );
		const statusStub = sinon.stub( git, 'getStatus' );
		const json = {
			dependencies: {
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};

		statusTask( ckeditor5Path, json, workspaceRoot, emptyFn, emptyFn );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		statusStub.restore();

		sinon.assert.notCalled( statusStub );
	} );

	it( 'should write error message when getStatus is unsuccessful', () => {
		const dirs = [ 'ckeditor5-core' ];
		const getDependenciesSpy = sinon.spy( tools, 'getCKEditorDependencies' );
		const getDirectoriesStub = sinon.stub( tools, 'getCKE5Directories' ).returns( dirs );
		const error = new Error( 'Error message.' );
		const statusStub = sinon.stub( git, 'getStatus' ).throws( error );
		const json = {
			dependencies: {
				'ckeditor5-core': 'ckeditor/ckeditor5-core',
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};
		const writeErrorSpy = sinon.spy();

		statusTask( ckeditor5Path, json, workspaceRoot, emptyFn, writeErrorSpy );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		statusStub.restore();

		sinon.assert.calledOnce( statusStub );
		sinon.assert.calledOnce( writeErrorSpy );
		sinon.assert.calledWithExactly( writeErrorSpy, error );
	} );
} );
