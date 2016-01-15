/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, beforeEach, afterEach */

const sinon = require( 'sinon' );
const gulp = require( 'gulp' );
const stream = require( 'stream' );
const Vinyl = require( 'vinyl' );
const jshint = require( 'gulp-jshint' );
const jscs = require( 'gulp-jscs' );
const guppy = require( 'git-guppy' )( gulp );
const concat = require( 'concat-stream' );
const chai = require( 'chai' );
const expect = chai.expect;

describe( 'lint', () => {
	'use strict';

	const config = {
		ROOT_DIR: '.',
		DIST_DIR: 'dist',
		IGNORED_FILES: [ 'lib/**' ]
	};
	const tasks = require( '../tasks/lint/tasks' )( config );
	let sandbox;

	beforeEach( () => {
		sandbox = sinon.sandbox.create();
	} );

	afterEach( () => {
		sandbox.restore();
	} );

	describe( 'lint()', () => {
		it( 'should use jshint and jscs on source files', ( done ) => {
			const PassThrough = stream.PassThrough;
			const files = [
				new Vinyl( {
					cwd: './',
					path: './ckeditor.js',
					contents: new Buffer( 'function test () {};var a;' )
				} )
			];

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
			//////const PassThrough = stream.PassThrough;
			const files = [
				new Vinyl( {
					cwd: './',
					path: './ckeditor.js',
					contents: new Buffer( 'function test () {};var a;' )
				} )
			];

			sandbox.stub( guppy, 'stream', () => {
				console.log( 'guppy stream' );
				const fakeInputStream = new stream.Readable( { objectMode: true } );
				fakeInputStream._read = () => {
					fakeInputStream.push( files.pop() || null );
				};

				return fakeInputStream;
			} );

			tasks.preCommit().pipe( concat( ( d ) => {
				console.log( d.length );
				done();
			} ) );
		} );
	} );
} );
