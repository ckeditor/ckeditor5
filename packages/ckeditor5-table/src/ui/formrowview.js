/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/ui/formrowview
 */

import { View } from 'ckeditor5/src/ui';

import '../../theme/formrow.css';

/**
 * The class representing a single row in a complex form,
 * used by {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView}.
 *
 * **Note**: For now this class is private. When more use cases arrive (beyond ckeditor5-table),
 * it will become a component in ckeditor5-ui.
 *
 * @private
 * @extends module:ui/view~View
 */
export default class FormRowView extends View {
	/**
	 * Creates an instance of the form row class.
	 *
	 * @param {module:utils/locale~Locale} locale The locale instance.
	 * @param {Object} options
	 * @param {Array.<module:ui/view~View>} options.children
	 * @param {String} [options.class]
	 * @param {module:ui/view~View} [options.labelView] When passed, the row gets the `group` and `aria-labelledby`
	 * DOM attributes and gets described by the label.
	 */
	constructor( locale, options = {} ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * An additional CSS class added to the {@link #element}.
		 *
		 * @observable
		 * @member {String} #class
		 */
		this.set( 'class', options.class || null );

		/**
		 * A collection of row items (buttons, dropdowns, etc.).
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.children = this.createCollection();

		if ( options.children ) {
			options.children.forEach( child => this.children.add( child ) );
		}

		/**
		 * The role property reflected by the `role` DOM attribute of the {@link #element}.
		 *
		 * **Note**: Used only when a `labelView` is passed to constructor `options`.
		 *
		 * @private
		 * @observable
		 * @member {String} #role
		 */
		this.set( '_role', null );

		/**
		 * The ARIA property reflected by the `aria-labelledby` DOM attribute of the {@link #element}.
		 *
		 * **Note**: Used only when a `labelView` is passed to constructor `options`.
		 *
		 * @private
		 * @observable
		 * @member {String} #ariaLabelledBy
		 */
		this.set( '_ariaLabelledBy', null );

		if ( options.labelView ) {
			this.set( {
				_role: 'group',
				_ariaLabelledBy: options.labelView.id
			} );
		}

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-form__row',
					bind.to( 'class' )
				],
				role: bind.to( '_role' ),
				'aria-labelledby': bind.to( '_ariaLabelledBy' )
			},
			children: this.children
		} );
	}
}
