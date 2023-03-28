/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/colorpicker/colorpickerview
 */

/* eslint-disable @typescript-eslint/ban-ts-comment */

import { type Locale, global } from '@ckeditor/ckeditor5-utils';
import { debounce, type DebouncedFunc } from 'lodash-es';
import View from '../view';
import type InputTextView from '../inputtext/inputtextview';
import LabeledFieldView from '../labeledfield/labeledfieldview';
import { createLabeledInputText } from '../labeledfield/utils';

// There are no available types for 'color-parse' module.
// @ts-ignore
import { default as parse } from 'color-parse';
import * as convert from 'color-convert';
import 'vanilla-colorful/hex-color-picker.js';
import '../../theme/components/colorpicker/colorpicker.css';

export default class ColorPickerView extends View {
	/**
	 * Color picker component.
	 */
	declare public picker: ColorPickerType;

	/**
	 * Input to defining custom colors in HEX.
	 */
	declare public input: LabeledFieldView<InputTextView>;

	/**
	 * Current color state in color picker.
	 */
	declare public color: string;

	/**
	 * @TODO
	 */
	declare public outputColorFormat: ColorPickerOutputFormat;

	/**
	* Debounced event method. The `pickerEvent()` method is called the specified `waitingTime` after `debouncedPickerEvent()` is called,
	* unless a new action happens in the meantime.
	*/
	declare private _debouncePickerEvent: DebouncedFunc<( arg: string ) => void>;

	/**
	* Debounced event method. The `inputEvent()` method is called the specified `waitingTime` after `debouncedInputEvent()` is called,
	* unless a new action happens in the meantime.
	*/
	declare private _debounceInputEvent: DebouncedFunc<( arg: string ) => void>;

	constructor( locale: Locale | undefined, colorPickerFormat?: ColorPickerOutputFormat ) {
		super( locale );

		this.set( 'color', '' );
		this.outputColorFormat = colorPickerFormat || 'hsl';

		this.input = this._createInput();

		const children = this.createCollection();
		children.add( this.input );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-color-picker' ]
			},
			children
		} );

		const waitingTime = 150;

		this._debouncePickerEvent = debounce( this._setColorFromPicker, waitingTime );
		this._debounceInputEvent = debounce( this._setColorFromInput, waitingTime );
	}

	/**
	 * @TODO
	 *
	 * @param color
	 * @returns
	 */
	private _setColorFromPicker( color: string ): void {
		this.color = color;

		const parsedColor: { space: string; values: Array<number> } = parse( color );

		if ( !parsedColor.space || parsedColor.space === this.outputColorFormat ) {
			this.fire( 'change', { value: color } );

			return;
		}

		const outputColor = convertColor( parsedColor, this.outputColorFormat );

		this.fire( 'change', { value: outputColor } );
	}

	/**
	 * @TODO
	 *
	 * @param color
	 * @returns
	 */
	private _setColorFromInput( color: string ): void {
		const parsedColor: { space: string; values: Array<number> } = parse( color );

		if ( !parsedColor.space || parsedColor.space === this.outputColorFormat ) {
			this.fire( 'change', { value: color } );
			this.setColor( color );

			return;
		}

		const outputColor = convertColor( parsedColor, this.outputColorFormat );

		this.fire( 'change', { value: outputColor } );
	}

	// Sets color in the color picker.
	public setColor( color: string | undefined ): void {
		let newPickerColor: string;

		// E.g. selection without color.
		if ( !color ) {
			newPickerColor = '';
		}
		// Color is already in hex format (e.g. coming from picker or selection), so don't convert it.
		else if ( color.startsWith( '#' ) ) {
			newPickerColor = color;
		} else {
			const parsedColor: { space: string; values: Array<number> } = parse( color );

			// Color is invalid - reset it.
			if ( parsedColor.space === undefined ) {
				newPickerColor = '';
			}
			// Convert the color to the default internal picker's format - hex.
			else {
				newPickerColor = convertColor( parsedColor, 'hex' );
			}
		}

		this.color = newPickerColor;

		// If picker hasn't been rendered yet, don't try to set its attribute.
		if ( !this.picker ) {
			return;
		}

		this.picker.setAttribute( 'color', newPickerColor );
	}

	// Renders color picker in the view.
	public override render(): void {
		super.render();

		this.picker = global.document.createElement( 'hex-color-picker' );
		this.picker.setAttribute( 'class', 'hex-color-picker' );

		if ( this.element ) {
			this.element.insertBefore( this.picker, this.input.element );
		}

		this.picker.addEventListener( 'color-changed', event => {
			const customEvent = event as CustomEvent;
			const color = customEvent.detail.value;
			this._debouncePickerEvent( color );
		} );
	}

	// Creates input for defining custom colors in color picker.
	private _createInput(): LabeledFieldView<InputTextView> {
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );
		const locale = this.locale;

		labeledInput.set( {
			label: locale!.t( 'HEX' ),
			class: 'color-picker-hex-input'
		} );

		labeledInput.fieldView.bind( 'value' ).to( this, 'color' );

		labeledInput.fieldView.on( 'input', () => {
			const inputValue = labeledInput.fieldView.element!.value;

			if ( inputValue ) {
				this._debounceInputEvent( inputValue );
			}
		} );

		return labeledInput;
	}
}

/**
 * @TODO
 *
 * @param colorObject
 * @returns
 */
function convertColor( colorObject: { space: string; values: Array<number> }, outputFormat: ColorPickerOutputFormat ) {
	// @ts-ignore
	const convertedColorChannels: Array<number> = convert[ colorObject.space ].hex( colorObject.values );

	return formatColorOutput( outputFormat, convertedColorChannels );
}

/**
 * @TODO
 *
 * @param format
 * @param values
 * @returns
 */
function formatColorOutput( format: ColorPickerOutputFormat, values: Array<number> | string ): string {
	switch ( format ) {
		case 'hex': return `#${ values }`;
		case 'rgb': return `rgb( ${ values[ 0 ] }, ${ values[ 1 ] }, ${ values[ 2 ] } )`;
		case 'hsl': return `hsl( ${ values[ 0 ] }, ${ values[ 1 ] }%, ${ values[ 2 ] }% )`;
		case 'hwb': return `hwb( ${ values[ 0 ] }, ${ values[ 1 ] }, ${ values[ 2 ] } )`;
		case 'lab': return `lab( ${ values[ 0 ] }% ${ values[ 1 ] } ${ values[ 2 ] } )`;
		case 'lch': return `lch( ${ values[ 0 ] }% ${ values[ 1 ] } ${ values[ 2 ] } )`;

		default: return '';
	}
}

/**
 * @TODO
 */
export type ColorPickerOutputFormat = 'hex' | 'rgb' | 'hsl' | 'hwb' | 'lab' | 'lch';

type CustomEvent = Event & {
	detail: {
		value: string;
	};
};

type ColorPickerType = HTMLElement & {
	color: string;
};
