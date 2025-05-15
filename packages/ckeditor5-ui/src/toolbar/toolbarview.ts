/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module ui/toolbar/toolbarview
 */

import View from '../view.js';
import FocusCycler, { isFocusable, type FocusableView } from '../focuscycler.js';
import ToolbarSeparatorView from './toolbarseparatorview.js';
import ToolbarLineBreakView from './toolbarlinebreakview.js';
import preventDefault from '../bindings/preventdefault.js';
import { createDropdown, addToolbarToDropdown } from '../dropdown/utils.js';
import normalizeToolbarConfig from './normalizetoolbarconfig.js';

import type ComponentFactory from '../componentfactory.js';
import type ViewCollection from '../viewcollection.js';
import type DropdownView from '../dropdown/dropdownview.js';
import type DropdownPanelFocusable from '../dropdown/dropdownpanelfocusable.js';

import {
	FocusTracker,
	KeystrokeHandler,
	Rect,
	ResizeObserver,
	global,
	isVisible,
	logWarning,
	type CollectionAddEvent,
	type CollectionChangeEvent,
	type CollectionRemoveEvent,
	type Locale,
	type ObservableChangeEvent
} from '@ckeditor/ckeditor5-utils';
import {
	IconAlignLeft,
	IconBold,
	IconImportExport,
	IconParagraph,
	IconPlus,
	IconText,
	IconThreeVerticalDots,
	IconPilcrow,
	IconDragIndicator
} from '@ckeditor/ckeditor5-icons';
import type { ToolbarConfig, ToolbarConfigItem } from '@ckeditor/ckeditor5-core';

import { isObject } from 'es-toolkit/compat';

import '../../theme/components/toolbar/toolbar.css';

export const NESTED_TOOLBAR_ICONS: Record<string, string | undefined> = /* #__PURE__ */ ( () => ( {
	alignLeft: IconAlignLeft,
	bold: IconBold,
	importExport: IconImportExport,
	paragraph: IconParagraph,
	plus: IconPlus,
	text: IconText,
	threeVerticalDots: IconThreeVerticalDots,
	pilcrow: IconPilcrow,
	dragIndicator: IconDragIndicator
} ) )();

/**
 * The toolbar view class.
 */
export default class ToolbarView extends View implements DropdownPanelFocusable {
	/**
	 * A reference to the options object passed to the constructor.
	 */
	public readonly options: ToolbarOptions;

	/**
	 * A collection of toolbar items (buttons, dropdowns, etc.).
	 */
	public readonly items: ViewCollection;

	/**
	 * Tracks information about the DOM focus in the toolbar.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}
	 * to handle keyboard navigation in the toolbar.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * A (child) view containing {@link #items toolbar items}.
	 */
	public readonly itemsView: ItemsView;

	/**
	 * A top–level collection aggregating building blocks of the toolbar.
	 *
	 *	┌───────────────── ToolbarView ─────────────────┐
	 *	| ┌──────────────── #children ────────────────┐ |
	 *	| |   ┌──────────── #itemsView ───────────┐   | |
	 *	| |   | [ item1 ] [ item2 ] ... [ itemN ] |   | |
	 *	| |   └──────────────────────────────────-┘   | |
	 *	| └───────────────────────────────────────────┘ |
	 *	└───────────────────────────────────────────────┘
	 *
	 * By default, it contains the {@link #itemsView} but it can be extended with additional
	 * UI elements when necessary.
	 */
	public readonly children: ViewCollection;

	/**
	 * A collection of {@link #items} that take part in the focus cycling
	 * (i.e. navigation using the keyboard). Usually, it contains a subset of {@link #items} with
	 * some optional UI elements that also belong to the toolbar and should be focusable
	 * by the user.
	 */
	public readonly focusables: ViewCollection<FocusableView>;

	declare public locale: Locale;

	/**
	 * The property reflected by the `role` DOM attribute to be used by assistive technologies.
	 *
	 * @observable
	 * @default 'toolbar'
	 */
	declare public role: string | undefined;

	/**
	 * Label used by assistive technologies to describe this toolbar element.
	 *
	 * @observable
	 * @default 'Editor toolbar'
	 */
	declare public ariaLabel: string;

	/**
	 * The maximum width of the toolbar element.
	 *
	 * **Note**: When set to a specific value (e.g. `'200px'`), the value will affect the behavior of the
	 * {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull}
	 * option by changing the number of {@link #items} that will be displayed in the toolbar at a time.
	 *
	 * @observable
	 * @default 'auto'
	 */
	declare public maxWidth: string;

	/**
	 * An additional CSS class added to the {@link #element}.
	 *
	 * @observable
	 * @type {String}
	 */
	declare public class: string | undefined;

	/**
	 * When set true, makes the toolbar look compact with {@link #element}.
	 *
	 * @observable
	 * @default false
	 */
	declare public isCompact: boolean;

	/**
	 * Controls the orientation of toolbar items. Only available when
	 * {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull dynamic items grouping}
	 * is **disabled**.
	 *
	 * @observable
	 */
	declare public isVertical: boolean;

	/**
	 * Indicates whether the toolbar responds to changes in the geometry (e.g. window resize) by grouping excessive items or not.
	 */
	declare public isGrouping: boolean;

