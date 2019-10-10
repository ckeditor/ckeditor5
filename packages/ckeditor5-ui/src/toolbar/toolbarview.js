/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/toolbar/toolbarview
 */

/* globals console */

import View from '../view';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '../focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import ToolbarSeparatorView from './toolbarseparatorview';
import getResizeObserver from '@ckeditor/ckeditor5-utils/src/dom/getresizeobserver';
import preventDefault from '../bindings/preventdefault.js';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { createDropdown, addToolbarToDropdown } from '../dropdown/utils';
import { attachLinkToDocumentation } from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import verticalDotsIcon from '@ckeditor/ckeditor5-core/theme/icons/three-vertical-dots.svg';

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
		 * Collection of the toolbar items (buttons, drop–downs, etc.).
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.items = this.createCollection();

		/**
		 * Tracks information about DOM focus in the toolbar.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}
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
		 * A view containing {@link #_ungroupedItems ungrouped toolbar items} (as opposed to the
		 * {@link #_groupedItemsDropdown} containing {@link #_groupedItems grouped toolbar items}).
		 *
		 * See the {@link #_itemsManager} to learn more.
		 *
		 * @private
		 * @readonly
		 * @member {module:ui/toolbar/toolbarview~ItemsView}
		 */
		this._itemsView = this._createItemsView();

		/**
		 * A top–level collection aggregating building blocks of the toolbar. It mainly exists to
		 * make sure {@link #_ungroupedItems} do not mix up with the {@link #_groupedItemsDropdown}.
		 *
		 * It helps a lot when the {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull grouping}
		 * logic is on (no re–ordering issues, exclusions, etc.).
		 *
		 *	┌───────────────────────────────────────── ToolbarView ──────────────────────────────────────────┐
		 *	| ┌─────────────────────────────────────── #components ───────────────────────────────────────┐ |
		 *	| |   ┌────── #_itemsView ────────┐ ┌──────────────────────┐ ┌── #_groupedItemsDropdown ───┐   | |
		 *	| |   |     #_ungroupedItems      | | ToolbarSeparatorView | |        #_groupedItems       |   | |
		 *	| |   └──────────────────────────-┘ └──────────────────────┘ └─────────────────────────────┘   | |
		 *	| |                                  \--------- only when toolbar items overflow ---------/    | |
		 *	| └────────────────────────────────────────────────────────────────────────────────────────────┘ |
		 *	└────────────────────────────────────────────────────────────────────────────────────────────────┘
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.components = this.createCollection();
		this.components.add( this._itemsView );

		/**
		 * A helper collection that aggregates a subset of {@link #items} that is subject to the focus cycling
		 * (e.g. navigation using the keyboard).
		 *
		 * It contains all the items from {@link #_ungroupedItems} plus (optionally) the {@link #_groupedItemsDropdown}
		 * at the end.
		 *
		 * This collection is dynamic and responds to the changes in {@link #_ungroupedItems} and {@link #components}
		 * so the {@link #_focusCycler focus cycler} logic operates on the up–to–date collection of items that
		 * are actually available for the user to focus and navigate at this particular moment.
		 *
		 * This collection is necessary because the {@link #_itemsManager} can dynamically change the content
		 * of the {@link #_ungroupedItems} and also spontaneously display the {@link #_groupedItemsDropdown}
		 * (also focusable and "cycleable").
		 *
		 * @private
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.focusables = this.createCollection();

		/**
		 * Helps cycling over focusable {@link #items} in the toolbar.
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

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-toolbar',
					bind.to( 'class' )
				],
				role: 'toolbar',
				'aria-label': bind.to( 'ariaLabel' )
			},

			children: this.components,

			on: {
				// https://github.com/ckeditor/ckeditor5-ui/issues/206
				mousedown: preventDefault( this )
			}
		} );

		/**
		 * An instance of the utility responsible for managing the toolbar {@link #items}.
		 *
		 * For instance, it controls which of the {@link #items} should be {@link #_ungroupedItems ungrouped} or
		 * {@link #_groupedItems grouped} depending on the configuration of the toolbar and its geometry.
		 *
		 * **Note**: The instance is created upon {@link #render} when the {@link #element} of the toolbar
		 * starts to exist.
		 *
		 * @private
		 * @readonly
		 * @member {module:ui/toolbar/toolbarview~DynamicGrouping}
		 */
		this._extension = this.options.shouldGroupWhenFull ? new DynamicGrouping( this ) : new VerticalLayout( this );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		// Components added before rendering should be known to the #focusTracker.
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

		this._extension.render();
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this._extension.destroy();

		return super.destroy();
	}

	/**
	 * Focuses the first focusable in {@link #items}.
	 */
	focus() {
		this._focusCycler.focusFirst();
	}

	/**
	 * Focuses the last focusable in {@link #items}.
	 */
	focusLast() {
		this._focusCycler.focusLast();
	}

	/**
	 * A utility which expands a plain toolbar configuration into
	 * {@link module:ui/toolbar/toolbarview~ToolbarView#items} using a given component factory.
	 *
	 * @param {Array.<String>} config The toolbar items config.
	 * @param {module:ui/componentfactory~ComponentFactory} factory A factory producing toolbar items.
	 */
	fillFromConfig( config, factory ) {
		// The toolbar is filled in in the reverse order for the toolbar grouping to work properly.
		// If we filled it in in the natural order, items that overflow would be grouped
		// in a revere order.
		config.map( name => {
			if ( name == '|' ) {
				this.items.add( new ToolbarSeparatorView() );
			} else if ( factory.has( name ) ) {
				this.items.add( factory.create( name ) );
			} else {
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
				console.warn( attachLinkToDocumentation(
					'toolbarview-item-unavailable: The requested toolbar item is unavailable.' ), { name } );
			}
		} );
	}

	/**
	 * Creates the {@link #_itemsView} that hosts the members of the {@link #_ungroupedItems} collection.
	 *
	 * @private
	 * @returns {module:ui/toolbar/toolbarview~ItemsView}
	 */
	_createItemsView() {
		const ungrouppedItemsView = new ItemsView( this.locale );

		return ungrouppedItemsView;
	}
}

