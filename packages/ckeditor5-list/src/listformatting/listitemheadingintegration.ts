/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listformatting/listitemheadingintegration
 */

import { Plugin, type PluginDependenciesOf } from '@ckeditor/ckeditor5-core';

import { ListEditing } from '../list/listediting.js';
import type { ListFormatting } from '../listformatting.js';

/**
 * The list item heading integration plugin.
 *
 * Makes the marker of a bulleted or numbered list item that starts with a heading look like that heading.
 * It requires the {@link module:list/listconfig~ListConfig#enableListItemMarkerFromBlock `list.enableListItemMarkerFromBlock`}
 * option to be enabled.
 */
export class ListItemHeadingIntegration extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListItemHeadingIntegration' as const;
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
	public static get requires(): PluginDependenciesOf<[ ListEditing ]> {
		return [ ListEditing ];
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const listFormatting: ListFormatting = editor.plugins.get( 'ListFormatting' );

		// The list package does not depend on the heading package, hence the loose typing.
		const headingOptions = editor.plugins.has( 'HeadingEditing' ) ?
			editor.config.get( 'heading.options' ) as Array<{ model: string }> :
			[];

		const headingModelNames = headingOptions.map( option => option.model ).filter( name => name != 'paragraph' );

		// Headings not covered by the heading feature (for example `<h1>`, or all of them without it) can be preserved
		// by the general HTML support as `htmlH1`, etc.
		listFormatting.registerMarkerFromBlockCheck( block =>
			headingModelNames.includes( block.name ) || /^htmlH[1-6]$/.test( block.name )
		);
	}
}
