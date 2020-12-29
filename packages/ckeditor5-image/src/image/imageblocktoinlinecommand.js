/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imagetoinlinecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { findOptimalInsertionPosition } from '@ckeditor/ckeditor5-widget/src/utils';
import { isImage } from './utils';

/**
 * The image inline command. It is used to convert block image io inline image.
 *
 * @extends module:core/command~Command
 */
export default class ImageBlockToInlineCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const element = this.editor.model.document.selection.getSelectedElement();

		this.isEnabled = isImage( element );
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
		const position = findOptimalInsertionPosition( selection, model );

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

		model.change( writer => {
			const paragraph = writer.createElement( 'paragraph' );
			const imageInlineElement = writer.createElement( 'imageInline', attrs );

			writer.append( imageInlineElement, paragraph );
			model.insertContent( paragraph, position );

			if ( imageInlineElement.parent ) {
				writer.setSelection( imageInlineElement, 'on' );
			}

			writer.remove( imageElement );
		} );
	}
}
