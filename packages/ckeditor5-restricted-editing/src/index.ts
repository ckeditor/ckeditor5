/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module restricted-editing
 */

export { RestrictedEditingMode } from './restrictededitingmode.js';
export { RestrictedEditingModeEditing } from './restrictededitingmodeediting.js';
export { RestrictedEditingModeUI } from './restrictededitingmodeui.js';

export {
	RestrictedEditingExceptionCommand,
	type RestrictedEditingExceptionCommandParams
} from './restrictededitingexceptioncommand.js';

export {
	RestrictedEditingModeNavigationCommand,
	type RestrictedEditingModeNavigationDirection
} from './restrictededitingmodenavigationcommand.js';

export { StandardEditingMode } from './standardeditingmode.js';
export { StandardEditingModeEditing } from './standardeditingmodeediting.js';
export { StandardEditingModeUI } from './standardeditingmodeui.js';

export type { RestrictedEditingConfig } from './restrictededitingconfig.js';

export {
	setupExceptionHighlighting as _setupRestrictedEditingExceptionHighlighting,
	resurrectCollapsedMarkerPostFixer as _resurrectRestrictedEditingCollapsedMarkerPostFixer,
	extendMarkerOnTypingPostFixer as _extendRestrictedEditingMarkerOnTypingPostFixer,
	upcastHighlightToMarker as _upcastRestrictedEditingHighlightToMarker
} from './restrictededitingmode/converters.js';

export {
	getMarkerAtPosition as _getRestrictedEditingMarkerAtPosition,
	isPositionInRangeBoundaries as _isRestrictedEditingPositionInRangeBoundaries,
	isSelectionInMarker as _isRestrictedEditingSelectionInMarker
} from './restrictededitingmode/utils.js';

import './augmentation.js';
