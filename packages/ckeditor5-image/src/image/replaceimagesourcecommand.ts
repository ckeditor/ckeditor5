/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Command } from 'ckeditor5/src/core';

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
	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const editor = this.editor;
		const imageUtils = editor.plugins.get( 'ImageUtils' );
		const element = this.editor.model.document.selection.getSelectedElement()!;

		this.isEnabled = imageUtils.isImage( element );
		this.value = this.isEnabled ? element.getAttribute( 'src' ) : null;
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
		this.editor.model.change( writer => {
			writer.setAttribute( 'src', options.source, image );
			writer.removeAttribute( 'srcset', image );
			writer.removeAttribute( 'sizes', image );
		} );
	}
}
