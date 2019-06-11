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
	 */
	constructor( editor, strategy ) {
		super( editor );

		this.strategy = strategy;
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
		if ( !block || !model.schema.checkAttribute( block, 'indent' ) ) {
			this.isEnabled = false;

			return;
		}

		const currentIndent = block.getAttribute( 'indent' );

		this.isEnabled = this.strategy.checkEnabled( currentIndent );
	}

	execute() {
		const model = this.editor.model;
		const doc = model.document;

		const itemsToChange = Array.from( doc.selection.getSelectedBlocks() );

		model.change( writer => {
			for ( const item of itemsToChange ) {
				const currentIndent = item.getAttribute( 'indent' );

				const newIndent = this.strategy.getNewIndent( currentIndent );

				if ( newIndent ) {
					writer.setAttribute( 'indent', newIndent, item );
				} else {
					writer.removeAttribute( 'indent', item );
				}
			}
		} );
	}
}
