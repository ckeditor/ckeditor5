/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/imagestylecommand
 */

import { Command } from 'ckeditor5/src/core';

/**
 * The image style command. It is used to apply {@link module:image/imagestyle~ImageStyleConfig#options image style option}
 * to a selected image.
 *
 * **Note**: Executing this command may change the image model element if the desired style requires an image of a different
 * type. See {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand#execute} to learn more.
 *
 * @extends module:core/command~Command
 */
export default class ImageStyleCommand extends Command {
	/**
	 * Creates an instance of the image style command. When executed, the command applies one of
	 * {@link module:image/imagestyle~ImageStyleConfig#options style options} to the currently selected image.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {Array.<module:image/imagestyle~ImageStyleOptionDefinition>} styles
	 * The style options that this command supports.
	 */
	constructor( editor, styles ) {
		super( editor );

		/**
		 * An object containing names of default style options for the inline and block images.
		 * If there is no default style option for the given image type in the configuration,
		 * the name will be `false`.
		 *
		 * @private
		 * @type {Object.<String,module:image/imagestyle~ImageStyleOptionDefinition#name>}
		 */
		this._defaultStyles = {
			imageBlock: false,
			imageInline: false
		};

		/**
		 * The styles handled by this command.
		 *
		 * @private
		 * @type {module:image/imagestyle~ImageStyleConfig#options}
		 */
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
	refresh() {
		const editor = this.editor;
		const imageUtils = editor.plugins.get( 'ImageUtils' );
		const element = imageUtils.getClosestSelectedImageElement( this.editor.model.document.selection );

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
	 *		editor.execute( 'imageStyle', { value: 'side' } );
	 *
	 * **Note**: Executing this command may change the image model element if the desired style requires an image
	 * of a different type. Learn more about {@link module:image/imagestyle~ImageStyleOptionDefinition#modelElements model element}
	 * configuration for the style option.
	 *
	 * @param {Object} options
	 * @param {module:image/imagestyle~ImageStyleOptionDefinition#name} options.value The name of the style (as configured in
	 * {@link module:image/imagestyle~ImageStyleConfig#options}).
	 * @fires execute
	 */
	execute( options = {} ) {
		const editor = this.editor;
		const model = editor.model;
		const imageUtils = editor.plugins.get( 'ImageUtils' );

		model.change( writer => {
			const requestedStyle = options.value;

			let imageElement = imageUtils.getClosestSelectedImageElement( model.document.selection );

			// Change the image type if a style requires it.
			if ( requestedStyle && this.shouldConvertImageType( requestedStyle, imageElement ) ) {
				this.editor.execute( imageUtils.isBlockImage( imageElement ) ? 'imageTypeInline' : 'imageTypeBlock' );

				// Update the imageElement to the newly created image.
				imageElement = imageUtils.getClosestSelectedImageElement( model.document.selection );
			}

			// Default style means that there is no `imageStyle` attribute in the model.
			// https://github.com/ckeditor/ckeditor5-image/issues/147
			if ( !requestedStyle || this._styles.get( requestedStyle ).isDefault ) {
				writer.removeAttribute( 'imageStyle', imageElement );
			} else {
				writer.setAttribute( 'imageStyle', requestedStyle, imageElement );
			}
		} );
	}

	/**
	 * Returns `true` if requested style change would trigger the image type change.
	 *
	 * @param {module:image/imagestyle~ImageStyleOptionDefinition} requestedStyle The name of the style (as configured in
	 * {@link module:image/imagestyle~ImageStyleConfig#options}).
	 * @param {module:engine/model/element~Element} imageElement The image model element.
	 * @returns {Boolean}
	 */
	shouldConvertImageType( requestedStyle, imageElement ) {
		const supportedTypes = this._styles.get( requestedStyle ).modelElements;

		return !supportedTypes.includes( imageElement.name );
	}
}
