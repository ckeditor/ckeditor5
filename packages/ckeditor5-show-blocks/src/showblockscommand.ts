/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module show-blocks/showblockscommand
 */

import { Command, type Editor } from 'ckeditor5/src/core.js';

/**
 * The show blocks command.
 *
 * Displays the HTML element names for content blocks.
 */
export default class ShowBlocksCommand extends Command {
	/**
	 * Flag indicating whether the command is active, i.e. content blocks are displayed.
	 */
	declare public value: boolean;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		// It does not affect data so should be enabled in read-only mode.
		this.affectsData = false;

		this.value = false;
	}

	/**
	 * Toggles the visibility of content blocks.
	 */
	public override execute(): void {
		const CLASS_NAME = 'ck-show-blocks';
		const view = this.editor.editing.view;

		view.change( writer => {
			// Multiroot support.
			for ( const root of view.document.roots ) {
				if ( !root.hasClass( CLASS_NAME ) ) {
					writer.addClass( CLASS_NAME, root );
					this.value = true;
				} else {
					writer.removeClass( CLASS_NAME, root );
					this.value = false;
				}
			}
		} );
	}
}
