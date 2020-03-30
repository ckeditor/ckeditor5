/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/formheader/formheaderview
 */

import View from '../view';

import '../../theme/components/formheader/formheader.css';

/**
 * The class component representing a form header view. It should be used in more advanced forms to
 * describe the main purpose of the form.
 *
 * By default the component contains an optional bolded label view, which text can be set through the options (`[options.label]`),
 * while creating the component. The label text is usually a short (at most 3-word) string. If the label text isn't defined
 * the label view will not appear.
 * The component can also be extended by any other elements, like: icons, dropdowns, etc.
 *
 * It is used i.a.
 * by {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView}
 * and {@link module:special-characters/ui/specialcharactersnavigationview~SpecialCharactersNavigationView}.
 *
 * The latter is an example, where the component has been extended by {@link module:ui/dropdown/dropdownview~DropdownView} view.
 *
 * @extends module:ui/view~View
 */
export default class FormHeaderView extends View {
	/**
	 * Creates an instance of the form header class.
	 *
	 * @param {module:utils/locale~Locale} locale The locale instance.
	 * @param {Object} options
	 * @param {String} [options.label] A label.
	 * @param {String} [options.class] An additional class.
	 */
	constructor( locale, options = {} ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * The label of the header.
		 *
		 * @observable
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

		/**
		 * A label view, which text can be set through `options.label` or {@link #label}.
		 *
		 * @readonly
		 * @member {module:ui/view~View}
		 */
		this.labelView = new View( locale );

		this.labelView.setTemplate( {
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

		this.label && this.children.add( this.labelView );

		this.on( 'set:label', () => {
			if ( !this.children.has( this.labelView ) ) {
				this.children.add( this.labelView );
			}
		} );
	}

	render() {
		super.render();

		this.on( 'change:label', evt => {
			if ( this.children.has( this.labelView ) ) {
				if ( !evt.source.label ) {
					// Remove the label view if it is no longer necessary (eg.: label text is empty).
					this.children.remove( this.labelView );
				}
			} else {
				// Append label view only if it has not been added while creating the instance, but after render.
				this.children.add( this.labelView );
			}
		} );
	}
}
