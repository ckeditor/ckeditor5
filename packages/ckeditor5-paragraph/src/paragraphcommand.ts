/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module paragraph/paragraphcommand
 */

import { Command } from '@ckeditor/ckeditor5-core';
import { first } from '@ckeditor/ckeditor5-utils';

import type { Schema, Selection, DocumentSelection, Element } from '@ckeditor/ckeditor5-engine';

/**
 * The paragraph command.
 */
export default class ParagraphCommand extends Command {
	/**
	 * The value of the command. Indicates whether the selection start is placed in a paragraph.
	 *
	 * @readonly
	 * @observable
	 */
	declare public value: boolean;

	/**
	 * @inheritDoc
	 */
	public override refresh(): void {
		const model = this.editor.model;
		const document = model.document;
		const block = first( document.selection.getSelectedBlocks() );

		this.value = !!block && block.is( 'element', 'paragraph' );
		this.isEnabled = !!block && checkCanBecomeParagraph( block, model.schema );
	}

	/**
	 * Executes the command. All the blocks (see {@link module:engine/model/schema~Schema}) in the selection
	 * will be turned to paragraphs.
	 *
	 * @fires execute
	 * @param options Options for the executed command.
	 * @param options.selection The selection that the command should be applied to. By default,
	 * if not provided, the command is applied to the {@link module:engine/model/document~Document#selection}.
	 */
	public override execute( options: {
		selection?: Selection | DocumentSelection;
	} = {} ): void {
		const model = this.editor.model;
		const document = model.document;

		model.change( writer => {
			const blocks = ( options.selection || document.selection ).getSelectedBlocks();

			for ( const block of blocks ) {
				if ( !block.is( 'element', 'paragraph' ) && checkCanBecomeParagraph( block, model.schema ) ) {
					writer.rename( block, 'paragraph' );
				}
			}
		} );
	}
}

/**
 * Checks whether the given block can be replaced by a paragraph.
 *
 * @param block A block to be tested.
 * @param schema The schema of the document.
 */
function checkCanBecomeParagraph( block: Element, schema: Schema ): boolean {
	return schema.checkChild( block.parent as Element, 'paragraph' ) && !schema.isObject( block );
}

declare module '@ckeditor/ckeditor5-core' {
	interface CommandsMap {
		paragraph: ParagraphCommand;
	}
}
