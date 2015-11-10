/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const modules = bender.amd.require( 'plugincollection', 'plugin', 'editor', 'log' );
var editor;
let PluginA, PluginB;
class TestError extends Error {}

bender.tools.createSinonSandbox();

before( function() {
	const Editor = modules.editor;
	const Plugin = modules.plugin;

	PluginA = class extends Plugin {};
	PluginB = class extends Plugin {};

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
	return class extends Plugin {};
} );

CKEDITOR.define( 'plugin!D', [ 'plugin', 'plugin!A', 'plugin!C' ], function( Plugin ) {
	return class extends Plugin {};
} );

CKEDITOR.define( 'plugin!E', [ 'plugin', 'plugin!F' ], function( Plugin ) {
	return class extends Plugin {};
} );

CKEDITOR.define( 'plugin!F', [ 'plugin', 'plugin!E' ], function( Plugin ) {
	return class extends Plugin {};
} );

CKEDITOR.define( 'plugin!G', function() {
	throw new TestError( 'Some error inside a plugin' );
} );

CKEDITOR.define( 'plugin!H', [ 'plugin', 'plugin!H/a' ], function( Plugin ) {
	return class extends Plugin {};
} );

var spies = {};
// Note: This is NOT a plugin.
CKEDITOR.define( 'plugin!H/a', [ 'plugin!H/a/b' ], function() {
	return ( spies[ 'plugin!H/a' ] = sinon.spy() );
} );

// Note: This is NOT a plugin.
CKEDITOR.define( 'plugin!H/a/b', [ 'c' ], function() {
	return ( spies[ 'plugin!H/a/b' ] = sinon.spy() );
} );

// Note: This is NOT a plugin.
CKEDITOR.define( 'c', function() {
	return ( spies.c = sinon.spy() );
} );

CKEDITOR.define( 'plugin!I', [ 'plugin', 'plugin!J' ], function( Plugin ) {
	return class extends Plugin {};
} );

// Note: This is NOT a plugin.
CKEDITOR.define( 'plugin!J', function() {
	return function() {
		return ( spies.jSpy = sinon.spy() );
	};
} );

/////////////

