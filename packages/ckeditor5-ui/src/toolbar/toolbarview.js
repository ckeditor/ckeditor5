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
import RectObserver from '../rectobserver';
import preventDefault from '../bindings/preventdefault.js';
import Rect from '@ckeditor/ckeditor5-utils/src/dom/rect';
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
		let oldRect;

		this._checkItemsWrappingAndUnwrapping();

		// TODO: stopObserving on destroy();
		new RectObserver( this.element ).observe( newRect => {
			if ( oldRect && oldRect.width !== newRect.width ) {
				this._checkItemsWrappingAndUnwrapping();
			}

			oldRect = newRect;
		} );
	}

	get _grouppedItems() {
		return this.wrappedItemsDropdown.toolbarView.items;
	}

	/**
	 * Creates the {@link #wrappedItemsDropdown} on demand. Used when the space in the toolbar
	 * is scarce and some items start wrapping and need grouping.
	 *
	 * See {@link #_groupLastItem}.
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
	 * When called it will remove the last {@link #_lastNonGrouppedItem regular item} from {@link #items}
	 * and move it to the {@link #wrappedItemsDropdown}.
	 *
	 * If the dropdown does not exist or does not
	 * belong to {@link #items} it is created and located at the end of the collection.
	 *
	 * @protected
	 */
	_groupLastItem() {
		if ( !this.wrappedItemsDropdown ) {
			this._createWrappedItemsDropdown();
		}

		if ( !this.items.has( this.wrappedItemsDropdown ) ) {
			this.items.add( this.wrappedItemsDropdown );
		}

		let lastNonGrouppedItem;

		if ( this.items.has( this.wrappedItemsDropdown ) ) {
			lastNonGrouppedItem = this.items.length > 1 ? this.items.get( this.items.length - 2 ) : null;
		} else {
			lastNonGrouppedItem = this.items.last;
		}

		this._grouppedItems.add( this.items.remove( lastNonGrouppedItem ), 0 );
	}

	/**
	 * Moves the very first item from the toolbar belonging to {@link #wrappedItemsDropdown} back
	 * to the {@link #items} collection.
	 *
	 * In some way, it's the opposite of {@link #_groupLastItem}.
	 *
	 * @protected
	 */
	_ungroupFirstItem() {
		this.items.add( this._grouppedItems.remove( 0 ), this.items.length - 1 );

		if ( !this._grouppedItems.length ) {
			this.items.remove( this.wrappedItemsDropdown );
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

		if ( this.items.length === 1 ) {
			return false;
		}

		const firstItem = this.items.first;
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

		let wereItemsGroupped;

		while ( this._areItemsWrapping ) {
			this._groupLastItem();
			wereItemsGroupped = true;
		}

		if ( !wereItemsGroupped && this.wrappedItemsDropdown && this._grouppedItems.length ) {
			while ( !this._areItemsWrapping ) {
				this._ungroupFirstItem();

				if ( !this._grouppedItems.length ) {
					break;
				}
			}

			if ( this._areItemsWrapping ) {
				this._groupLastItem();
			}
		}
	}
}

