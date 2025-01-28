/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module word-count/wordcountconfig
 */

/**
 * The configuration of the word count feature.
 *
 * ```ts
 * ClassicEditor
 * 	.create( {
 * 		wordCount: ... // Word count feature configuration.
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface WordCountConfig {

	/**
	 * This option allows for hiding the word counter. The element obtained through
	 * {@link module:word-count/wordcount~WordCount#wordCountContainer} will only preserve
	 * the characters part. Word counter is displayed by default when this configuration option is not defined.
	 *
	 * ```ts
	 * const wordCountConfig = {
	 * 	displayWords: false
	 * };
	 * ```
	 *
	 * The configuration above will result in the following container:
	 *
	 * ```html
	 * <div class="ck ck-word-count">
	 * 	<div class="ck-word-count__characters">Characters: 28</div>
	 * </div>
	 * ```
	 */
	displayWords?: boolean;

	/**
	 * This option allows for hiding the character counter. The element obtained through
	 * {@link module:word-count/wordcount~WordCount#wordCountContainer} will only preserve
	 * the words part. Character counter is displayed by default when this configuration option is not defined.
	 *
	 * ```ts
	 * const wordCountConfig = {
	 * 	displayCharacters: false
	 * };
	 * ```
	 *
	 * The configuration above will result in the following container:
	 *
	 * ```html
	 * <div class="ck ck-word-count">
	 * 	<div class="ck-word-count__words">Words: 4</div>
	 * </div>
	 * ```
	 */
	displayCharacters?: boolean;

	/**
	 * This configuration takes a function that is executed whenever the word count plugin updates its values.
	 * This function is called with one argument, which is an object with the `words` and `characters` keys containing
	 * the number of detected words and characters in the document.
	 *
	 * ```ts
	 * const wordCountConfig = {
	 * 	onUpdate: function( stats ) {
	 * 		doSthWithWordNumber( stats.words );
	 * 		doSthWithCharacterNumber( stats.characters );
	 * 	}
	 * };
	 * ```
	 */
	onUpdate?: ( data: { words: number; characters: number } ) => void;

	/**
	 * Allows for providing the HTML element that the
	 * {@link module:word-count/wordcount~WordCount#wordCountContainer word count container} will be appended to automatically.
	 *
	 * ```ts
	 * const wordCountConfig = {
	 * 	container: document.getElementById( 'container-for-word-count' );
	 * };
	 * ```
	 */
	container?: HTMLElement;
}
