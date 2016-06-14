/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global describe, it */

'use strict';

const sanitize = require( '../../tasks/dev/utils/sanitize' );
const chai = require( 'chai' );
const expect = chai.expect;

describe( 'utils', () => {
	describe( 'sanitize', () => {
		describe( 'appendPeriodIfMissing', () => {
			it( 'should be defined', () => expect( sanitize.appendPeriodIfMissing ).to.be.a( 'function' ) );

			it( 'should trim whitespace/new lines to empty string', () => {
				// jscs: disable validateQuoteMarks
				const sanitized = sanitize.appendPeriodIfMissing( "\n\t\r " );

				expect( sanitized ).to.equal( '' );
			} );

			it( 'should add period at the end if missing ', () => {
				const sanitized = sanitize.appendPeriodIfMissing( 'sometext' );

				expect( sanitized ).to.equal( 'sometext.' );
			} );

			it( 'should not add period at the end if present', () => {
				const sanitized = sanitize.appendPeriodIfMissing( 'sometext.' );

				expect( sanitized ).to.equal( 'sometext.' );
			} );

			it( 'should leave empty string as is', () => {
				const sanitized = sanitize.appendPeriodIfMissing( '' );

				expect( sanitized ).to.equal( '' );
			} );
		} );
	} );
} );
