/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagetoolbar
 */

/* globals window */

import Plugin from '../core/plugin.js';
import ToolbarView from '../ui/toolbar/toolbarview.js';
import BalloonPanelView from '../ui/balloonpanel/balloonpanelview.js';
import Template from '../ui/template.js';
import ClickObserver from 'ckeditor5/engine/view/observer/clickobserver.js';
import { isImageWidget } from './utils.js';

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

export default class ImageToolbar extends Plugin {
	init() {
		const editor = this.editor;

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

		return editor.ui.view.body.add( panel ).then( () => {
			const editingView = editor.editing.view;
			const toolbarConfig = editor.config.get( 'image.toolbar' );
			const promises = [];

			if ( toolbarConfig ) {
				for ( let name of toolbarConfig ) {
					promises.push( toolbar.items.add( editor.ui.componentFactory.create( name ) ) );
				}
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

			// Check if the toolbar should be displayed each time view is rendered.
			editor.listenTo( editingView, 'render', () => {
				const selectedElement = editingView.selection.getSelectedElement();

				if ( selectedElement && isImageWidget( selectedElement ) ) {
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
			}, { priority: 'low' } );

			function attachToolbar() {
				panel.attachTo( {
					target: editingView.domConverter.viewRangeToDom( editingView.selection.getFirstRange() ),
					positions: [ positions.north, positions.south ]
				} );
			}

			return Promise.all( promises );
		} );
	}
}
