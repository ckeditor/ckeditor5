/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/codeblocktoolbar
 */
import { Plugin, type PluginDependencies, type ToolbarConfigItem } from 'ckeditor5/src/core';
import { WidgetToolbarRepository } from 'ckeditor5/src/widget';
import { getClosestSelectedCodeblockView } from './utils';

/**
 * The codeblock toolbar plugin. It creates and manages the codeblock toolbar. (the toolbar displayed when an codeblock is selected).
 */
export default class CodeblockToolbar extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get requires(): PluginDependencies {
		return [ WidgetToolbarRepository ];
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'CodeblockToolbar' {
		return 'CodeblockToolbar';
	}

	/**
	 * @inheritDoc
	 */
	public afterInit(): void {
		const editor = this.editor;
		const t = editor.t;
		const widgetToolbarRepository = editor.plugins.get( WidgetToolbarRepository );

		widgetToolbarRepository.register( 'codeblock', {
			ariaLabel: t( 'Codeblock toolbar' ),
			items: editor.config.get( 'codeblock.toolbar' ) as Array<ToolbarConfigItem> || [],
			getRelatedElement: selection => getClosestSelectedCodeblockView( selection )
		} );
	}
}

