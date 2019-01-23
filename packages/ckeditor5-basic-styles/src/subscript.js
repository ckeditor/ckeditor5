/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module basic-styles/subscript
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
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
