/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import ItalicEngine from '/ckeditor5/basic-styles/italicengine.js';
import VirtualTestEditor from '/tests/ckeditor5/_utils/virtualtesteditor.js';
import { getData as getModelData } from '/tests/engine/_utils/model.js';
import { getData as getViewData } from '/tests/engine/_utils/view.js';
import AttributeCommand from '/ckeditor5/command/attributecommand.js';

describe( 'ItalicEngine', () => {
	let editor, doc;

	beforeEach( () => {
		return VirtualTestEditor.create( {
				features: [ ItalicEngine ]
			} )
			.then( newEditor => {
				editor = newEditor;

				doc = editor.document;

				doc.schema.allow( { name: '$text', inside: '$root' } );
			} );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ItalicEngine ) ).to.be.instanceOf( ItalicEngine );
	} );

	it( 'should set proper schema rules', () => {
		expect( doc.schema.check( { name: '$inline', attributes: [ 'italic' ] } ) ).to.be.true;
	} );

	describe( 'command', () => {
		it( 'should register italic command', () => {
			expect( editor.commands.has( 'italic' ) ).to.be.true;

			const command = editor.commands.get( 'italic' );

			expect( command ).to.be.instanceOf( AttributeCommand );
			expect( command ).to.have.property( 'attributeKey', 'italic' );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert <em> to italic attribute', () => {
			editor.setData( '<em>foo</em>bar' );

			expect( getModelData( doc, { withoutSelection: true } ) ).to.equal( '<$text italic=true>foo</$text>bar' );
			expect( editor.getData() ).to.equal( '<em>foo</em>bar' );
		} );

		it( 'should convert <i> to italic attribute', () => {
			editor.setData( '<i>foo</i>bar' );

			expect( getModelData( doc, { withoutSelection: true } ) ).to.equal( '<$text italic=true>foo</$text>bar' );
			expect( editor.getData() ).to.equal( '<em>foo</em>bar' );
		} );

		it( 'should convert font-weight:italic to italic attribute', () => {
			editor.setData( '<span style="font-style: italic;">foo</span>bar' );

			expect( getModelData( doc, { withoutSelection: true } ) ).to.equal( '<$text italic=true>foo</$text>bar' );
			expect( editor.getData() ).to.equal( '<em>foo</em>bar' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert paragraph', () => {
			// Workaround for setting model data: https://github.com/ckeditor/ckeditor5-engine/issues/455
			editor.setData( '<em>foo</em>bar' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<em>foo</em>bar' );
		} );
	} );
} );
