/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/toolbar/toolbarview
 */

/* globals console */

import View from '../view';
import Template from '../template';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '../focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import ToolbarSeparatorView from './toolbarseparatorview';
import ResizeObserver from '@ckeditor/ckeditor5-utils/src/dom/resizeobserver';
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
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * Collection of the toolbar items (like buttons).
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.items = this.createCollection();

		/**
		 * Tracks information about DOM focus in the list.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * Instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * The dropdown that aggregates items that overflow. It is displayed
		 * at the end of the toolbar and offers a nested toolbar which displays items
		 * that would normally overflow.
		 *
		 * **Note:** It is created on demand when the space in the toolbar is scarce and only
		 * if {@link #shouldGroupWhenFull} is `true`.
		 *
		 * @readonly
		 * @member {module:ui/dropdown/dropdownview~DropdownView} #overflowedItemsDropdown
		 */
		this.overflowedItemsDropdown = null;

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
		 * TODO
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
		 * Helps cycling over focusable {@link #items} in the toolbar.
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/focuscycler~FocusCycler}
		 */
		this._focusCycler = new FocusCycler( {
			focusables: this.items,
			focusTracker: this.focusTracker,
			keystrokeHandler: this.keystrokes,
			actions: {
				// Navigate toolbar items backwards using the arrow[left,up] keys.
				focusPrevious: [ 'arrowleft', 'arrowup' ],

				// Navigate toolbar items forwards using the arrow[right,down] keys.
				focusNext: [ 'arrowright', 'arrowdown' ]
			}
		} );

		/**
		 * TODO
		 *
		 * @readonly
		 * @protected
		 * @member {Boolean}
		 */
		this._updateLock = false;

		/**
		 * TODO
		 *
		 * @readonly
		 * @protected
		 * @member {Number}
		 */
		this._paddingRight = null;

		/**
		 * TODO
		 *
		 * @readonly
		 * @protected
		 * @member {}
		 */
		this._resizeObserver = null;

		/**
		 * TODO
		 *
		 * @readonly
		 * @protected
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this._components = this.createCollection();
		this._components.add( this._createItemsView() );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-toolbar',
					bind.if( 'isVertical', 'ck-toolbar_vertical' ),
					bind.if( 'shouldGroupWhenFull', 'ck-toolbar_grouping' ),
					bind.to( 'class' )
				]
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

		// Items added before rendering should be known to the #focusTracker.
		for ( const item of this.items ) {
			this.focusTracker.add( item.element );
		}

		this.items.on( 'add', ( evt, item ) => {
			this.focusTracker.add( item.element );
			this.update();
		} );

		this.items.on( 'remove', ( evt, item ) => {
			this.focusTracker.remove( item.element );
			this.update();
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
		if ( this.overflowedItemsDropdown ) {
			this.overflowedItemsDropdown.destroy();
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
	 * When called, if {@link #shouldGroupWhenFull} is `true`, it will check if any of the {@link #items} overflow
	 * and if so, it will move it to the {@link #overflowedItemsDropdown}.
	 *
	 * At the same time, it will also check if there is enough space in the toolbar for the first of the
	 * "grouped" items in the {@link #overflowedItemsDropdown} to be returned back.
	 */
	update() {
		if ( !this.shouldGroupWhenFull ) {
			return;
		}

		// Do not check when another check is going to avoid infinite loops.
		// This method is called upon adding and removing #items and it adds and removes
		// #items itself, so that would be a disaster.
		if ( this._updateLock ) {
			return;
		}

		// There's no way to check overflow when there is no element (before #render()).
		// Or when element has no parent because ClientRects won't work when #element not in DOM.
		if ( !this.element || !this.element.parentNode ) {
			return;
		}

		this._updateLock = true;

		let wereItemsGrouped;

		// Group #items as long as any overflows. This will happen, for instance,
		// when the toolbar is getting narrower and there's less and less space in it.
		while ( this._areItemsOverflowing ) {
			this._groupLastItem();

			wereItemsGrouped = true;
		}

		// If none were grouped now but there were some items already grouped before,
		// then maybe let's see if some of them can be ungrouped. This happens when,
		// for instance, the toolbar is stretching and there's more space in it than before.
		if ( !wereItemsGrouped && this._hasOverflowedItemsDropdown ) {
			// Ungroup items as long as none are overflowing or there are none to ungroup left.
			while ( this._overflowedItems.length && !this._areItemsOverflowing ) {
				this._ungroupFirstItem();
			}

			// If the ungrouping ended up with some item overflowing,
			// put it back to the group toolbar (undo the last ungroup). We don't know whether
			// an item will overflow or not until we ungroup it (that's a DOM/CSS thing) so this
			// clean–up is vital.
			if ( this._areItemsOverflowing ) {
				this._groupLastItem();
			}
		}

		this._updateLock = false;
	}

	/**
	 * TODO
	 *
	 * @protected
	 * @type {module:ui/viewcollection~ViewCollection}
	 */
	get _overflowedItems() {
		return this.overflowedItemsDropdown.toolbarView.items;
	}

	/**
	 * TODO
	 *
	 * @protected
	 * @type {Boolean}
	 */
	get _hasOverflowedItemsDropdown() {
		return this.overflowedItemsDropdown && this._components.has( this.overflowedItemsDropdown );
	}

	/**
	 * Returns `true` when any of toolbar {@link #items} overflows visually.
	 * `false` otherwise.
	 *
	 * @protected
	 * @type {Boolean}
	 */
	get _areItemsOverflowing() {
		// An empty toolbar cannot overflow.
		if ( !this.items.length ) {
			return false;
		}

		if ( !this._paddingRight ) {
			// parseInt() is essential because of quirky floating point numbers logic and DOM.
			// If the padding turned out too big because of that, the groupped items dropdown would
			// always look (from the Rect perspective) like it overflows (while it's not).
			this._paddingRight = Number.parseInt(
				global.window.getComputedStyle( this.element ).paddingRight );
		}

		const lastChildRect = new Rect( this.element.lastChild );
		const toolbarRect = new Rect( this.element );

		return lastChildRect.right > toolbarRect.right - this._paddingRight;
	}

	/**
	 * TODO
	 *
	 * @protected
	 * @returns {module:ui/view~View}
	 */
	_createItemsView() {
		const toolbarItemsView = new View( this.locale );

		toolbarItemsView.template = new Template( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-toolbar__items'
				],
			},
			children: this.items
		} );

		return toolbarItemsView;
	}

	/**
	 * Creates the {@link #overflowedItemsDropdown} on demand. Used when the space in the toolbar
	 * is scarce and some items start overflow and need grouping.
	 *
	 * See {@link #shouldGroupWhenFull}.
	 *
	 * @protected
	 * @returns {module:ui/dropdown/dropdownview~DropdownView}
	 */
	_createOverflowedItemsDropdown() {
		const t = this.t;
		const locale = this.locale;
		const overflowedItemsDropdown = createDropdown( locale );

		overflowedItemsDropdown.class = 'ck-toolbar__grouped-dropdown';
		addToolbarToDropdown( overflowedItemsDropdown, [] );

		overflowedItemsDropdown.buttonView.set( {
			label: t( 'Show more items' ),
			tooltip: true,
			icon: verticalDotsIcon
		} );

		return overflowedItemsDropdown;
	}

	/**
	 * Enables the toolbar functionality that prevents its {@link #items} from overflow
	 * when the space becomes scarce. Instead, the toolbar items are grouped under the
	 * {@link #overflowedItemsDropdown dropdown} displayed at the end of the space, which offers its own
	 * nested toolbar.
	 *
	 * When called, the toolbar will automatically analyze the location of its children and "group"
	 * them in the dropdown if necessary. It will also observe the browser window for size changes in
	 * the future and respond to them by grouping more items or reverting already grouped back to the
	 * main {@link #element}, depending on the visual space available.
	 *
	 * **Note:** Calling this method **before** the toolbar {@link #element} is in a DOM tree and visible (i.e.
	 * not `display: none`) will cause lots of warnings in the console from the utilities analyzing
	 * the geometry of the toolbar items — they depend on the toolbar to be visible in DOM.
	 */
	_enableOverflowedItemsGroupingOnResize() {
		if ( this._resizeObserver ) {
			return;
		}

		let oldRect;

		// TODO: stopObserving on destroy();
		this._resizeObserver = new ResizeObserver( ( [ entry ] ) => {
			if ( !oldRect || oldRect.width !== entry.contentRect.width ) {
				this.update();
			}

			oldRect = entry.contentRect.width;
		} ).observe( this.element );

		this.update();
	}

	/**
	 * When called it will remove the last {@link #_lastNonGroupedItem regular item} from {@link #items}
	 * and move it to the {@link #overflowedItemsDropdown}. The opposite of {@link _ungroupFirstItem}.
	 *
	 * If the dropdown does not exist or does not belong to {@link #items} it is created and located at
	 * the end of the collection.
	 *
	 * @protected
	 */
	_groupLastItem() {
		if ( !this.overflowedItemsDropdown ) {
			this.overflowedItemsDropdown = this._createOverflowedItemsDropdown();
		}

		if ( !this._hasOverflowedItemsDropdown ) {
			this._components.add( this.overflowedItemsDropdown );
		}

		this._overflowedItems.add( this.items.remove( this.items.last ), 0 );
	}

	/**
	 * Moves the very first item from the toolbar belonging to {@link #overflowedItemsDropdown} back
	 * to the {@link #items} collection.
	 *
	 * In some way, it's the opposite of {@link #_groupLastItem}.
	 *
	 * @protected
	 */
	_ungroupFirstItem() {
		this.items.add( this._overflowedItems.remove( this._overflowedItems.first ) );

		if ( !this._overflowedItems.length ) {
			this._components.remove( this.overflowedItemsDropdown );
		}
	}
}

