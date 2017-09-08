/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import CodeEngine from '../src/codeengine';

import VirtualTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/virtualtesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import AttributeCommand from '../src/attributecommand';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'CodeEngine', () => {
	let editor, doc;

	beforeEach( () => {
		return VirtualTestEditor
			.create( {
				plugins: [ Paragraph, CodeEngine ]
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
		expect( editor.plugins.get( CodeEngine ) ).to.be.instanceOf( CodeEngine );
	} );

	it( 'should set proper schema rules', () => {
		expect( doc.schema.check( { name: '$inline', attributes: 'code', inside: '$root' } ) ).to.be.false;
		expect( doc.schema.check( { name: '$inline', attributes: 'code', inside: '$block' } ) ).to.be.true;
		expect( doc.schema.check( { name: '$inline', attributes: 'code', inside: '$clipboardHolder' } ) ).to.be.true;
	} );

	describe( 'command', () => {
		it( 'should register code command', () => {
			const command = editor.commands.get( 'code' );

			expect( command ).to.be.instanceOf( AttributeCommand );
			expect( command ).to.have.property( 'attributeKey', 'code' );
		} );
	} );

	describe( 'data pipeline conversions', () => {
		it( 'should convert <code> to code attribute', () => {
			editor.setData( '<p><code>foo</code>bar</p>' );

			expect( getModelData( doc, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text code="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><code>foo</code>bar</p>' );
		} );

		it( 'should convert word-wrap:break-word to code attribute', () => {
			editor.setData( '<p><span style="word-wrap: break-word">foo</span>bar</p>' );

			expect( getModelData( doc, { withoutSelection: true } ) )
				.to.equal( '<paragraph><$text code="true">foo</$text>bar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p><code>foo</code>bar</p>' );
		} );

		it( 'should be integrated with autoparagraphing', () => {
			// Incorrect results because autoparagraphing works incorrectly (issue in paragraph).
			// https://github.com/ckeditor/ckeditor5-paragraph/issues/10

			editor.setData( '<code>foo</code>bar' );

			expect( getModelData( doc, { withoutSelection: true } ) ).to.equal( '<paragraph>foobar</paragraph>' );

			expect( editor.getData() ).to.equal( '<p>foobar</p>' );
		} );
	} );

	describe( 'editing pipeline conversion', () => {
		it( 'should convert attribute', () => {
			setModelData( doc, '<paragraph><$text code="true">foo</$text>bar</paragraph>' );

			expect( getViewData( editor.editing.view, { withoutSelection: true } ) ).to.equal( '<p><code>foo</code>bar</p>' );
		} );
	} );
} );
