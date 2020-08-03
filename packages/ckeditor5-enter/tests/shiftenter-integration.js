/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import LinkEditing from '@ckeditor/ckeditor5-link/src/linkediting';
import Delete from '@ckeditor/ckeditor5-typing/src/delete';
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import ShiftEnter from '../src/shiftenter';

import { getData as getModelData, setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

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
		expect( getModelData( model, options ) ).to.equal( '<paragraph>First line.<softBreak></softBreak>Second line.</paragraph>' );
		expect( getViewData( editor.editing.view, options ) ).to.equal( '<p>First line.<br></br>Second line.</p>' );
	} );

	it( 'BLOCK_FILLER should be inserted after <br> in the paragraph', () => {
		setModelData( model, '<paragraph>[]</paragraph>' );

		editor.execute( 'shiftEnter' );

		expect( editor.getData( { trim: 'none' } ) ).to.equal( '<p><br>&nbsp;</p>' );
		expect( editor.ui.view.editable.element.innerHTML ).to.equal( '<p><br><br data-cke-filler="true"></p>' );
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
} );
