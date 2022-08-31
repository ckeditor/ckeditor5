/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* eslint-disable @typescript-eslint/no-var-requires */

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
export { EditorConfig } from './editor/editorconfig';

export { default as attachToForm } from './editor/utils/attachtoform';
export { default as DataApiMixin } from './editor/utils/dataapimixin';
export { default as ElementApiMixin } from './editor/utils/elementapimixin';
export { default as secureSourceElement } from './editor/utils/securesourceelement';

export { default as PendingActions } from './pendingactions';

const cancel = require( './../theme/icons/cancel.svg' ).default as string;
const caption = require( './../theme/icons/caption.svg' ).default as string;
const check = require( './../theme/icons/check.svg' ).default as string;
const cog = require( './../theme/icons/cog.svg' ).default as string;
const eraser = require( './../theme/icons/eraser.svg' ).default as string;
const lowVision = require( './../theme/icons/low-vision.svg' ).default as string;
const image = require( './../theme/icons/image.svg' ).default as string;

const alignBottom = require( './../theme/icons/align-bottom.svg' ).default as string;
const alignMiddle = require( './../theme/icons/align-middle.svg' ).default as string;
const alignTop = require( './../theme/icons/align-top.svg' ).default as string;
const alignLeft = require( './../theme/icons/align-left.svg' ).default as string;
const alignCenter = require( './../theme/icons/align-center.svg' ).default as string;
const alignRight = require( './../theme/icons/align-right.svg' ).default as string;
const alignJustify = require( './../theme/icons/align-justify.svg' ).default as string;

const objectBlockLeft = require( './../theme/icons/object-left.svg' ).default as string;
const objectCenter = require( './../theme/icons/object-center.svg' ).default as string;
const objectBlockRight = require( './../theme/icons/object-right.svg' ).default as string;
const objectFullWidth = require( './../theme/icons/object-full-width.svg' ).default as string;
const objectInline = require( './../theme/icons/object-inline.svg' ).default as string;
const objectLeft = require( './../theme/icons/object-inline-left.svg' ).default as string;
const objectRight = require( './../theme/icons/object-inline-right.svg' ).default as string;

const objectSizeFull = require( './../theme/icons/object-size-full.svg' ).default as string;
const objectSizeLarge = require( './../theme/icons/object-size-large.svg' ).default as string;
const objectSizeSmall = require( './../theme/icons/object-size-small.svg' ).default as string;
const objectSizeMedium = require( './../theme/icons/object-size-medium.svg' ).default as string;

const pencil = require( './../theme/icons/pencil.svg' ).default as string;
const pilcrow = require( './../theme/icons/pilcrow.svg' ).default as string;
const quote = require( './../theme/icons/quote.svg' ).default as string;
const threeVerticalDots = require( './../theme/icons/three-vertical-dots.svg' ).default as string;

export const icons = {
	cancel,
	caption,
	check,
	cog,
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
	objectInline,
	objectBlockLeft,
	objectBlockRight,

	objectSizeFull,
	objectSizeLarge,
	objectSizeSmall,
	objectSizeMedium,

	pencil,
	pilcrow,
	quote,
	threeVerticalDots
};
