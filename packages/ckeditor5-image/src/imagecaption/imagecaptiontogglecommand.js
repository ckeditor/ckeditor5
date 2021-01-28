/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagecaption/imagecaptiontogglecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import Element from '@ckeditor/ckeditor5-engine/src/model/element';
import { isImage, isImageInline } from '../image/utils';
import { getCaptionFromImageModelElement } from './utils';

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
		this.isEnabled = isImage( selectedElement ) || isImageInline( selectedElement );

		if ( !this.isEnabled ) {
			this.value = false;
		} else {
			this.value = !!getCaptionFromImageModelElement( selectedElement );
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
		this.editor.model.change( writer => {
			if ( this.value ) {
				this._hideImageCaption( writer );
			} else {
				this._showImageCaption( writer );
			}
		} );
	}

	/**
	 *
	 * @private
	 * @param {TODO} writer
	 */
	_showImageCaption( writer ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		let selectedImage = selection.getSelectedElement();
		let newCaptionElement;

		// Convert imageInline -> image first.
		if ( isImageInline( selectedImage ) ) {
			this.editor.execute( 'imageTypeToggle' );

			// Executing the command created a new model element. Let's pick it again.
			selectedImage = selection.getSelectedElement();
		}

		// Try restoring the caption from the attribute.
		if ( selectedImage.hasAttribute( 'caption' ) ) {
			newCaptionElement = Element.fromJSON( selectedImage.getAttribute( 'caption' ) );

			// The model attribute is no longer needed if the caption was is created.
			writer.removeAttribute( 'caption', selectedImage );
		} else {
			newCaptionElement = writer.createElement( 'caption' );
		}

		writer.append( newCaptionElement, selectedImage );
	}

	/**
	 *
	 * @private
	 * @param {TODO} writer
	 */
	_hideImageCaption( writer ) {
		const model = this.editor.model;
		const selectedImage = model.document.selection.getSelectedElement();
		const captionElement = getCaptionFromImageModelElement( selectedImage );

		// Store the caption content so it can be restored quickly if the user changes their mind
		// even if they toggle image<->imageInline.
		if ( captionElement.childCount ) {
			writer.setAttribute( 'caption', captionElement.toJSON(), selectedImage );
		}

		writer.remove( captionElement );
	}
}
