/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import ClassicEditorUIView from '../src/classiceditoruiview';
import EditingView from '@ckeditor/ckeditor5-engine/src/view/view';
import StickyPanelView from '@ckeditor/ckeditor5-ui/src/panel/sticky/stickypanelview';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import Locale from '@ckeditor/ckeditor5-utils/src/locale';
import createRoot from '@ckeditor/ckeditor5-engine/tests/view/_utils/createroot.js';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

describe( 'ClassicEditorUIView', () => {
	let locale, view, editingView, editingViewRoot;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		locale = new Locale();
		editingView = new EditingView();
		editingViewRoot = createRoot( editingView.document );
		view = new ClassicEditorUIView( locale, editingView );
		view.editable.name = editingViewRoot.rootName;
		view.render();
	} );

	afterEach( () => {
		view.destroy();
	} );

	describe( 'constructor()', () => {
		describe( '#stickyPanel', () => {
			it( 'is created', () => {
				expect( view.stickyPanel ).to.be.instanceof( StickyPanelView );
			} );

			it( 'is given a locate object', () => {
				expect( view.stickyPanel.locale ).to.equal( locale );
			} );

			it( 'is put into the "top" collection', () => {
				expect( view.top.get( 0 ) ).to.equal( view.stickyPanel );
			} );
		} );

		describe( '#toolbar', () => {
			it( 'is created', () => {
				expect( view.toolbar ).to.be.instanceof( ToolbarView );
			} );

			it( 'is given a locate object', () => {
				expect( view.toolbar.locale ).to.equal( locale );
			} );

			it( 'is put into the "stickyPanel.content" collection', () => {
				expect( view.stickyPanel.content.get( 0 ) ).to.equal( view.toolbar );
			} );

			describe( 'automatic items grouping', () => {
				it( 'should be disabled by default', () => {
					expect( view.toolbar.options.shouldGroupWhenFull ).to.be.undefined;
				} );

				it( 'should be controlled via options.shouldToolbarGroupWhenFull', () => {
					const locale = new Locale();
					const editingView = new EditingView();
					const editingViewRoot = createRoot( editingView.document );
					const view = new ClassicEditorUIView( locale, editingView, {
						shouldToolbarGroupWhenFull: true
					} );

					view.editable.name = editingViewRoot.rootName;
					view.render();

					expect( view.toolbar.options.shouldGroupWhenFull ).to.be.true;

					return view.destroy();
				} );
			} );
		} );

		describe( '#editable', () => {
			it( 'is created', () => {
				expect( view.editable ).to.be.instanceof( InlineEditableUIView );
			} );

			it( 'is given a locate object', () => {
				expect( view.editable.locale ).to.equal( locale );
			} );

			it( 'is put into the "main" collection', () => {
				expect( view.main.get( 0 ) ).to.equal( view.editable );
			} );
		} );
	} );
} );
