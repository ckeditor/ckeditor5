/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module indent/indentblockcommand
 */

import Command from '@ckeditor/ckeditor5-core/src/command';
import first from '@ckeditor/ckeditor5-utils/src/first';

/**
 * The indent block command.
 *
 * The command is registered by the {@link module:indent/indentblock~IndentBlock} as `'indentBlock'` for indenting blocks and
 * `'outdentBlock'` for outdenting blocks.
 *
 * To increase block indentation at the current selection, execute the command:
 *
 *		editor.execute( 'indentBlock' );
 *
 * To decrease block indentation at the current selection, execute the command:
 *
 *		editor.execute( 'outdentBlock' );
 *
 * @extends module:core/command~Command
 */
export default class IndentBlockCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 * @param {module:indent/indentblockcommand~IndentBehavior} indentBehavior
	 */
	constructor( editor, indentBehavior ) {
		super( editor );

		/**
		 * The command's indentation behavior.
		 *
		 * @type {module:indent/indentblockcommand~IndentBehavior}
		 * @private
		 */
		this._indentBehavior = indentBehavior;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		// Check whether any of the position's ancestors is a list item.
		const editor = this.editor;
		const model = editor.model;

		const block = first( model.document.selection.getSelectedBlocks() );

		if ( !block || !model.schema.checkAttribute( block, 'blockIndent' ) ) {
			this.isEnabled = false;

			return;
		}

		this.isEnabled = this._indentBehavior.checkEnabled( block.getAttribute( 'blockIndent' ) );
	}

	/**
	 * @inheritDoc
	 */
	execute() {
		const model = this.editor.model;

		const blocksToChange = getBlocksToChange( model );

		model.change( writer => {
			for ( const block of blocksToChange ) {
				const currentIndent = block.getAttribute( 'blockIndent' );

				const nextIndent = this._indentBehavior.getNextIndent( currentIndent );

				if ( nextIndent ) {
					writer.setAttribute( 'blockIndent', nextIndent, block );
				} else {
					writer.removeAttribute( 'blockIndent', block );
				}
			}
		} );
	}
}

// Returns blocks from selection that should have blockIndent selection set.
//
// @param {module:engine/model/model~model} model A model.
function getBlocksToChange( model ) {
	const selection = model.document.selection;
	const schema = model.schema;
	const blocksInSelection = Array.from( selection.getSelectedBlocks() );

	return blocksInSelection.filter( block => schema.checkAttribute( block, 'blockIndent' ) );
}

/**
 * Provides indentation behavior to {@link module:indent/indentblockcommand~IndentBlockCommand}.
 *
 * @interface module:indent/indentblockcommand~IndentBehavior
 */

/**
 * Checks if the command should be enabled.
 *
 * @method #checkEnabled
 * @param {String} indentAttributeValue The current indent attribute value.
 * @returns {Boolean}
 */

/**
 * Returns a new indent attribute value based on the current indent. This method returns `undefined` when the indentation should be removed.
 *
 * @method #getNextIndent
 * @param {String} indentAttributeValue The current indent attribute value.
 * @returns {String|undefined}
 */
