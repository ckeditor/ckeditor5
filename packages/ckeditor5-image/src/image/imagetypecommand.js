/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imagetypecommand
 */

import { Command } from 'ckeditor5/src/core';
import { insertImage, isBlockImage, isInlineImage } from './utils';

/**
 * The image type command. It changes the type of a selected image, depending on the configuration.
 *
 * @extends module:core/command~Command
 */
export default class ImageTypeCommand extends Command {
	/**
	 * @inheritDoc
	 *
	 * @param {module:core/editor/editor~Editor} editor
	 * @param {'image'|'imageInline'} modelElementName Model element name the command converts to.
	 */
	constructor( editor, modelElementName ) {
		super( editor );

		/**
		 * Model element name the command converts to.
		 *
		 * @readonly
		 * @private
		 * @member {'image'|'imageInline'}
		 */
		this._modelElementName = modelElementName;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		const element = this.editor.model.document.selection.getSelectedElement();

		if ( this._modelElementName === 'image' ) {
			this.isEnabled = isInlineImage( element );
		} else {
			this.isEnabled = isBlockImage( element );
		}
	}

	/**
	 * Executes the command and changes the type of a selected image.
	 *
	 * @fires execute
	 * @returns {Object} An object containing references to old and new model image elements
	 * (for before and after the change) so external integrations can hook into the decorated
	 * `execute` event and handle this change.
	 */
	execute() {
		const selection = this.editor.model.document.selection;
		const oldElement = selection.getSelectedElement();
		const attributes = Object.fromEntries( oldElement.getAttributes() );

		if ( !attributes.src ) {
			return;
		}

		const newElement = insertImage( this.editor, attributes, selection, this._modelElementName );

		return {
			oldElement,
			newElement
		};
	}
}
