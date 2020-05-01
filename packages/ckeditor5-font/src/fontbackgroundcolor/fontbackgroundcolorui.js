/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontbackgroundcolor/fontbackgroundcolorui
 */

import ColorUI from '../ui/colorui';
import { FONT_BACKGROUND_COLOR } from '../utils';
import fontBackgroundColorIcon from '../../theme/icons/font-background.svg';

/**
 * The font background color UI plugin. It introduces the `'fontBackgroundColor'` dropdown.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontBackgroundColorUI extends ColorUI {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
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
	static get pluginName() {
		return 'FontBackgroundColorUI';
	}
}
