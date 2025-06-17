/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support
 */

export { GeneralHtmlSupport } from './generalhtmlsupport.js';
export { DataFilter, type HtmlSupportDataFilterRegisterEvent } from './datafilter.js';

export {
	DataSchema,
	type HtmlSupportDataSchemaBlockElementDefinition,
	type HtmlSupportDataSchemaDefinition,
	type HtmlSupportDataSchemaInlineElementDefinition
} from './dataschema.js';

export { HtmlComment, type HtmlCommentData } from './htmlcomment.js';
export { FullPage } from './fullpage.js';
export { HtmlPageDataProcessor } from './htmlpagedataprocessor.js';
export { EmptyBlock } from './emptyblock.js';
export type { GeneralHtmlSupportConfig, GHSFullPageConfig, GHSCssSanitizeOutput } from './generalhtmlsupportconfig.js';
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

export {
	viewToModelObjectConverter as _viewToModelObjectContentHtmlSupportConverter,
	toObjectWidgetConverter as _toObjectWidgetHtmlSupportConverter,
	createObjectView as _createObjectHtmlSupportView,
	viewToAttributeInlineConverter as _viewToAttributeInlineHtmlSupportConverter,
	emptyInlineModelElementToViewConverter as _emptyInlineModelElementToViewHtmlSupportConverter,
	attributeToViewInlineConverter as _attributeToInlineHtmlSupportConverter,
	viewToModelBlockAttributeConverter as _viewToModelBlockAttributeHtmlSupportConverter,
	modelToViewBlockAttributeConverter as _modelToViewBlockAttributeHtmlSupportConverter
} from './converters.js';

export { getDescendantElement as _getHtmlSupportDescendantElement } from './integrations/integrationutils.js';
export { defaultConfig as _HTML_SUPPORT_SCHEMA_DEFINITIONS } from './schemadefinitions.js';

export {
	updateViewAttributes as _updateHtmlSupportViewAttributes,
	setViewAttributes as _setHtmlSupportViewAttributes,
	removeViewAttributes as _removeHtmlSupportViewAttributes,
	mergeViewElementAttributes as _mergeHtmlSupportViewElementAttributes,
	modifyGhsAttribute as _modifyHtmlSupportGhsAttribute,
	toPascalCase as _toHtmlSupportPascalCase,
	getHtmlAttributeName as _getHtmlSupportAttributeName,
	type GHSViewAttributes
} from './utils.js';

import './augmentation.js';
