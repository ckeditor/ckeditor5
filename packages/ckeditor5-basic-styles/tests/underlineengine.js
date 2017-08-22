/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import UnderlineEngine from '../src/underlineengine';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import AttributeCommand from '../src/attributecommand';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'UnderlineEngine', () => {
	let editor, doc;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, UnderlineEngine ]
			} )
			.then( newEditor => {
				editor = newEditor;

				doc = editor.document;
			} );
	} );

	afterEach( () => {
		return editor.destroy();
	} );

	it( 'should be loaded', () => {
		expect( editor.plugins.get( UnderlineEngine ) ).to.be.instanceOf( UnderlineEngine );
	} );

	it( 'should set proper schema rules', () => {
		expect( doc.schema.check( { name: '$inline', attributes: 'underline', inside: '$root' } ) ).to.be.false;
		expect( doc.schema.check( { name: '$inline', attributes: 'underline', inside: '$block' } ) ).to.be.true;
		expect( doc.schema.check( { name: '$inline', attributes: 'underline', inside: '$clipboardHolder' } ) ).to.be.true;
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

			expect( getModelData( doc, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text underline="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><u>foo</u>bar</p>' );
		} );

		it( 'should convert text-decoration:underline to underline attribute', () => {
			editor.setData( '<p><span style="text-decoration: underline;">foo</span>bar</p>' );

			expect( getModelData( doc, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text underline="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><u>foo</u>bar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			// Incorrect results because autoparagraphing works incorrectly (issue in paragraph).
			// https://github.com/ckeditor/ckeditor5-paragraph/issues/10

			editor.setData( '<u>foo</u>bar' );

			expect( getModelData( doc, { withoutSelection: true } ) ).to.equal( '<paragraph>foobar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foobar</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			setModelData( doc, '<paragraph><$text underline="true">foo</$text>bar</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p><u>foo</u>bar</p>' );
		} );
	} );
} );
