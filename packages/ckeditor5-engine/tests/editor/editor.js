/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, beforeEach, sinon, document, setTimeout */

'use strict';

var modules = bender.amd.require( 'editor', 'editorconfig', 'plugin', 'promise' );

var editor;
var element;

beforeEach( function() {
	var Editor = modules.editor;

	element = document.createElement( 'div' );
	document.body.appendChild( element );

	editor = new Editor( element );
} );

// Define fake plugins to be used in tests.

CKEDITOR.define( 'plugin!A', [ 'plugin' ], function() {
	return modules.plugin.extend( {
		init: sinon.spy().named( 'A' )
	} );
} );

CKEDITOR.define( 'plugin!B', [ 'plugin' ], function() {
	return modules.plugin.extend( {
		init: sinon.spy().named( 'B' )
	} );
} );

CKEDITOR.define( 'plugin!C', [ 'plugin', 'plugin!B' ], function() {
	return modules.plugin.extend( {
		init: sinon.spy().named( 'C' )
	} );
} );

CKEDITOR.define( 'plugin!D', [ 'plugin', 'plugin!C' ], function() {
	return modules.plugin.extend( {
		init: sinon.spy().named( 'D' )
	} );
} );

CKEDITOR.define( 'plugin!E', [ 'plugin' ], function( Plugin ) {
	return Plugin.extend( {} );
} );

// Synchronous plugin that depends on an asynchronous one.
CKEDITOR.define( 'plugin!F', [ 'plugin', 'plugin!async' ], function( Plugin ) {
	return Plugin.extend( {
		init: sinon.spy().named( 'F' )
	} );
} );

var asyncSpy = sinon.spy().named( 'async-call-spy' );

CKEDITOR.define( 'plugin!async', [ 'plugin' ], function( Plugin ) {
	return Plugin.extend( {
		init: sinon.spy( function() {
			return new Promise( function( resolve ) {
				setTimeout( function() {
					asyncSpy();
					resolve();
				}, 0 );
			} );
		} )
	} );
} );

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
		var Promise = modules.promise;

		var promise = editor.init();

		expect( promise ).to.be.an.instanceof( Promise );

		return promise;
	} );

	it( 'should return the same promise for sucessive calls', function() {
		var promise = editor.init();

		expect( editor.init() ).to.equal( promise );
	} );

	it( 'should fill `plugins`', function() {
		var Editor = modules.editor;
		var Plugin = modules.plugin;

		editor = new Editor( element, {
			plugins: 'A,B'
		} );

		expect( editor.plugins.length ).to.equal( 0 );

		return editor.init().then( function() {
			expect( editor.plugins.length ).to.equal( 2 );

			expect( editor.plugins.get( 'A' ) ).to.be.an.instanceof( Plugin );
			expect( editor.plugins.get( 'B' ) ).to.be.an.instanceof( Plugin );
		} );
	} );

	it( 'should initialize plugins in the right order', function() {
		var Editor = modules.editor;

		editor = new Editor( element, {
			plugins: 'A,D'
		} );

		return editor.init().then( function() {
			sinon.assert.callOrder(
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
			plugins: 'A,F'
		} );

		return editor.init().then( function() {
			sinon.assert.callOrder(
				editor.plugins.get( 'A' ).init,
				editor.plugins.get( 'async' ).init,
				asyncSpy,	// This one is called with delay by the async init
				editor.plugins.get( 'F' ).init
			);
		} );
	} );

	it( 'should not fail if loading a plugin that doesn\'t define init()', function() {
		var Editor = modules.editor;

		editor = new Editor( element, {
			plugins: 'E'
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

		editor.destroy();

		sinon.assert.called( spy );
	} );

	it( 'should delete the "element" property', function() {
		editor.destroy();

		expect( editor ).to.not.have.property( 'element' );
	} );
} );
