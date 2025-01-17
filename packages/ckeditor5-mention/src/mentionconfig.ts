/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module mention/mentionconfig
 */

/**
 * The configuration of the mention feature.
 *
 * Read more about {@glink features/mentions#configuration configuring the mention feature}.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		mention: ... // Mention feature options.
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface MentionConfig {

	/**
	 * The list of mention feeds supported by the editor.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		plugins: [ Mention, ... ],
	 * 		mention: {
	 * 			feeds: [
	 * 				{
	 * 					marker: '@',
	 * 					feed: [ '@Barney', '@Lily', '@Marshall', '@Robin', '@Ted' ]
	 * 				},
	 * 				...
	 * 			]
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * You can provide many mention feeds but they must use different `marker`s.
	 * For example, you can use `'@'` to autocomplete people and `'#'` to autocomplete tags.
	 */
	feeds: Array<MentionFeed>;

	/**
	 * The configuration of the custom commit keys supported by the editor.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		plugins: [ Mention, ... ],
	 * 		mention: {
	 * 			// [ Enter, Space ]
	 * 			commitKeys: [ 13, 32 ]
	 * 			feeds: [
	 * 				{ ... }
	 * 				...
	 * 			]
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * Custom commit keys configuration allows you to customize how users will confirm the selection of mentions from the dropdown list.
	 * You can add as many mention commit keys as you need. For instance, in the snippet above new mentions will be committed by pressing
	 * either <kbd>Enter</kbd> or <kbd>Space</kbd> (13 and 32 key codes respectively).
	 *
	 * @default [ 13, 9 ] // [ Enter, Tab ]
	 */
	commitKeys?: Array<number>;

	/**
	 * The configuration of the custom number of visible mentions.
	 *
	 * Customizing the number of visible mentions allows you to specify how many available elements will the users be able to see
	 * in the dropdown list. You can specify any number you see fit. For example, in the snippets below you will find the
	 * dropdownLimit set to `20` and `Infinity` (the latter will result in showing all available mentions).
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		plugins: [ Mention, ... ],
	 * 		mention: {
	 * 			dropdownLimit: 20,
	 * 			feeds: [
	 * 				{ ... }
	 * 				...
	 * 			]
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 *
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		plugins: [ Mention, ... ],
	 * 		mention: {
	 * 			dropdownLimit: Infinity,
	 * 			feeds: [
	 * 				{ ... }
	 * 				...
	 * 			]
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * @default 10
	 */
	dropdownLimit?: number;
}

/**
 * The mention feed descriptor. Used in {@link module:mention/mentionconfig~MentionConfig `config.mention`}.
 *
 * See {@link module:mention/mentionconfig~MentionConfig} to learn more.
 *
 * ```ts
 * // Static configuration.
 * const mentionFeedPeople = {
 * 	marker: '@',
 * 	feed: [ '@Alice', '@Bob', ... ],
 * 	minimumCharacters: 2
 * };
 *
 * // Simple synchronous callback.
 * const mentionFeedTags = {
 * 	marker: '#',
 * 	feed: ( searchString: string ) => {
 * 		return tags
 * 			// Filter the tags list.
 * 			.filter( tag => {
 * 				return tag.toLowerCase().includes( queryText.toLowerCase() );
 * 			} )
 * 	}
 * };
 *
 * const tags = [ 'wysiwyg', 'rte', 'rich-text-edior', 'collaboration', 'real-time', ... ];
 *
 * // Asynchronous callback.
 * const mentionFeedPlaceholders = {
 * 	marker: '$',
 * 	feed: ( searchString: string ) => {
 * 		return getMatchingPlaceholders( searchString );
 * 	}
 * };
 *
 * function getMatchingPlaceholders( searchString: string ) {
 * 	return new Promise<Array<MentionFeedItem>>( resolve => {
 * 		doSomeXHRQuery( result => {
 * 			// console.log( result );
 * 			// -> [ '$name', '$surname', '$postal', ... ]
 *
 * 			resolve( result );
 * 		} );
 * 	} );
 * }
 * ```
 */
export interface MentionFeed {

	/**
	 * The character which triggers autocompletion for mention. It must be a single character.
	 */
	marker: string;

	/**
	 * Autocomplete items. Provide an array for
	 * a static configuration (the mention feature will show matching items automatically) or a function which returns an array of
	 * matching items (directly, or via a promise). If a function is passed, it is executed in the context of the editor instance.
	 */
	feed: Array<MentionFeedItem> | FeedCallback;

	/**
	 * Specifies after how many characters the autocomplete panel should be shown.
	 *
	 * @default 0
	 */
	minimumCharacters?: number;

	/**
	 * A function that renders a {@link module:mention/mentionconfig~MentionFeedItem}
	 * to the autocomplete panel.
	 */
	itemRenderer?: ItemRenderer;

	/**
	 * Specify how many available elements per feeds will the users be able to see in the dropdown list.
	 * If it not set, limit is inherited from {@link module:mention/mentionconfig~MentionConfig#dropdownLimit MentionConfig}.
	 */
	dropdownLimit?: number;
}

/**
 * Function that renders an array of {@link module:mention/mentionconfig~MentionFeedItem} based on string input.
 */
export type FeedCallback = ( searchString: string ) => Array<MentionFeedItem> | Promise<Array<MentionFeedItem>>;

/**
 * Function that takes renders a {@link module:mention/mentionconfig~MentionFeedObjectItem} as HTMLElement.
 */
export type ItemRenderer = ( item: MentionFeedObjectItem ) => HTMLElement | string;

/**
 * The mention feed item. It may be defined as a string or a plain object.
 *
 * When defining a feed item as a plain object, the `id` property is obligatory. Additional properties
 * can be used when customizing the mention feature bahavior
 * (see {@glink features/mentions#customizing-the-autocomplete-list "Customizing the autocomplete list"}
 * and {@glink features/mentions#customizing-the-output "Customizing the output"} sections).
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		plugins: [ Mention, ... ],
 * 		mention: {
 * 			feeds: [
 * 				// Feed items as objects.
 * 				{
 * 					marker: '@',
 * 					feed: [
 * 						{
 * 							id: '@Barney',
 * 							fullName: 'Barney Bloom'
 * 						},
 * 						{
 * 							id: '@Lily',
 * 							fullName: 'Lily Smith'
 * 						},
 * 						{
 * 							id: '@Marshall',
 * 							fullName: 'Marshall McDonald'
 * 						},
 * 						{
 * 							id: '@Robin',
 * 							fullName: 'Robin Hood'
 * 						},
 * 						{
 * 							id: '@Ted',
 * 							fullName: 'Ted Cruze'
 * 						},
 * 						// ...
 * 					]
 * 				},
 *
 * 				// Feed items as plain strings.
 * 				{
 * 					marker: '#',
 * 					feed: [ 'wysiwyg', 'rte', 'rich-text-edior', 'collaboration', 'real-time', ... ]
 * 				},
 * 			]
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 */
export type MentionFeedItem = string | MentionFeedObjectItem;

export type MentionFeedObjectItem = {

	/**
	 * A unique ID of the mention. It must start with the marker character.
	 */
	id: string;

	/**
	 * Text inserted into the editor when creating a mention.
	 */
	text?: string;
};
