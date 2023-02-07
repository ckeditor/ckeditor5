/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagetextalternative/imagetextalternativecommand
 */

import { Command } from 'ckeditor5/src/core';
import type ImageUtils from '../imageutils';

/**
 * The image text alternative command. It is used to change the `alt` attribute of `<imageBlock>` and `<imageInline>` model elements.
 */
export default class ImageTextAlternativeCommand extends Command {
	/**
	 * The command value: `false` if there is no `alt` attribute, otherwise the value of the `alt` attribute.
	 *
	 * @readonly
	 * @observable
	 */
	declare public value: string | false;

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const editor = this.editor;
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );
		const element = imageUtils.getClosestSelectedImageElement( this.editor.model.document.selection )!;

		this.isEnabled = !!element;

		if ( this.isEnabled && element.hasAttribute( 'alt' ) ) {
			this.value = element.getAttribute( 'alt' ) as string | false;
		} else {
			this.value = false;
		}
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param options
	 * @param options.newValue The new value of the `alt` attribute to set.
	 */
	public override execute( options: { newValue: string } ): void {
		const editor = this.editor;
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );
		const model = editor.model;
		const imageElement = imageUtils.getClosestSelectedImageElement( model.document.selection );

		model.change( writer => {
			writer.setAttribute( 'alt', options.newValue, imageElement! );
		} );
	}
}
