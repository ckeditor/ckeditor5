/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ContextPlugin from '../src/contextplugin';

describe( 'ContextPlugin', () => {
	const contextMock = {};

	it( 'should be marked as a context plugin', () => {
		expect( ContextPlugin.isContextPlugin ).to.true;
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
