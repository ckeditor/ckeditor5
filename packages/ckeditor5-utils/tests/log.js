/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals console */

import log from '../src/log';

describe( 'log', () => {
	let spy;

	beforeEach( () => {
		if ( spy ) {
			spy.restore();
		}
	} );

	describe( 'warn()', () => {
		it( 'logs the message to the console using console.warn()', () => {
			const spy = sinon.stub( console, 'warn' );
			const data = { bar: 1 };

			log.warn( 'foo', data );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWith( spy, 'foo', data );

			log.warn( 'bar' );
			sinon.assert.calledTwice( spy );
			sinon.assert.calledWith( spy, 'bar' );
		} );
	} );

	describe( 'error()', () => {
		it( 'logs the message to the console using console.error()', () => {
			const spy = sinon.stub( console, 'error' );
			const data = { bar: 1 };

			log.error( 'foo', data );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWith( spy, 'foo', data );

			log.error( 'bar' );
			sinon.assert.calledTwice( spy );
			sinon.assert.calledWith( spy, 'bar' );
		} );
	} );
} );
