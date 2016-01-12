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
const gulp = require( 'gulp' );
const path = require( 'path' );

describe( 'build-tasks', () => {
	let sandbox, tasks;
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

		mockery.registerMock( 'minimist', () => {
			return {
				formats: 'amd',
				watch: false
			};
		} );

		tasks = require( '../../tasks/gulp/build/tasks' )( config );
	} );

	afterEach( () => {
		mockery.disable();
		sandbox.restore();
	} );

	describe( 'packages', () => {
		it( 'should return stream with correct packages as src', () => {
			const fs = require( 'fs' );
			const readDirStub = sandbox.stub( fs, 'readdirSync', () => [ 'ckeditor5-core', 'ckeditor5-toolbar' ] );
			const statStub = sandbox.stub( fs, 'lstatSync', () => {
				return {
					isDirectory() {
						return true;
					},
					isSymbolicLink() {
						return false;
					}
				};
			} );
			const gulpSrcSpy = sandbox.spy( gulp, 'src' );
			tasks.src.packages( false );

			sinon.assert.calledOnce( readDirStub );
			sinon.assert.calledTwice( gulpSrcSpy );
			sinon.assert.calledTwice( statStub );

			expect( gulpSrcSpy.firstCall.args[ 0 ] ).to.equal( path.join( 'node_modules', 'ckeditor5-core', 'src/**/*.js' ) );
			expect( gulpSrcSpy.secondCall.args[ 0 ] ).to.equal( path.join( 'node_modules', 'ckeditor5-toolbar', 'src/**/*.js' ) );
		} );

		it( 'should skip files and resolve symbolic links', () => {
			const fs = require( 'fs' );
			const readDirStub = sandbox.stub( fs, 'readdirSync', () => [ 'ckeditor5-file.js' ] );
			const statStub = sandbox.stub( fs, 'lstatSync', () => {
				return {
					isDirectory() {
						return false;
					},
					isSymbolicLink() {
						return true;
					}
				};
			} );
			const realPathStub = sandbox.stub( fs, 'realpathSync', () => '/real/path' );
			const gulpSrcSpy = sandbox.spy( gulp, 'src' );
			tasks.src.packages( false );

			sinon.assert.calledOnce( readDirStub );
			sinon.assert.calledOnce( realPathStub );
			sinon.assert.notCalled( gulpSrcSpy );
			sinon.assert.calledTwice( statStub );
		} );
	} );

	describe( 'build', () => {
		it( 'should return build stream', ( done ) => {
			const code = 'export default {};';
			sandbox.stub( gutil, 'log' );

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
