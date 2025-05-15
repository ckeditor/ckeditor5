/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module style/styleediting
 */

import { Plugin } from 'ckeditor5/src/core.js';
import type { DataSchema } from '@ckeditor/ckeditor5-html-support';

import StyleCommand from './stylecommand.js';
import StyleUtils from './styleutils.js';
import type { StyleConfig } from './styleconfig.js';

import ListStyleSupport from './integrations/list.js';
import TableStyleSupport from './integrations/table.js';
import LinkStyleSupport from './integrations/link.js';

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
	public static get pluginName() {
		return 'StyleEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ 'GeneralHtmlSupport', StyleUtils, ListStyleSupport, TableStyleSupport, LinkStyleSupport ] as const;
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
