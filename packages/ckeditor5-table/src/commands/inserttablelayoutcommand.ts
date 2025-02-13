/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module table/commands/inserttablecommand
 */

import { Command } from 'ckeditor5/src/core.js';

// TODO: This command will be implemented in the PR with editing part.
export default class InsertTableLayoutCommand extends Command {
	public override execute(
		options: {
			rows?: number;
			columns?: number;
			headingRows?: number;
			headingColumns?: number;
			tableType?: 'layout' | 'content';
		}
	): void {
		console.log( options.tableType );
	}
}
