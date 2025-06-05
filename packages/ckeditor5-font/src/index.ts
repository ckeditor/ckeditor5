/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module font
 */

export { Font } from './font.js';
export { FontBackgroundColor } from './fontbackgroundcolor.js';
export { FontColor } from './fontcolor.js';
export { FontFamily } from './fontfamily.js';
export { FontSize } from './fontsize.js';
export { FontBackgroundColorEditing } from './fontbackgroundcolor/fontbackgroundcolorediting.js';
export { FontBackgroundColorUI } from './fontbackgroundcolor/fontbackgroundcolorui.js';
export { FontColorEditing } from './fontcolor/fontcolorediting.js';
export { FontColorUI } from './fontcolor/fontcolorui.js';
export { FontFamilyEditing } from './fontfamily/fontfamilyediting.js';
export { FontFamilyUI } from './fontfamily/fontfamilyui.js';
export { FontSizeEditing } from './fontsize/fontsizeediting.js';
export { FontSizeUI } from './fontsize/fontsizeui.js';
export { FontBackgroundColorCommand } from './fontbackgroundcolor/fontbackgroundcolorcommand.js';
export { FontColorCommand } from './fontcolor/fontcolorcommand.js';
export { FontFamilyCommand } from './fontfamily/fontfamilycommand.js';
export { FontSizeCommand } from './fontsize/fontsizecommand.js';

export type {
	FONT_BACKGROUND_COLOR,
	FONT_COLOR,
	FONT_FAMILY,
	FONT_SIZE,
	ColorSelectorDropdownView
} from './utils.js';

export type {
	FontColorConfig,
	FontFamilyConfig,
	FontSizeConfig
} from './fontconfig.js';

import './augmentation.js';
