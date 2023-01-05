/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module ui/colorgrid/colorgrid
 */

import View from '../view';
import ColorTileView from './colortileview';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import addKeyboardHandlingForGrid from '../bindings/addkeyboardhandlingforgrid';

import '../../theme/components/colorgrid/colorgrid.css';

/**
 * A grid of {@link module:ui/colorgrid/colortile~ColorTileView color tiles}.
 *
 * @extends module:ui/view~View
 */
export default class ColorGridView extends View {
	/**
	 * Creates an instance of a color grid containing {@link module:ui/colorgrid/colortile~ColorTileView tiles}.
	 *
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 * @param {Object} options Component configuration
	 * @param {Array.<module:ui/colorgrid/colorgrid~ColorDefinition>} [options.colorDefinitions] Array with definitions
	 * required to create the {@link module:ui/colorgrid/colortile~ColorTileView tiles}.
	 * @param {Number} [options.columns=5] A number of columns to display the tiles.
	 */
	constructor( locale, options ) {
		super( locale );

		const colorDefinitions = options && options.colorDefinitions || [];
		const viewStyleAttribute = {};

		/**
		 * A number of columns for the tiles grid.
		 *
		 * @readonly
		 * @member {Number}
		 */
		this.columns = options && options.columns ? options.columns : 5;

		viewStyleAttribute.gridTemplateColumns = `repeat( ${ this.columns }, 1fr)`;

		/**
		 * The color of the currently selected color tile in {@link #items}.
		 *
		 * @observable
		 * @type {String}
		 */
		this.set( 'selectedColor' );

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

		this.items.on( 'add', ( evt, colorTile ) => {
			colorTile.isOn = colorTile.color === this.selectedColor;
		} );

		colorDefinitions.forEach( color => {
			const colorTile = new ColorTileView();

			colorTile.set( {
				color: color.color,
				label: color.label,
				tooltip: true,
				hasBorder: color.options.hasBorder
			} );

			colorTile.on( 'execute', () => {
				this.fire( 'execute', {
					value: color.color,
					hasBorder: color.options.hasBorder,
					label: color.label
				} );
			} );

			this.items.add( colorTile );
		} );

		this.setTemplate( {
			tag: 'div',
			children: this.items,
			attributes: {
				class: [
					'ck',
					'ck-color-grid'
				],
				style: viewStyleAttribute
			}
		} );

		this.on( 'change:selectedColor', ( evt, name, selectedColor ) => {
			for ( const item of this.items ) {
				item.isOn = item.color === selectedColor;
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

		addKeyboardHandlingForGrid( {
			keystrokeHandler: this.keystrokes,
			focusTracker: this.focusTracker,
			gridItems: this.items,
			numberOfColumns: this.columns
		} );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		this.focusTracker.destroy();
		this.keystrokes.destroy();
	}

	/**
	 * Fired when the `ColorTileView` for the picked item is executed.
	 *
	 * @event execute
	 * @param {Object} data Additional information about the event.
	 * @param {String} data.value The value of the selected color
	 * ({@link module:ui/colorgrid/colorgrid~ColorDefinition#color `color.color`}).
	 * @param {Boolean} data.hasBorder The `hasBorder` property of the selected color
	 * ({@link module:ui/colorgrid/colorgrid~ColorDefinition#options `color.options.hasBorder`}).
	 * @param {String} data.Label The label of the selected color
	 * ({@link module:ui/colorgrid/colorgrid~ColorDefinition#label `color.label`})
	 */
}

/**
 * A color definition used to create a {@link module:ui/colorgrid/colortile~ColorTileView}.
 *
 *		{
 *			color: 'hsl(0, 0%, 75%)',
 *			label: 'Light Grey',
 *			options: {
 *				hasBorder: true
 *			}
 *		}
 *
 * @typedef {Object} module:ui/colorgrid/colorgrid~ColorDefinition
 * @type Object
 *
 * @property {String} color String representing a color.
 * It is used as value of background-color style in {@link module:ui/colorgrid/colortile~ColorTileView}.
 * @property {String} label String used as label for {@link module:ui/colorgrid/colortile~ColorTileView}.
 * @property {Object} options Additional options passed to create a {@link module:ui/colorgrid/colortile~ColorTileView}.
 * @property {Boolean} options.hasBorder A flag that indicates if special a CSS class should be added
 * to {@link module:ui/colorgrid/colortile~ColorTileView}, which renders a border around it.
 */
