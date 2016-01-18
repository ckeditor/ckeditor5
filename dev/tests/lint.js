/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

const sinon = require( 'sinon' );
const gulp = require( 'gulp' );
const gutil = require( 'gulp-util' );
const stream = require( 'stream' );
const Vinyl = require( 'vinyl' );
const jshint = require( 'gulp-jshint' );
const jscs = require( 'gulp-jscs' );
const concat = require( 'concat-stream' );
const chai = require( 'chai' );
const expect = chai.expect;
const mockery = require( 'mockery' );
const through = require( 'through2' );

describe( 'lint', () => {
	'use strict';

	const config = {
		ROOT_DIR: '.',
		DIST_DIR: 'dist',
		IGNORED_FILES: [ 'lib/**' ]
	};

	let sandbox;

	beforeEach( () => {
		mockery.enable( {
			warnOnReplace: false,
			warnOnUnregistered: false
		} );

		mockery.registerMock( 'git-guppy', () => {
			return {
				stream() {
					const files = [
						new Vinyl( {
							cwd: './',
							path: './ckeditor.js',
							contents: new Buffer( 'function test () {};var a;' )
						} )
					];
					const fakeInputStream = new stream.Readable( { objectMode: true } );
					fakeInputStream._read = () => {
						fakeInputStream.push( files.pop() || null );
					};

					return fakeInputStream;
				}
			};
		} );

		sandbox = sinon.sandbox.create();
	} );

	afterEach( () => {
		mockery.disable();
		sandbox.restore();
	} );

	describe( 'lint()', () => {
		it( 'should use jshint and jscs on source files', ( done ) => {
			const files = [
				new Vinyl( {
					cwd: './',
					path: './ckeditor.js',
					contents: new Buffer( 'function test () {};var a;' )
				} )
			];

			const tasks = require( '../tasks/lint/tasks' )( config );
			const PassThrough = stream.PassThrough;

			sandbox.stub( gulp, 'src', () => {
				const fakeInputStream = new stream.Readable( { objectMode: true } );
				fakeInputStream._read = () => {
					fakeInputStream.push( files.pop() || null );
				};

				return fakeInputStream;
			} );

			sandbox.stub( jscs, 'reporter', () => new PassThrough( { objectMode: true } ) );
			sandbox.stub( jshint, 'reporter', () => new PassThrough( { objectMode: true } ) );

			tasks.lint().pipe( concat( ( data ) => {
				expect( data.length ).to.equal( 1 );
				const file = data[ 0 ];
				expect( typeof file.jscs ).to.equal( 'object' );
				expect( typeof file.jshint ).to.equal( 'object' );
				expect( file.jscs.success ).to.equal( false );
				expect( file.jshint.success ).to.equal( false );
				done();
			} ) );
		} );
	} );

	describe( 'pre-commit', () => {
		it( 'should throw error when linting fails', ( done ) => {
			const tasks = require( '../tasks/lint/tasks' )( config );
			const PassThrough = stream.PassThrough;

			const exitStub = sandbox.stub( process, 'exit' );
			sandbox.stub( gutil, 'log' );
			sandbox.stub( jscs, 'reporter', ( type ) => {
				if ( type == 'fail' ) {
					// Fail reporter should report error to stop linting process.
					return through( { objectMode: true }, ( file, encoding, cb ) => {
						cb( new Error() );
						expect( typeof file.jscs ).to.equal( 'object' );
						expect( typeof file.jshint ).to.equal( 'object' );
						expect( file.jscs.success ).to.equal( false );
						expect( file.jshint.success ).to.equal( false );
						sinon.assert.calledOnce( exitStub );
						done();
					} );
				} else {
					return new PassThrough( { objectMode: true } );
				}
			} );
			sandbox.stub( jshint, 'reporter', () => new PassThrough( { objectMode: true } ) );
			tasks.preCommit();
		} );
	} );
} );