	/**
	 * Helps cycling over {@link #focusables focusable items} in the toolbar.
	 */
	private readonly _focusCycler: FocusCycler;

	/**
	 * An instance of the active toolbar behavior that shapes its look and functionality.
	 *
	 * See {@link module:ui/toolbar/toolbarview~ToolbarBehavior} to learn more.
	 */
	private _behavior: ToolbarBehavior;

	/**
	 * Creates an instance of the {@link module:ui/toolbar/toolbarview~ToolbarView} class.
	 *
	 * Also see {@link #render}.
	 *
	 * @param locale The localization services instance.
	 * @param options Configuration options of the toolbar.
	 */
	constructor( locale: Locale, options?: ToolbarOptions ) {
		super( locale );

		const bind = this.bindTemplate;
		const t = this.t!;

		this.options = options || {};

		this.set( 'ariaLabel', t( 'Editor toolbar' ) );
		this.set( 'maxWidth', 'auto' );
		this.set( 'role', 'toolbar' );
		this.set( 'isGrouping', !!this.options.shouldGroupWhenFull );

		this.items = this.createCollection();
		this.focusTracker = new FocusTracker();
		this.keystrokes = new KeystrokeHandler();

		this.set( 'class', undefined );
		this.set( 'isCompact', false );
		// Static toolbar can be vertical when needed.
		this.set( 'isVertical', false );

		this.itemsView = new ItemsView( locale );
		this.children = this.createCollection();
		this.children.add( this.itemsView );
		this.focusables = this.createCollection();

		const isRtl = locale.uiLanguageDirection === 'rtl';

		this._focusCycler = new FocusCycler( {
			focusables: this.focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate toolbar items backwards using the arrow[left,up] keys.
				focusPrevious: [ isRtl ? 'arrowright' : 'arrowleft', 'arrowup' ],

				// Navigate toolbar items forwards using the arrow[right,down] keys.
				focusNext: [ isRtl ? 'arrowleft' : 'arrowright', 'arrowdown' ]
			}
		} );

		const classes = [
			'ck',
			'ck-toolbar',
			bind.to( 'class' ),
			bind.if( 'isCompact', 'ck-toolbar_compact' ),

			// To group items dynamically, the toolbar needs a dedicated CSS class. Only used for dynamic grouping.
			bind.if( 'isGrouping', 'ck-toolbar_grouping' ),

			// When vertical, the toolbar has an additional CSS class. Only used for static layout.
			bind.if( 'isVertical', 'ck-toolbar_vertical' )
		];

