/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/generalhtmlsupportconfig
 */

import type { MatcherObjectPattern } from '@ckeditor/ckeditor5-engine';

/**
 * The configuration of the General HTML Support feature.
 * The option is used by the {@link module:html-support/generalhtmlsupport~GeneralHtmlSupport} feature.
 *
 * ```ts
 * ClassicEditor
 * 	.create( {
 * 		htmlSupport: ... // General HTML Support feature config.
 * 	} )
 * 	.then( ... )
 * 	.catch( ... );
 * ```
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 */
export interface GeneralHtmlSupportConfig {

	/**
	 * The configuration of allowed content rules used by General HTML Support.
	 *
	 * Setting this configuration option will enable HTML features that are not explicitly supported by any other
	 * dedicated CKEditor 5 features.
	 *
	 * ```ts
	 * const htmlSupportConfig.allow = [
	 * 	{
	 * 		name: 'div',                      // Enable 'div' element support,
	 * 		classes: [ 'special-container' ], // allow 'special-container' class,
	 * 		styles: 'background',             // allow 'background' style,
	 * 		attributes: true                  // allow any attribute (can be empty).
	 * 	},
	 * 	{
	 * 		name: 'p',                                   // Extend existing Paragraph feature,
	 * 		classes: 'highlighted'                       // with 'highlighted' class,
	 * 		attributes: [
	 * 			{ key: 'data-i18n-context, value: true } // and i18n attribute.
	 * 		]
	 * 	}
	 * ];
	 * ```
	 */
	allow?: Array<MatcherObjectPattern>;

	/**
	 * The configuration of disallowed content rules used by General HTML Support.
	 *
	 * Setting this configuration option will disable listed HTML features.
	 *
	 * ```ts
	 * const htmlSupportConfig.disallow = [
	 * 	{
	 * 		name: /[\s\S]+/    // For every HTML feature,
	 * 		attributes: {
	 * 			key: /^on.*$/ // disable 'on*' attributes, like 'onClick', 'onError' etc.
	 * 		}
	 * 	}
	 * ];
	 * ```
	 */
	disallow?: Array<MatcherObjectPattern>;

	/**
	 * The configuration of allowed empty inline elements that should not be removed.
	 *
	 * Note that you should also add an appropriate entry to {@link #allow} list.
	 *
	 * ```ts
	 * const htmlSupportConfig.allowEmpty = [ 'i', 'span' ];
	 * ```
	 */
	allowEmpty?: Array<string>;

	/**
	 * Whether a filler text (non-breaking space entity — `&nbsp;`) will be inserted into empty block elements in HTML output.
	 * This is used to render block elements properly with line-height.
	 *
	 * When set to `true`, empty blocks will be preserved in the editing view.
	 * When `false` (default), empty blocks are only preserved in the data output.
	 *
	 * The option is used by the {@link module:html-support/emptyblock~EmptyBlock} feature.
	 *
	 * @default false
	 */
	preserveEmptyBlocksInEditingView?: boolean;

	/**
	 * The configuration of the Full page editing feature.
	 * The option is used by the {@link module:html-support/fullpage~FullPage} feature.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( {
	 * 		htmlSupport: {
	 * 			fullPage: ... // Full page feature config.
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 */
	fullPage?: GHSFullPageConfig;

	/**
	 * Controls the `sandbox` attribute on iframe elements by specifying allowed sandbox flags.
	 *
	 * **Note:** This option only affects the editing view and does not modify the data output.
	 *
	 * When set to `false`:
	 *
	 * * The sandbox attribute will not be modified or added to iframe elements.
	 *
	 * When set to `true`:
	 *
	 * * All restrictions are enforced by adding an empty `sandbox` attribute to iframe elements.
	 *
	 * When set to an array of strings:
	 *
	 * * Only the specified sandbox flags will be preserved on iframe elements.
	 * * Any sandbox flags not in the list will be automatically removed.
	 * * If an empty array is provided, the `sandbox` attribute will be added with no flags (enforcing all restrictions).
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( {
	 * 		htmlSupport: {
	 * 			// All restrictions are enforced (empty sandbox attribute).
	 * 			htmlIframeSandbox: true
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * @default true
	 */
	htmlIframeSandbox?: boolean | Array<string>;
}

/**
 * The configuration of the Full page editing feature.
 */
export interface GHSFullPageConfig {

	/**
	 * Whether the feature should allow the editor to render styles from the `<head>` section of editor data content.
	 *
	 * When set to `true`, the editor will render styles from the `<head>` section of editor data content.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( {
	 * 		htmlSupport: {
	 * 			fullPage: {
	 * 				allowRenderStylesFromHead: true
	 * 			}
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 * @default false
	 */
	allowRenderStylesFromHead?: boolean;

	/**
	 * Callback used to sanitize the CSS provided by the user in editor content
	 * when option `htmlSupport.fullPage.allowRenderStylesFromHead` is set to `true`.
	 *
	 * We strongly recommend overwriting the default function to avoid XSS vulnerabilities.
	 *
	 * The function receives the CSS (as a string), and should return an object
	 * that matches the {@link module:html-support/generalhtmlsupportconfig~GHSCssSanitizeOutput} interface.
	 *
	 * ```ts
	 * ClassicEditor
	 * 	.create( editorElement, {
	 * 		htmlSupport: {
	 * 			fullPage: {
	 * 				allowRenderStylesFromHead: true,
	 *
	 * 				sanitizeCss( CssString ) {
	 * 					const sanitizedCss = sanitize( CssString );
	 *
	 * 					return {
	 * 						css: sanitizedCss,
	 * 						// true or false depending on whether the sanitizer stripped anything.
	 * 						hasChanged: ...
	 * 					};
	 * 				}
	 * 			}
	 * 		}
	 * 	} )
	 * 	.then( ... )
	 * 	.catch( ... );
	 * ```
	 *
	 */
	sanitizeCss?: ( css: string ) => GHSCssSanitizeOutput;
}

export interface GHSCssSanitizeOutput {

	/**
	 * An output (safe) CSS that will be inserted into the document.
	 */
	css: string;

	/**
	 * A flag that indicates whether the output CSS is different than the input value.
	 */
	hasChanged: boolean;
}
