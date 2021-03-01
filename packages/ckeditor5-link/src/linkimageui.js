/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/linkimageui
 */

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Image from '@ckeditor/ckeditor5-image/src/image';
import LinkUI from './linkui';
import LinkEditing from './linkediting';
import { isImageWidget } from '@ckeditor/ckeditor5-image/src/image/utils';
import { LINK_KEYSTROKE } from './utils';

import linkIcon from '../theme/icons/link.svg';

/**
 * The link image UI plugin.
 *
 * This plugin provides the `'linkImage'` button that can be displayed in the {@link module:image/imagetoolbar~ImageToolbar}.
 * It can be used to wrap images in links.
 *
 * @extends module:core/plugin~Plugin
 */
export default class LinkImageUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Image, LinkEditing, LinkUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'LinkImageUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;

		this.listenTo( viewDocument, 'click', ( evt, data ) => {
			const hasLink = isImageLinked( viewDocument.selection.getSelectedElement() );

			if ( hasLink ) {
				data.preventDefault();
			}
		} );

		this._createToolbarLinkImageButton();
	}

	/**
	 * Creates a `LinkImageUI` button view.
	 *
	 * Clicking this button shows a {@link module:link/linkui~LinkUI#_balloon} attached to the selection.
	 * When an image is already linked, the view shows {@link module:link/linkui~LinkUI#actionsView} or
	 * {@link module:link/linkui~LinkUI#formView} if it is not.
	 *
	 * @private
	 */
	_createToolbarLinkImageButton() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'linkImage', locale => {
			const button = new ButtonView( locale );
			const plugin = editor.plugins.get( 'LinkUI' );
			const linkCommand = editor.commands.get( 'link' );

			button.set( {
				isEnabled: true,
				label: t( 'Link image' ),
				icon: linkIcon,
				keystroke: LINK_KEYSTROKE,
				tooltip: true,
				isToggleable: true
			} );

			// Bind button to the command.
			button.bind( 'isEnabled' ).to( linkCommand, 'isEnabled' );
			button.bind( 'isOn' ).to( linkCommand, 'value', value => !!value );

			// Show the actionsView or formView (both from LinkUI) on button click depending on whether the image is linked already.
			this.listenTo( button, 'execute', () => {
				const hasLink = isImageLinked( editor.editing.view.document.selection.getSelectedElement() );

				if ( hasLink ) {
					plugin._addActionsView();
				} else {
					plugin._showUI( true );
				}
			} );

			return button;
		} );
	}
}

// A helper function that checks whether the element is a linked image.
//
// @param {module:engine/model/element~Element} element
// @returns {Boolean}
function isImageLinked( element ) {
	const isImage = element && isImageWidget( element );

	if ( !isImage ) {
		return false;
	}

	return element.getChild( 0 ).is( 'element', 'a' );
}