		if ( this.options.shouldGroupWhenFull && this.options.isFloating ) {
			classes.push( 'ck-toolbar_floating' );
		}

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: classes,
				role: bind.to( 'role' ),
				'aria-label': bind.to( 'ariaLabel' ),
				style: {
					maxWidth: bind.to( 'maxWidth' )
				},
				tabindex: -1
			},

			children: this.children,

			on: {
				// https://github.com/ckeditor/ckeditor5-ui/issues/206
				mousedown: preventDefault( this )
			}
		} );

		this._behavior = this.options.shouldGroupWhenFull ? new DynamicGrouping( this ) : new StaticLayout( this );
	}

	/**
	 * @inheritDoc
	 */
	public override render(): void {
		super.render();

		this.focusTracker.add( this.element! );

		// Children added before rendering should be known to the #focusTracker.
		for ( const item of this.items ) {
			this.focusTracker.add( item );
		}

		this.items.on<CollectionAddEvent<View>>( 'add', ( evt, item ) => {
			this.focusTracker.add( item );
		} );

		this.items.on<CollectionRemoveEvent<View>>( 'remove', ( evt, item ) => {
			this.focusTracker.remove( item );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element! );

		this._behavior.render( this );
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		this._behavior.destroy();
		this.focusTracker.destroy();
		this.keystrokes.destroy();

		return super.destroy();
	}

	/**
	 * Focuses the first focusable in {@link #focusables}.
	 */
	public focus(): void {
		this._focusCycler.focusFirst();
	}

	/**
	 * Focuses the last focusable in {@link #focusables}.
	 */
	public focusLast(): void {
		this._focusCycler.focusLast();
	}

	/**
	 * A utility that expands the plain toolbar configuration into
	 * {@link module:ui/toolbar/toolbarview~ToolbarView#items} using a given component factory.
	 *
	 * @param itemsOrConfig The toolbar items or the entire toolbar configuration object.
	 * @param factory A factory producing toolbar items.
	 * @param removeItems An array of items names to be removed from the configuration. When present, applies
	 * to this toolbar and all nested ones as well.
	 */
	public fillFromConfig(
		itemsOrConfig: ToolbarConfig | undefined,
		factory: ComponentFactory,
		removeItems?: Array<string>
	): void {
		this.items.addMany( this._buildItemsFromConfig( itemsOrConfig, factory, removeItems ) );
	}

	/**
	 * Changes the behavior of toolbar if it does not fit into the available space.
	 */
	public switchBehavior( newBehaviorType: 'dynamic' | 'static' ): void {
		if ( this._behavior.type !== newBehaviorType ) {
			this._behavior.destroy();
			this.itemsView.children.clear();
			this.focusables.clear();

			if ( newBehaviorType === 'dynamic' ) {
				this._behavior = new DynamicGrouping( this );
				this._behavior.render( this );

				( this._behavior as DynamicGrouping ).refreshItems();
			} else {
				this._behavior = new StaticLayout( this );
				this._behavior.render( this );
			}
		}
	}

	/**
	 * A utility that expands the plain toolbar configuration into a list of view items using a given component factory.
	 *
	 * @param itemsOrConfig The toolbar items or the entire toolbar configuration object.
	 * @param factory A factory producing toolbar items.
	 * @param removeItems An array of items names to be removed from the configuration. When present, applies
	 * to this toolbar and all nested ones as well.
	 */
	private _buildItemsFromConfig(
		itemsOrConfig: ToolbarConfig | undefined,
		factory: ComponentFactory,
		removeItems?: Array<string>
	): Array<View> {
		const config = normalizeToolbarConfig( itemsOrConfig );
		const normalizedRemoveItems = removeItems || config.removeItems;
		const itemsToAdd = this._cleanItemsConfiguration( config.items, factory, normalizedRemoveItems )
			.map( item => {
				if ( isObject( item ) ) {
					return this._createNestedToolbarDropdown( item, factory, normalizedRemoveItems );
				} else if ( item === '|' ) {
					return new ToolbarSeparatorView();
				} else if ( item === '-' ) {
					return new ToolbarLineBreakView();
				}

				return factory.create( item );
			} )
			.filter( ( item ): item is View => !!item );

		return itemsToAdd;
	}

	/**
	 * Cleans up the {@link module:ui/toolbar/toolbarview~ToolbarView#items} of the toolbar by removing unwanted items and
	 * duplicated (obsolete) separators or line breaks.
	 *
	 * @param items The toolbar items configuration.
	 * @param factory A factory producing toolbar items.
	 * @param removeItems An array of items names to be removed from the configuration.
	 * @returns Items after the clean-up.
	 */
	private _cleanItemsConfiguration(
		items: Array<ToolbarConfigItem>,
		factory: ComponentFactory,
		removeItems: Array<string>
	) {
		const filteredItems = items
			.filter( ( item, idx, items ) => {
				if ( item === '|' ) {
					return true;
				}

				// Items listed in `config.removeItems` should not be added to the toolbar.
				if ( removeItems.indexOf( item as any ) !== -1 ) {
					return false;
				}

				if ( item === '-' ) {
					// The toolbar line breaks must not be rendered when toolbar grouping is enabled.
					// (https://github.com/ckeditor/ckeditor5/issues/8582)
					if ( this.options.shouldGroupWhenFull ) {
						/**
						 * The toolbar multiline breaks (`-` items) only work when the automatic button grouping
						 * is disabled in the toolbar configuration.
						 * To do this, set the `shouldNotGroupWhenFull` option to `true` in the editor configuration:
						 *
						 * ```ts
						 * const config = {
						 * 	toolbar: {
						 * 		items: [ ... ],
						 * 		shouldNotGroupWhenFull: true
						 * 	}
						 * }
						 * ```
						 *
						 * Learn more about {@link module:core/editor/editorconfig~EditorConfig#toolbar toolbar configuration}.
						 *
						 * @error toolbarview-line-break-ignored-when-grouping-items
						 */
						logWarning( 'toolbarview-line-break-ignored-when-grouping-items', items );

						return false;
					}

					return true;
				}

				// For the items that cannot be instantiated we are sending warning message. We also filter them out.
				if ( !isObject( item ) && !factory.has( item ) ) {
					/**
					 * There was a problem processing the configuration of the toolbar. The item with the given
					 * name does not exist so it was omitted when rendering the toolbar.
					 *
					 * This warning usually shows up when the {@link module:core/plugin~Plugin} which is supposed
					 * to provide a toolbar item has not been loaded or there is a typo in the
					 * {@link module:core/editor/editorconfig~EditorConfig#toolbar toolbar configuration}.
					 *
					 * Make sure the plugin responsible for this toolbar item is loaded and the toolbar configuration
					 * is correct, e.g. {@link module:basic-styles/bold~Bold} is loaded for the `'bold'` toolbar item.
					 *
					 * You can use the following snippet to retrieve all available toolbar items:
					 *
					 * ```ts
					 * Array.from( editor.ui.componentFactory.names() );
					 * ```
					 *
					 * @error toolbarview-item-unavailable
					 * @param {string} item The name of the component or nested toolbar definition.
					 */
					logWarning( 'toolbarview-item-unavailable', { item } );

					return false;
				}

				return true;
			} );

		return this._cleanSeparatorsAndLineBreaks( filteredItems );
	}

	/**
	 * Remove leading, trailing, and duplicated separators (`-` and `|`).
	 *
	 * @returns Toolbar items after the separator and line break clean-up.
	 */
	private _cleanSeparatorsAndLineBreaks( items: Array<ToolbarConfigItem> ) {
		const nonSeparatorPredicate = ( item: ToolbarConfigItem ) => ( item !== '-' && item !== '|' );
		const count = items.length;

		// Find an index of the first item that is not a separator.
		const firstCommandItemIndex = items.findIndex( nonSeparatorPredicate );

		// Items include separators only. There is no point in displaying them.
		if ( firstCommandItemIndex === -1 ) {
			return [];
		}

		// Search from the end of the list, then convert found index back to the original direction.
		const lastCommandItemIndex = count - items
			.slice()
			.reverse()
			.findIndex( nonSeparatorPredicate );

		return items
			// Return items without the leading and trailing separators.
			.slice( firstCommandItemIndex, lastCommandItemIndex )
			// Remove duplicated separators.
			.filter( ( name, idx, items ) => {
				// Filter only separators.
				if ( nonSeparatorPredicate( name ) ) {
					return true;
				}
				const isDuplicated = idx > 0 && items[ idx - 1 ] === name;

				return !isDuplicated;
			} );
	}

	/**
	 * Creates a user-defined dropdown containing a toolbar with items.
	 *
	 * @param definition A definition of the nested toolbar dropdown.
	 * @param definition.label A label of the dropdown.
	 * @param definition.icon An icon of the drop-down. One of 'bold', 'plus', 'text', 'importExport', 'alignLeft',
	 * 'paragraph' or an SVG string. When `false` is passed, no icon will be used.
	 * @param definition.withText When set `true`, the label of the dropdown will be visible. See
	 * {@link module:ui/button/buttonview~ButtonView#withText} to learn more.
	 * @param definition.tooltip A tooltip of the dropdown button. See
	 * {@link module:ui/button/buttonview~ButtonView#tooltip} to learn more. Defaults to `true`.
	 * @param componentFactory Component factory used to create items
	 * of the nested toolbar.
	 */
	private _createNestedToolbarDropdown(
		definition: Exclude<ToolbarConfigItem, string>,
		componentFactory: ComponentFactory,
		removeItems: Array<string>
	) {
		let { label, icon, items, tooltip = true, withText = false } = definition;

		items = this._cleanItemsConfiguration( items, componentFactory, removeItems );

		// There is no point in rendering a dropdown without items.
		if ( !items.length ) {
			return null;
		}

		const locale = this.locale;
		const dropdownView = createDropdown( locale );

		if ( !label ) {
			/**
			 * A dropdown definition in the toolbar configuration is missing a text label.
			 *
			 * Without a label, the dropdown becomes inaccessible to users relying on assistive technologies.
			 * Make sure the `label` property is set in your drop-down configuration:
			 *
			 * ```json
 			 * {
 			 * 	label: 'A human-readable label',
			 * 	icon: '...',
			 * 	items: [ ... ]
 			 * },
			 * ```
			 *
			 * Learn more about {@link module:core/editor/editorconfig~EditorConfig#toolbar toolbar configuration}.
			 *
			 * @error toolbarview-nested-toolbar-dropdown-missing-label
			 */
			logWarning( 'toolbarview-nested-toolbar-dropdown-missing-label', definition );
		}

		dropdownView.class = 'ck-toolbar__nested-toolbar-dropdown';
		dropdownView.buttonView.set( {
			label,
			tooltip,
			withText: !!withText
		} );

		// Allow disabling icon by passing false.
		if ( icon !== false ) {
			// A pre-defined icon picked by name, SVG string, a fallback (default) icon.
			dropdownView.buttonView.icon = NESTED_TOOLBAR_ICONS[ icon! ] || icon || IconThreeVerticalDots;
		}
		// If the icon is disabled, display the label automatically.
		else {
			dropdownView.buttonView.withText = true;
		}

		addToolbarToDropdown( dropdownView, () => (
			dropdownView.toolbarView!._buildItemsFromConfig( items, componentFactory, removeItems )
		) );

		return dropdownView;
	}
}

