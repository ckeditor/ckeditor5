/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { ClassicEditor } from '@ckeditor/ckeditor5-editor-classic';
import { Paragraph } from '@ckeditor/ckeditor5-paragraph';
import { LinkEditing } from '@ckeditor/ckeditor5-link';
import { Delete } from '@ckeditor/ckeditor5-typing';
import { BoldEditing } from '@ckeditor/ckeditor5-basic-styles';
import { ShiftEnter } from '../src/shiftenter.js';
import { _VIEW_INLINE_FILLER, _getModelData, _setModelData, _getViewData } from '@ckeditor/ckeditor5-engine';

describe( 'ShiftEnter integration', () => {
	let editor, model, div;

	const options = { withoutSelection: true };

	beforeEach( () => {
		div = document.createElement( 'div' );
		div.innerHTML = '<p>First line.<br>Second line.</p>';

		document.body.appendChild( div );

		return ClassicEditor.create( div, { plugins: [ Paragraph, ShiftEnter, LinkEditing, Delete, BoldEditing ] } )
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
		expect( _getModelData( model, options ) ).to.equal( '<paragraph>First line.<softBreak></softBreak>Second line.</paragraph>' );
		expect( _getViewData( editor.editing.view, options ) ).to.equal( '<p>First line.<br></br>Second line.</p>' );
	} );

	it( 'BLOCK_FILLER should be inserted after <br> in the paragraph (data pipeline)', () => {
		_setModelData( model, '<paragraph>[]</paragraph>' );

		editor.execute( 'shiftEnter' );

		expect( editor.getData( { trim: 'none' } ) ).to.equal( '<p><br>&nbsp;</p>' );
	} );

	it( 'INLINE_FILLER should be inserted before last <br> (BLOCK_FILLER) in the paragraph (editing pipeline)', () => {
		_setModelData( model, '<paragraph>[]</paragraph>' );

		editor.execute( 'shiftEnter' );

		expect( editor.ui.view.editable.element.innerHTML ).to.equal(
			`<p><br>${ _VIEW_INLINE_FILLER }<br data-cke-filler="true"></p>`
		);
	} );

	it( 'should not inherit text attributes before the "softBreak" element', () => {
		_setModelData( model,
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
} );
