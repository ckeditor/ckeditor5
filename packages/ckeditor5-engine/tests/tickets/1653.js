/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';

describe( 'Bug ckeditor5-engine#1653', () => {
	it( '`DataController.parse()` should not fire `editing.view#render`', () => {
		let editor;

		const element = document.createElement( 'div' );
		document.body.appendChild( element );

		return ClassicTestEditor
			.create( element, { plugins: [ Paragraph ] } )
			.then( newEditor => {
				editor = newEditor;

				const editingViewSpy = sinon.spy();

				editor.editing.view.on( 'fire', editingViewSpy );
				editor.data.parse( '<p></p>' );

				sinon.assert.notCalled( editingViewSpy );
			} )
			.then( () => {
				element.remove();

				return editor.destroy();
			} );
	} );
} );
