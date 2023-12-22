/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlist
 */

import { Plugin } from 'ckeditor5/src/core.js';
import List from './list.js';

/**
 * The document list feature.
 *
 * @deprecated
 * TODO describe
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

	// TODO warning
}
