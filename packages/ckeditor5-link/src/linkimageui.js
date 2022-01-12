/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/linkimageui
 */

import { ButtonView } from 'ckeditor5/src/ui';
import { Plugin } from 'ckeditor5/src/core';

import LinkUI from './linkui';
import LinkEditing from './linkediting';

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
		return [ LinkEditing, LinkUI, 'ImageBlockEditing' ];
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
			if ( this._isSelectedLinkedImage( editor.model.document.selection ) ) {
				// Prevent browser navigation when clicking a linked image.
				data.preventDefault();

				// Block the `LinkUI` plugin when an image was clicked.
				// In such a case, we'd like to display the image toolbar.
				evt.stop();
			}
		}, { priority: 'high' } );

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
				if ( this._isSelectedLinkedImage( editor.model.document.selection ) ) {
					plugin._addActionsView();
				} else {
					plugin._showUI( true );
				}
			} );

			return button;
		} );
	}

	/**
	 * Returns true if a linked image (either block or inline) is the only selected element
	 * in the model document.
	 *
	 * @private
	 * @param {module:engine/model/selection~Selection} selection
	 * @returns {Boolean}
	 */
	_isSelectedLinkedImage( selection ) {
		const selectedModelElement = selection.getSelectedElement();
		const imageUtils = this.editor.plugins.get( 'ImageUtils' );

		return imageUtils.isImage( selectedModelElement ) && selectedModelElement.hasAttribute( 'linkHref' );
	}
}
