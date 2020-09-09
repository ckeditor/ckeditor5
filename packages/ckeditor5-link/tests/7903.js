/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import Link from '../src/link';

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import ItalicEditing from '@ckeditor/ckeditor5-basic-styles/src/italic/italicediting';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import ImageEditing from '@ckeditor/ckeditor5-image/src/image/imageediting';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

import '@ckeditor/ckeditor5-core/tests/_utils/assertions/attribute';

/* global document, setTimeout */

describe( 'Regression 7903', () => {
	let element, editor;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ Paragraph, Link, Enter, ItalicEditing, ImageEditing, Undo ]
		} );
	} );

	afterEach( async () => {
		await editor.destroy();
	} );

	it( 'should not crash', done => {
		setModelData( editor.model,
			'<paragraph>' +
			'[]' +
			'</paragraph>'
		);

		editor.ui.getEditableElement().focus();

		setTimeout( () => {
			simulateExternalInsertText( 'foobar' );
			// simulateExternalInsertText( 'foobar' );
			setTimeout( () => {
				editor.plugins.get( 'LinkUI' )._showUI( true );
				setTimeout( () => {
					document.execCommand( 'undo' );

					setTimeout( done, 2000 );
				} );
			}, 200 );
		}, 200 );
	} );

	function simulateExternalInsertText( text ) {
		document.execCommand( 'insertText', false, text );

		// Undo&redo to force undo snapshot in browser's contenteditable handler.
		document.execCommand( 'undo' );
		document.execCommand( 'redo' );
	}
} );
