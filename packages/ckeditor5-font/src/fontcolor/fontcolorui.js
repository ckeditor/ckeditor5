/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font/fontcolor/fontcolorui
 */

import ColorUI from '../ui/colorui';
import { FONT_COLOR } from '../utils';
import fontColorIcon from '../../theme/icons/font-color.svg';

/**
 * The font color UI plugin. It introduces the `'fontColor'` dropdown.
 *
 * @extends module:core/plugin~Plugin
 */
export default class FontColorUI extends ColorUI {
	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
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
	static get pluginName() {
		return 'FontColorUI';
	}
}