/**
 * Fired when some toolbar {@link ~ToolbarView#items} were grouped or ungrouped as a result of some change
 * in the toolbar geometry.
 *
 * **Note**: This event is always fired **once** regardless of the number of items that were be
 * grouped or ungrouped at a time.
 *
 * **Note**: This event is fired only if the items grouping functionality was enabled in
 * the first place (see {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull}).
 *
 * @eventName ~ToolbarView#groupedItemsUpdate
 */
export type ToolbarViewGroupedItemsUpdateEvent = {
	name: 'groupedItemsUpdate';
	args: [];
};

/**
 * An inner block of the {@link module:ui/toolbar/toolbarview~ToolbarView} hosting its
 * {@link module:ui/toolbar/toolbarview~ToolbarView#items}.
 */
class ItemsView extends View {
	/**
	 * A collection of items (buttons, dropdowns, etc.).
	 */
	public readonly children: ViewCollection;

	/**
	 * @inheritDoc
	 */
	constructor( locale?: Locale ) {
		super( locale );

		this.children = this.createCollection();

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-toolbar__items'
				]
			},
			children: this.children
		} );
	}
}

/**
 * A toolbar behavior that makes it static and unresponsive to the changes of the environment.
 * At the same time, it also makes it possible to display a toolbar with a vertical layout
 * using the {@link module:ui/toolbar/toolbarview~ToolbarView#isVertical} property.
 */
class StaticLayout implements ToolbarBehavior {
	/**
	 * Toolbar behavior type.
	 */
	public readonly type = 'static';

