/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/dropdown/utils
 */

import DropdownPanelView from './dropdownpanelview.js';
import DropdownView from './dropdownview.js';
import DropdownButtonView from './button/dropdownbuttonview.js';
import DropdownMenuRootListView from './menu/dropdownmenurootlistview.js';
import ToolbarView from '../toolbar/toolbarview.js';
import ListView from '../list/listview.js';
import ListItemView from '../list/listitemview.js';
import ListSeparatorView from '../list/listseparatorview.js';
import SplitButtonView from './button/splitbuttonview.js';
import SwitchButtonView from '../button/switchbuttonview.js';
import ViewCollection from '../viewcollection.js';

import clickOutsideHandler from '../bindings/clickoutsidehandler.js';

import type { default as View } from '../view.js';
import type { ButtonExecuteEvent } from '../button/button.js';
import type Model from '../model.js';
import type DropdownButton from './button/dropdownbutton.js';
import type ButtonView from '../button/buttonview.js';
import type { FocusableView } from '../focuscycler.js';
import type { FalsyValue } from '../template.js';
import type BodyCollection from '../editorui/bodycollection.js';

import {
	global,
	priorities,
	logWarning,
	type FocusTracker,
	type Collection,
	type Locale,
	type ObservableChangeEvent,
	type CollectionChangeEvent
} from '@ckeditor/ckeditor5-utils';

import '../../theme/components/dropdown/toolbardropdown.css';
import '../../theme/components/dropdown/listdropdown.css';

import ListItemGroupView from '../list/listitemgroupview.js';
import ListItemButtonView from '../button/listitembuttonview.js';
import type { DropdownMenuDefinition } from './menu/utils.js';

/**
 * A helper for creating dropdowns. It creates an instance of a {@link module:ui/dropdown/dropdownview~DropdownView dropdown},
 * with a {@link module:ui/dropdown/button/dropdownbutton~DropdownButton button},
 * {@link module:ui/dropdown/dropdownpanelview~DropdownPanelView panel} and all standard dropdown's behaviors.
 *
 * # Creating dropdowns
 *
 * By default, the default {@link module:ui/dropdown/button/dropdownbuttonview~DropdownButtonView} class is used as
 * definition of the button:
 *
 * ```ts
 * const dropdown = createDropdown( model );
 *
 * // Configure dropdown's button properties:
 * dropdown.buttonView.set( {
 * 	label: 'A dropdown',
 * 	withText: true
 * } );
 *
 * dropdown.render();
 *
 * // Will render a dropdown labeled "A dropdown" with an empty panel.
 * document.body.appendChild( dropdown.element );
 * ```
 *
 * You can also provide other button views (they need to implement the
 * {@link module:ui/dropdown/button/dropdownbutton~DropdownButton} interface). For instance, you can use
 * {@link module:ui/dropdown/button/splitbuttonview~SplitButtonView} to create a dropdown with a split button.
 *
 * ```ts
 * const dropdown = createDropdown( locale, SplitButtonView );
 *
 * // Configure dropdown's button properties:
 * dropdown.buttonView.set( {
 * 	label: 'A dropdown',
 * 	withText: true
 * } );
 *
 * dropdown.buttonView.on( 'execute', () => {
 * 	// Add the behavior of the "action part" of the split button.
 * 	// Split button consists of the "action part" and "arrow part".
 * 	// The arrow opens the dropdown while the action part can have some other behavior.
 * } );
 *
 * dropdown.render();
 *
 * // Will render a dropdown labeled "A dropdown" with an empty panel.
 * document.body.appendChild( dropdown.element );
 * ```
 *
 * # Adding content to the dropdown's panel
 *
 * The content of the panel can be inserted directly into the `dropdown.panelView.element`:
 *
 * ```ts
 * dropdown.panelView.element.textContent = 'Content of the panel';
 * ```
 *
 * However, most of the time you will want to add there either a {@link module:ui/list/listview~ListView list of options}
 * or a list of buttons (i.e. a {@link module:ui/toolbar/toolbarview~ToolbarView toolbar}).
 * To simplify the task, you can use, respectively, {@link module:ui/dropdown/utils~addListToDropdown} or
 * {@link module:ui/dropdown/utils~addToolbarToDropdown} utils.
 *
 * @param locale The locale instance.
 * @param ButtonClassOrInstance The dropdown button view class. Needs to implement the
 * {@link module:ui/dropdown/button/dropdownbutton~DropdownButton} interface.
 * @returns The dropdown view instance.
 */
