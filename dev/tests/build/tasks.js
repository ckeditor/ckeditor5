/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

'use strict';

const mockery = require( 'mockery' );
const sinon = require( 'sinon' );
const Vinyl = require( 'vinyl' );
const utils = require( '../../tasks/gulp/build/utils' );
const babel = require( 'babel-core' );
const chai = require( 'chai' );
const expect = chai.expect;
const gutil = require( 'gulp-util' );

describe( 'build-tasks', () => {
	let sandbox;
	const config = {
		ROOT_DIR: '.',
		DIST_DIR: 'dist'
	};

	beforeEach( () => {
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );

		sandbox = sinon.sandbox.create();
	} );

	afterEach( () => {
		mockery.disable();
		sandbox.restore();
	} );

	describe( 'build', () => {
		it( 'should return build stream', ( done ) => {
			const code = 'export default {};';
			sandbox.stub( gutil, 'log' );
			mockery.registerMock( 'minimist', () => {
				return {
					formats: 'amd',
					watch: false
				};
			} );

			const tasks = require( '../../tasks/gulp/build/tasks' )( config );
			const build = tasks.build;
			const stream = require( 'stream' );
			const files = [
				new Vinyl( {
					cwd: './',
					path: './src/file.js',
					contents: new Buffer( code )
				} )
			];

			// Stub input stream.
			sandbox.stub( tasks.src, 'all', () => {
				const fakeInputStream = new stream.Readable( { objectMode: true } );
				fakeInputStream._read = () => {
					fakeInputStream.push( files.pop() || null );
				};

				return fakeInputStream;
			} );

			// Stub output stream.
			sandbox.stub( utils, 'dist', () => {
				const fakeOutputStream = new stream.Writable( { objectMode: true } );
				fakeOutputStream._write = ( file, encoding, done ) => {
					const result = babel.transform( code, { plugins: [ 'transform-es2015-modules-amd' ] } );
					// Check if provided code was transformed by babel.
					expect( file.contents.toString() ).to.equal( result.code );
					done();
				};

				return fakeOutputStream;
			} );

			const conversionStream = build();
			conversionStream.on( 'finish', () => done() );
		} );
	} );
} );
