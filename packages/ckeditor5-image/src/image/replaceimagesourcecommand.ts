/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import { Command, type Editor } from 'ckeditor5/src/core';
import type ImageUtils from '../imageutils';
import type { Writer, Element } from 'ckeditor5/src/engine';

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

	declare private _imageCallbacks: Array<( writer: Writer, image: Element ) => void>;

	constructor( editor: Editor ) {
		super( editor );

		this._imageCallbacks = [];
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
	 * Register callback which will be executed after command execution.
	 *
	 * @param callback Callback which will be called after command execution.
	 */
	public registerImageCallback( callback: ( writer: Writer, image: Element ) => void ): void {
		this._imageCallbacks.push( callback );
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

			this._cleanupImage( writer, image );
		} );
	}

	/**
	 * Cleanup some image attributes.
	 */
	private _cleanupImage( writer: Writer, image: Element ) {
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

		this._imageCallbacks.forEach( callback => callback( writer, image ) );
	}
}
