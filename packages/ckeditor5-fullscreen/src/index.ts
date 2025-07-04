/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module fullscreen
 */

export { Fullscreen } from './fullscreen.js';
export { FullscreenEditing } from './fullscreenediting.js';
export { FullscreenUI } from './fullscreenui.js';
export { FullscreenCommand } from './fullscreencommand.js';

export { FullscreenAbstractEditorHandler } from './handlers/abstracteditorhandler.js';
export { FullscreenClassicEditorHandler } from './handlers/classiceditorhandler.js';
export { FullscreenDecoupledEditorHandler } from './handlers/decouplededitorhandler.js';

export type { FullscreenConfig } from './fullscreenconfig.js';

import './augmentation.js';
