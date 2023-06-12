/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module show-blocks/showblockscommand
 */

import { Command, type Editor } from 'ckeditor5/src/core';

/**
 * The show blocks command.
 *
 * Displays the HTML element names for content blocks.
 */
export default class ShowBlocksCommand extends Command {
	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		// It does not affect data so should be enabled in read-only mode.
		this.affectsData = false;
	}

	/**
	 * @TODO
	 */
	public override execute(): void {
		const CLASS_NAME = 'ck-show-blocks';
		const view = this.editor.editing.view;

		view.change( writer => {
			// Multiroot support.
			for ( const root of view.document.roots ) {
				if ( !root.hasClass( CLASS_NAME ) ) {
					writer.addClass( CLASS_NAME, root );
				} else {
					writer.removeClass( CLASS_NAME, root );
				}
			}
		} );
	}
}
