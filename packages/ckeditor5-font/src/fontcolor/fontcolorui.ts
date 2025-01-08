/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module font/fontcolor/fontcolorui
 */

import ColorUI from '../ui/colorui.js';
import { FONT_COLOR } from '../utils.js';
import type { Editor } from 'ckeditor5/src/core.js';

import fontColorIcon from '../../theme/icons/font-color.svg';

/**
 * The font color UI plugin. It introduces the `'fontColor'` dropdown.
 */
export default class FontColorUI extends ColorUI {
	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		const t = editor.locale.t;

		super( editor, {
			commandName: FONT_COLOR,
			componentName: FONT_COLOR,
			icon: fontColorIcon,
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
