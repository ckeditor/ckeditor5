/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/colorpicker/colorpickerview
 */

import { convertColor, convertToHex, type ColorPickerConfig, type ColorPickerOutputFormat } from './utils';

import { type Locale, global, env } from '@ckeditor/ckeditor5-utils';
import { debounce, type DebouncedFunc } from 'lodash-es';
import View from '../view';
import type InputTextView from '../inputtext/inputtextview';
import type ViewCollection from '../viewcollection';
import LabeledFieldView from '../labeledfield/labeledfieldview';
import { createLabeledInputText } from '../labeledfield/utils';

import 'vanilla-colorful/hex-color-picker.js';
import '../../theme/components/colorpicker/colorpicker.css';

const waitingTime = 150;

export default class ColorPickerView extends View {
	/**
	 * Element with saturation and hue sliders.
	 */
	declare public picker: HTMLElement;

	/**
	 * Container for a `#` sign prefix and an input for displaying and defining custom colors
	 * in HEX format.
	 */
	declare public hexInputRow: ColorPickerInputRowView;

	/**
	 * Current color state in color picker.
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
	* Debounced event method. The `colorPickerEvent()` method is called the specified `waitingTime` after
	* `debouncedPickerEvent()` is called, unless a new action happens in the meantime.
	*/
	declare private _debounceColorPickerEvent: DebouncedFunc<( arg: string ) => void>;

	/**
	 * The output format (the one in which colors are applied in the model) of color picker.
	 */
	declare private _format: ColorPickerOutputFormat;

	/**
	 * Creates a view of color picker.
	 *
	 * @param locale
	 * @param config
	 */
	constructor( locale: Locale | undefined, config: ColorPickerConfig ) {
		super( locale );

		this.set( 'color', '' );

		this.set( '_hexColor', '' );

		this._format = config.format || 'hsl';

		this.hexInputRow = this._createInputRow();

		const children = this.createCollection();
		children.add( this.hexInputRow );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-color-picker' ],
				tabindex: -1
			},
			children
		} );

		this._debounceColorPickerEvent = debounce( ( color: string ) => {
			this.set( 'color', color );
		}, waitingTime, {
			leading: true
		} );

		// Sets color in the picker if color was updated.
		this.on( 'set:color', ( evt, propertyName, newValue ) => {
			// The color needs always to be kept in the output format.
			evt.return = convertColor( newValue, this._format );
		} );

		this.on( 'change:color', () => {
			this._hexColor = convertColorToCommonHexFormat( this.color );
		} );

		this.on( 'change:_hexColor', () => {
			this.picker.setAttribute( 'color', this._hexColor );

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

		this.picker = global.document.createElement( 'hex-color-picker' );
		this.picker.setAttribute( 'class', 'hex-color-picker' );
		this.picker.setAttribute( 'tabindex', '-1' );

		this._createSlidersView();

		if ( this.element ) {
			this.element.insertBefore( this.picker, this.hexInputRow.element );

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
			const customEvent = event as CustomEvent;
			const color = customEvent.detail.value;
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
		if ( env.isGecko || env.isiOS || env.isSafari ) {
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
		const hashView = new HashView();
		const colorInput = this._createColorInput();

		return new ColorPickerInputRowView( this.locale!, [ hashView, colorInput ] );
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
				// Trim the whitespace.
				const trimmedValue = inputValue.trim();

				// Drop the `#` from the beginning if present.
				const hashlessInput = trimmedValue.startsWith( '#' ) ? trimmedValue.substring( 1 ) : trimmedValue;

				// Check if it's a hex color (3,4,6 or 8 chars long and with proper characters).
				const isValidHexColor = [ 3, 4, 6, 8 ].includes( hashlessInput.length ) &&
					/(([0-9a-fA-F]{2}){3,4}|([0-9a-fA-F]){3,4})/.test( hashlessInput );

				if ( isValidHexColor ) {
					// If so, set the color.
					// Otherwise, do nothing.
					this._debounceColorPickerEvent( '#' + hashlessInput );
				}
			}
		} );

		return labeledInput;
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
	 * @param element HTML elemnt of slider in color picker.
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

// View abstaction over the `#` character before color input.
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
	 * Creates an instance of the form row class.
	 *
	 * @param locale The locale instance.
	 */
	constructor( locale: Locale, children?: Array<View> ) {
		super( locale );

		this.children = this.createCollection( children );

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
}
