/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/colorpicker/colorpickerview
 */

import { convertColor, convertToHex, registerCustomElement, type ColorPickerViewConfig } from './utils.js';

import type { HexColor } from '@ckeditor/ckeditor5-core';
import { type Locale, global, env } from '@ckeditor/ckeditor5-utils';
import { debounce, type DebouncedFunc } from 'lodash-es';
import View from '../view.js';
import type InputTextView from '../inputtext/inputtextview.js';
import type ViewCollection from '../viewcollection.js';
import LabeledFieldView from '../labeledfield/labeledfieldview.js';
import { createLabeledInputText } from '../labeledfield/utils.js';

// Custom export due to https://github.com/ckeditor/ckeditor5/issues/15698.
import { HexBase } from 'vanilla-colorful/lib/entrypoints/hex';
import '../../theme/components/colorpicker/colorpicker.css';

declare global {
	interface HTMLElementTagNameMap {
		'hex-color-picker': HexBase;
	}
}

const waitingTime = 150;

/**
 * A class which represents a color picker with an input field for defining custom colors.
 */
export default class ColorPickerView extends View {
	/**
	 * Element with saturation and hue sliders.
	 */
	declare public picker: HexBase;

	/**
	 * Container for a `#` sign prefix and an input for displaying and defining custom colors
	 * in HEX format.
	 */
	public hexInputRow: ColorPickerInputRowView;

	/**
	 * Current color selected in the color picker. It can be set by the component itself
	 * (through the palette or input) or from the outside (e.g. to reflect the current selection color).
	 */
	declare public color: string;

	/**
	 * List of slider views of the color picker.
	 */
	declare public slidersView: ViewCollection<SliderView>;

	/**
	 * An internal representation of a color.
	 *
	 * Since the picker uses a hex format, that's how we store it.
	 *
	 * Since this is unified color format it won't fire a change event if color is changed
	 * from `#f00` to `#ff0000` (same value, different format).
	 *
	 * @observable
	 * @private
	 */
	declare public _hexColor: string;

	/**
	 * Debounced function updating the `color` property in the component
	 * and firing the `ColorPickerColorSelectedEvent`. Executed whenever color in component
	 * is changed by the user interaction (through the palette or input).
	 *
	 * @private
	 */
	private _debounceColorPickerEvent: DebouncedFunc<( arg: string ) => void>;

	/**
	 * A reference to the configuration of the color picker specified in the constructor.
	 *
	 * @private
	 */
	private _config: ColorPickerViewConfig;

