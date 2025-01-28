/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles/subscript
 */

import { Plugin } from 'ckeditor5/src/core.js';
import SubscriptEditing from './subscript/subscriptediting.js';
import SubscriptUI from './subscript/subscriptui.js';

/**
 * The subscript feature.
 *
 * It loads the {@link module:basic-styles/subscript/subscriptediting~SubscriptEditing} and
 * {@link module:basic-styles/subscript/subscriptui~SubscriptUI} plugins.
 */
export default class Subscript extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ SubscriptEditing, SubscriptUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Subscript' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
