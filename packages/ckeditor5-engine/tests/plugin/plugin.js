/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

var modules = bender.amd.require( 'plugin', 'editor' );
var editor;

before( function() {
	var Editor = modules.editor;

	editor = new Editor( document.body.appendChild( document.createElement( 'div' ) ) );
} );

describe( 'constructor', function() {
	it( 'should set the `editor` property', function() {
		var Plugin = modules.plugin;

		var plugin = new Plugin( editor );

		expect( plugin ).to.have.property( 'editor' ).to.equal( editor );
	} );
} );
