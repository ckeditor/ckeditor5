/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
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
	UiConfig,
	ViewportOffsetConfig
} from './editor/editorconfig.js';

export { default as attachToForm } from './editor/utils/attachtoform.js';
export { default as ElementApiMixin, type ElementApi } from './editor/utils/elementapimixin.js';
export { default as secureSourceElement } from './editor/utils/securesourceelement.js';

export { default as PendingActions, type PendingAction } from './pendingactions.js';

export type {
	KeystrokeInfos as KeystrokeInfoDefinitions,
	KeystrokeInfoGroup as KeystrokeInfoGroupDefinition,
	KeystrokeInfoCategory as KeystrokeInfoCategoryDefinition,
	KeystrokeInfoDefinition as KeystrokeInfoDefinition
} from './accessibility.js';

import './augmentation.js';
