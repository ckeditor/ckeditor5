/**
 * @license Copyright (c) 2003-2016, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module image/imagealternatetext/ui/textareaview
 */

import View from 'ckeditor5-ui/src/view';
import Template from 'ckeditor5-ui/src/template';
import '../../../theme/textareaview/theme.scss';

/**
 * The TextAreaView class.
 *
 * @extends module:ui/view~View
 */
export default class TextAreaView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * The value of the textarea.
		 *
		 * @observable
		 * @member {String} #value
		 */
		this.set( 'value' );

		/**
		 * The `id` attribute of the textarea (i.e. to pair with a `<label>` element).
		 *
		 * @observable
		 * @member {String} #id
		 */
		this.set( 'id' );

		const bind = this.bindTemplate;

		this.template = new Template( {
			tag: 'textarea',
			attributes: {
				class: [
					'ck-textarea',
				],
				id: bind.to( 'id' )
			}
		} );

		// Note: `value` cannot be an HTML attribute, because it doesn't change HTMLInputElement value once changed.
		this.on( 'change:value', ( evt, propertyName, value ) => this.element.value = value || '' );
	}

	/**
	 * Moves the focus to the textarea and selects the value.
	 */
	select() {
		this.element.select();
	}
}
