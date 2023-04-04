/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module font
 */

export { default as Font } from './font';
export { default as FontBackgroundColor } from './fontbackgroundcolor';
export { default as FontColor } from './fontcolor';
export { default as FontFamily } from './fontfamily';
export { default as FontSize } from './fontsize';
export { default as FontBackgroundColorEditing } from './fontbackgroundcolor/fontbackgroundcolorediting';
export { default as FontBackgroundColorUI } from './fontbackgroundcolor/fontbackgroundcolorui';
export { default as FontColorEditing } from './fontcolor/fontcolorediting';
export { default as FontColorUI } from './fontcolor/fontcolorui';
export { default as FontFamilyEditing } from './fontfamily/fontfamilyediting';
export { default as FontFamilyUI } from './fontfamily/fontfamilyui';
export { default as FontSizeEditing } from './fontsize/fontsizeediting';
export { default as FontSizeUI } from './fontsize/fontsizeui';
export type { default as FontBackgroundColorCommand } from './fontbackgroundcolor/fontbackgroundcolorcommand';
export type { default as FontColorCommand } from './fontcolor/fontcolorcommand';
export type { default as FontFamilyCommand } from './fontfamily/fontfamilycommand';
export type { default as FontSizeCommand } from './fontsize/fontsizecommand';

export type {
	FONT_BACKGROUND_COLOR,
	FONT_COLOR,
	FONT_FAMILY,
	FONT_SIZE
} from './utils';

export type {
	FontColorConfig,
	FontFamilyConfig,
	FontSizeConfig
} from './fontconfig';

import './augmentation';
