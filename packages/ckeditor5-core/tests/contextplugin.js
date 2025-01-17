/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import ContextPlugin from '../src/contextplugin.js';

describe( 'ContextPlugin', () => {
	const contextMock = {};

	it( 'should be marked as a context plugin', () => {
		expect( ContextPlugin.isContextPlugin ).to.true;
	} );

	it( 'should have `isOfficialPlugin` static flag set to `false`', () => {
		expect( ContextPlugin.isOfficialPlugin ).to.be.false;
	} );

	it( 'should have `isPremiumPlugin` static flag set to `false`', () => {
		expect( ContextPlugin.isPremiumPlugin ).to.be.false;
	} );

	describe( 'constructor()', () => {
		it( 'should set the `context` property', () => {
			const plugin = new ContextPlugin( contextMock );

			expect( plugin ).to.have.property( 'context' ).to.equal( contextMock );
		} );
	} );

	describe( 'destroy()', () => {
		it( 'should be defined', () => {
			const plugin = new ContextPlugin( contextMock );

			expect( plugin.destroy ).to.be.a( 'function' );
		} );

		it( 'should stop listening', () => {
			const plugin = new ContextPlugin( contextMock );
			const stopListeningSpy = sinon.spy( plugin, 'stopListening' );

			plugin.destroy();

			sinon.assert.calledOnce( stopListeningSpy );
		} );
	} );
} );
