/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console */

'use strict';

const modules = bender.amd.require( 'log' );
var spy;

beforeEach( function() {
	if ( spy ) {
		spy.restore();
	}
} );

describe( 'warn()', function() {
	it( 'logs the message to the console using console.warn()', function() {
		var log = modules.log;
		var spy = sinon.stub( console, 'warn' );
		var data = { bar: 1 };

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
		var log = modules.log;
		var spy = sinon.stub( console, 'error' );
		var data = { bar: 1 };

		log.error( 'foo', data );

		sinon.assert.calledOnce( spy );
		sinon.assert.calledWith( spy, 'foo', data );

		log.error( 'bar' );
		sinon.assert.calledTwice( spy );
		sinon.assert.calledWith( spy, 'bar' );
	} );
} );
