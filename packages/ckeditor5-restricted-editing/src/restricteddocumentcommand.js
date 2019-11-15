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

		this.value = !!doc.selection.getAttribute( 'nonRestricted' );

		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, 'nonRestricted' );
	}

	/**
	 * @inheritDoc
	 */
	execute( options = {} ) {
		const model = this.editor.model;
		const document = model.document;
		const selection = document.selection;
		const valueToSet = ( options.forceValue === undefined ) ? !this.value : options.forceValue;

		model.change( writer => {
			const ranges = model.schema.getValidRanges( selection.getRanges(), 'nonRestricted' );

			if ( selection.isCollapsed ) {
				if ( valueToSet ) {
					writer.setSelectionAttribute( 'nonRestricted', true );
				} else {
					writer.removeSelectionAttribute( 'nonRestricted' );
				}
			} else {
				for ( const range of ranges ) {
					if ( valueToSet ) {
						writer.setAttribute( 'nonRestricted', valueToSet, range );
					} else {
						writer.removeAttribute( 'nonRestricted', range );
					}
				}
			}
		} );
	}
}
