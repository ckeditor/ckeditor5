/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module link/ui/linkbuttonview
 */

import { IconNextArrow } from '@ckeditor/ckeditor5-icons';
import { ButtonView, IconView } from 'ckeditor5/src/ui.js';
import type { Locale } from 'ckeditor5/src/utils.js';

/**
 * Represents a view for a dropdown menu button.
 */
export default class LinkButtonView extends ButtonView {
	/**
	 * An icon that displays an arrow to indicate a direction of the menu.
	 */
	public readonly arrowView: IconView;

	/**
	 * Creates an instance of the dropdown menu button view.
	 *
	 * @param locale The localization services instance.
	 */
	constructor( locale?: Locale ) {
		super( locale );

		this.set( {
			withText: true
		} );

		this.arrowView = this._createArrowView();

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-link__button'
				]
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.children.add( this.arrowView );
	}

	/**
	 * Creates the arrow view instance.
	 *
	 * @private
	 */
	private _createArrowView() {
		const arrowView = new IconView();

		arrowView.content = IconNextArrow;

		return arrowView;
	}
}
