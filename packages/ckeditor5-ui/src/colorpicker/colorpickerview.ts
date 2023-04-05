/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/colorpicker/colorpickerview
 */

// @todo - this should be part of the UI library.
import { convertToHex } from '@ckeditor/ckeditor5-font/src/utils';

import { type Locale, global } from '@ckeditor/ckeditor5-utils';
import { debounce, type DebouncedFunc } from 'lodash-es';
import View from '../view';
import type InputTextView from '../inputtext/inputtextview';
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

	constructor( locale: Locale | undefined ) {
		super( locale );

		this.set( 'color', '' );

		this.set( '_hexColor', '' );

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

			this._hexColor = convertColorToCommonHexFormat( this.color );
		} );
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
