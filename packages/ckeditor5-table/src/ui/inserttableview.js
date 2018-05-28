/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/**
 * @module table/ui/inserttableview
 */

import View from '@ckeditor/ckeditor5-ui/src/view';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';
import FocusCycler from '@ckeditor/ckeditor5-ui/src/focuscycler';

import './../../theme/inserttable.css';

/**
 * The table size view.
 *
 * It renders a 10x10 grid to choose inserted table size.
 *
 * @extends module:ui/view~View
 */
export default class InsertTableView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		/**
		 * Collection of the table size box items.
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
		 * Currently selected number of rows of a new table.
		 *
		 * @observable
		 * @member {Number} #rows
		 */
		this.set( 'rows', 0 );

		/**
		 * Currently selected number of columns of a new table.
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
			.to( this, 'columns', this, 'rows', ( columns, rows ) => `${ rows } x ${ columns }` );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [ 'ck' ]
			},

			children: [
				{
					tag: 'div',
					attributes: {
						class: [ 'ck-table-size-choose-box-container' ]
					},
					children: this.items
				},
				{
					tag: 'div',
					attributes: {
						class: [ 'ck-table-size-label' ]
					},
					children: [
						{
							text: bind.to( 'label' )
						}
					]
				}
			],

			on: {
				click: bind.to( () => {
					this.fire( 'execute' );
				} )
			}
		} );

		for ( let i = 0; i < 100; i++ ) {
			const view = new TableSizeChooser();

			view.on( 'over', () => {
				const row = parseInt( i / 10 );
				const column = i % 10;

				this.set( 'rows', row + 1 );
				this.set( 'columns', column + 1 );
			} );

			this.items.add( view );
		}

		this.on( 'change:columns', () => {
			this._updateItems();
		} );

		this.on( 'change:rows', () => {
			this._updateItems();
		} );
	}

	/**
	 * Enables current table size selection depending on rows & columns set.
	 *
	 * @private
	 */
	_updateItems() {
		const row = this.rows - 1;
		const column = this.columns - 1;

		this.items.map( ( item, index ) => {
			const itemRow = parseInt( index / 10 );
			const itemColumn = index % 10;

			if ( itemRow <= row && itemColumn <= column ) {
				item.set( 'isOn', true );
			} else {
				item.set( 'isOn', false );
			}
		} );
	}
}

class TableSizeChooser extends View {
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;

		this.set( 'isOn', false );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck-table-size-choose-box',
					bind.if( 'isOn', 'ck-on' )
				]
			},
			on: {
				mouseover: bind.to( 'over' )
			}
		} );
	}
}