	/**
	 * Creates a view of color picker.
	 *
	 * @param locale
	 * @param config
	 */
	constructor( locale: Locale | undefined, config: ColorPickerViewConfig = {} ) {
		super( locale );

		this.set( {
			color: '',
			_hexColor: ''
		} );

		this.hexInputRow = this._createInputRow();
		const children = this.createCollection();

		if ( !config.hideInput ) {
			children.add( this.hexInputRow );
		}

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-color-picker' ],
				tabindex: -1
			},
			children
		} );

		this._config = config;

		this._debounceColorPickerEvent = debounce( ( color: string ) => {
			// At first, set the color internally in the component. It's converted to the configured output format.
			this.set( 'color', color );

			// Then let the outside world know that the user changed the color.
			this.fire<ColorPickerColorSelectedEvent>( 'colorSelected', { color: this.color } );
		}, waitingTime, {
			leading: true
		} );

		// The `color` property holds the color in the configured output format.
		// Ensure it before actually setting the value.
		this.on( 'set:color', ( evt, propertyName, newValue ) => {
			evt.return = convertColor( newValue, this._config.format || 'hsl' );
		} );

		// The `_hexColor` property is bound to the `color` one, but requires conversion.
		this.on( 'change:color', () => {
			this._hexColor = convertColorToCommonHexFormat( this.color );
		} );

		this.on( 'change:_hexColor', () => {
			// Update the selected color in the color picker palette when it's not focused.
			// It means the user typed the color in the input.
			if ( document.activeElement !== this.picker ) {
				this.picker.setAttribute( 'color', this._hexColor );
			}

			// There has to be two way binding between properties.
			// Extra precaution has to be taken to trigger change back only when the color really changes.
			if ( convertColorToCommonHexFormat( this.color ) != convertColorToCommonHexFormat( this._hexColor ) ) {
				this.color = this._hexColor;
			}
		} );
	}

	/**
	 * Renders color picker in the view.
	 */
	public override render(): void {
		super.render();

		// Extracted to the helper to make it testable.
		registerCustomElement( 'hex-color-picker', HexBase );

		this.picker = global.document.createElement( 'hex-color-picker' );
		this.picker.setAttribute( 'class', 'hex-color-picker' );
		this.picker.setAttribute( 'tabindex', '-1' );

		this._createSlidersView();

		if ( this.element ) {
			if ( this.hexInputRow.element ) {
				this.element.insertBefore( this.picker, this.hexInputRow.element );
			} else {
				this.element.appendChild( this.picker );
			}

			// Create custom stylesheet with a look of focused pointer in color picker and append it into the color picker shadowDom
			const styleSheetForFocusedColorPicker = document.createElement( 'style' );

			styleSheetForFocusedColorPicker.textContent = '[role="slider"]:focus [part$="pointer"] {' +
				'border: 1px solid #fff;' +
				'outline: 1px solid var(--ck-color-focus-border);' +
				'box-shadow: 0 0 0 2px #fff;' +
				'}';
			this.picker.shadowRoot!.appendChild( styleSheetForFocusedColorPicker );
		}

		this.picker.addEventListener( 'color-changed', event => {
			const color = event.detail.value;
			this._debounceColorPickerEvent( color );
		} );
	}

	/**
	 * Focuses the first pointer in color picker.
	 *
	 */
	public focus(): void {
		// In some browsers we need to move the focus to the input first.
		// Otherwise, the color picker doesn't behave as expected.
		// In FF, after selecting the color via slider, it instantly moves back to the previous color.
		// In all iOS browsers and desktop Safari, once the saturation slider is moved for the first time,
		// editor collapses the selection and doesn't apply the color change.
		// See: https://github.com/cksource/ckeditor5-internal/issues/3245, https://github.com/ckeditor/ckeditor5/issues/14119,
		// https://github.com/cksource/ckeditor5-internal/issues/3268.
		/* istanbul ignore next -- @preserve */
		if ( !this._config.hideInput && ( env.isGecko || env.isiOS || env.isSafari ) ) {
			const input: LabeledFieldView<InputTextView> = this.hexInputRow!.children.get( 1 )! as LabeledFieldView<InputTextView>;

			input.focus();
		}

		const firstSlider = this.slidersView.first!;

		firstSlider.focus();
	}

	/**
	 * Creates collection of sliders in color picker.
	 *
	 * @private
	 */
	private _createSlidersView(): void {
		const colorPickersChildren = [ ...this.picker.shadowRoot!.children ] as Array<HTMLElement>;
		const sliders = colorPickersChildren.filter( item => item.getAttribute( 'role' ) === 'slider' );

		const slidersView = sliders.map( slider => {
			const view = new SliderView( slider );

			return view;
		} );

		this.slidersView = this.createCollection();

		slidersView.forEach( item => {
			this.slidersView.add( item );
		} );
	}

	/**
	 * Creates input row for defining custom colors in color picker.
	 *
	 * @private
	 */
	private _createInputRow(): ColorPickerInputRowView {
		const colorInput = this._createColorInput();

		return new ColorPickerInputRowView( this.locale!, colorInput );
	}

	/**
	 * Creates the input where user can type or paste the color in hex format.
	 *
	 * @private
	 */
	private _createColorInput(): LabeledFieldView<InputTextView> {
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );
		const { t } = this.locale!;

		labeledInput.set( {
			label: t( 'HEX' ),
			class: 'color-picker-hex-input'
		} );

		labeledInput.fieldView.bind( 'value' ).to( this, '_hexColor', pickerColor => {
			if ( labeledInput.isFocused ) {
				// Text field shouldn't be updated with color change if the text field is focused.
				// Imagine user typing hex code and getting the value of field changed.
				return labeledInput.fieldView.value;
			} else {
				return pickerColor.startsWith( '#' ) ? pickerColor.substring( 1 ) : pickerColor;
			}
		} );

		// Only accept valid hex colors as input.
		labeledInput.fieldView.on( 'input', () => {
			const inputValue = labeledInput.fieldView.element!.value;

			if ( inputValue ) {
				const maybeHexColor = tryParseHexColor( inputValue );

				if ( maybeHexColor ) {
					// If so, set the color.
					// Otherwise, do nothing.
					this._debounceColorPickerEvent( maybeHexColor );
				}
			}
		} );

		return labeledInput;
	}

	/**
	 * Validates the view and returns `false` when some fields are invalid.
	 */
	public isValid(): boolean {
		const { t } = this.locale!;

		// If the input is hidden, it's always valid, because there is no way to select
		// invalid color value using diagram color picker.
		if ( this._config.hideInput ) {
			return true;
		}

		this.resetValidationStatus();

		// One error per field is enough.
		if ( !this.hexInputRow.getParsedColor() ) {
			// Apply updated error.
			this.hexInputRow.inputView.errorText = t( 'Please enter a valid color (e.g. "ff0000").' );

			return false;
		}

		return true;
	}

	/**
	 * Cleans up the supplementary error and information text of input inside the {@link #hexInputRow}
	 * bringing them back to the state when the form has been displayed for the first time.
	 *
	 * See {@link #isValid}.
	 */
	public resetValidationStatus(): void {
		this.hexInputRow.inputView.errorText = null;
	}
}

