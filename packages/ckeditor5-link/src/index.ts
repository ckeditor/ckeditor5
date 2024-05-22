/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module link
 */

export { default as Link } from './link.js';
export { default as LinkEditing } from './linkediting.js';
export { default as LinkUI } from './linkui.js';
export { default as LinkImage } from './linkimage.js';
export { default as LinkImageEditing } from './linkimageediting.js';
export { default as LinkImageUI } from './linkimageui.js';
export { default as AutoLink } from './autolink.js';

export type { LinkConfig, LinkDecoratorDefinition } from './linkconfig.js';
export { default as LinkCommand } from './linkcommand.js';
export { default as UnlinkCommand } from './unlinkcommand.js';

import './augmentation.js';
