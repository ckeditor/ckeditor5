/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	Heading,
	HeadingCommand,
	HeadingConfig,
	HeadingEditing,
	HeadingUI,
	Title,
	TitleConfig
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the heading feature. Introduced by the {@link module:heading/headingediting~HeadingEditing} feature.
		 *
		 * Read more in {@link module:heading/headingconfig~HeadingConfig}.
		 */
		heading?: HeadingConfig;

		/**
		 * The configuration of the {@link module:heading/title~Title title feature}.
		 *
		 * Read more in {@link module:heading/title~TitleConfig}.
		 */
		title?: TitleConfig;
	}

	interface PluginsMap {
		[ Heading.pluginName ]: Heading;
		[ HeadingEditing.pluginName ]: HeadingEditing;
		[ HeadingUI.pluginName ]: HeadingUI;
		[ Title.pluginName ]: Title;
	}

	interface CommandsMap {
		heading: HeadingCommand;
	}
}
