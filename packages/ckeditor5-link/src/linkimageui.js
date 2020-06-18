/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link/linkimageui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Image from '@ckeditor/ckeditor5-image/src/image';
import LinkUI from './linkui';
import LinkEditing from './linkediting';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';

import linkIcon from '../theme/icons/link.svg';

const linkKeystroke = 'Ctrl+K';

/**
 * The link image UI plugin.
 *
 * The feature simply allows to link an image.
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

		/**
		 * The plugin button view.
		 *
		 * @member {module:ui/button/buttonview~Button}
		 */
		this.linkButtonView = null;

		this.listenTo( viewDocument, 'click', ( evt, data ) => {
			const hasLink = this._isImageLinked( editor.model.document.selection.getSelectedElement() );

			if ( hasLink ) {
				data.preventDefault();
			}
		} );

		this._createToolbarLinkImageButton();
	}

	/**
	 * Creates a LinkImageUI button view.
	 * Clicking on the button shows a {@link module:link/linkui~LinkUI#_balloon} attached to the selection.
	 * When image is already linked, the view shows {@link module:link/linkui~LinkUI#actionsView} or
	 * {@link module:link/linkui~LinkUI#formView} if it's not.
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
				keystroke: linkKeystroke,
				tooltip: true,
				isToggleable: true
			} );

			// Bind button to the command.
			button.bind( 'isEnabled' ).to( linkCommand, 'isEnabled' );
			button.bind( 'isOn' ).to( linkCommand, 'value', value => !!value );
			button.bind( 'hasLink' ).to( this, 'hasLink' );

			// Show the actionsView or formView (both from LinkUI) on button click depending on whether the image is linked already.
			this.listenTo( button, 'execute', () => {
				const hasLink = this._isImageLinked( editor.model.document.selection.getSelectedElement() );

				hasLink ? plugin._addActionsView() : plugin._showUI( true );
			} );

			this.linkButtonView = button;

			return button;
		} );
	}

	/**
	 * A helper function that checks whether the element is a linked image.
	 *
	 * @private
	 *
	 * @param {module:engine/model/element~Element} element
	 * @returns {Boolean}
	 */
	_isImageLinked( element ) {
		if ( !( element && element.is( 'image' ) ) ) {
			return false;
		}

		return element && element.hasAttribute( 'linkHref' );
	}
}
