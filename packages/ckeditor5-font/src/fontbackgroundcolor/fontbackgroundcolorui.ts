/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontbackgroundcolor/fontbackgroundcolorui
 */

import ColorUI from '../ui/colorui';
import { FONT_BACKGROUND_COLOR } from '../utils';
import type { Editor } from 'ckeditor5/src/core';

import fontBackgroundColorIcon from '../../theme/icons/font-background.svg';

/**
 * The font background color UI plugin. It introduces the `'fontBackgroundColor'` dropdown.
 */
export default class FontBackgroundColorUI extends ColorUI {
	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		const t = editor.locale.t;

		super( editor, {
			commandName: FONT_BACKGROUND_COLOR,
			componentName: FONT_BACKGROUND_COLOR,
			icon: fontBackgroundColorIcon,
			dropdownLabel: t( 'Font Background Color' )
		} );
	}

	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'FontBackgroundColorUI' {
		return 'FontBackgroundColorUI';
	}
}
