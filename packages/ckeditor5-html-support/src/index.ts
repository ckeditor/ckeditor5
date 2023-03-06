/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support
 */

export { default as GeneralHtmlSupport } from './generalhtmlsupport';
export { default as DataFilter } from './datafilter';
export { default as DataSchema } from './dataschema';
export { default as HtmlComment } from './htmlcomment';
export { default as FullPage } from './fullpage';
export { default as HtmlPageDataProcessor } from './htmlpagedataprocessor';
export type { GeneralHtmlSupportConfig } from './generalhtmlsupportconfig';
export type { default as CodeBlockElementSupport } from './integrations/codeblock';
export type { default as CustomElementSupport } from './integrations/customelement';
export type { default as DocumentListElementSupport } from './integrations/documentlist';
export type { default as DualContentModelElementSupport } from './integrations/dualcontent';
export type { default as HeadingElementSupport } from './integrations/heading';
export type { default as ImageElementSupport } from './integrations/image';
export type { default as MediaEmbedElementSupport } from './integrations/mediaembed';
export type { default as ScriptElementSupport } from './integrations/script';
export type { default as StyleElementSupport } from './integrations/style';
export type { default as TableElementSupport } from './integrations/table';

import './augmentation';
