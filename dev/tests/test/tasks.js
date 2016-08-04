/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, sinon */

'use strict';

const Vinyl = require( 'vinyl' );
const tasks = require( '../../tasks/test/tasks' )();
const { stream, tools } = require( 'ckeditor5-dev-utils' );

describe( 'test-node', () => {
	describe( 'skipManual', () => {
		it( 'should skip manual tests', ( done ) => {
			const streamTask = tasks.skipManual();
			const spy = sinon.spy();
			const stub = sinon.stub( tools, 'isFile', ( file ) => {
				return file == 'file1.md';
			} );
			const unitTestFile = new Vinyl( {
				cwd: './',
				path: 'file2.js',
				contents: null
			} );
			const manualTestFile = new Vinyl( {
				cwd: './',
				path: 'file1.js',
				contents: null
			} );

			streamTask.pipe( stream.noop( spy ) );

			streamTask.once( 'finish', () => {
				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, unitTestFile );
				done();
			} );

			streamTask.write( manualTestFile );
			streamTask.write( unitTestFile );

			streamTask.end();
			stub.restore();
		} );
	} );

	describe( 'skipIgnored', () => {
		it( 'should skip files marked to ignore', ( done ) => {
			const streamTask = tasks.skipIgnored();
			const spy = sinon.spy();
			const unitTestFile = new Vinyl( {
				cwd: './',
				path: 'file2.js',
				contents: new Buffer( '' )
			} );
			const manualTestFile = new Vinyl( {
				cwd: './',
				path: 'file1.js',
				contents: new Buffer( '/* bender-tags: tag, browser-only */' )
			} );
			const noop = stream.noop( spy );
			noop.once( 'finish', () => {
				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, unitTestFile );
				done();
			} );

			streamTask.pipe( noop );
			streamTask.write( manualTestFile );
			streamTask.write( unitTestFile );

			streamTask.end();
		} );
	} );
} );
