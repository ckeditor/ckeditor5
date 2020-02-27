/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/ui/formheaderview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';

import '../../theme/formheader.css';

/**
 * The class representing a header in a complex form.
 *
 * **Note**: For now this class is private. When more use cases arrive (beyond ckeditor5-table),
 * it will become a component in ckeditor5-ui.
 *
 * @private
 * @extends module:ui/view~View
 */
export default class FormHeaderView extends View {
	/**
	 * Creates an instance of the form header view class.
	 *
	 * @param {module:utils/locale~Locale} locale The locale instance.
	 * @param {Object} [options]
	 * @param {String} [options.class] When passed, the class will be set on the header element.
	 * @param {String} [options.label] When passed, the label will be used for the header.
	 */
	constructor( locale, options = {} ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * A collection of header items.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.children = this.createCollection();

		/**
		 * An additional CSS class added to the {@link #element}.
		 *
		 * @observable
		 * @member {String} #class
		 */
		this.set( 'class', options.class || null );

		/**
		 * The label of the header.
		 *
		 * @readonly
		 * @member {String} #label
		 */
		this.set( 'label', options.label || '' );

		const label = new View( locale );

		label.setTemplate( {
			tag: 'span',
			attributes: {
				class: [
					'ck',
					'ck-form__header__label'
				]
			},
			children: [
				{ text: bind.to( 'label' ) }
			]
		} );

		this.children.add( label );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-form__header',
					bind.to( 'class' )
				]
			},
			children: this.children
		} );
	}
}
