/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting.js';
import Delete from '@ckeditor/ckeditor5-typing/src/delete.js';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting.js';
import BlockQuote from '@ckeditor/ckeditor5-block-quote/src/blockquote.js';
import Heading from '@ckeditor/ckeditor5-heading/src/heading.js';
import ShiftEnter from '../src/shiftenter.js';
import { INLINE_FILLER } from '@ckeditor/ckeditor5-engine/src/view/filler.js';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model.js';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view.js';

describe( 'ShiftEnter integration', () => {
	let editor, model, div;

	const options = { withoutSelection: true };

	beforeEach( () => {
		div = document.createElement( 'div' );
		div.innerHTML = '<p>First line.<br>Second line.</p>';

		document.body.appendChild( div );

		return ClassicEditor.create( div, { plugins: [ Paragraph, ShiftEnter, LinkEditing, Delete, BoldEditing, Heading, BlockQuote ] } )
			.then( newEditor => {
				editor = newEditor;

				model = editor.model;
			} );
	} );

	afterEach( () => {
		div.remove();

		return editor.destroy();
	} );

	it( 'loads correct data', () => {
		expect( getModelData( model, options ) ).to.equal( '<paragraph>First line.<softBreak></softBreak>Second line.</paragraph>' );
		expect( getViewData( editor.editing.view, options ) ).to.equal( '<p>First line.<br></br>Second line.</p>' );
	} );

	it( 'BLOCK_FILLER should be inserted after <br> in the paragraph (data pipeline)', () => {
		setModelData( model, '<paragraph>[]</paragraph>' );

		editor.execute( 'shiftEnter' );

		expect( editor.getData( { trim: 'none' } ) ).to.equal( '<p><br>&nbsp;</p>' );
	} );

	it( 'INLINE_FILLER should be inserted before last <br> (BLOCK_FILLER) in the paragraph (editing pipeline)', () => {
		setModelData( model, '<paragraph>[]</paragraph>' );

		editor.execute( 'shiftEnter' );

		expect( editor.ui.view.editable.element.innerHTML ).to.equal(
			`<p><br>${ INLINE_FILLER }<br data-cke-filler="true"></p>`
		);
	} );

	it( 'should not inherit text attributes before the "softBreak" element', () => {
		setModelData( model,
			'<paragraph>' +
				'<$text linkHref="foo" bold="true">Bolded link</$text>' +
				'<softBreak></softBreak>' +
				'F[]' +
			'</paragraph>'
		);

		editor.execute( 'delete' );

		const selection = model.document.selection;

		expect( selection.hasAttribute( 'linkHref' ) ).to.equal( false );
		expect( selection.hasAttribute( 'bold' ) ).to.equal( false );
	} );

	describe( 'stripping redundant BR-s', () => {
		beforeEach( () => {
			model.schema.extend( 'softBreak', { allowAttributesOf: '$text' } );

			editor.conversion.for( 'upcast' ).elementToElement( {
				view: 'br',
				model: ( viewElement, { consumable } ) => {
					expect( consumable.test( viewElement, { name: true } ) ).to.be.false;
				},
				converterPriority: 'low'
			} );
		} );

		it( 'should convert BR inside text in paragraph', () => {
			editor.setData( '<p>foo<br>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>foo<softBreak></softBreak>bar</paragraph>'
			);
			expect( editor.getData() ).to.equalMarkup(
				'<p>foo<br>bar</p>'
			);
		} );

		it( 'should convert BR inside text in paragraph (inside bold)', () => {
			editor.setData( '<p><strong>foo<br>bar</strong></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>' +
					'<$text bold="true">foo</$text>' +
					'<softBreak bold="true"></softBreak>' +
					'<$text bold="true">bar</$text>' +
				'</paragraph>'
			);
			expect( editor.getData() ).to.equalMarkup(
				'<p><strong>foo<br>bar</strong></p>'
			);
		} );

		it( 'should convert multiple BRs inside text in paragraph', () => {
			editor.setData( '<p>foo<br><br>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>foo<softBreak></softBreak><softBreak></softBreak>bar</paragraph>'
			);
			expect( editor.getData() ).to.equalMarkup(
				'<p>foo<br><br>bar</p>'
			);
		} );

		it( 'should convert multiple BRs inside text in paragraph (inside bold)', () => {
			editor.setData( '<p><strong>foo<br><br></strong>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>' +
					'<$text bold="true">foo</$text>' +
					'<softBreak bold="true"></softBreak>' +
					'<softBreak bold="true"></softBreak>' +
					'bar' +
				'</paragraph>'
			);
			expect( editor.getData() ).to.equalMarkup(
				'<p><strong>foo<br><br></strong>bar</p>'
			);
		} );

		it( 'should convert multiple BRs inside text (outside paragraph)', () => {
			editor.setData( 'foo<br><br>bar' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>foo<softBreak></softBreak><softBreak></softBreak>bar</paragraph>'
			);
			expect( editor.getData() ).to.equalMarkup(
				'<p>foo<br><br>bar</p>'
			);
		} );

		it( 'should convert multiple BRs inside text (outside paragraph, inside bold)', () => {
			editor.setData( 'f<strong>oo<br><br>ba</strong>r' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>' +
					'f<$text bold="true">oo</$text>' +
					'<softBreak bold="true"></softBreak>' +
					'<softBreak bold="true"></softBreak>' +
					'<$text bold="true">ba</$text>r' +
				'</paragraph>'
			);
			expect( editor.getData() ).to.equalMarkup(
				'<p>f<strong>oo<br><br>ba</strong>r</p>'
			);
		} );

		it( 'should convert BR at the beginning of text in paragraph', () => {
			editor.setData( '<p><br>foo</p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph><softBreak></softBreak>foo</paragraph>'
			);
			expect( editor.getData() ).to.equalMarkup(
				'<p><br>foo</p>'
			);
		} );

		it( 'should convert BR at the beginning of text in paragraph (inside bold)', () => {
			editor.setData( '<p><strong><br>foo</strong></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph><softBreak bold="true"></softBreak><$text bold="true">foo</$text></paragraph>'
			);
			expect( editor.getData() ).to.equalMarkup(
				'<p><strong><br>foo</strong></p>'
			);
		} );

		it( 'should convert BR at the beginning of text (outside paragraph)', () => {
			editor.setData( '<br>foo' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph><softBreak></softBreak>foo</paragraph>'
			);
			expect( editor.getData() ).to.equalMarkup(
				'<p><br>foo</p>'
			);
		} );

		it( 'should convert BR at the beginning of text (outside paragraph, inside bold)', () => {
			editor.setData( '<strong><br>foo</strong>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph><softBreak bold="true"></softBreak><$text bold="true">foo</$text></paragraph>'
			);
			expect( editor.getData() ).to.equalMarkup(
				'<p><strong><br>foo</strong></p>'
			);
		} );

		it( 'should convert BR before a paragraph to a paragraph', () => {
			editor.setData( '<br><p>foo</p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph></paragraph><paragraph>foo</paragraph>'
			);
			expect( editor.getData() ).to.equalMarkup(
				'<p>&nbsp;</p><p>foo</p>'
			);
		} );

		it( 'should convert BR after a paragraph to a paragraph', () => {
			editor.setData( '<p>foo</p><br>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>foo</paragraph><paragraph></paragraph>'
			);
			expect( editor.getData() ).to.equalMarkup(
				'<p>foo</p><p>&nbsp;</p>'
			);
		} );

		it( 'should convert BR after a block to a paragraph (after first plain text of block-quote auto-paragraphed)', () => {
			editor.setData( '<blockquote>foo<h2>bar</h2><br></blockquote>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<blockQuote><paragraph>foo</paragraph><heading1>bar</heading1><paragraph></paragraph></blockQuote>'
			);
			expect( editor.getData() ).to.equalMarkup(
				'<blockquote><p>foo</p><h2>bar</h2><p>&nbsp;</p></blockquote>'
			);
		} );

		it( 'should convert BR after a heading to a paragraph', () => {
			editor.setData( '<h2>foo</h2><br>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<heading1>foo</heading1><paragraph></paragraph>'
			);
			expect( editor.getData() ).to.equalMarkup(
				'<h2>foo</h2><p>&nbsp;</p>'
			);
		} );

		it( 'should convert BR between paragraphs to a paragraph', () => {
			editor.setData( '<p>foo</p><br><p>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>foo</paragraph><paragraph></paragraph><paragraph>bar</paragraph>'
			);
			expect( editor.getData() ).to.equalMarkup(
				'<p>foo</p><p>&nbsp;</p><p>bar</p>'
			);
		} );

		it( 'should convert a single BR', () => {
			editor.setData( '<br>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph><softBreak></softBreak></paragraph>'
			);
			expect( editor.getData( { trim: 'none' } ) ).to.equalMarkup(
				'<p><br>&nbsp;</p>'
			);
		} );

		it( 'should ignore a BR if it is the only content of a block', () => {
			editor.setData( '<p><br></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph></paragraph>'
			);
			expect( editor.getData( { trim: 'none' } ) ).to.equalMarkup(
				'<p>&nbsp;</p>'
			);
		} );

		it( 'should ignore only the last BR if there are multiple BRs in a block', () => {
			editor.setData( '<p><br><br><br></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph><softBreak></softBreak><softBreak></softBreak></paragraph>'
			);
			expect( editor.getData( { trim: 'none' } ) ).to.equalMarkup(
				'<p><br><br>&nbsp;</p>'
			);
		} );

		it( 'should ignore a BR at the end of a block (paragraph)', () => {
			editor.setData( '<p>foo<br></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>foo</paragraph>'
			);
			expect( editor.getData( { trim: 'none' } ) ).to.equalMarkup(
				'<p>foo</p>'
			);
		} );

		it( 'should ignore a BR at the end of a block (heading)', () => {
			editor.setData( '<h2>foo<br></h2>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<heading1>foo</heading1>'
			);
			expect( editor.getData( { trim: 'none' } ) ).to.equalMarkup(
				'<h2>foo</h2>'
			);
		} );

		it( 'should ignore only the last BR in block', () => {
			editor.setData( '<p>foo<br><br></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>foo<softBreak></softBreak></paragraph>'
			);
			expect( editor.getData( { trim: 'none' } ) ).to.equalMarkup(
				'<p>foo<br>&nbsp;</p>'
			);
		} );

		it( 'should ignore only the last BR in block (multiple BRs)', () => {
			editor.setData( '<p>foo<br><br><br></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>foo<softBreak></softBreak><softBreak></softBreak></paragraph>'
			);
			expect( editor.getData( { trim: 'none' } ) ).to.equalMarkup(
				'<p>foo<br><br>&nbsp;</p>'
			);
		} );

		it( 'should ignore a BR before a block (paragraph)', () => {
			editor.setData( 'foo<br><p>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>foo</paragraph><paragraph>bar</paragraph>'
			);
			expect( editor.getData( { trim: 'none' } ) ).to.equalMarkup(
				'<p>foo</p><p>bar</p>'
			);
		} );

		it( 'should ignore a BR before a block (heading)', () => {
			editor.setData( 'foo<br><h2>bar</h2>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>foo</paragraph><heading1>bar</heading1>'
			);
			expect( editor.getData( { trim: 'none' } ) ).to.equalMarkup(
				'<p>foo</p><h2>bar</h2>'
			);
		} );

		it( 'should ignore a BR before a block (with blocks before)', () => {
			editor.setData( '<p>a</p>foo<br><p>bar</p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>a</paragraph><paragraph>foo</paragraph><paragraph>bar</paragraph>'
			);
			expect( editor.getData( { trim: 'none' } ) ).to.equalMarkup(
				'<p>a</p><p>foo</p><p>bar</p>'
			);
		} );

		it( 'should convert a BR with an NBSP at the end of content', () => {
			editor.setData( 'foo<br>&nbsp;' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>foo<softBreak></softBreak> </paragraph>'
			);
			expect( editor.getData( { trim: 'none' } ) ).to.equalMarkup(
				'<p>foo<br>&nbsp;</p>'
			);
		} );

		it( 'should convert a BR with an NBSP at the end of paragraph', () => {
			editor.setData( '<p>foo<br>&nbsp;</p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>foo<softBreak></softBreak> </paragraph>'
			);
			expect( editor.getData( { trim: 'none' } ) ).to.equalMarkup(
				'<p>foo<br>&nbsp;</p>'
			);
		} );

		it( 'should convert a BR with an inline object (img) at the end of paragraph', () => {
			model.schema.register( 'image', { inheritAllFrom: '$inlineObject' } );
			editor.conversion.elementToElement( { view: 'img', model: 'image' } );

			editor.setData( '<p>foo<br><img/></p>' );

			expect( getModelData( model, { withoutSelection: true } ) ).to.equalMarkup(
				'<paragraph>foo<softBreak></softBreak><image></image></paragraph>'
			);
			expect( editor.getData( { trim: 'none' } ) ).to.equalMarkup(
				'<p>foo<br><img></p>'
			);
		} );
	} );
} );
