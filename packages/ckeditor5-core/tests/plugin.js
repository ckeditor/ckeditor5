/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
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

	describe( 'forceDisabled() / clearForceDisabled()', () => {
		let plugin;

		beforeEach( () => {
			plugin = new Plugin( editor );
		} );

		afterEach( () => {
			plugin.destroy();
		} );

		it( 'forceDisabled() should disable the plugin', () => {
			plugin.forceDisabled( 'foo' );
			plugin.isEnabled = true;

			expect( plugin.isEnabled ).to.be.false;
		} );

		it( 'clearForceDisabled() should enable the plugin', () => {
			plugin.forceDisabled( 'foo' );
			plugin.clearForceDisabled( 'foo' );

			expect( plugin.isEnabled ).to.be.true;
		} );

		it( 'clearForceDisabled() used with wrong identifier should not enable the plugin', () => {
			plugin.forceDisabled( 'foo' );
			plugin.clearForceDisabled( 'bar' );
			plugin.isEnabled = true;

			expect( plugin.isEnabled ).to.be.false;
		} );

		it( 'using forceDisabled() twice with the same identifier should not have any effect', () => {
			plugin.forceDisabled( 'foo' );
			plugin.forceDisabled( 'foo' );
			plugin.clearForceDisabled( 'foo' );

			expect( plugin.isEnabled ).to.be.true;
		} );

		it( 'plugin is enabled only after all disables were cleared', () => {
			plugin.forceDisabled( 'foo' );
			plugin.forceDisabled( 'bar' );
			plugin.clearForceDisabled( 'foo' );
			plugin.isEnabled = true;

			expect( plugin.isEnabled ).to.be.false;

			plugin.clearForceDisabled( 'bar' );

			expect( plugin.isEnabled ).to.be.true;
		} );

		it( 'plugin should remain disabled if isEnabled has a callback disabling it', () => {
			plugin.on( 'set:isEnabled', evt => {
				evt.return = false;
				evt.stop();
			} );

			plugin.forceDisabled( 'foo' );
			plugin.clearForceDisabled( 'foo' );
			plugin.isEnabled = true;

			expect( plugin.isEnabled ).to.be.false;
		} );
	} );
} );
