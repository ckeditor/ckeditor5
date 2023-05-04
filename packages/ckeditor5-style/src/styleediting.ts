/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/styleediting
 */

import { Plugin } from 'ckeditor5/src/core';
import type { DataSchema } from '@ckeditor/ckeditor5-html-support';

import StyleCommand from './stylecommand';
import StyleUtils from './styleutils';
import type { StyleConfig } from './styleconfig';

import DocumentListStyleSupport from './integrations/documentlist';
import TableStyleSupport from './integrations/table';
import LinkStyleSupport from './integrations/link';

/**
 * The style engine feature.
 *
 * It configures the {@glink features/html/general-html-support General HTML Support feature} based on
 * {@link module:style/styleconfig~StyleConfig#definitions configured style definitions} and introduces the
 * {@link module:style/stylecommand~StyleCommand style command} that applies styles to the content of the document.
 */
export default class StyleEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'StyleEditing' {
		return 'StyleEditing';
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ 'GeneralHtmlSupport', StyleUtils, DocumentListStyleSupport, TableStyleSupport, LinkStyleSupport ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const dataSchema: DataSchema = editor.plugins.get( 'DataSchema' );
		const styleUtils: StyleUtils = editor.plugins.get( 'StyleUtils' );
		const styleDefinitions: StyleConfig['definitions'] = editor.config.get( 'style.definitions' )!;
		const normalizedStyleDefinitions = styleUtils.normalizeConfig( dataSchema, styleDefinitions );

		editor.commands.add( 'style', new StyleCommand( editor, normalizedStyleDefinitions ) );

		styleUtils.configureGHSDataFilter( normalizedStyleDefinitions );
	}
}
