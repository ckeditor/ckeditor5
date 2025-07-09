/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core
 */

export {
	Plugin,
	type PluginDependencies,
	type PluginConstructor,
	type PluginInterface,
	type PluginClassConstructor,
	type PluginFunctionConstructor,
	type PluginStaticMembers,
	type LoadedPlugins
} from './plugin.js';

export { Command, type CommandExecuteEvent } from './command.js';
export { MultiCommand } from './multicommand.js';
export { CommandCollection, type CommandsMap } from './commandcollection.js';
export type { PluginsMap, PluginCollection, PluginEntry } from './plugincollection.js';

export { Context, type ContextConfig } from './context.js';
export { ContextPlugin, type ContextInterface, type ContextPluginDependencies } from './contextplugin.js';
export { EditingKeystrokeHandler, type EditingKeystrokeCallback } from './editingkeystrokehandler.js';

export type { PartialBy, NonEmptyArray, HexColor } from './typings.js';

export { Editor, type EditorCollectUsageDataEvent, type EditorReadyEvent, type EditorDestroyEvent } from './editor/editor.js';
export type {
	EditorConfig,
	LanguageConfig,
	ToolbarConfig,
	ToolbarConfigItem,
	UiConfig,
	ViewportOffsetConfig,
	PoweredByConfig
} from './editor/editorconfig.js';

export { attachToForm } from './editor/utils/attachtoform.js';
export { ElementApiMixin, type ElementApi } from './editor/utils/elementapimixin.js';
export { secureSourceElement } from './editor/utils/securesourceelement.js';

export { PendingActions, type PendingAction, type PendingActionsAddEvent, type PendingActionsRemoveEvent } from './pendingactions.js';

export {
	Accessibility,
	DEFAULT_GROUP_ID as _DEFAULT_ACCESSIBILITY_GROUP_ID,
	type AddKeystrokeInfoCategoryData,
	type AddKeystrokeInfoGroupData,
	type AddKeystrokeInfosData,
	type KeystrokeInfoDefinition,
	type KeystrokeInfoDefinitions,
	type KeystrokeInfoGroupDefinition,
	type KeystrokeInfoCategoryDefinition
} from './accessibility.js';

export {
	getEditorUsageData as _getEditorUsageData,
	type EditorUsageData as _EditorUsageData
} from './editor/utils/editorusagedata.js';

import './augmentation.js';
