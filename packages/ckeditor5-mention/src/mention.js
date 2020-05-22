/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module mention/mention
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import MentionEditing, { _toMentionAttribute } from './mentionediting';
import MentionUI from './mentionui';

import '../theme/mention.css';

/**
 * The mention plugin.
 *
 * For a detailed overview, check the {@glink features/mentions Mention feature documentation}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Mention extends Plugin {
	/**
	 * Creates a mention attribute value from the provided view element and optional data.
	 *
	 *		editor.plugins.get( 'Mention' ).toMentionAttribute( viewElement, { userId: '1234' } );
	 *
	 *		// For a view element: <span data-mention="@joe">@John Doe</span>
	 *		// it will return:
	 *		// { id: '@joe', userId: '1234', uid: '7a7bc7...', _text: '@John Doe' }
	 *
	 * @param {module:engine/view/element~Element} viewElement
	 * @param {String|Object} [data] Additional data to be stored in the mention attribute.
	 * @returns {module:mention/mention~MentionAttribute}
	 */
	toMentionAttribute( viewElement, data ) {
		return _toMentionAttribute( viewElement, data );
	}

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
 * The configuration of the mention feature.
 *
 * Read more about {@glink features/mentions#configuration configuring the mention feature}.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				mention: ... // Mention feature options.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface MentionConfig
 */

/**
 * The list of mention feeds supported by the editor.
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				plugins: [ Mention, ... ],
 *				mention: {
 *					feeds: [
 *						{
 *							marker: '@',
 *							feed: [ '@Barney', '@Lily', '@Marshall', '@Robin', '@Ted' ]
 *						},
 *						...
 * 					]
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * You can provide many mention feeds but they must use different `marker`s.
 * For example, you can use `'@'` to autocomplete people and `'#'` to autocomplete tags.
 *
 * @member {Array.<module:mention/mention~MentionFeed>} module:mention/mention~MentionConfig#feeds
 */

/**
 * The mention feed descriptor. Used in {@link module:mention/mention~MentionConfig `config.mention`}.
 *
 * See {@link module:mention/mention~MentionConfig} to learn more.
 *
 *		// Static configuration.
 *		const mentionFeedPeople = {
 *			marker: '@',
 *			feed: [ '@Alice', '@Bob', ... ],
 *			minimumCharacters: 2
 *		};
 *
 *		// Simple synchronous callback.
 *		const mentionFeedTags = {
 *			marker: '#',
 *			feed: searchString => {
 *				return tags
 *					// Filter the tags list.
 *					.filter( tag => {
 *						return tag.toLowerCase().includes( queryText.toLowerCase() );
 *					} )
 *					// Return 10 items max - needed for generic queries when the list may contain hundreds of elements.
 *					.slice( 0, 10 );
 *			}
 * 		};
 *
 *		const tags = [ 'wysiwyg', 'rte', 'rich-text-edior', 'collaboration', 'real-time', ... ];
 *
 *		// Asynchronous callback.
 *		const mentionFeedPlaceholders = {
 *			marker: '$',
 *			feed: searchString => {
 *				return getMatchingPlaceholders( searchString );
 *			}
 * 		};
 *
 *		function getMatchingPlaceholders( searchString ) {
 *			return new Promise( resolve => {
 *				doSomeXHRQuery( result => {
 *					// console.log( result );
 *					// -> [ '$name', '$surname', '$postal', ... ]
 *
 *					resolve( result );
 * 				} );
 *			} );
 *		}
 *
 * @typedef {Object} module:mention/mention~MentionFeed
 * @property {String} [marker] The character which triggers autocompletion for mention. It must be a single character.
 * @property {Array.<module:mention/mention~MentionFeedItem>|Function} feed Autocomplete items. Provide an array for
 * a static configuration (the mention feature will show matching items automatically) or a function which returns an array of
 * matching items (directly, or via a promise). If a function is passed, it is executed in the context of the editor instance.
 * @property {Number} [minimumCharacters=0] Specifies after how many characters the autocomplete panel should be shown.
 * @property {Function} [itemRenderer] A function that renders a {@link module:mention/mention~MentionFeedItem}
 * to the autocomplete panel.
 */

/**
 * The mention feed item. It may be defined as a string or a plain object.
 *
 * When defining a feed item as a plain object, the `id` property is obligatory. Additional properties
 * can be used when customizing the mention feature bahavior
 * (see {@glink features/mentions#customizing-the-autocomplete-list "Customizing the autocomplete list"}
 * and {@glink features/mentions#customizing-the-output "Customizing the output"} sections).
 *
 *		ClassicEditor
 *			.create( editorElement, {
 *				plugins: [ Mention, ... ],
 *				mention: {
 *					feeds: [
 *						// Feed items as objects.
 *						{
 *							marker: '@',
 *							feed: [
 *								{
 *									id: '@Barney',
 *									fullName: 'Barney Bloom'
 *								},
 *								{
 *									id: '@Lily',
 *									fullName: 'Lily Smith'
 *								},
 *								{
 *									id: '@Marshall',
 *									fullName: 'Marshall McDonald'
 *								},
 *								{
 *									id: '@Robin',
 *									fullName: 'Robin Hood'
 *								},
 *								{
 *									id: '@Ted',
 *									fullName: 'Ted Cruze'
 *								},
 *								// ...
 *							]
 *						},
 *
 *						// Feed items as plain strings.
 *						{
 *							marker: '#',
 *							feed: [ 'wysiwyg', 'rte', 'rich-text-edior', 'collaboration', 'real-time', ... ]
 *						},
 * 					]
 *				}
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * @typedef {Object|String} module:mention/mention~MentionFeedItem
 * @property {String} id A unique ID of the mention. It must start with the marker character.
 * @property {String} [text] Text inserted into the editor when creating a mention.
 */

/**
 * Represents a mention in the model.
 *
 * See {@link module:mention/mention~Mention#toMentionAttribute `Mention#toMentionAttribute()`}.
 *
 * @interface module:mention/mention~MentionAttribute
 * @property {String} id The ID of a mention. It identifies the mention item in the mention feed. There can be multiple mentions
 * in the document with the same ID (e.g. the same hashtag being mentioned).
 * @property {String} uid A unique ID of this mention instance. Should be passed as an `option.id` when using
 * {@link module:engine/view/downcastwriter~DowncastWriter#createAttributeElement writer.createAttributeElement()}.
 * @property {String} _text Helper property that stores the text of the inserted mention. Used for detecting a broken mention
 * in the editing area.
 */
