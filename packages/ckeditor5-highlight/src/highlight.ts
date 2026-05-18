/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module highlight/highlight
 */

import { Plugin, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';

import { HighlightEditing } from './highlightediting.js';
import { HighlightUI } from './highlightui.js';

/**
 * The highlight plugin.
 *
 * For a detailed overview, check the {@glink features/highlight Highlight feature} documentation.
 *
 * This is a "glue" plugin which loads the {@link module:highlight/highlightediting~HighlightEditing} and
 * {@link module:highlight/highlightui~HighlightUI} plugins.
 */
export class Highlight extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependenciesOf<[ HighlightEditing, HighlightUI ]> {
		return [ HighlightEditing, HighlightUI ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'Highlight' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
