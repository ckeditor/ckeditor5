/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/documentlist
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { logWarning } from 'ckeditor5/src/utils.js';
import List from './list.js';

/**
 * The document list feature.
 *
 * This is an obsolete plugin that exists for backward compatibility only.
 * Use the {@link module:list/list~List `List`} instead.
 *
 * @deprecated
 */
export default class DocumentList extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ List ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'DocumentList' as const;
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
		 * The `DocumentList` plugin is obsolete. Use `List` instead.
		 *
		 * @error plugin-obsolete-documentlist
		 */
		logWarning( 'plugin-obsolete-documentlist', { pluginName: 'DocumentList' } );
	}
}
