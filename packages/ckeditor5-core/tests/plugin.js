/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Plugin from '../src/plugin';
import Editor from '../src/editor/editor';

describe( 'Plugin', () => {
	let editor;

	beforeEach( () => {
		editor = new Editor();
	} );

	it( 'should not be marked as a context plugin', () => {
		expect( Plugin.isContextPlugin ).to.false;
	} );

	describe( 'constructor()', () => {
		it( 'should set the `editor` property', () => {
			const plugin = new Plugin( editor );

			expect( plugin ).to.have.property( 'editor' ).to.equal( editor );
		} );
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
