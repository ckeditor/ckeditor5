/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor.js';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import ClassicEditorHandler from '../../src/handlers/classiceditor.js';
import RevisionHistoryMock from '../_utils/revisionhistorymock.js';

describe( 'ClassicEditorHandler', () => {
	let classicEditorHandler, domElement, editor;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await ClassicEditor.create( domElement, {
			plugins: [
				Paragraph,
				Essentials
			]
		} );

		classicEditorHandler = new ClassicEditorHandler( editor );
	} );

	afterEach( () => {
		classicEditorHandler.getContainer().remove();
		domElement.remove();

		return editor.destroy();
	} );

	describe( 'constructor', () => {
		it( 'should set the editor instance as a property', () => {
			expect( classicEditorHandler._editor ).to.be.instanceOf( ClassicEditor );
		} );
	} );

	describe( '#enable()', () => {
		it( 'should move the editable and toolbar to the fullscreen container', () => {
			classicEditorHandler.enable();

			expect( classicEditorHandler.getContainer().querySelector( '[data-ck-fullscreen=editable]' ).children[ 0 ] )
				.to.equal( editor.editing.view.getDomRoot() );
			expect( classicEditorHandler.getContainer().querySelector( '[data-ck-fullscreen=toolbar]' ).children[ 0 ] )
				.to.equal( editor.ui.view.toolbar.element );
		} );

		it( 'should set [dir] attribute on the fullscreen container', () => {
			classicEditorHandler.enable();

			expect( classicEditorHandler.getContainer().getAttribute( 'dir' ) ).to.equal( editor.ui.view.element.getAttribute( 'dir' ) );
		} );

		it( 'should move menu bar if it is present', async () => {
			const tempDomElement = global.document.createElement( 'div' );
			global.document.body.appendChild( tempDomElement );

			const tempEditor = await ClassicEditor.create( tempDomElement, {
				plugins: [
					Paragraph,
					Essentials
				],
				menuBar: {
					isVisible: true
				},
				fullscreen: {
					menuBar: {
						isVisible: true
					}
				}
			} );

			const tempClassicEditorHandler = new ClassicEditorHandler( tempEditor );

			tempClassicEditorHandler.enable();

			expect( tempClassicEditorHandler.getContainer().querySelector( '[data-ck-fullscreen=menu-bar]' ).children[ 0 ] )
				.to.equal( tempEditor.ui.view.menuBarView.element );

			tempDomElement.remove();
			return tempEditor.destroy();
		} );
	} );

	describe( '#disable()', () => {
		it( 'should call #returnMovedElements()', () => {
			const spy = sinon.spy( classicEditorHandler, 'returnMovedElements' );

			classicEditorHandler.disable();

			expect( spy ).to.have.been.calledOnce;
		} );
	} );

	describe( 'with Revision history plugin', () => {
		let domElementForRevisionHistory, editorWithRevisionHistory;

		beforeEach( async () => {
			domElementForRevisionHistory = global.document.createElement( 'div' );
			global.document.body.appendChild( domElementForRevisionHistory );

			editorWithRevisionHistory = await ClassicEditor.create( domElementForRevisionHistory, {
				plugins: [
					Paragraph,
					Essentials,
					RevisionHistoryMock
				]
			} );

			classicEditorHandler = new ClassicEditorHandler( editorWithRevisionHistory );
		} );

		afterEach( async () => {
			classicEditorHandler.disable();
			domElementForRevisionHistory.remove();

			return editorWithRevisionHistory.destroy();
		} );

		it( 'should override default RH callbacks when fullscreen mode is enabled', () => {
			const spy = sinon.spy( classicEditorHandler, '_overrideRevisionHistoryCallbacks' );

			expect( editorWithRevisionHistory.config.get( 'revisionHistory.showRevisionViewerCallback' ) ).to.equal(
				RevisionHistoryMock.showRevisionViewerCallback
			);
			expect( editorWithRevisionHistory.config.get( 'revisionHistory.showRevisionViewerCallback' ) ).to.equal(
				RevisionHistoryMock.showRevisionViewerCallback
			);

			classicEditorHandler.enable();

			expect( editorWithRevisionHistory.config.get( 'revisionHistory.closeRevisionViewerCallback' ) ).to.not.equal(
				RevisionHistoryMock.closeRevisionViewerCallback
			);
			expect( editorWithRevisionHistory.config.get( 'revisionHistory.closeRevisionViewerCallback' ) ).to.not.equal(
				RevisionHistoryMock.closeRevisionViewerCallback
			);

			expect( spy ).to.have.been.calledOnce;
		} );

		it( 'should restore default RH callbacks when fullscreen mode is disabled', () => {
			const spy = sinon.spy( classicEditorHandler, '_restoreRevisionHistoryCallbacks' );

			classicEditorHandler.enable();
			classicEditorHandler.disable();

			expect( spy ).to.have.been.calledOnce;
		} );
	} );
} );
