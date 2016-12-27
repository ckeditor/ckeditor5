/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, document, console:false */

import ClassicEditor from 'ckeditor5-editor-classic/src/classic';
import ClickObserver from 'ckeditor5-engine/src/view/observer/clickobserver';
import Enter from 'ckeditor5-enter/src/enter';
import Typing from 'ckeditor5-typing/src/typing';
import Paragraph from 'ckeditor5-paragraph/src/paragraph';
import Undo from 'ckeditor5-undo/src/undo';
import Image from 'ckeditor5-image/src/image';
import Bold from 'ckeditor5-basic-styles/src/bold';
import Italic from 'ckeditor5-basic-styles/src/italic';

import Template from 'ckeditor5-ui/src/template';
import ToolbarView from 'ckeditor5-ui/src/toolbar/toolbarview';
import BalloonPanelView from 'ckeditor5-ui/src/balloonpanel/balloonpanelview';

const arrowVOffset = BalloonPanelView.arrowVerticalOffset;
const positions = {
	//          [text range]
	//                ^
	//       +-----------------+
	//       |     Balloon     |
	//       +-----------------+
	south: ( targetRect, balloonRect ) => ( {
		top: targetRect.bottom + arrowVOffset,
		left: targetRect.left + targetRect.width / 2 - balloonRect.width / 2,
		name: 's'
	} ),

	//	+-----------------+
	//	|     Balloon     |
	//	+-----------------+
	//	        V
	//	   [text range]
	north: ( targetRect, balloonRect ) => ( {
		top: targetRect.top - balloonRect.height - arrowVOffset,
		left: targetRect.left + targetRect.width / 2 - balloonRect.width / 2,
		name: 'n'
	} )
};

ClassicEditor.create( document.querySelector( '#editor' ), {
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
				'ck-toolbar__container',
			]
		}
	} );

	// Putting the toolbar inside of the balloon panel.
	panel.content.add( toolbar );

	editor.ui.view.body.add( panel ).then( () => {
		const editingView = editor.editing.view;

		// Fill the toolbar with some buttons. Simply copy default editor toolbar.
		for ( let name of editor.config.get( 'toolbar' ) ) {
			toolbar.items.add( editor.ui.componentFactory.create( name ) );
		}

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
			panel.attachTo( {
				target: editingView.domConverter.viewRangeToDom( editingView.selection.getFirstRange() ),
				positions: [ positions.north, positions.south ]
			} );
		}
	} );
}
