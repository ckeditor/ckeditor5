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
 *	┌─────────────────────────────────── ToolbarView ────────────────────────────────────────┐
 *	| ┌───────────────────────────────── #_components ─────────────────────────────────────┐ |
 *	| |   ┌──── #itemsView───────┐ ┌──────────────────────┐ ┌──#groupedItemsDropdown───┐   | |
 *	| |   |        #items        | | ToolbarSeparatorView | |      #groupedItems       |   | |
 *	| |   └─────────────────────-┘ └──────────────────────┘ └──────────────────────────┘   | |
 *	| |                            \----- only when #shouldGroupWhenFull = true -------/   | |
 *	| └────────────────────────────────────────────────────────────────────────────────────┘ |
 *	└────────────────────────────────────────────────────────────────────────────────────────┘
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
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;
		const t = this.t;

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
		 * **Note:** When {@link #shouldGroupWhenFull} is `true`, items that do not fit into a single
		 * row of a toolbar will be moved to the {@link #groupedItems} collection. Check out
		 * {@link #shouldGroupWhenFull} to learn more.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.items = this.createCollection();

		/**
		 * Collection of the toolbar items (buttons, drop–downs, etc.) that do not fit into a single
		 * row of the toolbar, created on demand when {@link #shouldGroupWhenFull} is `true`. The
		 * toolbar transfers its items between {@link #items} and this collection dynamically as
		 * the geometry changes.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.groupedItems = null;

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
		 * The dropdown that aggregates {@link #items} that do not fit into a single row of the toolbar.
		 * It is displayed at the end of the toolbar and offers another (nested) toolbar which displays
		 * items that would normally overflow. Its content corresponds to the {@link #groupedItems}
		 * collection.
		 *
		 * **Note:** Created on demand when there is not enough space in the toolbar and only
		 * if {@link #shouldGroupWhenFull} is `true`. If the geometry of the toolbar changes allowing
		 * all items in a single row again, the dropdown will hide.
		 *
		 * @readonly
		 * @member {module:ui/dropdown/dropdownview~DropdownView} #groupedItemsDropdown
		 */
		this.groupedItemsDropdown = null;

		/**
		 * A view containing toolbar {@link #items}.
		 *
		 * **Note:** When {@link #shouldGroupWhenFull} is `true`, items that do not fit into a single
		 * row of a toolbar will be moved to the {@link #groupedItemsDropdown}.
		 *
		 * @readonly
		 * @member {module:ui/toolbar/toolbarview~ToolbarItemsView}
		 */
		this.itemsView = this._createItemsView();

		/**
		 * Controls the orientation of toolbar items.
		 *
		 * @observable
		 * @member {Boolean} #isVertical
		 */
		this.set( 'isVertical', false );

		/**
		 * An additional CSS class added to the {@link #element}.
		 *
		 * @observable
		 * @member {String} #class
		 */
		this.set( 'class' );

		/**
		 * When set `true`, the toolbar will automatically group {@link #items} that would normally
		 * wrap to the next line, when there is not enough space to display them in a single row,
		 * for instance, if the parent container is narrow.
		 *
		 * Grouped items land in the {@link #groupedItemsDropdown drop–down} displayed on–demand
		 * at the end of the toolbar. When the geometry of the toolbar allows all items to be displayed
		 * in a single row again, they will be moved from the drop–down back to the main space.
		 *
		 * @observable
		 * @member {Boolean} #shouldGroupWhenFull
		 */
		this.set( 'shouldGroupWhenFull', false );

		// Grouping can be enabled before or after render.
		this.on( 'change:shouldGroupWhenFull', () => {
			if ( this.shouldGroupWhenFull ) {
				this._enableOverflowedItemsGroupingOnResize();
			}
		} );

		/**
		 * A flag used by {@link #updateGroupedItems} method to make sure no concurrent updates
		 * are performed to the {@link #items} and {@link #groupedItems}. Because {@link #updateGroupedItems}
		 * manages those collections but also is executed upon changes in those collections, this flag
		 * ensures no infinite loops occur.
		 *
		 * **Note:** Used only when {@link #shouldGroupWhenFull} is `true`.
		 *
		 * @readonly
		 * @private
		 * @member {Boolean}
		 */
		this._updateGroupedItemsLock = false;

		/**
		 * A cached value of the horizontal padding style used by {@link #updateGroupedItems}
		 * to manage the {@link #items} that do not fit into a single toolbar line. This value
		 * can be reused between updates because it is unlikely that the padding will change
		 * and re–using `Window.getComputedStyle()` is expensive.
		 *
		 * **Note:** Set only when {@link #shouldGroupWhenFull} is `true`.
		 *
		 * @readonly
		 * @protected
		 * @member {Number}
		 */
		this._horizontalPadding = null;

		/**
		 * An instance of the resize observer that helps dynamically determine the geometry of the toolbar
		 * and manage items that do not fit into a single row.
		 *
		 * **Note:** Created dynamically only when {@link #shouldGroupWhenFull} is `true`.
		 *
		 * @readonly
		 * @private
		 * @member {module:utils/dom/getresizeobserver~ResizeObserver}
		 */
		this._resizeObserver = null;

		/**
		 * A top–level collection aggregating building blocks of the toolbar. It mainly exists to
		 * make sure {@link #items} do not mix up with the {@link #groupedItemsDropdown}, which helps
		 * a lot with the {@link #shouldGroupWhenFull} logic (no re–ordering issues, exclusions, etc.).
		 *
		 * Please refer to the diagram in the documentation of the class to learn more.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this._components = this.createCollection();
		this._components.add( this.itemsView );

		/**
		 * Helps cycling over focusable {@link #items} in the toolbar residing in the {@link #itemsView}.
		 *
		 * The top–level cycling (e.g. between the items and the {@link #groupedItemsDropdown}) is
		 * handled by the {@link #_componentsFocusCycler}.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/focuscycler~FocusCycler}
		 */
		this._itemsFocusCycler = new FocusCycler( {
			focusables: this.itemsView.items,
			focusTracker: this.itemsView.focusTracker,
		} );

		/**
		 * Helps cycling over building blocks ({@link #_components}) of the toolbar, mainly over
		 * the {@link #itemsView} and the {@link #groupedItemsDropdown}.
		 *
		 * The {@link #items}–level cycling is handled by the {@link #_itemsFocusCycler}.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/focuscycler~FocusCycler}
		 */
		this._componentsFocusCycler = new FocusCycler( {
			focusables: this._components,
			focusTracker: this.focusTracker,
		} );

		this.keystrokes.set( 'arrowleft', this._focusPrevious.bind( this ) );
		this.keystrokes.set( 'arrowup', this._focusPrevious.bind( this ) );
		this.keystrokes.set( 'arrowright', this._focusNext.bind( this ) );
		this.keystrokes.set( 'arrowdown', this._focusNext.bind( this ) );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-toolbar',
					bind.if( 'isVertical', 'ck-toolbar_vertical' ),
					bind.if( 'shouldGroupWhenFull', 'ck-toolbar_grouping' ),
					bind.to( 'class' )
				],
				role: 'toolbar',
				'aria-label': bind.to( 'ariaLabel' )
			},

			children: this._components,

			on: {
				// https://github.com/ckeditor/ckeditor5-ui/issues/206
				mousedown: preventDefault( this )
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		// Components added before rendering should be known to the #focusTracker.
		for ( const component of this._components ) {
			this.focusTracker.add( component.element );
		}

		this._components.on( 'add', ( evt, component ) => {
			this.focusTracker.add( component.element );
		} );

		this._components.on( 'remove', ( evt, component ) => {
			this.focusTracker.remove( component.element );
		} );

		this.items.on( 'add', () => {
			this.updateGroupedItems();
		} );

		this.items.on( 'remove', () => {
			this.updateGroupedItems();
		} );

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		// The dropdown may not be in #items at the moment of toolbar destruction
		// so let's make sure it's actually destroyed along with the toolbar.
		if ( this.groupedItemsDropdown ) {
			this.groupedItemsDropdown.destroy();
		}

		if ( this._resizeObserver ) {
			this._resizeObserver.disconnect();
		}

		return super.destroy();
	}

	/**
	 * Focuses the first focusable in {@link #items}.
	 */
	focus() {
		this._componentsFocusCycler.focusFirst();
	}

	/**
	 * Focuses the last focusable in {@link #items}.
	 */
	focusLast() {
		const last = this._componentsFocusCycler.last;

		if ( last === this.itemsView ) {
			this.itemsView._focusCycler.focusLast();
		} else {
			this._componentsFocusCycler.focusLast();
		}
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
		config.reverse().map( name => {
			if ( name == '|' ) {
				this.items.add( new ToolbarSeparatorView(), 0 );
			} else if ( factory.has( name ) ) {
				this.items.add( factory.create( name ), 0 );
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
	 * When called, if {@link #shouldGroupWhenFull} is `true`, it will check if any of the {@link #items}
	 * do not fit into a single row of the toolbar, and it will move them to the {@link #groupedItems}
	 * when it happens.
	 *
	 * At the same time, it will also check if there is enough space in the toolbar for the first of the
	 * {@link #groupedItems} to be returned back to {@link #items} and still fit into a single row
	 * without the toolbar wrapping.
	 */
	updateGroupedItems() {
		if ( !this.shouldGroupWhenFull ) {
			return;
		}

		// Do not check when another check is going on to avoid infinite loops.
		// This method is called when adding and removing #items but at the same time it adds and removes
		// #items itself.
		if ( this._updateGroupedItemsLock ) {
			return;
		}

		// There's no way to make any decisions concerning geometry when there is no element to work with
		// (before #render()). Or when element has no parent because ClientRects won't work when
		// #element is not in DOM.
		if ( !this.element || !this.element.parentNode ) {
			return;
		}

		this._updateGroupedItemsLock = true;

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
		if ( !wereItemsGrouped && this.groupedItems && this.groupedItems.length ) {
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

		this._updateGroupedItemsLock = false;
	}

	/**
	 * Returns `true` when any of toolbar {@link #items} visually overflows, for instance if the
	 * toolbar is narrower than its members. `false` otherwise.
	 *
	 * **Note**: Technically speaking, if not for the {@link #shouldGroupWhenFull}, the items would
	 * wrap and break the toolbar into multiple rows. Overflowing is only possible when
	 *  {@link #shouldGroupWhenFull} is `true`.
	 *
	 * @protected
	 * @type {Boolean}
	 */
	get _areItemsOverflowing() {
		// An empty toolbar cannot overflow.
		if ( !this.items.length ) {
			return false;
		}

		const uiLanguageDirection = this.locale.uiLanguageDirection;
		const lastChildRect = new Rect( this.element.lastChild );
		const toolbarRect = new Rect( this.element );

		if ( !this._horizontalPadding ) {
			const computedStyle = global.window.getComputedStyle( this.element );
			const paddingProperty = uiLanguageDirection === 'ltr' ? 'paddingRight' : 'paddingLeft';

			// parseInt() is essential because of quirky floating point numbers logic and DOM.
			// If the padding turned out too big because of that, the grouped items dropdown would
			// always look (from the Rect perspective) like it overflows (while it's not).
			this._horizontalPadding = Number.parseInt( computedStyle[ paddingProperty ] );
		}

		if ( uiLanguageDirection === 'ltr' ) {
			return lastChildRect.right > toolbarRect.right - this._horizontalPadding;
		} else {
			return lastChildRect.left < toolbarRect.left + this._horizontalPadding;
		}
	}

	/**
	 * Creates the {@link #itemsView} that hosts the members of the {@link #items} collection.
	 *
	 * @protected
	 * @returns {module:ui/view~View}
	 */
	_createItemsView() {
		const itemsView = new ToolbarItemsView( this.locale );

		// 1:1 pass–through binding.
		itemsView.items.bindTo( this.items ).using( item => item );

		return itemsView;
	}

	/**
	 * Creates the {@link #groupedItemsDropdown} that hosts the members of the {@link #groupedItems}
	 * collection when there is not enough space in the toolbar to display all items in a single row.
	 *
	 * **Note:** Invoked on demand. See {@link #shouldGroupWhenFull} to learn more.
	 *
	 * @protected
	 * @returns {module:ui/dropdown/dropdownview~DropdownView}
	 */
	_createOverflowedItemsDropdown() {
		const t = this.t;
		const locale = this.locale;
		const groupedItemsDropdown = createDropdown( locale );

		groupedItemsDropdown.class = 'ck-toolbar__grouped-dropdown';
		addToolbarToDropdown( groupedItemsDropdown, [] );

		groupedItemsDropdown.buttonView.set( {
			label: t( 'Show more items' ),
			tooltip: true,
			icon: verticalDotsIcon
		} );

		this.groupedItems = groupedItemsDropdown.toolbarView.items;

		return groupedItemsDropdown;
	}

	/**
	 * Handles forward keyboard navigation in the toolbar.
	 *
	 * Because the internal structure of the toolbar has 2 levels, this cannot be handled
	 * by a simple {@link module:ui/focuscycler~FocusCycler} instance.
	 *
	 *	┌────────────────────────────── #_components ────────────────────────────────────────┐
	 *	|                                                                                    |
	 *	|    /────▶────\                  /───────▶───────▶───────\          /────▶─────\    |
	 *	|    |         ▼                  ▲                       ▼          ▲          |    |
	 *	|    |       ┌─|──── #items ──────|─┐             ┌───────|──────────|───────┐  |    |
	 *	|    ▲       | \───▶──────────▶───/ |             |   #groupedItemsDropdown  |  ▼    |
	 *	|    |       └─────────────────────-┘             └──────────────────────────┘  |    |
	 *	|    |                                                                          |    |
	 *	|    └─────◀───────────◀────────────◀──────────────◀──────────────◀─────────────/    |
	 *	|                                                                                    |
	 *	+────────────────────────────────────────────────────────────────────────────────────┘
	 */
	_focusNext( keyEvtData, cancel ) {
		if ( this.itemsView.focusTracker.isFocused ) {
			if ( !this._itemsFocusCycler.next || this._itemsFocusCycler.next === this._itemsFocusCycler.first ) {
				this._componentsFocusCycler.focusNext();
			} else {
				this._itemsFocusCycler.focusNext();
			}

			cancel();
		} else {
			this._componentsFocusCycler.focusNext();

			cancel();
		}
	}

	/**
	 * Handles backward keyboard navigation in the toolbar.
	 *
	 * Because the internal structure of the toolbar has 2 levels, this cannot be handled
	 * by a simple {@link module:ui/focuscycler~FocusCycler} instance.
	 *
	 *	┌────────────────────────────── #_components ────────────────────────────────────────┐
	 *	|                                                                                    |
	 *	|    /────◀────\                  /───────◀───────◀───────\          /────◀─────\    |
	 *	|    |         ▲                  ▼                       ▲          ▼          |    |
	 *	|    |       ┌─|──── #items ──────|─┐             ┌───────|──────────|───────┐  |    |
	 *	|    ▼       | \───◀──────────◀───/ |             |   #groupedItemsDropdown  |  ▲    |
	 *	|    |       └─────────────────────-┘             └──────────────────────────┘  |    |
	 *	|    |                                                                          |    |
	 *	|    └─────▶───────────▶────────────▶──────────────▶──────────────▶─────────────/    |
	 *	|                                                                                    |
	 *	+────────────────────────────────────────────────────────────────────────────────────┘
	 */
	_focusPrevious( keyEvtData, cancel ) {
		if ( this.itemsView.focusTracker.isFocused ) {
			if ( !this._itemsFocusCycler.next || this._itemsFocusCycler.previous === this._itemsFocusCycler.last ) {
				const hasGroupedItemsDropdown = this.groupedItemsDropdown && this._components.has( this.groupedItemsDropdown );

				if ( hasGroupedItemsDropdown ) {
					this._componentsFocusCycler.focusLast();
				} else {
					this._itemsFocusCycler.focusPrevious();
				}
			} else {
				this._itemsFocusCycler.focusPrevious();
			}

			cancel();
		} else {
			if ( this._componentsFocusCycler.previous === this.itemsView ) {
				this._itemsFocusCycler.focusLast();
			} else {
				this._componentsFocusCycler.focusPrevious();
			}

			cancel();
		}
	}

	/**
	 * Enables the toolbar functionality that prevents its {@link #items} from overflowing (wrapping
	 * to the next row) when the space becomes scarce. Instead, the toolbar items are moved to the
	 * {@link #groupedItems} collection and displayed in a {@link #groupedItemsDropdown} at the end of
	 * the space, which has its own nested toolbar.
	 *
	 * When called, the toolbar will automatically analyze the location of its {@link #items} and "group"
	 * them in the dropdown if necessary. It will also observe the browser window for size changes in
	 * the future and respond to them by grouping more items or reverting already grouped back, depending
	 * on the visual space available.
	 *
	 * **Note:** Calling this method **before** the toolbar {@link #element} is in a DOM tree and visible (i.e.
	 * not `display: none`) will cause lots of warnings in the console from the utilities analyzing
	 * the geometry of the toolbar items — they depend on the toolbar to be visible in DOM.
	 */
	_enableOverflowedItemsGroupingOnResize() {
		if ( this._resizeObserver ) {
			return;
		}

		let previousWidth;

		this._resizeObserver = getResizeObserver( ( [ entry ] ) => {
			if ( !previousWidth || previousWidth.width !== entry.contentRect.width ) {
				this.updateGroupedItems();
			}

			previousWidth = entry.contentRect.width;
		} );

		this._resizeObserver.observe( this.element );

		this.updateGroupedItems();
	}

	/**
	 * The opposite of {@link #_ungroupFirstItem}.
	 *
	 * When called it will remove the last item from {@link #items} and move it to the
	 * {@link #groupedItems} collection (from {@link #itemsView} to {@link #groupedItemsDropdown}).
	 *
	 * If the {@link #groupedItemsDropdown} does not exist, it is created and added to {@link #_components}.
	 *
	 * @protected
	 */
	_groupLastItem() {
		if ( !this.groupedItemsDropdown ) {
			this.groupedItemsDropdown = this._createOverflowedItemsDropdown();
		}

		if ( !this._components.has( this.groupedItemsDropdown ) ) {
			this._components.add( new ToolbarSeparatorView() );
			this._components.add( this.groupedItemsDropdown );
		}

		this.groupedItems.add( this.items.remove( this.items.last ), 0 );
	}

	/**
	 * The opposite of {@link #_groupLastItem}.
	 *
	 * Moves the very first item from the toolbar belonging to {@link #groupedItems} back
	 * to the {@link #items} collection (from {@link #groupedItemsDropdown} to {@link #itemsView}).
	 *
	 * @protected
	 */
	_ungroupFirstItem() {
		this.items.add( this.groupedItems.remove( this.groupedItems.first ) );

		if ( !this.groupedItems.length ) {
			this._components.remove( this.groupedItemsDropdown );
			this._components.remove( this._components.last );
		}
	}
}

/**
 * An inner block of the {@link module:ui/toolbar/toolbarview~ToolbarView} hosting its
 * {@link module:ui/toolbar/toolbarview~ToolbarView#items}.
 *
 * @private
 * @extends module:ui/view~View
 */
class ToolbarItemsView extends View {
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

		/**
		 * Tracks information about DOM focus in the items view.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * Helps cycling over focusable {@link #items} in the toolbar.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/focuscycler~FocusCycler}
		 */
		this._focusCycler = new FocusCycler( {
			focusables: this.items,
			focusTracker: this.focusTracker,
		} );

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

	/**
	 * @inheritDoc
	 */
	render() {
		super.render();

		for ( const item of this.items ) {
			this.focusTracker.add( item.element );
		}

		this.items.on( 'add', ( evt, item ) => {
			this.focusTracker.add( item.element );
		} );

		this.items.on( 'remove', ( evt, item ) => {
			this.focusTracker.remove( item.element );
		} );
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
}
