/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/generalhtmlsupport
 */

import { Plugin } from 'ckeditor5/src/core';

import DataFilter from './datafilter';
import CodeBlockElementSupport from './integrations/codeblock';
import DualContentModelElementSupport from './integrations/dualcontent';
import HeadingElementSupport from './integrations/heading';
import ImageElementSupport from './integrations/image';
import MediaEmbedElementSupport from './integrations/mediaembed';
import TableElementSupport from './integrations/table';

/**
 * The General HTML Support feature.
 *
 * This is a "glue" plugin which initializes the {@link module:html-support/datafilter~DataFilter data filter} configuration
 * and features integration with the General HTML Support.
 *
 * @extends module:core/plugin~Plugin
 */
export default class GeneralHtmlSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'GeneralHtmlSupport';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [
			DataFilter,
			CodeBlockElementSupport,
			DualContentModelElementSupport,
			HeadingElementSupport,
			ImageElementSupport,
			MediaEmbedElementSupport,
			TableElementSupport
		];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const dataFilter = editor.plugins.get( DataFilter );

		// Load the filtering configuration.
		dataFilter.loadAllowedConfig( editor.config.get( 'htmlSupport.allow' ) || [] );
		dataFilter.loadDisallowedConfig( editor.config.get( 'htmlSupport.disallow' ) || [] );
	}
}

/**
 * The configuration of the General HTML Support feature.
 * Introduced by the {@link module:html-support/generalhtmlsupport~GeneralHtmlSupport} feature.
 *
 * Read more in {@link module:html-support/generalhtmlsupport~GeneralHtmlSupportConfig}.
 *
 * @member {module:htmlsupport/generalhtmlsupport~GeneralHtmlSupportConfig} module:core/editor/editorconfig~EditorConfig#htmlSupport
 */

/**
 * The configuration of the General HTML Support feature.
 * The option is used by the {@link module:html-support/generalhtmlsupport~GeneralHtmlSupport} feature.
 *
 *		ClassicEditor
 *			.create( {
 * 				htmlSupport: ... // General HTML Support feature config.
 *			} )
 *			.then( ... )
 *			.catch( ... );
 *
 * See {@link module:core/editor/editorconfig~EditorConfig all editor options}.
 *
 * @interface GeneralHtmlSupportConfig
 */

/**
 * The configuration of allowed content rules used by General HTML Support.
 *
 * Setting this configuration option will enable HTML features that are not explicitly supported by any other dedicated CKEditor 5 features.
 *
 * 		const htmlSupportConfig.allow = [
 * 			{
 * 				name: 'div',                      // Enable 'div' element support,
 * 				classes: [ 'special-container' ], // allow 'special-container' class,
 * 				styles: 'background',             // allow 'background' style,
 * 				attributes: true                  // allow any attribute (can be empty).
 * 			},
 * 			{
 * 				name: 'p',                                   // Extend existing Paragraph feature,
 * 				classes: 'highlighted'                       // with 'highlighted' class,
 * 				attributes: [
 * 					{ key: 'data-i18n-context, value: true } // and i18n attribute.
 * 				]
 * 			}
 * 		];
 *
 * @member {Array.<module:engine/view/matcher~MatcherPattern>} module:html-support/generalhtmlsupport~GeneralHtmlSupportConfig#allow
 */

/**
 * The configuration of disallowed content rules used by General HTML Support.
 *
 * Setting this configuration option will disable listed HTML features.
 *
 * 		const htmlSupportConfig.disallow = [
 * 			{
 * 				name: /[\s\S]+/    // For every HTML feature,
 * 				attributes: {
 * 					key: /^on.*$/ // disable 'on*' attributes, like 'onClick', 'onError' etc.
 * 				}
 * 			}
 * 		];
 * @member {Array.<module:engine/view/matcher~MatcherPattern>} module:html-support/generalhtmlsupport~GeneralHtmlSupportConfig#disallow
 */
