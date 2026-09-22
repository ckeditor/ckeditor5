/**
 * @license Copyright (c) 2003-2026, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/tabs/tabbuttonview
 */

import { toArray, type ArrayOrItem, type Locale } from '@ckeditor/ckeditor5-utils';

import { ButtonView } from '../button/buttonview.js';

/**
 * The available positions of the tabs (and their buttons) within a tabs view.
 */
export const TAB_POSITIONS = [ 'top', 'left', 'right' ] as const;

/**
 * A single position of the tabs within a tabs view.
 */
export type TabPosition = typeof TAB_POSITIONS[ number ];

/**
 * A button that toggles the visibility of a tab in a tabs view component.
 */
export class TabButtonView extends ButtonView {
	/**
	 * The position of the tab button.
	 *
	 * @observable
	 */
	declare public side: TabPosition;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale, options: TabButtonViewOptions = {} ) {
		super( locale );

		this.isToggleable = true;
		this.set( 'side', options.side || 'top' );

		const bind = this.bindTemplate;

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-tab-button',
					...toArray( options.class || [] ),
					bind.to( 'side', side => `ck-tab-button_${ side }` ),
					bind.to( 'class' )
				]
			}
		} );
	}

	/**
	 * Shows the tab button.
	 */
	public show(): void {
		this.set( 'isVisible', true );
	}

	/**
	 * Hides the tab button.
	 */
	public hide(): void {
		this.set( 'isVisible', false );
	}
}

/**
 * The options for the {@link module:ui/tabs/tabbuttonview~TabButtonView} class.
 */
export type TabButtonViewOptions = {

	/**
	 * An additional CSS class added to the {@link module:ui/tabs/tabbuttonview~TabButtonView#element}.
	 */
	class?: ArrayOrItem<string>;

	/**
	 * The position of the tab button.
	 */
	side?: TabPosition;
};
