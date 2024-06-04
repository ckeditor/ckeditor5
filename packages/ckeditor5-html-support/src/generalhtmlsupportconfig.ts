/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/generalhtmlsupportconfig
 */

import type { MatcherObjectPattern } from 'ckeditor5/src/engine.js';

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
}
