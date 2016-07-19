/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: editor, browser-only */

import moduleUtils from '/tests/ckeditor5/_utils/module.js';
import Editor from '/ckeditor5/editor/editor.js';
import Plugin from '/ckeditor5/plugin.js';
import Config from '/ckeditor5/utils/config.js';
import PluginCollection from '/ckeditor5/plugincollection.js';

const pluginClasses = {};

before( () => {
	pluginDefinition( 'A/A' );
	pluginDefinition( 'B/B' );
	pluginDefinition( 'C/C', [ 'B/B' ] );
	pluginDefinition( 'D/D', [ 'C/C' ] );
} );

describe( 'Editor', () => {
	describe( 'constructor', () => {
		it( 'should create a new editor instance', () => {
			const editor = new Editor();

			expect( editor.config ).to.be.an.instanceof( Config );
			expect( editor.commands ).to.be.an.instanceof( Map );

			expect( editor.plugins ).to.be.an.instanceof( PluginCollection );
			expect( getPlugins( editor ) ).to.be.empty;
		} );
	} );

	describe( 'plugins', () => {
		it( 'should be empty on new editor', () => {
			const editor = new Editor();

			expect( getPlugins( editor ) ).to.be.empty;
		} );
	} );

	describe( 'create', () => {
		it( 'should return a promise that resolves properly', () => {
			let promise = Editor.create();

			expect( promise ).to.be.an.instanceof( Promise );

			return promise;
		} );

		it( 'loads plugins', () => {
			return Editor.create( {
					features: [ 'A' ]
				} )
				.then( editor => {
					expect( getPlugins( editor ).length ).to.equal( 1 );

					expect( editor.plugins.get( 'A' ) ).to.be.an.instanceof( Plugin );
				} );
		} );
	} );

	describe( 'initPlugins', () => {
		it( 'should load features', () => {
			const editor = new Editor( {
				features: [ 'A', 'B' ]
			} );

			expect( getPlugins( editor ) ).to.be.empty;

			return editor.initPlugins().then( () => {
				expect( getPlugins( editor ).length ).to.equal( 2 );

				expect( editor.plugins.get( 'A' ) ).to.be.an.instanceof( Plugin );
				expect( editor.plugins.get( 'B' ) ).to.be.an.instanceof( Plugin );
			} );
		} );

		it( 'should load features passed as a string', () => {
			const editor = new Editor( {
				features: 'A,B'
			} );

			expect( getPlugins( editor ) ).to.be.empty;

			return editor.initPlugins().then( () => {
				expect( getPlugins( editor ).length ).to.equal( 2 );

				expect( editor.plugins.get( 'A' ) ).to.be.an.instanceof( Plugin );
				expect( editor.plugins.get( 'B' ) ).to.be.an.instanceof( Plugin );
			} );
		} );

		it( 'should initialize plugins in the right order', () => {
			const editor = new Editor( {
				features: [ 'A', 'D' ]
			} );

			return editor.initPlugins().then( () => {
				sinon.assert.callOrder(
					editor.plugins.get( pluginClasses[ 'A/A' ] ).init,
					editor.plugins.get( pluginClasses[ 'B/B' ] ).init,
					editor.plugins.get( pluginClasses[ 'C/C' ] ).init,
					editor.plugins.get( pluginClasses[ 'D/D' ] ).init
				);
			} );
		} );

		it( 'should initialize plugins in the right order, waiting for asynchronous ones', () => {
			class PluginAsync extends Plugin {}
			const asyncSpy = sinon.spy().named( 'async-call-spy' );

			// Synchronous plugin that depends on an asynchronous one.
			pluginDefinition( 'sync/sync', [ 'async/async' ] );

			moduleUtils.define( 'async/async', () => {
				PluginAsync.prototype.init = sinon.spy( () => {
					return new Promise( ( resolve ) => {
						setTimeout( () => {
							asyncSpy();
							resolve();
						}, 0 );
					} );
				} );

				return PluginAsync;
			} );

			const editor = new Editor( {
				features: [ 'A', 'sync' ]
			} );

			return editor.initPlugins().then( () => {
				sinon.assert.callOrder(
					editor.plugins.get( pluginClasses[ 'A/A' ] ).init,
					editor.plugins.get( PluginAsync ).init,
					// This one is called with delay by the async init.
					asyncSpy,
					editor.plugins.get( pluginClasses[ 'sync/sync' ] ).init
				);
			} );
		} );
	} );
} );

// @param {String} name Name of the plugin.
// @param {String[]} deps Dependencies of the plugin (only other plugins).
function pluginDefinition( name, deps ) {
	moduleUtils.define( name, deps || [], function() {
		class NewPlugin extends Plugin {}

		NewPlugin.prototype.init = sinon.spy().named( name );
		NewPlugin.requires = Array.from( arguments );

		pluginClasses[ name ] = NewPlugin;

		return NewPlugin;
	} );
}

// Returns an array of loaded plugins.
function getPlugins( editor ) {
	const plugins = [];

	for ( let entry of editor.plugins ) {
		// Keep only plugins kept under their classes.
		if ( typeof entry[ 0 ] == 'function' ) {
			plugins.push( entry[ 1 ] );
		}
	}

	return plugins;
}
