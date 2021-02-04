/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imagetypetogglecommand
 */

import { Command } from 'ckeditor5/src/core';
import { insertImage, isImage, isImageInline } from './utils';

/**
 * The image type toggle command. It is used to convert images between block and inline type.
 *
 * @extends module:core/command~Command
 */
export default class ImageTypeSwitchCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const element = this.editor.model.document.selection.getSelectedElement();

		if ( !this.editor.plugins.has( 'ImageBlockEditing' ) || !this.editor.plugins.has( 'ImageInlineEditing' ) ) {
			this.isEnabled = false;
		} else {
			this.isEnabled = isImage( element ) || isImageInline( element );
		}
	}

	/**
	 * @inheritDoc
	 */
	execute( requestedType ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		const imageElement = selection.getSelectedElement();

		if ( imageElement.name === requestedType ) {
			return;
		}

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
