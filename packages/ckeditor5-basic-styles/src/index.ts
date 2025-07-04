/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module basic-styles
 */

export { Bold } from './bold.js';
export { BoldEditing } from './bold/boldediting.js';
export { BoldUI } from './bold/boldui.js';
export { Code } from './code.js';
export { CodeEditing } from './code/codeediting.js';
export { CodeUI } from './code/codeui.js';
export { Italic } from './italic.js';
export { ItalicEditing } from './italic/italicediting.js';
export { ItalicUI } from './italic/italicui.js';
export { Strikethrough } from './strikethrough.js';
export { StrikethroughEditing } from './strikethrough/strikethroughediting.js';
export { StrikethroughUI } from './strikethrough/strikethroughui.js';
export { Subscript } from './subscript.js';
export { SubscriptEditing } from './subscript/subscriptediting.js';
export { SubscriptUI } from './subscript/subscriptui.js';
export { Superscript } from './superscript.js';
export { SuperscriptEditing } from './superscript/superscriptediting.js';
export { SuperscriptUI } from './superscript/superscriptui.js';
export { Underline } from './underline.js';
export { UnderlineEditing } from './underline/underlineediting.js';
export { UnderlineUI } from './underline/underlineui.js';
export { AttributeCommand } from './attributecommand.js';

export { getButtonCreator as _getBasicStylesButtonCreator } from './utils.js';

import './augmentation.js';
