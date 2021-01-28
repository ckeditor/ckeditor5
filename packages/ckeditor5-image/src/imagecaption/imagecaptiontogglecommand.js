/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagecaption/imagecaptiontogglecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import DocumentFragment from '@ckeditor/ckeditor5-engine/src/model/documentfragment';
import { isImage, isImageInline } from '../image/utils';
import { getCaptionFromImage } from './utils';

/**
 * TODO
 *
 * @extends module:core/command~Command
 */
export default class ImageCaptionToggleCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const selectedElement = this.editor.model.document.selection.getSelectedElement();

		if ( !selectedElement ) {
			this.isEnabled = this.value = false;

			return;
		}

		// Only block images have captions.
		this.isEnabled = isImage( selectedElement );

		if ( !this.isEnabled ) {
			this.value = false;
		} else {
			this.value = !!getCaptionFromImage( selectedElement );
		}
	}

	/**
	 * Executes the command.
	 *
	 *		editor.execute( 'imageCaptionToggle' );
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;
		const selectedImage = model.document.selection.getSelectedElement();

		model.change( writer => {
			// Hiding the caption.
			if ( this.value ) {
				const captionElement = getCaptionFromImage( selectedImage );

				// Store the caption content so it can be restored quickly if the user changes their mind
				// even if they toggle image<->imageInline.

				if ( captionElement.childCount ) {
					writer.setAttribute( 'caption', captionElement.toJSON(), selectedImage );
				}

				writer.remove( captionElement );
			}
			// Showing a caption.
			else {
				let newCaptionElement;

				if ( isImageInline( selectedImage ) ) {
					// Convert imageInline -> image first.
				}

				// Try restoring the caption from the attribute.
				if ( selectedImage.hasAttribute( 'caption' ) ) {
					newCaptionElement = Element.fromJSON( selectedImage.getAttribute( 'caption' ) );
					writer.removeAttribute( 'caption', selectedImage );
				} else {
					newCaptionElement = writer.createElement( 'caption' );
				}

				writer.append( newCaptionElement, selectedImage );
			}
		} );
	}
}
