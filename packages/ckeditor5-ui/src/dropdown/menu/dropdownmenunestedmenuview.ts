/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/dropdown/menu/dropdownmenunestedmenuview
 */

import {
	FocusTracker,
	KeystrokeHandler,
	global,
	type PositioningFunction,
	type ObservableChangeEvent,
	type Locale
} from '@ckeditor/ckeditor5-utils';

import type { FocusableView } from '../../focuscycler.js';
import type BodyCollection from '../../editorui/bodycollection.js';

import DropdownMenuButtonView from './dropdownmenubuttonview.js';
import DropdownMenuListView from './dropdownmenulistview.js';
import { DropdownMenuPanelPositioningFunctions } from './utils.js';
import { DropdownMenuBehaviors } from './dropdownmenubehaviors.js';

import View from '../../view.js';
import DropdownMenuNestedMenuPanelView, { type DropdownMenuNestedMenuPanelPosition } from './dropdownmenunestedmenupanelview.js';

import '../../../theme/components/dropdown/menu/dropdownmenu.css';

/**
 * Represents a nested menu view.
 */
export default class DropdownMenuNestedMenuView extends View implements FocusableView {
	/**
	 * An array of delegated events for the dropdown menu definition controller.
	 * These events are delegated to the dropdown menu element.
	 */
	// Due to some spaghetti code we need to delegate `change:isOpen`.
	public static readonly DELEGATED_EVENTS = [
		'mouseenter', 'execute', 'change:isOpen'
	] as const;

	public readonly id: string;

	/**
	 * Button of the menu view.
	 */
	public readonly buttonView: DropdownMenuButtonView;

	/**
	 * Panel of the menu. It hosts children of the menu.
	 */
	public readonly panelView: DropdownMenuNestedMenuPanelView;

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
	declare public panelPosition: DropdownMenuNestedMenuPanelPosition;

	/**
	 * The parent menu view of the menu. It is `null` for top-level menus.
	 *
	 * @observable
	 * @default null
	 */
	declare public readonly parentMenuView: DropdownMenuNestedMenuView | null;

	private _bodyCollection: BodyCollection;

	/**
	 * Creates a new instance of the DropdownMenuView class.
	 *
	 * @param locale
	 * @param bodyCollection
	 * @param id
	 * @param label The label for the dropdown menu button.
	 * @param parentMenuView The parent dropdown menu view, if any.
	 */
	constructor(
		locale: Locale, bodyCollection: BodyCollection, id: string, label: string, parentMenuView: DropdownMenuNestedMenuView | null
	) {
		super( locale );

		this._bodyCollection = bodyCollection;
		this.id = id;

		this.set( {
			isOpen: false,
			isEnabled: true,
			panelPosition: 'w',
			class: undefined,
			parentMenuView: null
		} );

		this.keystrokes = new KeystrokeHandler();
		this.focusTracker = new FocusTracker();

		this.buttonView = new DropdownMenuButtonView( locale );
		this.buttonView.delegate( 'mouseenter' ).to( this );
		this.buttonView.bind( 'isOn', 'isEnabled' ).to( this, 'isOpen', 'isEnabled' );
		this.buttonView.label = label;

		this.panelView = new DropdownMenuNestedMenuPanelView( locale );
		this.panelView.isVisible = true;

		this.listView = new DropdownMenuListView( locale );
		this.listView.bind( 'ariaLabel' ).to( this.buttonView, 'label' );

		this.panelView.content.add( this.listView );

		const bind = this.bindTemplate;

		this.setTemplate( {
			tag: 'div',

			attributes: {
				class: [
					'ck',
					'ck-dropdown-menu-list__nested-menu',
					bind.to( 'class' ),
					bind.if( 'isEnabled', 'ck-disabled', value => !value )
				],
				role: 'presentation'
			},

			children: [
				this.buttonView
			]
		} );

		this.parentMenuView = parentMenuView;

		if ( this.parentMenuView ) {
			this._handleParentMenuView();
		}

		this._attachBehaviors();
	}

