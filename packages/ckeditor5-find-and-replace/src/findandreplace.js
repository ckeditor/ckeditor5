/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module find-and-replace/findandreplace
 */

import { Plugin } from 'ckeditor5/src/core';
import { Widget } from 'ckeditor5/src/widget';
import FindAndReplaceEditing from './findandreplaceediting';
import FindAndReplaceUI from './findandreplaceui';

/**
  * The Find and Replace feature.
  *
  * It provides the possibility to find and replace text in the rich-text editor.
  *
  * For a detailed overview, check the {@glink features/find-and-replace Find and Replace feature} documentation.
  *
  * @extends module:core/plugin~Plugin
*/
export default class FindAndReplace extends Plugin {
	/**
	 * @inheritDoc
	*/
	static get requires() {
		return [ FindAndReplaceEditing, FindAndReplaceUI, Widget ];
	}

	/**
	 * @inheritDoc
	*/
	static get pluginName() {
		return 'FindAndReplace';
	}
}