export function createDropdown(
	locale: Locale | undefined,
	ButtonClassOrInstance:
		( new ( locale?: Locale ) => DropdownButton & FocusableView ) | DropdownButton & FocusableView = DropdownButtonView
): DropdownView {
	const buttonView = typeof ButtonClassOrInstance == 'function' ? new ButtonClassOrInstance( locale ) : ButtonClassOrInstance;

	const panelView = new DropdownPanelView( locale );
	const dropdownView = new DropdownView( locale, buttonView, panelView );

	buttonView.bind( 'isEnabled' ).to( dropdownView );

	if ( buttonView instanceof SplitButtonView ) {
		buttonView.arrowView.bind( 'isOn' ).to( dropdownView, 'isOpen' );
	} else {
		buttonView.bind( 'isOn' ).to( dropdownView, 'isOpen' );
	}

	addDefaultBehaviors( dropdownView );

	return dropdownView;
}

/**
 * Adds a menu UI component to a dropdown and sets all common behaviors and interactions between the dropdown and the menu.
 *
 * Use this helper to create multi-level dropdown menus that are displayed in a toolbar.
 *
 * Internally, it creates an instance of {@link module:ui/dropdown/menu/dropdownmenurootlistview~DropdownMenuRootListView}.
 *
 * Example:
 *
 * ```ts
 * const definitions = [
 * 	{
 * 		id: 'menu_1',
 * 		menu: 'Menu 1',
 * 		children: [
 * 			{
 * 				id: 'menu_1_a',
 * 				label: 'Item A'
 * 			},
 * 			{
 * 				id: 'menu_1_b',
 * 				label: 'Item B'
 * 			}
 * 		]
 * 	},
 * 	{
 * 		id: 'top_a',
 * 		label: 'Top Item A'
 * 	},
 * 	{
 * 		id: 'top_b',
 * 		label: 'Top Item B'
 * 	}
 * ];
 *
 * const dropdownView = createDropdown( editor.locale );
 *
 * addMenuToDropdown( dropdownView, editor.ui.view.body, definitions );
 * ```
 *
 * After using this helper, the `dropdown` will fire {@link module:ui/dropdown/dropdownview~DropdownViewEvent `execute`} event when
 * a nested menu button is pressed.
 *
 * The helper will make sure that the `dropdownMenuRootListView` is lazy loaded, i.e., the menu component structure will be initialized
 * and rendered only after the `dropdown` is opened for the first time.
 *
 * @param dropdownView A dropdown instance to which the menu component will be added.
 * @param body Body collection to which floating menu panels will be added.
 * @param definition The menu component definition.
 * @param options.ariaLabel Label used by assistive technologies to describe the top-level menu.
 */
export function addMenuToDropdown(
	dropdownView: DropdownView,
	body: BodyCollection,
	definition: DropdownMenuDefinition,
	options: {
		ariaLabel?: string;
	} = {} ): void {
	dropdownView.menuView = new DropdownMenuRootListView( dropdownView.locale!, body, definition );
	dropdownView.focusTracker.add( dropdownView.menuView );

	if ( dropdownView.isOpen ) {
		addMenuToOpenDropdown( dropdownView, options );
	} else {
		// Load the UI elements only after the dropdown is opened for the first time - lazy loading.
		dropdownView.once( 'change:isOpen', () => {
			addMenuToOpenDropdown( dropdownView, options );
		}, { priority: 'highest' } );
	}
}

