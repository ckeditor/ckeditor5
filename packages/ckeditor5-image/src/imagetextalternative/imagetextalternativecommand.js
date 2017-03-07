/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagelaternatetext/imagetextalternativecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command/command';
import { isImage } from '../image/utils';

/**
 * The image text alternative command. It is used to change `alt` attribute on `image` elements.
 *
 * @extends module:core/command/command~Command
 */
export default class ImageTextAlternativeCommand extends Command {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );
		/**
		 * The current command value - `false` if there is no `alt` attribute, otherwise contains string with `alt`
		 * attribute value.
		 *
		 * @readonly
		 * @observable
		 * @member {String|Boolean} #value
		 */
		this.set( 'value', false );

		// Update current value and refresh state each time something change in model document.
		this.listenTo( editor.document, 'changesDone', () => {
			this._updateValue();
			this.refreshState();
		} );
	}

	/**
	 * Updates command's value.
	 *
	 * @private
	 */
	_updateValue() {
		const doc = this.editor.document;
		const element = doc.selection.getSelectedElement();

		if ( isImage( element ) && element.hasAttribute( 'alt' ) ) {
			this.value = element.getAttribute( 'alt' );
		} else {
			this.value = false;
		}
	}

	/**
	 * @inheritDoc
	 */
	_checkEnabled() {
		const element = this.editor.document.selection.getSelectedElement();

		return isImage( element );
	}

	/**
	 * Executes command.
	 *
	 * @protected
	 * @param {Object} options
	 * @param {String} options.newValue New value of `alt` attribute to set.
	 * @param {module:engine/model/batch~Batch} [options.batch] Batch to collect all the change steps. New batch will be
	 * created if this option is not set.
	 */
	_doExecute( options ) {
		const editor = this.editor;
		const doc = editor.document;
		const imageElement = doc.selection.getSelectedElement();

		doc.enqueueChanges( () => {
			const batch = options.batch || doc.batch();

			batch.setAttribute( imageElement, 'alt', options.newValue );
		} );
	}
}
