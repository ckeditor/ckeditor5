/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import TextareaView from './textareaview';
import { View } from 'ckeditor5/src/ui';

/**
 * TODO
 *
 * @private
 * @extends module:ui/view~View
 */
export default class SourceEditingWrapperView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * TODO
		 */
		this.textareaView = new TextareaView( locale, {
			rows: 1,
			'aria-label': 'Source code editing area'
		} );

		/**
		 * TODO
		 */
		this.set( 'value', '' );

		// TODO
		this.on( 'change:value', () => {
			this.textareaView.value = this.value;
		} );

		// Bind the textarea's value to the wrapper's `data-value` property.
		// Each change of the textarea's value updates the wrapper's `data-value` property.
		this.textareaView.on( 'input', () => {
			this.value = this.textareaView.element.value;
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-source-editing-area'
				],
				// TODO: Explain this magic because this purely presentational to make
				// the <textarea> auto-grow.
				'data-value': bind.to( 'value' )
			},
			children: [
				this.textareaView
			]
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		this._setDomElementValue( this.value );

		// Bind `this.value` to the DOM element's value.
		this.on( 'change:value', ( evt, name, value ) => {
			this._setDomElementValue( value );
		} );
	}

	/**
	 * TODO
	 */
	focus() {
		this.element.focus();
	}

	/**
	 * TODO
	 * @param  {...any} args
	 */
	setSelectionRange( ...args ) {
		this.element.setSelectionRange( ...args );
	}

	/**
	 * Sets the `value` property of the {@link #element DOM element} on demand.
	 *
	 * @private
	 */
	_setDomElementValue( value ) {
		this.element.value = ( !value && value !== 0 ) ? '' : value;
	}

	/**
	 * Fired when the user types in the textarea. Corresponds to the native
	 * DOM `input` event.
	 *
	 * @event input
	 */
}