	/**
	 * Creates an instance of the {@link module:ui/toolbar/toolbarview~StaticLayout} toolbar
	 * behavior.
	 *
	 * @param view An instance of the toolbar that this behavior is added to.
	 */
	constructor( view: ToolbarView ) {
		view.isGrouping = false;

		// 1:1 pass–through binding, all ToolbarView#items are visible.
		view.itemsView.children.bindTo( view.items ).using( item => item );

		// 1:1 pass–through binding, all ToolbarView#items are focusable.
		view.focusables.bindTo( view.items ).using( item => isFocusable( item ) ? item : null );
	}

	/**
	 * @inheritDoc
	 */
	public render(): void {}

	/**
	 * @inheritDoc
	 */
	public destroy(): void {}
}

/**
 * A toolbar behavior that makes the items respond to changes in the geometry.
 *
 * In a nutshell, it groups {@link module:ui/toolbar/toolbarview~ToolbarView#items}
 * that do not fit visually into a single row of the toolbar (due to limited space).
 * Items that do not fit are aggregated in a dropdown displayed at the end of the toolbar.
 *
 * ```
 *	┌──────────────────────────────────────── ToolbarView ──────────────────────────────────────────┐
 *	| ┌─────────────────────────────────────── #children ─────────────────────────────────────────┐ |
 *	| |   ┌─────── #itemsView ────────┐ ┌──────────────────────┐ ┌── #groupedItemsDropdown ───┐   | |
 *	| |   |       #ungroupedItems     | | ToolbarSeparatorView | |        #groupedItems       |   | |
 *	| |   └──────────────────────────-┘ └──────────────────────┘ └────────────────────────────┘   | |
 *	| |                                  \---------- only when toolbar items overflow -------/    | |
 *	| └───────────────────────────────────────────────────────────────────────────────────────────┘ |
 *	└───────────────────────────────────────────────────────────────────────────────────────────────┘
 * ```
 */
class DynamicGrouping implements ToolbarBehavior {
	/**
	 * Toolbar behavior type.
	 */
	public readonly type = 'dynamic';

	/**
	 * A toolbar view this behavior belongs to.
	 */
	public readonly view: ToolbarView;

	/**
	 * A collection of toolbar children.
	 */
	public readonly viewChildren: ViewCollection;

	/**
	 * A collection of focusable toolbar elements.
	 */
	public readonly viewFocusables: ViewCollection<FocusableView>;

	/**
	 * A view containing toolbar items.
	 */
	public readonly viewItemsView: ItemsView;

	/**
	 * Toolbar focus tracker.
	 */
	public readonly viewFocusTracker: FocusTracker;

	/**
	 * Toolbar locale.
	 */
	public readonly viewLocale: Locale;

	/**
	 * A subset of toolbar {@link module:ui/toolbar/toolbarview~ToolbarView#items}.
	 * Aggregates items that fit into a single row of the toolbar and were not {@link #groupedItems grouped}
	 * into a {@link #groupedItemsDropdown dropdown}. Items of this collection are displayed in the
	 * {@link module:ui/toolbar/toolbarview~ToolbarView#itemsView}.
	 *
	 * When none of the {@link module:ui/toolbar/toolbarview~ToolbarView#items} were grouped, it
	 * matches the {@link module:ui/toolbar/toolbarview~ToolbarView#items} collection in size and order.
	 */
	public readonly ungroupedItems: ViewCollection;

	/**
	 * A subset of toolbar {@link module:ui/toolbar/toolbarview~ToolbarView#items}.
	 * A collection of the toolbar items that do not fit into a single row of the toolbar.
	 * Grouped items are displayed in a dedicated {@link #groupedItemsDropdown dropdown}.
	 *
	 * When none of the {@link module:ui/toolbar/toolbarview~ToolbarView#items} were grouped,
	 * this collection is empty.
	 */
	public readonly groupedItems: ViewCollection;

	/**
	 * The dropdown that aggregates {@link #groupedItems grouped items} that do not fit into a single
	 * row of the toolbar. It is displayed on demand as the last of
	 * {@link module:ui/toolbar/toolbarview~ToolbarView#children toolbar children} and offers another
	 * (nested) toolbar which displays items that would normally overflow.
	 */
	public readonly groupedItemsDropdown: DropdownView;

	/**
	 * An instance of the resize observer that helps dynamically determine the geometry of the toolbar
	 * and manage items that do not fit into a single row.
	 *
	 * **Note:** Created in {@link #_enableGroupingOnResize}.
	 *
	 * @readonly
	 */
	public resizeObserver: ResizeObserver | null = null;

	/**
	 * A cached value of the horizontal padding style used by {@link #_updateGrouping}
	 * to manage the {@link module:ui/toolbar/toolbarview~ToolbarView#items} that do not fit into
	 * a single toolbar line. This value can be reused between updates because it is unlikely that
	 * the padding will change and re–using `Window.getComputedStyle()` is expensive.
	 *
	 * @readonly
	 */
	public cachedPadding: number | null = null;

	/**
	 * A flag indicating that an items grouping update has been queued (e.g. due to the toolbar being visible)
	 * and should be executed immediately the next time the toolbar shows up.
	 *
	 * @readonly
	 */
	public shouldUpdateGroupingOnNextResize: boolean = false;

