/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imagetypecommand
 */

import { Command } from 'ckeditor5/src/core';

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
		const editor = this.editor;
		const imageUtils = editor.plugins.get( 'ImageUtils' );
		const element = imageUtils.getClosestSelectedImageElement( this.editor.model.document.selection );

		if ( this._modelElementName === 'image' ) {
			this.isEnabled = imageUtils.isInlineImage( element );
		} else {
			this.isEnabled = imageUtils.isBlockImage( element );
		}
	}

	/**
	 * Executes the command and changes the type of a selected image.
	 *
	 * @fires execute
	 * @returns {Object|null} An object containing references to old and new model image elements
	 * (for before and after the change) so external integrations can hook into the decorated
	 * `execute` event and handle this change. `null` if the type change failed.
	 */
	execute() {
		const editor = this.editor;
		const model = this.editor.model;
		const imageUtils = editor.plugins.get( 'ImageUtils' );
		const oldElement = imageUtils.getClosestSelectedImageElement( model.document.selection );
		const attributes = Object.fromEntries( oldElement.getAttributes() );

		if ( !attributes.src ) {
			return null;
		}

		const newElement = imageUtils.insertImage( attributes, model.createSelection( oldElement, 'on' ), this._modelElementName );

		return {
			oldElement,
			newElement
		};
	}
}
