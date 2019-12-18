/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/contextplugin
 */

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';

/**
 * The base class for {@link module:core/context~Context} plugin classes.
 *
 * @implements module:core/plugin~PluginInterface
 * @mixes module:utils/observablemixin~ObservableMixin
 */
export default class ContextPlugin {
	/**
	 * Creates a new plugin instance.
	 *
	 * @param {module:core/context~Context|module:core/editor/editor~Editor} context
	 */
	constructor( context ) {
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
	destroy() {
		this.stopListening();
	}

	/**
	 * @inheritDoc
	 */
	static get isContextPlugin() {
		return true;
	}
}

mix( ContextPlugin, ObservableMixin );
