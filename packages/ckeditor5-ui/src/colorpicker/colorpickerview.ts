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
	* Debounced event method. The `colorPickerEvent()` method is called the specified `waitingTime` after
	* `debouncedPickerEvent()` is called, unless a new action happens in the meantime.
	*/
	declare private _debounceColorPickerEvent: DebouncedFunc<( arg: string ) => void>;

	constructor( locale: Locale | undefined ) {
		super( locale );

		this.set( 'color', '' );

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

		this._debounceColorPickerEvent = debounce( ( color: string ) => {
			this.set( 'color', color );
		}, waitingTime );

		// Sets color in the picker if color was updated.
		this.on( 'change:color', () => {
			this.picker.setAttribute( 'color', this.color );
		} );

		// this.on( 'set:color', ( evt, propName, newValue, oldValue ) => {
		// 	console.log( newValue );
		// 	console.log( oldValue );
		// 	console.log( evt );

		// 	// evt.return = '#994400';

		// 	let newPickerColor;
		// 	const color = newValue;

		// 	if ( !color ) {
		// 		newPickerColor = '';
		// 	}
		// 	// Color is already in hex format (e.g. coming from picker or selection), so don't convert it.
		// 	else if ( color.startsWith( '#' ) ) {
		// 		newPickerColor = color;
		// 	} else {
		// 		const parsedColor: { space: string; values: Array<number> } = parse( color );

		// 		// Color is invalid - reset it.
		// 		if ( parsedColor.space === undefined ) {
		// 			newPickerColor = '';
		// 		}
		// 		// Convert the color to the default internal picker's format - hex.
		// 		else {
		// 			newPickerColor = convertColor( parsedColor, 'hex' );
		// 		}
		// 	}

		// 	// this.color = newPickerColor;
		// } );
	}

	/**
	 * @TODO
	 *
	 * @param color
	 * @returns
	 */
	// private _setColorFromPicker( color: string ): void {
	// 	this.color = color;

	// 	const parsedColor: { space: string; values: Array<number> } = parse( color );

	// 	if ( !parsedColor.space || parsedColor.space === this.outputColorFormat ) {
	// 		// this.fire( 'change', { value: color } );
	// 		this.set( 'color', color );

	// 		return;
	// 	}

	// 	const outputColor = convertColor( parsedColor, this.outputColorFormat );

	// 	// this.fire( 'change', { value: outputColor } );
	// 	this.set( 'color', outputColor );
	// }

	// /**
	//  * @TODO
	//  *
	//  * @param color
	//  * @returns
	//  */
	// private _setColorFromInput( color: string ): void {
	// 	const parsedColor: { space: string; values: Array<number> } = parse( color );

	// 	if ( !parsedColor.space || parsedColor.space === this.outputColorFormat ) {
	// 		// this.fire( 'change', { value: color } );
	// 		this.set( 'color', color );
	// 		// this.setColor( color );

	// 		return;
	// 	}

	// 	const outputColor = convertColor( parsedColor, this.outputColorFormat );

	// 	// this.fire( 'change', { value: outputColor } );

	// 	this.set( 'color', outputColor );
	// }

	// // Sets color in the color picker.
	// public setColor( color: string | undefined ): void {
	// 	let newPickerColor: string;

	// 	// E.g. selection without color.
	// 	if ( !color ) {
	// 		newPickerColor = '';
	// 	}
	// 	// Color is already in hex format (e.g. coming from picker or selection), so don't convert it.
	// 	else if ( color.startsWith( '#' ) ) {
	// 		newPickerColor = color;
	// 	} else {
	// 		const parsedColor: { space: string; values: Array<number> } = parse( color );

	// 		// Color is invalid - reset it.
	// 		if ( parsedColor.space === undefined ) {
	// 			newPickerColor = '';
	// 		}
	// 		// Convert the color to the default internal picker's format - hex.
	// 		else {
	// 			newPickerColor = convertColor( parsedColor, 'hex' );
	// 		}
	// 	}

	// 	this.color = newPickerColor;

	// 	// If picker hasn't been rendered yet, don't try to set its attribute.
	// 	if ( !this.picker ) {
	// 		return;
	// 	}

	// 	this.picker.setAttribute( 'color', newPickerColor );
	// }

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
			this._debounceColorPickerEvent( color );
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
				this._debounceColorPickerEvent( inputValue );
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
