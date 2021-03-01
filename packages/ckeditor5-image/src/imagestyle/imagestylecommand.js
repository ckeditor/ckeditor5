/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagestyle/imagestylecommand
 */

import { Command } from 'ckeditor5/src/core';
import { isImage, isImageInline } from '../image/utils';

/**
 * The image style command. It is used to apply different image arrangements
 * and optionally changing the image model element.
 *
 * @extends module:core/command~Command
 */
export default class ImageStyleCommand extends Command {
	/**
	 * Creates an instance of the image style command. Each command instance is handling one arrangement.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {Array.<module:image/imagestyle~ImageStyleArrangementFormat>} arrangements
	 * The arrangements that this command supports.
	 */
	constructor( editor, arrangements ) {
		super( editor );

		/**
		 * An object containing names of the default arrangements for the inline and block images,
		 * if it is present. If there is no default arrangement for the given image type, it is set to `false`.
		 *
		 * @private
		 * @type {Object.<String,module:image/imagestyle~ImageStyleArrangementFormat#name>}
		 */
		this._defaultArrangements = {
			image: false,
			imageInline: false
		};

		/**
		 * The arrangements handled by this command.
		 *
		 * @private
		 * @type {Array.<module:image/imagestyle~ImageStyleArrangementFormat>}
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

		this.isEnabled = isImage( element ) || isImageInline( element );

		if ( !this.isEnabled ) {
			this.value = false;
		} else if ( element.hasAttribute( 'imageStyle' ) ) {
			this.value = element.getAttribute( 'imageStyle' );
		} else {
			this.value = this._defaultArrangements[ element.name ];
		}
	}

	/**
	 * Executes the command.
	 *
	 *		editor.execute( 'imageStyle', { value: 'side' } );
	 *
	 * @param {Object} options
	 * @param {String} options.value The name of the arrangement (based on the
	 * {@link module:image/image~ImageConfig#styles `image.styles.arrangements`} configuration option).
	 * @fires execute
	 */
	execute( options ) {
		const requestedArrangement = options.value;
		const model = this.editor.model;

		const imageElement = model.document.selection.getSelectedElement();
		const supportedTypes = this._arrangements.get( requestedArrangement ).modelElements;

		// Change the image type if a style requires it.
		if ( !supportedTypes.includes( imageElement.name ) ) {
			this.editor.execute( !supportedTypes.includes( 'image' ) ? 'imageTypeInline' : 'imageTypeBlock' );
		}

		model.change( writer => {
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
