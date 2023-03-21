/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/colorpicker/colorpickerview
 */

import View from '../view';
import { type Locale, global } from '@ckeditor/ckeditor5-utils';
import 'vanilla-colorful/hex-input.js';
import 'vanilla-colorful/hsl-string-color-picker.js';

export default class ColorPickerView extends View {
	/**
	 * color picker
	 */
	declare private picker: HTMLElement;

	/**
	 * color picker input
	 */
	declare private input: HTMLElement;

	constructor( locale: Locale | undefined ) {
		super( locale );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck', 'ck-color-picker' ]
			}
		} );
	}

	public setColor( color: string | undefined ): void {
		console.log( color );
		if ( color ) {
			this.picker.setAttribute( 'color', color );
		}
	}

	public focus(): void {
		this.picker.focus();
	}

	public override render(): void {
		super.render();

		this.picker = global.document.createElement( 'hsl-string-color-picker' );
		this.input = global.document.createElement( 'hex-input' );

		if ( this.element ) {
			this.element.appendChild( this.picker );
			this.element.appendChild( this.input );
		}

		this.picker.addEventListener( 'color-changed', event => {
			const customEvent = event as CustomEvent;
			this.fire( 'change', { value: customEvent.detail.value } );
		} );

		this.input.addEventListener( 'color-changed', event => {
			const customEvent = event as CustomEvent;
			const color = customEvent.detail.value || '#ffffff';

			this.setColor( color );
			this.fire( 'change', { value: color } );
		} );

		console.log( 'picker', this.picker.color );
		console.log( 'element', this.element );
	}
}

type CustomEvent = Event & {
	detail: {
		value: string;
	};
};
