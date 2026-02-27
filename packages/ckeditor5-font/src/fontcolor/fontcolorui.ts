/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module font/fontcolor/fontcolorui
 */

import { IconFontColor } from '@ckeditor/ckeditor5-icons';
import { FontColorUIBase } from '../ui/colorui.js';
import { FONT_COLOR } from '../utils.js';
import type { Editor } from '@ckeditor/ckeditor5-core';

/**
 * The font color UI plugin. It introduces the `'fontColor'` dropdown.
 */
export class FontColorUI extends FontColorUIBase {
	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		const t = editor.locale.t;

		super( editor, {
			commandName: FONT_COLOR,
			componentName: FONT_COLOR,
			icon: IconFontColor,
			dropdownLabel: t( 'Font Color' )
		} );
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FontColorUI' as const;
	}
}