	/**
	 * An array of positioning functions used to determine the position of the dropdown menu panel.
	 * The order of the functions in the array determines the priority of the positions to be tried.
	 * The first function that returns a valid position will be used.
	 *
	 * @returns {Array<PositioningFunction>} An array of positioning functions.
	 * @internal
	 */
	public get _panelPositions(): Array<PositioningFunction> {
		const { westSouth, eastSouth, westNorth, eastNorth } = DropdownMenuPanelPositioningFunctions;

		if ( this.locale!.uiLanguageDirection === 'ltr' ) {
			return [ eastSouth, eastNorth, westSouth, westNorth ];
		} else {
			return [ westSouth, westNorth, eastSouth, eastNorth ];
		}
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.panelView.render();

		this.focusTracker.add( this.buttonView.element! );
		this.focusTracker.add( this.panelView.element! );
		this.focusTracker.add( this.listView );

		// Listen for keystrokes coming from within #element.
		this.keystrokes.listenTo( this.element! );

		this._mountPanelOnOpen();
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		this._removePanelFromBody();
		this.panelView.destroy();
		super.destroy();
	}

	/**
	 * @inheritDoc
	 */
	public focus(): void {
		this.buttonView.focus();
	}

	private _handleParentMenuView(): void {
		// Propagate events from this component to parent-menu.
		this.delegate( ...DropdownMenuNestedMenuView.DELEGATED_EVENTS ).to( this.parentMenuView! );

		// Close this menu if its parent closes.
		DropdownMenuBehaviors.closeOnParentClose( this, this.parentMenuView! );
	}

	/**
	 * Attach all keyboard behaviors for the menu view.
	 */
	private _attachBehaviors(): void {
		DropdownMenuBehaviors.openOnButtonClick( this );
		DropdownMenuBehaviors.openAndFocusOnEnterKeyPress( this );
		DropdownMenuBehaviors.openOnArrowRightKey( this );
		DropdownMenuBehaviors.closeOnEscKey( this );
		DropdownMenuBehaviors.closeOnArrowLeftKey( this );
	}

	/**
	 * Mounts the portal view in the body when the menu is open and removes it when the menu is closed.
	 * Binds keystrokes to the portal view when the menu is open.
	 */
	private _mountPanelOnOpen(): void {
		const { panelView } = this;

		this.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( evt, name, isOpen ) => {
			// Ensure that the event was triggered by this instance.
			// TODO: Remove checking `evt.source` if `change:isOpen` is no longer delegated.
			if ( evt.source !== this ) {
				return;
			}

			// Removes the panel view from the body when the menu is closed.
			if ( !isOpen && this._bodyCollection.has( panelView ) ) {
				this._removePanelFromBody();
				return;
			}

			// Adds the panel view to the body when the menu is open.
			if ( isOpen && !this._bodyCollection.has( panelView ) ) {
				this._addPanelToBody();
			}
		} );
	}

	/**
	 * Removes the panel view from the editor's body and removes it from the focus tracker.
	 */
	private _removePanelFromBody(): void {
		const { panelView, keystrokes } = this;

		if ( this._bodyCollection.has( panelView ) ) {
			this._bodyCollection.remove( panelView );

			keystrokes.stopListening( panelView.element! );
		}
	}

	/**
	 * Adds the panel view to the editor's body and sets up event listeners.
	 */
	private _addPanelToBody() {
		const { panelView, buttonView, keystrokes } = this;

		if ( !this._bodyCollection.has( panelView ) ) {
			this._bodyCollection.add( panelView );

			keystrokes.listenTo( panelView.element! );
			panelView.pin( {
				positions: this._panelPositions,
				limiter: global.document.body,
				element: panelView.element!,
				target: buttonView.element!,
				fitInViewport: true
			} );
		}
	}
}
