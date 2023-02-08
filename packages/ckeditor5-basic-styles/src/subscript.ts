/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/subscript
 */

import { Plugin, type PluginDependencies } from 'ckeditor5/src/core';
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
	public static get requires(): PluginDependencies {
		return [ SubscriptEditing, SubscriptUI ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'Subscript' {
		return 'Subscript';
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Subscript.pluginName ]: Subscript;
	}
}
