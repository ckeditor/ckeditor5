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

describe( 'add', function() {
	it( 'should add plugins to the collection', function() {
		var PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		var pluginA = new PluginA();
		var pluginB = new PluginB();

		// `add()` requires the `name` property to the defined.
		pluginA.name = 'A';
		pluginB.name = 'B';

		plugins.add( pluginA );
		plugins.add( pluginB );

		expect( plugins.length ).to.equal( 2 );

		expect( plugins.get( 0 ) ).to.be.an.instanceof( PluginA );
		expect( plugins.get( 1 ) ).to.be.an.instanceof( PluginB );
	} );

	it( 'should do nothing if the plugin is already loaded', function() {
		var PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		return plugins.load( 'A,B' )
			.then( function() {
				// Check length before `add()`.
				expect( plugins.length ).to.equal( 2 );

				var pluginA = new PluginA();
				pluginA.name = 'A';

				plugins.add( pluginA );

				// Length should not change after `add()`.
				expect( plugins.length ).to.equal( 2 );
			} );
	} );
} );

describe( 'get', function() {
	it( 'should get plugin by name', function() {
		var PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		return plugins.load( 'A,B' )
			.then( function() {
				expect( plugins.get( 'A' ) ).to.be.an.instanceof( PluginA );
				expect( plugins.get( 'B' ) ).to.be.an.instanceof( PluginB );
			} );
	} );

	it( 'should return undefined for non existing plugin', function() {
		var PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		return plugins.load( 'A,B' )
			.then( function() {
				expect( plugins.get( 'C' ) ).to.be.an( 'undefined' );
			} );
	} );
} );
