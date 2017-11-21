/**
 * @license Copyright (c) 2003-2017, CKSource - Rémy Hubscher. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import StrikethroughEngine from '../src/strikethroughengine';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import AttributeCommand from '../src/attributecommand';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'StrikethroughEngine', () => {
	let editor, doc;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, StrikethroughEngine ]
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
		expect( editor.plugins.get( StrikethroughEngine ) ).to.be.instanceOf( StrikethroughEngine );
	} );

	it( 'should set proper schema rules', () => {
		expect( doc.schema.check( { name: '$inline', attributes: 'strikethrough', inside: '$root' } ) ).to.be.false;
		expect( doc.schema.check( { name: '$inline', attributes: 'strikethrough', inside: '$block' } ) ).to.be.true;
		expect( doc.schema.check( { name: '$inline', attributes: 'strikethrough', inside: '$clipboardHolder' } ) ).to.be.true;
	} );

	describe( 'command', () => {
		it( 'should register strikethrough command', () => {
			const command = editor.commands.get( 'strikethrough' );

			expect( command ).to.be.instanceOf( AttributeCommand );
			expect( command ).to.have.property( 'attributeKey', 'strikethrough' );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert <strike> to strikethrough attribute', () => {
			editor.setData( '<p><strike>foo</strike>bar</p>' );

			expect( getModelData( doc, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text strikethrough="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><s>foo</s>bar</p>' );
		} );
		it( 'should convert <del> to strikethrough attribute', () => {
			editor.setData( '<p><del>foo</del>bar</p>' );

			expect( getModelData( doc, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text strikethrough="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><s>foo</s>bar</p>' );
		} );

		it( 'should convert <s> to strikethrough attribute', () => {
			editor.setData( '<p><s>foo</s>bar</p>' );

			expect( getModelData( doc, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text strikethrough="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><s>foo</s>bar</p>' );
		} );

		it( 'should convert text-decoration:line-through to strikethrough attribute', () => {
			editor.setData( '<p><span style="text-decoration: line-through;">foo</span>bar</p>' );

			expect( getModelData( doc, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text strikethrough="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><s>foo</s>bar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			// Incorrect results because autoparagraphing works incorrectly (issue in paragraph).
			// https://github.com/ckeditor/ckeditor5-paragraph/issues/10

			editor.setData( '<s>foo</s>bar' );

			expect( getModelData( doc, { withoutSelection: true } ) ).to.equal( '<paragraph>foobar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foobar</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			setModelData( doc, '<paragraph><$text strikethrough="true">foo</$text>bar</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p><s>foo</s>bar</p>' );
		} );
	} );
} );
