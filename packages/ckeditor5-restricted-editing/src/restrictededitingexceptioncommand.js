/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module restricted-editing/restrictededitingexceptioncommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';

/**
 * @extends module:core/command~Command
 */
export default class RestrictedEditingExceptionCommand extends Command {
	/**
	 * @inheritDoc
	 */
	refresh() {
		const model = this.editor.model;
		const doc = model.document;

		this.value = !!doc.selection.getAttribute( 'restrictedEditingException' );

		this.isEnabled = model.schema.checkAttributeInSelection( doc.selection, 'restrictedEditingException' );
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
			const ranges = model.schema.getValidRanges( selection.getRanges(), 'restrictedEditingException' );

			if ( selection.isCollapsed ) {
				const position = selection.getFirstPosition();

				// When selection is inside restricted text
				if ( selection.hasAttribute( 'restrictedEditingException' ) ) {
					// Find the full resticted range
					const isSameRestrictedException = value => {
						return value.item.hasAttribute( 'restrictedEditingException' ) &&
						value.item.getAttribute( 'restrictedEditingException' ) === this.value;
					};

					const restrictedEditingExceptionStart = position.getLastMatchingPosition( isSameRestrictedException,
						{ direction: 'backward' } );
					const restrictedEditingExceptionEnd = position.getLastMatchingPosition( isSameRestrictedException );

					const restrictedEditingExceptionRange = writer.createRange( restrictedEditingExceptionStart,
						restrictedEditingExceptionEnd );

					writer.removeAttribute( 'restrictedEditingException', restrictedEditingExceptionRange );
					writer.removeSelectionAttribute( 'restrictedEditingException' );
				} else if ( valueToSet ) {
					// Set attribute on selection with unset attribute
					writer.setSelectionAttribute( 'restrictedEditingException', valueToSet );
				}
			} else {
				for ( const range of ranges ) {
					if ( valueToSet ) {
						writer.setAttribute( 'restrictedEditingException', valueToSet, range );
					} else {
						writer.removeAttribute( 'restrictedEditingException', range );
					}
				}
			}
		} );
	}
}