function addMenuToOpenDropdown(
	dropdownView: DropdownView,
	options: {
		ariaLabel?: string;
	}
): void {
	const dropdownMenuRootListView = dropdownView.menuView!;
	const t = dropdownView.locale!.t;

	dropdownMenuRootListView.delegate( 'menu:execute' ).to( dropdownView, 'execute' );
	dropdownMenuRootListView.listenTo( dropdownView, 'change:isOpen', ( evt, name, isOpen ) => {
		if ( !isOpen ) {
			dropdownMenuRootListView.closeMenus();
		}
	}, { priority: 'low' } ); // Make sure this is fired after `focusDropdownButtonOnClose` behavior.

	// When `dropdownMenuRootListView` is added as a `panelView` child, it becomes rendered (`panelView` is rendered at this point).
	dropdownView.panelView.children.add( dropdownMenuRootListView );

	// Nested menu panels are added to body collection, so they are not children of the `dropdownView` from DOM perspective.
	// Add these panels to `dropdownView` focus tracker, so they are treated like part of the `dropdownView` for focus-related purposes.
	for ( const menu of dropdownMenuRootListView.menus ) {
		dropdownView.focusTracker.add( menu );
	}

	dropdownMenuRootListView.ariaLabel = options.ariaLabel || t( 'Dropdown menu' );
}

/**
 * Adds an instance of {@link module:ui/toolbar/toolbarview~ToolbarView} to a dropdown.
 *
 * ```ts
 * const buttonsCreator = () => {
 * 	const buttons = [];
 *
 * 	// Either create a new ButtonView instance or create existing.
 * 	buttons.push( new ButtonView() );
 * 	buttons.push( editor.ui.componentFactory.create( 'someButton' ) );
 * };
 *
 * const dropdown = createDropdown( locale );
 *
 * addToolbarToDropdown( dropdown, buttonsCreator, { isVertical: true } );
 *
 * // Will render a vertical button dropdown labeled "A button dropdown"
 * // with a button group in the panel containing two buttons.
 * // Buttons inside the dropdown will be created on first dropdown panel open.
 * dropdown.render()
 * document.body.appendChild( dropdown.element );
 * ```
 *
 * **Note:** To improve the accessibility, you can tell the dropdown to focus the first active button of the toolbar when the dropdown
 * {@link module:ui/dropdown/dropdownview~DropdownView#isOpen gets open}. See the documentation of `options` to learn more.
 *
 * **Note:** Toolbar view will be created on first open of the dropdown.
 *
 * See {@link module:ui/dropdown/utils~createDropdown} and {@link module:ui/toolbar/toolbarview~ToolbarView}.
 *
 * @param dropdownView A dropdown instance to which `ToolbarView` will be added.
 * @param options.enableActiveItemFocusOnDropdownOpen When set `true`, the focus will automatically move to the first
 * active {@link module:ui/toolbar/toolbarview~ToolbarView#items item} of the toolbar upon
 * {@link module:ui/dropdown/dropdownview~DropdownView#isOpen opening} the dropdown. Active items are those with the `isOn` property set
 * `true` (for instance {@link module:ui/button/buttonview~ButtonView buttons}). If no active items is found, the toolbar will be focused
 * as a whole resulting in the focus moving to its first focusable item (default behavior of
 * {@link module:ui/dropdown/dropdownview~DropdownView}).
 * @param options.ariaLabel Label used by assistive technologies to describe toolbar element.
 * @param options.maxWidth The maximum width of the toolbar element.
 * Details: {@link module:ui/toolbar/toolbarview~ToolbarView#maxWidth}.
 * @param options.class An additional CSS class added to the toolbar element.
 * @param options.isCompact When set true, makes the toolbar look compact with toolbar element.
 * @param options.isVertical Controls the orientation of toolbar items.
 */
