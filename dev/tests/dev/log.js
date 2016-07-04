/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it */

'use strict';

const sinon = require( 'sinon' );
const log = require( '../../lib/log' );

describe( 'log', () => {
	it( 'should log using configured functions', () => {
		const outFn = sinon.spy();
		const errFn = sinon.spy();

		log.configure( outFn, errFn );

		log.out( 'output' );
		log.err( 'error' );

		sinon.assert.calledWithExactly( outFn, 'output' );
		sinon.assert.calledWithExactly( errFn, 'error' );
	} );
} );
