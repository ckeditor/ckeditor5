/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module language
 */

export { default as TextPartLanguage } from './textpartlanguage.js';
export { default as TextPartLanguageEditing } from './textpartlanguageediting.js';
export { default as TextPartLanguageUI } from './textpartlanguageui.js';

export type { TextPartLanguageOption } from './textpartlanguageconfig.js';
export type { default as TextPartLanguageCommand } from './textpartlanguagecommand.js';

import './augmentation.js';
