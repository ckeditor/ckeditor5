/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

import BalloonEditorUIView from '../src/ballooneditoruiview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';
import log from '@ckeditor/ckeditor5-utils/src/log';

describe( 'BalloonEditorUIView', () => {
	let locale, view;

	testUtils.createSinonSandbox();

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

			it( 'is not rendered', () => {
				expect( view.editable.isRendered ).to.be.false;
			} );
		} );
	} );

	describe( 'render()', () => {
		it( 'editable is registered as a child', () => {
			const spy = sinon.spy( view.editable, 'destroy' );

			view.render();
			view.destroy();
			sinon.assert.calledOnce( spy );
		} );
	} );

	describe( 'editableElement', () => {
		it( 'returns editable\'s view element', () => {
			testUtils.sinon.stub( log, 'warn' ).callsFake( () => {} );

			view.render();
			expect( view.editableElement.getAttribute( 'contentEditable' ) ).to.equal( 'true' );
			view.destroy();
		} );
	} );
} );
