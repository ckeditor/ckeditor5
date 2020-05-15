/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global DOMParser */

/**
 * @module widget/widgettypearound
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Template from '@ckeditor/ckeditor5-ui/src/template';

import {
	isTypeAroundWidget,
	getWidgetTypeAroundPositions,
	getClosestTypeAroundDomButton,
	getTypeAroundButtonPosition,
	getClosestWidgetViewElement
} from './utils';

import returnIcon from '../../theme/icons/return-arrow.svg';
import '../../theme/widgettypearound.css';

const POSSIBLE_INSERTION_POSITIONS = [ 'before', 'after' ];

// Do the SVG parsing once and then clone the result <svg> DOM element for each new button.
const RETURN_ARROW_ICON_ELEMENT = new DOMParser().parseFromString( returnIcon, 'image/svg+xml' ).firstChild;

/**
 * A plugin that allows users to type around widgets where normally it is impossible to place the caret due
 * to limitations of web browsers. These "tight spots" occur, for instance, before (or after) a widget being
 * the first (or last) child of its parent or between two block widgets.
 *
 * This plugin extends the {@link module:widget/widget~Widget `Widget`} plugin and injects a user interface
 * with two buttons into each widget instance in the editor. Each of the buttons can be clicked by the
 * user if the widget is next to the "tight spot". Once clicked, a paragraph is created with the selection anchored
 * in it so that users can type (or insert content, paste, etc.) straight away.
 *
 * @extends module:core/plugin~Plugin
 * @private
 */
export default class WidgetTypeAround extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ Paragraph ];
	}

	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'WidgetTypeAround';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * A set containing all widgets in all editor roots that have the type around UI injected in
		 * {@link #_enableTypeAroundUIInjection}.
		 *
		 * Keeping track of them saves time, for instance, when updating their CSS classes.
		 *
		 * @private
		 * @readonly
		 * @member {Set} #_widgetsWithTypeAroundUI
		 */
		this._widgetsWithTypeAroundUI = new Set();
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this._widgetsWithTypeAroundUI.clear();
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this._enableTypeAroundUIInjection();
		this._enableDetectionOfTypeAroundWidgets();
		this._enableInsertingParagraphsOnButtonClick();
	}

	/**
	 * Inserts a new paragraph next to a widget element with the selection anchored in it.
	 *
	 * **Note**: This method is heavily user-oriented and will both focus the editing view and scroll
	 * the viewport to the selection in the inserted paragraph.
	 *
	 * @protected
	 * @param {module:engine/view/element~Element} widgetViewElement The view widget element next to which a paragraph is inserted.
	 * @param {'before'|'after'} position The position where the paragraph is inserted. Either `'before'` or `'after'` the widget.
	 */
	_insertParagraph( widgetViewElement, position ) {
		const editor = this.editor;
		const editingView = editor.editing.view;
		let viewPosition;

		if ( position === 'before' ) {
			viewPosition = editingView.createPositionBefore( widgetViewElement );
		} else {
			viewPosition = editingView.createPositionAfter( widgetViewElement );
		}

		const modelPosition = editor.editing.mapper.toModelPosition( viewPosition );

		editor.model.change( writer => {
			const paragraph = writer.createElement( 'paragraph' );

			writer.insert( paragraph, modelPosition );
			writer.setSelection( paragraph, 0 );
		} );

		editingView.focus();
		editingView.scrollToTheSelection();
	}

	/**
	 * Creates a listener in the editing conversion pipeline that injects the type around
	 * UI into every single widget instance created in the editor.
	 *
	 * The UI is delivered as a {@link module:engine/view/uielement~UIElement}
	 * wrapper which renders DOM buttons that users can use to insert paragraphs.
	 *
	 * @private
	 */
	_enableTypeAroundUIInjection() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const t = editor.locale.t;
		const buttonTitles = {
			before: t( 'Insert paragraph before block' ),
			after: t( 'Insert paragraph after block' )
		};

		editor.editing.downcastDispatcher.on( 'insert', ( evt, data, conversionApi ) => {
			const viewElement = conversionApi.mapper.toViewElement( data.item );

			// Filter out non-widgets and inline widgets.
			if ( isTypeAroundWidget( viewElement, data.item, schema ) ) {
				injectUIIntoWidget( conversionApi.writer, buttonTitles, viewElement );

				// Keep track of widgets that have the type around UI injected.
				// In the #_enableDetectionOfTypeAroundWidgets() we will iterate only over these
				// widgets instead of all children of the root. This should improve the performance.
				this._widgetsWithTypeAroundUI.add( viewElement );
			}
		}, { priority: 'low' } );
	}

	/**
	 * Registers an editing view post-fixer which checks all block widgets in the content
	 * and adds CSS classes to these which should have the typing around (UI) enabled
	 * and visible for the users.
	 *
	 * @private
	 */
	_enableDetectionOfTypeAroundWidgets() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		function positionToWidgetCssClass( position ) {
			return `ck-widget_can-type-around_${ position }`;
		}

		editingView.document.registerPostFixer( writer => {
			for ( const widgetViewElement of this._widgetsWithTypeAroundUI ) {
				// If the widget is no longer attached to the root (for instance, because it was removed),
				// there is no need to update its classes and we can safely forget about it.
				if ( !widgetViewElement.isAttached() ) {
					this._widgetsWithTypeAroundUI.delete( widgetViewElement );
				} else {
					// Update widgets' classes depending on possible positions for paragraph insertion.
					const positions = getWidgetTypeAroundPositions( widgetViewElement );

					// Remove all classes. In theory we could remove only these that will not be added a few lines later,
					// but since there are only two... KISS.
					writer.removeClass( POSSIBLE_INSERTION_POSITIONS.map( positionToWidgetCssClass ), widgetViewElement );

					// Set CSS classes related to possible positions. They are used so the UI knows which buttons to display.
					writer.addClass( positions.map( positionToWidgetCssClass ), widgetViewElement );
				}
			}
		} );
	}

	/**
	 * Registers a `mousedown` listener for the view document which intercepts events
	 * coming from the type around UI, which happens when a user clicks one of the buttons
	 * that insert a paragraph next to a widget.
	 *
	 * @private
	 */
	_enableInsertingParagraphsOnButtonClick() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		editingView.document.on( 'mousedown', ( evt, domEventData ) => {
			const button = getClosestTypeAroundDomButton( domEventData.domTarget );

			if ( !button ) {
				return;
			}

			const buttonPosition = getTypeAroundButtonPosition( button );
			const widgetViewElement = getClosestWidgetViewElement( button, editingView.domConverter );

			this._insertParagraph( widgetViewElement, buttonPosition );

			domEventData.preventDefault();
			evt.stop();
		} );
	}
}

