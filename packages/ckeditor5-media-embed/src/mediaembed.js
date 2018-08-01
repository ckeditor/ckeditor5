/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module media-embed/mediaembed
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import MediaEmbedEditing from './mediaembedediting';
import MediaEmbedUI from './mediaembedui';
import Widget from '@ckeditor/ckeditor5-widget/src/widget';

// import '../theme/mediaembed.css';

/**
 * The media embed plugin.
 *
 * It loads the {@link module:table/mediaembedediting~MediaEmbedEditing media embed editing feature}
 * and {@link module:table/mediaembedui~TableUI media embed UI feature}.
 *
 * For a detailed overview, check the {@glink features/mediaembed Media Embed feature documentation}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class MediaEmbed extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ MediaEmbedEditing, MediaEmbedUI, Widget ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'MediaEmbed';
	}
}

/**
 * The configuration of the media embed features. Used by the media embed features in the `@ckeditor/ckeditor5-media-embed` package.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				mediaEmbed: ... // Media embed feature options.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface MediaEmbedConfig
 */
