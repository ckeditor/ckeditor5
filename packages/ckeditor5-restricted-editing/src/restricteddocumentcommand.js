/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/restricteddocumentcommand
 */

import Command from './command';

/**
 * @extends module:core/command~Command
 */
export default class RestrictedDocumentCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		this.value = doc.selection.getAttribute( 'nonRestricted' );

		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, 'nonRestricted' );
	}
}
