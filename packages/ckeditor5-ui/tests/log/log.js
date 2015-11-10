/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console */

'use strict';

const modules = bender.amd.require( 'log' );
let spy;

beforeEach( function() {
	if ( spy ) {
		spy.restore();
	}
} );

describe( 'warn()', function() {
	it( 'logs the message to the console using console.warn()', function() {
		let log = modules.log;
		let spy = sinon.stub( console, 'warn' );
		let data = { bar: 1 };

		log.warn( 'foo', data );

		sinon.assert.calledOnce( spy );
		sinon.assert.calledWith( spy, 'foo', data );

		log.warn( 'bar' );
		sinon.assert.calledTwice( spy );
		sinon.assert.calledWith( spy, 'bar' );
	} );
} );

describe( 'error()', function() {
	it( 'logs the message to the console using console.error()', function() {
		let log = modules.log;
		let spy = sinon.stub( console, 'error' );
		let data = { bar: 1 };

		log.error( 'foo', data );

		sinon.assert.calledOnce( spy );
		sinon.assert.calledWith( spy, 'foo', data );

		log.error( 'bar' );
		sinon.assert.calledTwice( spy );
		sinon.assert.calledWith( spy, 'bar' );
	} );
} );
