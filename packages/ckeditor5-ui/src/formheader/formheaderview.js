/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/ui/colorinputview
 */

import View from '../view';

import '../../theme/components/formheader/formheader.css';

export default class FormHeaderView extends View {
	constructor( locale, options = {} ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * The label of the header.
		 *
		 * @readonly
		 * @member {String} #label
		 */
		this.set( 'label', options.label || '' );

		/**
		 * An additional CSS class added to the {@link #element}.
		 *
		 * @observable
		 * @member {String} #class
		 */
		this.set( 'class', options.class || null );

		/**
		 * A collection of header items.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.children = this.createCollection();

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
