/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals document */
/* bender-include: ../_tools/tools.js */

'use strict';

var modules = bender.amd.require( 'editor', 'editorconfig', 'plugin' );

var editor;
var element;
var asyncSpy;

beforeEach( function() {
	var Editor = modules.editor;

	element = document.createElement( 'div' );
	document.body.appendChild( element );

	editor = new Editor( element );
} );

before( function() {
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

	CKEDITOR.define( 'plugin!async', [ 'plugin' ], function( Plugin ) {
		class PluginAsync extends Plugin {}

		PluginAsync.prototype.init = sinon.spy( function() {
			return new Promise( function( resolve ) {
				setTimeout( function() {
					asyncSpy();
					resolve();
				}, 0 );
			} );
		} );

		return PluginAsync;
	} );
} );

function pluginDefinition( name ) {
	return function( Plugin ) {
		class NewPlugin extends Plugin {}
		NewPlugin.prototype.init = sinon.spy().named( name );

		return NewPlugin;
	};
}

///////////////////

describe( 'constructor', function() {
	it( 'should create a new editor instance', function() {
		expect( editor ).to.have.property( 'element' ).to.equal( element );
	} );
} );

describe( 'config', function() {
	it( 'should be an instance of EditorConfig', function() {
		var EditorConfig = modules.editorconfig;

		expect( editor.config ).to.be.an.instanceof( EditorConfig );
	} );
} );

describe( 'init', function() {
	it( 'should return a promise that resolves properly', function() {
		var Editor = modules.editor;

		editor = new Editor( element, {
			plugins: 'creator-test'
		} );

		var promise = editor.init();

		expect( promise ).to.be.an.instanceof( Promise );

		return promise;
	} );

	it( 'should fill `plugins`', function() {
		var Editor = modules.editor;
		var Plugin = modules.plugin;

		editor = new Editor( element, {
			plugins: 'A,B,creator-test'
		} );

		expect( editor.plugins.length ).to.equal( 0 );

		return editor.init().then( function() {
			expect( editor.plugins.length ).to.equal( 3 );

			expect( editor.plugins.get( 'A' ) ).to.be.an.instanceof( Plugin );
			expect( editor.plugins.get( 'B' ) ).to.be.an.instanceof( Plugin );
			expect( editor.plugins.get( 'creator-test' ) ).to.be.an.instanceof( Plugin );
		} );
	} );

	it( 'should initialize plugins in the right order', function() {
		var Editor = modules.editor;

		editor = new Editor( element, {
			plugins: 'creator-test,A,D'
		} );

		return editor.init().then( function() {
			sinon.assert.callOrder(
				editor.plugins.get( 'creator-test' ).init,
				editor.plugins.get( 'A' ).init,
				editor.plugins.get( 'B' ).init,
				editor.plugins.get( 'C' ).init,
				editor.plugins.get( 'D' ).init
			);
		} );
	} );

	it( 'should initialize plugins in the right order, waiting for asynchronous ones', function() {
		var Editor = modules.editor;

		editor = new Editor( element, {
			plugins: 'creator-test,A,F'
		} );

		return editor.init().then( function() {
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

	it( 'should not fail if loading a plugin that doesn\'t define init()', function() {
		var Editor = modules.editor;

		editor = new Editor( element, {
			plugins: 'E,creator-test'
		} );

		return editor.init();
	} );
} );

describe( 'plugins', function() {
	it( 'should be empty on new editor', function() {
		expect( editor.plugins.length ).to.equal( 0 );
	} );
} );

describe( 'destroy', function() {
	it( 'should fire "destroy"', function() {
		var spy = sinon.spy();

		editor.on( 'destroy', spy );

		return editor.destroy().then( function() {
			sinon.assert.called( spy );
		} );
	} );

	it( 'should delete the "element" property', function() {
		return editor.destroy().then( function() {
			expect( editor ).to.not.have.property( 'element' );
		} );
	} );
} );
