/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imagetypecommand
 */

import { Command } from 'ckeditor5/src/core';
import { insertImage, isBlockImage, isInlineImage, getSelectedImageElementOrAncestor } from './utils';

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
		const element = getSelectedImageElementOrAncestor( this.editor.model.document.selection );

		if ( this._modelElementName === 'image' ) {
			this.isEnabled = isInlineImage( element );
		} else {
			this.isEnabled = isBlockImage( element );
		}
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const model = this.editor.model;
		const imageElement = getSelectedImageElementOrAncestor( model.document.selection );
		const attributes = Object.fromEntries( imageElement.getAttributes() );

		if ( !attributes.src ) {
			return;
		}

		insertImage( this.editor, attributes, model.createSelection( imageElement, 'on' ), this._modelElementName );
	}
}
