/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

import {
	FocusTracker,
	KeystrokeHandler,
	getOptimalPosition,
	type Locale,
	type PositioningFunction,
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';
import MenuBarMenuButtonView from './menubarmenubuttonview.js';
import { MenuBarMenuBehaviors } from './utils.js';
import type { FocusableView } from '../focuscycler.js';
import View from '../view.js';
import {
	default as MenuBarMenuPanelView,
	type MenuBarMenuPanelPosition
} from './menubarmenupanelview.js';

const NESTED_PANEL_HORIZONTAL_OFFSET = 5;

export default class MenuBarMenuView extends View implements FocusableView {
	public readonly buttonView: MenuBarMenuButtonView;
	public readonly panelView: MenuBarMenuPanelView;
	public readonly focusTracker: FocusTracker;
	public readonly keystrokes: KeystrokeHandler;

	declare public isOpen: boolean;
	declare public isEnabled: boolean;
	declare public panelPosition: MenuBarMenuPanelPosition;
	declare public parentMenuView?: MenuBarMenuView;
	declare public ariaDescribedById: string | null;

	constructor( locale: Locale, parentMenuView?: MenuBarMenuView ) {
		super( locale );

		const bind = this.bindTemplate;

		this.buttonView = new MenuBarMenuButtonView( locale );
		this.buttonView.delegate( 'mouseenter' ).to( this );
		this.buttonView.bind( 'isOn' ).to( this, 'isOpen' );

		this.panelView = new MenuBarMenuPanelView( locale );
		this.panelView.bind( 'isVisible' ).to( this, 'isOpen' );

		this.keystrokes = new KeystrokeHandler();
		this.focusTracker = new FocusTracker();

		this.set( 'isOpen', false );
		this.set( 'isEnabled', true );
		this.set( 'panelPosition', 'w' );
		this.set( 'parentMenuView', parentMenuView );
		this.set( 'ariaDescribedById', null );

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-menu-bar__menu',
					bind.if( 'isEnabled', 'ck-disabled', value => !value ),
					bind.if( 'parentMenuView', 'ck-menu-bar__menu_top-level', value => !value )
				],
				'aria-describedby': bind.to( 'ariaDescribedById' )
			},

			children: [
				this.buttonView,
				this.panelView
			]
		} );
	}

	public override render(): void {
		super.render();

		this.focusTracker.add( this.buttonView.element! );
		this.focusTracker.add( this.panelView.element! );

		// Listen for keystrokes coming from within #element.
		this.keystrokes.listenTo( this.element! );

		if ( !this.parentMenuView ) {
			this._listenToArrowKeystrokes();

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

		this._listenToButtonFocus();
		this._repositionPanelOnOpen();
	}

	private _listenToArrowKeystrokes(): void {
		this.keystrokes.set( 'arrowright', ( data, cancel ) => {
			this.fire( 'arrowright' );
			cancel();
		} );

		this.keystrokes.set( 'arrowleft', ( data, cancel ) => {
			this.fire( 'arrowleft' );
			cancel();
		} );
	}

	private _listenToButtonFocus(): void {
		this.focusTracker.on( 'change:focusedElement', () => {
			if ( this.focusTracker.focusedElement === this.buttonView.element ) {
				this.fire( 'menuButtonFocus' );
			}
		} );
	}

	private _repositionPanelOnOpen(): void {
		// Let the menu control the position of the panel. The position must be updated every time the menu is open.
		this.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( evt, name, isOpen ) => {
			if ( !isOpen ) {
				return;
			}

			const optimalPanelPosition = MenuBarMenuView._getOptimalPosition( {
				element: this.panelView.element!,
				target: this.buttonView.element!,
				fitInViewport: true,
				positions: this._panelPositions
			} );

			this.panelView.position = (
				optimalPanelPosition ? optimalPanelPosition.name : this._panelPositions[ 0 ].name
			) as MenuBarMenuPanelPosition;
		} );
	}

	public focus(): void {
		this.buttonView.focus();
	}

	public get _panelPositions(): Array<PositioningFunction> {
		const { southEast, southWest, northEast, northWest, west, east } = MenuBarMenuView.defaultPanelPositions;

		if ( this.locale!.uiLanguageDirection !== 'rtl' ) {
			if ( this.parentMenuView ) {
				return [ west, east ];
			} else {
				return [ southEast, southWest, northEast, northWest ];
			}
		} else {
			if ( this.parentMenuView ) {
				return [ east, west ];
			} else {
				return [ southWest, southEast, northWest, northEast ];
			}
		}
	}

	public static defaultPanelPositions: Record<string, PositioningFunction> = {
		southEast: buttonRect => {
			return {
				top: buttonRect.bottom,
				left: buttonRect.left,
				name: 'se'
			};
		},
		southWest: ( buttonRect, panelRect ) => {
			return {
				top: buttonRect.bottom,
				left: buttonRect.left - panelRect.width + buttonRect.width,
				name: 'sw'
			};
		},
		northEast: ( buttonRect, panelRect ) => {
			return {
				top: buttonRect.top - panelRect.height,
				left: buttonRect.left,
				name: 'ne'
			};
		},
		northWest: ( buttonRect, panelRect ) => {
			return {
				top: buttonRect.top - panelRect.height,
				left: buttonRect.left - panelRect.width + buttonRect.width,
				name: 'nw'
			};
		},
		west: buttonRect => {
			return {
				top: buttonRect.top,
				left: buttonRect.right - NESTED_PANEL_HORIZONTAL_OFFSET,
				name: 'w'
			};
		},
		east: ( buttonRect, panelRect ) => {
			return {
				top: buttonRect.top,
				left: buttonRect.left - panelRect.width + NESTED_PANEL_HORIZONTAL_OFFSET,
				name: 'e'
			};
		}
	};

	private static _getOptimalPosition = getOptimalPosition;
}
