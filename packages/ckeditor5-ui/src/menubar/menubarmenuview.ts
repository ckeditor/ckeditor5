/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import type { Locale, PositioningFunction } from '@ckeditor/ckeditor5-utils';
import DropdownView from '../dropdown/dropdownview.js';
import type MenuBarMenuButtonView from './menubarmenubuttonview.js';
import type DropdownPanelView from '../dropdown/dropdownpanelview.js';
import { MenuBarMenuBehaviors } from './utils.js';

const NESTED_PANEL_OFFSET = 5;

export default class MenuBarMenuView extends DropdownView {
	public override readonly buttonView: MenuBarMenuButtonView;
	declare public parentMenuView?: MenuBarMenuView;

	constructor(
		locale: Locale | undefined,
		buttonView: MenuBarMenuButtonView,
		panelView: DropdownPanelView,
		parentMenuView?: MenuBarMenuView
	) {
		super( locale, buttonView, panelView );

		const bind = this.bindTemplate;

		this.buttonView = buttonView;
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

			MenuBarMenuBehaviors.openAndFocusPanelOnArrowDownKey( this );
			MenuBarMenuBehaviors.toggleOnButtonClick( this );
		} else {
			MenuBarMenuBehaviors.oneWayMenuButtonClickOverride( this );
			MenuBarMenuBehaviors.openOnButtonClick( this );
			MenuBarMenuBehaviors.openOnArrowRightKey( this );
			MenuBarMenuBehaviors.closeOnArrowLeftKey( this );
			MenuBarMenuBehaviors.closeOnParentClose( this );
		}

		MenuBarMenuBehaviors.closeOnEscKey( this );

		this.focusTracker.on( 'change:focusedElement', () => {
			if ( this.focusTracker.focusedElement === this.buttonView.element ) {
				this.fire( 'menuButtonFocus' );
			}
		} );
	}

	protected override get _panelPositions(): Array<PositioningFunction> {
		if ( this.parentMenuView ) {
			const { west, east } = MenuBarMenuView.defaultNestedPanelPositions;

			if ( this.locale!.uiLanguageDirection !== 'rtl' ) {
				return [ west ];
			} else {
				return [ east ];
			}
		} else {
			return super._panelPositions;
		}
	}

	public static defaultNestedPanelPositions: Record<string, PositioningFunction> = {
		west: buttonRect => {
			return {
				top: buttonRect.top,
				left: buttonRect.right - NESTED_PANEL_OFFSET,
				name: 'w'
			};
		},
		east: ( buttonRect, panelRect ) => {
			return {
				top: buttonRect.top,
				left: buttonRect.left - panelRect.width + NESTED_PANEL_OFFSET,
				name: 'e'
			};
		}
	};
}
