/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link/linkimageui
 */

import { ButtonView } from 'ckeditor5/src/ui.js';
import { Plugin } from 'ckeditor5/src/core.js';
import { IconLink } from 'ckeditor5/src/icons.js';
import type {
	DocumentSelection,
	Selection,
	ViewDocumentClickEvent
} from 'ckeditor5/src/engine.js';

import type { ImageUtils } from '@ckeditor/ckeditor5-image';

import LinkUI from './linkui.js';
import LinkEditing from './linkediting.js';
import type LinkCommand from './linkcommand.js';

import { LINK_KEYSTROKE } from './utils.js';

/**
 * The link image UI plugin.
 *
 * This plugin provides the `'linkImage'` button that can be displayed in the {@link module:image/imagetoolbar~ImageToolbar}.
 * It can be used to wrap images in links.
 */
export default class LinkImageUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ LinkEditing, LinkUI, 'ImageBlockEditing' ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'LinkImageUI' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;

		this.listenTo<ViewDocumentClickEvent>( viewDocument, 'click', ( evt, data ) => {
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
	 * When an image is already linked, the view shows {@link module:link/linkui~LinkUI#toolbarView} or
	 * {@link module:link/linkui~LinkUI#formView} if it is not.
	 */
	private _createToolbarLinkImageButton(): void {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'linkImage', locale => {
			const button = new ButtonView( locale );
			const plugin = editor.plugins.get( 'LinkUI' );
			const linkCommand: LinkCommand = editor.commands.get( 'link' )!;

			button.set( {
				isEnabled: true,
				label: t( 'Link image' ),
				icon: IconLink,
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
					plugin._addToolbarView();
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
	 */
	private _isSelectedLinkedImage( selection: DocumentSelection | Selection ): boolean {
		const selectedModelElement = selection.getSelectedElement();
		const imageUtils: ImageUtils = this.editor.plugins.get( 'ImageUtils' );

		return imageUtils.isImage( selectedModelElement ) && selectedModelElement.hasAttribute( 'linkHref' );
	}
}
