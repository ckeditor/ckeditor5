/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
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
 *
 * @extends module:core/plugin~Plugin
 */
export default class Subscript extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ SubscriptEditing, SubscriptUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Subscript';
	}
}
