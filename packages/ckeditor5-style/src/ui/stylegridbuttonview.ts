/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module style/ui/stylegridbuttonview
 */

import type { Locale } from 'ckeditor5/src/utils';
import { ButtonView, View } from 'ckeditor5/src/ui';

import type { StyleDefinition } from '../styleconfig';

// These are intermediate element names that can't be rendered as style preview because they don't make sense standalone.
const NON_PREVIEWABLE_ELEMENT_NAMES = [
	'caption', 'colgroup', 'dd', 'dt', 'figcaption', 'legend', 'li', 'optgroup', 'option', 'rp',
	'rt', 'summary', 'tbody', 'td', 'tfoot', 'th', 'thead', 'tr'
];

/**
 * A class representing an individual button (style) in the grid. Renders a rich preview of the style.
 */
export default class StyleGridButtonView extends ButtonView {
	/**
	 * Definition of the style the button will apply when executed.
	 */
	public readonly styleDefinition: StyleDefinition;

	/**
	 * The view rendering the preview of the style.
	 */
	public readonly previewView: View;

	/**
	 * Creates an instance of the {@link module:style/ui/stylegridbuttonview~StyleGridButtonView} class.
	 *
	 * @param locale The localization services instance.
	 * @param styleDefinition Definition of the style.
	 */
	constructor( locale: Locale, styleDefinition: StyleDefinition ) {
		super( locale );

		this.styleDefinition = styleDefinition;
		this.previewView = this._createPreview();

		this.set( {
			label: styleDefinition.name,
			class: 'ck-style-grid__button',
			withText: true
		} );

		this.extendTemplate( {
			attributes: {
				role: 'option'
			}
		} );

		this.children.add( this.previewView, 0 );
	}

	/**
	 * Creates the view representing the preview of the style.
	 */
	private _createPreview(): View {
		const { element, classes } = this.styleDefinition;
		const previewView = new View( this.locale );

		previewView.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-reset_all-excluded',
					'ck-style-grid__button__preview',
					'ck-content'
				],
				// The preview "AaBbCcDdEeFfGgHhIiJj" should not be read by screen readers because it is purely presentational.
				'aria-hidden': 'true'
			},

			children: [
				{
					tag: this._isPreviewable( element ) ? element : 'div',
					attributes: {
						class: classes
					},
					children: [
						{ text: 'AaBbCcDdEeFfGgHhIiJj' }
					]
				}
			]
		} );

		return previewView;
	}

	/**
	 * Decides whether an element should be created in the preview or a substitute `<div>` should
	 * be used instead. This avoids previewing a standalone `<td>`, `<li>`, etc. without a parent.
	 *
	 * @param elementName Name of the element
	 * @returns Boolean indicating whether the element can be rendered.
	 */
	private _isPreviewable( elementName: string ): boolean {
		return !NON_PREVIEWABLE_ELEMENT_NAMES.includes( elementName );
	}
}
