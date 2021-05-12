/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module content-compatibility/generalhtmlsupport
 */

import { Plugin } from 'ckeditor5/src/core';
import DataFilter from './datafilter';
import DataSchema from './dataschema';

/**
 * The General HTML Support feature.
 *
 * This is a "glue" plugin which initializes the {@link module:content-compatibility/dataschema~DataSchema data schema}
 * and {@link module:content-compatibility/datafilter~DataFilter data filter} features.
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

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ DataFilter, DataSchema ];
	}
}
