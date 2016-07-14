/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it */

'use strict';

const sinon = require( 'sinon' );
const ckeditor5Dirs = require( '../../utils/ckeditor5-dirs' );

describe( 'dev-init', () => {
	const initTask = require( '../../tasks/dev/tasks/init' );
	const ckeditor5Path = 'path/to/ckeditor5';
	const workspaceRoot = '..';

	it( 'should get all ckedtior5- dependencies and execute dev-install on them', () => {
		const getDependenciesSpy = sinon.spy( ckeditor5Dirs, 'getDependencies' );
		const installSpy = sinon.spy();
		const json = {
			dependencies: {
				'ckeditor5-core': 'ckeditor/ckeditor5-code',
				'non-ckeditor-plugin': '^2.0.0',
				'ckeditor5-plugin-devtest': 'ckeditor/ckeditor5-plugin-devtest'
			}
		};
		const deps = json.dependencies;

		initTask( installSpy, ckeditor5Path, json, workspaceRoot );

		getDependenciesSpy.restore();

		sinon.assert.calledOnce( getDependenciesSpy );
		sinon.assert.calledWithExactly( getDependenciesSpy, deps );
		sinon.assert.calledTwice( installSpy );
		sinon.assert.calledWithExactly( installSpy.firstCall, ckeditor5Path, workspaceRoot, deps[ 'ckeditor5-core' ] );
		sinon.assert.calledWithExactly( installSpy.secondCall, ckeditor5Path, workspaceRoot, deps[ 'ckeditor5-plugin-devtest' ] );
	} );

	it( 'should not call dev-install if no ckedtior5- dependencies', () => {
		const getDependenciesSpy = sinon.spy( ckeditor5Dirs, 'getDependencies' );
		const installSpy = sinon.spy();
		const json = {
			dependencies: {}
		};

		initTask( installSpy, ckeditor5Path, json, workspaceRoot );

		getDependenciesSpy.restore();

		sinon.assert.calledOnce( getDependenciesSpy );
		sinon.assert.calledWithExactly( getDependenciesSpy, json.dependencies );
		sinon.assert.notCalled( installSpy );
	} );
} );
