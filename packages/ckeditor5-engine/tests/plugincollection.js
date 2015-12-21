/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const modules = bender.amd.require( 'core/plugincollection', 'core/plugin', 'core/editor', 'core/log' );
let PluginCollection, Plugin, Editor, log;

let editor;
let PluginA, PluginB;
class TestError extends Error {}

bender.tools.createSinonSandbox();

before( () => {
	PluginCollection = modules[ 'core/plugincollection' ];
	Editor = modules[ 'core/editor' ];
	Plugin = modules[ 'core/plugin' ];
	log = modules[ 'core/log' ];

	PluginA = class extends Plugin {};
	PluginB = class extends Plugin {};

	editor = new Editor( document.body.appendChild( document.createElement( 'div' ) ) );
} );

// Create fake plugins that will be used on tests.

bender.amd.define( 'A', () => {
	return PluginA;
} );

bender.amd.define( 'B', () => {
	return PluginB;
} );

bender.amd.define( 'C', [ 'core/plugin', 'B' ], ( Plugin ) => {
	return class extends Plugin {};
} );

bender.amd.define( 'D', [ 'core/plugin', 'A', 'C' ], ( Plugin ) => {
	return class extends Plugin {};
} );

bender.amd.define( 'E', [ 'core/plugin', 'F' ], ( Plugin ) => {
	return class extends Plugin {};
} );

bender.amd.define( 'F', [ 'core/plugin', 'E' ], ( Plugin ) => {
	return class extends Plugin {};
} );

bender.amd.define( 'G', () => {
	throw new TestError( 'Some error inside a plugin' );
} );

bender.amd.define( 'H', [ 'core/plugin', 'H/a' ], ( Plugin ) => {
	return class extends Plugin {};
} );

let spies = {};
// Note: This is NOT a plugin.
bender.amd.define( 'H/a', [ 'H/a/b' ], () => {
	return ( spies[ 'H/a' ] = sinon.spy() );
} );

// Note: This is NOT a plugin.
bender.amd.define( 'H/a/b', [ 'c' ], () => {
	return ( spies[ 'H/a/b' ] = sinon.spy() );
} );

// Note: This is NOT a plugin.
bender.amd.define( 'c', () => {
	return ( spies.c = sinon.spy() );
} );

bender.amd.define( 'I', [ 'core/plugin', 'J' ], ( Plugin ) => {
	return class extends Plugin {};
} );

// Note: This is NOT a plugin.
bender.amd.define( 'J', () => {
	return function() {
		return ( spies.jSpy = sinon.spy() );
	};
} );

/////////////

