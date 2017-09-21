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
			spy = sinon.stub( console, 'warn' );
			const data = { bar: 1 };

			log.warn( 'foo', data );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWith( spy, 'foo', data );

			log.warn( 'bar' );
			sinon.assert.calledTwice( spy );
			sinon.assert.calledWith( spy, 'bar' );
		} );

		it( 'contains a link which leads to the documentation', () => {
			spy = sinon.stub( console, 'warn' );

			log.warn( 'model-schema-no-item: Specified item cannot be found.' );

			/* eslint-disable max-len */
			const logMessage = 'model-schema-no-item: Specified item cannot be found. ' +
				'Read more: https://ckeditor5.github.io/docs/nightly/ckeditor5/latest/framework/guides/error-codes.html#model-schema-no-item.\n';
			/* eslint-enable max-len */

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWith( spy, logMessage );
		} );
	} );

	describe( 'error()', () => {
		it( 'logs the message to the console using console.error()', () => {
			spy = sinon.stub( console, 'error' );
			const data = { bar: 1 };

			log.error( 'foo', data );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWith( spy, 'foo', data );

			log.error( 'bar' );
			sinon.assert.calledTwice( spy );
			sinon.assert.calledWith( spy, 'bar' );
		} );

		it( 'contains a link which leads to the documentation', () => {
			spy = sinon.stub( console, 'error' );

			log.error( 'model-schema-no-item: Specified item cannot be found.' );

			/* eslint-disable max-len */
			const logMessage = 'model-schema-no-item: Specified item cannot be found. ' +
				'Read more: https://ckeditor5.github.io/docs/nightly/ckeditor5/latest/framework/guides/error-codes.html#model-schema-no-item.\n';
			/* eslint-enable max-len */

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWith( spy, logMessage );
		} );
	} );
} );
