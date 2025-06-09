/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module core
 */

export { Plugin, type PluginDependencies, type PluginConstructor } from './plugin.js';
export { Command, type CommandExecuteEvent } from './command.js';
export { MultiCommand } from './multicommand.js';
export type { CommandsMap } from './commandcollection.js';
export type { PluginsMap, PluginCollection } from './plugincollection.js';

export { Context, type ContextConfig } from './context.js';
export { ContextPlugin, type ContextPluginDependencies } from './contextplugin.js';
export { type EditingKeystrokeCallback } from './editingkeystrokehandler.js';

export type { PartialBy, NonEmptyArray, HexColor } from './typings.js';

export { Editor, type EditorReadyEvent, type EditorDestroyEvent } from './editor/editor.js';
export type {
	EditorConfig,
	LanguageConfig,
	ToolbarConfig,
	ToolbarConfigItem,
	UiConfig,
	ViewportOffsetConfig
} from './editor/editorconfig.js';

export { attachToForm } from './editor/utils/attachtoform.js';
export { ElementApiMixin, type ElementApi } from './editor/utils/elementapimixin.js';
export { secureSourceElement } from './editor/utils/securesourceelement.js';

export { PendingActions, type PendingAction } from './pendingactions.js';

export type {
	KeystrokeInfos as KeystrokeInfoDefinitions,
	KeystrokeInfoGroup as KeystrokeInfoGroupDefinition,
	KeystrokeInfoCategory as KeystrokeInfoCategoryDefinition,
	KeystrokeInfoDefinition as KeystrokeInfoDefinition
} from './accessibility.js';

import './augmentation.js';
