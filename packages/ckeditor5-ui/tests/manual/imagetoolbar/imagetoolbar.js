/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, document, console:false */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import ClickObserver from '@ckeditor/ckeditor5-engine/src/view/observer/clickobserver';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Undo from '@ckeditor/ckeditor5-undo/src/undo';
import Image from '@ckeditor/ckeditor5-image/src/image';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';

import Template from '../../../src/template';
import ToolbarView from '../../../src/toolbar/toolbarview';
import BalloonPanelView from '../../../src/panel/balloon/balloonpanelview';

ClassicEditor
	.create( document.querySelector( '#editor' ), {
		plugins: [ Enter, Typing, Paragraph, Undo, Bold, Italic, Image ],
		toolbar: [ 'bold', 'italic', 'undo', 'redo' ]
	} )
	.then( editor => {
		createImageToolbar( editor );

		window.editor = editor;
	} )
	.catch( err => {
		console.error( err.stack );
	} );

function createImageToolbar( editor ) {
	// Create a plain toolbar instance.
	const toolbar = new ToolbarView();

	// Create a BalloonPanelView instance.
	const panel = new BalloonPanelView( editor.locale );

	Template.extend( panel.template, {
		attributes: {
			class: [
				'ck-toolbar-container',
			]
		}
	} );

	// Putting the toolbar inside of the balloon panel.
	panel.content.add( toolbar );

	editor.ui.view.body.add( panel ).then( () => {
		const editingView = editor.editing.view;

		// Fill the toolbar with some buttons. Simply copy default editor toolbar.
		toolbar.fillFromConfig( editor.config.get( 'toolbar' ), editor.ui.componentFactory );

		// Let the focusTracker know about new focusable UI element.
		editor.ui.focusTracker.add( panel.element );

		// Hide the panel when editor loses focus but no the other way around.
		panel.listenTo( editor.ui.focusTracker, 'change:isFocused', ( evt, name, is, was ) => {
			if ( was && !is ) {
				panel.hide();
			}
		} );

		editingView.addObserver( ClickObserver );

		// Check if the toolbar should be displayed each time the user clicked in editable.
		editor.listenTo( editingView, 'click', () => {
			if ( editingView.selection.isFake ) {
				attachToolbar();

				// TODO: These 2 need interval–based event debouncing for performance
				// reasons. I guess even lodash offers such a helper.
				editor.ui.view.listenTo( window, 'scroll', attachToolbar );
				editor.ui.view.listenTo( window, 'resize', attachToolbar );
			} else {
				panel.hide();

				editor.ui.view.stopListening( window, 'scroll', attachToolbar );
				editor.ui.view.stopListening( window, 'resize', attachToolbar );
			}
		} );

		function attachToolbar() {
			const defaultPositions = BalloonPanelView.defaultPositions;

			panel.attachTo( {
				target: editingView.domConverter.viewRangeToDom( editingView.selection.getFirstRange() ),
				positions: [ defaultPositions.northArrowSouth, defaultPositions.southArrowNorth ]
			} );
		}
	} );
}
