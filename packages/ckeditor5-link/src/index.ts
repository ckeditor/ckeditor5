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
export { LinkButtonView as _LinkButtonView } from './ui/linkbuttonview.js';
export { LinkPreviewButtonView as _LinkPreviewButtonView } from './ui/linkpreviewbuttonview.js';
export { LinkPropertiesView } from './ui/linkpropertiesview.js';
export { LinkProviderItemsView } from './ui/linkprovideritemsview.js';

export type { LinkPreviewButtonNavigateEvent } from './ui/linkpreviewbuttonview.js';
export type { LinkPropertiesBackEvent } from './ui/linkpropertiesview.js';
export type { LinkProvidersCancelEvent as LinkProviderItemsViewCancelEvent } from './ui/linkprovideritemsview.js';

export type {
	LinkFormValidatorCallback,
	LinkFormSubmitEvent,
	LinkFormCancelEvent as LinkFormViewCancelEvent
} from './ui/linkformview.js';

export {
	addLinkProtocolIfApplicable,
	ensureSafeUrl,
	ensureSafeUrl as _ensureSafeLinkUrl,
	isLinkableElement,
	isLinkElement,
	LINK_KEYSTROKE as _LINK_KEYSTROKE,
	createLinkElement as _createLinkElement,
	getLocalizedDecorators as _getLocalizedLinkDecorators,
	normalizeDecorators as _normalizeLinkDecorators,
	isEmail as _isEmailLink,
	linkHasProtocol as _hasLinkProtocol,
	openLink as _openLink,
	extractTextFromLinkRange as _extractTextFromLinkRange
} from './utils.js';

export type {
	NormalizedLinkDecoratorAutomaticDefinition,
	NormalizedLinkDecoratorManualDefinition,
	NormalizedLinkDecoratorDefinition
} from './utils.js';

export { AutomaticDecorators } from './utils/automaticdecorators.js';
export { LinkManualDecorator } from './utils/manualdecorator.js';

export type {
	LinkConfig,
	LinkDecoratorDefinition,
	LinkDecoratorAutomaticDefinition,
	LinkDecoratorManualDefinition
} from './linkconfig.js';

import './augmentation.js';
