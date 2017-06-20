/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import Plugin from '../src/plugin';
import Editor from '../src/editor/editor';

let editor;

before( () => {
	editor = new Editor();
} );

describe( 'constructor()', () => {
	it( 'should set the `editor` property', () => {
		const plugin = new Plugin( editor );

		expect( plugin ).to.have.property( 'editor' ).to.equal( editor );
	} );

	describe( 'destroy()', () => {
		it( 'should be defined', () => {
			const plugin = new Plugin( editor );

			expect( plugin.destroy ).to.be.a( 'function' );
		} );

		it( 'should stop listening', () => {
			const plugin = new Plugin( editor );
			const stopListeningSpy = sinon.spy( plugin, 'stopListening' );

			plugin.destroy();

			expect( stopListeningSpy.calledOnce ).to.equal( true );
		} );
	} );
} );
