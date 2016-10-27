/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* bender-tags: browser-only */

import testUtils from '/tests/core/_utils/utils.js';
import Editor from '/ckeditor5/core/editor/editor.js';
import PluginCollection from '/ckeditor5/core/plugincollection.js';
import Plugin from '/ckeditor5/core/plugin.js';
import Feature from '/ckeditor5/core/feature.js';
import CKEditorError from '/ckeditor5/utils/ckeditorerror.js';
import log from '/ckeditor5/utils/log.js';

let editor;
let PluginA, PluginB, PluginC, PluginD, PluginE, PluginF, PluginG, PluginH, PluginI, PluginX;
class TestError extends Error {}
class GrandPlugin extends Feature {}

testUtils.createSinonSandbox();

before( () => {
	PluginA = createPlugin( 'A' );
	PluginB = createPlugin( 'B' );
	PluginC = createPlugin( 'C' );
	PluginD = createPlugin( 'D' );
	PluginE = createPlugin( 'E' );
	PluginF = createPlugin( 'F' );
	PluginG = createPlugin( 'G', GrandPlugin );
	PluginH = createPlugin( 'H' );
	PluginI = createPlugin( 'I' );
	PluginX = class extends Plugin {
		constructor( editor ) {
			super( editor );

			throw new TestError( 'Some error inside a plugin' );
		}
	};

	PluginC.requires = [ PluginB ];
	PluginD.requires = [ PluginA, PluginC ];
	PluginF.requires = [ PluginE ];
	PluginE.requires = [ PluginF ];
	PluginH.requires = [ PluginI ];

	editor = new Editor();
} );

describe( 'load', () => {
	it( 'should not fail when trying to load 0 plugins (empty array)', () => {
		let plugins = new PluginCollection( editor );

		return plugins.load( [] )
			.then( () => {
				expect( getPlugins( plugins ) ).to.be.empty();
			} );
	} );

	it( 'should add collection items for loaded plugins', () => {
		let plugins = new PluginCollection( editor );

		return plugins.load( [ PluginA, PluginB ] )
			.then( () => {
				expect( getPlugins( plugins ).length ).to.equal( 2 );

				expect( plugins.get( PluginA ) ).to.be.an.instanceof( PluginA );
				expect( plugins.get( PluginB ) ).to.be.an.instanceof( PluginB );
			} );
	} );

	it( 'should load dependency plugins', () => {
		let plugins = new PluginCollection( editor );
		let spy = sinon.spy( plugins, '_add' );

		return plugins.load( [ PluginA, PluginC ] )
			.then( ( loadedPlugins ) => {
				expect( getPlugins( plugins ).length ).to.equal( 3 );

				expect( getPluginNames( getPluginsFromSpy( spy ) ) )
					.to.deep.equal( [ 'A', 'B', 'C' ], 'order by plugins._add()' );
				expect( getPluginNames( loadedPlugins ) )
					.to.deep.equal( [ 'A', 'B', 'C' ], 'order by returned value' );
			} );
	} );

	it( 'should be ok when dependencies are loaded first', () => {
		let plugins = new PluginCollection( editor );
		let spy = sinon.spy( plugins, '_add' );

		return plugins.load( [ PluginA, PluginB, PluginC ] )
			.then( ( loadedPlugins ) => {
				expect( getPlugins( plugins ).length ).to.equal( 3 );

				expect( getPluginNames( getPluginsFromSpy( spy ) ) )
					.to.deep.equal( [ 'A', 'B', 'C' ], 'order by plugins._add()' );
				expect( getPluginNames( loadedPlugins ) )
					.to.deep.equal( [ 'A', 'B', 'C' ], 'order by returned value' );
			} );
	} );

	it( 'should load deep dependency plugins', () => {
		let plugins = new PluginCollection( editor );
		let spy = sinon.spy( plugins, '_add' );

		return plugins.load( [ PluginD ] )
			.then( ( loadedPlugins ) => {
				expect( getPlugins( plugins ).length ).to.equal( 4 );

				// The order must have dependencies first.
				expect( getPluginNames( getPluginsFromSpy( spy ) ) )
					.to.deep.equal( [ 'A', 'B', 'C', 'D' ], 'order by plugins._add()' );
				expect( getPluginNames( loadedPlugins ) )
					.to.deep.equal( [ 'A', 'B', 'C', 'D' ], 'order by returned value' );
			} );
	} );

	it( 'should handle cross dependency plugins', () => {
		let plugins = new PluginCollection( editor );
		let spy = sinon.spy( plugins, '_add' );

		return plugins.load( [ PluginA, PluginE ] )
			.then( ( loadedPlugins ) => {
				expect( getPlugins( plugins ).length ).to.equal( 3 );

				// The order must have dependencies first.
				expect( getPluginNames( getPluginsFromSpy( spy ) ) )
					.to.deep.equal( [ 'A', 'F', 'E' ], 'order by plugins._add()' );
				expect( getPluginNames( loadedPlugins ) )
					.to.deep.equal( [ 'A', 'F', 'E' ], 'order by returned value' );
			} );
	} );

	it( 'should load grand child classes', () => {
		let plugins = new PluginCollection( editor );

		return plugins.load( [ PluginG ] )
			.then( () => {
				expect( getPlugins( plugins ).length ).to.equal( 1 );
			} );
	} );

	it( 'should set the `editor` property on loaded plugins', () => {
		let plugins = new PluginCollection( editor );

		return plugins.load( [ PluginA, PluginB ] )
			.then( () => {
				expect( plugins.get( PluginA ).editor ).to.equal( editor );
				expect( plugins.get( PluginB ).editor ).to.equal( editor );
			} );
	} );

	it( 'should reject on broken plugins (forward the error thrown in a plugin)', () => {
		let logSpy = testUtils.sinon.stub( log, 'error' );

		let plugins = new PluginCollection( editor );

		return plugins.load( [ PluginA, PluginX, PluginB ] )
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

	it( 'should reject when loading a module which is not a plugin', () => {
		let logSpy = testUtils.sinon.stub( log, 'error' );

		let plugins = new PluginCollection( editor );

		class Y {}

		return plugins.load( [ Y ] )
			// Throw here, so if by any chance plugins.load() was resolved correctly catch() will be stil executed.
			.then( () => {
				throw new Error( 'Test error: this promise should not be resolved successfully' );
			} )
			.catch( ( err ) => {
				expect( err ).to.be.an.instanceof( CKEditorError );
				expect( err.message ).to.match( /^plugincollection-instance/ );

				sinon.assert.calledOnce( logSpy );
				expect( logSpy.args[ 0 ][ 0 ] ).to.match( /^plugincollection-load:/ );
			} );
	} );
} );

function createPlugin( name, baseClass ) {
	baseClass = baseClass || Plugin;

	const P = class extends baseClass {
		constructor( editor ) {
			super( editor );
			this._pluginName = name;
		}
	};

	P._pluginName = name;

	return P;
}

function getPlugins( pluginCollection ) {
	return Array.from( pluginCollection )
		.map( entry => entry[ 1 ] ); // Get instances.
}

function getPluginsFromSpy( addSpy ) {
	return addSpy.args
		.map( ( arg ) => arg[ 0 ] )
		// Entries may be kept twice in the plugins map - once as a pluginName => plugin, once as pluginClass => plugin.
		// Return only pluginClass => plugin entries as these will always represent all plugins.
		.filter( ( plugin ) => typeof plugin == 'function' );
}

function getPluginNames( plugins ) {
	return plugins.map( ( plugin ) => plugin._pluginName );
}
