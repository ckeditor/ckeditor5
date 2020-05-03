/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import UnderlineEditing from '../../src/underline/underlineediting';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import AttributeCommand from '../../src/attributecommand';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'UnderlineEditing', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, UnderlineEditing ]
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
		expect( UnderlineEditing.pluginName ).to.equal( 'UnderlineEditing' );
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( UnderlineEditing ) ).to.be.instanceOf( UnderlineEditing );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.checkAttribute( [ '$root', '$block', '$text' ], 'underline' ) ).to.be.true;
		expect( model.schema.checkAttribute( [ '$clipboardHolder', '$text' ], 'underline' ) ).to.be.true;
	} );

	it( 'should be marked with a formatting property', () => {
		expect( model.schema.getAttributeProperties( 'underline' ) ).to.include( {
			isFormatting: true
		} );
	} );

	it( 'its attribute is marked with a copOnEnter property', () => {
		expect( model.schema.getAttributeProperties( 'underline' ) ).to.include( {
			copyOnEnter: true
		} );
	} );

	describe( 'command', () => {
		it( 'should register underline command', () => {
			const command = editor.commands.get( 'underline' );

			expect( command ).to.be.instanceOf( AttributeCommand );
			expect( command ).to.have.property( 'attributeKey', 'underline' );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert <u> to underline attribute', () => {
			editor.setData( '<p><u>foo</u>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text underline="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><u>foo</u>bar</p>' );
		} );

		it( 'should convert text-decoration:underline to underline attribute', () => {
			editor.setData( '<p><span style="text-decoration: underline;">foo</span>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text underline="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><u>foo</u>bar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			editor.setData( '<u>foo</u>bar' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text underline="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><u>foo</u>bar</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			setModelData( model, '<paragraph><$text underline="true">foo</$text>bar</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p><u>foo</u>bar</p>' );
		} );
	} );
} );
