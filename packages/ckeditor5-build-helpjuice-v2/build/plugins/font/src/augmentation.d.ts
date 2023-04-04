/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
import type { Font, FontBackgroundColor, FontBackgroundColorEditing, FontBackgroundColorUI, FontBackgroundColorCommand, FontColor, FontColorEditing, FontColorUI, FontColorCommand, FontColorConfig, FontFamily, FontFamilyEditing, FontFamilyUI, FontFamilyCommand, FontFamilyConfig, FontSize, FontSizeEditing, FontSizeUI, FontSizeCommand, FontSizeConfig, FONT_BACKGROUND_COLOR, FONT_COLOR, FONT_FAMILY, FONT_SIZE } from './index';
declare module '@ckeditor/ckeditor5-core' {
    interface EditorConfig {
        /**
         * The configuration of the font background color feature.
         * It is introduced by the {@link module:font/fontbackgroundcolor/fontbackgroundcolorediting~FontBackgroundColorEditing} feature.
         *
         * Read more in {@link module:font/fontconfig~FontColorConfig}.
         */
        fontBackgroundColor?: FontColorConfig;
        /**
         * The configuration of the font color feature.
         * It is introduced by the {@link module:font/fontcolor/fontcolorediting~FontColorEditing} feature.
         *
         * Read more in {@link module:font/fontconfig~FontColorConfig}.
         */
        fontColor?: FontColorConfig;
        /**
         * The configuration of the font family feature.
         * It is introduced by the {@link module:font/fontfamily/fontfamilyediting~FontFamilyEditing} feature.
         *
         * Read more in {@link module:font/fontconfig~FontFamilyConfig}.
         */
        fontFamily?: FontFamilyConfig;
        /**
         * The configuration of the font size feature.
         * It is introduced by the {@link module:font/fontsize/fontsizeediting~FontSizeEditing} feature.
         *
         * Read more in {@link module:font/fontconfig~FontSizeConfig}.
         */
        fontSize?: FontSizeConfig;
    }
    interface PluginsMap {
        [Font.pluginName]: Font;
        [FontBackgroundColor.pluginName]: FontBackgroundColor;
        [FontBackgroundColorEditing.pluginName]: FontBackgroundColorEditing;
        [FontBackgroundColorUI.pluginName]: FontBackgroundColorUI;
        [FontColor.pluginName]: FontColor;
        [FontColorEditing.pluginName]: FontColorEditing;
        [FontColorUI.pluginName]: FontColorUI;
        [FontFamily.pluginName]: FontFamily;
        [FontFamilyEditing.pluginName]: FontFamilyEditing;
        [FontFamilyUI.pluginName]: FontFamilyUI;
        [FontSize.pluginName]: FontSize;
        [FontSizeEditing.pluginName]: FontSizeEditing;
        [FontSizeUI.pluginName]: FontSizeUI;
    }
    interface CommandsMap {
        [FONT_SIZE]: FontSizeCommand;
        [FONT_FAMILY]: FontFamilyCommand;
        [FONT_COLOR]: FontColorCommand;
        [FONT_BACKGROUND_COLOR]: FontBackgroundColorCommand;
    }
}
