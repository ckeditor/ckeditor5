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

		/**
		 * Creates an array of box views.
		 *
		 * @private
		 */
		this.items = this.createCollection( this._createGridCollection() );

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
	 * @returns {module:table/ui/inserttableview~TableSizeGridBoxView[]} An array of boxes to be placed in table grid.
	 */
	_createGridCollection() {
		const returnValue = [];

		// Add grid boxes to table selection view.
		for ( let index = 0; index < 100; index++ ) {
			const boxView = new TableSizeGridBoxView();

			// Listen to box view 'over' event which indicates that mouse is over this box.
			boxView.on( 'over', () => {
				// Translate box index to the row & column index.
				const row = Math.floor( index / 10 );
				const column = index % 10;

				// As row & column indexes are zero-based transform it to number of selected rows & columns.
				this.set( 'rows', row + 1 );
				this.set( 'columns', column + 1 );
			} );

			returnValue.push( boxView );
		}

		return returnValue;
	}
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
	constructor( locale ) {
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
				]
			},
			on: {
				mouseover: bind.to( 'over' )
			}
		} );
	}
}
