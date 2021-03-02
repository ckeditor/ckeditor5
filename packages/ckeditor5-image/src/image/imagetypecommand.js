/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module image/image/imagetypecommand
 */

import { Command } from 'ckeditor5/src/core';
import { insertImage, isImage, isImageInline } from './utils';

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
			this.isEnabled = isImageInline( element );
		} else {
			this.isEnabled = isImage( element );
		}
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const selection = this.editor.model.document.selection;
		const imageElement = selection.getSelectedElement();

		const src = imageElement.getAttribute( 'src' );
		const alt = imageElement.getAttribute( 'alt' );
		const srcset = imageElement.getAttribute( 'srcset' );
		const caption = imageElement.getAttribute( 'caption' );
		const imageType = isImage( imageElement ) ? 'imageInline' : 'image';

		if ( !src ) {
			return;
		}

		const attrs = { src };

		if ( alt ) {
			attrs.alt = alt;
		}

		if ( srcset ) {
			attrs.srcset = srcset;
		}

		if ( caption ) {
			attrs.caption = caption;
		}

		insertImage( this.editor, attrs, selection, imageType );
	}
}
