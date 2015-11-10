/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-include: ../_tools/tools.js */

'use strict';

const modules = bender.amd.require( 'editor', 'editorconfig', 'plugin' );

let editor;
let element;
let asyncSpy;

beforeEach( () => {
	const Editor = modules.editor;

	element = document.createElement( 'div' );
	document.body.appendChild( element );

	editor = new Editor( element );
} );

before( () => {
	// Define fake plugins to be used in tests.
	bender.tools.core.defineEditorCreatorMock( 'test', {
		init: sinon.spy().named( 'creator-test' )
	} );

	CKEDITOR.define( 'plugin!A', [ 'plugin' ], pluginDefinition( 'A' ) );

	CKEDITOR.define( 'plugin!B', [ 'plugin' ], pluginDefinition( 'B' ) );

	CKEDITOR.define( 'plugin!C', [ 'plugin', 'plugin!B' ], pluginDefinition( 'C' ) );

	CKEDITOR.define( 'plugin!D', [ 'plugin', 'plugin!C' ], pluginDefinition( 'D' ) );

	CKEDITOR.define( 'plugin!E', [ 'plugin' ], pluginDefinition( 'E' ) );

	// Synchronous plugin that depends on an asynchronous one.
	CKEDITOR.define( 'plugin!F', [ 'plugin', 'plugin!async' ], pluginDefinition( 'F' ) );

	asyncSpy = sinon.spy().named( 'async-call-spy' );

	CKEDITOR.define( 'plugin!async', [ 'plugin' ], ( Plugin ) => {
		class PluginAsync extends Plugin {}

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
} );

function pluginDefinition( name ) {
	return ( Plugin ) => {
		class NewPlugin extends Plugin {}
		NewPlugin.prototype.init = sinon.spy().named( name );

		return NewPlugin;
	};
}

///////////////////

describe( 'constructor', () => {
	it( 'should create a new editor instance', () => {
		expect( editor ).to.have.property( 'element' ).to.equal( element );
	} );
} );

describe( 'config', () => {
	it( 'should be an instance of EditorConfig', () => {
		const EditorConfig = modules.editorconfig;

		expect( editor.config ).to.be.an.instanceof( EditorConfig );
	} );
} );

describe( 'init', () => {
	it( 'should return a promise that resolves properly', () => {
		const Editor = modules.editor;

		editor = new Editor( element, {
			plugins: 'creator-test'
		} );

		let promise = editor.init();

		expect( promise ).to.be.an.instanceof( Promise );

		return promise;
	} );

	it( 'should fill `plugins`', () => {
		const Editor = modules.editor;
		const Plugin = modules.plugin;

		editor = new Editor( element, {
			plugins: 'A,B,creator-test'
		} );

		expect( editor.plugins.length ).to.equal( 0 );

		return editor.init().then( () => {
			expect( editor.plugins.length ).to.equal( 3 );

			expect( editor.plugins.get( 'A' ) ).to.be.an.instanceof( Plugin );
			expect( editor.plugins.get( 'B' ) ).to.be.an.instanceof( Plugin );
			expect( editor.plugins.get( 'creator-test' ) ).to.be.an.instanceof( Plugin );
		} );
	} );

	it( 'should initialize plugins in the right order', () => {
		const Editor = modules.editor;

		editor = new Editor( element, {
			plugins: 'creator-test,A,D'
		} );

		return editor.init().then( () => {
			sinon.assert.callOrder(
				editor.plugins.get( 'creator-test' ).init,
				editor.plugins.get( 'A' ).init,
				editor.plugins.get( 'B' ).init,
				editor.plugins.get( 'C' ).init,
				editor.plugins.get( 'D' ).init
			);
		} );
	} );

	it( 'should initialize plugins in the right order, waiting for asynchronous ones', () => {
		const Editor = modules.editor;

		editor = new Editor( element, {
			plugins: 'creator-test,A,F'
		} );

		return editor.init().then( () => {
			sinon.assert.callOrder(
				editor.plugins.get( 'creator-test' ).init,
				editor.plugins.get( 'A' ).init,
				editor.plugins.get( 'async' ).init,
				// This one is called with delay by the async init
				asyncSpy,
				editor.plugins.get( 'F' ).init
			);
		} );
	} );

	it( 'should not fail if loading a plugin that doesn\'t define init()', () => {
		const Editor = modules.editor;

		editor = new Editor( element, {
			plugins: 'E,creator-test'
		} );

		return editor.init();
	} );
} );

describe( 'plugins', () => {
	it( 'should be empty on new editor', () => {
		expect( editor.plugins.length ).to.equal( 0 );
	} );
} );

describe( 'destroy', () => {
	it( 'should fire "destroy"', () => {
		let spy = sinon.spy();

		editor.on( 'destroy', spy );

		return editor.destroy().then( () => {
			sinon.assert.called( spy );
		} );
	} );

	it( 'should delete the "element" property', () => {
		return editor.destroy().then( () => {
			expect( editor ).to.not.have.property( 'element' );
		} );
	} );
} );
