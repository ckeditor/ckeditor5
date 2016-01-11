/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

'use strict';

const chai = require( 'chai' );
const expect = chai.expect;
const sinon = require( 'sinon' );
const gulp = require( 'gulp' );
const gutil = require( 'gulp-util' );
const path = require( 'path' );
const stream = require( 'stream' );
const Vinyl = require( 'vinyl' );

describe( 'build-utils', () => {
	const utils = require( '../../tasks/gulp/build/utils' );
	let sandbox;

	beforeEach( () => {
		sandbox = sinon.sandbox.create();
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	describe( 'noop', () => {
		it( 'should return PassTrough stream', () => {
			const PassThrough = stream.PassThrough;
			const ret = utils.noop();
			expect( ret instanceof PassThrough ).to.equal( true );
		} );
	} );

	describe( 'dist', () => {
		it( 'should return stream created with gulp.dest', () => {
			const distDir = 'dist/';
			const format = 'amd';
			const destSpy = sandbox.spy( gulp, 'dest' );
			const stream = utils.dist( distDir, format );

			sinon.assert.calledOnce( destSpy );
			sinon.assert.calledWithExactly( destSpy, path.join( distDir, format ) );
			expect( stream ).to.equal( destSpy.firstCall.returnValue );
		} );
	} );

	describe( 'transpile', () => {
		it( 'should throw an exception when incorrect format is provided', () => {
			const transpileSpy = sandbox.spy( utils, 'transpile' );
			const format = 'incorrect-format';
			let error;

			try {
				transpileSpy( format );
			} catch ( e ) {
				error = e;
			}

			sinon.assert.threw( transpileSpy, error );
			expect( error.message ).to.equal( `Incorrect format: ${ format }` );
		} );

		it( 'should return babel transform stream', ( done ) => {
			const modulePath = '../files/utils/lib';
			const babelStream = utils.transpile( 'amd' );
			const Stream = stream.Stream;
			const appendModuleExtensionSpy = sandbox.spy( utils, 'appendModuleExtension' );

			expect( babelStream instanceof Stream ).to.equal( true );
			expect( babelStream.readable ).to.equal( true );
			expect( babelStream.writable ).to.equal( true );

			babelStream.on( 'finish', ( ) => {
				sinon.assert.calledOnce( appendModuleExtensionSpy );
				sinon.assert.calledWithExactly( appendModuleExtensionSpy, modulePath );
				expect( appendModuleExtensionSpy.firstCall.returnValue ).to.equal( modulePath + '.js' );
				done();
			} );

			babelStream.write( new Vinyl( {
				cwd: '/',
				base: '/test/',
				path: '/test/file.js',
				contents: new Buffer( `import * as lib from '${ modulePath }'` )
			} ) );

			babelStream.end();
		} );

		it( 'should report error when transpiling fails', ( done ) => {
			const babelStream = utils.transpile( 'amd' );
			const utilLogStub = sandbox.stub( gutil, 'log' );
			const consoleLogStub = sandbox.stub( console, 'log' );

			babelStream.once( 'finish', () => {
				sinon.assert.calledTwice( utilLogStub );
				sinon.assert.calledOnce( consoleLogStub );
				done();
			} );

			babelStream.write( new Vinyl( {
				cwd: '/',
				base: '/test/',
				path: '/test/file.js',
				contents: new Buffer( 'class ;' )
			} ) );

			babelStream.end();
		} );
	} );

	describe( 'getConversionStreamGenerator', () => {
		it( 'should return function that can be used for creating conversion streams', () => {
			const distDir = 'dist/';
			const formats = [ 'amd', 'cjs', 'esnext' ];
			const fn = utils.getConversionStreamGenerator( distDir );
			const streams = formats.reduce( fn, [] );

			expect( streams.length ).to.equal( formats.length );
		} );
	} );

	describe( 'pickVersionedFile', () => {
		it( 'should rename file for provided format', ( done ) => {
			const rename = utils.pickVersionedFile( 'amd' );

			rename.once( 'finish', () => {
				done();
			} );

			rename.on( 'data', ( data ) => {
				expect( data.basename ).to.equal( 'load.js' );
			} );

			rename.write(  new Vinyl( {
				cwd: '/',
				base: '/test/',
				path: '/test/load__amd.js',
				contents: new Buffer( '' )
			} ) );

			rename.end();
		} );
	} );

	describe( 'unpackPackages', () => {
		it( 'should move files to correct directories', ( done ) => {
			const rename = utils.unpackPackages();

			rename.once( 'finish', () => {
				done();
			} );

			rename.on( 'data', ( data ) => {
				expect( data.path ).to.equal( 'ckeditor5-core/file.js' );
			} );

			rename.write(  new Vinyl( {
				cwd: './',
				path: 'ckeditor5-core/src/file.js',
				contents: new Buffer( '' )
			} ) );

			rename.end();
		} );
	} );

	describe( 'wrapCKEditor5Package', () => {
		it( 'should add `ckeditor5/` to a file path', ( done ) => {
			const rename = utils.wrapCKEditor5Package();
			const filePath = './test/file.js';
			const path = require( 'path' );

			rename.once( 'finish', () => {
				done();
			} );

			rename.on( 'data', ( data ) => {
				expect( data.path ).to.equal( path.join( 'ckeditor5', filePath ) );
			} );

			rename.write(  new Vinyl( {
				cwd: './',
				path: filePath,
				contents: new Buffer( '' )
			} ) );

			rename.end();
		} );
	} );

	describe( 'appendModuleExtension', (  ) => {
		it( 'appends module extension when path provided', () => {
			const filePath = './path/to/file';
			const source = utils.appendModuleExtension( filePath );

			expect( source ).to.equal( filePath + '.js' );
		} );

		it( 'appends module extension when URL is provided', () => {
			const url = 'http://example.com/lib';
			const source = utils.appendModuleExtension( url );

			expect( source ).to.equal( url + '.js' );
		} );

		it( 'returns unchanged if module is provided', () => {
			const module = 'lib/module';
			const source = utils.appendModuleExtension( module );

			expect( source ).to.equal( module );
		} );
	} );
} );
