/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

const modules = bender.amd.require( 'plugin', 'editor' );
var editor;

before( function() {
	const Editor = modules.editor;

	editor = new Editor( document.body.appendChild( document.createElement( 'div' ) ) );
} );

describe( 'constructor', function() {
	it( 'should set the `editor` property', function() {
		const Plugin = modules.plugin;

		var plugin = new Plugin( editor );

		expect( plugin ).to.have.property( 'editor' ).to.equal( editor );
	} );
} );
