/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module list/listitemformatting/listitemfontfamilyintegration
 */

import { Plugin } from 'ckeditor5/src/core.js';

/**
 * The list item font family integration plugin.
 */
export default class ListItemFontFamilyIntegration extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'ListItemFontFamilyIntegration' as const;
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
	public afterInit(): void {
		const editor = this.editor;
		const model = editor.model;

		if ( !editor.plugins.has( 'FontFamily' ) ) {
			return;
		}

		model.schema.extend( '$listItem', { allowAttributes: 'listItemFontFamily' } );
		model.schema.setAttributeProperties( 'listItemFontFamily', {
			isFormatting: true
		} );
	}
}
