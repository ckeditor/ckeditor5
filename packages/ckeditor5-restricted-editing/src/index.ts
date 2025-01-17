/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module restricted-editing
 */

export { default as RestrictedEditingMode } from './restrictededitingmode.js';
export { default as RestrictedEditingModeEditing } from './restrictededitingmodeediting.js';
export { default as RestrictedEditingModeUI } from './restrictededitingmodeui.js';
export { default as StandardEditingMode } from './standardeditingmode.js';
export { default as StandardEditingModeEditing } from './standardeditingmodeediting.js';
export { default as StandardEditingModeUI } from './standardeditingmodeui.js';

export type { RestrictedEditingConfig } from './restrictededitingconfig.js';
export type { default as RestrictedEditingExceptionCommand } from './restrictededitingexceptioncommand.js';
export type { default as RestrictedEditingModeNavigationCommand } from './restrictededitingmodenavigationcommand.js';

import './augmentation.js';
