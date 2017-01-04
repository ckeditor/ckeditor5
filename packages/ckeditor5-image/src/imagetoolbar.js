/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagetoolbar
 */

import Plugin from 'ckeditor5-core/src/plugin';
import ToolbarView from 'ckeditor5-ui/src/toolbar/toolbarview';
import BalloonPanelView from 'ckeditor5-ui/src/balloonpanel/balloonpanelview';
import Template from 'ckeditor5-ui/src/template';
import { isImageWidget } from './utils';
import throttle from 'ckeditor5-utils/src/lib/lodash/throttle';
import global from 'ckeditor5-utils/src/dom/global';

const arrowVOffset = BalloonPanelView.arrowVerticalOffset;
const positions = {
	//	   [text range]
	//	        ^
	//	+-----------------+
	//	|     Balloon     |
	//	+-----------------+
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

/**
 * Image toolbar class. Creates image toolbar placed inside balloon panel that is showed when image widget is selected.
 * Toolbar components are created using editor's {@link module:ui/componentfactory~ComponentFactory ComponentFactory}
 * based on {@link module:core/editor/editor~Editor#config configuration} stored under `image.toolbar`.
 *
 * @extends module:core/plugin~Plugin.
 */
export default class ImageToolbar extends Plugin {
	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;
		const toolbarConfig = editor.config.get( 'image.toolbar' );

		// Don't add the toolbar if there is no configuration.
		if ( !toolbarConfig ) {
			return;
		}

		// Create a plain toolbar instance.
		const toolbar = new ToolbarView();

		// Create a BalloonPanelView instance.
		const panel = new BalloonPanelView( editor.locale );

		Template.extend( panel.template, {
			attributes: {
				class: [
					'ck-toolbar__container'
				]
			}
		} );

		// Putting the toolbar inside of the balloon panel.
		panel.content.add( toolbar );

		return editor.ui.view.body.add( panel ).then( () => {
			const editingView = editor.editing.view;
			const promises = [];

			for ( let name of toolbarConfig ) {
				promises.push( toolbar.items.add( editor.ui.componentFactory.create( name ) ) );
			}

			// Let the focusTracker know about new focusable UI element.
			editor.ui.focusTracker.add( panel.element );

			// Hide the panel when editor loses focus but no the other way around.
			panel.listenTo( editor.ui.focusTracker, 'change:isFocused', ( evt, name, is, was ) => {
				if ( was && !is ) {
					panel.hide();
				}
			} );

			const attachToolbarCallback = throttle( attachToolbar, 100 );

			// Check if the toolbar should be displayed each time view is rendered.
			editor.listenTo( editingView, 'render', () => {
				const selectedElement = editingView.selection.getSelectedElement();

				if ( selectedElement && isImageWidget( selectedElement ) ) {
					attachToolbar();

					editor.ui.view.listenTo( global.window, 'scroll', attachToolbarCallback );
					editor.ui.view.listenTo( global.window, 'resize', attachToolbarCallback );
				} else {
					panel.hide();

					editor.ui.view.stopListening( global.window, 'scroll', attachToolbarCallback );
					editor.ui.view.stopListening( global.window, 'resize', attachToolbarCallback );
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
