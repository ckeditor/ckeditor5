/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module widget
 */

export { Widget } from './widget.js';
export { WidgetToolbarRepository } from './widgettoolbarrepository.js';
export { WidgetResize } from './widgetresize.js';
export { WidgetTypeAround } from './widgettypearound/widgettypearound.js';
export {
	WIDGET_CLASS_NAME,
	WIDGET_SELECTED_CLASS_NAME,
	isWidget,
	toWidget,
	setHighlightHandling,
	setLabel,
	getLabel,
	toWidgetEditable,
	findOptimalInsertionRange,
	viewToModelPositionOutsideModelElement,
	calculateResizeHostAncestorWidth,
	calculateResizeHostPercentageWidth
} from './utils.js';

export { SizeView as _WidgetSizeView } from './widgetresize/sizeview.js';
export {
	TYPE_AROUND_SELECTION_ATTRIBUTE as _WIDGET_TYPE_AROUND_SELECTION_ATTRIBUTE,
	getClosestTypeAroundDomButton as _getClosestWidgetTypeAroundDomButton,
	getTypeAroundButtonPosition as _getWidgetTypeAroundButtonPosition,
	getClosestWidgetViewElement as _getClosestWidgetViewElement,
	getTypeAroundFakeCaretPosition as _getWidgetTypeAroundFakeCaretPosition
} from './widgettypearound/utils.js';

import './augmentation.js';
