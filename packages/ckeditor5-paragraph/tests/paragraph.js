/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

'use strict';

import Paragraph from '/ckeditor5/paragraph/paragraph.js';
import VirtualTestEditor from '/tests/ckeditor5/_utils/virtualtesteditor.js';
import { getData } from '/tests/engine/_utils/model.js';

describe( 'Paragraph feature', () => {
	let editor, doc;

	beforeEach( () => {
		return VirtualTestEditor.create( {
				features: [ Paragraph ]
			} )
			.then( newEditor => {
				editor = newEditor;
				doc = editor.document;

				doc.createRoot();
			} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( Paragraph ) ).to.be.instanceOf( Paragraph );
	} );

	it( 'should set proper schema rules', () => {
		expect( doc.schema.hasItem( 'paragraph' ) ).to.be.true;
		expect( doc.schema.check( { name: 'paragraph', inside: '$root' } ) ).to.be.true;
		expect( doc.schema.check( { name: '$inline', inside: 'paragraph' } ) ).to.be.true;
	} );

	it( 'should convert paragraph', () => {
		editor.setData( '<p>foobar</p>' );

		expect( getData( doc, { withoutSelection: true } ) ).to.equal( '<paragraph>foobar</paragraph>' );
		expect( editor.getData() ).to.equal( '<p>foobar</p>' );
	} );

	it( 'should convert paragraph only', () => {
		editor.setData( '<p>foo<b>baz</b>bar</p>' );

		expect( getData( doc, { withoutSelection: true } ) ).to.equal( '<paragraph>foobazbar</paragraph>' );
		expect( editor.getData() ).to.equal( '<p>foobazbar</p>' );
	} );

	it( 'should convert multiple paragraphs', () => {
		editor.setData( '<p>foo</p><p>baz</p>' );

		expect( getData( doc, { withoutSelection: true } ) ).to.equal( '<paragraph>foo</paragraph><paragraph>baz</paragraph>' );
		expect( editor.getData() ).to.equal( '<p>foo</p><p>baz</p>' );
	} );
} );
