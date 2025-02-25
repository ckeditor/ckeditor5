/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import type {
	GeneralHtmlSupport,
	DataFilter,
	DataSchema,
	GeneralHtmlSupportConfig,
	CodeBlockElementSupport,
	CustomElementSupport,
	ListElementSupport,
	DualContentModelElementSupport,
	HeadingElementSupport,
	ImageElementSupport,
	MediaEmbedElementSupport,
	ScriptElementSupport,
	StyleElementSupport,
	TableElementSupport,
	HorizontalLineElementSupport,
	HtmlComment,
	FullPage,
	EmptyBlock
} from './index.js';

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
		[ ListElementSupport.pluginName ]: ListElementSupport;
		[ DualContentModelElementSupport.pluginName ]: DualContentModelElementSupport;
		[ HeadingElementSupport.pluginName ]: HeadingElementSupport;
		[ ImageElementSupport.pluginName ]: ImageElementSupport;
		[ MediaEmbedElementSupport.pluginName ]: MediaEmbedElementSupport;
		[ ScriptElementSupport.pluginName ]: ScriptElementSupport;
		[ StyleElementSupport.pluginName ]: StyleElementSupport;
		[ TableElementSupport.pluginName ]: TableElementSupport;
		[ HorizontalLineElementSupport.pluginName ]: HorizontalLineElementSupport;
		[ HtmlComment.pluginName ]: HtmlComment;
		[ FullPage.pluginName ]: FullPage;
		[ EmptyBlock.pluginName ]: EmptyBlock;
	}
}
