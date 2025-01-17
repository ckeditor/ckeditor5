/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';
import type ImageUtils from '../imageutils.js';
import type { Writer, Element } from 'ckeditor5/src/engine.js';

/**
 * @module image/image/replaceimagesourcecommand
 */

/**
 * Replace image source command.
 *
 * Changes image source to the one provided. Can be executed as follows:
 *
 * ```ts
 * editor.execute( 'replaceImageSource', { source: 'http://url.to.the/image' } );
 * ```
 */
export default class ReplaceImageSourceCommand extends Command {
	declare public value: string | null;

	constructor( editor: Editor ) {
		super( editor );

		this.decorate( 'cleanupImage' );
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const editor = this.editor;
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );
		const element = this.editor.model.document.selection.getSelectedElement()!;

		this.isEnabled = imageUtils.isImage( element );
		this.value = this.isEnabled ? element.getAttribute( 'src' ) as string : null;
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options Options for the executed command.
	 * @param options.source The image source to replace.
	 */
	public override execute( options: { source: string } ): void {
		const image = this.editor.model.document.selection.getSelectedElement()!;
		const imageUtils: ImageUtils = this.editor.plugins.get( 'ImageUtils' );

		this.editor.model.change( writer => {
			writer.setAttribute( 'src', options.source, image );

			this.cleanupImage( writer, image );

			imageUtils.setImageNaturalSizeAttributes( image );
		} );
	}

	/**
	 * Cleanup image attributes that are not relevant to the new source.
	 *
	 * Removed attributes are: 'srcset', 'sizes', 'sources', 'width', 'height', 'alt'.
	 *
	 * This method is decorated, to allow custom cleanup logic.
	 * For example, to remove 'myImageId' attribute after 'src' has changed:
	 *
	 * ```ts
	 * replaceImageSourceCommand.on( 'cleanupImage', ( eventInfo, [ writer, image ] ) => {
	 * 	writer.removeAttribute( 'myImageId', image );
	 * } );
	 * ```
	 */
	public cleanupImage( writer: Writer, image: Element ): void {
		writer.removeAttribute( 'srcset', image );
		writer.removeAttribute( 'sizes', image );

		/**
		 * In case responsive images some attributes should be cleaned up.
		 * Check: https://github.com/ckeditor/ckeditor5/issues/15093
		 */
		writer.removeAttribute( 'sources', image );
		writer.removeAttribute( 'width', image );
		writer.removeAttribute( 'height', image );
		writer.removeAttribute( 'alt', image );
	}
}
