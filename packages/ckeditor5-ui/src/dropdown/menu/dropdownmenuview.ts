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
	global,
	type PositioningFunction,
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';

import type { Editor } from '@ckeditor/ckeditor5-core';
import type { FocusableView } from '../../focuscycler.js';
import type { DropdownNestedMenuListItemView } from './typings.js';
import type ViewCollection from '../../viewcollection.js';

import DropdownMenuButtonView from './dropdownmenubuttonview.js';
import DropdownMenuListView from './dropdownmenulistview.js';
import { DropdownMenuViewPanelPositioningFunctions } from './utils/dropdownmenupositioningfunctions.js';
import { DropdownMenuBehaviors } from './utils/dropdownmenubehaviors.js';

import View from '../../view.js';
import DropdownMenuPanelView, { type DropdownMenuPanelPosition } from './dropdownmenupanelview.js';

import '../../../theme/components/dropdown/menu/dropdownmenu.css';
import DropdownMenuPortalView from './dropdownmenuportalview.js';

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
		'change:isOpen', 'item:execute', 'submenu:change'
	] as const;

	/**
	 * The editor instance associated with the dropdown menu view.
	 */
	public readonly editor: Editor;

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
	 * Menu body element view.
	 */
	public readonly portalView: DropdownMenuPortalView;

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
	 * Creates a new instance of the DropdownMenuView class.
	 *
	 * @param editor The editor instance.
	 * @param label The label for the dropdown menu button.
	 * @param parentMenuView The parent dropdown menu view, if any.
	 */
	constructor( editor: Editor, label?: string, parentMenuView?: DropdownMenuView | null ) {
		super( editor.locale );

		const bind = this.bindTemplate;

		this.editor = editor;
		this.buttonView = new DropdownMenuButtonView( editor.locale );
		this.buttonView.delegate( 'mouseenter' ).to( this );
		this.buttonView.bind( 'isOn', 'isEnabled' ).to( this, 'isOpen', 'isEnabled' );

		if ( label ) {
			this.buttonView.label = label;
		}

		this.panelView = new DropdownMenuPanelView( editor.locale );
		this.panelView.bind( 'isVisible' ).to( this, 'isOpen' );

		this.listView = new DropdownMenuListView( editor.locale );
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
				this.buttonView
			]
		} );

		this.portalView = new DropdownMenuPortalView( editor.locale );
		this.portalView.children.add( this.panelView );

		this._attachBehaviors();
		this._attachParentMenuBehaviors();

		if ( parentMenuView ) {
			this.parentMenuView = parentMenuView;
		}
	}

	/**
	 * Gets the nested menu items of the dropdown menu view.
	 */
	public get menuItems(): ViewCollection<DropdownNestedMenuListItemView> {
		return this.listView.items as ViewCollection<DropdownNestedMenuListItemView>;
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

		this._mountInBodyOnOpen();
		this._repositionPanelOnOpen();
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		const { body } = this.editor.ui.view;

		if ( body.has( this.portalView ) ) {
			body.remove( this.portalView );
		}

		this.portalView.destroy();
		super.destroy();
	}

	/**
	 * Attaches the parent menu behaviors to the menu.
	 */
	private _attachParentMenuBehaviors(): void {
		this.listView.items.on( 'change', () => {
			this.fire( 'submenu:change' );
		} );

		this.portalView.delegate( ...DropdownMenuView.DELEGATED_EVENTS ).to( this );
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
	 * Mounts the portal view in the body when the menu is open and removes it when the menu is closed.
	 * Binds keystrokes to the portal view when the menu is open.
	 */
	private _mountInBodyOnOpen(): void {
		const { portalView, keystrokes } = this;
		const { body } = this.editor.ui.view;

		// Let the menu control the position of the panel. The position must be updated every time the menu is open.
		this.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( evt, name, isOpen ) => {
			// Removes the portal view from the body when the menu is closed.
			if ( !isOpen && body.has( portalView ) ) {
				body.remove( portalView );
				return;
			}

			// Adds portal view to the body when the menu is open. Binds keystrokes to the portal view.
			if ( isOpen && !body.has( portalView ) ) {
				body.add( portalView );
				keystrokes.listenTo( portalView.element! );
			}
		} );
	}

	/**
	 * Sets the position of the panel when the menu opens. The panel is positioned
	 * so that it optimally uses the available space in the viewport.
	 */
	private _repositionPanelOnOpen(): void {
		const { panelView, buttonView } = this;

		// Let the menu control the position of the panel. The position must be updated every time the menu is open.
		this.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( evt, name, isOpen ) => {
			if ( !isOpen ) {
				return;
			}

			const buttonRect = buttonView.element!.getBoundingClientRect();
			const optimalPanelPosition = DropdownMenuView._getOptimalPosition( {
				element: panelView.element!,
				target: buttonView.element!,
				fitInViewport: true,
				positions: this._panelPositions,
				limiter: global.document.body
			} );

			const position = (
				optimalPanelPosition ? optimalPanelPosition.name : this._panelPositions[ 0 ].name
			) as DropdownMenuPanelPosition;

			if ( optimalPanelPosition ) {
				let topMargin = 0;

				// Add the button height to the top margin if the panel is positioned below the button.
				if ( position === 'en' || position === 'wn' ) {
					topMargin += buttonRect.height;
				}

				panelView.set( {
					top: optimalPanelPosition.top + topMargin,
					left: optimalPanelPosition.left,
					position
				} );
			}
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