	/**
	 * Toolbar element.
	 *
	 * @readonly
	 */
	public viewElement: HTMLElement | null | undefined;

	/**
	 * Creates an instance of the {@link module:ui/toolbar/toolbarview~DynamicGrouping} toolbar
	 * behavior.
	 *
	 * @param view An instance of the toolbar that this behavior is added to.
	 */
	constructor( view: ToolbarView ) {
		this.view = view;

		this.viewChildren = view.children;
		this.viewFocusables = view.focusables;
		this.viewItemsView = view.itemsView;
		this.viewFocusTracker = view.focusTracker;
		this.viewLocale = view.locale;
		this.view.isGrouping = true;

		this.ungroupedItems = view.createCollection();
		this.groupedItems = view.createCollection();
		this.groupedItemsDropdown = this._createGroupedItemsDropdown();

		// Only those items that were not grouped are visible to the user.
		view.itemsView.children.bindTo( this.ungroupedItems ).using( item => item );

		// Make sure all #items visible in the main space of the toolbar are "focuscyclable".
		this.ungroupedItems.on<CollectionChangeEvent>( 'change', this._updateFocusCyclableItems.bind( this ) );

		// Make sure the #groupedItemsDropdown is also included in cycling when it appears.
		view.children.on<CollectionChangeEvent>( 'change', this._updateFocusCyclableItems.bind( this ) );

		// ToolbarView#items is dynamic. When an item is added or removed, it should be automatically
		// represented in either grouped or ungrouped items at the right index.
		// In other words #items == concat( #ungroupedItems, #groupedItems )
		// (in length and order).
		view.items.on<CollectionChangeEvent<View>>( 'change', ( evt, changeData ) => {
			const index = changeData.index;
			const added = Array.from( changeData.added );

			// Removing.
			for ( const removedItem of changeData.removed ) {
				if ( index >= this.ungroupedItems.length ) {
					this.groupedItems.remove( removedItem );
				} else {
					this.ungroupedItems.remove( removedItem );
				}
			}

			// Adding.
			for ( let currentIndex = index; currentIndex < index + added.length; currentIndex++ ) {
				const addedItem = added[ currentIndex - index ];

				if ( currentIndex > this.ungroupedItems.length ) {
					this.groupedItems.add( addedItem, currentIndex - this.ungroupedItems.length );
				} else {
					this.ungroupedItems.add( addedItem, currentIndex );
				}
			}

			// When new ungrouped items join in and land in #ungroupedItems, there's a chance it causes
			// the toolbar to overflow.
			// Consequently if removed from grouped or ungrouped items, there is a chance
			// some new space is available and we could do some ungrouping.
			this._updateGrouping();
		} );
	}

	/**
	 * Enables dynamic items grouping based on the dimensions of the toolbar.
	 *
	 * @param view An instance of the toolbar that this behavior is added to.
	 */
	public render( view: ToolbarView ): void {
		this.viewElement = view.element;

		this._enableGroupingOnResize();
		this._enableGroupingOnMaxWidthChange( view );
	}

	/**
	 * Cleans up the internals used by this behavior.
	 */
	public destroy(): void {
		// The dropdown may not be in ToolbarView#children at the moment of toolbar destruction
		// so let's make sure it's actually destroyed along with the toolbar.
		this.groupedItemsDropdown.destroy();

		// Do not try to remove the same elements if they are already removed.
		if ( this.viewChildren.length > 1 ) {
			this.viewChildren.remove( this.groupedItemsDropdown );
			this.viewChildren.remove( this.viewChildren.last! );
		}

		this.resizeObserver!.destroy();
	}

	/**
	 * Re-adds all items to the toolbar. Use when the toolbar is re-rendered and the items grouping is lost.
	 */
	public refreshItems(): void {
		const view = this.view;

		if ( view.items.length ) {
			for ( let currentIndex = 0; currentIndex < view.items.length; currentIndex++ ) {
				const item = [ ...view.items ][ currentIndex ];

				this.ungroupedItems.add( item, currentIndex );
			}

			this._updateGrouping();
		}
	}

