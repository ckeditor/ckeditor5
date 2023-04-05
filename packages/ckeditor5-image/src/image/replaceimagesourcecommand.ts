/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Command } from 'ckeditor5/src/core';
import type ImageUtils from '../imageutils';

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
		this.editor.model.change( writer => {
			writer.setAttribute( 'src', options.source, image );
			writer.removeAttribute( 'srcset', image );
			writer.removeAttribute( 'sizes', image );
		} );
	}
}
