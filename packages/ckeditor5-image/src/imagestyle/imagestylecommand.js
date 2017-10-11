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
	 * Creates an instance of the image style command. Each command instance is handling one style.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {module:image/imagestyle/imagestyleengine~ImageStyleFormat} styles A style to be applied by this command.
	 */
	constructor( editor, style ) {
		super( editor );

		/**
		 * The value of the command &mdash; `true` if a style handled by the command is applied on a currently selected image,
		 * `false` otherwise.
		 *
		 * @readonly
		 * @observable
		 * @member {Boolean} #value
		 */

		/**
		 * A style handled by this command.
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
		} else if ( this.style.isDefault ) {
			this.value = !element.hasAttribute( 'imageStyle' );
		} else {
			this.value = ( element.getAttribute( 'imageStyle' ) == this.style.name );
		}
	}

	/**
	 * Executes the command.
	 *
	 * @fires execute
	 * @param {Object} options
	 * @param {module:engine/model/batch~Batch} [options.batch] A batch to collect all the change steps. A new batch will be
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

			// Default style means that there is no `imageStyle` attribute in the model.
			// https://github.com/ckeditor/ckeditor5-image/issues/147
			if ( this.style.isDefault ) {
				batch.removeAttribute( imageElement, 'imageStyle' );
			} else {
				batch.setAttribute( imageElement, 'imageStyle', this.style.name );
			}
		} );
	}
}
