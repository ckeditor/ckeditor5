/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';

import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import ShiftEnter from '../src/shiftenter';

import { getData as getModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';
import { getData as getViewData } from '@ckeditor/ckeditor5-engine/src/dev-utils/view';

describe( 'ShiftEnter integration', () => {
	let editor, model, div;

	beforeEach( () => {
		div = document.createElement( 'div' );
		div.innerHTML = '<p>First line.<br>Second line.</p>';

		document.body.appendChild( div );

		return ClassicEditor.create( div, { plugins: [ Paragraph, ShiftEnter ] } )
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
		const options = { withoutSelection: true };

		expect( getModelData( model, options ) ).to.equal( '<paragraph>First line.<softBreak></softBreak>Second line.</paragraph>' );
		expect( getViewData( editor.editing.view, options ) ).to.equal( '<p>First line.<br></br>Second line.</p>' );
	} );
} );
