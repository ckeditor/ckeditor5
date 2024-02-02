/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { Locale, PositioningFunction } from '@ckeditor/ckeditor5-utils';
import MenuBarMenuButtonView from './menubarmenubuttonview.js';
import { MenuBarMenuBehaviors, MenuBarMenuPositions } from './utils.js';
import MenuWithButtonView from '../menu/menuwithbuttonview.js';
import MenuView from '../menu/menuview.js';
import { DropdownMenuPositions, MenuWithButtonBehaviors } from '../menu/utils.js';

export default class MenuBarMenuView extends MenuWithButtonView {
	declare public menuPosition: 's' | 'se' | 'sw' | 'sme' | 'smw' | 'n' | 'ne' | 'nw' | 'nme' | 'nmw' | 'w' | 'e';
	declare public parentMenuView?: MenuBarMenuView;

	constructor(
		locale: Locale,
		parentMenuView?: MenuBarMenuView
	) {
		super( locale, new MenuBarMenuButtonView( locale ), new MenuView( locale ) );

		const bind = this.bindTemplate;

		this.buttonView.delegate( 'mouseenter' ).to( this );

		this.set( 'parentMenuView', parentMenuView );

		this.extendTemplate( {
			attributes: {
				class: [
					'ck-menu-bar__menu',
					bind.if( 'parentMenuView', 'ck-menu-bar__menu_top-level', value => !value )
				]
			}
		} );
	}

	public override render(): void {
		super.render();

		if ( !this.parentMenuView ) {
			this.keystrokes.set( 'arrowright', ( data, cancel ) => {
				this.fire( 'arrowright' );
				cancel();
			} );

			this.keystrokes.set( 'arrowleft', ( data, cancel ) => {
				this.fire( 'arrowleft' );
				cancel();
			} );

			MenuWithButtonBehaviors.openAndFocusMenuOnArrowDownKey( this );
			MenuWithButtonBehaviors.toggleOnButtonClick( this );
		} else {
			MenuBarMenuBehaviors.openOnButtonClick( this );
			MenuBarMenuBehaviors.openOnArrowRightKey( this );
			MenuWithButtonBehaviors.closeOnArrowLeftKey( this );
			MenuBarMenuBehaviors.closeOnParentClose( this );
		}

		MenuWithButtonBehaviors.closeOnEscKey( this );

		this.focusTracker.on( 'change:focusedElement', () => {
			if ( this.focusTracker.focusedElement === this.buttonView.element ) {
				this.fire( 'menuButtonFocus' );
			}
		} );
	}

	public override get panelPositions(): Array<PositioningFunction> {
		const isLtrLanguage = this.locale!.uiLanguageDirection === 'ltr';

		if ( this.parentMenuView ) {
			const { west, east } = MenuBarMenuPositions;

			if ( isLtrLanguage ) {
				return [ west ];
			} else {
				return [ east ];
			}
		} else {
			const {
				south, north, southEast, southWest, northEast, northWest,
				southMiddleEast, southMiddleWest, northMiddleEast, northMiddleWest
			} = DropdownMenuPositions;

			if ( isLtrLanguage ) {
				return [
					southEast, southWest, southMiddleEast, southMiddleWest, south,
					northEast, northWest, northMiddleEast, northMiddleWest, north
				];
			} else {
				return [
					southWest, southEast, southMiddleWest, southMiddleEast, south,
					northWest, northEast, northMiddleWest, northMiddleEast, north
				];
			}
		}
	}
}
