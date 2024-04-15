/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core
 */

export { default as Plugin, type PluginDependencies, type PluginConstructor } from './plugin.js';
export { default as Command, type CommandExecuteEvent } from './command.js';
export { default as MultiCommand } from './multicommand.js';
export type { CommandsMap } from './commandcollection.js';
export type { PluginsMap, default as PluginCollection } from './plugincollection.js';

export { default as Context, type ContextConfig } from './context.js';
export { default as ContextPlugin, type ContextPluginDependencies } from './contextplugin.js';
export { type EditingKeystrokeCallback } from './editingkeystrokehandler.js';

export type { PartialBy, NonEmptyArray, HexColor } from './typings.js';

export { default as Editor, type EditorReadyEvent, type EditorDestroyEvent } from './editor/editor.js';
export type {
	EditorConfig,
	LanguageConfig,
	ToolbarConfig,
	ToolbarConfigItem,
	UiConfig
} from './editor/editorconfig.js';

export { default as attachToForm } from './editor/utils/attachtoform.js';
export { default as DataApiMixin, type DataApi } from './editor/utils/dataapimixin.js';
export { default as ElementApiMixin, type ElementApi } from './editor/utils/elementapimixin.js';
export { default as secureSourceElement } from './editor/utils/securesourceelement.js';

export { default as PendingActions, type PendingAction } from './pendingactions.js';

export type {
	KeystrokeInfos as KeystrokeInfoDefinitions,
	KeystrokeInfoGroup as KeystrokeInfoGroupDefinition,
	KeystrokeInfoCategory as KeystrokeInfoCategoryDefinition,
	KeystrokeInfoDefinition as KeystrokeInfoDefinition
} from './accessibility.js';

import cancel from './../theme/icons/cancel.svg';
import caption from './../theme/icons/caption.svg';
import check from './../theme/icons/check.svg';
import cog from './../theme/icons/cog.svg';
import colorPalette from './../theme/icons/color-palette.svg';
import eraser from './../theme/icons/eraser.svg';
import history from './../theme/icons/history.svg';
import lowVision from './../theme/icons/low-vision.svg';
import textAlternative from './../theme/icons/text-alternative.svg';
import loupe from './../theme/icons/loupe.svg';
import previousArrow from './../theme/icons/previous-arrow.svg';
import nextArrow from './../theme/icons/next-arrow.svg';
import image from './../theme/icons/image.svg';
import imageUpload from './../theme/icons/image-upload.svg';
import imageAssetManager from './../theme/icons/image-asset-manager.svg';
import imageUrl from './../theme/icons/image-url.svg';

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
import objectSizeCustom from './../theme/icons/object-size-custom.svg';
import objectSizeLarge from './../theme/icons/object-size-large.svg';
import objectSizeSmall from './../theme/icons/object-size-small.svg';
import objectSizeMedium from './../theme/icons/object-size-medium.svg';

import pencil from './../theme/icons/pencil.svg';
import pilcrow from './../theme/icons/pilcrow.svg';
import quote from './../theme/icons/quote.svg';
import threeVerticalDots from './../theme/icons/three-vertical-dots.svg';
import dragIndicator from './../theme/icons/drag-indicator.svg';

import bold from './../theme/icons/bold.svg';
import paragraph from './../theme/icons/paragraph.svg';
import plus from './../theme/icons/plus.svg';
import text from './../theme/icons/text.svg';
import importExport from './../theme/icons/importexport.svg';

import redo from './../theme/icons/redo.svg';
import undo from './../theme/icons/undo.svg';

import bulletedList from './../theme/icons/bulletedlist.svg';
import numberedList from './../theme/icons/numberedlist.svg';
import todoList from './../theme/icons/todolist.svg';

import codeBlock from './../theme/icons/codeblock.svg';

import browseFiles from './../theme/icons/browse-files.svg';

import heading1 from './../theme/icons/heading1.svg';
import heading2 from './../theme/icons/heading2.svg';
import heading3 from './../theme/icons/heading3.svg';
import heading4 from './../theme/icons/heading4.svg';
import heading5 from './../theme/icons/heading5.svg';
import heading6 from './../theme/icons/heading6.svg';

import horizontalLine from './../theme/icons/horizontalline.svg';

import html from './../theme/icons/html.svg';

import indent from './../theme/icons/indent.svg';
import outdent from './../theme/icons/outdent.svg';

import table from './../theme/icons/table.svg';

export const icons = {
	bold,
	cancel,
	caption,
	check,
	cog,
	colorPalette,
	eraser,
	history,
	image,
	imageUpload,
	imageAssetManager,
	imageUrl,
	lowVision,
	textAlternative,
	loupe,
	previousArrow,
	nextArrow,
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

	objectSizeCustom,
	objectSizeFull,
	objectSizeLarge,
	objectSizeSmall,
	objectSizeMedium,

	pencil,
	pilcrow,
	quote,
	threeVerticalDots,
	dragIndicator,

	redo,
	undo,

	bulletedList,
	numberedList,
	todoList,

	codeBlock,

	browseFiles,

	heading1,
	heading2,
	heading3,
	heading4,
	heading5,
	heading6,

	horizontalLine,

	html,

	indent,
	outdent,

	table
};

import './augmentation.js';
