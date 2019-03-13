/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* global window, document */

import ClassicTestEditor from '@ckeditor/ckeditor5-core/tests/_utils/classictesteditor';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import BalloonPanelView from '@ckeditor/ckeditor5-ui/src/panel/balloon/balloonpanelview';

import testUtils from '@ckeditor/ckeditor5-core/tests/_utils/utils';

import MentionUI from '../src/mentionui';
import MentionEditing from '../src/mentionediting';
import MentionsView from '../src/ui/mentionsview';

describe( 'BalloonToolbar', () => {
	let editor, editingView, mentionUI, editorElement;

	testUtils.createSinonSandbox();

	beforeEach( () => {
		editorElement = document.createElement( 'div' );
		document.body.appendChild( editorElement );

		return ClassicTestEditor
			.create( editorElement, {
				plugins: [ Paragraph, MentionEditing, MentionUI ]
			} )
			.then( newEditor => {
				editor = newEditor;
				editingView = editor.editing.view;
				mentionUI = editor.plugins.get( MentionUI );

				editingView.attachDomRoot( editorElement );

				// Focus the engine.
				editingView.document.isFocused = true;
				editingView.getDomRoot().focus();

				// Remove all selection ranges from DOM before testing.
				window.getSelection().removeAllRanges();
			} );
	} );

	afterEach( () => {
		sinon.restore();
		editorElement.remove();

		return editor.destroy();
	} );

	it( 'should create a plugin instance', () => {
		expect( mentionUI ).to.instanceOf( Plugin );
		expect( mentionUI ).to.instanceOf( MentionUI );
	} );

	describe( 'pluginName', () => {
		it( 'should return plugin by its name', () => {
			expect( editor.plugins.get( 'MentionUI' ) ).to.equal( mentionUI );
		} );
	} );

	describe( 'child views', () => {
		describe( 'panelView', () => {
			it( 'should create a view instance', () => {
				expect( mentionUI.panelView ).to.instanceof( BalloonPanelView );
			} );

			it( 'should be added to the ui.view.body collection', () => {
				expect( Array.from( editor.ui.view.body ) ).to.include( mentionUI.panelView );
			} );

			it( 'should have disabled arrow', () => {
				expect( mentionUI.panelView.withArrow ).to.be.false;
			} );

			it( 'should have added MentionView as a child', () => {
				expect( mentionUI.panelView.content.get( 0 ) ).to.be.instanceof( MentionsView );
			} );
		} );
	} );
} );
