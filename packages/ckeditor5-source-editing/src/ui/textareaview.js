/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module TODO
 */

import { View } from 'ckeditor5/src/ui';

/**
 * The base textarea view class.
 *
 * @private
 * @extends module:ui/view~View
 */
export default class TextareaView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale, options = {} ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * The value of the textarea.
		 *
		 * @observable
		 * @member {String} #value
		 */
		this.set( 'value', '' );

		/**
		 * Controls whether the textarea view is in read-only mode.
		 *
		 * @observable
		 * @member {Boolean} #isReadOnly
		 */
		this.set( 'isReadOnly', false );

		this.setTemplate( {
			tag: 'textarea',
			attributes: {
				class: [
					'ck',
					'ck-textarea'
				],
				readonly: bind.to( 'isReadOnly' ),
				rows: options.rows,
				'aria-label': options[ 'aria-label' ]
			},
			on: {
				input: bind.to( 'input' )
			}
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
