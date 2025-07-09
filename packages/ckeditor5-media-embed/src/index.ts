/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
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

export type { MediaEmbedConfig } from './mediaembedconfig.js';

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