	/**
	 * When called, it will check if any of the {@link #ungroupedItems} do not fit into a single row of the toolbar,
	 * and it will move them to the {@link #groupedItems} when it happens.
	 *
	 * At the same time, it will also check if there is enough space in the toolbar for the first of the
	 * {@link #groupedItems} to be returned back to {@link #ungroupedItems} and still fit into a single row
	 * without the toolbar wrapping.
	 */
	private _updateGrouping() {
		// Do no grouping–related geometry analysis when the toolbar is detached from visible DOM,
		// for instance before #render(), or after render but without a parent or a parent detached
		// from DOM. DOMRects won't work anyway and there will be tons of warning in the console and
		// nothing else. This happens, for instance, when the toolbar is detached from DOM and
		// some logic adds or removes its #items.
		if ( !this.viewElement!.ownerDocument.body.contains( this.viewElement! ) ) {
			return;
		}

		// Do not update grouping when the element is invisible. Such toolbar has DOMRect filled with zeros
		// and that would cause all items to be grouped. Instead, queue the grouping so it runs next time
		// the toolbar is visible (the next ResizeObserver callback execution). This is handy because
		// the grouping could be caused by increasing the #maxWidth when the toolbar was invisible and the next
		// time it shows up, some items could actually be ungrouped (https://github.com/ckeditor/ckeditor5/issues/6575).
		if ( !isVisible( this.viewElement ) ) {
			this.shouldUpdateGroupingOnNextResize = true;

			return;
		}

		// Remember how many items were initially grouped so at the it is possible to figure out if the number
		// of grouped items has changed. If the number has changed, geometry of the toolbar has also changed.
		const initialGroupedItemsCount = this.groupedItems.length;
		let wereItemsGrouped;

		// Group #items as long as some wrap to the next row. This will happen, for instance,
		// when the toolbar is getting narrow and there is not enough space to display all items in
		// a single row.
		while ( this._areItemsOverflowing ) {
			this._groupLastItem();

			wereItemsGrouped = true;
		}

		// If none were grouped now but there were some items already grouped before,
		// then, what the hell, maybe let's see if some of them can be ungrouped. This happens when,
		// for instance, the toolbar is stretching and there's more space in it than before.
		if ( !wereItemsGrouped && this.groupedItems.length ) {
			// Ungroup items as long as none are overflowing or there are none to ungroup left.
			while ( this.groupedItems.length && !this._areItemsOverflowing ) {
				this._ungroupFirstItem();
			}

			// If the ungrouping ended up with some item wrapping to the next row,
			// put it back to the group toolbar ("undo the last ungroup"). We don't know whether
			// an item will wrap or not until we ungroup it (that's a DOM/CSS thing) so this
			// clean–up is vital for the algorithm.
			if ( this._areItemsOverflowing ) {
				this._groupLastItem();
			}
		}

		if ( this.groupedItems.length !== initialGroupedItemsCount ) {
			this.view.fire<ToolbarViewGroupedItemsUpdateEvent>( 'groupedItemsUpdate' );
		}
	}

	/**
	 * Returns `true` when {@link module:ui/toolbar/toolbarview~ToolbarView#element} children visually overflow,
	 * for instance if the toolbar is narrower than its members. Returns `false` otherwise.
	 */
	private get _areItemsOverflowing() {
		// An empty toolbar cannot overflow.
		if ( !this.ungroupedItems.length ) {
			return false;
		}

		const element = this.viewElement;
		const uiLanguageDirection = this.viewLocale.uiLanguageDirection;
		const lastChildRect = new Rect( element!.lastChild as any );
		const toolbarRect = new Rect( element! );

		if ( !this.cachedPadding ) {
			const computedStyle = global.window.getComputedStyle( element! );
			const paddingProperty = uiLanguageDirection === 'ltr' ? 'paddingRight' : 'paddingLeft';

			// parseInt() is essential because of quirky floating point numbers logic and DOM.
			// If the padding turned out too big because of that, the grouped items dropdown would
			// always look (from the Rect perspective) like it overflows (while it's not).
			this.cachedPadding = Number.parseInt( computedStyle[ paddingProperty ] );
		}

		if ( uiLanguageDirection === 'ltr' ) {
			return lastChildRect.right > toolbarRect.right - this.cachedPadding;
		} else {
			return lastChildRect.left < toolbarRect.left + this.cachedPadding;
		}
	}

	/**
	 * Enables the functionality that prevents {@link #ungroupedItems} from overflowing (wrapping to the next row)
	 * upon resize when there is little space available. Instead, the toolbar items are moved to the
	 * {@link #groupedItems} collection and displayed in a dropdown at the end of the row (which has its own nested toolbar).
	 *
	 * When called, the toolbar will automatically analyze the location of its {@link #ungroupedItems} and "group"
	 * them in the dropdown if necessary. It will also observe the browser window for size changes in
	 * the future and respond to them by grouping more items or reverting already grouped back, depending
	 * on the visual space available.
	 */
	private _enableGroupingOnResize() {
		let previousWidth: number | undefined;

		// TODO: Consider debounce.
		this.resizeObserver = new ResizeObserver( this.viewElement!, entry => {
			if ( !previousWidth || previousWidth !== entry.contentRect.width || this.shouldUpdateGroupingOnNextResize ) {
				this.shouldUpdateGroupingOnNextResize = false;

				this._updateGrouping();

				previousWidth = entry.contentRect.width;
			}
		} );

		this._updateGrouping();
	}

	/**
	 * Enables the grouping functionality, just like {@link #_enableGroupingOnResize} but the difference is that
	 * it listens to the changes of {@link module:ui/toolbar/toolbarview~ToolbarView#maxWidth} instead.
	 */
	private _enableGroupingOnMaxWidthChange( view: View ) {
		view.on<ObservableChangeEvent>( 'change:maxWidth', () => {
			this._updateGrouping();
		} );
	}

	/**
	 * When called, it will remove the last item from {@link #ungroupedItems} and move it back
	 * to the {@link #groupedItems} collection.
	 *
	 * The opposite of {@link #_ungroupFirstItem}.
	 */
	private _groupLastItem() {
		if ( !this.groupedItems.length ) {
			this.viewChildren.add( new ToolbarSeparatorView() );
			this.viewChildren.add( this.groupedItemsDropdown );
			this.viewFocusTracker.add( this.groupedItemsDropdown.element! );
		}

		this.groupedItems.add( this.ungroupedItems.remove( this.ungroupedItems.last! ), 0 );
	}

