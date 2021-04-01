/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/imagestylecommand
 */

import { Command } from 'ckeditor5/src/core';
import { isImage } from '../image/utils';

/**
 * The image style command. It is used to apply {@link module:image/imagestyle~ImageStyleConfig#arrangements style arrangements}
 * to a selected image.
 *
 * **Note**: Executing this command may change the image model element if the desired style arrangement requires an image of a different
 * type. See {@link module:image/imagestyle/imagestylecommand~ImageStyleCommand#execute} to learn more.
 *
 * @extends module:core/command~Command
 */
export default class ImageStyleCommand extends Command {
	/**
	 * Creates an instance of the image style command. When executed, the command applies one of
	 * {@link module:image/imagestyle~ImageStyleConfig#arrangements style arrangements} to the currently selected image.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {Array.<module:image/imagestyle~ImageStyleArrangementDefinition>} arrangements
	 * The style arrangements that this command supports.
	 */
	constructor( editor, arrangements ) {
		super( editor );

		/**
		 * An object containing names of default style arrangements for the inline and block images.
		 * If there is no default arrangement for the given image type in the configuration,
		 * the name will be `false`.
		 *
		 * @private
		 * @type {Object.<String,module:image/imagestyle~ImageStyleArrangementDefinition#name>}
		 */
		this._defaultArrangements = {
			image: false,
			imageInline: false
		};

		/**
		 * The style arrangements handled by this command.
		 *
		 * @private
		 * @type {module:image/imagestyle~ImageStyleConfig#arrangements}
		 */
		this._arrangements = new Map( arrangements.map( arrangement => {
			if ( arrangement.isDefault ) {
				for ( const modelElementName of arrangement.modelElements ) {
					this._defaultArrangements[ modelElementName ] = arrangement.name;
				}
			}

			return [ arrangement.name, arrangement ];
		} ) );
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const element = this.editor.model.document.selection.getSelectedElement();

		this.isEnabled = isImage( element );

		if ( !this.isEnabled ) {
			this.value = false;
		} else if ( element.hasAttribute( 'imageStyle' ) ) {
			this.value = element.getAttribute( 'imageStyle' );
		} else {
			this.value = this._defaultArrangements[ element.name ];
		}
	}

	/**
	 * Executes the command and applies the style arrangement to the currently selected image:
	 *
	 *		editor.execute( 'imageStyle', { value: 'side' } );
	 *
	 * **Note**: Executing this command may change the image model element if the desired style arrangement requires an image
	 * of a different type. Learn more about {@link module:image/imagestyle~ImageStyleArrangementDefinition#modelElements model element}
	 * configuration for the style arrangements.
	 *
	 * @param {Object} options
	 * @param {module:image/imagestyle~ImageStyleArrangementDefinition#name} options.value The name of the arrangement (as configured in
	 * {@link module:image/imagestyle~ImageStyleConfig#arrangements}).
	 * @fires execute
	 */
	execute( options ) {
		const model = this.editor.model;

		model.change( writer => {
			const requestedArrangement = options.value;
			const supportedTypes = this._arrangements.get( requestedArrangement ).modelElements;

			let imageElement = model.document.selection.getSelectedElement();

			// Change the image type if a style requires it.
			if ( !supportedTypes.includes( imageElement.name ) ) {
				this.editor.execute( !supportedTypes.includes( 'image' ) ? 'imageTypeInline' : 'imageTypeBlock' );

				// Update the imageElement to the newly created image.
				imageElement = model.document.selection.getSelectedElement();
			}

			// Default style means that there is no `imageStyle` attribute in the model.
			// https://github.com/ckeditor/ckeditor5-image/issues/147
			if ( this._arrangements.get( requestedArrangement ).isDefault ) {
				writer.removeAttribute( 'imageStyle', imageElement );
			} else {
				writer.setAttribute( 'imageStyle', requestedArrangement, imageElement );
			}
		} );
	}
}