export function addToolbarToDropdown(
	dropdownView: DropdownView,
	buttonsOrCallback: Array<View> | ViewCollection | ( () => Array<View> | ViewCollection ),
	options: {
		enableActiveItemFocusOnDropdownOpen?: boolean;
		ariaLabel?: string;
		maxWidth?: string;
		class?: string;
		isCompact?: boolean;
		isVertical?: boolean;
	} = {}
): void {
	dropdownView.extendTemplate( {
		attributes: {
			class: [ 'ck-toolbar-dropdown' ]
		}
	} );

	if ( dropdownView.isOpen ) {
		addToolbarToOpenDropdown( dropdownView, buttonsOrCallback, options );
	} else {
		dropdownView.once(
			'change:isOpen',
			() => addToolbarToOpenDropdown( dropdownView, buttonsOrCallback, options ),
			{ priority: 'highest' }
		);
	}

	if ( options.enableActiveItemFocusOnDropdownOpen ) {
		// Accessibility: Focus the first active button in the toolbar when the dropdown gets open.
		focusChildOnDropdownOpen( dropdownView, () => dropdownView.toolbarView!.items.find( ( item: any ) => item.isOn ) );
	}
}

/**
 * Adds an instance of {@link module:ui/toolbar/toolbarview~ToolbarView} to a dropdown.
 */
function addToolbarToOpenDropdown(
	dropdownView: DropdownView,
	buttonsOrCallback: Array<View> | ViewCollection | ( () => Array<View> | ViewCollection ),
	options: {
		ariaLabel?: string;
		maxWidth?: string;
		class?: string;
		isCompact?: boolean;
		isVertical?: boolean;
	}
): void {
	const locale = dropdownView.locale!;
	const t = locale.t;

	const toolbarView = dropdownView.toolbarView = new ToolbarView( locale );
	const buttons = typeof buttonsOrCallback == 'function' ? buttonsOrCallback() : buttonsOrCallback;

	toolbarView.ariaLabel = options.ariaLabel || t( 'Dropdown toolbar' );

	if ( options.maxWidth ) {
		toolbarView.maxWidth = options.maxWidth;
	}

	if ( options.class ) {
		toolbarView.class = options.class;
	}

	if ( options.isCompact ) {
		toolbarView.isCompact = options.isCompact;
	}

	if ( options.isVertical ) {
		toolbarView.isVertical = true;
	}

	if ( buttons instanceof ViewCollection ) {
		toolbarView.items.bindTo( buttons ).using( item => item );
	} else {
		toolbarView.items.addMany( buttons );
	}

	dropdownView.panelView.children.add( toolbarView );
	dropdownView.focusTracker.add( toolbarView );
	toolbarView.items.delegate( 'execute' ).to( dropdownView );
}

/**
 * Adds an instance of {@link module:ui/list/listview~ListView} to a dropdown.
 *
 * ```ts
 * const items = new Collection<ListDropdownItemDefinition>();
 *
 * items.add( {
 * 	type: 'button',
 * 	model: new Model( {
 * 		withText: true,
 * 		label: 'First item',
 * 		labelStyle: 'color: red'
 * 	} )
 * } );
 *
 * items.add( {
 * 	 type: 'button',
 * 	 model: new Model( {
 * 		withText: true,
 * 		label: 'Second item',
 * 		labelStyle: 'color: green',
 * 		class: 'foo'
 * 	} )
 * } );
 *
 * const dropdown = createDropdown( locale );
 *
 * addListToDropdown( dropdown, items );
 *
 * // Will render a dropdown with a list in the panel containing two items.
 * dropdown.render()
 * document.body.appendChild( dropdown.element );
 * ```
 *
 * The `items` collection passed to this methods controls the presence and attributes of respective
 * {@link module:ui/list/listitemview~ListItemView list items}.
 *
 * **Note:** To improve the accessibility, when a list is added to the dropdown using this helper the dropdown will automatically attempt
 * to focus the first active item (a host to a {@link module:ui/button/buttonview~ButtonView} with
 * {@link module:ui/button/buttonview~ButtonView#isOn} set `true`) or the very first item when none are active.
 *
 * **Note:** List view will be created on first open of the dropdown.
 *
 * See {@link module:ui/dropdown/utils~createDropdown} and {@link module:list/list~List}.
 *
 * @param dropdownView A dropdown instance to which `ListVIew` will be added.
 * @param itemsOrCallback A collection of the list item definitions or a callback returning a list item definitions to populate the list.
 * @param options.ariaLabel Label used by assistive technologies to describe list element.
 * @param options.role Will be reflected by the `role` DOM attribute in `ListVIew` and used by assistive technologies.
 */
