/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imagetypetogglecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { insertImage, isImage, isImageInline } from './utils';

/**
 * The image inline command. It is used to convert block image io inline image.
 *
 * @extends module:core/command~Command
 */
export default class ImageTypeToggleCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const element = this.editor.model.document.selection.getSelectedElement();

		this.isEnabled =
			this.editor.plugins.has( 'ImageBlock' ) && this.editor.plugins.has( 'ImageInline' ) &&
			( isImage( element ) || isImageInline( element ) );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const imageElement = selection.getSelectedElement();
		const src = imageElement.getAttribute( 'src' );
		const alt = imageElement.getAttribute( 'alt' );
		const srcset = imageElement.getAttribute( 'srcset' );

		if ( !src ) {
			return;
		}

		const attrs = { src };

		if ( alt ) {
			attrs.alt = alt;
		}

		if ( srcset ) {
			attrs.srcset = srcset;
		}

		if ( isImage( imageElement ) ) {
			model.change( writer => {
				const paragraph = writer.createElement( 'paragraph' );
				const imageInlineElement = writer.createElement( 'imageInline', attrs );

				writer.append( imageInlineElement, paragraph );
				model.insertContent( paragraph, selection );
				writer.setSelection( imageInlineElement, 'on' );
			} );
		} else {
			insertImage( model, attrs, selection );
		}
	}
}
