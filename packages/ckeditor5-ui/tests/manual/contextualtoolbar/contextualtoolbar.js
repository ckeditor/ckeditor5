/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals window, document, console:false */

import ClassicEditor from 'ckeditor5-editor-classic/src/classic';
import DomEventObserver from 'ckeditor5-engine/src/view/observer/domeventobserver';
import Enter from 'ckeditor5-enter/src/enter';
import Typing from 'ckeditor5-typing/src/typing';
import Paragraph from 'ckeditor5-paragraph/src/paragraph';
import Undo from 'ckeditor5-undo/src/undo';
import Bold from 'ckeditor5-basic-styles/src/bold';
import Italic from 'ckeditor5-basic-styles/src/italic';

import Template from 'ckeditor5-ui/src/template';
import ToolbarView from 'ckeditor5-ui/src/toolbar/toolbarview';
import BalloonPanelView from 'ckeditor5-ui/src/balloonpanel/balloonpanelview';

const arrowVOffset = BalloonPanelView.arrowVerticalOffset;
const positions = {
	//     [text range]
	//                ^
	//       +-----------------+
	//       |     Balloon     |
	//       +-----------------+
	forwardSelection: ( targetRect, balloonRect ) => ( {
		top: targetRect.bottom + arrowVOffset,
		left: targetRect.right - balloonRect.width / 2,
		name: 's'
	} ),

	//	+-----------------+
	//	|     Balloon     |
	//	+-----------------+
	//	        V
	//	        [text range]
	backwardSelection: ( targetRect, balloonRect ) => ( {
		top: targetRect.top - balloonRect.height - arrowVOffset,
		left: targetRect.left - balloonRect.width / 2,
		name: 'n'
	} )
};

ClassicEditor.create( document.querySelector( '#editor' ), {
	plugins: [ Enter, Typing, Paragraph, Undo, Bold, Italic ],
	toolbar: [ 'bold', 'italic', 'undo', 'redo' ]
} )
.then( editor => {
	createContextualToolbar( editor );
	window.editor = editor;
} )
.catch( err => {
	console.error( err.stack );
} );

function createContextualToolbar( editor ) {
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

		// Add "mouseup" event observer. It's enought to use ClickObserver in Chrome
		// but Firefox requires "mouseup" to work properly.
		editingView.addObserver( class extends DomEventObserver {
			get domEventType() {
				return [ 'mouseup' ];
			}

			onDomEvent( domEvent ) {
				this.fire( domEvent.type, domEvent );
			}
		} );

		// Position the panel each time the user clicked in editable.
		editor.listenTo( editingView, 'mouseup', () => {
			// This implementation assumes that only non–collapsed selections gets the contextual toolbar.
			if ( !editingView.selection.isCollapsed ) {
				const isBackward = editingView.selection.isBackward;

				// getBoundingClientRect() makes no sense when the selection spans across number
				// of lines of text. Using getClientRects() allows us to browse micro–ranges
				// that would normally make up the bounding client rect.
				const rangeRects = editingView.domConverter.viewRangeToDom( editingView.selection.getFirstRange() ).getClientRects();

				// Select the proper range rect depending on the direction of the selection.
				const rangeRect = isBackward ? rangeRects.item( 0 ) : rangeRects.item( rangeRects.length - 1 );

				panel.attachTo( {
					target: rangeRect,
					positions: [
						positions[ isBackward ? 'backwardSelection' : 'forwardSelection' ]
					]
				} );
			} else {
				panel.hide();
			}
		} );
	} );
}
