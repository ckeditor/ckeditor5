/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module widget
 */

export { default as Widget } from './widget.js';
export { default as WidgetToolbarRepository } from './widgettoolbarrepository.js';
export { default as WidgetResize } from './widgetresize.js';
export { default as WidgetTypeAround } from './widgettypearound/widgettypearound.js';
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

import './augmentation.js';
