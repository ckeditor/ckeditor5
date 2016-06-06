/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

'use strict';

const chai = require( 'chai' );
const expect = chai.expect;
const sinon = require( 'sinon' );
const path = require( 'path' );
const fs = require( 'fs' );
const mainUtils = require( '../../tasks/utils' );
const gzipSize = require( 'gzip-size' );

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
		it( 'should return file size in bytes', () => {
			const filePath = 'path/to/file';
			const size = 1337;
			const statSyncMock = sandbox.stub( fs, 'statSync', () => {
				return { size };
			} );

			expect( utils.getFileSize( filePath ) ).to.be.equal( size );
			sinon.assert.calledWithExactly( statSyncMock, filePath );
		} );
	} );

	describe( 'getGzippedFileSize', () => {
		it( 'should return file size in bytes', () => {
			const filePath = 'path/to/file';
			const size = 1337;
			const fileContent = 'some string';
			const readFileSyncMock = sandbox.stub( fs, 'readFileSync', () => fileContent );
			const gzipSizeMock = sandbox.stub( gzipSize, 'sync', () => 1337 );

			expect( utils.getGzippedFileSize( filePath ) ).to.be.equal( size );
			sinon.assert.calledWithExactly( readFileSyncMock, filePath );
			sinon.assert.calledWithExactly( gzipSizeMock, fileContent );
		} );
	} );

	describe( 'getFilesSizeStats', () => {
		let size, gzippedSize;

		beforeEach( () => {
			size = 1337;
			gzippedSize = 543;

			sandbox.stub( utils, 'getFileSize', () => size );
			sandbox.stub( utils, 'getGzippedFileSize', () => gzippedSize );
		} );

		it( 'should returns an array with two elements', () => {
			const result = utils.getFilesSizeStats( [ 'sub/dir/file.js', 'other/sub/dir/file.css' ] , 'root/path' );

			expect( result ).to.be.an( 'array' );
			expect( result ).to.have.length( 2 );
		} );

		it( 'should returns list of object with files stats', () => {
			const result = utils.getFilesSizeStats( [ 'sub/dir/file.js', 'other/sub/dir/file.css' ] , 'root/path' );

			expect( result ).to.be.deep.equal( [
				{ name: 'file.js', size, gzippedSize },
				{ name: 'file.css', size, gzippedSize }
			] );
		} );

		it( 'should get files from root directory', () => {
			let basenameSpy = sandbox.spy( path, 'basename' );

			const result = utils.getFilesSizeStats( [ 'sub/dir/file.js', 'other/sub/dir/file.css' ] , 'root/path' );

			expect( result[0] ).to.have.property( 'name' ).equal( 'file.js' );
			expect( result[1] ).to.have.property( 'name' ).equal( 'file.css' );
			sinon.assert.calledWithExactly( basenameSpy.firstCall, 'root/path/sub/dir/file.js' );
			sinon.assert.calledWithExactly( basenameSpy.secondCall, 'root/path/other/sub/dir/file.css' );
		} );

		it( 'should get files if root directory is not specified', () => {
			let basenameSpy = sandbox.spy( path, 'basename' );

			const result = utils.getFilesSizeStats( [ 'sub/dir/file.js', 'file.css' ] );

			expect( result[0] ).to.have.property( 'name' ).equal( 'file.js' );
			expect( result[1] ).to.have.property( 'name' ).equal( 'file.css' );
			sinon.assert.calledWithExactly( basenameSpy.firstCall, 'sub/dir/file.js' );
			sinon.assert.calledWithExactly( basenameSpy.secondCall, 'file.css' );
		} );
	} );
} );
