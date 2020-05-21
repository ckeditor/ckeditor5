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
	isArrowKeyCode,
	isForwardArrowKeyCode
} from '@ckeditor/ckeditor5-utils/src/keyboard';
import priorities from '@ckeditor/ckeditor5-utils/src/priorities';

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

const TYPE_AROUND_SELECTION_ATTRIBUTE = 'widget-type-around';

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
		this._enableInsertingParagraphsOnEnterKeypress();
		this._enableTypeAroundActivationUsingKeyboardArrows();

		// TODO: This is a quick fix and it should be removed the proper integration arrives.
		this._enableTemporaryTrackChangesIntegration();
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
		const widgetModelElement = editor.editing.mapper.toModelElement( widgetViewElement );
		let modelPosition;

		if ( position === 'before' ) {
			modelPosition = editor.model.createPositionBefore( widgetModelElement );
		} else {
			modelPosition = editor.model.createPositionAfter( widgetModelElement );
		}

		editor.execute( 'insertParagraph', {
			position: modelPosition
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

	/**
	 * A quick fix for the integration with features requiring custom handling of the `insertParagraph`
	 * command such as Track Changes. When the `insertParagraph` command is disabled, this fix adds
	 * a CSS class to editor roots that makes the UI disappear.
	 *
	 * TODO: This is a quick fix and it should be replaced by a proper integration.
	 *
	 * @private
	 */
	_enableTemporaryTrackChangesIntegration() {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const insertParagraphCommand = this.editor.commands.get( 'insertParagraph' );
		const className = 'ck-widget_type-around_temp-disabled';

		this.listenTo( insertParagraphCommand, 'change:isEnabled', ( evt, name, isEnabled ) => {
			editingView.change( writer => {
				for ( const root of editingView.document.roots ) {
					if ( isEnabled ) {
						writer.removeClass( className, root );
					} else {
						writer.addClass( className, root );
					}
				}
			} );
		} );
	}

	/**
	 * @private
	 */
	_enableTypeAroundActivationUsingKeyboardArrows() {
		const editor = this.editor;
		const model = editor.model;
		const modelSelection = model.document.selection;
		const schema = model.schema;
		const editingView = editor.editing.view;

		// Note: The priority must precede the default Widget class keydown handler.
		editingView.document.on( 'keydown', ( evt, domEventData ) => {
			const keyCode = domEventData.keyCode;

			if ( !isArrowKeyCode( keyCode ) ) {
				return;
			}

			const selectedViewElement = editingView.document.selection.getSelectedElement();
			const selectedModelElement = editor.editing.mapper.toModelElement( selectedViewElement );

			if ( !isTypeAroundWidget( selectedViewElement, selectedModelElement, schema ) ) {
				return;
			}

			const isForward = isForwardArrowKeyCode( keyCode, editor.locale.contentLanguageDirection );
			const typeAroundSelectionAttribute = modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE );

			editor.model.change( writer => {
				let shouldStopAndPreventDefault;

				// If the selection already has the attribute...
				if ( typeAroundSelectionAttribute ) {
					const selectionPosition = isForward ? modelSelection.getLastPosition() : modelSelection.getFirstPosition();
					const nearestSelectionRange = schema.getNearestSelectionRange( selectionPosition, isForward ? 'forward' : 'backward' );
					const isLeavingWidget = typeAroundSelectionAttribute === ( isForward ? 'after' : 'before' );

					// ...and the keyboard arrow matches the value of the selection attribute...
					if ( isLeavingWidget ) {
						// ...and if there is some place for the selection to go to...
						if ( nearestSelectionRange ) {
							// ...then just remove the attribute and let the default Widget plugin listener handle moving the selection.
							writer.removeSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE );
						}

						// If the selection had nowhere to go, let's leave the attribute as it was and pass through
						// to the Widget plugin listener which will... in fact also do nothing. But this is no longer
						// the problem of the WidgetTypeAround plugin.
					}
					// ...and the keyboard arrow works against the value of the selection attribute...
					else {
						// ...then remove the selection attribute but prevent default DOM actions
						// and do not let the Widget plugin listener move the selection. This brings
						// the widget back to the state, for instance, like if was selected using the mouse.
						writer.removeSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE );
						shouldStopAndPreventDefault = true;
					}
				}
				// If the selection didn't have the attribute, let's set it now according to the direction of the arrow
				// key press. This also means we cannot let the Widget plugin listener move the selection.
				else {
					const widgetTypeAroundPositions = getWidgetTypeAroundPositions( selectedViewElement );

					// Set the selection attribute only if the keystroke direction matches the type around position
					// of the widget.
					if ( isForward && widgetTypeAroundPositions.includes( 'after' ) ) {
						writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'after' );
						shouldStopAndPreventDefault = true;
					} else if ( !isForward && widgetTypeAroundPositions.includes( 'before' ) ) {
						writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, 'before' );
						shouldStopAndPreventDefault = true;
					}
				}

				if ( shouldStopAndPreventDefault ) {
					domEventData.preventDefault();
					evt.stop();
				}
			} );
		}, { priority: priorities.get( 'high' ) + 1 } );

		modelSelection.on( 'change:range', () => {
			if ( !modelSelection.hasAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE ) ) {
				return;
			}

			// Get rid of the widget type around attribute of the selection on every change:range.
			// If the range changes, it means for sure, the user is no longer in the active ("blinking line") mode.
			editor.model.change( writer => {
				// TODO: use data.directChange to not break collaboration?
				writer.removeSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE );
			} );

			// Also, if the range changes, get rid of CSS classes associated with the active ("blinking line") mode.
			// There's no way to do that in the "selection" downcast dispatcher because it is executed too late.
			editingView.change( writer => {
				const selectedViewElement = editingView.document.selection.getSelectedElement();

				writer.removeClass( POSSIBLE_INSERTION_POSITIONS.map( positionToWidgetCssClass ), selectedViewElement );
			} );
		} );

		// React to changes of the mode selection attribute made by the arrow keys listener.
		// If the block widget is selected and the attribute changes, downcast the attribute to special
		// CSS classes associated with the active ("blinking line") mode of the widget.
		editor.editing.downcastDispatcher.on( 'selection', ( evt, data, conversionApi ) => {
			const writer = conversionApi.writer;
			const selectedModelElement = data.selection.getSelectedElement();

			if ( !selectedModelElement ) {
				return;
			}

			const selectedViewElement = conversionApi.mapper.toViewElement( selectedModelElement );

			if ( !isTypeAroundWidget( selectedViewElement, selectedModelElement, schema ) ) {
				return;
			}

			const typeAroundSelectionAttribute = data.selection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE );

			if ( typeAroundSelectionAttribute ) {
				writer.addClass( positionToWidgetCssClass( typeAroundSelectionAttribute ), selectedViewElement );
			} else {
				writer.removeClass( POSSIBLE_INSERTION_POSITIONS.map( positionToWidgetCssClass ), selectedViewElement );
			}
		}, { priority: 'highest' } );

		function positionToWidgetCssClass( position ) {
			return `ck-widget_type-around_active_${ position }`;
		}
	}

	/**
	 * TODO
	 *
	 * @private
	 */
	_enableInsertingParagraphsOnEnterKeypress() {
		const editor = this.editor;
		const model = editor.model;
		const modelSelection = model.document.selection;
		const editingView = editor.editing.view;

		this.listenTo( editingView.document, 'enter', ( evt, domEventData ) => {
			const typeAroundSelectionAttribute = modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE );

			if ( !typeAroundSelectionAttribute ) {
				return;
			}

			const selectedViewElement = editingView.document.selection.getSelectedElement();

			this._insertParagraph( selectedViewElement, typeAroundSelectionAttribute );

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
		injectLines( wrapperDomElement );

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

// @param {HTMLElement} wrapperDomElement
function injectLines( wrapperDomElement ) {
	for ( const position of POSSIBLE_INSERTION_POSITIONS ) {
		const lineTemplate = new Template( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-widget__type-around__line',
					`ck-widget__type-around__line_${ position }`
				]
			}
		} );

		wrapperDomElement.appendChild( lineTemplate.render() );
	}
}
