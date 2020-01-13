/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module table/tablecellpropertiesui
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { getTableWidgetAncestor } from './utils';
import clickOutsideHandler from '@ckeditor/ckeditor5-ui/src/bindings/clickoutsidehandler';
import ContextualBalloon from '@ckeditor/ckeditor5-ui/src/panel/balloon/contextualballoon';
import TableCellPropertiesView from './ui/tablecellpropertiesview';
import tableCellProperties from './../theme/icons/table-cell-properties.svg';
import { repositionContextualBalloon, getBalloonPositionData } from './ui/utils';
import { findAncestor } from './commands/utils';

const DEFAULT_BORDER_STYLE = 'none';
const DEFAULT_HORIZONTAL_ALIGNMENT = 'left';
const DEFAULT_VERTICAL_ALIGNMENT = 'middle';

// Attributes that set the same value for "top", "right", "bottom", and "left".
const QUAD_DIRECTION_ATTRIBUTES = [ 'borderStyle', 'borderWidth', 'borderColor', 'padding' ];

/**
 * The table cell properties UI plugin. It introduces the `'tableCellProperties'` button
 * that opens a form allowing to specify visual styling of a table cell.
 *
 * It uses the
 * {@link module:ui/panel/balloon/contextualballoon~ContextualBalloon contextual balloon plugin}.
 *
 * @extends module:core/plugin~Plugin
 */
