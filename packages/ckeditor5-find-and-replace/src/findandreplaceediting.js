/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findandreplaceediting
 */

import { Plugin } from 'ckeditor5/src/core';

/**
 * Implements editing part for find and replace plugin. For example conversion, commands etc.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FindAndReplaceEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FindAndReplaceEditing';
	}

	/**
	 * @inheritDoc
	 */
	init() {}
}
