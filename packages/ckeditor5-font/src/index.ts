/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module font
 */

export { default as Font } from './font.js';
export { default as FontBackgroundColor } from './fontbackgroundcolor.js';
export { default as FontColor } from './fontcolor.js';
export { default as FontFamily } from './fontfamily.js';
export { default as FontSize } from './fontsize.js';
export { default as FontBackgroundColorEditing } from './fontbackgroundcolor/fontbackgroundcolorediting.js';
export { default as FontBackgroundColorUI } from './fontbackgroundcolor/fontbackgroundcolorui.js';
export { default as FontColorEditing } from './fontcolor/fontcolorediting.js';
export { default as FontColorUI } from './fontcolor/fontcolorui.js';
export { default as FontFamilyEditing } from './fontfamily/fontfamilyediting.js';
export { default as FontFamilyUI } from './fontfamily/fontfamilyui.js';
export { default as FontSizeEditing } from './fontsize/fontsizeediting.js';
export { default as FontSizeUI } from './fontsize/fontsizeui.js';
export type { default as FontBackgroundColorCommand } from './fontbackgroundcolor/fontbackgroundcolorcommand.js';
export type { default as FontColorCommand } from './fontcolor/fontcolorcommand.js';
export type { default as FontFamilyCommand } from './fontfamily/fontfamilycommand.js';
export type { default as FontSizeCommand } from './fontsize/fontsizecommand.js';

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
