/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core
 */

export { default as Plugin, type PluginDependencies, type PluginConstructor } from './plugin';
export { default as Command, type CommandExecuteEvent } from './command';
export { default as MultiCommand } from './multicommand';
export type { CommandsMap } from './commandcollection';
export type { PluginsMap, default as PluginCollection } from './plugincollection';

export { default as Context, type ContextConfig } from './context';
export { default as ContextPlugin, type ContextPluginDependencies } from './contextplugin';
export { type EditingKeystrokeCallback } from './editingkeystrokehandler';

export { default as Editor, type EditorReadyEvent, type EditorDestroyEvent } from './editor/editor';
export type {
	EditorConfig,
	LanguageConfig,
	ToolbarConfig,
	ToolbarConfigItem
} from './editor/editorconfig';

export { default as attachToForm } from './editor/utils/attachtoform';
export { default as DataApiMixin, type DataApi } from './editor/utils/dataapimixin';
export { default as ElementApiMixin, type ElementApi } from './editor/utils/elementapimixin';
export { default as secureSourceElement } from './editor/utils/securesourceelement';

export { default as PendingActions, type PendingAction } from './pendingactions';

import cancel from './../theme/icons/cancel.svg';
import caption from './../theme/icons/caption.svg';
import check from './../theme/icons/check.svg';
import cog from './../theme/icons/cog.svg';
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

import objectBlockLeft from './../theme/icons/object-left.svg';
import objectCenter from './../theme/icons/object-center.svg';
import objectBlockRight from './../theme/icons/object-right.svg';
import objectFullWidth from './../theme/icons/object-full-width.svg';
import objectInline from './../theme/icons/object-inline.svg';
import objectLeft from './../theme/icons/object-inline-left.svg';
import objectRight from './../theme/icons/object-inline-right.svg';

import objectSizeFull from './../theme/icons/object-size-full.svg';
import objectSizeLarge from './../theme/icons/object-size-large.svg';
import objectSizeSmall from './../theme/icons/object-size-small.svg';
import objectSizeMedium from './../theme/icons/object-size-medium.svg';

import pencil from './../theme/icons/pencil.svg';
import pilcrow from './../theme/icons/pilcrow.svg';
import quote from './../theme/icons/quote.svg';
import threeVerticalDots from './../theme/icons/three-vertical-dots.svg';

import bold from './../theme/icons/bold.svg';
import paragraph from './../theme/icons/paragraph.svg';
import plus from './../theme/icons/plus.svg';
import text from './../theme/icons/text.svg';
import importExport from './../theme/icons/importexport.svg';

export const icons = {
	bold,
	cancel,
	caption,
	check,
	cog,
	eraser,
	image,
	lowVision,
	importExport,
	paragraph,
	plus,
	text,

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

import './augmentation';
