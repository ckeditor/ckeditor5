/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */
/**
 * @module font/utils
 */
import ColorTableView from './ui/colortableview';
import type { FontFamilyOption, FontSizeOption } from './fontconfig';
import type { ColorDefinition, DropdownView } from 'ckeditor5/src/ui';
import type { ArrayOrItem } from 'ckeditor5/src/utils';
import type { ViewAttributeElement, ViewElement, MatcherPattern, ViewElementDefinition, DowncastConversionApi } from 'ckeditor5/src/engine';
/**
 * The name of the font size plugin.
 */
export declare const FONT_SIZE = "fontSize";
/**
 * The name of the font family plugin.
 */
export declare const FONT_FAMILY = "fontFamily";
/**
 * The name of the font color plugin.
 */
export declare const FONT_COLOR = "fontColor";
/**
 * The name of the font background color plugin.
 */
export declare const FONT_BACKGROUND_COLOR = "fontBackgroundColor";
/**
 * Builds a proper converter definition out of input data.
 */
export declare function buildDefinition(modelAttributeKey: string, options: Array<FontFamilyOption> | Array<FontSizeOption>): FontConverterDefinition;
export type FontConverterDefinition = {
    model: {
        key: string;
        values: Array<string>;
    };
    view: Record<string, ViewElementDefinition>;
    upcastAlso: Record<string, ArrayOrItem<MatcherPattern>>;
};
/**
 * A {@link module:font/fontcolor~FontColor font color} and
 * {@link module:font/fontbackgroundcolor~FontBackgroundColor font background color} helper
 * responsible for upcasting data to the model.
 *
 * **Note**: The `styleAttr` parameter should be either `'color'` or `'background-color'`.
 */
export declare function renderUpcastAttribute(styleAttr: string): (viewElement: ViewElement) => string;
/**
 * A {@link module:font/fontcolor~FontColor font color} and
 * {@link module:font/fontbackgroundcolor~FontBackgroundColor font background color} helper
 * responsible for downcasting a color attribute to a `<span>` element.
 *
 * **Note**: The `styleAttr` parameter should be either `'color'` or `'background-color'`.
 */
export declare function renderDowncastElement(styleAttr: string): (modelAttributeValue: string, { writer }: DowncastConversionApi) => ViewAttributeElement;
/**
 * A helper that adds {@link module:font/ui/colortableview~ColorTableView} to the color dropdown with proper initial values.
 *
 * @param config.dropdownView The dropdown view to which a {@link module:font/ui/colortableview~ColorTableView} will be added.
 * @param config.colors An array with definitions representing colors to be displayed in the color table.
 * @param config.removeButtonLabel The label for the button responsible for removing the color.
 * @param config.documentColorsLabel The label for the section with document colors.
 * @param config.documentColorsCount The number of document colors inside the dropdown.
 * @returns The new color table view.
 */
export declare function addColorTableToDropdown({ dropdownView, colors, columns, removeButtonLabel, documentColorsLabel, documentColorsCount }: {
    dropdownView: ColorTableDropdownView;
    colors: Array<ColorDefinition>;
    columns: number;
    removeButtonLabel: string;
    documentColorsLabel?: string;
    documentColorsCount?: number;
}): ColorTableView;
export type ColorTableDropdownView = DropdownView & {
    colorTableView?: ColorTableView;
};
