/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module style/ui/stylegridbuttonview
 */

import type { Locale } from 'ckeditor5/src/utils.js';
import { ButtonView, View } from 'ckeditor5/src/ui.js';

import type { NormalizedStyleDefinition } from '../styleutils.js';

/**
 * A class representing an individual button (style) in the grid. Renders a rich preview of the style.
 */
export default class StyleGridButtonView extends ButtonView {
	/**
	 * Definition of the style the button will apply when executed.
	 */
	public readonly styleDefinition: NormalizedStyleDefinition;

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
	constructor( locale: Locale, styleDefinition: NormalizedStyleDefinition ) {
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
				this.styleDefinition.previewTemplate
			]
		} );

		return previewView;
	}
}
