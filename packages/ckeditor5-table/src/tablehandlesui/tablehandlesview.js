/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablehandles/tablehandlesui
 */

import toUnit from '@ckeditor/ckeditor5-utils/src/dom/tounit';
import View from '@ckeditor/ckeditor5-ui/src/view';

import '../../theme/tablehandles.css';
import ToolbarView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarview';

const toPx = toUnit( 'px' );

/**
 * TODO
 *
 * @extends {module:ui/view~View}
 */
export default class TableHandlesView extends View {
	/**
	 * @inheritDoc
	 */
	constructor( locale ) {
		super( locale );

		const bind = this.bindTemplate;
		const t = this.t;

		/**
		 * Visibility flag.
		 *
		 * @member {Boolean} #isVisible
		 */
		this.set( 'isVisible', false );

		/**
		 * Top offset.
		 *
		 * @member {Number} #top
		 */
		this.set( 'top', 0 );

		/**
		 * Left offset.
		 *
		 * @member {Number} #left
		 */
		this.set( 'left', 0 );

		/**
		 * TODO
		 * @member {ToolbarView} #_columns
		 * @private
		 */
		this._columns = this._createHandles( locale, {
			ariaLabel: t( 'Column handles' ),
			class: 'ck-table-handles__columns'
		} );

		/**
		 * TODO
		 * @member {ToolbarView} #_rows
		 * @private
		 */
		this._rows = this._createHandles( locale, {
			ariaLabel: t( 'Row handles' ),
			class: 'ck-table-handles__rows',
			isVertical: true
		} );

		this.setTemplate( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-table-handles',
					bind.if( 'isVisible', 'ck-hidden', value => !value )
				],
				style: {
					top: bind.to( 'top', val => toPx( val ) ),
					left: bind.to( 'left', val => toPx( val ) )
				}
			},
			children: [
				this._columns,
				this._rows
			]
		} );
	}

	/**
	 * TODO
	 */
	setRowsColumns( rows, columns ) {
		this._columns.items.clear();
		this._rows.items.clear();

		this._columns.items.addMany( columns );
		this._rows.items.addMany( rows );
	}

	/**
	 * TODO
	 *
	 * @param locale
	 * @param options
	 * @return {ToolbarView}
	 * @private
	 */
	_createHandles( locale, options ) {
		const toolbar = new ToolbarView( locale );

		toolbar.set( {
			isCompact: true,
			...options
		} );

		return toolbar;
	}
}
