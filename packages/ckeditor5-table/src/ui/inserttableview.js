/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/ui/inserttableview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';

import './../../theme/inserttable.css';

/**
 * The table size view.
 *
 * It renders a 10x10 grid to choose the inserted table size.
 *
 * @extends module:ui/view~View
 * @implements module:ui/dropdown/dropdownpanelfocusable~DropdownPanelFocusable
 */
export default class InsertTableView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * A collection of table size box items.
		 *
		 * @readonly
		 * @member {module:ui/viewcollection~ViewCollection}
		 */
		this.items = this._createGridCollection();

		/**
		 * The currently selected number of rows of the new table.
		 *
		 * @observable
		 * @member {Number} #rows
		 */
		this.set( 'rows', 0 );

		/**
		 * The currently selected number of columns of the new table.
		 *
		 * @observable
		 * @member {Number} #columns
		 */
		this.set( 'columns', 0 );

		/**
		 * The label text displayed under the boxes.
		 *
		 * @observable
		 * @member {String} #label
		 */
		this.bind( 'label' )
			.to( this, 'columns', this, 'rows', ( columns, rows ) => `${ rows } × ${ columns }` );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck' ]
			},

			children: [
				{
					tag: 'div',
					attributes: {
						class: [ 'ck-insert-table-dropdown__grid' ]
					},
					on: {
						'mouseover@.ck-insert-table-dropdown-grid-box': bind.to( 'boxover' )
					},
					children: this.items
				},
				{
					tag: 'div',
					attributes: {
						class: [ 'ck-insert-table-dropdown__label' ]
					},
					children: [
						{
							text: bind.to( 'label' )
						}
					]
				}
			],

			on: {
				mousedown: bind.to( evt => {
					evt.preventDefault();
				} ),

				click: bind.to( () => {
					this.fire( 'execute' );
				} )
			}
		} );

		this.on( 'boxover', ( evt, domEvt ) => {
			const { row, column } = domEvt.target.dataset;

			// As row & column indexes are zero-based transform it to number of selected rows & columns.
			this.set( {
				rows: parseInt( row ),
				columns: parseInt( column )
			} );
		} );

		this.on( 'change:columns', () => {
			this._highlightGridBoxes();
		} );

		this.on( 'change:rows', () => {
			this._highlightGridBoxes();
		} );
	}

	/**
	 * @inheritDoc
	 */
	focus() {
		// The dropdown panel expects DropdownPanelFocusable interface on views passed to dropdown panel. See #30.
		// The method should be implemented while working on keyboard support for this view. See #22.
	}

	/**
	 * @inheritDoc
	 */
	focusLast() {
		// The dropdown panel expects DropdownPanelFocusable interface on views passed to dropdown panel. See #30.
		// The method should be implemented while working on keyboard support for this view. See #22.
	}

	/**
	 * Highlights grid boxes depending on rows and columns selected.
	 *
	 * @private
	 */
	_highlightGridBoxes() {
		const rows = this.rows;
		const columns = this.columns;

		this.items.map( ( boxView, index ) => {
			// Translate box index to the row & column index.
			const itemRow = Math.floor( index / 10 );
			const itemColumn = index % 10;

			// Grid box is highlighted when its row & column index belongs to selected number of rows & columns.
			const isOn = itemRow < rows && itemColumn < columns;

			boxView.set( 'isOn', isOn );
		} );
	}

	/**
	 * @private
	 * @returns {module:ui/viewcollection~ViewCollection} A view collection containing boxes to be placed in a table grid.
	 */
	_createGridCollection() {
		const boxes = [];

		// Add grid boxes to table selection view.
		for ( let index = 0; index < 100; index++ ) {
			const row = Math.floor( index / 10 );
			const column = index % 10;

			boxes.push( new TableSizeGridBoxView( this.locale, row + 1, column + 1 ) );
		}

		return this.createCollection( boxes );
	}

	/**
	 * Fired when the mouse hover over one of the {@link #items child grid boxes}.
	 *
	 * @event boxover
	 */
}

/**
 * A single grid box view element.
 *
 * This class is used to render the table size selection grid in {@link module:table/ui/inserttableview~InsertTableView}.
 *
 * @private
 */
class TableSizeGridBoxView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale, row, column ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * Controls whether the grid box view is "on".
		 *
		 * @observable
		 * @member {Boolean} #isOn
		 */
		this.set( 'isOn', false );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck-insert-table-dropdown-grid-box',
					bind.if( 'isOn', 'ck-on' )
				],
				'data-row': row,
				'data-column': column
			}
		} );
	}
}
