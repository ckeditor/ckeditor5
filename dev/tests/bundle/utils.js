/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

'use strict';

const chai = require( 'chai' );
const expect = chai.expect;
const sinon = require( 'sinon' );
const gutil = require( 'gulp-util' );
const path = require( 'path' );
const fs = require( 'fs' );
const mainUtils = require( '../../tasks/utils' );

describe( 'bundle-utils', () => {
	const utils = require( '../../tasks/bundle/utils' );
	let sandbox;

	beforeEach( () => {
		sandbox = sinon.sandbox.create();
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	it( 'should be extended by top level utils', () => {
		expect( utils.clean ).to.be.equal( mainUtils.clean );
	} );

	describe( 'getFileSize', () => {
		it( 'should return human readable file size', () => {
			let filePath = 'path/to/file';
			let statSyncMock = sandbox.stub( fs, 'statSync', () => {
				return { size: 102400 };
			} );

			expect( utils.getFileSize( filePath ) ).to.be.equal( '100 KB' );
			sinon.assert.calledWithExactly( statSyncMock, filePath );
		} );
	} );

	describe( 'logFilesSize', () => {
		let gutilLogSpy;

		beforeEach( () => {
			gutilLogSpy = sandbox.stub( gutil, 'log' );
			sandbox.stub( utils, 'getFileSize', () => '1 MB' );
		} );

		it( 'should log only files base name with file size separate by new line character', () => {
			const expected = gutil.colors.green( `\nfile1.js: 1 MB\nfile2.js: 1 MB` );

			utils.logFilesSize( [ 'sub/dir/file1.js', 'other/sub/dir/file2.js' ] , 'root/path' );

			sinon.assert.calledWithExactly( gutilLogSpy, expected );
		} );

		it( 'should get files from root directory', () => {
			let basenameSpy = sandbox.spy( path, 'basename' );

			utils.logFilesSize( [ 'sub/dir/file1.js', 'other/sub/dir/file2.js' ] , 'root/path' );

			sinon.assert.calledWithExactly( basenameSpy.firstCall, 'root/path/sub/dir/file1.js' );
			sinon.assert.calledWithExactly( basenameSpy.secondCall, 'root/path/other/sub/dir/file2.js' );
		} );

		it( 'should get files if root directory is not specified', () => {
			let basenameSpy = sandbox.spy( path, 'basename' );

			utils.logFilesSize( [ 'sub/dir/file1.js', 'file2.js' ] );

			sinon.assert.calledWithExactly( basenameSpy.firstCall, 'sub/dir/file1.js' );
			sinon.assert.calledWithExactly( basenameSpy.secondCall, 'file2.js' );
		} );
	} );
} );
