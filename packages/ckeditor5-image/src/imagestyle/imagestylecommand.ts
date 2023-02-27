/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/imagestylecommand
 */

import type { Element } from 'ckeditor5/src/engine';
import { Command, type Editor } from 'ckeditor5/src/core';
import type { ImageStyleOptionDefinition } from '../imageconfig';
import type ImageUtils from '../imageutils';

/**
 * The image style command. It is used to apply {@link module:image/imageconfig~ImageStyleConfig#options image style option}
 * to a selected image.
 *
 * **Note**: Executing this command may change the image model element if the desired style requires an image of a different
 * type. See {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand#execute} to learn more.
 */
export default class ImageStyleCommand extends Command {
	/**
	 * An object containing names of default style options for the inline and block images.
	 * If there is no default style option for the given image type in the configuration,
	 * the name will be `false`.
	 */
	private _defaultStyles: Record<string, string | false>;

	/**
	 * The styles handled by this command.
	 */
	private _styles: Map<string, ImageStyleOptionDefinition>;

	/**
	 * Creates an instance of the image style command. When executed, the command applies one of
	 * {@link module:image/imageconfig~ImageStyleConfig#options style options} to the currently selected image.
	 *
	 * @param editor The editor instance.
	 * @param styles The style options that this command supports.
	 */
	constructor( editor: Editor, styles: Array<ImageStyleOptionDefinition> ) {
		super( editor );

		this._defaultStyles = {
			imageBlock: false,
			imageInline: false
		};

		this._styles = new Map( styles.map( style => {
			if ( style.isDefault ) {
				for ( const modelElementName of style.modelElements ) {
					this._defaultStyles[ modelElementName ] = style.name;
				}
			}

			return [ style.name, style ];
		} ) );
	}

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const editor = this.editor;
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );
		const element = imageUtils.getClosestSelectedImageElement( this.editor.model.document.selection )!;

		this.isEnabled = !!element;

		if ( !this.isEnabled ) {
			this.value = false;
		} else if ( element.hasAttribute( 'imageStyle' ) ) {
			this.value = element.getAttribute( 'imageStyle' );
		} else {
			this.value = this._defaultStyles[ element.name ];
		}
	}

	/**
	 * Executes the command and applies the style to the currently selected image:
	 *
	 * ```ts
	 * editor.execute( 'imageStyle', { value: 'side' } );
	 * ```
	 *
	 * **Note**: Executing this command may change the image model element if the desired style requires an image
	 * of a different type. Learn more about {@link module:image/imageconfig~ImageStyleOptionDefinition#modelElements model element}
	 * configuration for the style option.
	 *
	 * @param options.value The name of the style (as configured in {@link module:image/imageconfig~ImageStyleConfig#options}).
	 * @fires execute
	 */
	public override execute( options: { value?: string } = {} ): void {
		const editor = this.editor;
		const model = editor.model;
		const imageUtils: ImageUtils = editor.plugins.get( 'ImageUtils' );

		model.change( writer => {
			const requestedStyle = options.value;

			let imageElement = imageUtils.getClosestSelectedImageElement( model.document.selection )!;

			// Change the image type if a style requires it.
			if ( requestedStyle && this.shouldConvertImageType( requestedStyle, imageElement ) ) {
				this.editor.execute( imageUtils.isBlockImage( imageElement ) ? 'imageTypeInline' : 'imageTypeBlock' );

				// Update the imageElement to the newly created image.
				imageElement = imageUtils.getClosestSelectedImageElement( model.document.selection )!;
			}

			// Default style means that there is no `imageStyle` attribute in the model.
			// https://github.com/ckeditor/ckeditor5-image/issues/147
			if ( !requestedStyle || this._styles.get( requestedStyle )!.isDefault ) {
				writer.removeAttribute( 'imageStyle', imageElement );
			} else {
				writer.setAttribute( 'imageStyle', requestedStyle, imageElement );
			}
		} );
	}

	/**
	 * Returns `true` if requested style change would trigger the image type change.
	 *
	 * @param requestedStyle The name of the style (as configured in {@link module:image/imageconfig~ImageStyleConfig#options}).
	 * @param imageElement The image model element.
	 */
	public shouldConvertImageType( requestedStyle: string, imageElement: Element ): boolean {
		const supportedTypes = this._styles.get( requestedStyle )!.modelElements;

		return !supportedTypes.includes( imageElement.name );
	}
}
