/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import BoldEngine from '../src/boldengine';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import AttributeCommand from '../src/attributecommand';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'BoldEngine', () => {
	let editor, model;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, BoldEngine ]
			} )
			.then( newEditor => {
				editor = newEditor;
				model = editor.model;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( BoldEngine ) ).to.be.instanceOf( BoldEngine );
	} );

	it( 'should set proper schema rules', () => {
		expect( model.schema.check( { name: '$text', attributes: 'bold', inside: '$root' } ) ).to.be.false;
		expect( model.schema.check( { name: '$text', attributes: 'bold', inside: '$block' } ) ).to.be.true;
		expect( model.schema.check( { name: '$text', attributes: 'bold', inside: '$clipboardHolder' } ) ).to.be.true;
	} );

	describe( 'command', () => {
		it( 'should register bold command', () => {
			const command = editor.commands.get( 'bold' );

			expect( command ).to.be.instanceOf( AttributeCommand );
			expect( command ).to.have.property( 'attributeKey', 'bold' );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert <strong> to bold attribute', () => {
			editor.setData( '<p><strong>foo</strong>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text bold="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><strong>foo</strong>bar</p>' );
		} );

		it( 'should convert <b> to bold attribute', () => {
			editor.setData( '<p><b>foo</b>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text bold="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><strong>foo</strong>bar</p>' );
		} );

		it( 'should convert font-weight:bold to bold attribute', () => {
			editor.setData( '<p><span style="font-weight: bold;">foo</span>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text bold="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><strong>foo</strong>bar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			// Incorrect results because autoparagraphing works incorrectly (issue in paragraph).
			// https://github.com/ckeditor/ckeditor5-paragraph/issues/10

			editor.setData( '<strong>foo</strong>bar' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equal( '<paragraph>foobar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foobar</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			setModelData( model, '<paragraph><$text bold="true">foo</$text>bar</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p><strong>foo</strong>bar</p>' );
		} );
	} );
} );
