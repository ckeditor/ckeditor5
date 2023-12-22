/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module list/documentlistproperties
 */

import { Plugin } from 'ckeditor5/src/core.js';
import ListProperties from './listproperties.js';

/**
 * The document list properties feature.
 *
 * @deprecated
 * TODO describe
 */
export default class DocumentListProperties extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ ListProperties ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'DocumentListProperties' as const;
	}

	// TODO warning
}
