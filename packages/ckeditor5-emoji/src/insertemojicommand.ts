/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module emoji/insertemojicommand
 */

import type { Range } from 'ckeditor5/src/engine.js';
import { Command } from 'ckeditor5/src/core.js';

export default class InsertEmojiCommand extends Command {
	/**
	 * @fires execute
	 */
	public override execute( emoji: string, range: Range ): void {
		const model = this.editor.model;

		model.change( writer => {
			model.insertContent( writer.createText( emoji ), range );
		} );
	}
}
