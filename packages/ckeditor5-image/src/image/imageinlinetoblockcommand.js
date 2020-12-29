/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imagetoinlinecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { insertImage, isImageInline } from './utils';

/**
 * The image inline command. It is used to convert block image io inline image.
 *
 * @extends module:core/command~Command
 */
export default class ImageInlineToBlockCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const element = this.editor.model.document.selection.getSelectedElement();

		this.isEnabled = isImageInline( element );
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 */
	execute( ) {
		const model = this.editor.model;
		const selection = model.document.selection;
		const element = selection.getSelectedElement();
		const src = element.getAttribute( 'src' );
		const alt = element.getAttribute( 'alt' );
		const srcset = element.getAttribute( 'srcset' );

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

		insertImage( model, attrs, selection );
	}
}
