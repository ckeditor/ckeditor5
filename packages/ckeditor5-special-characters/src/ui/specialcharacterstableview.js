/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module special-characters/ui/specialcharacterstableview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';
import KeystrokeHandler from '@ckeditor/ckeditor5-utils/src/keystrokehandler';
import SymbolGridView from './symbolgridview';

// TODO: Keyboard navigation does not work.

/**
 * @extends module:ui/view~View
 */
export default class SpecialCharactersTableView extends View {
	/**
	 * Creates a view to be inserted as a child of {@link module:ui/dropdown/dropdownview~DropdownView}.
	 *
	 * @param {module:utils/locale~Locale} [locale] The localization services instance.
	 * @param {Object} config The configuration object.
	 * @param {Array.<module:special-characters/specialcharacters~SpecialCharacterDefinition>} config.symbolDefinitions An array with
	 * definitions of special characters to be displayed in the table.
	 * @param {Number} config.columns The number of columns in the color grid.
	 */
	constructor( locale, { symbolDefinitions = [], columns } ) {
		super( locale );

		/**
		 * A collection of the children of the table.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.items = this.createCollection();

		/**
		 * Tracks information about the DOM focus in the list.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker}
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * An instance of the {@link module:utils/keystrokehandler~KeystrokeHandler}.
		 *
		 * @readonly
		 * @member {module:utils/keystrokehandler~KeystrokeHandler}
		 */
		this.keystrokes = new KeystrokeHandler();

		/**
		 * The number of columns in the special characters grid.
		 *
		 * @type {Number}
		 */
		this.columns = columns;

		/**
		 * An array with definitions of special characters to be displayed in the table.
		 *
		 * @member {Array.<module:special-characters/specialcharacters~SpecialCharacterDefinition>}
		 */
		this.symbolDefinitions = symbolDefinitions;

		/**
		 * Preserves the reference to {@link module:special-characters/ui/symbolgridview~SymbolGridView} used to create
		 * the default (static) symbol set.
		 *
		 * @readonly
		 * @member {module:special-characters/ui/symbolgridview~SymbolGridView}
		 */
		this.symbolGridView = this._createSymbolGridView();

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
				// Navigate list items backwards using the Arrow Up key.
				focusPrevious: 'arrowup',

				// Navigate list items forwards using the Arrow Down key.
				focusNext: 'arrowdown',
			}
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-grid-table'
				]
			},
			children: this.items
		} );

		this.items.add( this.symbolGridView );
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
	 * Focuses the first focusable element in {@link #items}.
	 */
	focus() {
		this._focusCycler.focusFirst();
	}

	/**
	 * Focuses the last focusable element in {@link #items}.
	 */
	focusLast() {
		this._focusCycler.focusLast();
	}

	/**
	 * Creates a static symbol table grid based on the editor configuration.
	 *
	 * @private
	 * @returns {module:special-characters/ui/symbolgridview~SymbolGridView}
	 */
	_createSymbolGridView() {
		const symbolGrid = new SymbolGridView( this.locale, {
			symbolDefinitions: this.symbolDefinitions,
			columns: this.columns
		} );

		symbolGrid.delegate( 'execute' ).to( this );

		return symbolGrid;
	}
}
