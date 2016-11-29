/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals setTimeout */
/* bender-tags: editor, browser-only */

import Editor from 'ckeditor5/core/editor/editor.js';
import Plugin from 'ckeditor5/core/plugin.js';
import Config from 'ckeditor5/utils/config.js';
import PluginCollection from 'ckeditor5/core/plugincollection.js';

class PluginA extends Plugin {
	constructor( editor ) {
		super( editor );
		this.init = sinon.spy().named( 'A' );
	}
}
class PluginB extends Plugin {
	constructor( editor ) {
		super( editor );
		this.init = sinon.spy().named( 'B' );
	}
}
class PluginC extends Plugin {
	constructor( editor ) {
		super( editor );
		this.init = sinon.spy().named( 'C' );
	}

	static get requires() {
		return [ PluginB ];
	}
}
class PluginD extends Plugin {
	constructor( editor ) {
		super( editor );
		this.init = sinon.spy().named( 'D' );
	}

	static get requires() {
		return [ PluginC ];
	}
}

describe( 'Editor', () => {
	describe( 'constructor()', () => {
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
					plugins: [ PluginA ]
				} )
				.then( editor => {
					expect( getPlugins( editor ).length ).to.equal( 1 );

					expect( editor.plugins.get( PluginA ) ).to.be.an.instanceof( Plugin );
				} );
		} );

		it( 'fires all events in the right order', () => {
			const fired = [];

			function spy( evt ) {
				fired.push( evt.name );
			}

			class EventWatcher extends Plugin {
				init() {
					this.editor.on( 'pluginsReady', spy );
					this.editor.on( 'dataReady', spy );
					this.editor.on( 'ready', spy );
				}
			}

			return Editor.create( {
					plugins: [ EventWatcher ]
				} )
				.then( () => {
					expect( fired ).to.deep.equal( [ 'pluginsReady', 'dataReady', 'ready' ] );
				} );
		} );
	} );

	describe( 'initPlugins', () => {
		it( 'should load plugins', () => {
			const editor = new Editor( {
				plugins: [ PluginA, PluginB ]
			} );

			expect( getPlugins( editor ) ).to.be.empty;

			return editor.initPlugins().then( () => {
				expect( getPlugins( editor ).length ).to.equal( 2 );

				expect( editor.plugins.get( PluginA ) ).to.be.an.instanceof( Plugin );
				expect( editor.plugins.get( PluginB ) ).to.be.an.instanceof( Plugin );
			} );
		} );

		it( 'should initialize plugins in the right order', () => {
			const editor = new Editor( {
				plugins: [ PluginA, PluginD ]
			} );

			return editor.initPlugins().then( () => {
				sinon.assert.callOrder(
					editor.plugins.get( PluginA ).init,
					editor.plugins.get( PluginB ).init,
					editor.plugins.get( PluginC ).init,
					editor.plugins.get( PluginD ).init
				);
			} );
		} );

		it( 'should initialize plugins in the right order, waiting for asynchronous ones', () => {
			const asyncSpy = sinon.spy().named( 'async-call-spy' );

			// Synchronous plugin that depends on an asynchronous one.
			class PluginSync extends Plugin {
				constructor( editor ) {
					super( editor );
					this.init = sinon.spy().named( 'sync' );
				}

				static get requires() {
					return [ PluginAsync ];
				}
			}

			class PluginAsync extends Plugin {
				constructor( editor ) {
					super( editor );

					this.init = sinon.spy( () => {
						return new Promise( ( resolve ) => {
							setTimeout( () => {
								asyncSpy();
								resolve();
							}, 0 );
						} );
					} );
				}
			}

			const editor = new Editor( {
				plugins: [ PluginA, PluginSync ]
			} );

			return editor.initPlugins().then( () => {
				sinon.assert.callOrder(
					editor.plugins.get( PluginA ).init,
					editor.plugins.get( PluginAsync ).init,
					// This one is called with delay by the async init.
					asyncSpy,
					editor.plugins.get( PluginSync ).init
				);
			} );
		} );
	} );
} );

function getPlugins( editor ) {
	return Array.from( editor.plugins )
		.map( entry => entry[ 1 ] ); // Get instances.
}