export function addListToDropdown(
	dropdownView: DropdownView,
	itemsOrCallback: Collection<ListDropdownItemDefinition> | ( () => Collection<ListDropdownItemDefinition> ),
	options: {
		ariaLabel?: string;
		role?: string;
	} = {}
): void {
	if ( dropdownView.isOpen ) {
		addListToOpenDropdown( dropdownView, itemsOrCallback, options );
	} else {
		dropdownView.once(
			'change:isOpen',
			() => addListToOpenDropdown( dropdownView, itemsOrCallback, options ),
			{ priority: 'highest' }
		);
	}

	// Accessibility: Focus the first active button in the list when the dropdown gets open.
	focusChildOnDropdownOpen( dropdownView, () => dropdownView.listView!.items.find( item => {
		if ( item instanceof ListItemView ) {
			return ( item.children.first as any ).isOn;
		}

		return false;
	} ) );
}

/**
 * Adds an instance of {@link module:ui/list/listview~ListView} to a dropdown.
 */
function addListToOpenDropdown(
	dropdownView: DropdownView,
	itemsOrCallback: Collection<ListDropdownItemDefinition> | ( () => Collection<ListDropdownItemDefinition> ),
	options: {
		ariaLabel?: string;
		role?: string;
	}
): void {
	const locale = dropdownView.locale!;
	const listView = dropdownView.listView = new ListView( locale );
	const items = typeof itemsOrCallback == 'function' ? itemsOrCallback() : itemsOrCallback;

	listView.ariaLabel = options.ariaLabel;
	listView.role = options.role;

	bindViewCollectionItemsToDefinitions( dropdownView, listView.items, items, locale );

	dropdownView.panelView.children.add( listView );

	listView.items.delegate( 'execute' ).to( dropdownView );
}

/**
 * A helper to be used on an existing {@link module:ui/dropdown/dropdownview~DropdownView} that focuses
 * a specific child in DOM when the dropdown {@link module:ui/dropdown/dropdownview~DropdownView#isOpen gets open}.
 *
 * @param dropdownView A dropdown instance to which the focus behavior will be added.
 * @param childSelectorCallback A callback executed when the dropdown gets open. It should return a {@link module:ui/view~View}
 * instance (child of {@link module:ui/dropdown/dropdownview~DropdownView#panelView}) that will get focused or a falsy value.
 * If falsy value is returned, a default behavior of the dropdown will engage focusing the first focusable child in
 * the {@link module:ui/dropdown/dropdownview~DropdownView#panelView}.
 */
export function focusChildOnDropdownOpen(
	dropdownView: DropdownView,
	childSelectorCallback: () => View | FalsyValue
): void {
	dropdownView.on<ObservableChangeEvent>( 'change:isOpen', () => {
		if ( !dropdownView.isOpen ) {
			return;
		}

		const childToFocus: ( View & { focus?: () => void } ) | FalsyValue = childSelectorCallback();

		if ( !childToFocus ) {
			return;
		}

		if ( typeof childToFocus.focus === 'function' ) {
			childToFocus.focus();
		} else {
			/**
			 * The child view of a {@link module:ui/dropdown/dropdownview~DropdownView dropdown} is missing the `focus()` method
			 * and could not be focused when the dropdown got {@link module:ui/dropdown/dropdownview~DropdownView#isOpen open}.
			 *
			 * Making the content of a dropdown focusable in this case greatly improves the accessibility. Please make the view instance
			 * implements the {@link module:ui/dropdown/dropdownpanelfocusable~DropdownPanelFocusable focusable interface} for the best user
			 * experience.
			 *
			 * @error ui-dropdown-focus-child-on-open-child-missing-focus
			 * @param {module:ui/view~View} view Child to focus.
			 */
			logWarning( 'ui-dropdown-focus-child-on-open-child-missing-focus', { view: childToFocus } );
		}

	// * Let the panel show up first (do not focus an invisible element).
	// * Execute after focusDropdownPanelOnOpen(). See focusDropdownPanelOnOpen() to learn more.
	}, { priority: priorities.low - 10 } );
}

