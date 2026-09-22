/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/tabs/tabpanelview
 */

import { toArray, type ArrayOrItem, type Locale } from '@ckeditor/ckeditor5-utils';

import { View } from '../view.js';
import { type ViewCollection } from '../viewcollection.js';

/**
 * A panel that contains the content of a tab in a tabs view component.
 */
export class TabPanelView extends View {
	/**
	 * An additional CSS class added to the {@link #element}.
	 *
	 * @observable
	 */
	declare public class?: string;

	/**
	 * A collection of child views.
	 */
	public children: ViewCollection;

	/**
	 * Whether the panel is visible.
	 *
	 * @observable
	 */
	declare public isVisible: boolean;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale, options: { class?: ArrayOrItem<string> } = {} ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'isVisible', false );
		this.set( 'class', '' );

		this.children = this.createCollection();

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-tab-panel',
					...toArray( options.class || [] ),
					bind.to( 'class' ),
					bind.if( 'isVisible', 'ck-hidden', value => !value )
				]
			},
			children: this.children
		} );
	}

	/**
	 * Shows the panel.
	 */
	public show(): void {
		this.set( 'isVisible', true );
	}

	/**
	 * Hides the panel.
	 */
	public hide(): void {
		this.set( 'isVisible', false );
	}
}
