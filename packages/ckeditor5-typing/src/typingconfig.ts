/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module typing/typingconfig
 */

/**
 * The configuration of the typing features. Used by the typing features in `@ckeditor/ckeditor5-typing` package.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		typing: ... // Typing feature options.
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface TypingConfig {

	/**
	 * The granularity of undo/redo for typing and deleting. The value `20` means (more or less) that a new undo step
	 * is created every 20 characters are inserted or deleted.
	 *
	 * @default 20
	 */
	undoStep?: number;

	/**
	 * The configuration of the {@link module:typing/texttransformation~TextTransformation} feature.
	 *
	 * Read more in {@link module:typing/typingconfig~TextTransformationConfig}.
	 */
	transformations: TextTransformationConfig;
}

/**
 * The configuration of the text transformation feature.
 *
 * ```ts
 * ClassicEditor
 * 	.create( editorElement, {
 * 		typing: {
 * 			transformations: ... // Text transformation feature options.
 * 		}
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * By default, the feature comes pre-configured
 * (via {@link module:typing/typingconfig~TextTransformationConfig#include `config.typing.transformations.include`}) with the
 * following groups of transformations:
 *
 * * Typography (group name: `typography`)
 *   - `ellipsis`: transforms `...` to `…`
 *   - `enDash`: transforms ` -- ` to ` – `
 *   - `emDash`: transforms ` --- ` to ` — `
 * * Quotations (group name: `quotes`)
 *   - `quotesPrimary`: transforms `"Foo bar"` to `“Foo bar”`
 *   - `quotesSecondary`: transforms `'Foo bar'` to `‘Foo bar’`
 * * Symbols (group name: `symbols`)
 *   - `trademark`: transforms `(tm)` to `™`
 *   - `registeredTrademark`: transforms `(r)` to `®`
 *   - `copyright`: transforms `(c)` to `©`
 * * Mathematical (group name: `mathematical`)
 *   - `oneHalf`: transforms `1/2` to: `½`
 *   - `oneThird`: transforms `1/3` to: `⅓`
 *   - `twoThirds`: transforms `2/3` to: `⅔`
 *   - `oneForth`: transforms `1/4` to: `¼`
 *   - `threeQuarters`: transforms `3/4` to: `¾`
 *   - `lessThanOrEqual`: transforms `<=` to: `≤`
 *   - `greaterThanOrEqual`: transforms `>=` to: `≥`
 *   - `notEqual`: transforms `!=` to: `≠`
 *   - `arrowLeft`: transforms `<-` to: `←`
 *   - `arrowRight`: transforms `->` to: `→`
 * * Misc:
 *   - `quotesPrimaryEnGb`: transforms `'Foo bar'` to `‘Foo bar’`
 *   - `quotesSecondaryEnGb`: transforms `"Foo bar"` to `“Foo bar”`
 *   - `quotesPrimaryPl`: transforms `"Foo bar"` to `„Foo bar”`
 *   - `quotesSecondaryPl`:  transforms `'Foo bar'` to `‚Foo bar’`
 *
 * In order to load additional transformations, use the
 * {@link module:typing/typingconfig~TextTransformationConfig#extra `transformations.extra` option}.
 *
 * In order to narrow down the list of transformations, use the
 * {@link module:typing/typingconfig~TextTransformationConfig#remove `transformations.remove` option}.
 *
 * In order to completely override the supported transformations, use the
 * {@link module:typing/typingconfig~TextTransformationConfig#include `transformations.include` option}.
 *
 * Examples:
 *
 * ```ts
 * const transformationsConfig = {
 * 	include: [
 * 		// Use only the 'quotes' and 'typography' groups.
 * 		'quotes',
 * 		'typography',
 *
 * 		// Plus, some custom transformation.
 * 		{ from: 'CKE', to: 'CKEditor' }
 * 	]
 * };
 *
 * const transformationsConfig = {
 * 	// Remove the 'ellipsis' transformation loaded by the 'typography' group.
 * 	remove: [ 'ellipsis' ]
 * }
 * ```
 */
