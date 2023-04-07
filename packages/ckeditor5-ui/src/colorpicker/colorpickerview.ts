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
	* Debounced event method. The `colorPickerEvent()` method is called the specified `waitingTime` after
	* `debouncedPickerEvent()` is called, unless a new action happens in the meantime.
	*/
	declare private _debounceColorPickerEvent: DebouncedFunc< ( arg: string ) => void >;

	constructor( locale: Locale | undefined ) {
		super( locale );

		this.set( 'color', '' );

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
		}, waitingTime );

		// Sets color in the picker if color was updated.
		this.on( 'change:color', ( ) => {
			this.picker.setAttribute( 'color', this.color );
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

	private _createSlidersView() {
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
