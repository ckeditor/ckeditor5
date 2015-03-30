/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, before, document */

'use strict';

var modules = bender.amd.require( 'plugincollection', 'plugin', 'editor' );
var editor;
var PluginA, PluginB, PluginC;

before( function() {
	var Editor = modules.editor;
	var Plugin = modules.plugin;

	PluginA = Plugin.extend();
	PluginB = Plugin.extend();
	PluginC = Plugin.extend();

	editor = new Editor( document.body.appendChild( document.createElement( 'div' ) ) );
} );

// Create 3 fake plugins that will be used on tests.

CKEDITOR.define( 'plugin!A', [ 'plugin' ], function() {
	return PluginA;
} );

CKEDITOR.define( 'plugin!B', [ 'plugin' ], function() {
	return PluginB;
} );

CKEDITOR.define( 'plugin!C', [ 'plugin' ], function() {
	return PluginC;
} );

/////////////

describe( 'load', function() {
	it( 'should add collection items for loaded plugins', function() {
		var PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		return plugins.load( 'A,B' )
			.then( function() {
				expect( plugins.length ).to.equal( 2 );

				expect( plugins.get( 0 ) ).to.be.an.instanceof( PluginA );
				expect( plugins.get( 1 ) ).to.be.an.instanceof( PluginB );
			} );
	} );

	it( 'should set the `editor` property on loaded plugins', function() {
		var PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		return plugins.load( 'A,B' )
			.then( function() {
				expect( plugins.get( 0 ).editor ).to.equal( editor );
				expect( plugins.get( 1 ).editor ).to.equal( editor );
			} );
	} );

	it( 'should throw error for invalid plugins', function() {
		var PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		return plugins.load( 'A,BAD,B' )
			.then( function() {
				throw new Error( 'Test error: this promise should not be resolved successfully' );
			} )
			.catch( function( err ) {
				expect( err ).to.be.an.instanceof( Error );
				expect( err.name ).to.equal( 'CKEditor Error' );
			} );
	} );
} );
