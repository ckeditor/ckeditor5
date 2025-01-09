/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ConversionHelpers from '../../src/conversion/conversionhelpers.js';

describe( 'ConversionHelpers', () => {
	describe( 'add()', () => {
		const dispA = Symbol( 'dispA' );
		const dispB = Symbol( 'dispB' );

		it( 'should call a helper for one defined dispatcher', () => {
			const spy = sinon.spy();
			const helpers = new ConversionHelpers( [ dispA ] );

			helpers.add( spy );

			sinon.assert.calledOnce( spy );
			sinon.assert.calledWithExactly( spy, dispA );
		} );

		it( 'should call helper for all defined dispatcherers', () => {
			const spy = sinon.spy();
			const helpers = new ConversionHelpers( [ dispA, dispB ] );

			helpers.add( spy );

			sinon.assert.calledTwice( spy );
			sinon.assert.calledWithExactly( spy, dispA );
			sinon.assert.calledWithExactly( spy, dispB );
		} );

		it( 'should be chainable', () => {
			const spy = sinon.spy();
			const helpers = new ConversionHelpers( [ dispA ] );

			expect( helpers.add( spy ) ).to.equal( helpers );
		} );
	} );
} );
