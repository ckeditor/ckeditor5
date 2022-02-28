/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/styleediting
 */

import { Plugin } from 'ckeditor5/src/core';
import GeneralHtmlSupport from '@ckeditor/ckeditor5-html-support/src/generalhtmlsupport';

import StyleCommand from './stylecommand';

/**
 * TODO
 *
 * @extends module:core/plugin~Plugin
 */
export default class StyleEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'StyleEditing';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ GeneralHtmlSupport ];
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this.editor.commands.add( 'style', new StyleCommand( this.editor ) );
	}
}
