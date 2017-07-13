/**
 * @license Copyright (c) 2003-2017, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module ui/inputtext/inputtextview
 */

import View from '../view';
import Template from '../template';

/**
 * The text input view class.
 *
 * @extends module:ui/view~View
 */
export default class InputTextView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * The value of the input.
		 *
		 * @observable
		 * @member {String} #value
		 */
		this.set( 'value' );

		/**
		 * The `id` attribute of the input (i.e. to pair with a `<label>` element).
		 *
		 * @observable
		 * @member {String} #id
		 */
		this.set( 'id' );

		/**
		 * The `placeholder` attribute of the input.
		 *
		 * @observable
		 * @member {String} #placeholder
		 */
		this.set( 'placeholder' );

		/**
		 * Controls whether the input view is in read-only mode.
		 *
		 * @observable
		 * @member {Boolean} #isReadOnly
		 */
		this.set( 'isReadOnly', false );

		const bind = this.bindTemplate;

		this.template = new Template( {
			tag: 'input',
			attributes: {
				type: 'text',
				class: [
					'ck-input',
					'ck-input-text'
				],
				id: bind.to( 'id' ),
				placeholder: bind.to( 'placeholder' ),
				readonly: bind.to( 'isReadOnly' )
			}
		} );

		// Note: `value` cannot be an HTML attribute, because it doesn't change HTMLInputElement value once changed.
		this.on( 'change:value', ( evt, propertyName, value ) => {
			this.element.value = value || '';
		} );
	}

	/**
	 * Moves the focus to the input and selects the value.
	 */
	select() {
		this.element.select();
	}

	/**
	 * Focuses the input.
	 */
	focus() {
		this.element.focus();
	}
}
