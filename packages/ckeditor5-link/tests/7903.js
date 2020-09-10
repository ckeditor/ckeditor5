/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Input from '@ckeditor/ckeditor5-typing/src/input';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import { setData as setModelData } from '@ckeditor/ckeditor5-engine/src/dev-utils/model';

/* global document, setTimeout */

describe( 'Regression 7903', () => {
	const MARKER_NAME = 'marker-name';

	let element, editor;

	beforeEach( async () => {
		element = document.createElement( 'div' );
		document.body.appendChild( element );

		editor = await ClassicTestEditor.create( element, {
			plugins: [ Paragraph, Input ]
		} );

		editor.conversion.for( 'editingDowncast' ).markerToHighlight( {
			model: MARKER_NAME,
			view: {}
		} );

		editor.conversion.for( 'editingDowncast' ).markerToElement( {
			model: MARKER_NAME,
			view: {
				name: 'span'
			}
		} );
	} );

	afterEach( async () => {
		await editor.destroy();
		element.remove();
	} );

	it( 'should not crash', done => {
		setModelData( editor.model,
			'<paragraph>' +
			'[]' +
			'</paragraph>'
		);

		const model = editor.model;

		editor.ui.getEditableElement().focus();

		document.execCommand( 'insertText', false, 'foobar' );

		setTimeout( () => {
			model.change( writer => {
				writer.addMarker( MARKER_NAME, {
					usingOperation: false,
					affectsData: false,
					range: model.document.selection.getFirstRange()
				} );
			} );

			document.execCommand( 'undo' ); // undo causes a mutation, which triggers the exception

			setTimeout( done, 0 );
		}, 0 );
	} );
} );