describe( 'load', function() {
	it( 'should not fail when trying to load 0 plugins (empty string)', function() {
		const PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		return plugins.load( '' )
			.then( function() {
				expect( plugins.length ).to.equal( 0 );
			} );
	} );

	it( 'should not fail when trying to load 0 plugins (undefined)', function() {
		const PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		return plugins.load()
			.then( function() {
				expect( plugins.length ).to.equal( 0 );
			} );
	} );

	it( 'should add collection items for loaded plugins', function() {
		const PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		return plugins.load( 'A,B' )
			.then( function() {
				expect( plugins.length ).to.equal( 2 );

				expect( plugins.get( 'A' ) ).to.be.an.instanceof( PluginA );
				expect( plugins.get( 'B' ) ).to.be.an.instanceof( PluginB );
			} );
	} );

	it( 'should load dependency plugins', function() {
		const PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );
		var spy = sinon.spy( plugins, 'add' );

		return plugins.load( 'A,C' )
			.then( function( loadedPlugins ) {
				expect( plugins.length ).to.equal( 3 );

				expect( getPluginNamesFromSpy( spy ) ).to.deep.equal( [ 'A', 'B', 'C' ], 'order by plugins.add()' );
				expect( getPluginNames( loadedPlugins ) ).to.deep.equal( [ 'A', 'B', 'C' ], 'order by returned value' );
			} );
	} );

	it( 'should be ok when dependencies are loaded first', function() {
		const PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );
		var spy = sinon.spy( plugins, 'add' );

		return plugins.load( 'A,B,C' )
			.then( function( loadedPlugins ) {
				expect( plugins.length ).to.equal( 3 );

				expect( getPluginNamesFromSpy( spy ) ).to.deep.equal( [ 'A', 'B', 'C' ], 'order by plugins.add()' );
				expect( getPluginNames( loadedPlugins ) ).to.deep.equal( [ 'A', 'B', 'C' ], 'order by returned value' );
			} );
	} );

	it( 'should load deep dependency plugins', function() {
		const PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );
		var spy = sinon.spy( plugins, 'add' );

		return plugins.load( 'D' )
			.then( function( loadedPlugins ) {
				expect( plugins.length ).to.equal( 4 );

				// The order must have dependencies first.
				expect( getPluginNamesFromSpy( spy ) ).to.deep.equal( [ 'A', 'B', 'C', 'D' ], 'order by plugins.add()' );
				expect( getPluginNames( loadedPlugins ) ).to.deep.equal( [ 'A', 'B', 'C', 'D' ], 'order by returned value' );
			} );
	} );

	it( 'should handle cross dependency plugins', function() {
		const PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );
		var spy = sinon.spy( plugins, 'add' );

		return plugins.load( 'A,E' )
			.then( function( loadedPlugins ) {
				expect( plugins.length ).to.equal( 3 );

				// The order must have dependencies first.
				expect( getPluginNamesFromSpy( spy ) ).to.deep.equal( [ 'A', 'F', 'E' ], 'order by plugins.add()' );
				expect( getPluginNames( loadedPlugins ) ).to.deep.equal( [ 'A', 'F', 'E' ], 'order by returned value' );
			} );
	} );

	it( 'should set the `editor` property on loaded plugins', function() {
		const PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		return plugins.load( 'A,B' )
			.then( function() {
				expect( plugins.get( 'A' ).editor ).to.equal( editor );
				expect( plugins.get( 'B' ).editor ).to.equal( editor );
			} );
	} );

	it( 'should set the `path` property on loaded plugins', function() {
		const PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		return plugins.load( 'A,B' )
			.then( function() {
				expect( plugins.get( 'A' ).path ).to.equal( CKEDITOR.getPluginPath( 'A' ) );
				expect( plugins.get( 'B' ).path ).to.equal( CKEDITOR.getPluginPath( 'B' ) );
			} );
	} );

	it( 'should set the `deps` property on loaded plugins', function() {
		const PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );

		return plugins.load( 'A,D' )
			.then( function() {
				expect( plugins.get( 'A' ).deps ).to.deep.equal( [] );
				expect( plugins.get( 'B' ).deps ).to.deep.equal( [] );
				expect( plugins.get( 'C' ).deps ).to.deep.equal( [ 'B' ] );
				expect( plugins.get( 'D' ).deps ).to.deep.equal( [ 'A', 'C' ] );
			} );
	} );

	it( 'should reject on invalid plugin names (forward require.js loading error)', function() {
		const PluginCollection = modules.plugincollection;
		var log = modules.log;

		var logSpy = bender.sinon.stub( log, 'error' );

		var plugins = new PluginCollection( editor );

		return plugins.load( 'A,BAD,B' )
			// Throw here, so if by any chance plugins.load() was resolved correctly catch() will be stil executed.
			.then( function() {
				throw new Error( 'Test error: this promise should not be resolved successfully' );
			} )
			.catch( function( err ) {
				expect( err ).to.be.an.instanceof( Error );
				// Make sure it's the Require.JS error, not the one thrown above.
				expect( err.message ).to.match( /^Script error for:/ );

				sinon.assert.calledOnce( logSpy );
				expect( logSpy.args[ 0 ][ 0 ] ).to.match( /^plugincollection-load:/ );
			} );
	} );

	it( 'should reject on broken plugins (forward the error thrown in a plugin)', function() {
		const PluginCollection = modules.plugincollection;
		var log = modules.log;

		var logSpy = bender.sinon.stub( log, 'error' );

		var plugins = new PluginCollection( editor );

		return plugins.load( 'A,G,B' )
			// Throw here, so if by any chance plugins.load() was resolved correctly catch() will be stil executed.
			.then( function() {
				throw new Error( 'Test error: this promise should not be resolved successfully' );
			} )
			.catch( function( err ) {
				expect( err ).to.be.an.instanceof( TestError );
				expect( err ).to.have.property( 'message', 'Some error inside a plugin' );

				sinon.assert.calledOnce( logSpy );
				expect( logSpy.args[ 0 ][ 0 ] ).to.match( /^plugincollection-load:/ );
			} );
	} );

	it( 'should load `deps` which are not plugins', function() {
		const PluginCollection = modules.plugincollection;

		var plugins = new PluginCollection( editor );
		expect( spies ).to.be.empty;

		return plugins.load( 'H' )
			.then( function() {
				expect( plugins.get( 'H' ).deps ).to.deep.equal( [ 'H/a' ] );

				// Non–plugin dependencies should be loaded (spy exists)...
				expect( spies ).to.have.keys( [
					'plugin!H/a', 'plugin!H/a/b', 'c'
				] );

				// ...but not be executed (called == false)...
				expect( spies[ 'plugin!H/a' ].called ).to.be.false;
				expect( spies[ 'plugin!H/a/b' ].called ).to.be.false;
				expect( spies.c.called ).to.be.false;

				expect( plugins.length ).to.be.equal( 1 );
			} );
	} );

	it( 'should load instances of Plugin only', function() {
		const PluginCollection = modules.plugincollection;
		var plugins = new PluginCollection( editor );

		return plugins.load( 'I' )
			.then( () => {
				throw new Error( 'Test error: this promise should not be resolved successfully' );
			} ).catch( err => {
				expect( err.name ).to.be.equal( 'CKEditorError' );
				expect( err.message ).to.match( /^plugincollection-instance:/ );
			} );
	} );

	it( 'should cancel loading module which looks like a plugin but is a normal module', function() {
		const PluginCollection = modules.plugincollection;
		var plugins = new PluginCollection( editor );

		return plugins.load( 'J' )
			.then( () => {
				throw new Error( 'Test error: this promise should not be resolved successfully' );
			} ).catch( () => {
				// Path would be set if code execution wasn't stopped when we rejected the promise
				// (based on a real mistake we've made).
				expect( spies.jSpy.path ).to.be.undefined;
			} );
	} );
} );

function getPluginNamesFromSpy( addSpy ) {
	return addSpy.args.map( function( arg ) {
		return arg[ 0 ].name;
	} );
}

function getPluginNames( plugins ) {
	return plugins.map( function( arg ) {
		return arg.name;
	} );
}