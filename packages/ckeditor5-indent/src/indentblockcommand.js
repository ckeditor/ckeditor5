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
 * The indent block command.
 *
 * The command is registered by the {@link module:indent-block/indentblock~IndentBlock} as `'indentBlock'` - for indenting blocks and
 * `'outdentBlock'` - for outdenting blocks.
 *
 * To increase block indentation at current selection execute the command:
 *
 *		editor.execute( 'indentBlock' );
 *
 * To decrease block indentation at current selection execute the command:
 *
 *		editor.execute( 'outdentBlock' );
 *
 * @extends module:core/plugin~Plugin
 */
export default class IndentBlockCommand extends Command {
	/**
	 * Creates an instance of the command.
	 *
	 * @param {module:core/editor/editor~Editor} editor Editor instance.
	 * @param {module:indent-block/indentblockcommand~IndentBehavior} indentBehavior
	 */
	constructor( editor, indentBehavior ) {
		super( editor );

		/**
		 * Command's indentation behavior.
		 *
		 * @type {module:indent-block/indentblockcommand~IndentBehavior}
		 * @private
		 */
		this._indentBehavior = indentBehavior;
	}

	/**
	 * @inheritDoc
	 */
	refresh() {
		// Check whether any of position's ancestor is a list item.
		const editor = this.editor;
		const model = editor.model;

		const block = first( model.document.selection.getSelectedBlocks() );

		// If selection is not in a list item, the command is disabled.
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
		const doc = model.document;

		const itemsToChange = Array.from( doc.selection.getSelectedBlocks() );

		model.change( writer => {
			for ( const item of itemsToChange ) {
				const currentIndent = item.getAttribute( 'blockIndent' );

				const newIndent = this._indentBehavior.getNewIndent( currentIndent );

				if ( newIndent ) {
					writer.setAttribute( 'blockIndent', newIndent, item );
				} else {
					writer.removeAttribute( 'blockIndent', item );
				}
			}
		} );
	}
}

/**
 * Provides indentation behavior to {@link module:indent-block/indentblockcommand~IndentBlockCommand}.
 *
 * @interface module:indent-block/indentblockcommand~IndentBehavior
 */

/**
 * Performs check if command should be enabled.
 *
 * @method #checkEnabled
 * @param {String} indentAttributeValue Current indent attribute value.
 * @returns {Boolean}
 */

/**
 * Returns new indent attribute value based on current indent.
 *
 * @method #getNewIndent
 * @param {String} indentAttributeValue Current indent attribute value.
 * @returns {String|undefined}
 */
