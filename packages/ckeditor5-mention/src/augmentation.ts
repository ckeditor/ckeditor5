/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	MentionConfig,
	Mention,
	MentionEditing,
	MentionUI,
	MentionCommand
} from './index';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the {@link module:mention/mention~Mention} feature.
		 *
		 * Read more in {@link module:mention/mentionconfig~MentionConfig}.
		 */
		mention?: MentionConfig;
	}

	interface PluginsMap {
		[ Mention.pluginName ]: Mention;
		[ MentionEditing.pluginName ]: MentionEditing;
		[ MentionUI.pluginName ]: MentionUI;
	}

	interface CommandsMap {
		mention: MentionCommand;
	}
}
