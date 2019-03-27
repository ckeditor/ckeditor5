/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module font/ui/colortableview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import ColorTileView from '@ckeditor/ckeditor5-ui/src/colorgrid/colortileview';
import ColorGridView from '@ckeditor/ckeditor5-ui/src/colorgrid/colorgridview';
import Collection from '@ckeditor/ckeditor5-utils/src/collection';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import removeButtonIcon from '@ckeditor/ckeditor5-core/theme/icons/eraser.svg';
import '../../theme/fontcolor.css';

/**
 * Class which represents a view with the following sub–components:
 *
 * * a remove color button,
 * * a {@link module:ui/colorgrid/colorgrid~ColorGridView},
 * * a grid of recently used colors.
 *
 * @extends module:ui/view~View
 */
export default class ColorTableView extends View {
	/**
	 * Creates a view to be inserted as child of {@link module:ui/dropdown/dropdownview~DropdownView}.
	 *
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 * @param {Object} config Configuration object
	 * @param {Array.<module:ui/colorgrid/colorgrid~ColorDefinition>} config.colors Array with definitions of colors to
	 * be displayed in the table.
	 * @param {Number} config.columns Number of columns in the color grid.
	 * Also determines how many recent color will be displayed.
	 * @param {String} config.removeButtonLabel A label of a button responsible for removing the color.
	 */
	constructor( locale, { colors, columns, removeButtonLabel } ) {
		super( locale );

		/**
		 * Collection of the children of the table.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.items = this.createCollection();

		/**
		 * An array with objects representing colors to be displayed in the grid.
		 *
		 * @type {Arrray.<module:ui/colorgrid/colorgrid~ColorDefinition>}
		 */
		this.colorDefinitions = colors;

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
		 * Keeps value of the command associated with the table for current selection.
		 *
		 * @type {String}
		 */
		this.set( 'selectedColor' );

		/**
		 * A label of the button responsible for removing color attributes.
		 *
		 * @type {String}
		 */
		this.removeButtonLabel = removeButtonLabel;

		/**
		 * The number of columns in color grid. Also determines the number of recent color to be displayed.
		 *
		 * @type {Number}
		 */
		this.columns = columns;

		/**
		 * A collection storing definitions of recently used colors.
		 *
		 * @readonly
		 * @member {module:utils/collection~Collection}
		 */
		this.recentlyUsedColors = new Collection();

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
				focusPrevious: 'arrowup',

				// Navigate list items forwards using the arrowdown key.
				focusNext: 'arrowdown',
			}
		} );

		this.initRecentCollection();
		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-color-table'
				]
			},
			children: this.items
		} );

		this.items.add( this.removeColorButton() );
		this.items.add( this.createStaticColorTable() );
		this.items.add( this.recentlyUsed() );
	}

	/**
	 * Adds the remove color button as child for current view.
	 *
	 * @private
	 */
	removeColorButton() {
		const buttonView = new ButtonView();

		buttonView.set( {
			withText: true,
			icon: removeButtonIcon,
			tooltip: true,
			label: this.removeButtonLabel
		} );

		buttonView.class = 'ck-color-table__remove-color';
		buttonView.on( 'execute', () => {
			this.fire( 'execute', { value: null } );
		} );

		return buttonView;
	}

	/**
	 * Creates a static color table grid based on editor config.
	 *
	 * @private
	 */
	createStaticColorTable() {
		const colorGrid = new ColorGridView( this.locale, {
			colorDefinitions: this.colorDefinitions,
			columns: this.columns
		} );

		colorGrid.delegate( 'execute' ).to( this );

		return colorGrid;
	}

	/**
	 * Adds recently used colors section view and binds it to {@link #recentlyUsedColors}.
	 *
	 * @private
	 */
	recentlyUsed() {
		const recentViews = new ColorGridView( this.locale, { columns: this.columns } );

		recentViews.items.bindTo( this.recentlyUsedColors ).using(
			colorObj => {
				const colorTile = new ColorTileView();

				colorTile.set( {
					color: colorObj.color,
					hasBorder: colorObj.hasBorder
				} );

				if ( colorObj.label ) {
					colorTile.set( {
						label: colorObj.label,
						tooltip: true
					} );
				}

				if ( colorObj.isEnabled === false ) {
					colorTile.set( 'isEnabled', false );
				}

				colorTile.on( 'execute', () => {
					this.fire( 'execute', {
						value: colorObj.color,
						hasBorder: colorObj.hasBorder,
						label: colorObj.label
					} );
				} );

				return colorTile;
			}
		);

		this.recentlyUsedColors.on( 'add', ( evt, item ) => {
			const duplicates = this.recentlyUsedColors.filter( element => element.color === item.color, this );

			if ( duplicates.length === 2 ) {
				this.recentlyUsedColors.remove( duplicates[ 1 ] );
			}

			if ( this.recentlyUsedColors.length > this.columns ) {
				this.recentlyUsedColors.remove( this.recentlyUsedColors.length - 1 );
			}
		} );

		recentViews.delegate( 'execute' ).to( this );

		return recentViews;
	}

	/**
	 * Populates {@link #recentlyUsedColors} with empty non-clickable buttons, which represent placeholders
	 * for colors.
	 *
	 * @private
	 */
	initRecentCollection() {
		for ( let i = 0; i < this.columns; i++ ) {
			this.recentlyUsedColors.add( {
				color: 'hsla(0, 0%, 0%, 0)',
				isEnabled: false,
				hasBorder: true
			} );
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

		// Start listening for the keystrokes coming from #element.
		this.keystrokes.listenTo( this.element );
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