/**
 * Add a set of default behaviors to dropdown view.
 */
function addDefaultBehaviors( dropdownView: DropdownView ) {
	closeDropdownOnClickOutside( dropdownView );
	closeDropdownOnExecute( dropdownView );
	closeDropdownOnBlur( dropdownView );
	focusDropdownContentsOnArrows( dropdownView );
	focusDropdownButtonOnClose( dropdownView );
	focusDropdownPanelOnOpen( dropdownView );
}

/**
 * Adds a behavior to a dropdownView that closes opened dropdown when user clicks outside the dropdown.
 */
function closeDropdownOnClickOutside( dropdownView: DropdownView ) {
	clickOutsideHandler( {
		emitter: dropdownView,
		activator: () => dropdownView.isRendered && dropdownView.isOpen,
		callback: () => {
			dropdownView.isOpen = false;
		},
		contextElements: () => [
			dropdownView.element!,
			// Include all elements connected to the dropdown's focus tracker, but exclude those that are direct children
			// of DropdownView#element. They would be identified as descendants of #element anyway upon clicking and would
			// not contribute to the logic.
			...getFocusTrackerTreeElements( dropdownView.focusTracker ).filter( element => !dropdownView.element!.contains( element ) )
		]
	} );
}

/**
 * Returns all DOM elements connected to a DropdownView's focus tracker, either directly (same DOM sub-tree)
 * or indirectly (external views registered in the focus tracker).
 */
function getFocusTrackerTreeElements( focusTracker: FocusTracker ): Array<Element> {
	return [
		...focusTracker.elements,
		...focusTracker.externalViews.flatMap( view => getFocusTrackerTreeElements( view.focusTracker ) )
	];
}

/**
 * Adds a behavior to a dropdownView that closes the dropdown view on "execute" event.
 */
function closeDropdownOnExecute( dropdownView: DropdownView ) {
	// Close the dropdown when one of the list items has been executed.
	dropdownView.on<ButtonExecuteEvent>( 'execute', evt => {
		// Toggling a switch button view should not close the dropdown.
		if ( evt.source instanceof SwitchButtonView ) {
			return;
		}

		dropdownView.isOpen = false;
	} );
}

/**
 * Adds a behavior to a dropdown view that closes opened dropdown when it loses focus.
 */
function closeDropdownOnBlur( dropdownView: DropdownView ) {
	dropdownView.focusTracker.on<ObservableChangeEvent<boolean>>( 'change:isFocused', ( evt, name, isFocused ) => {
		if ( isFocused || !dropdownView.isOpen ) {
			return;
		}

		dropdownView.isOpen = false;
	} );
}

/**
 * Adds a behavior to a dropdownView that focuses the dropdown's panel view contents on keystrokes.
 */
function focusDropdownContentsOnArrows( dropdownView: DropdownView ) {
	// If the dropdown panel is already open, the arrow down key should focus the first child of the #panelView.
	dropdownView.keystrokes.set( 'arrowdown', ( data, cancel ) => {
		if ( dropdownView.isOpen ) {
			dropdownView.panelView.focus();
			cancel();
		}
	} );

	// If the dropdown panel is already open, the arrow up key should focus the last child of the #panelView.
	dropdownView.keystrokes.set( 'arrowup', ( data, cancel ) => {
		if ( dropdownView.isOpen ) {
			dropdownView.panelView.focusLast();
			cancel();
		}
	} );
}

/**
 * Adds a behavior that focuses the #buttonView when the dropdown was closed but focus was within the #panelView element.
 * This makes sure the focus is never lost.
 */
