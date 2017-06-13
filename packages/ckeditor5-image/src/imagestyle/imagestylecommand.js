/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagestyle/imagestylecommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import { isImage } from '../image/utils';

/**
 * The image style command. It is used to apply different image styles.
 *
 * @extends module:core/command~Command
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
		 * The value of the command - `true` if style handled by the command is applied on currently selected image,
		 * `false` otherwise.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #value
		 */

		/**
		 * Style handled by this command.
		 *
		 * @readonly
		 * @member {module:image/imagestyle/imagestyleengine~ImageStyleFormat} #style
		 */
		this.style = style;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const element = this.editor.document.selection.getSelectedElement();

		this.isEnabled = isImage( element );

		if ( !element ) {
			this.value = false;
		} else if ( this.style.value === null ) {
			this.value = !element.hasAttribute( 'imageStyle' );
		} else {
			this.value = ( element.getAttribute( 'imageStyle' ) == this.style.value );
		}
	}

	/**
	 * Executes command.
	 *
	 * @fires execute
	 * @param {Object} options
	 * @param {module:engine/model/batch~Batch} [options.batch] Batch to collect all the change steps. New batch will be
	 * created if this option is not set.
	 */
	execute( options = {} ) {
		if ( this.value ) {
			return;
		}

		const doc = this.editor.document;
		const imageElement = doc.selection.getSelectedElement();

		doc.enqueueChanges( () => {
			const batch = options.batch || doc.batch();

			batch.setAttribute( imageElement, 'imageStyle', this.style.value );
		} );
	}
}
