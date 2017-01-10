/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/imagestylecommand
 */

import Command from 'ckeditor5-core/src/command/command';
import { isImage } from '../utils';

/**
 * The image style command. It is used to apply different image styles.
 *
 * @extends module:core/command/command~Command
 */
export default class ImageStyleCommand extends Command {
	/**
	 * Creates instance of the image style command. Each command instance is handling one style.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor instance.
	 * @param {module:image/imagestyle/imagestyleengine~ImageStyleFormat} styles Style to apply by this command.
	 */
	constructor( editor, style ) {
		super( editor );

		/**
		 * The current command value - `true` if style handled by the command is applied on currently selected image,
		 * `false` otherwise.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #value
		 */
		this.set( 'value', false );

		/**
		 * Style handled by this command.
		 *
		 * @readonly
		 * @member {module:image/imagestyle/imagestyleengine~ImageStyleFormat} #style
		 */
		this.style = style;

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

		if ( !element ) {
			this.value = false;

			return;
		}

		if ( this.style.value === null ) {
			this.value = !element.hasAttribute( 'imageStyle' );
		} else {
			this.value = ( element.getAttribute( 'imageStyle' ) == this.style.value );
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
	 * @param {module:engine/model/batch~Batch} [options.batch] Batch to collect all the change steps. New batch will be
	 * created if this option is not set.
	 */
	_doExecute( options = {} ) {
		// Stop if style is already applied.
		if ( this.value ) {
			return;
		}

		const editor = this.editor;
		const doc = editor.document;
		const selection = doc.selection;
		const imageElement = selection.getSelectedElement();

		doc.enqueueChanges( () => {
			const batch = options.batch || doc.batch();

			batch.setAttribute( imageElement, 'imageStyle', this.style.value );
		} );
	}
}