function focusDropdownButtonOnClose( dropdownView: DropdownView ) {
	dropdownView.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( evt, name, isOpen ) => {
		if ( isOpen ) {
			return;
		}

		const elements = dropdownView.focusTracker.elements;

		// If the dropdown was closed, move the focus back to the button (#12125).
		// Don't touch the focus, if it moved somewhere else (e.g. moved to the editing root on #execute) (#12178).
		// Note: Don't use the state of the DropdownView#focusTracker here. It fires #blur with the timeout.
		if ( elements.some( element => element.contains( global.document.activeElement ) ) ) {
			dropdownView.buttonView.focus();
		}
	} );
}

/**
 * Adds a behavior that focuses the #panelView when dropdown gets open (accessibility).
 */
function focusDropdownPanelOnOpen( dropdownView: DropdownView ) {
	dropdownView.on<ObservableChangeEvent<boolean>>( 'change:isOpen', ( evt, name, isOpen ) => {
		if ( !isOpen ) {
			return;
		}

		// Focus the first item in the dropdown when the dropdown opened.
		dropdownView.panelView.focus();

	// * Let the panel show up first (do not focus an invisible element).
	// * Also, execute before focusChildOnDropdownOpen() to make sure this helper does not break the
	//   focus of a specific child by kicking in too late and resetting the focus in the panel.
	}, { priority: 'low' } );
}

/**
 * This helper populates a dropdown list with items and groups according to the
 * collection of item definitions. A permanent binding is created in this process allowing
 * dynamic management of the dropdown list content.
 *
 * @param dropdownView
 * @param listItems
 * @param definitions
 * @param locale
 */
function bindViewCollectionItemsToDefinitions(
	dropdownView: DropdownView,
	listItems: ViewCollection,
	definitions: Collection<ListDropdownItemDefinition>,
	locale: Locale
) {
	bindDropdownToggleableButtonsAlignment( listItems );

	listItems.bindTo( definitions ).using( def => {
		if ( def.type === 'separator' ) {
			return new ListSeparatorView( locale );
		} else if ( def.type === 'group' ) {
			const groupView = new ListItemGroupView( locale );

			groupView.set( { label: def.label } );

			bindViewCollectionItemsToDefinitions( dropdownView, groupView.items, def.items, locale );

			groupView.items.delegate( 'execute' ).to( dropdownView );

			return groupView;
		} else if ( def.type === 'button' || def.type === 'switchbutton' ) {
			const isToggleable = def.model.role === 'menuitemcheckbox' || def.model.role === 'menuitemradio';
			const listItemView = new ListItemView( locale );

			let buttonView: ButtonView;

			if ( def.type === 'button' ) {
				buttonView = new ListItemButtonView( locale );
				buttonView.set( {
					isToggleable
				} );
			} else {
				buttonView = new SwitchButtonView( locale );
			}

			// Bind all model properties to the button view.
			buttonView.bind( ...Object.keys( def.model ) as Array<keyof ButtonView> ).to( def.model );
			buttonView.delegate( 'execute' ).to( listItemView );

			listItemView.children.add( buttonView );

			return listItemView;
		}

		return null;
	} );
}

/**
 * Sets up alignment handling for toggleable buttons in a dropdown list.
 *
 * Buttons in dropdowns have reserved space for a check icon when they are toggleable.
 * When at least one button in the list is toggleable, all other buttons (even non-toggleable ones)
 * will have space on their left side to align with toggleable buttons.
 *
 * This function handles a special case where a new toggleable button is added (or removed) to a list
 * where previous buttons weren't toggleable. In that case, those previous buttons will
 * automatically allocate space to align with the new toggleable button.
 *
 * Example:
 * ```
 * Before adding toggleable button:
 * +----------------+
 * | Normal Button  |
 * +----------------+
 * | Another Button |
 * +----------------+
 *
 * After adding toggleable button:
 * +-------------------+
 * |    Normal Button  |
 * +-------------------+
 * |    Another Button |
 * +-------------------+
 * | ✓ Toggle Button   |
 * +-------------------+
 * ```
 *
 * @param listItems Collection of list items to observe for toggleable buttons.
 */
