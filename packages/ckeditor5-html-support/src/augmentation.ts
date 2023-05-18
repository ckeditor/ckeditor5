/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type {
	GeneralHtmlSupport,
	DataFilter,
	DataSchema,
	GeneralHtmlSupportConfig,
	CodeBlockElementSupport,
	CustomElementSupport,
	DocumentListElementSupport,
	DualContentModelElementSupport,
	HeadingElementSupport,
	ImageElementSupport,
	MediaEmbedElementSupport,
	ScriptElementSupport,
	StyleElementSupport,
	TableElementSupport,
	HtmlComment,
	FullPage
} from './index';

declare module '@ckeditor/ckeditor5-core' {
	interface EditorConfig {

		/**
		 * The configuration of the General HTML Support feature.
		 * Introduced by the {@link module:html-support/generalhtmlsupport~GeneralHtmlSupport} feature.
		 *
		 * Read more in {@link module:html-support/generalhtmlsupportconfig~GeneralHtmlSupportConfig}.
		 */
		htmlSupport?: GeneralHtmlSupportConfig;
	}

	interface PluginsMap {
		[ GeneralHtmlSupport.pluginName ]: GeneralHtmlSupport;
		[ DataFilter.pluginName ]: DataFilter;
		[ DataSchema.pluginName ]: DataSchema;
		[ CodeBlockElementSupport.pluginName ]: CodeBlockElementSupport;
		[ CustomElementSupport.pluginName ]: CustomElementSupport;
		[ DocumentListElementSupport.pluginName ]: DocumentListElementSupport;
		[ DualContentModelElementSupport.pluginName ]: DualContentModelElementSupport;
		[ HeadingElementSupport.pluginName ]: HeadingElementSupport;
		[ ImageElementSupport.pluginName ]: ImageElementSupport;
		[ MediaEmbedElementSupport.pluginName ]: MediaEmbedElementSupport;
		[ ScriptElementSupport.pluginName ]: ScriptElementSupport;
		[ StyleElementSupport.pluginName ]: StyleElementSupport;
		[ TableElementSupport.pluginName ]: TableElementSupport;
		[ HtmlComment.pluginName ]: HtmlComment;
		[ FullPage.pluginName ]: FullPage;
	}
}
