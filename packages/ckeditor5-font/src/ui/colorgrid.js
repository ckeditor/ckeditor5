/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/ui/colorgrid
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ColorTile from './colortile';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';

/**
 * It keeps nicely collection of {@link module:font/ui/colortile~ColorTile}.
 *
 * @extends module:ui/view~View
 */
export default class ColorGrid extends View {
	/**
	 * Construct instance of color grid used to display {@link module:font/ui/colortile~ColorTile} in drop down.
	 *
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 * @param {Object} config Configuration
	 * @param {Array.<module:font/ui/colorgrid~ColorDefinition>} colorsDefinition Array with definitions
	 * required to build {@link module:font/ui/colortile~ColorTile}.
	 */
	constructor( locale, { colorsDefinition = [] } = {} ) {
		super( locale );

		/**
		 * Collection of the child list views.
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
		 * Helps cycling over focusable {@link #items} in the list.
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
				// Navigate list items backwards using the arrowup key.
				focusPrevious: 'arrowleft',

				// Navigate toolbar items forwards using the arrowdown key.
				focusNext: 'arrowright',
			}
		} );

		colorsDefinition.forEach( item => {
			const colorTile = new ColorTile();
			colorTile.set( {
				color: item.color,
				label: item.label,
				tooltip: true,
				hasBorder: item.options.hasBorder
			} );
			colorTile.on( 'execute', () => {
				this.fire( 'execute', {
					value: item.color,
					hasBorder: item.options.hasBorder,
					label: item.label
				} );
			} );
			this.items.add( colorTile );
		} );

		this.setTemplate( {
			tag: 'div',
			children: this.items,
			attributes: {
				class: 'ck-color-table__grid-container'
			}
		} );
	}

	/**
	 * Focuses the first focusable in {@link #items}.
	 */
	focus() {
		if ( this.items.length ) {
			this.items.first.focus();
		}
	}

	/**
	 * Focuses the last focusable in {@link #items}.
	 */
	focusLast() {
		if ( this.items.length ) {
			const lastChild = this.children.last;

			if ( typeof lastChild.focusLast === 'function' ) {
				lastChild.focusLast();
			} else {
				lastChild.focus();
			}
		}
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
}

/**
 * Color definition used to build {@link module:font/ui/colortile~ColorTile}.
 *
 * 		{
 * 			color: hsl(0, 0%, 75%),
 * 			label: 'Light Grey',
 * 			options: {
 * 				hasBorder: true
 * 			}
 * 		}
 *
 * @typedef {Object} module:font/ui/colorgrid~ColorDefinition
 * @type Object
 *
 * @property {String} color String representing inserted color.
 * It's used as value of background-color style in {@link module:font/ui/colortile~ColorTile}.
 *
 * @property {String} label String used as label for {@link module:font/ui/colortile~ColorTile}.
 *
 * @property {Object} options Additional options passed to build {@link module:font/ui/colortile~ColorTile}.
 *
 * @property {Boolean} options.hasBorder Flag indicates if special CSS class should be added
 * to {@link module:font/ui/colortile~ColorTile}, which draw border around it.
 */
