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
 * A grid of {@link module:font/ui/colortile~ColorTile}.
 *
 * @extends module:ui/view~View
 */
export default class ColorGrid extends View {
	/**
	 * Creates an instance of a color grid containing {@link module:font/ui/colortile~ColorTile}.
	 *
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 * @param {Object} options Component configuration
	 * @param {Array.<module:font/ui/colorgrid~ColorDefinition>} [options.colorsDefinition] Array with definitions
	 * required to create the {@link module:font/ui/colortile~ColorTile tiles}.
	 * @param {Number} options.colorColumns A number of columns to display the tiles.
	 */
	constructor( locale, options ) {
		super( locale );

		/**
		 * Collection of the child tile views.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.items = this.createCollection();

		/**
		 * Tracks information about DOM focus in the grid.
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
		 * Helps cycling over focusable {@link #items} in the grid.
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
				// Navigate grid items backwards using the arrowup key.
				focusPrevious: 'arrowleft',

				// Navigate grid items forwards using the arrowdown key.
				focusNext: 'arrowright',
			}
		} );

		if ( options.colorsDefinition ) {
			options.colorsDefinition.forEach( item => {
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
		}

		this.setTemplate( {
			tag: 'div',
			children: this.items,
			attributes: {
				class: 'ck-color-table__grid-container',
				style: {
					gridTemplateColumns: `repeat( ${ options.colorColumns }, 1fr)`
				}
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
			this.items.last.focus();
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
 * A color definition used to create a {@link module:font/ui/colortile~ColorTile}.
 *
 *		{
 *			color: hsl(0, 0%, 75%),
 *			label: 'Light Grey',
 *			options: {
 *				hasBorder: true
 *			}
 *		}
 *
 * @typedef {Object} module:font/ui/colorgrid~ColorDefinition
 * @type Object
 *
 * @property {String} color String representing a color.
 * It is used as value of background-color style in {@link module:font/ui/colortile~ColorTile}.
 * @property {String} label String used as label for {@link module:font/ui/colortile~ColorTile}.
 * @property {Object} options Additional options passed to create a {@link module:font/ui/colortile~ColorTile}.
 * @property {Boolean} options.hasBorder A flag that indicates if special a CSS class should be added
 * to {@link module:font/ui/colortile~ColorTile}, which renders a border around it.
 */
