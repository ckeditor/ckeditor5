/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagecaption/toggleimagecaptioncommand
 */

import { Command } from 'ckeditor5/src/core';
import { Element } from 'ckeditor5/src/engine';

import ImageBlockEditing from '../image/imageblockediting';
import { isImage, isInlineImage } from '../image/utils';
import { getCaptionFromImageModelElement, getCaptionFromModelSelection } from './utils';

/**
 * The toggle image caption command.
 *
 * This command is registered by {@link module:image/imagecaption/imagecaptionediting~ImageCaptionEditing} as the
 * `'toggleImageCaption'` editor command.
 *
 * Executing this command:
 *
 * * either adds or removes the image caption of a selected image (depending on whether the caption is present or not),
 * * removes the image caption if the selection is anchored in one.
 *
 *		// Toggle the presence of the caption.
 *		editor.execute( 'toggleImageCaption' );
 *
 * **Note**: Upon executing this command, the selection will be set on the image if previously anchored in the caption element.
 *
 * **Note**: You can move the selection to the caption right away as it shows up upon executing this command by using
 * the `focusCaptionOnShow` option:
 *
 *		editor.execute( 'toggleImageCaption', { focusCaptionOnShow: true } );
 *
 * @extends module:core/command~Command
 */
export default class ToggleImageCaptionCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const editor = this.editor;

		// Only block images can get captions.
		if ( !editor.plugins.has( ImageBlockEditing ) ) {
			this.isEnabled = false;
			this.value = false;

			return;
		}

		const selection = editor.model.document.selection;
		const selectedElement = selection.getSelectedElement();

		if ( !selectedElement ) {
			const ancestorCaptionElement = getCaptionFromModelSelection( selection );

			this.isEnabled = !!ancestorCaptionElement;
			this.value = !!ancestorCaptionElement;

			return;
		}

		// Block images support captions by default but the command should also be enabled for inline
		// images because toggling the caption when one is selected should convert it into a block image.
		this.isEnabled = isImage( selectedElement );

		if ( !this.isEnabled ) {
			this.value = false;
		} else {
			this.value = !!getCaptionFromImageModelElement( selectedElement );
		}
	}

	/**
	 * Executes the command.
	 *
	 *		editor.execute( 'toggleImageCaption' );
	 *
	 * @param {Object} [options] Options for the executed command.
	 * @param {String} [options.focusCaptionOnShow] When true and the caption shows up, the selection will be moved into it straight away.
	 * @fires execute
	 */
	execute( options = {} ) {
		const { focusCaptionOnShow } = options;

		this.editor.model.change( writer => {
			if ( this.value ) {
				this._hideImageCaption( writer );
			} else {
				this._showImageCaption( writer, focusCaptionOnShow );
			}
		} );
	}

	/**
	 * Shows the caption of the `<image>` or `<imageInline>`. Also:
	 *
	 * * it converts `<imageInline>` to `<image>` to show the caption,
	 * * it attempts to restore the caption content from the `caption` attribute,
	 * * it moves the selection to the caption right away, it the `focusCaptionOnShow` option was set.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 */
	_showImageCaption( writer, focusCaptionOnShow ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		let selectedImage = selection.getSelectedElement();
		let newCaptionElement;

		// Convert imageInline -> image first.
		if ( isInlineImage( selectedImage ) ) {
			this.editor.execute( 'imageTypeBlock' );

			// Executing the command created a new model element. Let's pick it again.
			selectedImage = selection.getSelectedElement();
		}

		// Try restoring the caption from the attribute.
		if ( selectedImage.hasAttribute( 'caption' ) ) {
			newCaptionElement = Element.fromJSON( selectedImage.getAttribute( 'caption' ) );

			// The model attribute is no longer needed if the caption was created out of it.
			writer.removeAttribute( 'caption', selectedImage );
		} else {
			newCaptionElement = writer.createElement( 'caption' );
		}

		writer.append( newCaptionElement, selectedImage );

		if ( focusCaptionOnShow ) {
			writer.setSelection( newCaptionElement, 'in' );
		}
	}

	/**
	 * Hides the caption of a selected image (or an image caption the selection is anchored to).
	 *
	 * The content of the caption is stored in the `caption` model attribute of the image
	 * to make this a reversible action.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 */
	_hideImageCaption( writer ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		let selectedImage = selection.getSelectedElement();
		let captionElement;

		if ( selectedImage ) {
			captionElement = getCaptionFromImageModelElement( selectedImage );
		} else {
			captionElement = getCaptionFromModelSelection( selection );
			selectedImage = captionElement.parent;
		}

		// Store the caption content so it can be restored quickly if the user changes their mind even if they toggle image<->imageInline.
		if ( captionElement.childCount ) {
			writer.setAttribute( 'caption', captionElement.toJSON(), selectedImage );
		}

		writer.setSelection( selectedImage, 'on' );
		writer.remove( captionElement );
	}
}
