/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/formheader/formheaderview
 */

import View from '../view';
import type ViewCollection from '../viewcollection';

import type { Locale } from '@ckeditor/ckeditor5-utils';

import '../../theme/components/formheader/formheader.css';

/**
 * The class component representing a form header view. It should be used in more advanced forms to
 * describe the main purpose of the form.
 *
 * By default the component contains a bolded label view that has to be set. The label is usually a short (at most 3-word) string.
 * The component can also be extended by any other elements, like: icons, dropdowns, etc.
 *
 * It is used i.a.
 * by {@link module:table/tablecellproperties/ui/tablecellpropertiesview~TableCellPropertiesView}
 * and {@link module:special-characters/ui/specialcharactersnavigationview~SpecialCharactersNavigationView}.
 *
 * The latter is an example, where the component has been extended by {@link module:ui/dropdown/dropdownview~DropdownView} view.
 */
export default class FormHeaderView extends View {
	/**
	 * A collection of header items.
	 */
	public readonly children: ViewCollection;

	/**
	 * The label of the header.
	 *
	 * @observable
	 */
	public declare label: string;

	/**
	 * An additional CSS class added to the {@link #element}.
	 *
	 * @observable
	 */
	public declare class: string | null;

	/**
	 * Creates an instance of the form header class.
	 *
	 * @param locale The locale instance.
	 * @param options.label A label.
	 * @param options.class An additional class.
	 */
	constructor(
		locale: Locale | undefined,
		options: { label?: string | null; class?: string | null } = {}
	) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'label', options.label || '' );
		this.set( 'class', options.class || null );

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

		const label = new View( locale );

		label.setTemplate( {
			tag: 'h2',
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
	}
}
