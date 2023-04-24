/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/colorpicker/colorpickerview
 */

import { convertColor, convertToHex, type ColorPickerConfig, type ColorPickerOutputFormat } from './utils';

import { type Locale, global } from '@ckeditor/ckeditor5-utils';
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
	 * Color picker component.
	 */
	declare public picker: HTMLElement;

	/**
	 * Input to defining custom colors in HEX.
	 */
	declare public input: LabeledFieldView<InputTextView>;

	/**
	 * Current color state in color picker.
	 */
	declare public color: string;

	/**
	 * List of sliders view of the color picker.
	 */
	declare public slidersView: ViewCollection;

	/**
     * An internal representation of a color
     *
     * Since the picker uses a hex, we store it in that format.
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
	declare private _debounceColorPickerEvent: DebouncedFunc< ( arg: string ) => void >;

	declare private _format: ColorPickerOutputFormat;

	constructor( locale: Locale | undefined, config: ColorPickerConfig ) {
		super( locale );

		this.set( 'color', '' );

		this.set( '_hexColor', '' );

		this._format = config.format || 'hsl';

		this.input = this._createInput();

		const children = this.createCollection();
		children.add( this.input );

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
		this.on( 'change:color', () => {
			const convertedColor = convertColor( this.color, this._format );

			if ( convertedColor != this.color ) {
				this.color = convertedColor;
			}

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

	// Renders color picker in the view.
	public override render(): void {
		super.render();

		this.picker = global.document.createElement( 'hex-color-picker' );
		this.picker.setAttribute( 'class', 'hex-color-picker' );
		this.picker.setAttribute( 'tabindex', '-1' );

		this._createSlidersView();

		if ( this.element ) {
			this.element.insertBefore( this.picker, this.input.element );
		}

		this.picker.addEventListener( 'color-changed', event => {
			const customEvent = event as CustomEvent;
			const color = customEvent.detail.value;
			this._debounceColorPickerEvent( color );
		} );
	}

	private _createSlidersView(): void {
		const colorPickersChildren = [ ...this.picker.shadowRoot!.children ] as Array<HTMLElement>;
		const sliders = colorPickersChildren.filter( item => item.role === 'slider' );

		const slidersView = sliders.map( slider => {
			const view = new SliderView( slider );

			return view;
		} );

		this.slidersView = this.createCollection();

		slidersView.forEach( item => {
			this.slidersView.add( item );
		} );
	}

	// Creates input for defining custom colors in color picker.
	private _createInput(): LabeledFieldView<InputTextView> {
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );
		const { t } = this.locale!;

		labeledInput.set( {
			label: t( 'HEX' ),
			class: 'color-picker-hex-input'
		} );

		labeledInput.fieldView.bind( 'value' ).to( this, 'color', pickerColor => {
			if ( labeledInput.isFocused ) {
				// Text field shouldn't be updated with color change if the text field is focused.
				// Imagine user typing hex code and getting the value of field changed.
				return labeledInput.fieldView.value;
			} else {
				return pickerColor;
			}
		} );

		labeledInput.fieldView.on( 'input', () => {
			const inputValue = labeledInput.fieldView.element!.value;

			if ( inputValue ) {
				this._debounceColorPickerEvent( inputValue );
			}
		} );

		return labeledInput;
	}
}

/**
 * View abstraction over pointer in color picker.
 */
class SliderView extends View {
	constructor( element: HTMLElement ) {
		super();
		this.element = element;
	}

	public focus(): void {
		this.element!.focus();
	}
}

/**
 * Converts any color format to a unified hex format.
 *
 * @param inputColor
 * @returns An unified hex string.
 */
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
