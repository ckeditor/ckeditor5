/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module indent-block/indentblockcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import first from '@ckeditor/ckeditor5-utils/src/first';

/**
 * The block indentation feature.
 *
 * @extends module:core/plugin~Plugin
 */
export default class IndentBlockCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor instance.
	 * @param {Object} config.
	 */
	constructor( editor, { classes, offset, unit, direction } ) {
		super( editor );
		this.classes = classes;
		this.offset = offset;
		this.unit = unit;
		this.direction = direction == 'forward' ? 1 : -1;
		this.useClasses = !!classes.length;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		this.isEnabled = this._checkEnabled();
	}

	/**
	 * Indents or outdents (depends on the {@link #constructor}'s `indentDirection` parameter) selected list items.
	 *
	 * @fires execute
	 */
	execute() {
		const model = this.editor.model;
		const doc = model.document;

		const itemsToChange = Array.from( doc.selection.getSelectedBlocks() );

		model.change( writer => {
			for ( const item of itemsToChange ) {
				// eslint-disable-next-line no-undef
				console.log( 'indent block', item );

				const currentIndent = item.getAttribute( 'indent' );
				let newIndent;

				if ( this.useClasses ) {
					const currentIndex = this.classes.indexOf( currentIndent );
					newIndent = this.classes[ currentIndex + this.direction ];

					// eslint-disable-next-line no-undef
					console.log( 'indent using classes', currentIndent, currentIndex, newIndent );
				} else {
					const currentOffset = parseFloat( currentIndent || 0 );

					const offsetToSet = currentOffset + this.direction * this.offset;
					newIndent = offsetToSet && offsetToSet > 0 ? offsetToSet + this.unit : undefined;
				}

				if ( newIndent ) {
					writer.setAttribute( 'indent', newIndent, item );
				} else {
					writer.removeAttribute( 'indent', item );
				}
			}
		} );
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */
	_checkEnabled() {
		// Check whether any of position's ancestor is a list item.
		const block = first( this.editor.model.document.selection.getSelectedBlocks() );

		// If selection is not in a list item, the command is disabled.
		if ( !block || !this.editor.model.schema.checkAttribute( block, 'indent' ) ) {
			return false;
		}

		const currentIndent = block.getAttribute( 'indent' );

		// TODO fix this or get reward...
		if ( this.useClasses ) {
			const currentIndex = this.classes.indexOf( currentIndent );

			if ( this.direction > 0 ) {
				return currentIndex < this.classes.length - 1;
			} else {
				return currentIndex >= 0 && currentIndex < this.classes.length;
			}
		} else {
			const currentOffset = parseFloat( currentIndent || 0 );

			// is forward
			if ( this.direction > 0 ) {
				return true;
			} else {
				return currentOffset > 0;
			}
		}
	}
}
