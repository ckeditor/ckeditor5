/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support
 */

export { GeneralHtmlSupport } from './generalhtmlsupport.js';
export { DataFilter, type DataFilterRegisterEvent } from './datafilter.js';
export { DataSchema, type DataSchemaBlockElementDefinition } from './dataschema.js';
export { HtmlComment } from './htmlcomment.js';
export { FullPage } from './fullpage.js';
export { HtmlPageDataProcessor } from './htmlpagedataprocessor.js';
export { EmptyBlock } from './emptyblock.js';
export type { GeneralHtmlSupportConfig } from './generalhtmlsupportconfig.js';
export type { CodeBlockElementSupport } from './integrations/codeblock.js';
export type { CustomElementSupport } from './integrations/customelement.js';
export type { ListElementSupport } from './integrations/list.js';
export type { DualContentModelElementSupport } from './integrations/dualcontent.js';
export type { HeadingElementSupport } from './integrations/heading.js';
export type { ImageElementSupport } from './integrations/image.js';
export type { MediaEmbedElementSupport } from './integrations/mediaembed.js';
export type { ScriptElementSupport } from './integrations/script.js';
export type { StyleElementSupport } from './integrations/style.js';
export type { TableElementSupport } from './integrations/table.js';
export type { HorizontalLineElementSupport } from './integrations/horizontalline.js';

import './augmentation.js';
