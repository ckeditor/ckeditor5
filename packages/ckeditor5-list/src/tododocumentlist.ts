/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/tododocumentlist
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { logWarning } from 'ckeditor5/src/utils.js';
import TodoList from './todolist.js';

/**
 * The to-do list feature.
 *
 * This is an obsolete plugin that exists for backward compatibility only.
 * Use the {@link module:list/todolist~TodoList `TodoList`} instead.
 *
 * @deprecated
 */
export default class TodoDocumentList extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ TodoList ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'TodoDocumentList' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	constructor( editor: Editor ) {
		super( editor );

		/**
		 * The `TodoDocumentList` plugin is obsolete. Use `TodoList` instead.
		 *
		 * @error plugin-obsolete-tododocumentlist
		 */
		logWarning( 'plugin-obsolete-tododocumentlist', { pluginName: 'TodoDocumentList' } );
	}
}
