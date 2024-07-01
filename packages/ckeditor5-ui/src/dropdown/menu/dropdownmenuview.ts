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
	global,
	type PositioningFunction,
	type ObservableChangeEvent,
	CKEditorError
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
import { DropdownMenuFactory } from './dropdownmenufactory.js';

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
	declare public isPendingLazyInitialization: boolean;

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

		this.set( {
			isOpen: false,
			isEnabled: true,
			panelPosition: 'w',
			class: undefined,
			parentMenuView: null,
			isPendingLazyInitialization: false
		} );

		this.panelView.content.add( this.listView );
		this.panelView.render();

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

		this._attachParentMenuBehaviors();
		this._attachBehaviors();

		if ( parentMenuView ) {
			this.parentMenuView = parentMenuView;
		}
	}

	/**
	 * The factory property returns a `DropdownMenuFactory` instance.
	 * It creates a factory object that can be used to create instances of `DropdownMenuView`.
	 */
	public get factory(): DropdownMenuFactory {
		if ( this.isPendingLazyInitialization ) {
			/**
			 * Access menu factory on lazy menu is not possible.
			 *
			 * @error cannot-access-factory-on-lazy-loaded-menu
			 */
			throw new CKEditorError( 'cannot-access-factory-on-lazy-loaded-menu' );
		}

		return new DropdownMenuFactory( {
			createMenuViewInstance: ( ...args ) => new DropdownMenuView( this.editor, ...args ),
			listView: this.listView
		} );
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
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		this._removeFromEditorBody();
		this.panelView.destroy();
		super.destroy();
	}

	/**
	 * Attaches the parent menu behaviors to the menu.
	 */
	private _attachParentMenuBehaviors(): void {
		this.listView.items.on( 'change', () => {
			this.fire( 'submenu:change' );
		} );

		this.panelView.delegate( ...DropdownMenuView.DELEGATED_EVENTS ).to( this );
		this.on<ObservableChangeEvent<DropdownMenuView | null>>( 'change:parentMenuView', ( evt, name, parentMenuView ) => {
			if ( parentMenuView ) {
				// Ensure that modification of the parent menu class and focus border state is propagated to the child views.
				this.panelView.unbind( 'class' );
				this.panelView.bind( 'class' ).to( parentMenuView.panelView, 'class' );

				this.listView.unbind( 'isFocusBorderEnabled' );
				this.listView.bind( 'isFocusBorderEnabled' ).to( parentMenuView.listView, 'isFocusBorderEnabled' );

				// Delegate events to the parent menu.
				this.delegate( ...DropdownMenuView.DELEGATED_EVENTS ).to( parentMenuView );
				DropdownMenuBehaviors.closeOnParentClose( this, parentMenuView );
			}
		} );
	}

	/**
	 * Attach all keyboard behaviors for the menu view.
	 */
	private _attachBehaviors(): void {
		DropdownMenuBehaviors.openOnButtonClick( this );
		DropdownMenuBehaviors.openOnArrowRightKey( this );
		DropdownMenuBehaviors.closeOnArrowLeftKey( this );
	}

	/**
	 * Removes the panel view from the editor's body and removes it from the focus tracker.
	 */
	private _removeFromEditorBody(): void {
		const { panelView, editor, keystrokes } = this;
		const { ui } = editor;
		const { body } = ui.view;

		if ( body.has( panelView ) ) {
			body.remove( panelView );
			ui.focusTracker.remove( panelView.element! );
			keystrokes.stopListening( panelView.element! );
		}
	}

	/**
	 * Adds the panel view to the editor's body and sets up event listeners.
	 */
	private _addToEditorBody() {
		const {
			panelView, listView, buttonView,
			keystrokes, editor
		} = this;

		const { ui } = editor;
		const { body } = ui.view;

		if ( !body.has( panelView ) ) {
			listView.checkIfScrollable();
			body.add( panelView );
			ui.focusTracker.add( panelView.element! );
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

	/**
	 * Mounts the portal view in the body when the menu is open and removes it when the menu is closed.
	 * Binds keystrokes to the portal view when the menu is open.
	 */
	private _mountInBodyOnOpen(): void {
		const { panelView } = this;
		const { body } = this.editor.ui.view;

		this.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( evt, name, isOpen ) => {
			// Ensure that the event was triggered by this instance.
			if ( evt.source !== this ) {
				return;
			}

			// Removes the portal view from the body when the menu is closed.
			if ( !isOpen && body.has( panelView ) ) {
				this._removeFromEditorBody();
				return;
			}

			// Adds portal view to the body when the menu is open. Binds keystrokes to the portal view.
			if ( isOpen && !body.has( panelView ) ) {
				this._addToEditorBody();
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
	 * @internal
	 */
	public get _panelPositions(): Array<PositioningFunction> {
		const { westSouth, eastSouth, westNorth, eastNorth } = DropdownMenuViewPanelPositioningFunctions;

		if ( this.locale!.uiLanguageDirection === 'ltr' ) {
			return [ eastSouth, eastNorth, westSouth, westNorth ];
		} else {
			return [ westSouth, westNorth, eastSouth, eastNorth ];
		}
	}
}
