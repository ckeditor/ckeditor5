/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/imagetextalternative/imagetextalternativecommand
 */

import { Command } from 'ckeditor5/src/core';
import { isImage, getSelectedOrAncestorImageElement } from '../image/utils';

/**
 * The image text alternative command. It is used to change the `alt` attribute of `<image>` and `<imageInline>` model elements.
 *
 * @extends module:core/command~Command
 */
export default class ImageTextAlternativeCommand extends Command {
	/**
	 * The command value: `false` if there is no `alt` attribute, otherwise the value of the `alt` attribute.
	 *
	 * @readonly
	 * @observable
	 * @member {String|Boolean} #value
	 */

	/**
	 * @inheritDoc
	 */
	refresh() {
		const element = getSelectedOrAncestorImageElement( this.editor.model.document.selection );

		this.isEnabled = isImage( element );

		if ( this.isEnabled && element.hasAttribute( 'alt' ) ) {
			this.value = element.getAttribute( 'alt' );
		} else {
			this.value = false;
		}
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} options
	 * @param {String} options.newValue The new value of the `alt` attribute to set.
	 */
	execute( options ) {
		const model = this.editor.model;
		const imageElement = getSelectedOrAncestorImageElement( model.document.selection );

		model.change( writer => {
			writer.setAttribute( 'alt', options.newValue, imageElement );
		} );
	}
}
