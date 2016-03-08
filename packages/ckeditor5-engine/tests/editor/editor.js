/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

/* bender-tags: editor */

import moduleUtils from '/tests/_utils/module.js';
import coreTestUtils from '/tests/core/_utils/utils.js';
import Editor from '/ckeditor5/core/editor.js';
import EditorConfig from '/ckeditor5/core/editorconfig.js';
import Plugin from '/ckeditor5/core/plugin.js';
import Locale from '/ckeditor5/core/locale.js';
import Command from '/ckeditor5/core/command/command.js';
import CKEditorError from '/ckeditor5/core/ckeditorerror.js';

const pluginClasses = {};
let element;

before( () => {
	// Define fake plugins to be used in tests.
	coreTestUtils.defineEditorCreatorMock( 'test', {
		init: sinon.spy().named( 'creator-test' )
	} );

	pluginDefinition( 'A' );
	pluginDefinition( 'B' );
	pluginDefinition( 'C', [ 'B' ] );
	pluginDefinition( 'D', [ 'C' ] );
} );

beforeEach( () => {
	element = document.createElement( 'div' );
	document.body.appendChild( element );
} );

///////////////////

describe( 'constructor', () => {
	it( 'should create a new editor instance', () => {
		const editor = new Editor( element );

		expect( editor ).to.have.property( 'element' ).to.equal( element );
	} );
} );

describe( 'config', () => {
	it( 'should be an instance of EditorConfig', () => {
		const editor = new Editor( element );

		expect( editor.config ).to.be.an.instanceof( EditorConfig );
	} );
} );

describe( 'locale', () => {
	it( 'is instantiated and t() is exposed', () => {
		const editor = new Editor( element );

		expect( editor.locale ).to.be.instanceof( Locale );
		expect( editor.t ).to.equal( editor.locale.t );
	} );

	it( 'is configured with the config.lang', () => {
		const editor = new Editor( element, { lang: 'pl' } );

		expect( editor.locale.lang ).to.equal( 'pl' );
	} );
} );

describe( 'init', () => {
	it( 'should return a promise that resolves properly', () => {
		const editor = new Editor( element, {
			creator: 'creator-test'
		} );

		let promise = editor.init();

		expect( promise ).to.be.an.instanceof( Promise );

		return promise;
	} );

	it( 'should load features and creator', () => {
		const editor = new Editor( element, {
			features: [ 'A', 'B' ],
			creator: 'creator-test'
		} );

		expect( getPlugins( editor ) ).to.be.empty;

		return editor.init().then( () => {
			expect( getPlugins( editor ).length ).to.equal( 3 );

			expect( editor.plugins.get( 'A' ) ).to.be.an.instanceof( Plugin );
			expect( editor.plugins.get( 'B' ) ).to.be.an.instanceof( Plugin );
			expect( editor.plugins.get( 'creator-test' ) ).to.be.an.instanceof( Plugin );
		} );
	} );

	it( 'should load features passed as a string', () => {
		const editor = new Editor( element, {
			features: 'A,B',
			creator: 'creator-test'
		} );

		expect( getPlugins( editor ) ).to.be.empty;

		return editor.init().then( () => {
			expect( getPlugins( editor ).length ).to.equal( 3 );

			expect( editor.plugins.get( 'A' ) ).to.be.an.instanceof( Plugin );
			expect( editor.plugins.get( 'B' ) ).to.be.an.instanceof( Plugin );
		} );
	} );

	it( 'should initialize plugins in the right order', () => {
		const editor = new Editor( element, {
			features: [ 'A', 'D' ],
			creator: 'creator-test'
		} );

		return editor.init().then( () => {
			sinon.assert.callOrder(
				editor.plugins.get( 'creator-test' ).init,
				editor.plugins.get( pluginClasses.A ).init,
				editor.plugins.get( pluginClasses.B ).init,
				editor.plugins.get( pluginClasses.C ).init,
				editor.plugins.get( pluginClasses.D ).init
			);
		} );
	} );

	it( 'should initialize plugins in the right order, waiting for asynchronous ones', () => {
		class PluginAsync extends Plugin {}
		const asyncSpy = sinon.spy().named( 'async-call-spy' );

		// Synchronous plugin that depends on an asynchronous one.
		pluginDefinition( 'sync', [ 'async' ] );

		moduleUtils.define( 'async', () => {
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

		const editor = new Editor( element, {
			features: [ 'A', 'sync' ],
			creator: 'creator-test'
		} );

		return editor.init().then( () => {
			sinon.assert.callOrder(
				editor.plugins.get( 'creator-test' ).init,
				editor.plugins.get( pluginClasses.A ).init,
				editor.plugins.get( PluginAsync ).init,
				// This one is called with delay by the async init.
				asyncSpy,
				editor.plugins.get( pluginClasses.sync ).init
			);
		} );
	} );
} );

describe( 'plugins', () => {
	it( 'should be empty on new editor', () => {
		const editor = new Editor( element );

		expect( getPlugins( editor ) ).to.be.empty;
	} );
} );

describe( 'destroy', () => {
	it( 'should fire "destroy"', () => {
		const editor = new Editor( element );
		let spy = sinon.spy();

		editor.on( 'destroy', spy );

		return editor.destroy().then( () => {
			sinon.assert.called( spy );
		} );
	} );

	it( 'should delete the "element" property', () => {
		const editor = new Editor( element );

		return editor.destroy().then( () => {
			expect( editor ).to.not.have.property( 'element' );
		} );
	} );
} );

describe( 'execute', () => {
	it( 'should execute specified command', () => {
		const editor = new Editor( element );

		let command = new Command( editor );
		sinon.spy( command, 'execute' );

		editor.commands.set( 'command_name', command );
		editor.execute( 'command_name' );

		expect( command.execute.calledOnce ).to.be.true;
	} );

	it( 'should throw an error if specified command has not been added', () => {
		const editor = new Editor( element );

		expect( () => {
			editor.execute( 'command' );
		} ).to.throw( CKEditorError, /editor-command-not-found/ );
	} );
} );

describe( 'setData', () => {
	it( 'should set data on the editable', () => {
		const editor = new Editor( element );
		editor.editable = {
			setData: sinon.spy()
		};

		editor.setData( 'foo' );

		expect( editor.editable.setData.calledOnce ).to.be.true;
		expect( editor.editable.setData.args[ 0 ][ 0 ] ).to.equal( 'foo' );
	} );

	it( 'should get data from the editable', () => {
		const editor = new Editor( element );
		editor.editable = {
			getData() {
				return 'bar';
			}
		};

		expect( editor.getData() ).to.equal( 'bar' );
	} );
} );

/**
 * @param {String} name Name of the plugin.
 * @param {String[]} deps Dependencies of the plugin (only other plugins).
 */
function pluginDefinition( name, deps ) {
	moduleUtils.define( name, deps || [], function() {
		class NewPlugin extends Plugin {}

		NewPlugin.prototype.init = sinon.spy().named( name );
		NewPlugin.requires = Array.from( arguments );

		pluginClasses[ name ] = NewPlugin;

		return NewPlugin;
	} );
}

/**
 * Returns an array of loaded plugins.
 */
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
