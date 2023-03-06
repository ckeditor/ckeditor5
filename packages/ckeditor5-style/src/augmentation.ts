/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	// config
	StyleConfig,

	// commands
	StyleCommand,

	// plugins
	Style,
	StyleEditing,
	StyleUI,
	StyleUtils
} from './index';

declare module '@ckeditor/ckeditor5-core' {
	interface PluginsMap {
		[ Style.pluginName ]: Style;
		[ StyleEditing.pluginName ]: StyleEditing;
		[ StyleUI.pluginName ]: StyleUI;
		[ StyleUtils.pluginName ]: StyleUtils;
	}

	interface CommandsMap {
		style: StyleCommand;
	}

	interface EditorConfig {

		/**
		 * The configuration of the {@link module:style/style~Style} feature.
		 *
		 * Read more in {@link module:style/styleconfig~StyleConfig}.
		 */
		style?: StyleConfig;
	}
}