export default class TableCellPropertiesUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ ContextualBalloon ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'TableCellPropertiesUI';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		/**
		 * The contextual balloon plugin instance.
		 *
		 * @private
		 * @member {module:ui/panel/balloon/contextualballoon~ContextualBalloon}
		 */
		this._balloon = editor.plugins.get( ContextualBalloon );

		/**
		 * The batch used to undo all changes made by the form (which are live)
		 * if "Cancel" was pressed. Each time the view is shown, a new batch is created.
		 *
		 * @private
		 * @member {module:engine/model/batch~Batch}
		 */
		this._batch = null;

		// Create the view that displays the properties form.
		this._createPropertiesView();

		// Make the form dynamic, i.e. create bindings between view fields and the model.
		this._startRespondingToChangesInView();

		editor.ui.componentFactory.add( 'tableCellProperties', locale => {
			const view = new ButtonView( locale );

			view.set( {
				label: t( 'Cell properties' ),
				icon: tableCellProperties,
				tooltip: true
			} );

			this.listenTo( view, 'execute', () => this._showView() );

			return view;
		} );
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		super.destroy();

		// Destroy created UI components as they are not automatically destroyed.
		// See https://github.com/ckeditor/ckeditor5/issues/1341.
		this.view.destroy();
	}

	/**
	 * Creates the {@link module:table/ui/tablecellpropertiesview~TableCellPropertiesView} instance.
	 *
	 * @private
	 * @returns {module:table/ui/tablecellpropertiesview~TableCellPropertiesView} The cell properties form
	 * view instance.
	 */
	_createPropertiesView() {
		const editor = this.editor;
		const view = editor.editing.view;
		const viewDocument = view.document;

		/**
		 * The properties form view displayed inside the balloon.
		 *
		 * @member {module:table/ui/tablecellpropertiesview~TableCellPropertiesView}
		 */
		this.view = new TableCellPropertiesView( editor.locale );

		// Render the view so its #element is available for clickOutsideHandler.
		this.view.render();

		this.listenTo( this.view, 'submit', () => {
			this._hideView();
		} );

		this.listenTo( this.view, 'cancel', () => {
			editor.execute( 'undo', this._batch );
			this._hideView();
		} );

		// Close the balloon on Esc key press when the **form has focus**.
		this.view.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hideView();
			cancel();
		} );

		// Reposition the balloon or hide the form if an image widget is no longer selected.
		this.listenTo( editor.ui, 'update', () => {
			if ( !getTableWidgetAncestor( viewDocument.selection ) ) {
				this._hideView();
			} else if ( this._isViewVisible ) {
				repositionContextualBalloon( editor );
			}
		} );

		// Close on click outside of balloon panel element.
		clickOutsideHandler( {
			emitter: this.view,
			activator: () => this._isViewInBalloon,
			contextElements: [ this._balloon.view.element ],
			callback: () => this._hideView()
		} );
	}

	_startRespondingToChangesInView() {
		const editor = this.editor;
		const model = editor.model;
		const document = model.document;
		const selection = document.selection;

		this.view.on( 'update', ( evt, data ) => {
			const firstPosition = selection.getFirstPosition();
			const tableCell = findAncestor( 'tableCell', firstPosition );

			// Enqueue all changes into a single batch so clicking "Cancel" can undo them
			// as a single undo steps. It's a better UX than dozens of undo steps, e.g. each
			// for a single value change.
			editor.model.enqueueChange( this._batch, writer => {
				for ( const property in data ) {
					const value = data[ property ];

					if ( QUAD_DIRECTION_ATTRIBUTES.includes( property ) ) {
						writer.setAttribute( property, {
							top: value,
							right: value,
							bottom: value,
							left: value
						}, tableCell );
					} else {
						writer.setAttribute( property, value, tableCell );
					}
				}
			} );
		} );
	}

	_fillViewFormFromSelectedCell() {
		const editor = this.editor;
		const model = editor.model;
		const document = model.document;
		const selection = document.selection;
		const firstPosition = selection.getFirstPosition();
		const tableCell = findAncestor( 'tableCell', firstPosition );

		const borderWidth = unifyQuadDirectionPropertyValue( tableCell.getAttribute( 'borderWidth' ) ) || '';
		const borderColor = unifyQuadDirectionPropertyValue( tableCell.getAttribute( 'borderColor' ) ) || '';
		const borderStyle = unifyQuadDirectionPropertyValue( tableCell.getAttribute( 'borderStyle' ) ) || DEFAULT_BORDER_STYLE;
		const padding = unifyQuadDirectionPropertyValue( tableCell.getAttribute( 'padding' ) ) || '';
		const backgroundColor = tableCell.getAttribute( 'backgroundColor' ) || '';
		const horizontalAlignment = tableCell.getAttribute( 'horizontalAlignment' ) || DEFAULT_HORIZONTAL_ALIGNMENT;
		const verticalAlignment = tableCell.getAttribute( 'verticalAlignment' ) || DEFAULT_VERTICAL_ALIGNMENT;

		const view = this.view;

		view.borderWidthInput.inputView.element.value = '';
		view.borderColorInput.inputView.element.value = '';
		view.paddingInput.inputView.element.value = '';
		view.backgroundInput.inputView.element.value = '';

		view.set( {
			borderWidth,
			borderColor,
			borderStyle,
			padding,
			backgroundColor,
			horizontalAlignment,
			verticalAlignment
		} );
	}

	_showView() {
		if ( this._isViewVisible ) {
			return;
		}

		const editor = this.editor;

		if ( !this._isViewInBalloon ) {
			this._balloon.add( {
				view: this.view,
				position: getBalloonPositionData( editor )
			} );
		}

		// Create a new batch. Clicking "Cancel" will undo this batch.
		this._batch = editor.model.createBatch();

		// Update the view with the model values.
		this._fillViewFormFromSelectedCell();

		// Basic a11y.
		this.view.focus();
	}

	/**
	 * Removes the {@link #view} from the {@link #_balloon}.
	 *
	 * See {@link #_addFormView}, {@link #_addActionsView}.
	 *
	 * @protected
	 */
	_hideView() {
		if ( !this._isViewInBalloon ) {
			return;
		}

		const editor = this.editor;

		this.stopListening( editor.ui, 'update' );
		this.stopListening( this._balloon, 'change:visibleView' );

		// Make sure the focus always gets back to the editable _before_ removing the focused properties view.
		// Doing otherwise causes issues in some browsers. See https://github.com/ckeditor/ckeditor5-link/issues/193.
		editor.editing.view.focus();

		if ( this._isViewInBalloon ) {
			// TODO below
			// Blur the input element before removing it from DOM to prevent issues in some browsers.
			// See https://github.com/ckeditor/ckeditor5/issues/1501.
			// this.formView.saveButtonView.focus();

			this._balloon.remove( this.view );

			// Because the form has an input which has focus, the focus must be brought back
			// to the editor. Otherwise, it would be lost.
			this.editor.editing.view.focus();
		}
	}

	/**
	 * Returns `true` when the {@link #view} is the visible view in the {@link #_balloon}.
	 *
	 * @private
	 * @type {Boolean}
	 */
	get _isViewVisible() {
		return this._balloon.visibleView === this.view;
	}

	/**
	 * Returns `true` when the {@link #view} is in the {@link #_balloon}.
	 *
	 * @private
	 * @type {Boolean}
	 */
	get _isViewInBalloon() {
		return this._balloon.hasView( this.view );
	}
}

function unifyQuadDirectionPropertyValue( value ) {
	if ( !value ) {
		return;
	}

	// Unify width to one value. If different values are set default to top (or right, etc).
	value = value.top || value.right || value.bottom || value.left;

	return value;
}
