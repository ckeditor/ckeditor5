/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/ui/inserttableview
 */

import { View, ButtonView, addKeyboardHandlingForGrid, type ViewCollection } from 'ckeditor5/src/ui';

import { KeystrokeHandler, FocusTracker, type Locale } from 'ckeditor5/src/utils';

import './../../theme/inserttable.css';

/**
 * The table size view.
 *
 * It renders a 10x10 grid to choose the inserted table size.
 */
export default class InsertTableView extends View {
	/**
	 * A collection of table size box items.
	 */
	public readonly items: ViewCollection<ButtonView>;

	/**
	 * Listen to `keydown` events fired in this view's main element.
	 */
	public readonly keystrokes: KeystrokeHandler;

	/**
	 * Tracks information about the DOM focus in the grid.
	 */
	public readonly focusTracker: FocusTracker;

	/**
	 * The currently selected number of rows of the new table.
	 *
	 * @observable
	 */
	declare public rows: number;

	/**
	 * The currently selected number of columns of the new table.
	 *
	 * @observable
	 */
	declare public columns: number;

	/**
	 * The label text displayed under the boxes.
	 *
	 * @observable
	 */
	declare public label: string;

	/**
	 * @inheritDoc
	 */
	constructor( locale: Locale ) {
		super( locale );

		const bind = this.bindTemplate;
		this.items = this._createGridCollection();
		this.keystrokes = new KeystrokeHandler();
		this.focusTracker = new FocusTracker();
		this.set( 'rows', 0 );
		this.set( 'columns', 0 );
		this.bind( 'label' ).to( this, 'columns', this, 'rows', ( columns, rows ) => `${ rows } × ${ columns }` );

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
						class: [
							'ck',
							'ck-insert-table-dropdown__label'
						],
						'aria-hidden': true
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

		// #rows and #columns are set via changes to #focusTracker on mouse over.
		this.on( 'boxover', ( evt, domEvt ) => {
			const { row, column } = domEvt.target.dataset;
			this.items.get( ( parseInt( row, 10 ) - 1 ) * 10 + ( parseInt( column, 10 ) - 1 ) )!.focus();
		} );

		// This allows the #rows and #columns to be updated when:
		// * the user navigates the grid using the keyboard,
		// * the user moves the mouse over grid items.
		this.focusTracker.on( 'change:focusedElement', ( evt, name, focusedElement ) => {
			if ( !focusedElement ) {
				return;
			}

			const { row, column } = focusedElement.dataset;

			// As row & column indexes are zero-based transform it to number of selected rows & columns.
			this.set( {
				rows: parseInt( row ),
				columns: parseInt( column )
			} );
		} );

		this.on( 'change:columns', () => this._highlightGridBoxes() );
		this.on( 'change:rows', () => this._highlightGridBoxes() );
	}

	public override render(): void {
		super.render();

		addKeyboardHandlingForGrid( {
			keystrokeHandler: this.keystrokes,
			focusTracker: this.focusTracker,
			gridItems: this.items,
			numberOfColumns: 10,
			uiLanguageDirection: this.locale && this.locale.uiLanguageDirection
		} );

		for ( const item of this.items ) {
			this.focusTracker.add( item.element! );
		}

		this.keystrokes.listenTo( this.element! );
	}

	/**
	 * @inheritDoc
	 */
	public focus(): void {
		this.items.get( 0 )!.focus();
	}

	/**
	 * @inheritDoc
	 */
	public focusLast(): void {
		this.items.get( 0 )!.focus();
	}

	/**
	 * Highlights grid boxes depending on rows and columns selected.
	 */
	private _highlightGridBoxes() {
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
	 * Creates a new Button for the grid.
	 *
	 * @param locale The locale instance.
	 * @param row Row number.
	 * @param column Column number.
	 * @param label The grid button label.
	 */
	private _createGridButton( locale: Locale, row: number, column: number, label: string ): ButtonView {
		const button = new ButtonView( locale );

		button.set( {
			label,
			class: 'ck-insert-table-dropdown-grid-box'
		} );

		button.extendTemplate( {
			attributes: {
				'data-row': row,
				'data-column': column
			}
		} );

		return button;
	}

	/**
	 * @returns A view collection containing boxes to be placed in a table grid.
	 */
	private _createGridCollection() {
		const boxes = [];

		// Add grid boxes to table selection view.
		for ( let index = 0; index < 100; index++ ) {
			const row = Math.floor( index / 10 );
			const column = index % 10;
			const label = `${ row + 1 } × ${ column + 1 }`;

			boxes.push( this._createGridButton( this.locale!, row + 1, column + 1, label ) );
		}

		return this.createCollection( boxes );
	}
}
