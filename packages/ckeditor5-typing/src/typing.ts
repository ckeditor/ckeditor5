/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/typing
 */

import { Plugin, type PluginDependencies } from '@ckeditor/ckeditor5-core';
import Input from './input';
import Delete from './delete';

/**
 * The typing feature. It handles typing.
 *
 * This is a "glue" plugin which loads the {@link module:typing/input~Input} and {@link module:typing/delete~Delete}
 * plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Typing extends Plugin {
	public static get requires(): PluginDependencies {
		return [ Input, Delete ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'Typing' {
		return 'Typing';
	}
}

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Typing.pluginName ]: Typing;
	}
}
