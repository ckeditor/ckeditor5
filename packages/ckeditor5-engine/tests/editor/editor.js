/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, sinon, document */

'use strict';

var modules = bender.amd.require( 'editor' );

describe( 'constructor', function() {
	it( 'should create a new editor instance', function() {
		var Editor = modules.editor;

		var editor = new Editor( document.body );

		expect( editor ).to.have.property( 'element' ).to.equal( document.body );
	} );
} );

describe( 'destroy', function() {
	it( 'should fire "destroy"', function() {
		var Editor = modules.editor;

		var editor = new Editor( document.body );
		var spy = sinon.spy();

		editor.on( 'destroy', spy );

		editor.destroy();

		sinon.assert.called( spy );
	} );

	it( 'should delete the "element" property', function() {
		var Editor = modules.editor;

		var editor = new Editor( document.body );

		editor.destroy();

		expect( editor ).to.not.have.property( 'element' );
	} );
} );
