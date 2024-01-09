/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/superscript
 */

import { Plugin } from 'ckeditor5/src/core.js';
import SuperscriptEditing from './superscript/superscriptediting.js';
import SuperscriptUI from './superscript/superscriptui.js';

/**
 * The superscript feature.
 *
 * It loads the {@link module:basic-styles/superscript/superscriptediting~SuperscriptEditing} and
 * {@link module:basic-styles/superscript/superscriptui~SuperscriptUI} plugins.
 */
export default class Superscript extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ SuperscriptEditing, SuperscriptUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Superscript' as const;
	}
}
