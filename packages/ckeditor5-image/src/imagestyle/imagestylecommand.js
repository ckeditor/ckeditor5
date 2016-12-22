/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/imagestylecommand
 */

import Command from '../../core/command/command.js';
import { isImage, getStyleByValue } from './utils.js';

/**
 * The image style command. It is used to apply different image styles.
 *
 * @extends module:core/command/command~Command
 */
export default class ImageStyleCommand extends Command {
	/**
	 * Creates instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor instance.
	 * @param {Array.<module:image/imagestyle/imagestyleengine~ImageStyleFormat>} styles Allowed styles.
	 */
	constructor( editor, styles ) {
		super( editor );
		/**
		 * The current style value.
		 *
		 * @readonly
		 * @observable
		 * @member {String} #value
		 */
		this.set( 'value', false );

		/**
		 * Allowed image styles used by this command.
		 *
		 * @readonly
		 * @member {Array.<module:image/imagestyle/imagestyleengine~ImageStyleFormat>} #styles
		 */
		this.styles = styles;

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

		if ( isImage( element ) ) {
			if ( element.hasAttribute( 'imageStyle' ) ) {
				const value = element.getAttribute( 'imageStyle' );

				// Check if value exists.
				this.value = ( getStyleByValue( value, this.styles ) ? value : false );
			} else {
				// When there is no `style` attribute - set value to null.
				this.value = null;
			}
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
	 * @param {String} options.value Value to apply. It must be one of the values from styles passed to {@link #constructor}.
	 * @param {module:engine/model/batch~Batch} [options.batch] Batch to collect all the change steps. New batch will be
	 * created if this option is not set.
	 */
	_doExecute( options ) {
		const currentValue = this.value;
		const newValue = options.value;

		// Check if new value is valid.
		if ( !getStyleByValue( newValue, this.styles ) ) {
			return;
		}

		// Stop if same value is already applied.
		if ( currentValue == newValue ) {
			return;
		}

		const editor = this.editor;
		const doc = editor.document;
		const selection = doc.selection;
		const imageElement = selection.getSelectedElement();

		doc.enqueueChanges( () => {
			const batch = options.batch || doc.batch();

			batch.setAttribute( imageElement, 'imageStyle', newValue );
		} );
	}
}
