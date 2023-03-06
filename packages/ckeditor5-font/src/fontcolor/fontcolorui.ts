/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontcolor/fontcolorui
 */

import ColorUI from '../ui/colorui';
import { FONT_COLOR } from '../utils';
import type { Editor } from 'ckeditor5/src/core';

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
	public static get pluginName(): 'FontColorUI' {
		return 'FontColorUI';
	}
}
