/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagetextalternative/imagetextalternativecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { isImage } from '../image/utils';

/**
 * The image text alternative command. It is used to change the `alt` attribute on `<image>` elements.
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
		const element = this.editor.document.selection.getSelectedElement();

		this.isEnabled = isImage( element );

		if ( isImage( element ) && element.hasAttribute( 'alt' ) ) {
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
	 * @param {module:engine/model/batch~Batch} [options.batch] A batch to collect all the change steps. A new batch will be
	 * created if this option is not set.
	 */
	execute( options ) {
		const doc = this.editor.document;
		const imageElement = doc.selection.getSelectedElement();

		doc.enqueueChanges( () => {
			const batch = options.batch || doc.batch();

			batch.setAttribute( imageElement, 'alt', options.newValue );
		} );
	}
}
