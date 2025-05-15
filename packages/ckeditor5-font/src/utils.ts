/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module font/utils
 */

import type { FontFamilyOption, FontSizeOption } from './fontconfig.js';
import { ColorSelectorView, type ColorDefinition, type ColorPickerViewConfig, type DropdownView } from 'ckeditor5/src/ui.js';
import type { ArrayOrItem } from 'ckeditor5/src/utils.js';
import type {
	ViewAttributeElement,
	ViewElement,
	MatcherPattern,
	ViewElementDefinition,
	DowncastConversionApi
} from 'ckeditor5/src/engine.js';

/**
 * The name of the font size plugin.
 */
export const FONT_SIZE = 'fontSize';

/**
 * The name of the font family plugin.
 */
export const FONT_FAMILY = 'fontFamily';

/**
 * The name of the font color plugin.
 */
export const FONT_COLOR = 'fontColor';

/**
 * The name of the font background color plugin.
 */
export const FONT_BACKGROUND_COLOR = 'fontBackgroundColor';

/**
 * Builds a proper converter definition out of input data.
 */
export function buildDefinition(
	modelAttributeKey: string,
	options: Array<FontFamilyOption> | Array<FontSizeOption>
): FontConverterDefinition {
	const definition: FontConverterDefinition = {
		model: {
			key: modelAttributeKey,
			values: []
		},
		view: {},
		upcastAlso: {}
	};

	for ( const option of options ) {
		definition.model.values.push( option.model! );
		definition.view[ option.model! ] = option.view!;

		if ( option.upcastAlso ) {
			definition.upcastAlso[ option.model! ] = option.upcastAlso;
		}
	}

	return definition;
}

export type FontConverterDefinition = {
	model: { key: string; values: Array<string> };
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
export function renderUpcastAttribute( styleAttr: string ) {
	return ( viewElement: ViewElement ): string => normalizeColorCode( viewElement.getStyle( styleAttr )! );
}

/**
 * A {@link module:font/fontcolor~FontColor font color} and
 * {@link module:font/fontbackgroundcolor~FontBackgroundColor font background color} helper
 * responsible for downcasting a color attribute to a `<span>` element.
 *
 * **Note**: The `styleAttr` parameter should be either `'color'` or `'background-color'`.
 */
export function renderDowncastElement( styleAttr: string ) {
	return ( modelAttributeValue: string, { writer }: DowncastConversionApi ): ViewAttributeElement =>
		writer.createAttributeElement( 'span', {
			style: `${ styleAttr }:${ modelAttributeValue }`
		}, { priority: 7 } );
}

/**
 * A helper that adds {@link module:ui/colorselector/colorselectorview~ColorSelectorView} to the color dropdown with proper initial values.
 *
 * @param options Configuration options
 * @param options.dropdownView The dropdown view to which a {@link module:ui/colorselector/colorselectorview~ColorSelectorView}
 * will be added.
 * @param options.colors An array with definitions representing colors to be displayed in the color selector.
 * @param options.columns The number of columns in the color grid.
 * @param options.removeButtonLabel The label for the button responsible for removing the color.
 * @param options.colorPickerLabel The label for the color picker button.
 * @param options.documentColorsLabel The label for the section with document colors.
 * @param options.documentColorsCount The number of document colors inside the dropdown.
 * @param options.colorPickerViewConfig Configuration of the color picker view.
 * @returns The new color selector view.
 */
export function addColorSelectorToDropdown(
	{
		dropdownView, colors, columns, removeButtonLabel, colorPickerLabel,
		documentColorsLabel, documentColorsCount, colorPickerViewConfig
	}: {
		dropdownView: ColorSelectorDropdownView;
		colors: Array<ColorDefinition>;
		columns: number;
		removeButtonLabel: string;
		colorPickerLabel: string;
		documentColorsLabel?: string;
		documentColorsCount?: number;
		colorPickerViewConfig: ColorPickerViewConfig | false;
	}
): ColorSelectorView {
	const locale = dropdownView.locale!;
	const colorSelectorView = new ColorSelectorView( locale, {
		colors,
		columns,
		removeButtonLabel,
		colorPickerLabel,
		documentColorsLabel,
		documentColorsCount,
		colorPickerViewConfig
	} );

	dropdownView.colorSelectorView = colorSelectorView;
	dropdownView.panelView.children.add( colorSelectorView );

	return colorSelectorView;
}

/**
 * Fixes the color value string.
 */
function normalizeColorCode( value: string ): string {
	return value.replace( /\s/g, '' );
}

export type ColorSelectorDropdownView = DropdownView & {
	colorSelectorView?: ColorSelectorView;
};
