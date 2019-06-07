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

				// TODO: split potential:
				if ( this.useClasses ) {
					newIndent = this._getIndentClasses( currentIndent );
				} else {
					newIndent = this._getIndentOffset( currentIndent );
				}

				if ( newIndent ) {
					writer.setAttribute( 'indent', newIndent, item );
				} else {
					writer.removeAttribute( 'indent', item );
				}
			}
		} );
	}

	_getIndentOffset( currentIndent ) {
		const currentOffset = parseFloat( currentIndent || 0 );
		const offsetToSet = currentOffset + this.direction * this.offset;

		return offsetToSet && offsetToSet > 0 ? offsetToSet + this.unit : undefined;
	}

	_getIndentClasses( currentIndent ) {
		const currentIndex = this.classes.indexOf( currentIndent );

		return this.classes[ currentIndex + this.direction ];
	}

	/**
	 * Checks whether the command can be enabled in the current context.
	 *
	 * @private
	 * @returns {Boolean} Whether the command should be enabled.
	 */
	_checkEnabled() {
		// Check whether any of position's ancestor is a list item.
		const editor = this.editor;
		const model = editor.model;

		const block = first( model.document.selection.getSelectedBlocks() );

		// If selection is not in a list item, the command is disabled.
		if ( !block || !model.schema.checkAttribute( block, 'indent' ) ) {
			return false;
		}

		const currentIndent = block.getAttribute( 'indent' );

		// TODO: split potential.
		if ( this.useClasses ) {
			return this._checkEnabledClasses( currentIndent );
		} else {
			return this._checkEnabledOffset( currentIndent );
		}
	}

	_checkEnabledOffset( currentIndent ) {
		const currentOffset = parseFloat( currentIndent || 0 );

		// is forward
		if ( this.direction > 0 ) {
			return true;
		} else {
			return currentOffset > 0;
		}
	}

	_checkEnabledClasses( currentIndent ) {
		const currentIndex = this.classes.indexOf( currentIndent );

		if ( this.direction > 0 ) {
			return currentIndex < this.classes.length - 1;
		} else {
			return currentIndex >= 0 && currentIndex < this.classes.length;
		}
	}
}
