/**
 * @license Copyright (c) 2003-2015, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals describe, it, expect, beforeEach, sinon, document */

'use strict';

var modules = bender.amd.require( 'editor', 'editorconfig' );

var editor;
var element;

beforeEach( function() {
	var Editor = modules.editor;

	element = document.createElement( 'div' );
	document.body.appendChild( element );

	editor = new Editor( element );
} );

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
