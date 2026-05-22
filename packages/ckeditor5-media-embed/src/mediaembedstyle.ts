/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed/mediaembedstyle
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { MediaEmbedStyleEditing } from './mediaembedstyle/mediaembedstyleediting.js';
import { MediaEmbedStyleUI } from './mediaembedstyle/mediaembedstyleui.js';

import '../theme/mediaembedstyle.css';

/**
 * The media embed style plugin.
 *
 * This is a "glue" plugin which loads the following plugins:
 * * {@link module:media-embed/mediaembedstyle/mediaembedstyleediting~MediaEmbedStyleEditing},
 * * {@link module:media-embed/mediaembedstyle/mediaembedstyleui~MediaEmbedStyleUI}
 *
 * For a detailed overview, check the {@glink features/media-embed/media-embed-styles Media embed styles feature documentation}.
 */
export class MediaEmbedStyle extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ MediaEmbedStyleEditing, MediaEmbedStyleUI ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'MediaEmbedStyle' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}
}
