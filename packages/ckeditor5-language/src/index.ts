/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module language
 */

export { default as TextPartLanguage } from './textpartlanguage';
export { default as TextPartLanguageEditing } from './textpartlanguageediting';
export { default as TextPartLanguageUI } from './textpartlanguageui';

export type { TextPartLanguageOption } from './textpartlanguageconfig';
export type { default as TextPartLanguageCommand } from './textpartlanguagecommand';

import './augmentation';
