/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module email
 */

export { default as EmailIntegration } from './emailintegration.js';
export { default as EmailIntegrationUtils } from './emailintegrationutils.js';
export { default as EmptyBlockEmailIntegration } from './integrations/emptyblock.js';
export { default as ExportInlineStylesEmailIntegration } from './integrations/exportinlinestyles.js';
export { default as FontEmailIntegration } from './integrations/font.js';
export { default as HighlightEmailIntegration } from './integrations/highlight.js';
export { default as ImageEmailIntegration } from './integrations/image.js';
export { default as ListEmailIntegration } from './integrations/list.js';
export { default as TableEmailIntegration } from './integrations/table.js';
export { default as MathTypeEmailIntegration } from './integrations/mathtype.js';
export { default as SourceEditingEmailIntegration } from './integrations/sourceediting.js';
export { default as MarkdownEmailIntegration } from './integrations/markdown.js';

import './augmentation.js';
