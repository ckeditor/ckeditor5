/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link
 */

export { default as Link } from './link.js';
export { default as LinkEditing } from './linkediting.js';
export { default as LinkUI, type LinksProviderListItem, type LinksProvider, type LinksProviderDetailedItem } from './linkui.js';
export { default as LinkImage } from './linkimage.js';
export { default as LinkImageEditing } from './linkimageediting.js';
export { default as LinkImageUI } from './linkimageui.js';
export { default as AutoLink } from './autolink.js';
export { default as LinkFormView } from './ui/linkformview.js';
export { default as LinkCommand } from './linkcommand.js';
export { default as UnlinkCommand } from './unlinkcommand.js';

export {
	addLinkProtocolIfApplicable,
	ensureSafeUrl,
	isLinkableElement
} from './utils.js';

export type { LinkConfig, LinkDecoratorDefinition } from './linkconfig.js';

import './augmentation.js';
