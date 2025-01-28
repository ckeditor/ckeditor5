/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	Alignment,
	AlignmentEditing,
	AlignmentUI,
	AlignmentCommand,
	AlignmentConfig
} from './index.js';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the {@link module:alignment/alignment~Alignment alignment feature}.
		 *
		 * Read more in {@link module:alignment/alignmentconfig~AlignmentConfig}.
		 */
		alignment?: AlignmentConfig;
	}

	interface PluginsMap {
		[ Alignment.pluginName ]: Alignment;
		[ AlignmentUI.pluginName ]: AlignmentUI;
		[ AlignmentEditing.pluginName ]: AlignmentEditing;
	}

	interface CommandsMap {
		alignment: AlignmentCommand;
	}
}