// Injects the type around UI into a view widget instance.
//
// @param {module:engine/view/downcastwriter~DowncastWriter} viewWriter
// @param {Object.<String,String>} buttonTitles
// @param {module:engine/view/element~Element} widgetViewElement
function injectUIIntoWidget( viewWriter, buttonTitles, widgetViewElement ) {
	const typeAroundWrapper = viewWriter.createUIElement( 'div', {
		class: 'ck ck-reset_all ck-widget__type-around'
	}, function( domDocument ) {
		const wrapperDomElement = this.toDomElement( domDocument );

		injectButtons( wrapperDomElement, buttonTitles );

		return wrapperDomElement;
	} );

	// Inject the type around wrapper into the widget's wrapper.
	viewWriter.insert( viewWriter.createPositionAt( widgetViewElement, 'end' ), typeAroundWrapper );
}

// FYI: Not using the IconView class because each instance would need to be destroyed to avoid memory leaks
// and it's pretty hard to figure out when a view (widget) is gone for good so it's cheaper to use raw
// <svg> here.
//
// @param {HTMLElement} wrapperDomElement
// @param {Object.<String,String>} buttonTitles
function injectButtons( wrapperDomElement, buttonTitles ) {
	for ( const position of POSSIBLE_INSERTION_POSITIONS ) {
		const buttonTemplate = new Template( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-widget__type-around__button',
					`ck-widget__type-around__button_${ position }`
				],
				title: buttonTitles[ position ]
			},
			children: [
				wrapperDomElement.ownerDocument.importNode( RETURN_ARROW_ICON_ELEMENT, true )
			]
		} );

		wrapperDomElement.appendChild( buttonTemplate.render() );
	}
}
