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
import preventDefault from '../bindings/preventdefault.js';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
import global from '@ckeditor/ckeditor5-utils/src/dom/global';
import { createDropdown, addToolbarToDropdown } from '../dropdown/utils';
import { attachLinkToDocumentation } from '@ckeditor/ckeditor5-utils/src/ckeditorerror';
import verticalDotsIcon from '@ckeditor/ckeditor5-core/theme/icons/three-vertical-dots.svg';

import '../../theme/components/toolbar/toolbar.css';

// This is the offset for the enableWrappedItemsGroupping() method. It estimates the width of the
// scrollbar. There's no way to tell when the vertical page scrollbar appears using the DOM API so
// when wrapping toolbar items to the next line we must consider it may show up at any time
// (e.g. user wrote more content). This is the h–distance the scrollbar will consume when it appears.
const SUDDEN_SCROLL_SAFETY_OFFSET = 25;

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
		 * The dropdown that aggregates items that wrap to the next line. It is displayed
		 * at the end of the toolbar and offers a nested toolbar which displays items
		 * that would normally be wrapped to the next line.
		 *
		 * **Note:** It is created on demand when the space in the toolbar is scarce and only
		 * if {@link #enableWrappedItemsGroupping} has been called for this dropdown.
		 *
		 * @readonly
		 * @member {module:ui/dropdown/dropdownview~DropdownView} #wrappedItemsDropdown
		 */
		this.wrappedItemsDropdown = null;

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
		 * A map that connects views belonging to {@link #items} with their Rects.
		 *
		 * It makes sense only when {@link #enableWrappedItemsGroupping} has been used.
		 * When a toolbar item lands in the {@link #wrappedItemsDropdown}, it saves the item's
		 * DOM rect so the algorithm can use it later on to decide if that particular item
		 * can be "ungroupped" from the dropdown when there's enough space in the toolbar.
		 *
		 * Because "groupped" items in the dropdown are invisible, their Rects cannot be obtained, so
		 * decision about their location is made using the Rect cached in this map beforehand.
		 *
		 * @readonly
		 * @private
		 * @member {Map.<module:ui/view~View,module:utils/dom/rect~Rect>}
		 */
		this._grouppedItemRects = new Map();

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-toolbar',
					bind.if( 'isVertical', 'ck-toolbar_vertical' ),
					bind.to( 'class' )
				]
			},

			children: this.items,

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
		} );

		this.items.on( 'remove', ( evt, item ) => {
			this.focusTracker.remove( item.element );
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
		if ( this.wrappedItemsDropdown ) {
			this.wrappedItemsDropdown.destroy();
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
	 * Enables the toolbar functionality that prevents its {@link #items} from wrapping to the next line
	 * when the space becomes scarce. Instead, the toolbar items are grouped under the
	 * {@link #wrappedItemsDropdown dropdown} displayed at the end of the space, which offers its own
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
	enableWrappedItemsGroupping() {
		this._checkItemsWrappingAndUnwrapping();

		this.listenTo( global.window, 'resize', () => {
			this._checkItemsWrappingAndUnwrapping();
		} );
	}

	/**
	 * Returns the last of {@link #items} which is not {@link #wrappedItemsDropdown}.
	 *
	 * @protected
	 */
	get _lastRegularItem() {
		if ( this._isWrappedItemsDropdownInItems ) {
			if ( this.items.length > 1 ) {
				return this.items.get( this.items.length - 2 );
			} else {
				return null;
			}
		} else {
			if ( this.items.length ) {
				return this.items.last;
			} else {
				return null;
			}
		}
	}

	/**
	 * Returns `true` when {@link #wrappedItemsDropdown} exists and currently is in {@link #items}.
	 * `false` otherwise.
	 *
	 * @protected
	 */
	get _isWrappedItemsDropdownInItems() {
		return this.wrappedItemsDropdown && this.items.has( this.wrappedItemsDropdown );
	}

	/**
	 * Creates the {@link #wrappedItemsDropdown} on demand. Used when the space in the toolbar
	 * is scarce and some items start wrapping and need grouping.
	 *
	 * See {@link #_groupLastRegularItem}.
	 *
	 * @protected
	 */
	_createWrappedItemsDropdown() {
		const t = this.t;
		const locale = this.locale;

		this.wrappedItemsDropdown = createDropdown( locale );
		this.wrappedItemsDropdown.class = 'ck-toolbar__groupped-dropdown';
		addToolbarToDropdown( this.wrappedItemsDropdown, [] );

		this.wrappedItemsDropdown.buttonView.set( {
			label: t( 'Show more items' ),
			tooltip: true,
			icon: verticalDotsIcon
		} );
	}

	/**
	 * When called it will remove the last {@link #_lastRegularItem regular item} from {@link #items}
	 * and move it to the {@link #wrappedItemsDropdown}.
	 *
	 * If the dropdown does not exist or does not
	 * belong to {@link #items} it is created and located at the end of the collection.
	 *
	 * @protected
	 */
	_groupLastRegularItem() {
		// Add the groupped list dropdown if not already there.
		if ( !this._isWrappedItemsDropdownInItems ) {
			if ( !this.wrappedItemsDropdown ) {
				this._createWrappedItemsDropdown();
			}

			this.items.add( this.wrappedItemsDropdown );
		}

		const lastItem = this._lastRegularItem;

		this._grouppedItemRects.set( lastItem, new Rect( lastItem.element ) );

		this.wrappedItemsDropdown.toolbarView.items.add( this.items.remove( lastItem ), 0 );
	}

	/**
	 * Moves the very first item from the toolbar belonging to {@link #wrappedItemsDropdown} back
	 * to the {@link #items} collection.
	 *
	 * In some way, it's the opposite of {@link #_groupLastRegularItem}.
	 *
	 * @protected
	 */
	_ungroupFirstGrouppedItem() {
		this.items.add( this.wrappedItemsDropdown.toolbarView.items.remove( 0 ), this.items.length - 1 );
	}

	/**
	 * When called it will try to moves the very first item from the toolbar belonging to {@link #wrappedItemsDropdown}
	 * back to the {@link #items} collection.
	 *
	 * Whether the items is moved or not, it depends on the remaining space in the toolbar, which is
	 * verified using {@link #_grouppedItemRects}.
	 *
	 * @protected
	 */
	_tryUngroupLastItem() {
		const firstGrouppedItem = this.wrappedItemsDropdown.toolbarView.items.get( 0 );
		const firstGrouppedItemRect = this._grouppedItemRects.get( firstGrouppedItem );
		const wrappedItemsDropdownRect = new Rect( this.wrappedItemsDropdown.element );
		const lastRegularItem = this._lastRegularItem;
		let leftBoundary;

		if ( lastRegularItem ) {
			leftBoundary = new Rect( lastRegularItem.element ).right;
		} else {
			leftBoundary = new Rect( this.element ).left;
		}

		// If there's only one grouped item, then when ungrouped, it should replace the wrapped items
		// dropdown. Consider that fact when analyzing rects, because the conditions are different.
		if ( this.wrappedItemsDropdown.toolbarView.items.length === 1 ) {
			if ( leftBoundary + firstGrouppedItemRect.width + SUDDEN_SCROLL_SAFETY_OFFSET < wrappedItemsDropdownRect.right ) {
				this._ungroupFirstGrouppedItem();
				this.items.remove( this.wrappedItemsDropdown );
			}
		} else if ( leftBoundary + firstGrouppedItemRect.width + SUDDEN_SCROLL_SAFETY_OFFSET < wrappedItemsDropdownRect.left ) {
			this._ungroupFirstGrouppedItem();
		}
	}

	/**
	 * Returns `true` when any of toolbar {@link #items} wrapped visually to the next line.
	 * `false` otherwise.
	 *
	 * @protected
	 */
	get _areItemsWrapping() {
		if ( !this.items.length ) {
			return false;
		}

		const firstItem = this.items.first;

		if ( this.items.length === 1 ) {
			return false;
		}

		const firstItemRect = new Rect( firstItem.element );
		const lastItemRect = new Rect( this.items.last.element );

		return firstItemRect.bottom < lastItemRect.top;
	}

	/**
	 * When called it will check if any of the {@link #items} wraps to the next line and if so, it will
	 * move it to the {@link #wrappedItemsDropdown}.
	 *
	 * At the same time, it will also check if there is enough space in the toolbar for the first of the
	 * "grouped" items in the {@link #wrappedItemsDropdown} to be returned back.
	 *
	 * @protected
	 */
	_checkItemsWrappingAndUnwrapping() {
		if ( !this.element || !this.element.parentNode ) {
			return;
		}

		while ( this._areItemsWrapping ) {
			this._groupLastRegularItem();
		}

		if ( this._isWrappedItemsDropdownInItems ) {
			// Post-fixing just in case the page content grows up and a scrollbar appears.
			// If the last item is too close to the wrapped items dropdown, put it in the
			// dropdown too: if scrollbar shows up, it could push the dropdown to the next line.
			const wrappedItemsDropdownRect = new Rect( this.wrappedItemsDropdown.element );
			const lastRegularItem = this._lastRegularItem;

			if ( lastRegularItem ) {
				const lastRegularItemRect = new Rect( lastRegularItem.element );

				if ( lastRegularItemRect.right + SUDDEN_SCROLL_SAFETY_OFFSET > wrappedItemsDropdownRect.left ) {
					this._groupLastRegularItem();
				}
			}

			this._tryUngroupLastItem();
		}
	}
}