/**
 * An inner block of the {@link module:ui/toolbar/toolbarview~ToolbarView} hosting its
 * {@link module:ui/toolbar/toolbarview~ToolbarView#_ungroupedItems ungrouped items}.
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
		 * Collection of the items (buttons, drop–downs, etc.).
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.items = this.createCollection();

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-toolbar__items'
				],
			},
			children: this.items
		} );
	}
}

class VerticalLayout {
	constructor( view ) {
		this.view = view;

		const bind = this.view.bindTemplate;

		/**
		 * Controls the orientation of toolbar items.
		 *
		 * @observable
		 * @member {Boolean} #isVertical
		 */
		view.set( 'isVertical', false );

		// 1:1 pass–through binding.
		view.focusables.bindTo( view.items ).using( item => item );

		// 1:1 pass–through binding.
		view._itemsView.items.bindTo( view.items ).using( item => item );

		view.extendTemplate( {
			attributes: {
				class: [
					bind.if( 'isVertical', 'ck-toolbar_vertical' )
				]
			}
		} );
	}

	render() {}

	destroy() {}
}

/**
 * A helper class that manages the presentation layer of the {@link module:ui/toolbar/toolbarview~ToolbarView}.
 *
 * In a nutshell, it distributes the toolbar {@link module:ui/toolbar/toolbarview~ToolbarView#items}
 * among its {@link module:ui/toolbar/toolbarview~ToolbarView#_groupedItems} and
 * {@link module:ui/toolbar/toolbarview~ToolbarView#_ungroupedItems}
 * depending on the configuration of the toolbar, the geometry and the number of items.
 *
 * @private
 */
