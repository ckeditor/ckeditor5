/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/toolbar/toolbarview
 */

import View from '../view';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '../focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import ToolbarSeparatorView from './toolbarseparatorview';
import ToolbarLineBreakView from './toolbarlinebreakview';
import ResizeObserver from '@ckeditor/ckeditor5-utils/src/dom/resizeobserver';
import preventDefault from '../bindings/preventdefault.js';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { createDropdown, addToolbarToDropdown } from '../dropdown/utils';
import { logWarning } from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import verticalDotsIcon from '@ckeditor/ckeditor5-core/theme/icons/three-vertical-dots.svg';
import normalizeToolbarConfig from './normalizetoolbarconfig';

import '../../theme/components/toolbar/toolbar.css';

/**
 * The toolbar view class.
 *
 * @extends module:ui/view~View
 * @implements module:ui/dropdown/dropdownpanelfocusable~DropdownPanelFocusable
 */
export default class ToolbarView extends View {
	/**
	 * Creates an instance of the {@link module:ui/toolbar/toolbarview~ToolbarView} class.
	 *
	 * Also see {@link #render}.
	 *
	 * @param {module:utils/locale~Locale} locale The localization services instance.
	 * @param {module:ui/toolbar/toolbarview~ToolbarOptions} [options] Configuration options of the toolbar.
	 */
	constructor( locale, options ) {
		super( locale );

		const bind = this.bindTemplate;
		const t = this.t;

		/**
		 * A reference to the options object passed to the constructor.
		 *
		 * @readonly
		 * @member {module:ui/toolbar/toolbarview~ToolbarOptions}
		 */
		this.options = options || {};

		/**
		 * Label used by assistive technologies to describe this toolbar element.
		 *
		 * @default 'Editor toolbar'
		 * @member {String} #ariaLabel
		 */
		this.set( 'ariaLabel', t( 'Editor toolbar' ) );

		/**
		 * The maximum width of the toolbar element.
		 *
		 * **Note**: When set to a specific value (e.g. `'200px'`), the value will affect the behavior of the
		 * {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull}
		 * option by changing the number of {@link #items} that will be displayed in the toolbar at a time.
		 *
		 * @observable
		 * @default 'auto'
		 * @member {String} #maxWidth
		 */
		this.set( 'maxWidth', 'auto' );

		/**
		 * A collection of toolbar items (buttons, dropdowns, etc.).
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.items = this.createCollection();

		/**
		 * Tracks information about the DOM focus in the toolbar.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}
		 * to handle keyboard navigation in the toolbar.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * An additional CSS class added to the {@link #element}.
		 *
		 * @observable
		 * @member {String} #class
		 */
		this.set( 'class' );

		/**
		 * When set true, makes the toolbar look compact with {@link #element}.
		 *
		 * @observable
		 * @default false
		 * @member {String} #isCompact
		 */
		this.set( 'isCompact', false );

		/**
		 * A (child) view containing {@link #items toolbar items}.
		 *
		 * @readonly
		 * @member {module:ui/toolbar/toolbarview~ItemsView}
		 */
		this.itemsView = new ItemsView( locale );

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
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.children = this.createCollection();
		this.children.add( this.itemsView );

		/**
		 * A collection of {@link #items} that take part in the focus cycling
		 * (i.e. navigation using the keyboard). Usually, it contains a subset of {@link #items} with
		 * some optional UI elements that also belong to the toolbar and should be focusable
		 * by the user.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.focusables = this.createCollection();

		/**
		 * Controls the orientation of toolbar items. Only available when
		 * {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull dynamic items grouping}
		 * is **disabled**.
		 *
		 * @observable
		 * @member {Boolean} #isVertical
		 */

		/**
		 * Helps cycling over {@link #focusables focusable items} in the toolbar.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/focuscycler~FocusCycler}
		 */
		this._focusCycler = new FocusCycler( {
			focusables: this.focusables,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate toolbar items backwards using the arrow[left,up] keys.
				focusPrevious: [ 'arrowleft', 'arrowup' ],

				// Navigate toolbar items forwards using the arrow[right,down] keys.
				focusNext: [ 'arrowright', 'arrowdown' ]
			}
		} );

