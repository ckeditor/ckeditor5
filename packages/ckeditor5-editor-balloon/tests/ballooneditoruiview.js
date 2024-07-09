/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import EditingView from '@ckeditor/ckeditor5-engine/src/view/view.js';
import BalloonEditorUIView from '../src/ballooneditoruiview.js';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview.js';
import MenuBarView from '@ckeditor/ckeditor5-ui/src/menubar/menubarview.js';
import Locale from '@ckeditor/ckeditor5-utils/src/locale.js';
import createRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils.js';

describe( 'BalloonEditorUIView', () => {
	let locale, view, editingView, editingViewRoot;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = new Locale();
		editingView = new EditingView();
		editingViewRoot = createRoot( editingView.document );
		view = new BalloonEditorUIView( locale, editingView );
		view.editable.name = editingViewRoot.rootName;
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

			it( 'is given an accessible aria label', () => {
				view.render();

				expect( editingViewRoot.getAttribute( 'aria-label' ) ).to.equal( 'Rich Text Editor. Editing area: main' );

				view.destroy();
			} );
		} );

		describe( '#menuBarView', () => {
			it( 'is created', () => {
				expect( view.menuBarView ).to.be.instanceof( MenuBarView );
			} );

			it( 'is given a locale object', () => {
				expect( view.menuBarView.locale ).to.equal( locale );
			} );

			it( 'is not rendered', () => {
				expect( view.menuBarView.isRendered ).to.be.false;
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
} );
