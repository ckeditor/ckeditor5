/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/menubar/menubarmenuview
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
import { EVENT_NAME_DELEGATES, MenuBarMenuBehaviors, MenuBarMenuViewPanelPositioningFunctions } from './utils.js';
import type { FocusableView } from '../focuscycler.js';
import View from '../view.js';
import {
	default as MenuBarMenuPanelView,
	type MenuBarMenuPanelPosition
} from './menubarmenupanelview.js';
import type MenuBarView from './menubarview.js';

/**
 * TODO
 */
export default class MenuBarMenuView extends View implements FocusableView {
	/**
	 * TODO
	 */
	public readonly buttonView: MenuBarMenuButtonView;

	/**
	 * TODO
	 */
	public readonly panelView: MenuBarMenuPanelView;

	/**
	 * TODO
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * TODO
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * TODO
	 */
	declare public isOpen: boolean;

	/**
	 * TODO
	 */
	declare public isEnabled: boolean;

	/**
	 * TODO
	 */
	declare public class: string | undefined;

	/**
	 * TODO
	 */
	declare public panelPosition: MenuBarMenuPanelPosition;

	/**
	 * TODO
	 */
	declare public parentMenuView: MenuBarMenuView | undefined;

	/**
	 * TODO
	 */
	declare public menuBarView: MenuBarView | undefined;

	/**
	 * TODO
	 */
	declare public ariaDescribedById: string | null;

	/**
	 * TODO
	 */
	constructor( locale: Locale ) {
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
		this.set( 'class', undefined );
		this.set( 'ariaDescribedById', null );

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-menu-bar__menu',
					bind.to( 'class' ),
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

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.focusTracker.add( this.buttonView.element! );
		this.focusTracker.add( this.panelView.element! );

		// Listen for keystrokes coming from within #element.
		this.keystrokes.listenTo( this.element! );

		if ( !this.parentMenuView ) {
			this._propagateArrowKeystrokeEvents();

			MenuBarMenuBehaviors.openAndFocusPanelOnArrowDownKey( this );
			MenuBarMenuBehaviors.toggleOnButtonClick( this );
		} else {
			MenuBarMenuBehaviors.openOnButtonClick( this );
			MenuBarMenuBehaviors.openOnArrowRightKey( this );
			MenuBarMenuBehaviors.closeOnArrowLeftKey( this );
			MenuBarMenuBehaviors.closeOnParentClose( this );
		}

		MenuBarMenuBehaviors.closeOnEscKey( this );

		this._repositionPanelOnOpen();

		if ( this.parentMenuView ) {
			this.delegate( ...EVENT_NAME_DELEGATES ).to( this.parentMenuView );
		} else {
			this.delegate( ...EVENT_NAME_DELEGATES ).to( this.menuBarView!, name => 'submenu:' + name );
		}
	}

	/**
	 * Fires `arrowright` and `arrowleft` events when the user pressed corresponding arrow keys.
	 */
	private _propagateArrowKeystrokeEvents(): void {
		this.keystrokes.set( 'arrowright', ( data, cancel ) => {
			this.fire( 'arrowright' );
			cancel();
		} );

		this.keystrokes.set( 'arrowleft', ( data, cancel ) => {
			this.fire( 'arrowleft' );
			cancel();
		} );
	}

	/**
	 * Sets the position of the panel when the menu opens. The panel is positioned
	 * so that it optimally uses the available space in the viewport.
	 */
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

	/**
	 * @inheritDoc
	 */
	public focus(): void {
		this.buttonView.focus();
	}

	/**
	 * {@link #panelView} positions depending on the role of the menu in the {@link TODO~MenuBarView}
	 * and the language direction.
	 */
	public get _panelPositions(): Array<PositioningFunction> {
		const { southEast, southWest, northEast, northWest, west, east } = MenuBarMenuViewPanelPositioningFunctions;

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

	/**
	 * A function used to calculate the optimal position for the dropdown panel.
	 *
	 * Referenced for unit testing purposes.
	 */
	private static _getOptimalPosition = getOptimalPosition;
}