		const classes = [
			'ck',
			'ck-toolbar',
			bind.to( 'class' ),
			bind.if( 'isCompact', 'ck-toolbar_compact' )
		];

		if ( this.options.shouldGroupWhenFull && this.options.isFloating ) {
			classes.push( 'ck-toolbar_floating' );
		}

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: classes,
				role: 'toolbar',
				'aria-label': bind.to( 'ariaLabel' ),
				style: {
					maxWidth: bind.to( 'maxWidth' )
				}
			},

			children: this.children,

			on: {
				// https://github.com/ckeditor/ckeditor5-ui/issues/206
				mousedown: preventDefault( this )
			}
		} );

		/**
		 * An instance of the active toolbar behavior that shapes its look and functionality.
		 *
		 * See {@link module:ui/toolbar/toolbarview~ToolbarBehavior} to learn more.
		 *
		 * @protected
		 * @readonly
		 * @member {module:ui/toolbar/toolbarview~ToolbarBehavior}
		 */
		this._behavior = this.options.shouldGroupWhenFull ? new DynamicGrouping( this ) : new StaticLayout( this );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		// Children added before rendering should be known to the #focusTracker.
		for ( const item of this.items ) {
			this.focusTracker.add( item.element );
		}

		this.items.on( 'add', ( evt, item ) => {
			this.focusTracker.add( item.element );
		} );

		this.items.on( 'remove', ( evt, item ) => {
			this.focusTracker.remove( item.element );
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element );

		this._behavior.render( this );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this._behavior.destroy();

		return super.destroy();
	}

	/**
	 * Focuses the first focusable in {@link #focusables}.
	 */
	focus() {
		this._focusCycler.focusFirst();
	}

	/**
	 * Focuses the last focusable in {@link #focusables}.
	 */
	focusLast() {
		this._focusCycler.focusLast();
	}

	/**
	 * A utility that expands the plain toolbar configuration into
	 * {@link module:ui/toolbar/toolbarview~ToolbarView#items} using a given component factory.
	 *
	 * @param {Array.<String>|Object} itemsOrConfig The toolbar items or the entire toolbar configuration object.
	 * @param {module:ui/componentfactory~ComponentFactory} factory A factory producing toolbar items.
	 */
	fillFromConfig( itemsOrConfig, factory ) {
		const config = normalizeToolbarConfig( itemsOrConfig );

		const itemsToClean = config.items
			.filter( ( name, idx, items ) => {
				if ( name === '|' ) {
					return true;
				}

				// Items listed in `config.removeItems` should not be added to the toolbar.
				if ( config.removeItems.indexOf( name ) !== -1 ) {
					return false;
				}

				if ( name === '-' ) {
					// The toolbar line breaks must not be rendered when toolbar grouping is enabled.
					// (https://github.com/ckeditor/ckeditor5/issues/8582)
					if ( this.options.shouldGroupWhenFull ) {
						/**
						 * The toolbar multiline breaks (`-` items) only work when the automatic button grouping
						 * is disabled in the toolbar configuration.
						 * To do this, set the `shouldNotGroupWhenFull` option to `true` in the editor configuration:
						 *
						 *		const config = {
						 *			toolbar: {
						 *				items: [ ... ],
						 *				shouldNotGroupWhenFull: true
						 *			}
						 *		}
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
				if ( !factory.has( name ) ) {
					/**
					 * There was a problem processing the configuration of the toolbar. The item with the given
					 * name does not exist so it was omitted when rendering the toolbar.
					 *
					 * This warning usually shows up when the {@link module:core/plugin~Plugin} which is supposed
					 * to provide a toolbar item has not been loaded or there is a typo in the configuration.
					 *
					 * Make sure the plugin responsible for this toolbar item is loaded and the toolbar configuration
					 * is correct, e.g. {@link module:basic-styles/bold~Bold} is loaded for the `'bold'` toolbar item.
					 *
					 * You can use the following snippet to retrieve all available toolbar items:
					 *
					 *		Array.from( editor.ui.componentFactory.names() );
					 *
					 * @error toolbarview-item-unavailable
					 * @param {String} name The name of the component.
					 */
					logWarning( 'toolbarview-item-unavailable', { name } );

					return false;
				}

				return true;
			} );

		const itemsToAdd = this._cleanSeparators( itemsToClean )
			// Instantiate toolbar items.
			.map( name => {
				if ( name === '|' ) {
					return new ToolbarSeparatorView();
				} else if ( name === '-' ) {
					return new ToolbarLineBreakView();
				}

				return factory.create( name );
			} );

		this.items.addMany( itemsToAdd );
	}

	/**
	 * Remove leading, trailing, and duplicated separators (`-` and `|`).
	 *
	 * @private
	 * @param {Array.<String>} items
	 */
	_cleanSeparators( items ) {
		const nonSeparatorPredicate = item => ( item !== '-' && item !== '|' );
		const count = items.length;

		// Find an index of the first item that is not a separator.
		const firstCommandItem = items.findIndex( nonSeparatorPredicate );

		// Search from the end of the list, then convert found index back to the original direction.
		const lastCommandItem = count - items
			.slice()
			.reverse()
			.findIndex( nonSeparatorPredicate );

		return items
			// Return items without the leading and trailing separators.
			.slice( firstCommandItem, lastCommandItem )
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
	 * Fired when some toolbar {@link #items} were grouped or ungrouped as a result of some change
	 * in the toolbar geometry.
	 *
	 * **Note**: This event is always fired **once** regardless of the number of items that were be
	 * grouped or ungrouped at a time.
	 *
	 * **Note**: This event is fired only if the items grouping functionality was enabled in
	 * the first place (see {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull}).
	 *
	 * @event groupedItemsUpdate
	 */
}

/**
 * An inner block of the {@link module:ui/toolbar/toolbarview~ToolbarView} hosting its
 * {@link module:ui/toolbar/toolbarview~ToolbarView#items}.
 *
 * @private
 * @extends module:ui/view~View
 */
class ItemsView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		/**
		 * A collection of items (buttons, dropdowns, etc.).
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
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
 *
 * @private
 * @implements module:ui/toolbar/toolbarview~ToolbarBehavior
 */
class StaticLayout {
	/**
	 * Creates an instance of the {@link module:ui/toolbar/toolbarview~StaticLayout} toolbar
	 * behavior.
	 *
	 * @param {module:ui/toolbar/toolbarview~ToolbarView} view An instance of the toolbar that this behavior
	 * is added to.
	 */
	constructor( view ) {
		const bind = view.bindTemplate;

		// Static toolbar can be vertical when needed.
		view.set( 'isVertical', false );

		// 1:1 pass–through binding, all ToolbarView#items are visible.
		view.itemsView.children.bindTo( view.items ).using( item => item );

		// 1:1 pass–through binding, all ToolbarView#items are focusable.
		view.focusables.bindTo( view.items ).using( item => item );

		view.extendTemplate( {
			attributes: {
				class: [
					// When vertical, the toolbar has an additional CSS class.
					bind.if( 'isVertical', 'ck-toolbar_vertical' )
				]
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {}

	/**
	 * @inheritDoc
	 */
	destroy() {}
}

/**
 * A toolbar behavior that makes the items respond to changes in the geometry.
 *
 * In a nutshell, it groups {@link module:ui/toolbar/toolbarview~ToolbarView#items}
 * that do not fit visually into a single row of the toolbar (due to limited space).
 * Items that do not fit are aggregated in a dropdown displayed at the end of the toolbar.
 *
 *	┌──────────────────────────────────────── ToolbarView ──────────────────────────────────────────┐
 *	| ┌─────────────────────────────────────── #children ─────────────────────────────────────────┐ |
 *	| |   ┌─────── #itemsView ────────┐ ┌──────────────────────┐ ┌── #groupedItemsDropdown ───┐   | |
 *	| |   |       #ungroupedItems     | | ToolbarSeparatorView | |        #groupedItems       |   | |
 *	| |   └──────────────────────────-┘ └──────────────────────┘ └────────────────────────────┘   | |
 *	| |                                  \---------- only when toolbar items overflow --------/    | |
 *	| └───────────────────────────────────────────────────────────────────────────────────────────┘ |
 *	└───────────────────────────────────────────────────────────────────────────────────────────────┘
 *
 * @private
 * @implements module:ui/toolbar/toolbarview~ToolbarBehavior
 */
class DynamicGrouping {
	/**
	 * Creates an instance of the {@link module:ui/toolbar/toolbarview~DynamicGrouping} toolbar
	 * behavior.
	 *
	 * @param {module:ui/toolbar/toolbarview~ToolbarView} view An instance of the toolbar that this behavior
	 * is added to.
	 */
	constructor( view ) {
		/**
		 * A toolbar view this behavior belongs to.
		 *
		 * @readonly
		 * @member {module:ui/toolbar~ToolbarView}
		 */
		this.view = view;

		/**
		 * A collection of toolbar children.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.viewChildren = view.children;

		/**
		 * A collection of focusable toolbar elements.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.viewFocusables = view.focusables;

		/**
		 * A view containing toolbar items.
		 *
		 * @readonly
		 * @member {module:ui/toolbar/toolbarview~ItemsView}
		 */
		this.viewItemsView = view.itemsView;

		/**
		 * Toolbar focus tracker.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.viewFocusTracker = view.focusTracker;

		/**
		 * Toolbar locale.
		 *
		 * @readonly
		 * @member {module:utils/locale~Locale}
		 */
		this.viewLocale = view.locale;

		/**
		 * Toolbar element.
		 *
		 * @readonly
		 * @member {HTMLElement} #viewElement
		 */

		/**
		 * A subset of toolbar {@link module:ui/toolbar/toolbarview~ToolbarView#items}.
		 * Aggregates items that fit into a single row of the toolbar and were not {@link #groupedItems grouped}
		 * into a {@link #groupedItemsDropdown dropdown}. Items of this collection are displayed in the
		 * {@link module:ui/toolbar/toolbarview~ToolbarView#itemsView}.
		 *
		 * When none of the {@link module:ui/toolbar/toolbarview~ToolbarView#items} were grouped, it
		 * matches the {@link module:ui/toolbar/toolbarview~ToolbarView#items} collection in size and order.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.ungroupedItems = view.createCollection();

		/**
		 * A subset of toolbar {@link module:ui/toolbar/toolbarview~ToolbarView#items}.
		 * A collection of the toolbar items that do not fit into a single row of the toolbar.
		 * Grouped items are displayed in a dedicated {@link #groupedItemsDropdown dropdown}.
		 *
		 * When none of the {@link module:ui/toolbar/toolbarview~ToolbarView#items} were grouped,
		 * this collection is empty.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.groupedItems = view.createCollection();

		/**
		 * The dropdown that aggregates {@link #groupedItems grouped items} that do not fit into a single
		 * row of the toolbar. It is displayed on demand as the last of
		 * {@link module:ui/toolbar/toolbarview~ToolbarView#children toolbar children} and offers another
		 * (nested) toolbar which displays items that would normally overflow.
		 *
		 * @readonly
		 * @member {module:ui/dropdown/dropdownview~DropdownView}
		 */
		this.groupedItemsDropdown = this._createGroupedItemsDropdown();

		/**
		 * An instance of the resize observer that helps dynamically determine the geometry of the toolbar
		 * and manage items that do not fit into a single row.
		 *
		 * **Note:** Created in {@link #_enableGroupingOnResize}.
		 *
		 * @readonly
		 * @member {module:utils/dom/resizeobserver~ResizeObserver}
		 */
		this.resizeObserver = null;

		/**
		 * A cached value of the horizontal padding style used by {@link #_updateGrouping}
		 * to manage the {@link module:ui/toolbar/toolbarview~ToolbarView#items} that do not fit into
		 * a single toolbar line. This value can be reused between updates because it is unlikely that
		 * the padding will change and re–using `Window.getComputedStyle()` is expensive.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.cachedPadding = null;

		/**
		 * A flag indicating that an items grouping update has been queued (e.g. due to the toolbar being visible)
		 * and should be executed immediately the next time the toolbar shows up.
		 *
		 * @readonly
		 * @member {Boolean}
		 */
		this.shouldUpdateGroupingOnNextResize = false;

		// Only those items that were not grouped are visible to the user.
		view.itemsView.children.bindTo( this.ungroupedItems ).using( item => item );

		// Make sure all #items visible in the main space of the toolbar are "focuscycleable".
		this.ungroupedItems.on( 'add', this._updateFocusCycleableItems.bind( this ) );
		this.ungroupedItems.on( 'remove', this._updateFocusCycleableItems.bind( this ) );

		// Make sure the #groupedItemsDropdown is also included in cycling when it appears.
		view.children.on( 'add', this._updateFocusCycleableItems.bind( this ) );
		view.children.on( 'remove', this._updateFocusCycleableItems.bind( this ) );

		// ToolbarView#items is dynamic. When an item is added or removed, it should be automatically
		// represented in either grouped or ungrouped items at the right index.
		// In other words #items == concat( #ungroupedItems, #groupedItems )
		// (in length and order).
		view.items.on( 'change', ( evt, changeData ) => {
			const index = changeData.index;

			// Removing.
			for ( const removedItem of changeData.removed ) {
				if ( index >= this.ungroupedItems.length ) {
					this.groupedItems.remove( removedItem );
				} else {
					this.ungroupedItems.remove( removedItem );
				}
			}

			// Adding.
			for ( let currentIndex = index; currentIndex < index + changeData.added.length; currentIndex++ ) {
				const addedItem = changeData.added[ currentIndex - index ];

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

		view.extendTemplate( {
			attributes: {
				class: [
					// To group items dynamically, the toolbar needs a dedicated CSS class.
					'ck-toolbar_grouping'
				]
			}
		} );
	}

	/**
	 * Enables dynamic items grouping based on the dimensions of the toolbar.
	 *
	 * @param {module:ui/toolbar/toolbarview~ToolbarView} view An instance of the toolbar that this behavior
	 * is added to.
	 */
	render( view ) {
		this.viewElement = view.element;

		this._enableGroupingOnResize();
		this._enableGroupingOnMaxWidthChange( view );
	}

	/**
	 * Cleans up the internals used by this behavior.
	 */
	destroy() {
		// The dropdown may not be in ToolbarView#children at the moment of toolbar destruction
		// so let's make sure it's actually destroyed along with the toolbar.
		this.groupedItemsDropdown.destroy();

		this.resizeObserver.destroy();
	}

	/**
	 * When called, it will check if any of the {@link #ungroupedItems} do not fit into a single row of the toolbar,
	 * and it will move them to the {@link #groupedItems} when it happens.
	 *
	 * At the same time, it will also check if there is enough space in the toolbar for the first of the
	 * {@link #groupedItems} to be returned back to {@link #ungroupedItems} and still fit into a single row
	 * without the toolbar wrapping.
	 *
	 * @protected
	 */
	_updateGrouping() {
		// Do no grouping–related geometry analysis when the toolbar is detached from visible DOM,
		// for instance before #render(), or after render but without a parent or a parent detached
		// from DOM. DOMRects won't work anyway and there will be tons of warning in the console and
		// nothing else. This happens, for instance, when the toolbar is detached from DOM and
		// some logic adds or removes its #items.
		if ( !this.viewElement.ownerDocument.body.contains( this.viewElement ) ) {
			return;
		}

		// Do not update grouping when the element is invisible. Such toolbar has DOMRect filled with zeros
		// and that would cause all items to be grouped. Instead, queue the grouping so it runs next time
		// the toolbar is visible (the next ResizeObserver callback execution). This is handy because
		// the grouping could be caused by increasing the #maxWidth when the toolbar was invisible and the next
		// time it shows up, some items could actually be ungrouped (https://github.com/ckeditor/ckeditor5/issues/6575).
		if ( !this.viewElement.offsetParent ) {
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
			this.view.fire( 'groupedItemsUpdate' );
		}
	}

	/**
	 * Returns `true` when {@link module:ui/toolbar/toolbarview~ToolbarView#element} children visually overflow,
	 * for instance if the toolbar is narrower than its members. Returns `false` otherwise.
	 *
	 * @private
	 * @type {Boolean}
	 */
	get _areItemsOverflowing() {
		// An empty toolbar cannot overflow.
		if ( !this.ungroupedItems.length ) {
			return false;
		}

		const element = this.viewElement;
		const uiLanguageDirection = this.viewLocale.uiLanguageDirection;
		const lastChildRect = new Rect( element.lastChild );
		const toolbarRect = new Rect( element );

		if ( !this.cachedPadding ) {
			const computedStyle = global.window.getComputedStyle( element );
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
	 *
	 * @private
	 */
	_enableGroupingOnResize() {
		let previousWidth;

		// TODO: Consider debounce.
		this.resizeObserver = new ResizeObserver( this.viewElement, entry => {
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
	 *
	 * @private
	 */
	_enableGroupingOnMaxWidthChange( view ) {
		view.on( 'change:maxWidth', () => {
			this._updateGrouping();
		} );
	}

	/**
	 * When called, it will remove the last item from {@link #ungroupedItems} and move it back
	 * to the {@link #groupedItems} collection.
	 *
	 * The opposite of {@link #_ungroupFirstItem}.
	 *
	 * @private
	 */
	_groupLastItem() {
		if ( !this.groupedItems.length ) {
			this.viewChildren.add( new ToolbarSeparatorView() );
			this.viewChildren.add( this.groupedItemsDropdown );
			this.viewFocusTracker.add( this.groupedItemsDropdown.element );
		}

		this.groupedItems.add( this.ungroupedItems.remove( this.ungroupedItems.last ), 0 );
	}

	/**
	 * Moves the very first item belonging to {@link #groupedItems} back
	 * to the {@link #ungroupedItems} collection.
	 *
	 * The opposite of {@link #_groupLastItem}.
	 *
	 * @private
	 */
	_ungroupFirstItem() {
		this.ungroupedItems.add( this.groupedItems.remove( this.groupedItems.first ) );

		if ( !this.groupedItems.length ) {
			this.viewChildren.remove( this.groupedItemsDropdown );
			this.viewChildren.remove( this.viewChildren.last );
			this.viewFocusTracker.remove( this.groupedItemsDropdown.element );
		}
	}

	/**
	 * Creates the {@link #groupedItemsDropdown} that hosts the members of the {@link #groupedItems}
	 * collection when there is not enough space in the toolbar to display all items in a single row.
	 *
	 * @private
	 * @returns {module:ui/dropdown/dropdownview~DropdownView}
	 */
	_createGroupedItemsDropdown() {
		const locale = this.viewLocale;
		const t = locale.t;
		const dropdown = createDropdown( locale );

		dropdown.class = 'ck-toolbar__grouped-dropdown';

		// Make sure the dropdown never sticks out to the left/right. It should be under the main toolbar.
		// (https://github.com/ckeditor/ckeditor5/issues/5608)
		dropdown.panelPosition = locale.uiLanguageDirection === 'ltr' ? 'sw' : 'se';

		addToolbarToDropdown( dropdown, [] );

		dropdown.buttonView.set( {
			label: t( 'Show more items' ),
			tooltip: true,
			tooltipPosition: locale.uiLanguageDirection === 'rtl' ? 'se' : 'sw',
			icon: verticalDotsIcon
		} );

		// 1:1 pass–through binding.
		dropdown.toolbarView.items.bindTo( this.groupedItems ).using( item => item );

		return dropdown;
	}

	/**
	 * Updates the {@link module:ui/toolbar/toolbarview~ToolbarView#focusables focus–cycleable items}
	 * collection so it represents the up–to–date state of the UI from the perspective of the user.
	 *
	 * For instance, the {@link #groupedItemsDropdown} can show up and hide but when it is visible,
	 * it must be subject to focus cycling in the toolbar.
	 *
	 * See the {@link module:ui/toolbar/toolbarview~ToolbarView#focusables collection} documentation
	 * to learn more about the purpose of this method.
	 *
	 * @private
	 */
	_updateFocusCycleableItems() {
		this.viewFocusables.clear();

		this.ungroupedItems.map( item => {
			this.viewFocusables.add( item );
		} );

		if ( this.groupedItems.length ) {
			this.viewFocusables.add( this.groupedItemsDropdown );
		}
	}
}

/**
 * Options passed to the {@link module:ui/toolbar/toolbarview~ToolbarView#constructor} of the toolbar.
 *
 * @interface module:ui/toolbar/toolbarview~ToolbarOptions
 */

/**
 * When set to `true`, the toolbar will automatically group {@link module:ui/toolbar/toolbarview~ToolbarView#items} that
 * would normally wrap to the next line when there is not enough space to display them in a single row, for
 * instance, if the parent container of the toolbar is narrow. For toolbars in absolutely positioned containers
 * without width restrictions also the {@link module:ui/toolbar/toolbarview~ToolbarOptions#isFloating} option is required to be `true`.
 *
 * See also: {@link module:ui/toolbar/toolbarview~ToolbarView#maxWidth}.
 *
 * @member {Boolean} module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull
 */

/**
 * This option should be enabled for toolbars in absolutely positioned containers without width restrictions
 * to enable automatic {@link module:ui/toolbar/toolbarview~ToolbarView#items} grouping.
 * When this option is set to `true`, the items will stop wrapping to the next line
 * and together with {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull},
 * this will allow grouping them when there is not enough space in a single row.
 *
 * @member {Boolean} module:ui/toolbar/toolbarview~ToolbarOptions#isFloating
 */

/**
 * A class interface defining the behavior of the {@link module:ui/toolbar/toolbarview~ToolbarView}.
 *
 * Toolbar behaviors extend its look and functionality and have an impact on the
 * {@link module:ui/toolbar/toolbarview~ToolbarView#element} template or
 * {@link module:ui/toolbar/toolbarview~ToolbarView#render rendering}. They can be enabled
 * conditionally, e.g. depending on the configuration of the toolbar.
 *
 * @private
 * @interface module:ui/toolbar/toolbarview~ToolbarBehavior
 */

/**
 * Creates a new toolbar behavior instance.
 *
 * The instance is created in the {@link module:ui/toolbar/toolbarview~ToolbarView#constructor} of the toolbar.
 * This is the right place to extend the {@link module:ui/toolbar/toolbarview~ToolbarView#template} of
 * the toolbar, define extra toolbar properties, etc.
 *
 * @method #constructor
 * @param {module:ui/toolbar/toolbarview~ToolbarView} view An instance of the toolbar that this behavior is added to.
 */

/**
 * A method called after the toolbar has been {@link module:ui/toolbar/toolbarview~ToolbarView#render rendered}.
 * It can be used to, for example, customize the behavior of the toolbar when its {@link module:ui/toolbar/toolbarview~ToolbarView#element}
 * is available.
 *
 * @readonly
 * @member {Function} #render
 * @param {module:ui/toolbar/toolbarview~ToolbarView} view An instance of the toolbar being rendered.
 */

/**
 * A method called after the toolbar has been {@link module:ui/toolbar/toolbarview~ToolbarView#destroy destroyed}.
 * It allows cleaning up after the toolbar behavior, for instance, this is the right place to detach
 * event listeners, free up references, etc.
 *
 * @readonly
 * @member {Function} #destroy
 */
