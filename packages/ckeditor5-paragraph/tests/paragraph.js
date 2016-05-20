/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Paragraph from '/ckeditor5/paragraph/paragraph.js';
import Editor from '/ckeditor5/editor.js';
import StandardCreator from '/ckeditor5/creator/standardcreator.js';
import { getData } from '/tests/engine/_utils/model.js';

describe( 'Paragraph feature', () => {
	let editor, document;

	beforeEach( () => {
		editor = new Editor( null, {
			creator: StandardCreator,
			features: [ Paragraph ]
		} );

		return editor.init().then( () => {
			document = editor.document;
		} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Paragraph ) ).to.be.instanceOf( Paragraph );
	} );

	it( 'should convert paragraph', () => {
		document.createRoot( 'main' );
		editor.setData( '<p>foobar</p>' );

		expect( getData( document, { withoutSelection: true } ) ).to.equal( '<paragraph>foobar</paragraph>' );
		expect( editor.getData() ).to.equal( '<p>foobar</p>' );
	} );

	it( 'should convert paragraph only', () => {
		document.createRoot( 'main' );
		editor.setData( '<p>foo<b>baz</b>bar</p>' );

		expect( getData( document, { withoutSelection: true } ) ).to.equal( '<paragraph>foobazbar</paragraph>' );
		expect( editor.getData() ).to.equal( '<p>foobazbar</p>' );
	} );

	it( 'should convert multiple paragraphs', () => {
		document.createRoot( 'main' );
		editor.setData( '<p>foo</p><p>baz</p>' );

		expect( getData( document, { withoutSelection: true } ) ).to.equal( '<paragraph>foo</paragraph><paragraph>baz</paragraph>' );
		expect( editor.getData() ).to.equal( '<p>foo</p><p>baz</p>' );
	} );
} );
