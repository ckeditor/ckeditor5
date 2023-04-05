/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/subscript
 */

import { Plugin } from 'ckeditor5/src/core';
import SubscriptEditing from './subscript/subscriptediting';
import SubscriptUI from './subscript/subscriptui';

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
	public static get pluginName(): 'Subscript' {
		return 'Subscript';
	}
}
