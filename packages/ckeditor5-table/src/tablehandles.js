/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablehandles
 */

/* global window */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';

import { getOptimalPosition } from '@ckeditor/ckeditor5-utils/src/dom/position';
import TableHandlesView from './tablehandlesui/tablehandlesview';
import ToolbarSeparatorView from '@ckeditor/ckeditor5-ui/src/toolbar/toolbarseparatorview';
import TableUtils from './tableutils';

/**
 * TODO
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableHandles extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableHandles';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ TableUtils ];
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * The handles view.
		 *
		 * @type {module:table/tablehandles/tablehandlesui~TableHandlesView}
		 */
		this.handlesView = this._createHandlesView();
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;

		this.listenTo( editor.ui, 'update', () => this._updateHandles() );
		this.listenTo( editor, 'change:isReadOnly', () => this._updateHandles(), { priority: 'low' } );
		this.listenTo( editor.ui.focusTracker, 'change:isFocused', () => this._updateHandles() );

		// Reposition button on resize.
		this.listenTo( this.handlesView, 'change:isVisible', ( evt, name, isVisible ) => {
			if ( isVisible ) {
				// Keep correct position of button and panel on window#resize.
				this.handlesView.listenTo( window, 'resize', () => this._updateHandles() );
			} else {
				// Stop repositioning button when is hidden.
				this.handlesView.stopListening( window, 'resize' );

				// Hide the panel when the button disappears.
				this._hideHandles();
			}
		} );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		this.handlesView.destroy();
	}

	/**
	 * Creates the {@link #handlesView}.
	 *
	 * @private
	 * @returns {module:table/tablehandles/tablehandlesui~TableHandlesView}
	 */
	_createHandlesView() {
		const editor = this.editor;
		const t = editor.t;
		const handlesView = new TableHandlesView( editor.locale );

		handlesView.set( {
			label: t( 'Edit block' ),
			withText: false
		} );

		// // Bind the panelView observable properties to the handlesView.
		// handlesView.bind( 'isOn' ).to( this.panelView, 'isVisible' );
		// handlesView.bind( 'tooltip' ).to( this.panelView, 'isVisible', isVisible => !isVisible );

		editor.ui.view.body.add( handlesView );
		editor.ui.focusTracker.add( handlesView.element );

		return handlesView;
	}

	/**
	 * Shows or hides the handles.
	 * When all the conditions for displaying the handles are matched, it shows the button. Hides otherwise.
	 *
	 * @private
	 */
	_updateHandles() {
		const editor = this.editor;
		const model = editor.model;
		const view = editor.editing.view;

		// Hides the button when the editor is not focused.
		if ( !editor.ui.focusTracker.isFocused ) {
			this._hideHandles();

			return;
		}

		// Hides the button when the editor switches to the read-only mode.
		if ( editor.isReadOnly ) {
			this._hideHandles();

			return;
		}

		// Get the selected table.
		const modelTarget = model.document.selection.getFirstPosition().findAncestor( 'table' );

		// Hides the button when there is no enabled item in toolbar for the current block element.
		if ( !modelTarget ) {
			this._hideHandles();

			return;
		}

		this._updateHandlesContent( modelTarget );

		// Get DOM target element.
		const domTarget = view.domConverter.mapViewToDom( editor.editing.mapper.toViewElement( modelTarget ) );

		// Show handles.
		this.handlesView.isVisible = true;

		// Attach handles to target DOM element.
		this._attachHandlesToElement( domTarget );
	}

	/**
	 * Hides the button.
	 *
	 * @private
	 */
	_hideHandles() {
		this.handlesView.isVisible = false;
	}

	/**
	 * Attaches the {@link #handlesView} to the target table.
	 *
	 * @private
	 * @param {HTMLElement} targetElement Target element.
	 */
	_attachHandlesToElement( targetElement ) {
		const position = getOptimalPosition( {
			element: this.handlesView.element,
			target: targetElement,
			positions: [ contentRect => contentRect ]
		} );

		this.handlesView.top = position.top;
		this.handlesView.left = position.left;
	}

	_updateHandlesContent( tableElement ) {
		const tableUtils = this.editor.plugins.get( TableUtils );
		const componentFactory = this.editor.ui.componentFactory;

		const rowsCount = tableUtils.getRows( tableElement );
		const columnsCount = tableUtils.getColumns( tableElement );

		const rows = new Array( rowsCount ).fill( null )
			.flatMap( ( item, idx ) => [
				componentFactory.create( 'tableRow', { table: tableElement, row: idx } ),
				new ToolbarSeparatorView()
			] );

		const columns = new Array( columnsCount ).fill( null )
			.flatMap( ( item, idx ) => [
				componentFactory.create( 'tableColumn', { table: tableElement, column: idx } ),
				new ToolbarSeparatorView()
			] );

		this.handlesView.setRowsColumns( rows, columns );
	}
}
