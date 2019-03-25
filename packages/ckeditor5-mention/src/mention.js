/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module mention/mention
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import MentionEditing from './mentionediting';
import MentionUI from './mentionui';

/**
 * The mention plugin.
 *
 * For a detailed overview, check the {@glink features/mention Mention feature documentation}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Mention extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Mention';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ MentionEditing, MentionUI ];
	}
}

/**
 * The configuration of the {@link module:mention/mention~Mention} feature.
 *
 * Read more in {@link module:mention/mention~MentionConfig}.
 *
 * @member {module:mention/mention~MentionConfig} module:core/editor/editorconfig~EditorConfig#mention
 * @type {Array.<module/mention~MentionFeed>}
 */

/**
 * The mention feed descriptor. Used in {@link module:mention/mention~MentionConfig `config.mention`}.
 *
 * See {@link module:mention/mention~MentionConfig} to learn more.
 *
 *		{
 *			marker: '@',
 *			feed: [ 'Alice', 'Bob', ... ],
 *		}
 *
 * @typedef {Object} module:mention/mention~MentionFeed
 * @property {String} [marker='@'] The character which triggers autocompletion for mention.
 * @property {Array.<module:mention/mention~MentionFeedItem>|Function} feed The auto complete feed items. Provide an array for
 * static configuration or a function that returns a promise for asynchronous feeds.
 * @property {Number} [minimumCharacters=0] Specifies after how many characters show the autocomplete panel.
 * @property {Function} [itemRenderer] Function that renders {module:mention/mention~MentionFeedItem}
 * to the autocomplete list to a DOM elemnt.
 */

/**
 * The mention feed item. In configuration might be defined as string or a plain object. The strings will be used as `name` property
 * when converting to an object in the model.
 *
 * *Note* When defining feed item as a plain object you must provide the at least the `name` property.
 *
 * @typedef {Object|String} module:mention/mention~MentionFeedItem
 * @property {String} name Name of the mention.
 */

/**
 * The configuration of the mention features.
 *
 * Read more about {@glink features/mention#configuration configuring the mention feature}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 * 				mention: ... // Media embed feature options.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface MentionConfig
 */
