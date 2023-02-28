/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/contextplugin
 */

import { ObservableMixin } from '@ckeditor/ckeditor5-utils';

import type Editor from './editor/editor';
import type Context from './context';
import type { PluginInterface } from './plugin';

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
 *
 * @implements module:core/plugin~PluginInterface
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class ContextPlugin extends ObservableMixin() implements PluginInterface {
	public readonly context: Context | Editor;

	/**
	 * Creates a new plugin instance.
	 *
	 * @param {module:core/context~Context|module:core/editor/editor~Editor} context
	 */
	constructor( context: Context | Editor ) {
		super();

		/**
		 * The context instance.
		 *
		 * @readonly
		 * @type {module:core/context~Context|module:core/editor/editor~Editor}
		 */
		this.context = context;
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