describe( 'load', () => {
	it( 'should not fail when trying to load 0 plugins (empty string)', () => {
		let plugins = new PluginCollection( editor );

		return plugins.load( '' )
			.then( () => {
				expect( plugins.length ).to.equal( 0 );
			} );
	} );

	it( 'should not fail when trying to load 0 plugins (undefined)', () => {
		let plugins = new PluginCollection( editor );

		return plugins.load()
			.then( () => {
				expect( plugins.length ).to.equal( 0 );
			} );
	} );

	it( 'should add collection items for loaded plugins', () => {
		let plugins = new PluginCollection( editor );

		return plugins.load( 'A,B' )
			.then( () => {
				expect( plugins.length ).to.equal( 2 );

				expect( plugins.get( 'A' ) ).to.be.an.instanceof( PluginA );
				expect( plugins.get( 'B' ) ).to.be.an.instanceof( PluginB );
			} );
	} );

	it( 'should load dependency plugins', () => {
		let plugins = new PluginCollection( editor );
		let spy = sinon.spy( plugins, 'add' );

		return plugins.load( 'A,C' )
			.then( ( loadedPlugins ) => {
				expect( plugins.length ).to.equal( 3 );

				expect( getPluginNamesFromSpy( spy ) ).to.deep.equal( [ 'A', 'B', 'C' ], 'order by plugins.add()' );
				expect( getPluginNames( loadedPlugins ) ).to.deep.equal( [ 'A', 'B', 'C' ], 'order by returned value' );
			} );
	} );

	it( 'should be ok when dependencies are loaded first', () => {
		let plugins = new PluginCollection( editor );
		let spy = sinon.spy( plugins, 'add' );

		return plugins.load( 'A,B,C' )
			.then( ( loadedPlugins ) => {
				expect( plugins.length ).to.equal( 3 );

				expect( getPluginNamesFromSpy( spy ) ).to.deep.equal( [ 'A', 'B', 'C' ], 'order by plugins.add()' );
				expect( getPluginNames( loadedPlugins ) ).to.deep.equal( [ 'A', 'B', 'C' ], 'order by returned value' );
			} );
	} );

	it( 'should load deep dependency plugins', () => {
		let plugins = new PluginCollection( editor );
		let spy = sinon.spy( plugins, 'add' );

		return plugins.load( 'D' )
			.then( ( loadedPlugins ) => {
				expect( plugins.length ).to.equal( 4 );

				// The order must have dependencies first.
				expect( getPluginNamesFromSpy( spy ) ).to.deep.equal( [ 'A', 'B', 'C', 'D' ], 'order by plugins.add()' );
				expect( getPluginNames( loadedPlugins ) ).to.deep.equal( [ 'A', 'B', 'C', 'D' ], 'order by returned value' );
			} );
	} );

	it( 'should handle cross dependency plugins', () => {
		let plugins = new PluginCollection( editor );
		let spy = sinon.spy( plugins, 'add' );

		return plugins.load( 'A,E' )
			.then( ( loadedPlugins ) => {
				expect( plugins.length ).to.equal( 3 );

				// The order must have dependencies first.
				expect( getPluginNamesFromSpy( spy ) ).to.deep.equal( [ 'A', 'F', 'E' ], 'order by plugins.add()' );
				expect( getPluginNames( loadedPlugins ) ).to.deep.equal( [ 'A', 'F', 'E' ], 'order by returned value' );
			} );
	} );

	it( 'should set the `editor` property on loaded plugins', () => {
		let plugins = new PluginCollection( editor );

		return plugins.load( 'A,B' )
			.then( () => {
				expect( plugins.get( 'A' ).editor ).to.equal( editor );
				expect( plugins.get( 'B' ).editor ).to.equal( editor );
			} );
	} );

	it( 'should set the `deps` property on loaded plugins', () => {
		let plugins = new PluginCollection( editor );

		return plugins.load( 'A,D' )
			.then( () => {
				expect( plugins.get( 'A' ).deps ).to.deep.equal( [] );
				expect( plugins.get( 'B' ).deps ).to.deep.equal( [] );
				expect( plugins.get( 'C' ).deps ).to.deep.equal( [ 'B' ] );
				expect( plugins.get( 'D' ).deps ).to.deep.equal( [ 'A', 'C' ] );
			} );
	} );

	it( 'should reject on invalid plugin names (forward require.js loading error)', () => {
		let logSpy = bender.sinon.stub( log, 'error' );

		let plugins = new PluginCollection( editor );

		return plugins.load( 'A,BAD,B' )
			// Throw here, so if by any chance plugins.load() was resolved correctly catch() will be stil executed.
			.then( () => {
				throw new Error( 'Test error: this promise should not be resolved successfully' );
			} )
			.catch( ( err ) => {
				expect( err ).to.be.an.instanceof( Error );
				// Make sure it's the Require.JS error, not the one thrown above.
				expect( err.message ).to.match( /^Script error for/ );

				sinon.assert.calledOnce( logSpy );
				expect( logSpy.args[ 0 ][ 0 ] ).to.match( /^plugincollection-load:/ );
			} );
	} );

	it( 'should reject on broken plugins (forward the error thrown in a plugin)', () => {
		let logSpy = bender.sinon.stub( log, 'error' );

		let plugins = new PluginCollection( editor );

		return plugins.load( 'A,G,B' )
			// Throw here, so if by any chance plugins.load() was resolved correctly catch() will be stil executed.
			.then( () => {
				throw new Error( 'Test error: this promise should not be resolved successfully' );
			} )
			.catch( ( err ) => {
				expect( err ).to.be.an.instanceof( TestError );
				expect( err ).to.have.property( 'message', 'Some error inside a plugin' );

				sinon.assert.calledOnce( logSpy );
				expect( logSpy.args[ 0 ][ 0 ] ).to.match( /^plugincollection-load:/ );
			} );
	} );

	it( 'should load `deps` which are not plugins', () => {
		let plugins = new PluginCollection( editor );
		expect( spies ).to.be.empty;

		return plugins.load( 'H' )
			.then( () => {
				expect( plugins.get( 'H' ).deps ).to.deep.equal( [ 'H/a' ] );

				// Non–plugin dependencies should be loaded (spy exists)...
				expect( spies ).to.have.keys( [
					'H/a', 'H/a/b', 'c'
				] );

				// ...but not be executed (called == false)...
				expect( spies[ 'H/a' ].called ).to.be.false;
				expect( spies[ 'H/a/b' ].called ).to.be.false;
				expect( spies.c.called ).to.be.false;

				expect( plugins.length ).to.be.equal( 1 );
			} );
	} );

	it( 'should load instances of Plugin only', () => {
		let plugins = new PluginCollection( editor );

		return plugins.load( 'I' )
			.then( () => {
				throw new Error( 'Test error: this promise should not be resolved successfully' );
			} ).catch( err => {
				expect( err.name ).to.be.equal( 'CKEditorError' );
				expect( err.message ).to.match( /^plugincollection-instance:/ );
			} );
	} );

	it( 'should cancel loading module which looks like a plugin but is a normal module', () => {
		let plugins = new PluginCollection( editor );

		return plugins.load( 'J' )
			.then( () => {
				throw new Error( 'Test error: this promise should not be resolved successfully' );
			} ).catch( () => {
				// Path would be set if code execution wasn't stopped when we rejected the promise
				// (based on a real mistake we've made).
				// expect( spies.jSpy.path ).to.be.undefined;
				//
				// TODO now, the above does not make sense, because we removed the path.
			} );
	} );
} );

function getPluginNamesFromSpy( addSpy ) {
	return addSpy.args.map( ( arg ) => {
		return arg[ 0 ].name;
	} );
}

function getPluginNames( plugins ) {
	return plugins.map( ( arg ) => {
		return arg.name;
	} );
}