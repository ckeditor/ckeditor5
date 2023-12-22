/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/tododocumentlist
 */

import { Plugin } from 'ckeditor5/src/core.js';
import TodoList from './todolist.js';

import '../theme/todolist.css';

/**
 * The to-do list feature.
 *
 * @deprecated
 * TODO describe
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

	// TODO warning
}
