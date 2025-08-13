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
export { CodeBlockElementSupport } from './integrations/codeblock.js';
export { CustomElementSupport } from './integrations/customelement.js';
export { ListElementSupport } from './integrations/list.js';
export { DualContentModelElementSupport } from './integrations/dualcontent.js';
export { HeadingElementSupport } from './integrations/heading.js';
export { ImageElementSupport } from './integrations/image.js';
export { MediaEmbedElementSupport } from './integrations/mediaembed.js';
export { ScriptElementSupport } from './integrations/script.js';
export { StyleElementSupport } from './integrations/style.js';
export { TableElementSupport } from './integrations/table.js';
export { HorizontalLineElementSupport } from './integrations/horizontalline.js';

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
