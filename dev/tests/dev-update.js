/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

'use strict';

const sinon = require( 'sinon' );
const tools = require( '../tasks/utils/tools' );
const git = require( '../tasks/utils/git' );
const path = require( 'path' );

describe( 'dev-update', () => {
	const updateTask = require( '../tasks/utils/dev-update' );
	const ckeditor5Path = 'path/to/ckeditor5';
	const workspaceRoot = '..';
	const workspaceAbsolutePath = path.join( ckeditor5Path, workspaceRoot );
	const emptyFn = () => {};
	const spies = {};

	beforeEach( () => {
		spies.getDependencies = sinon.spy( tools, 'getCKEditorDependencies' );
		spies.checkout = sinon.stub( git, 'checkout' );
		spies.pull = sinon.stub( git, 'pull' );
		spies.npmUpdate = sinon.stub( tools, 'npmUpdate' );
	} );

	afterEach( () => {
		Object.keys( spies ).forEach( ( spy ) => spies[ spy ].restore() );
	} );

	it( 'should update dev repositories', () => {
		const dirs = [ 'ckeditor5-core', 'ckeditor5-devtest' ];
		spies.getDirectories = sinon.stub( tools, 'getCKE5Directories' ).returns( dirs );

		const json = {
			dependencies: {
				'ckeditor5-core': 'ckeditor/ckeditor5-core',
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};

		updateTask( ckeditor5Path, json, workspaceRoot, emptyFn, true );

		sinon.assert.calledTwice( spies.pull );
		sinon.assert.calledWithExactly( spies.pull.firstCall, path.join( workspaceAbsolutePath, dirs[ 0 ] ), 'master' );
		sinon.assert.calledWithExactly( spies.pull.secondCall, path.join( workspaceAbsolutePath, dirs[ 1 ] ), 'new-branch' );

		sinon.assert.calledThrice( spies.npmUpdate );
		sinon.assert.calledWithExactly( spies.npmUpdate.firstCall, path.join( workspaceAbsolutePath, dirs[ 0 ] ) );
		sinon.assert.calledWithExactly( spies.npmUpdate.secondCall, path.join( workspaceAbsolutePath, dirs[ 1 ] ) );
		sinon.assert.calledWithExactly( spies.npmUpdate.thirdCall, ckeditor5Path );
	} );

	it( 'should update dev repositories without running npm update', () => {
		const dirs = [ 'ckeditor5-core' ];
		spies.getDirectories = sinon.stub( tools, 'getCKE5Directories' ).returns( dirs );

		const json = {
			dependencies: {
				'ckeditor5-core': 'ckeditor/ckeditor5-core',
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};

		updateTask( ckeditor5Path, json, workspaceRoot, emptyFn, false );
		sinon.assert.calledWithExactly( spies.pull.firstCall, path.join( workspaceAbsolutePath, dirs[ 0 ] ), 'master' );
		sinon.assert.notCalled( spies.npmUpdate );
	} );

	it( 'should not update when no dependencies are found', () => {
		spies.getDirectories = sinon.stub( tools, 'getCKE5Directories' );
		const json = {
			dependencies: {
				'other-plugin': '1.2.3'
			}
		};

		updateTask( ckeditor5Path, json, workspaceRoot, emptyFn, false );

		sinon.assert.notCalled( spies.pull );
		sinon.assert.notCalled( spies.npmUpdate );
	} );

	it( 'should not update when no plugins in dev mode', () => {
		spies.getDirectories = sinon.stub( tools, 'getCKE5Directories' ).returns( [] );
		const json = {
			dependencies: {
				'ckeditor5-devtest': 'ckeditor/ckeditor5-devtest#new-branch',
				'other-plugin': '1.2.3'
			}
		};

		updateTask( ckeditor5Path, json, workspaceRoot, emptyFn, false );

		sinon.assert.notCalled( spies.pull );
		sinon.assert.notCalled( spies.npmUpdate );
	} );
} );
