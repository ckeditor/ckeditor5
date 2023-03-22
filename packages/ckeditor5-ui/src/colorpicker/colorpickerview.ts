/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/colorpicker/colorpickerview
 */

import { type Locale, global } from '@ckeditor/ckeditor5-utils';
import { debounce, type DebouncedFunc } from 'lodash-es';
import View from '../view';
import InputTextView from '../inputtext/inputtextview';

import 'vanilla-colorful/hex-color-picker.js';
import '../../theme/components/colorpicker/colorpicker.css';

export default class ColorPickerView extends View {
	/**
	 * Color picker component.
	 */
	declare public picker: PickerType;

	/**
	 * Input to defining custom colors in HEX.
	 */
	declare public input: InputTextView;

	/**
	* Debounced event method. The `pickerEvent()` method is called the specified `waitingTime` after `debouncedPickerEvent()` is called,
	* unless a new action happens in the meantime.
	*/
	declare private _debouncePickerEvent: DebouncedFunc< ( arg: string ) => void >;

	/**
	* Debounced event method. The `inputEvent()` method is called the specified `waitingTime` after `debouncedInputEvent()` is called,
	* unless a new action happens in the meantime.
	*/
	declare private _debounceInputEvent: DebouncedFunc< ( arg: string ) => void >;

	constructor( locale: Locale | undefined ) {
		super( locale );
		this.picker = global.document.createElement( 'hex-color-picker' );
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

		this._debouncePickerEvent = debounce( ( color: string ) => {
			this.fire( 'change', { value: color } );
			this._setInputData( color );
		}, waitingTime );

		this._debounceInputEvent = debounce( ( color: string ) => {
			this.fire( 'change', { value: color } );
			this.setColor( color );
		}, waitingTime );
	}

	// Sets color in the color picker.
	public setColor( color: string | undefined ): void {
		console.log( color );
		if ( color ) {
			this.picker.setAttribute( 'color', color );
		}
	}

	// Return current color from picker.
	public getColor(): string {
		return this.picker.color;
	}

	// Renders color picker in the view.
	public override render(): void {
		super.render();

		this.picker = global.document.createElement( 'hex-color-picker' );

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
	private _createInput(): InputTextView {
		const textInput = new InputTextView( this.locale );

		textInput.extendTemplate( {
			attributes: {
				class: 'color-picker-hex-input',
				placeholder: 'HEX'
			}
		} );

		textInput.on( 'input', () => {
			const inputValue = textInput.element!.value;

			this._debouncePickerEvent( inputValue );
		} );

		return textInput;
	}

	// Sets given value into input.
	private _setInputData( value: string ): void {
		this.input.element!.value = value;
	}
}

type CustomEvent = Event & {
	detail: {
		value: string;
	};
};

type PickerType = HTMLElement & {
	color: string;
};