function bindDropdownToggleableButtonsAlignment( listItems: ViewCollection ) {
	// Keep track of how many toggleable buttons are in the list.
	let toggleableButtonsCount = 0;

	// Helper function that checks if a view item is a list item button.
	const pickListItemButtonIfPresent = ( item: View<HTMLElement> ) => {
		// Check if the item is a ListItemView with a ListItemButtonView as its first child.
		if ( !( item instanceof ListItemView ) || !( item.children.first instanceof ListItemButtonView ) ) {
			return null;
		}

		return item.children.first;
	};

	// Helper function that checks if a view item is a toggleable button.
	// Returns the button if it's toggleable - otherwise, returns null.
	const pickListItemToggleableButtonIfPresent = ( item: View<HTMLElement> ) => {
		const listItemButtonView = pickListItemButtonIfPresent( item );

		// Only return buttons that are configured as toggleable.
		if ( !listItemButtonView || !listItemButtonView.isToggleable ) {
			return null;
		}

		return listItemButtonView;
	};

	// Updates all buttons in the list to either allocate space for check marks or not.
	// This ensures all buttons are properly aligned regardless of their toggleable state.
	const updateAllButtonsCheckSpace = ( hasSpace: boolean ): void => {
		for ( const listItem of listItems ) {
			const listItemButton = pickListItemButtonIfPresent( listItem );

			if ( listItemButton ) {
				listItemButton.hasCheckSpace = hasSpace;
			}
		}
	};

	// Listen for changes in the list items collection.
	listItems.on<CollectionChangeEvent<FocusableView>>( 'change', ( evt, data ) => {
		// Remember the current state - whether we have any toggleable buttons.
		const prevToggleable = toggleableButtonsCount > 0;

		// Process removed items - decrease count for each toggleable button removed.
		for ( const item of data.removed ) {
			if ( pickListItemToggleableButtonIfPresent( item ) ) {
				toggleableButtonsCount--;
			}
		}

		// Process added items - increase count for each toggleable button added.
		for ( const item of data.added ) {
			const button = pickListItemButtonIfPresent( item );

			if ( !button ) {
				continue;
			}

			if ( button.isToggleable ) {
				// Check if the button is toggleable and increase the count.
				toggleableButtonsCount++;
			}

			// Depending on the current state, set the check space for the button.
			button.hasCheckSpace = toggleableButtonsCount > 0;
		}

		// Check if the current state has changed.
		const currentToggleable = toggleableButtonsCount > 0;

		// Only update button alignment if we've crossed the threshold between
		// having no toggleable buttons and having at least one.
		if ( prevToggleable !== currentToggleable ) {
			updateAllButtonsCheckSpace( currentToggleable );
		}
	} );
}

/**
 * A definition of the list item used by the {@link module:ui/dropdown/utils~addListToDropdown}
 * utility.
 */
export type ListDropdownItemDefinition = ListDropdownSeparatorDefinition | ListDropdownButtonDefinition | ListDropdownGroupDefinition;

/**
 * A definition of the 'separator' list item.
 */
export type ListDropdownSeparatorDefinition = {
	type: 'separator';
};

/**
 * A definition of the 'button' or 'switchbutton' list item.
 */
export type ListDropdownButtonDefinition = {
	type: 'button' | 'switchbutton';

	/**
	 * Model of the item. Its properties fuel the newly created list item (or its children, depending on the `type`).
	 */
	model: Model;
};

/**
 * A definition of the group inside the list. A group can contain one or more list items (buttons).
 */
export type ListDropdownGroupDefinition = {
	type: 'group';

	/**
	 * The visible label of the group.
	 */
	label: string;

	/**
	 * The collection of the child list items inside this group.
	 */
	items: Collection<ListDropdownButtonDefinition>;
};
