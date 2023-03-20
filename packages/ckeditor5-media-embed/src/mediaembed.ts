/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module media-embed/mediaembed
 */

import { Plugin } from 'ckeditor5/src/core';
import { Widget } from 'ckeditor5/src/widget';

import MediaEmbedEditing from './mediaembedediting';
import AutoMediaEmbed from './automediaembed';
import MediaEmbedUI from './mediaembedui';

import '../theme/mediaembed.css';

/**
 * The media embed plugin.
 *
 * For a detailed overview, check the {@glink features/media-embed Media Embed feature documentation}.
 *
 * This is a "glue" plugin which loads the following plugins:
 *
 * * The {@link module:media-embed/mediaembedediting~MediaEmbedEditing media embed editing feature},
 * * The {@link module:media-embed/mediaembedui~MediaEmbedUI media embed UI feature} and
 * * The {@link module:media-embed/automediaembed~AutoMediaEmbed auto-media embed feature}.
 */
export default class MediaEmbed extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ MediaEmbedEditing, MediaEmbedUI, AutoMediaEmbed, Widget ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'MediaEmbed' {
		return 'MediaEmbed';
	}
}
