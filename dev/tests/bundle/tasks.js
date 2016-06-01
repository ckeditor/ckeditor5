/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

'use strict';

const mockery = require( 'mockery' );
const sinon = require( 'sinon' );

describe( 'build-tasks', () => {
	let sandbox, tasks, rollupBundleMock, rollupBundleWriteMock;
	const config = {
		ROOT_DIR: '.',
		BUILD_DIR: 'build',
		BUNDLE_DIR: 'bundle'
	};

	beforeEach( () => {
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );

		sandbox = sinon.sandbox.create();

		rollupBundleWriteMock = sandbox.spy();
		rollupBundleMock = {
			write: rollupBundleWriteMock
		};

		mockery.registerMock( 'rollup', {
			rollup: () => {
				return {
					then: ( resolve ) => {
						resolve( rollupBundleMock );
					}
				};
			}
		} );

		tasks = require( '../../tasks/bundle/tasks' )( config );
	} );

	afterEach( () => {
		mockery.disable();
		sandbox.restore();
	} );

	describe( 'generate', () => {
		it( 'should use rollup to generate js bundle and save bundled file', () => {
			tasks.generate();

			sinon.assert.calledWithExactly( rollupBundleWriteMock, {
				dest: 'bundle/ckeditor.js',
				format: 'iife',
				moduleName: 'ClassicEditor'
			} );
		} );
	} );
} );
