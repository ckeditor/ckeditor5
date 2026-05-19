/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedresize
 */

import { Plugin, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';
import { MediaEmbedResizeEditing } from './mediaembedresize/mediaembedresizeediting.js';
import { MediaEmbedResizeHandles } from './mediaembedresize/mediaembedresizehandles.js';

import '../theme/mediaembedresize.css';

/**
 * The media embed resize plugin.
 *
 * It adds a possibility to resize each media embed using handles.
 */
export class MediaEmbedResize extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependenciesOf<[ MediaEmbedResizeEditing, MediaEmbedResizeHandles ]> {
		return [ MediaEmbedResizeEditing, MediaEmbedResizeHandles ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'MediaEmbedResize' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
