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

// There no avaialble types for 'color-parse' module.
// @ts-ignore
import { default as parse } from 'color-parse';
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
	declare public colorFormat: 'hsl' | 'hex' | undefined;

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

	constructor( locale: Locale | undefined, colorPickerFormat: 'hsl' | 'hex' | undefined ) {
		super( locale );

		this.set( 'color', '' );
		this.colorFormat = colorPickerFormat;

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
			this.color = color;
		}, waitingTime );

		this._debounceInputEvent = debounce( ( color: string ) => {
			this.fire( 'change', { value: color } );
			this.setColor( color );
		}, waitingTime );
	}

	// Sets color in the color picker.
	public setColor( color: string | undefined ): void {
		if ( color && this.picker ) {
			this.picker.setAttribute( 'color', color );
			this.color = color;
		}
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

		labeledInput.set( {
			label: this.t!( 'HEX' ),
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

type CustomEvent = Event & {
	detail: {
		value: string;
	};
};

type ColorPickerType = HTMLElement & {
	color: string;
};
