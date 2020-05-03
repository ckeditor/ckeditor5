/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ItalicEditing from '../../src/italic/italicediting';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import AttributeCommand from '../../src/attributecommand';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'ItalicEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, ItalicEditing ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should have pluginName', () => {
		expect( ItalicEditing.pluginName ).to.equal( 'ItalicEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( ItalicEditing ) ).to.be.instanceOf( ItalicEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', '$block', '$text' ], 'italic' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'italic' ) ).to.be.true;
	} );

	it( 'should be marked with a formatting property', () => {
		expect( model.schema.getAttributeProperties( 'italic' ) ).to.include( {
			isFormatting: true
		} );
	} );

	it( 'its attribute is marked with a copOnEnter property', () => {
		expect( model.schema.getAttributeProperties( 'italic' ) ).to.include( {
			copyOnEnter: true
		} );
	} );

	describe( 'command', () => {
		it( 'should register italic command', () => {
			const command = editor.commands.get( 'italic' );

			expect( command ).to.be.instanceOf( AttributeCommand );
			expect( command ).to.have.property( 'attributeKey', 'italic' );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert <em> to italic attribute', () => {
			editor.setData( '<p><em>foo</em>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text italic="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><i>foo</i>bar</p>' );
		} );

		it( 'should convert <i> to italic attribute', () => {
			editor.setData( '<p><i>foo</i>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text italic="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><i>foo</i>bar</p>' );
		} );

		it( 'should convert font-weight:italic to italic attribute', () => {
			editor.setData( '<p><span style="font-style: italic;">foo</span>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text italic="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><i>foo</i>bar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			editor.setData( '<i>foo</i>bar' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text italic="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><i>foo</i>bar</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			setModelData( model, '<paragraph><$text italic="true">foo</$text>bar</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p><i>foo</i>bar</p>' );
		} );
	} );
} );