class DynamicGrouping {
	/**
	 * Creates an instance of the {@link module:ui/toolbar/toolbarview~DynamicGrouping} class.
	 *
	 * @param {Object} options The configuration of the helper.
	 * @param {Boolean} options.shouldGroupWhenFull Corresponds to
	 * {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull}.
	 * @param {module:ui/viewcollection~ViewCollection} options.items Corresponds to
	 * {@link module:ui/toolbar/toolbarview~ToolbarView#items}.
	 * @param {module:ui/viewcollection~ViewCollection} options._ungroupedItems Corresponds to
	 * {@link module:ui/toolbar/toolbarview~ToolbarView#_ungroupedItems}.
	 * @param {module:ui/viewcollection~ViewCollection} options._groupedItems Corresponds to
	 * {@link module:ui/toolbar/toolbarview~ToolbarView#_groupedItems}/
	 * @param {HTMLElement} options.element Corresponds to {@link module:ui/toolbar/toolbarview~ToolbarView#element}.
	 * @param {String} options.uiLanguageDirection Corresponds to {@link module:utils/locale~Locale#uiLanguageDirection}.
	 * @param {Function} options.onGroupStart Executed when the first ungrouped toolbar item gets grouped.
	 * @param {Function} options.onGroupEnd Executed when the last of the grouped toolbar items just got ungrouped.
	 */
	constructor( view ) {
		this.view = view;

		/**
		 * A subset of of toolbar {@link #items}. Aggregates items that fit into a single row of the toolbar
		 * and were not {@link #_groupedItems grouped} into a {@link #_groupedItemsDropdown dropdown}.
		 * Items of this collection are displayed in a {@link #_itemsView dedicated view}.
		 *
		 * When none of the {@link #items} were grouped, it matches the {@link #items} collection in size and order.
		 *
		 * **Note**: Grouping occurs only when the toolbar was
		 * {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull configured}.
		 *
		 * See the {@link #_itemsManager} to learn more.
		 *
		 * @private
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this._ungroupedItems = view.createCollection();

		/**
		 * A subset of of toolbar {@link #items}. A collection of the toolbar items that do not fit into a
		 * single row of the toolbar. Grouped items are displayed in a dedicated {@link #_groupedItemsDropdown dropdown}.
		 *
		 * When none of the {@link #items} were grouped, this collection is empty.
		 *
		 * **Note**: Grouping occurs only when the toolbar was
		 * {@link module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull configured}.
		 *
		 * See the {@link #_itemsManager} to learn more.
		 *
		 * @private
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this._groupedItems = view.createCollection();

		/**
		 * The dropdown that aggregates {@link #_groupedItems grouped items} that do not fit into a single
		 * row of the toolbar. It is displayed on demand at the end of the toolbar and offers another
		 * (nested) toolbar which displays items that would normally overflow.
		 *
		 * See the {@link #_itemsManager} to learn more.
		 *
		 * @private
		 * @readonly
		 * @member {module:ui/dropdown/dropdownview~DropdownView}
		 */
		this._groupedItemsDropdown = this._createGrouppedItemsDropdown();

		/**
		 * An instance of the resize observer that helps dynamically determine the geometry of the toolbar
		 * and manage items that do not fit into a single row.
		 *
		 * **Note:** Created dynamically in {@link #_enableGroupingOnResize}.
		 *
		 * @readonly
		 * @private
		 * @member {module:utils/dom/getresizeobserver~ResizeObserver}
		 */
		this._resizeObserver = null;

		/**
		 * A flag used by {@link #_updateGrouping} method to make sure no concurrent updates
		 * are performed to the {@link #_ungroupedItems} and {@link #_groupedItems}. Because {@link #_updateGrouping}
		 * manages those collections but also is executed upon changes in those collections, this flag
		 * ensures no infinite loops occur.
		 *
		 * **Note:** Used only if {@link #_enableGroupingOnResize} was called.
		 *
		 * @readonly
		 * @private
		 * @member {Boolean}
		 */
		this._updateLock = false;

		/**
		 * A cached value of the horizontal padding style used by {@link #_updateGrouping}
		 * to manage the {@link #items} that do not fit into a single toolbar line. This value
		 * can be reused between updates because it is unlikely that the padding will change
		 * and re–using `Window.getComputedStyle()` is expensive.
		 *
		 * **Note:** In use only after {@link #_enableGroupingOnResize} was called.
		 *
		 * @readonly
		 * @private
		 * @member {Number}
		 */
		this._cachedPadding = null;

		// 1:1 pass–through binding.
		view._itemsView.items.bindTo( this._ungroupedItems ).using( item => item );

		// Make sure all #items visible in the main space of the toolbar are cycleable.
		this._ungroupedItems.on( 'add', this._updateFocusCycleableItems.bind( this ) );
		this._ungroupedItems.on( 'remove', this._updateFocusCycleableItems.bind( this ) );

		// Make sure the #_groupedItemsDropdown is also included in cycling when it appears.
		view.components.on( 'add', this._updateFocusCycleableItems.bind( this ) );
		view.components.on( 'remove', this._updateFocusCycleableItems.bind( this ) );

		// ToolbarView#items is dynamic. When an item is added, it should be automatically
		// represented in either grouped or ungrouped items at the right index.
		// In other words #items == concat( #_ungroupedItems, #_groupedItems )
		// (in length and order).
		view.items.on( 'add', ( evt, item, index ) => {
			if ( index > this._ungroupedItems.length ) {
				this._groupedItems.add( item, index - this._ungroupedItems.length );
			} else {
				this._ungroupedItems.add( item, index );
			}

			// When a new ungrouped item joins in and lands in #_ungroupedItems, there's a chance it causes
			// the toolbar to overflow.
			this._updateGrouping();
		} );

		// When an item is removed from ToolbarView#items, it should be automatically
		// removed from either grouped or ungrouped items.
		view.items.on( 'remove', ( evt, item, index ) => {
			if ( index > this._ungroupedItems.length ) {
				this._groupedItems.remove( item );
			} else {
				this._ungroupedItems.remove( item );
			}

			// Whether removed from grouped or ungrouped items, there is a chance
			// some new space is available and we could do some ungrouping.
			this._updateGrouping();
		} );

		view.extendTemplate( {
			attributes: {
				class: [
					'ck-toolbar_grouping'
				]
			}
		} );
	}

