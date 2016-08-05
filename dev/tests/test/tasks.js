/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it, sinon */

'use strict';

const Vinyl = require( 'vinyl' );
const tasks = require( '../../tasks/test/tasks' )();
const { stream: streamUtils, tools } = require( 'ckeditor5-dev-utils' );

describe( 'test-node', () => {
	describe( 'skipManual', () => {
		it( 'should skip manual tests', ( done ) => {
			const stream = tasks.skipManual();
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

			stream.pipe( streamUtils.noop( spy ) );

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
			const noop = streamUtils.noop( spy );
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
