/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support
 */

export { default as GeneralHtmlSupport } from './generalhtmlsupport.js';
export { default as DataFilter } from './datafilter.js';
export { default as DataSchema, type DataSchemaBlockElementDefinition } from './dataschema.js';
export { default as HtmlComment } from './htmlcomment.js';
export { default as FullPage } from './fullpage.js';
export { default as HtmlPageDataProcessor } from './htmlpagedataprocessor.js';
export type { GeneralHtmlSupportConfig } from './generalhtmlsupportconfig.js';
export type { default as CodeBlockElementSupport } from './integrations/codeblock.js';
export type { default as CustomElementSupport } from './integrations/customelement.js';
export type { default as ListElementSupport } from './integrations/list.js';
export type { default as DualContentModelElementSupport } from './integrations/dualcontent.js';
export type { default as HeadingElementSupport } from './integrations/heading.js';
export type { default as ImageElementSupport } from './integrations/image.js';
export type { default as MediaEmbedElementSupport } from './integrations/mediaembed.js';
export type { default as ScriptElementSupport } from './integrations/script.js';
export type { default as StyleElementSupport } from './integrations/style.js';
export type { default as TableElementSupport } from './integrations/table.js';

import './augmentation.js';
