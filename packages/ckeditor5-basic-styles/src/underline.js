/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/underline
 */

import { Plugin } from 'ckeditor5/src/core';
import UnderlineEditing from './underline/underlineediting';
import UnderlineUI from './underline/underlineui';

/**
 * The underline feature.
 *
 * For a detailed overview check the {@glink features/basic-styles Basic styles feature documentation}
 * and the {@glink api/basic-styles package page}.
 *
 * This is a "glue" plugin which loads the {@link module:basic-styles/underline/underlineediting~UnderlineEditing} and
 * {@link module:basic-styles/underline/underlineui~UnderlineUI} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Underline extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ UnderlineEditing, UnderlineUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Underline';
	}
}
