/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/formrow/formrowview
 */

import View from '../view.js';
import type ViewCollection from '../viewcollection.js';
import type LabelView from '../label/labelview.js';
import type { Locale } from '@ckeditor/ckeditor5-utils';

import '../../theme/components/formrow/formrow.css';

/**
 * The class representing a single row in a form,
 */
export default class FormRowView extends View {
	/**
	 * An additional CSS class added to the {@link #element}.
	 *
	 * @observable
	 */
	public declare class: string | Array<string> | null;

	/**
	 * A collection of row items (buttons, dropdowns, etc.).
	 */
	public readonly children: ViewCollection;

	/**
	 * The role property reflected by the `role` DOM attribute of the {@link #element}.
	 *
	 * **Note**: Used only when a `labelView` is passed to constructor `options`.
	 *
	 * @observable
	 * @internal
	 */
	public declare _role: string | null;

	/**
	 * The ARIA property reflected by the `aria-labelledby` DOM attribute of the {@link #element}.
	 *
	 * **Note**: Used only when a `labelView` is passed to constructor `options`.
	 *
	 * @observable
	 * @internal
	 */
	public declare _ariaLabelledBy: string | null;

	/**
	 * Creates an instance of the form row class.
	 *
	 * @param locale The locale instance.
	 * @param options.labelView When passed, the row gets the `group` and `aria-labelledby`
	 * DOM attributes and gets described by the label.
	 */
	constructor( locale: Locale, options: { children?: Array<View>; class?: string | Array<string>; labelView?: LabelView } = {} ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'class', Array.isArray( options.class ) ? options.class.join( ' ' ) : options.class || null );
		this.children = this.createCollection();

		if ( options.children ) {
			options.children.forEach( child => this.children.add( child ) );
		}

		this.set( '_role', null );
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
