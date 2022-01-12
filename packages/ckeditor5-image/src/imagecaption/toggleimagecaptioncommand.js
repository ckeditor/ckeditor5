/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagecaption/toggleimagecaptioncommand
 */

import { Command } from 'ckeditor5/src/core';

import ImageBlockEditing from '../image/imageblockediting';
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
		const imageUtils = editor.plugins.get( 'ImageUtils' );

		// Only block images can get captions.
		if ( !editor.plugins.has( ImageBlockEditing ) ) {
			this.isEnabled = false;
			this.value = false;

			return;
		}

		const selection = editor.model.document.selection;
		const selectedElement = selection.getSelectedElement();

		if ( !selectedElement ) {
			const ancestorCaptionElement = getCaptionFromModelSelection( imageUtils, selection );

			this.isEnabled = !!ancestorCaptionElement;
			this.value = !!ancestorCaptionElement;

			return;
		}

		// Block images support captions by default but the command should also be enabled for inline
		// images because toggling the caption when one is selected should convert it into a block image.
		this.isEnabled = this.editor.plugins.get( 'ImageUtils' ).isImage( selectedElement );

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
	 * Shows the caption of the `<imageBlock>` or `<imageInline>`. Also:
	 *
	 * * it converts `<imageInline>` to `<imageBlock>` to show the caption,
	 * * it attempts to restore the caption content from the `ImageCaptionEditing` caption registry,
	 * * it moves the selection to the caption right away, it the `focusCaptionOnShow` option was set.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 */
	_showImageCaption( writer, focusCaptionOnShow ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		const imageCaptionEditing = this.editor.plugins.get( 'ImageCaptionEditing' );

		let selectedImage = selection.getSelectedElement();

		const savedCaption = imageCaptionEditing._getSavedCaption( selectedImage );

		// Convert imageInline -> image first.
		if ( this.editor.plugins.get( 'ImageUtils' ).isInlineImage( selectedImage ) ) {
			this.editor.execute( 'imageTypeBlock' );

			// Executing the command created a new model element. Let's pick it again.
			selectedImage = selection.getSelectedElement();
		}

		// Try restoring the caption from the ImageCaptionEditing plugin storage.
		const newCaptionElement = savedCaption || writer.createElement( 'caption' );

		writer.append( newCaptionElement, selectedImage );

		if ( focusCaptionOnShow ) {
			writer.setSelection( newCaptionElement, 'in' );
		}
	}

	/**
	 * Hides the caption of a selected image (or an image caption the selection is anchored to).
	 *
	 * The content of the caption is stored in the `ImageCaptionEditing` caption registry to make this
	 * a reversible action.
	 *
	 * @private
	 * @param {module:engine/model/writer~Writer} writer
	 */
	_hideImageCaption( writer ) {
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const imageCaptionEditing = editor.plugins.get( 'ImageCaptionEditing' );
		const imageUtils = editor.plugins.get( 'ImageUtils' );
		let selectedImage = selection.getSelectedElement();
		let captionElement;

		if ( selectedImage ) {
			captionElement = getCaptionFromImageModelElement( selectedImage );
		} else {
			captionElement = getCaptionFromModelSelection( imageUtils, selection );
			selectedImage = captionElement.parent;
		}

		// Store the caption content so it can be restored quickly if the user changes their mind even if they toggle image<->imageInline.
		imageCaptionEditing._saveCaption( selectedImage, captionElement );

		writer.setSelection( selectedImage, 'on' );
		writer.remove( captionElement );
	}
}
