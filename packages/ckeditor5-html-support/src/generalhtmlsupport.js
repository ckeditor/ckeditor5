/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/generalhtmlsupport
 */

import { Plugin } from 'ckeditor5/src/core';
import DataFilter from './datafilter';
import CodeBlockHtmlSupport from './integrations/codeblock';

/**
 * The General HTML Support feature.
 *
 * This is a "glue" plugin which initializes the {@link module:html-support/datafilter~DataFilter data filter} configuration
 * and features integration with the General HTML Support.
 *
 * @extends module:core/plugin~Plugin
 */
export default class GeneralHtmlSupport extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'GeneralHtmlSupport';
	}

	init() {
		const editor = this.editor;
		const dataFilter = editor.plugins.get( DataFilter );

		// Load the filtering configuration.
		dataFilter.loadAllowedConfig( editor.config.get( 'htmlSupport.allow' ) || [] );
		dataFilter.loadDisallowedConfig( editor.config.get( 'htmlSupport.disallow' ) || [] );
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [
			DataFilter,
			CodeBlockHtmlSupport
		];
	}
}
