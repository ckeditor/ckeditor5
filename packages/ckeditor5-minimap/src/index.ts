/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module minimap
 */

export { Minimap } from './minimap.js';

export type { MinimapConfig } from './minimapconfig.js';

export { MinimapIframeView as _MinimapIframeView } from './minimapiframeview.js';
export { MinimapPositionTrackerView as _MinimapPositionTrackerView } from './minimappositiontrackerview.js';
export {
	MinimapViewOptions as _MinimapViewOptions,
	MinimapView as _MinimapView
} from './minimapview.js';

export {
	cloneEditingViewDomRoot as _cloneMinimapEditingViewDomRoot,
	getPageStyles as _getMinimapPageStyles,
	getDomElementRect as _getMinimapDomElementRect,
	getClientHeight as _getMinimapClientHeight,
	getScrollable as _getMinimapScrollable
} from './utils.js';

import './augmentation.js';
