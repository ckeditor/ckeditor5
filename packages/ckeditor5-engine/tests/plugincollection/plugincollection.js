/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, before, document */

'use strict';

var modules = bender.amd.require( 'plugincollection', 'plugin', 'editor' );
var editor;
var PluginA, PluginB;

before( function() {
	var Editor = modules.editor;
	var Plugin = modules.plugin;

	PluginA = Plugin.extend();
	PluginB = Plugin.extend();

	editor = new Editor( document.body.appendChild( document.createElement( 'div' ) ) );
} );

// Create fake plugins that will be used on tests.

CKEDITOR.define( 'plugin!A', function() {
	return PluginA;
} );

CKEDITOR.define( 'plugin!B', function() {
	return PluginB;
} );

CKEDITOR.define( 'plugin!C', [ 'plugin', 'plugin!B' ], function( Plugin ) {
	return Plugin.extend();
} );

CKEDITOR.define( 'plugin!D', [ 'plugin', 'plugin!A', 'plugin!C' ], function( Plugin ) {
	return Plugin.extend();
} );

CKEDITOR.define( 'plugin!E', [ 'plugin', 'plugin!F' ], function( Plugin ) {
	return Plugin.extend();
} );

CKEDITOR.define( 'plugin!F', [ 'plugin', 'plugin!E' ], function( Plugin ) {
	return Plugin.extend();
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

	it( 'should load dependency plugins', function() {
		var PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		return plugins.load( 'A,C' )
			.then( function() {
				expect( plugins.length ).to.equal( 3 );

				// The order must have dependencies first.
				expect( plugins.get( 0 ).name ).to.equal( 'A' );
				expect( plugins.get( 1 ).name ).to.equal( 'B' );
				expect( plugins.get( 2 ).name ).to.equal( 'C' );
			} );
	} );

	it( 'should be ok when dependencies are loaded first', function() {
		var PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		return plugins.load( 'A,B,C' )
			.then( function() {
				expect( plugins.length ).to.equal( 3 );

				// The order must have dependencies first.
				expect( plugins.get( 0 ).name ).to.equal( 'A' );
				expect( plugins.get( 1 ).name ).to.equal( 'B' );
				expect( plugins.get( 2 ).name ).to.equal( 'C' );
			} );
	} );

	it( 'should load deep dependency plugins', function() {
		var PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		return plugins.load( 'D' )
			.then( function() {
				expect( plugins.length ).to.equal( 4 );

				// The order must have dependencies first.
				expect( plugins.get( 0 ).name ).to.equal( 'A' );
				expect( plugins.get( 1 ).name ).to.equal( 'B' );
				expect( plugins.get( 2 ).name ).to.equal( 'C' );
				expect( plugins.get( 3 ).name ).to.equal( 'D' );
			} );
	} );

	it( 'should handle cross dependency plugins', function() {
		var PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		return plugins.load( 'A,E' )
			.then( function() {
				expect( plugins.length ).to.equal( 3 );

				// The order must have dependencies first.
				expect( plugins.get( 0 ).name ).to.equal( 'A' );
				expect( plugins.get( 1 ).name ).to.equal( 'F' );
				expect( plugins.get( 2 ).name ).to.equal( 'E' );
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

	it( 'should set the `path` property on loaded plugins', function() {
		var PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		return plugins.load( 'A,B' )
			.then( function() {
				expect( plugins.get( 'A' ).path ).to.equal( CKEDITOR.getPluginPath( 'A' ) );
				expect( plugins.get( 'B' ).path ).to.equal( CKEDITOR.getPluginPath( 'B' ) );
			} );
	} );

	it( 'should set the `deps` property on loaded plugins', function() {
		var PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		return plugins.load( 'A,D' )
			.then( function() {
				expect( plugins.get( 'A' ).deps ).to.deep.equal( [] );
				expect( plugins.get( 'B' ).deps ).to.deep.equal( [] );
				expect( plugins.get( 'C' ).deps ).to.deep.equal( [ 'B' ] );
				expect( plugins.get( 'D' ).deps ).to.deep.equal( [ 'A', 'C' ] );
			} );
	} );

	it( 'should throw an error for invalid plugins', function() {
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
	it( 'should get a plugin by name', function() {
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