	/**
	 * Moves the very first item belonging to {@link #groupedItems} back
	 * to the {@link #ungroupedItems} collection.
	 *
	 * The opposite of {@link #_groupLastItem}.
	 */
	private _ungroupFirstItem() {
		this.ungroupedItems.add( this.groupedItems.remove( this.groupedItems.first! ) );

		if ( !this.groupedItems.length ) {
			this.viewChildren.remove( this.groupedItemsDropdown );
			this.viewChildren.remove( this.viewChildren.last! );
			this.viewFocusTracker.remove( this.groupedItemsDropdown.element! );
		}
	}

	/**
	 * Creates the {@link #groupedItemsDropdown} that hosts the members of the {@link #groupedItems}
	 * collection when there is not enough space in the toolbar to display all items in a single row.
	 */
	private _createGroupedItemsDropdown() {
		const locale = this.viewLocale;
		const t = locale.t;
		const dropdown = createDropdown( locale );

		dropdown.class = 'ck-toolbar__grouped-dropdown';

		// Make sure the dropdown never sticks out to the left/right. It should be under the main toolbar.
		// (https://github.com/ckeditor/ckeditor5/issues/5608)
		dropdown.panelPosition = locale.uiLanguageDirection === 'ltr' ? 'sw' : 'se';

		addToolbarToDropdown( dropdown, this.groupedItems );

		dropdown.buttonView.set( {
			label: t( 'Show more items' ),
			tooltip: true,
			tooltipPosition: locale.uiLanguageDirection === 'rtl' ? 'se' : 'sw',
			icon: IconThreeVerticalDots
		} );

		return dropdown;
	}

	/**
	 * Updates the {@link module:ui/toolbar/toolbarview~ToolbarView#focusables focus–cyclable items}
	 * collection so it represents the up–to–date state of the UI from the perspective of the user.
	 *
	 * For instance, the {@link #groupedItemsDropdown} can show up and hide but when it is visible,
	 * it must be subject to focus cycling in the toolbar.
	 *
	 * See the {@link module:ui/toolbar/toolbarview~ToolbarView#focusables collection} documentation
	 * to learn more about the purpose of this method.
	 */
	private _updateFocusCyclableItems() {
		this.viewFocusables.clear();

		this.ungroupedItems.map( item => {
			if ( isFocusable( item ) ) {
				this.viewFocusables.add( item );
			}
		} );

		if ( this.groupedItems.length ) {
			this.viewFocusables.add( this.groupedItemsDropdown );
		}
	}
}

/**
 * Options passed to the {@link module:ui/toolbar/toolbarview~ToolbarView#constructor} of the toolbar.
 */
export interface ToolbarOptions {

	/**
	 * When set to `true`, the toolbar will automatically group {@link module:ui/toolbar/toolbarview~ToolbarView#items} that
	 * would normally wrap to the next line when there is not enough space to display them in a single row, for
	 * instance, if the parent container of the toolbar is narrow. For toolbars in absolutely positioned containers
	 * without width restrictions also the {@link module:ui/toolbar/toolbarview~ToolbarOptions#isFloating} option is required to be `true`.
	 *
	 * See also: {@link module:ui/toolbar/toolbarview~ToolbarView#maxWidth}.
	 */
	shouldGroupWhenFull?: boolean;

	/**
	 * This option should be enabled for toolbars in absolutely positioned containers without width restrictions
	 * to enable automatic {@link module:ui/toolbar/toolbarview~ToolbarView#items} grouping.
	 * When this option is set to `true`, the items will stop wrapping to the next line
	 * and together with {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull},
	 * this will allow grouping them when there is not enough space in a single row.
	 */
	isFloating?: boolean;
}

/**
 * A class interface defining the behavior of the {@link module:ui/toolbar/toolbarview~ToolbarView}.
 *
 * Toolbar behaviors extend its look and functionality and have an impact on the
 * {@link module:ui/toolbar/toolbarview~ToolbarView#element} template or
 * {@link module:ui/toolbar/toolbarview~ToolbarView#render rendering}. They can be enabled
 * conditionally, e.g. depending on the configuration of the toolbar.
 */
export interface ToolbarBehavior {

	/**
	 * A method called after the toolbar has been {@link module:ui/toolbar/toolbarview~ToolbarView#render rendered}.
	 * It can be used to, for example, customize the behavior of the toolbar when its
	 * {@link module:ui/toolbar/toolbarview~ToolbarView#element} is available.
	 *
	 * @param view An instance of the toolbar being rendered.
	 */
	render( view: ToolbarView ): void;

	/**
	 * A method called after the toolbar has been {@link module:ui/toolbar/toolbarview~ToolbarView#destroy destroyed}.
	 * It allows cleaning up after the toolbar behavior, for instance, this is the right place to detach
	 * event listeners, free up references, etc.
	 */
	destroy(): void;

	/**
	 * Indicates the type of the toolbar behavior. Dynamic toolbar can hide items that do not fit into the available space.
	 * Static toolbar does not hide items and does not respond to the changes of the viewport.
	 */
	type: 'dynamic' | 'static';
}
