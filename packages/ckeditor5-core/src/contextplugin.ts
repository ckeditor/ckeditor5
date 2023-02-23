/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/contextplugin
 */

import {
	ObservableMixin,
	type Collection,
	type Config,
	type Locale,
	type LocaleTranslate
} from '@ckeditor/ckeditor5-utils';

import type Editor from './editor/editor';
import type { EditorConfig } from './editor/editorconfig';
import type Context from './context';
import type { PluginDependencies, PluginInterface } from './plugin';
import type PluginCollection from './plugincollection';

/**
 * The base class for {@link module:core/context~Context} plugin classes.
 *
 * A context plugin can either be initialized for an {@link module:core/editor/editor~Editor editor} or for
 * a {@link module:core/context~Context context}. In other words, it can either
 * work within one editor instance or with one or more editor instances that use a single context.
 * It is the context plugin's role to implement handling for both modes.
 *
 * There are a few rules for interaction between the editor plugins and context plugins:
 *
 * * A context plugin can require another context plugin.
 * * An {@link module:core/plugin~Plugin editor plugin} can require a context plugin.
 * * A context plugin MUST NOT require an {@link module:core/plugin~Plugin editor plugin}.
 */
export default class ContextPlugin extends ObservableMixin() implements PluginInterface {
	/**
	 * The context or editor instance.
	 */
	public readonly context: ContextInterface;

	/**
	 * Creates a new plugin instance.
	 */
	constructor( context: Context | Editor ) {
		super();

		this.context = context as ContextInterface;
	}

	/**
	 * @inheritDoc
	 */
	public destroy(): void {
		this.stopListening();
	}

	/**
	 * @inheritDoc
	 */
	public static get isContextPlugin(): true {
		return true;
	}
}

/**
 * The common interface of {@link module:core/context~Context} and {@link module:core/editor/editor~Editor}.
 */
export interface ContextInterface {
	config: Config<Omit<EditorConfig, 'plugins' | 'substitutePlugins' | 'removePlugins' | 'extraPlugins'>>;
	plugins: PluginCollection<Context | Editor>;
	locale: Locale;
	t: LocaleTranslate;
	editors?: Collection<Editor>;
}

export type ContextPluginDependencies = PluginDependencies<Context | Editor>;
