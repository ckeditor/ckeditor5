/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/dropdown/menu/dropdownmenuview
 */

import {
	FocusTracker,
	KeystrokeHandler,
	getOptimalPosition,
	type Locale,
	type PositioningFunction,
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';

import type { FocusableView } from '../../focuscycler.js';
import type { DropdownNestedMenuListItemView } from './typings.js';

import DropdownMenuButtonView from './dropdownmenubuttonview.js';
import { DropdownMenuViewPanelPositioningFunctions } from './utils/dropdownmenupositioningfunctions.js';
import { DropdownMenuBehaviors } from './utils/dropdownmenubehaviors.js';

import View from '../../view.js';

import DropdownMenuListView from './dropdownmenulistview.js';
import DropdownMenuPanelView, { type DropdownMenuPanelPosition } from './dropdownmenupanelview.js';

import '../../../theme/components/dropdown/menu/dropdownmenu.css';

/**
 * Represents a dropdown menu view.
 */
export default class DropdownMenuView extends View implements FocusableView {
	/**
	 * An array of delegated events for the dropdown menu definition controller.
	 * These events are delegated to the dropdown menu element.
	 */
	public static readonly DELEGATED_EVENTS = [
		'mouseenter', 'arrowleft', 'arrowright',
		'change:isOpen', 'close:all', 'submenu:change'
	] as const;

	/**
	 * Button of the menu view.
	 */
	public readonly buttonView: DropdownMenuButtonView;

	/**
	 * Panel of the menu. It hosts children of the menu.
	 */
	public readonly panelView: DropdownMenuPanelView;

	/**
	 * List of nested menu entries.
	 */
	public readonly listView: DropdownMenuListView;

	/**
	 * Tracks information about the DOM focus in the menu.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}. It manages
	 * keystrokes of the menu.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * Controls whether the menu is open, i.e. shows or hides the {@link #panelView panel}.
	 *
	 * @observable
	 */
	declare public isOpen: boolean;

	/**
	 * Controls whether the menu is enabled, i.e. its {@link #buttonView} can be clicked.
	 *
	 * @observable
	 */
	declare public isEnabled: boolean;

	/**
	 * (Optional) The additional CSS class set on the menu {@link #element}.
	 *
	 * @observable
	 */
	declare public class: string | undefined;

	/**
	 * The name of the position of the {@link #panelView}, relative to the menu.
	 *
	 * **Note**: The value is updated each time the panel gets {@link #isOpen open}.
	 *
	 * @observable
	 * @default 'w'
	 */
	declare public panelPosition: DropdownMenuPanelPosition;

	/**
	 * The parent menu view of the menu. It is `null` for top-level menus.
	 *
	 * @observable
	 * @default null
	 */
	declare public parentMenuView: DropdownMenuView | null;

	/**
	 * Indicates whether the lazy initialization of the dropdown menu is pending.
	 *
	 * @observable
	 * @default false
	 */
	declare public pendingLazyInitialization: boolean;

	/**
	 * Creates an instance of the menu view.
	 *
	 * @param locale The localization services instance.
	 * @param label Label of button
	 * @param parentMenuView The parent menu view of the menu.
	 */
	constructor( locale: Locale, label?: string, parentMenuView?: DropdownMenuView | null ) {
		super( locale );

		const bind = this.bindTemplate;

		this.buttonView = new DropdownMenuButtonView( locale );
		this.buttonView.delegate( 'mouseenter' ).to( this );
		this.buttonView.bind( 'isOn', 'isEnabled' ).to( this, 'isOpen', 'isEnabled' );

		if ( label ) {
			this.buttonView.label = label;
		}

		this.panelView = new DropdownMenuPanelView( locale );
		this.panelView.bind( 'isVisible' ).to( this, 'isOpen' );

		this.listView = new DropdownMenuListView( locale );
		this.listView.bind( 'ariaLabel' ).to( this.buttonView, 'label' );

		this.keystrokes = new KeystrokeHandler();
		this.focusTracker = new FocusTracker();

		this.set( 'isOpen', false );
		this.set( 'isEnabled', true );
		this.set( 'panelPosition', 'w' );
		this.set( 'class', undefined );
		this.set( 'parentMenuView', null );
		this.set( 'pendingLazyInitialization', false );

		this.panelView.children.add( this.listView );

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-dropdown-menu__menu',
					bind.to( 'class' ),
					bind.if( 'isEnabled', 'ck-disabled', value => !value )
				]
			},

			children: [
				this.buttonView,
				this.panelView
			]
		} );

		this._attachBehaviors();
		this._attachParentMenuBehaviors();

		if ( parentMenuView ) {
			this.parentMenuView = parentMenuView;
		}
	}

	/**
	 * Gets the nested menu items of the dropdown menu view.
	 */
	public get nestedMenuListItems(): Readonly<Array<DropdownNestedMenuListItemView>> {
		return [ ...this.listView.items ] as Array<DropdownNestedMenuListItemView>;
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

		DropdownMenuBehaviors.closeOnEscKey( this );

		this._repositionPanelOnOpen();
	}

	/**
	 * Attaches the parent menu behaviors to the menu.
	 */
	private _attachParentMenuBehaviors(): void {
		this.delegate( 'execute' ).to( this, 'close:all' );
		this.listView.items.on( 'change', () => {
			this.fire( 'submenu:change' );
		} );

		this.on<ObservableChangeEvent<DropdownMenuView | null>>( 'change:parentMenuView', ( evt, name, parentMenuView ) => {
			if ( parentMenuView ) {
				this.delegate( ...DropdownMenuView.DELEGATED_EVENTS ).to( parentMenuView );
				DropdownMenuBehaviors.closeOnParentClose( this, parentMenuView );
			}
		} );
	}

	/**
	 * Attach all keyboard behaviors for the menu bar view.
	 *
	 * @internal
	 */
	private _attachBehaviors(): void {
		DropdownMenuBehaviors.openOnButtonClick( this );
		DropdownMenuBehaviors.openOnArrowRightKey( this );
		DropdownMenuBehaviors.closeOnArrowLeftKey( this );
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

			const optimalPanelPosition = DropdownMenuView._getOptimalPosition( {
				element: this.panelView.element!,
				target: this.buttonView.element!,
				fitInViewport: true,
				positions: this._panelPositions
			} );

			this.panelView.position = (
				optimalPanelPosition ? optimalPanelPosition.name : this._panelPositions[ 0 ].name
			) as DropdownMenuPanelPosition;
		} );
	}

	/**
	 * @inheritDoc
	 */
	public focus(): void {
		this.buttonView.focus();
	}

	/**
	 * An array of positioning functions used to determine the position of the dropdown menu panel.
	 * The order of the functions in the array determines the priority of the positions to be tried.
	 * The first function that returns a valid position will be used.
	 *
	 * @returns {Array<PositioningFunction>} An array of positioning functions.
	 */
	public get _panelPositions(): Array<PositioningFunction> {
		const { westSouth, eastSouth, westNorth, eastNorth } = DropdownMenuViewPanelPositioningFunctions;

		if ( this.locale!.uiLanguageDirection === 'ltr' ) {
			return [ eastSouth, eastNorth, westSouth, westNorth ];
		} else {
			return [ westSouth, westNorth, eastSouth, eastNorth ];
		}
	}

	/**
	 * A function used to calculate the optimal position for the dropdown panel.
	 *
	 * Referenced for unit testing purposes.
	 */
	private static _getOptimalPosition = getOptimalPosition;
}