export interface TextTransformationConfig {

	/**
	 * The standard list of text transformations supported by the editor. By default it comes pre-configured with a couple dozen of them
	 * (see {@link module:typing/typingconfig~TextTransformationConfig} for the full list). You can override this list completely
	 * by setting this option or use the other two options
	 * ({@link module:typing/typingconfig~TextTransformationConfig#extra `transformations.extra`},
	 * {@link module:typing/typingconfig~TextTransformationConfig#remove `transformations.remove`}) to fine-tune the default list.
	 */
	include: Array<TextTransformationDescription | string>;

	/**
	 * Additional text transformations that are added to the transformations defined in
	 * {@link module:typing/typingconfig~TextTransformationConfig#include `transformations.include`}.
	 *
	 * ```ts
	 * const transformationsConfig = {
	 * 	extra: [
	 * 		{ from: 'CKE', to: 'CKEditor' }
	 * 	]
	 * };
	 * ```
	 */
	extra?: Array<TextTransformationDescription | string>;

	/**
	 * The text transformation names that are removed from transformations defined in
	 * {@link module:typing/typingconfig~TextTransformationConfig#include `transformations.include`} or
	 * {@link module:typing/typingconfig~TextTransformationConfig#extra `transformations.extra`}.
	 *
	 * ```ts
	 * const transformationsConfig = {
	 * 	remove: [
	 * 		'ellipsis',    // Remove only 'ellipsis' from the 'typography' group.
	 * 		'mathematical' // Remove all transformations from the 'mathematical' group.
	 * 	]
	 * }
	 * ```
	 */
	remove?: Array<TextTransformationDescription | string>;
}

/**
 * The text transformation definition object. It describes what should be replaced with what.
 *
 * The input value (`from`) can be passed either as a string or as a regular expression.
 *
 * * If a string is passed, it will be simply checked if the end of the input matches it.
 * * If a regular expression is passed, its entire length must be covered with capturing groups (e.g. `/(foo)(bar)$/`).
 * Also, since it is compared against the end of the input, it has to end with  `$` to be correctly matched.
 * See examples below.
 *
 * The output value (`to`) can be passed as a string, as an array or as a function.
 *
 * * If a string is passed, it will be used as a replacement value as-is. Note that a string output value can be used only if
 * the input value is a string, too.
 * * If an array is passed, it has to have the same number of elements as there are capturing groups in the input value regular expression.
 * Each capture group will be replaced with a corresponding string from the passed array. If a given capturing group should not be replaced,
 * use `null` instead of passing a string.
 * * If a function is used, it should return an array as described above. The function is passed one parameter &mdash; an array with matches
 * by the regular expression. See the examples below.
 *
 * A simple string-to-string replacement:
 *
 * ```ts
 * { from: '(c)', to: '©' }
 * ```
 *
 * Change quote styles using a regular expression. Note how all the parts are in separate capturing groups and the space at the beginning
 * and the text inside quotes are not replaced (`null` passed as the first and the third value in the `to` parameter):
 *
 * ```ts
 * {
 * 	from: /(^|\s)(")([^"]*)(")$/,
 * 	to: [ null, '“', null, '”' ]
 * }
 * ```
 *
 * Automatic uppercase after a dot using a callback:
 *
 * ```ts
 * {
 * 	from: /(\. )([a-z])$/,
 * 	to: matches => [ null, matches[ 1 ].toUpperCase() ]
 * }
 * ```
 */
export interface TextTransformationDescription {

	/**
	 * The string or regular expression to transform.
	 */
	from: string | RegExp;

	/**
	 * The text to transform compatible with `String.replace()`.
	 */
	to: string | Array<string | null> | ( ( matches: Array<string> ) => Array<string | null> );
}
