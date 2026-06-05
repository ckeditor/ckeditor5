/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module media-embed
 */

export { MediaEmbed } from './mediaembed.js';
export { MediaEmbedEditing } from './mediaembedediting.js';
export { MediaEmbedUI } from './mediaembedui.js';
export { AutoMediaEmbed } from './automediaembed.js';
export { MediaEmbedToolbar } from './mediaembedtoolbar.js';
export { MediaEmbedCommand } from './mediaembedcommand.js';
export { MediaEmbedResize } from './mediaembedresize.js';
export { MediaEmbedResizeEditing } from './mediaembedresize/mediaembedresizeediting.js';
export { MediaEmbedResizeHandles } from './mediaembedresize/mediaembedresizehandles.js';
export { MediaEmbedResizeButtons } from './mediaembedresize/mediaembedresizebuttons.js';
export { MediaEmbedCustomResizeUI } from './mediaembedresize/mediaembedcustomresizeui.js';
export type {
	MediaEmbedCustomResizeFormViewSubmitEvent,
	MediaEmbedCustomResizeFormViewCancelEvent
} from './mediaembedresize/ui/mediaembedcustomresizeformview.js';
export { ResizeMediaEmbedCommand } from './mediaembedresize/resizemediaembedcommand.js';
export { MediaEmbedStyle } from './mediaembedstyle.js';
export { MediaEmbedStyleEditing } from './mediaembedstyle/mediaembedstyleediting.js';
export { MediaEmbedStyleUI } from './mediaembedstyle/mediaembedstyleui.js';
export { MediaEmbedStyleCommand } from './mediaembedstyle/mediaembedstylecommand.js';

export type {
	MediaEmbedConfig,
	MediaEmbedResizeOption,
	MediaStyleConfig,
	MediaStyleOptionDefinition,
	MediaStyleDropdownDefinition
} from './mediaembedconfig.js';

export { modelToViewUrlAttributeConverter as _modelToViewUrlAttributeMediaConverter } from './converters.js';
export { MediaFormView as _MediaFormView } from './ui/mediaformview.js';
export {
	toMediaWidget as _toMediaWidget,
	getSelectedMediaViewWidget as _getSelectedMediaViewWidget,
	isMediaWidget as _isMediaWidget,
	createMediaFigureElement as _createMediaFigureElement,
	getSelectedMediaModelWidget as _getSelectedMediaModelWidget,
	insertMedia as _insertMedia,
	type MediaOptions
} from './utils.js';

export type { MediaEmbedProvider } from './mediaembedconfig.js';
export { MediaRegistry } from './mediaregistry.js';

import './augmentation.js';
