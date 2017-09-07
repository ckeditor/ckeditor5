/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import BalloonEditorUIView from '../src/ballooneditoruiview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';

describe( 'BalloonEditorUIView', () => {
	let locale, view;

	beforeEach( () => {
		locale = new Locale( 'en' );
		view = new BalloonEditorUIView( locale );
	} );

	describe( 'constructor()', () => {
		describe( '#editable', () => {
			it( 'is created', () => {
				expect( view.editable ).to.be.instanceof( InlineEditableUIView );
			} );

			it( 'is given a locate object', () => {
				expect( view.editable.locale ).to.equal( locale );
			} );

			it( 'is registered as a child', () => {
				const spy = sinon.spy( view.editable, 'destroy' );

				view.init();
				view.destroy();
				sinon.assert.calledOnce( spy );
			} );
		} );
	} );

	describe( 'editableElement', () => {
		it( 'returns editable\'s view element', () => {
			view.init();
			expect( view.editableElement.getAttribute( 'contentEditable' ) ).to.equal( 'true' );
			view.destroy();
		} );
	} );
} );
