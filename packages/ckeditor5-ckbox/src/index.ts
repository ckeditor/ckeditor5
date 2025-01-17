/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ckbox
 */

export { default as CKBox } from './ckbox.js';
export { default as CKBoxEditing } from './ckboxediting.js';
export { default as CKBoxUI } from './ckboxui.js';
export { default as CKBoxImageEditEditing } from './ckboximageedit/ckboximageeditediting.js';
export { default as CKBoxImageEditUI } from './ckboximageedit/ckboximageeditui.js';
export { default as CKBoxImageEdit } from './ckboximageedit.js';

export type { default as CKBoxCommand } from './ckboxcommand.js';
export type { default as CKBoxImageEditCommand } from './ckboximageedit/ckboximageeditcommand.js';
export type { CKBoxConfig } from './ckboxconfig.js';

import './augmentation.js';
