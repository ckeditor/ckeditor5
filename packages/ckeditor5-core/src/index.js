/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core
 */

export { default as Plugin } from './plugin';
export { default as Command } from './command';
export { default as MultiCommand } from './multicommand';

export { default as Context } from './context';
export { default as ContextPlugin } from './contextplugin';

export { default as Editor } from './editor/editor';
export { default as EditorUI } from './editor/editorui';

export { default as attachToForm } from './editor/utils/attachtoform';
export { default as DataApiMixin } from './editor/utils/dataapimixin';
export { default as ElementApiMixin } from './editor/utils/elementapimixin';
export { default as secureSourceElement } from './editor/utils/securesourceelement';

export { default as PendingActions } from './pendingactions';

import cancel from './../theme/icons/cancel.svg';
import caption from './../theme/icons/caption.svg';
import check from './../theme/icons/check.svg';
import eraser from './../theme/icons/eraser.svg';
import lowVision from './../theme/icons/low-vision.svg';
import image from './../theme/icons/image.svg';
import alignBottom from './../theme/icons/align-bottom.svg';
import alignMiddle from './../theme/icons/align-middle.svg';
import alignTop from './../theme/icons/align-top.svg';
import alignLeft from './../theme/icons/align-left.svg';
import alignCenter from './../theme/icons/align-center.svg';
import alignRight from './../theme/icons/align-right.svg';
import alignJustify from './../theme/icons/align-justify.svg';
import objectLeft from './../theme/icons/object-left.svg';
import objectCenter from './../theme/icons/object-center.svg';
import objectRight from './../theme/icons/object-right.svg';
import objectFullWidth from './../theme/icons/object-full-width.svg';
import objectSizeFull from './../theme/icons/object-size-full.svg';
import objectSizeLarge from './../theme/icons/object-size-large.svg';
import objectSizeSmall from './../theme/icons/object-size-small.svg';
import objectSizeMedium from './../theme/icons/object-size-medium.svg';
import pencil from './../theme/icons/pencil.svg';
import pilcrow from './../theme/icons/pilcrow.svg';
import quote from './../theme/icons/quote.svg';
import threeVerticalDots from './../theme/icons/three-vertical-dots.svg';

export const icons = {
	cancel,
	caption,
	check,
	eraser,
	lowVision,
	image,
	alignBottom,
	alignMiddle,
	alignTop,
	alignLeft,
	alignCenter,
	alignRight,
	alignJustify,
	objectLeft,
	objectCenter,
	objectRight,
	objectFullWidth,
	objectSizeFull,
	objectSizeLarge,
	objectSizeSmall,
	objectSizeMedium,
	pencil,
	pilcrow,
	quote,
	threeVerticalDots
};