	render() {
		this._enableGroupingOnResize();
	}

	/**
	 * Cleans up after the manager when its parent toolbar is destroyed.
	 */
	destroy() {
		// The dropdown may not be in #components at the moment of toolbar destruction
		// so let's make sure it's actually destroyed along with the toolbar.
		this._groupedItemsDropdown.destroy();

		this._resizeObserver.disconnect();
	}

	/**
	 * When called, it will check if any of the {@link #_ungroupedItems} do not fit into a single row of the toolbar,
	 * and it will move them to the {@link #_groupedItems} when it happens.
	 *
	 * At the same time, it will also check if there is enough space in the toolbar for the first of the
	 * {@link #_groupedItems} to be returned back to {@link #_ungroupedItems} and still fit into a single row
	 * without the toolbar wrapping.
	 */
	_updateGrouping() {
		// Do not check when another check is going on to avoid infinite loops.
		// This method is called when adding and removing #items but at the same time it adds and removes
		// #items itself.
		if ( this._updateLock ) {
			return;
		}

		const view = this.view;

		// Do no grouping–related geometry analysis when the toolbar is detached from visible DOM,
		// for instance before #render(), or after render but without a parent or a parent detached
		// from DOM. DOMRects won't work anyway and there will be tons of warning in the console and
		// nothing else.
		if ( !view.element.ownerDocument.body.contains( view.element ) ) {
			return;
		}

		this._updateLock = true;

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
		if ( !wereItemsGrouped && this._groupedItems && this._groupedItems.length ) {
			// Ungroup items as long as none are overflowing or there are none to ungroup left.
			while ( this._groupedItems.length && !this._areItemsOverflowing ) {
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

		this._updateLock = false;
	}

	/**
	 * Enables the functionality that prevents {@link #_ungroupedItems} from overflowing
	 * (wrapping to the next row) when there is little space available. Instead, the toolbar items are moved to the
	 * {@link #_groupedItems} collection and displayed in a dropdown at the end of the space, which has its own nested toolbar.
	 *
	 * When called, the toolbar will automatically analyze the location of its {@link #_ungroupedItems} and "group"
	 * them in the dropdown if necessary. It will also observe the browser window for size changes in
	 * the future and respond to them by grouping more items or reverting already grouped back, depending
	 * on the visual space available.
	 */
	_enableGroupingOnResize() {
		const view = this.view;

		let previousWidth;

		// TODO: Consider debounce.
		this._resizeObserver = getResizeObserver( ( [ entry ] ) => {
			if ( !previousWidth || previousWidth !== entry.contentRect.width ) {
				this._updateGrouping();

				previousWidth = entry.contentRect.width;
			}
		} );

		this._resizeObserver.observe( view.element );

		this._updateGrouping();
	}

	/**
	 * Returns `true` when {@link #element} children visually overflow, for instance if the
	 * toolbar is narrower than its members. `false` otherwise.
	 *
	 * @type {Boolean}
	 */
	get _areItemsOverflowing() {
		// An empty toolbar cannot overflow.
		if ( !this._ungroupedItems.length ) {
			return false;
		}

		const view = this.view;
		const element = view.element;
		const uiLanguageDirection = view.locale.uiLanguageDirection;
		const lastChildRect = new Rect( element.lastChild );
		const toolbarRect = new Rect( element );

		if ( !this._cachedPadding ) {
			const computedStyle = global.window.getComputedStyle( element );
			const paddingProperty = uiLanguageDirection === 'ltr' ? 'paddingRight' : 'paddingLeft';

			// parseInt() is essential because of quirky floating point numbers logic and DOM.
			// If the padding turned out too big because of that, the grouped items dropdown would
			// always look (from the Rect perspective) like it overflows (while it's not).
			this._cachedPadding = Number.parseInt( computedStyle[ paddingProperty ] );
		}

		if ( uiLanguageDirection === 'ltr' ) {
			return lastChildRect.right > toolbarRect.right - this._cachedPadding;
		} else {
			return lastChildRect.left < toolbarRect.left + this._cachedPadding;
		}
	}

	/**
	 * The opposite of {@link #_ungroupFirstItem}.
	 *
	 * When called it will remove the last item from {@link #_ungroupedItems} and move it to the
	 * {@link #_groupedItems} collection.
	 *
	 * @protected
	 */
	_groupLastItem() {
		const view = this.view;

		if ( !this._groupedItems.length ) {
			view.components.add( new ToolbarSeparatorView() );
			view.components.add( this._groupedItemsDropdown );
			view.focusTracker.add( this._groupedItemsDropdown.element );
		}

		this._groupedItems.add( this._ungroupedItems.remove( this._ungroupedItems.last ), 0 );
	}

	/**
	 * The opposite of {@link #_groupLastItem}.
	 *
	 * Moves the very first item from the toolbar belonging to {@link #_groupedItems} back
	 * to the {@link #_ungroupedItems} collection.
	 *
	 * @protected
	 */
	_ungroupFirstItem() {
		const view = this.view;

		this._ungroupedItems.add( this._groupedItems.remove( this._groupedItems.first ) );

		if ( !this._groupedItems.length ) {
			view.components.remove( this._groupedItemsDropdown );
			view.components.remove( view.components.last );
			view.focusTracker.remove( this._groupedItemsDropdown.element );
		}
	}

	/**
	 * Creates the {@link #_groupedItemsDropdown} that hosts the members of the {@link #_groupedItems}
	 * collection when there is not enough space in the toolbar to display all items in a single row.
	 *
	 * @private
	 * @returns {module:ui/dropdown/dropdownview~DropdownView}
	 */
	_createGrouppedItemsDropdown() {
		const view = this.view;
		const t = view.t;
		const locale = view.locale;
		const _groupedItemsDropdown = createDropdown( locale );

		_groupedItemsDropdown.class = 'ck-toolbar__grouped-dropdown';
		addToolbarToDropdown( _groupedItemsDropdown, [] );

		_groupedItemsDropdown.buttonView.set( {
			label: t( 'Show more items' ),
			tooltip: true,
			icon: verticalDotsIcon
		} );

		// 1:1 pass–through binding.
		_groupedItemsDropdown.toolbarView.items.bindTo( this._groupedItems ).using( item => item );

		return _groupedItemsDropdown;
	}

	/**
	 * A method that updates the {@link #focusables focus–cycleable items}
	 * collection so it represents the up–to–date state of the UI from the perspective of the user.
	 *
	 * See the {@link #focusables collection} documentation to learn more about the purpose
	 * of this method.
	 *
	 * @private
	 */
	_updateFocusCycleableItems() {
		const view = this.view;

		view.focusables.clear();

		this._ungroupedItems.map( item => {
			view.focusables.add( item );
		} );

		if ( this._groupedItems.length ) {
			view.focusables.add( this._groupedItemsDropdown );
		}
	}
}

/**
 * Options passed to the {@link module:ui/toolbar/toolbarview~ToolbarView#constructor} of the toolbar.
 *
 * @interface module:ui/toolbar/toolbarview~ToolbarOptions
 */

/**
 * When set `true`, the toolbar will automatically group {@link module:ui/toolbar/toolbarview~ToolbarView#items} that
 * would normally wrap to the next line when there is not enough space to display them in a single row, for
 * instance, if the parent container is narrow.
 *
 * @member {Boolean} module:ui/toolbar/toolbarview~ToolbarOptions#shouldGroupWhenFull
 */
