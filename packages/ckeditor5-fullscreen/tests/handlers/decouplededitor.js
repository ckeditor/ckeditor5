/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials.js';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph.js';
import { DecoupledEditor } from '@ckeditor/ckeditor5-editor-decoupled';
import global from '@ckeditor/ckeditor5-utils/src/dom/global.js';

import DecoupledEditorHandler from '../../src/handlers/decouplededitor.js';
import RevisionHistoryMock from '../_utils/revisionhistorymock.js';

describe( 'DecoupledEditorHandler', () => {
	let decoupledEditorHandler, domElement, editor;

	beforeEach( async () => {
		domElement = global.document.createElement( 'div' );
		global.document.body.appendChild( domElement );

		editor = await DecoupledEditor.create( domElement, {
			plugins: [
				Paragraph,
				Essentials
			],
			fullscreen: {
				menuBar: {
					isVisible: true
				}
			}
		} );

		decoupledEditorHandler = new DecoupledEditorHandler( editor );
	} );

	afterEach( () => {
		decoupledEditorHandler.disable();
		domElement.remove();

		return editor.destroy();
	} );

	describe( 'constructor', () => {
		it( 'should set the editor instance as a property', () => {
			expect( decoupledEditorHandler._editor ).to.be.instanceOf( DecoupledEditor );
		} );
	} );

	describe( '#enable()', () => {
		it( 'should move the editable, toolbar and menu bar to the fullscreen container', () => {
			decoupledEditorHandler.enable();

			expect( decoupledEditorHandler.getContainer().querySelector( '[data-ck-fullscreen=editable]' ).children[ 0 ] )
				.to.equal( editor.editing.view.getDomRoot() );
			expect( decoupledEditorHandler.getContainer().querySelector( '[data-ck-fullscreen=toolbar]' ).children[ 0 ] )
				.to.equal( editor.ui.view.toolbar.element );
			expect( decoupledEditorHandler.getContainer().querySelector( '[data-ck-fullscreen=menu-bar]' ).children[ 0 ] )
				.to.equal( editor.ui.view.menuBarView.element );
		} );
	} );

	describe( '#disable()', () => {
		it( 'should call #returnMovedElements()', () => {
			const spy = sinon.spy( decoupledEditorHandler, 'returnMovedElements' );

			decoupledEditorHandler.disable();

			expect( spy ).to.have.been.calledOnce;
		} );
	} );

	describe( 'with Revision history plugin', () => {
		let domElementForRevisionHistory, editorWithRevisionHistory;

		beforeEach( async () => {
			domElementForRevisionHistory = global.document.createElement( 'div' );
			global.document.body.appendChild( domElementForRevisionHistory );

			editorWithRevisionHistory = await DecoupledEditor.create( domElementForRevisionHistory, {
				plugins: [
					Paragraph,
					Essentials,
					RevisionHistoryMock
				]
			} );

			decoupledEditorHandler = new DecoupledEditorHandler( editorWithRevisionHistory );
		} );

		afterEach( async () => {
			decoupledEditorHandler.disable();
			domElementForRevisionHistory.remove();

			return editorWithRevisionHistory.destroy();
		} );

		it( 'should override default RH callbacks when fullscreen mode is enabled', () => {
			const spy = sinon.spy( decoupledEditorHandler, '_overrideRevisionHistoryCallbacks' );

			expect( editorWithRevisionHistory.config.get( 'revisionHistory.showRevisionViewerCallback' ) ).to.equal(
				RevisionHistoryMock.showRevisionViewerCallback
			);
			expect( editorWithRevisionHistory.config.get( 'revisionHistory.showRevisionViewerCallback' ) ).to.equal(
				RevisionHistoryMock.showRevisionViewerCallback
			);

			decoupledEditorHandler.enable();

			expect( editorWithRevisionHistory.config.get( 'revisionHistory.closeRevisionViewerCallback' ) ).to.not.equal(
				RevisionHistoryMock.closeRevisionViewerCallback
			);
			expect( editorWithRevisionHistory.config.get( 'revisionHistory.closeRevisionViewerCallback' ) ).to.not.equal(
				RevisionHistoryMock.closeRevisionViewerCallback
			);

			expect( spy ).to.have.been.calledOnce;
		} );

		it( 'should restore default RH callbacks when fullscreen mode is disabled', () => {
			const spy = sinon.spy( decoupledEditorHandler, '_restoreRevisionHistoryCallbacks' );

			decoupledEditorHandler.enable();
			decoupledEditorHandler.disable();

			expect( spy ).to.have.been.calledOnce;
		} );
	} );
} );
