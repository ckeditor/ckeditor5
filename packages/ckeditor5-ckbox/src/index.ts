/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ckbox
 */

export { default as CKBox } from './ckbox';
export { default as CKBoxEditing } from './ckboxediting';
export { default as CKBoxUI } from './ckboxui';
export { default as CKBoxImageEditEditing } from './ckboximageedit/ckboximageeditediting';
export { default as CKBoxImageEditUI } from './ckboximageedit/ckboximageeditui';
export { default as CKBoxImageEdit } from './ckboximageedit';

export type { default as CKBoxCommand } from './ckboxcommand';
export type { default as CKBoxImageEditCommand } from './ckboximageedit/ckboximageeditcommand';
export type { CKBoxConfig } from './ckboxconfig';

import './augmentation';