// Converts any color format to a unified hex format.
//
// @param inputColor
// @returns An unified hex string.
function convertColorToCommonHexFormat( inputColor: string ): string {
	let ret = convertToHex( inputColor );

	if ( !ret ) {
		ret = '#000';
	}

	if ( ret.length === 4 ) {
		// Unfold shortcut format.
		ret = '#' + [ ret[ 1 ], ret[ 1 ], ret[ 2 ], ret[ 2 ], ret[ 3 ], ret[ 3 ] ].join( '' );
	}

	return ret.toLowerCase();
}

// View abstraction over pointer in color picker.
class SliderView extends View {
	/**
	 * @param element HTML element of slider in color picker.
	 */
	constructor( element: HTMLElement ) {
		super();
		this.element = element;
	}

	/**
	 * Focuses element.
	 */
	public focus(): void {
		this.element!.focus();
	}
}

// View abstraction over the `#` character before color input.
class HashView extends View {
	constructor( locale?: Locale ) {
		super( locale );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-color-picker__hash-view'
				]
			},
			children: '#'
		} );
	}
}

// The class representing a row containing hex color input field.
// **Note**: For now this class is private. When more use cases appear (beyond `ckeditor5-table` and `ckeditor5-image`),
// it will become a component in `ckeditor5-ui`.
//
// @private
class ColorPickerInputRowView extends View {
	/**
	 * A collection of row items (buttons, dropdowns, etc.).
	 */
	public readonly children: ViewCollection;

	/**
	 * Hex input view element.
	 */
	public readonly inputView: LabeledFieldView<InputTextView>;

	/**
	 * Creates an instance of the form row class.
	 *
	 * @param locale The locale instance.
	 * @param inputView Hex color input element.
	 */
	constructor( locale: Locale, inputView: LabeledFieldView<InputTextView> ) {
		super( locale );

		this.inputView = inputView;
		this.children = this.createCollection( [
			new HashView(),
			this.inputView
		] );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-color-picker__row'
				]
			},
			children: this.children
		} );
	}

	/**
	 * Returns false if color input value is not in hex format.
	 */
	public getParsedColor(): HexColor | null {
		return tryParseHexColor( this.inputView.fieldView.element!.value );
	}
}

/**
 * An event fired whenever the color was selected through the color picker palette
 * or the color picker input.
 *
 * This even fires only when the user changes the color. It does not fire when the color
 * is changed programmatically, e.g. via
 * {@link module:ui/colorpicker/colorpickerview~ColorPickerView#color}.
 *
 * @eventName ~ColorPickerView#colorSelected
 */
export type ColorPickerColorSelectedEvent = {
	name: 'colorSelected';
	args: [ {
		color: string;
	} ];
};

/**
 * Trim spaces from provided color and check if hex is valid.
 *
 * @param color Unsafe color string.
 * @returns Null if provided color is not hex value.
 * @export
 */
export function tryParseHexColor<S extends string>( color: S | null | undefined ): HexColor<S> | null {
	if ( !color ) {
		return null;
	}

	const hashLessColor = color.trim().replace( /^#/, '' );

	// Incorrect length.
	if ( ![ 3, 4, 6, 8 ].includes( hashLessColor.length ) ) {
		return null;
	}

	// Incorrect characters.
	if ( !/^(([0-9a-fA-F]{2}){3,4}|([0-9a-fA-F]){3,4})$/.test( hashLessColor ) ) {
		return null;
	}

	return `#${ hashLessColor }` as `#${ S }`;
}
