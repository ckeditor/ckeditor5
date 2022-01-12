/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module basic-styles/italic
 */

import { Plugin } from 'ckeditor5/src/core';
import ItalicEditing from './italic/italicediting';
import ItalicUI from './italic/italicui';

/**
 * The italic feature.
 *
 * For a detailed overview check the {@glink features/basic-styles Basic styles feature documentation}
 * and the {@glink api/basic-styles package page}.
 *
 * This is a "glue" plugin which loads the {@link module:basic-styles/italic/italicediting~ItalicEditing} and
 * {@link module:basic-styles/italic/italicui~ItalicUI} plugins.
 *
 * @extends module:core/plugin~Plugin
 */
export default class Italic extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ItalicEditing, ItalicUI ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'Italic';
	}
}
