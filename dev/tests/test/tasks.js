/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, sinon */

'use strict';

const tasks = require( '../../tasks/test/tasks' )();
const buildUtils = require( '../../tasks/build/utils' );
const devTools = require( '../../tasks/dev/utils/tools' );
const Vinyl = require( 'vinyl' );

describe( 'test-editor', () => {
	describe( 'skipManual', () => {
		it( 'should skip manual tests', ( done ) => {
			const stream = tasks.skipManual();
			const spy = sinon.spy();
			const stub = sinon.stub( devTools, 'isFile', ( file ) => {
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

			stream.pipe( buildUtils.noop( spy ) );

			stream.once( 'finish', () => {
				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, unitTestFile );
				done();
			} );

			stream.write( manualTestFile );
			stream.write( unitTestFile );

			stream.end();
			stub.restore();
		} );
	} );

	describe( 'skipIgnored', () => {
		it( 'should skip files marked to ignore', ( done ) => {
			const stream = tasks.skipIgnored();
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
			const noop = buildUtils.noop( spy );
			noop.once( 'finish', () => {
				sinon.assert.calledOnce( spy );
				sinon.assert.calledWithExactly( spy, unitTestFile );
				done();
			} );

			stream.pipe( noop );
			stream.write( manualTestFile );
			stream.write( unitTestFile );

			stream.end();
		} );
	} );
} );
