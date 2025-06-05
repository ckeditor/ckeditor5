/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link
 */

export { Link } from './link.js';
export { LinkEditing } from './linkediting.js';
export { LinkUI, type LinksProviderListItem, type LinksProvider, type LinksProviderDetailedItem } from './linkui.js';
export { LinkImage } from './linkimage.js';
export { LinkImageEditing } from './linkimageediting.js';
export { LinkImageUI } from './linkimageui.js';
export { AutoLink } from './autolink.js';
export { LinkFormView } from './ui/linkformview.js';
export { LinkCommand } from './linkcommand.js';
export { UnlinkCommand } from './unlinkcommand.js';

export {
	addLinkProtocolIfApplicable,
	ensureSafeUrl,
	isLinkableElement
} from './utils.js';

export type { LinkConfig, LinkDecoratorDefinition } from './linkconfig.js';

import './augmentation.js';
