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

describe( 'dev-boilerplate-update', () => {
	const task = require( '../tasks/utils/dev-boilerplate-update' );
	const ckeditor5Path = 'path/to/ckeditor5';
	const workspaceRoot = '..';
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );
	const emptyFn = () => {};

	it( 'should update boilerplate in dev repositories', () => {
		const dirs = [ 'ckeditor5-core', 'ckeditor5-devtest' ];
		const getDependenciesSpy = sinon.spy( tools, 'getCKEditorDependencies' );
		const getDirectoriesStub = sinon.stub( tools, 'getCKE5Directories' ).returns( dirs );
		const updateStub = sinon.stub( git, 'updateBoilerplate' );
		const json = {
			dependencies: {
				'ckeditor5-core': 'ckeditor/ckeditor5-core',
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};

		task( ckeditor5Path, json, workspaceRoot, emptyFn, emptyFn );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		updateStub.restore();

		sinon.assert.calledTwice( updateStub );
		sinon.assert.calledWithExactly( updateStub.firstCall, path.join( workspaceAbsolutePath, dirs[ 0 ] ) );
		sinon.assert.calledWithExactly( updateStub.secondCall, path.join( workspaceAbsolutePath, dirs[ 1 ] ) );
	} );

	it( 'should not update boilerplate when no dependencies are found', () => {
		const getDependenciesSpy = sinon.spy( tools, 'getCKEditorDependencies' );
		const getDirectoriesStub = sinon.stub( tools, 'getCKE5Directories' );
		const updateStub = sinon.stub( git, 'updateBoilerplate' );
		const json = {
			dependencies: {
				'other-plugin': '1.2.3'
			}
		};

		task( ckeditor5Path, json, workspaceRoot, emptyFn, emptyFn );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		updateStub.restore();

		sinon.assert.notCalled( updateStub );
	} );

	it( 'should not update boilerplate when no plugins in dev mode', () => {
		const getDependenciesSpy = sinon.spy( tools, 'getCKEditorDependencies' );
		const getDirectoriesStub = sinon.stub( tools, 'getCKE5Directories' ).returns( [] );
		const updateStub = sinon.stub( git, 'updateBoilerplate' );
		const json = {
			dependencies: {
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};

		task( ckeditor5Path, json, workspaceRoot, emptyFn, emptyFn );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		updateStub.restore();

		sinon.assert.notCalled( updateStub );
	} );

	it( 'should write error message when updating boilerplate is unsuccessful', () => {
		const dirs = [ 'ckeditor5-core' ];
		const getDependenciesSpy = sinon.spy( tools, 'getCKEditorDependencies' );
		const getDirectoriesStub = sinon.stub( tools, 'getCKE5Directories' ).returns( dirs );
		const error = new Error( 'Error message.' );
		const updateStub = sinon.stub( git, 'updateBoilerplate' ).throws( error );
		const json = {
			dependencies: {
				'ckeditor5-core': 'ckeditor/ckeditor5-core',
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};
		const writeErrorSpy = sinon.spy();

		task( ckeditor5Path, json, workspaceRoot, emptyFn, writeErrorSpy );

		getDependenciesSpy.restore();
		getDirectoriesStub.restore();
		updateStub.restore();

		sinon.assert.calledOnce( updateStub );
		sinon.assert.calledOnce( writeErrorSpy );
		sinon.assert.calledWithExactly( writeErrorSpy, error );
	} );
} );
