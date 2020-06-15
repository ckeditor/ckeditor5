/**
 * @license Copyright (c) 2003-2020, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* global DOMParser */

/**
 * @module widget/widgettypearound
 */

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Template from '@ckeditor/ckeditor5-ui/src/template';
import {
	isArrowKeyCode,
	isForwardArrowKeyCode,
	keyCodes
} from '@ckeditor/ckeditor5-utils/src/keyboard';
import priorities from '@ckeditor/ckeditor5-utils/src/priorities';

import {
	isTypeAroundWidget,
	getClosestTypeAroundDomButton,
	getTypeAroundButtonPosition,
	getClosestWidgetViewElement
} from './utils';

import {
	isNonTypingKeystroke
} from '@ckeditor/ckeditor5-typing/src/utils/injectunsafekeystrokeshandling';

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
	static get pluginName() {
		return 'WidgetTypeAround';
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * A reference to the model widget element that has the "fake caret" active
		 * on either side of it. It is later used to remove CSS classes associated with the "fake caret"
		 * when the widget no longer needs it.
		 *
		 * @private
		 * @member {module:engine/model/element~Element|null}
		 */
		this._currentFakeCaretModelElement = null;
	}

	/**
	 * @inheritDoc
	 */
	init() {
		this._enableTypeAroundUIInjection();
		this._enableInsertingParagraphsOnButtonClick();
		this._enableInsertingParagraphsOnEnterKeypress();
		this._enableInsertingParagraphsOnTypingKeystroke();
		this._enableTypeAroundFakeCaretActivationUsingKeyboardArrows();
		this._enableDeleteIntegration();
		this._enableInsertContentIntegration();
	}

	/**
	 * @inheritDoc
	 */
	destroy() {
		this._currentFakeCaretModelElement = null;
	}

	/**
	 * Inserts a new paragraph next to a widget element with the selection anchored in it.
	 *
	 * **Note**: This method is heavily user-oriented and will both focus the editing view and scroll
	 * the viewport to the selection in the inserted paragraph.
	 *
	 * @protected
	 * @param {module:engine/model/element~Element} widgetModelElement The model widget element next to which a paragraph is inserted.
	 * @param {'before'|'after'} position The position where the paragraph is inserted. Either `'before'` or `'after'` the widget.
	 */
	_insertParagraph( widgetModelElement, position ) {
		const editor = this.editor;
		const editingView = editor.editing.view;

		editor.execute( 'insertParagraph', {
			position: editor.model.createPositionAt( widgetModelElement, position )
		} );

		editingView.focus();
		editingView.scrollToTheSelection();
	}

	/**
	 * Similar to {@link #_insertParagraph}, this method inserts a paragraph except that it
	 * does not expect a position but it performs the insertion next to a selected widget
	 * according to the "widget-type-around" model selection attribute value.
	 *
	 * Because this method requires the "widget-type-around" attribute to be set,
	 * the insertion can only happen when the widget "fake caret" is active (e.g. activated
	 * using the keyboard).
	 *
	 * @private
	 * @returns {Boolean} Returns `true` when the paragraph was inserted (the attribute was present) and `false` otherwise.
	 */
	_insertParagraphAccordingToSelectionAttribute() {
		const editor = this.editor;
		const model = editor.model;
		const modelSelection = model.document.selection;
		const typeAroundSelectionAttributeValue = modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE );

		if ( !typeAroundSelectionAttributeValue ) {
			return false;
		}

		const selectedModelElement = modelSelection.getSelectedElement();

		this._insertParagraph( selectedModelElement, typeAroundSelectionAttributeValue );

		return true;
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
			}
		}, { priority: 'low' } );
	}

	/**
	 * Brings support for the "fake caret" that appears when either:
	 *
	 * * the selection moves from a position next to a widget (to a widget) using arrow keys,
	 * * the arrow key is pressed when the widget is already selected.
	 *
	 * The "fake caret" lets the user know that they can start typing or just press
	 * enter to insert a paragraph at the position next to a widget as suggested by the "fake caret".
	 *
	 * The "fake caret" disappears when the user changes the selection or the editor
	 * gets blurred.
	 *
	 * The whole idea is as follows:
	 *
	 * 1. A user does one of the 2 scenarios described at the beginning.
	 * 2. The "keydown" listener is executed and the decision is made whether to show or hide the "fake caret".
	 * 3. If it should show up, the "widget-type-around" model selection attribute is set indicating
	 *    on which side of the widget it should appear.
	 * 4. The selection dispatcher reacts to the selection attribute and sets CSS classes responsible for the
	 *    "fake caret" on the view widget.
	 * 5. If the "fake caret" should disappear, the selection attribute is removed and the dispatcher
	 *    does the CSS class clean-up in the view.
	 * 6. Additionally, "change:range" and FocusTracker#isFocused listeners also remove the selection
	 *    attribute (the former also removes widget CSS classes).
	 *
	 * @private
	 */
	_enableTypeAroundFakeCaretActivationUsingKeyboardArrows() {
		const editor = this.editor;
		const model = editor.model;
		const modelSelection = model.document.selection;
		const schema = model.schema;
		const editingView = editor.editing.view;

		// This is the main listener responsible for the "fake caret".
		// Note: The priority must precede the default Widget class keydown handler ("high") and the
		// TableKeyboard keydown handler ("high-10").
		editingView.document.on( 'keydown', ( evt, domEventData ) => {
			if ( isArrowKeyCode( domEventData.keyCode ) ) {
				this._handleArrowKeyPress( evt, domEventData );
			}
		}, { priority: priorities.get( 'high' ) + 10 } );

		// This listener makes sure the widget type around selection attribute will be gone from the model
		// selection as soon as the model range changes. This attribute only makes sense when a widget is selected
		// (and the "fake horizontal caret" is visible) so whenever the range changes (e.g. selection moved somewhere else),
		// let's get rid of the attribute so that the selection downcast dispatcher isn't even bothered.
		modelSelection.on( 'change:range', ( evt, data ) => {
			// Do not reset the selection attribute when the change was indirect.
			if ( !data.directChange ) {
				return;
			}

			// Get rid of the widget type around attribute of the selection on every change:range.
			// If the range changes, it means for sure, the user is no longer in the active ("fake horizontal caret") mode.
			editor.model.change( writer => {
				writer.removeSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE );
			} );
		} );

		// Get rid of the widget type around attribute of the selection on every document change
		// that makes widget not selected any more (i.e. widget was removed).
		model.document.on( 'change:data', () => {
			const selectedModelElement = modelSelection.getSelectedElement();

			if ( selectedModelElement ) {
				const selectedViewElement = editor.editing.mapper.toViewElement( selectedModelElement );

				if ( isTypeAroundWidget( selectedViewElement, selectedModelElement, schema ) ) {
					return;
				}
			}

			editor.model.change( writer => {
				writer.removeSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE );
			} );
		} );

		// React to changes of the model selection attribute made by the arrow keys listener.
		// If the block widget is selected and the attribute changes, downcast the attribute to special
		// CSS classes associated with the active ("fake horizontal caret") mode of the widget.
		editor.editing.downcastDispatcher.on( 'selection', ( evt, data, conversionApi ) => {
			const writer = conversionApi.writer;

			if ( this._currentFakeCaretModelElement ) {
				const selectedViewElement = conversionApi.mapper.toViewElement( this._currentFakeCaretModelElement );

				if ( selectedViewElement ) {
					// Get rid of CSS classes associated with the active ("fake horizontal caret") mode from the view widget.
					writer.removeClass( POSSIBLE_INSERTION_POSITIONS.map( positionToWidgetCssClass ), selectedViewElement );

					this._currentFakeCaretModelElement = null;
				}
			}

			const selectedModelElement = data.selection.getSelectedElement();

			if ( !selectedModelElement ) {
				return;
			}

			const selectedViewElement = conversionApi.mapper.toViewElement( selectedModelElement );

			if ( !isTypeAroundWidget( selectedViewElement, selectedModelElement, schema ) ) {
				return;
			}

			const typeAroundSelectionAttribute = data.selection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE );

			if ( !typeAroundSelectionAttribute ) {
				return;
			}

			writer.addClass( positionToWidgetCssClass( typeAroundSelectionAttribute ), selectedViewElement );

			// Remember the view widget that got the "fake-caret" CSS class. This class should be removed ASAP when the
			// selection changes
			this._currentFakeCaretModelElement = selectedModelElement;
		} );

		this.listenTo( editor.ui.focusTracker, 'change:isFocused', ( evt, name, isFocused ) => {
			if ( !isFocused ) {
				editor.model.change( writer => {
					writer.removeSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE );
				} );
			}
		} );

		function positionToWidgetCssClass( position ) {
			return `ck-widget_type-around_show-fake-caret_${ position }`;
		}
	}

	/**
	 * A listener executed on each "keydown" in the view document, a part of
	 * {@link #_enableTypeAroundFakeCaretActivationUsingKeyboardArrows}.
	 *
	 * It decides whether the arrow key press should activate the "fake caret" or not (also whether it should
	 * be deactivated).
	 *
	 * The "fake caret" activation is done by setting the "widget-type-around" model selection attribute
	 * in this listener and stopping&preventing the event that would normally be handled by the Widget
	 * plugin that is responsible for the regular keyboard navigation near/across all widgets (that
	 * includes inline widgets, which are ignored by the WidgetTypeAround plugin).
	 *
	 * @private
	 */
	_handleArrowKeyPress( evt, domEventData ) {
		const editor = this.editor;
		const model = editor.model;
		const modelSelection = model.document.selection;
		const schema = model.schema;
		const editingView = editor.editing.view;

		const keyCode = domEventData.keyCode;
		const isForward = isForwardArrowKeyCode( keyCode, editor.locale.contentLanguageDirection );
		const selectedViewElement = editingView.document.selection.getSelectedElement();
		const selectedModelElement = editor.editing.mapper.toModelElement( selectedViewElement );
		let shouldStopAndPreventDefault;

		// Handle keyboard navigation when a type-around-compatible widget is currently selected.
		if ( isTypeAroundWidget( selectedViewElement, selectedModelElement, schema ) ) {
			shouldStopAndPreventDefault = this._handleArrowKeyPressOnSelectedWidget( isForward );
		}
		// Handle keyboard arrow navigation when the selection is next to a type-around-compatible widget
		// and the widget is about to be selected.
		else if ( modelSelection.isCollapsed ) {
			shouldStopAndPreventDefault = this._handleArrowKeyPressWhenSelectionNextToAWidget( isForward );
		}

		if ( shouldStopAndPreventDefault ) {
			domEventData.preventDefault();
			evt.stop();
		}
	}

	/**
	 * Handles the keyboard navigation on "keydown" when a widget is currently selected and activates or deactivates
	 * the "fake caret" for that widget, depending on the current value of the "widget-type-around" model
	 * selection attribute and the direction of the pressed arrow key.
	 *
	 * @private
	 * @param {Boolean} isForward `true` when the pressed arrow key was responsible for the forward model selection movement
	 * as in {@link module:utils/keyboard~isForwardArrowKeyCode}.
	 * @returns {Boolean} `true` when the key press was handled and no other keydown listener of the editor should
	 * process the event any further. `false` otherwise.
	 */
	_handleArrowKeyPressOnSelectedWidget( isForward ) {
		const editor = this.editor;
		const model = editor.model;
		const modelSelection = model.document.selection;
		const typeAroundSelectionAttribute = modelSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE );

		return model.change( writer => {
			// If the selection already has the attribute...
			if ( typeAroundSelectionAttribute ) {
				const isLeavingWidget = typeAroundSelectionAttribute === ( isForward ? 'after' : 'before' );

				// If the keyboard arrow works against the value of the selection attribute...
				// then remove the selection attribute but prevent default DOM actions
				// and do not let the Widget plugin listener move the selection. This brings
				// the widget back to the state, for instance, like if was selected using the mouse.
				//
				// **Note**: If leaving the widget when the "fake caret" is active, then the default
				// Widget handler will change the selection and, in turn, this will automatically discard
				// the selection attribute.
				if ( !isLeavingWidget ) {
					writer.removeSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE );

					return true;
				}
			}
			// If the selection didn't have the attribute, let's set it now according to the direction of the arrow
			// key press. This also means we cannot let the Widget plugin listener move the selection.
			else {
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, isForward ? 'after' : 'before' );

				return true;
			}

			return false;
		} );
	}

	/**
	 * Handles the keyboard navigation on "keydown" when **no** widget is selected but the selection is **directly** next
	 * to one and upon the "fake caret" should become active for this widget upon arrow key press
	 * (AKA entering/selecting the widget).
	 *
	 * **Note**: This code mirrors the implementation from the Widget plugin but also adds the selection attribute.
	 * Unfortunately, there's no safe way to let the Widget plugin do the selection part first and then just set the
	 * selection attribute here in the WidgetTypeAround plugin. This is why this code must duplicate some from the Widget plugin.
	 *
	 * @private
	 * @param {Boolean} isForward `true` when the pressed arrow key was responsible for the forward model selection movement
	 * as in {@link module:utils/keyboard~isForwardArrowKeyCode}.
	 * @returns {Boolean} `true` when the key press was handled and no other keydown listener of the editor should
	 * process the event any further. `false` otherwise.
	 */
	_handleArrowKeyPressWhenSelectionNextToAWidget( isForward ) {
		const editor = this.editor;
		const model = editor.model;
		const schema = model.schema;
		const widgetPlugin = editor.plugins.get( 'Widget' );

		// This is the widget the selection is about to be set on.
		const modelElementNextToSelection = widgetPlugin._getObjectElementNextToSelection( isForward );
		const viewElementNextToSelection = editor.editing.mapper.toViewElement( modelElementNextToSelection );

		if ( isTypeAroundWidget( viewElementNextToSelection, modelElementNextToSelection, schema ) ) {
			model.change( writer => {
				widgetPlugin._setSelectionOverElement( modelElementNextToSelection );
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, isForward ? 'before' : 'after' );
			} );

			// The change() block above does the same job as the Widget plugin. The event can
			// be safely canceled.
			return true;
		}

		return false;
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
			const widgetModelElement = editor.editing.mapper.toModelElement( widgetViewElement );

			this._insertParagraph( widgetModelElement, buttonPosition );

			domEventData.preventDefault();
			evt.stop();
		} );
	}

	/**
	 * Creates the "enter" key listener on the view document that allows the user to insert a paragraph
	 * near the widget when either:
	 *
	 * * The "fake caret" was first activated using the arrow keys,
	 * * The entire widget is selected in the model.
	 *
	 * In the first case, the new paragraph is inserted according to the "widget-type-around" selection
	 * attribute (see {@link #_handleArrowKeyPress}).
	 *
	 * It the second case, the new paragraph is inserted based on whether a soft (Shift+Enter) keystroke
	 * was pressed or not.
	 *
	 * @private
	 */
	_enableInsertingParagraphsOnEnterKeypress() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		this.listenTo( editingView.document, 'enter', ( evt, domEventData ) => {
			const selectedViewElement = editingView.document.selection.getSelectedElement();
			const selectedModelElement = editor.editing.mapper.toModelElement( selectedViewElement );
			const schema = editor.model.schema;
			let wasHandled;

			// First check if the widget is selected and there's a type around selection attribute associated
			// with the "fake caret" that would tell where to insert a new paragraph.
			if ( this._insertParagraphAccordingToSelectionAttribute() ) {
				wasHandled = true;
			}
			// Then, if there is no selection attribute associated with the "fake caret", check if the widget
			// simply is selected and create a new paragraph according to the keystroke (Shift+)Enter.
			else if ( isTypeAroundWidget( selectedViewElement, selectedModelElement, schema ) ) {
				this._insertParagraph( selectedModelElement, domEventData.isSoft ? 'before' : 'after' );

				wasHandled = true;
			}

			if ( wasHandled ) {
				domEventData.preventDefault();
				evt.stop();
			}
		} );
	}

	/**
	 * Similar to the {@link #_enableInsertingParagraphsOnEnterKeypress}, it allows the user
	 * to insert a paragraph next to a widget when the "fake caret" was activated using arrow
	 * keys but it responds to "typing keystrokes" instead of "enter".
	 *
	 * "Typing keystrokes" are keystrokes that insert new content into the document
	 * like, for instance, letters ("a") or numbers ("4"). The "keydown" listener enabled by this method
	 * will insert a new paragraph according to the "widget-type-around" model selection attribute
	 * as the user simply starts typing, which creates the impression that the "fake caret"
	 * behaves like a "real one" rendered by the browser (AKA your text appears where the caret was).
	 *
	 * **Note**: ATM this listener creates 2 undo steps: one for the "insertParagraph" command
	 * and the second for the actual typing. It's not a disaster but this may need to be fixed
	 * sooner or later.
	 *
	 * Learn more in {@link module:typing/utils/injectunsafekeystrokeshandling}.
	 *
	 * @private
	 */
	_enableInsertingParagraphsOnTypingKeystroke() {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const keyCodesHandledSomewhereElse = [
			keyCodes.enter,
			keyCodes.delete,
			keyCodes.backspace
		];

		// Note: The priority must precede the default Widget class keydown handler ("high") and the
		// TableKeyboard keydown handler ("high + 1").
		editingView.document.on( 'keydown', ( evt, domEventData ) => {
			// Don't handle enter/backspace/delete here. They are handled in dedicated listeners.
			if ( !keyCodesHandledSomewhereElse.includes( domEventData.keyCode ) && !isNonTypingKeystroke( domEventData ) ) {
				this._insertParagraphAccordingToSelectionAttribute();
			}
		}, { priority: priorities.get( 'high' ) + 1 } );
	}

	/**
	 * It creates a "delete" event listener on the view document to handle cases when delete/backspace
	 * is pressed and the "fake caret" is currently active.
	 *
	 * The "fake caret" should create an illusion of a "real browser caret" so that when it appears
	 * before/after a widget, pressing delete/backspace should remove a widget or delete a content
	 * before/after a widget (depending on the content surrounding the widget).
	 *
	 * @private
	 */
	_enableDeleteIntegration() {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const model = editor.model;
		const schema = model.schema;

		// Note: The priority must precede the default Widget class delete handler.
		this.listenTo( editingView.document, 'delete', ( evt, domEventData ) => {
			const typeAroundSelectionAttributeValue = model.document.selection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE );

			// This listener handles only these cases when the "fake caret" is active.
			if ( !typeAroundSelectionAttributeValue ) {
				return;
			}

			const direction = domEventData.direction;
			const selectedModelWidget = model.document.selection.getSelectedElement();

			const isFakeCaretBefore = typeAroundSelectionAttributeValue === 'before';
			const isForwardDelete = direction == 'forward';
			const shouldDeleteEntireWidget = isFakeCaretBefore === isForwardDelete;

			if ( shouldDeleteEntireWidget ) {
				editor.execute( 'delete', {
					selection: model.createSelection( selectedModelWidget, 'on' )
				} );
			} else {
				const range = schema.getNearestSelectionRange(
					model.createPositionAt( selectedModelWidget, typeAroundSelectionAttributeValue ),
					direction
				);

				// If there is somewhere to move selection to, then there will be something to delete.
				if ( range ) {
					// If the range is NOT collapsed, then we know that the range contains an object (see getNearestSelectionRange() docs).
					if ( !range.isCollapsed ) {
						model.change( writer => {
							writer.setSelection( range );
							editor.execute( isForwardDelete ? 'forwardDelete' : 'delete' );
						} );
					} else {
						const probe = model.createSelection( range.start );
						model.modifySelection( probe, { direction } );

						// If the range is collapsed, let's see if a non-collapsed range exists that can could be deleted.
						// If such range exists, use the editor command because it it safe for collaboration (it merges where it can).
						if ( !probe.focus.isEqual( range.start ) ) {
							model.change( writer => {
								writer.setSelection( range );
								editor.execute( isForwardDelete ? 'forwardDelete' : 'delete' );
							} );
						}
						// If there is no non-collapsed range to be deleted then we are sure that there is an empty element
						// next to a widget that should be removed. "delete" and "forwardDelete" commands cannot get rid of it
						// so calling Model#deleteContent here manually.
						else {
							const deepestEmptyRangeAncestor = getDeepestEmptyElementAncestor( schema, range.start.parent );

							model.deleteContent( model.createSelection( deepestEmptyRangeAncestor, 'on' ), {
								doNotAutoparagraph: true
							} );
						}
					}
				}
			}

			// If some content was deleted, don't let the handler from the Widget plugin kick in.
			// If nothing was deleted, then the default handler will have nothing to do anyway.
			domEventData.preventDefault();
			evt.stop();
		}, { priority: priorities.get( 'high' ) + 1 } );
	}

	/**
	 * Attaches the "insertContent" model event listener that allows the user to paste a content near the widget
	 * when the "fake caret" was first activated using the arrow keys.
	 *
	 * The content is inserted according to the "widget-type-around" selection attribute (see {@link #_handleArrowKeyPress}).
	 *
	 * @private
	 */
	_enableInsertContentIntegration() {
		const editor = this.editor;
		const model = this.editor.model;
		const documentSelection = model.document.selection;

		this.listenTo( editor.model, 'insertContent', ( evt, [ content, selectable ] ) => {
			if ( selectable && !selectable.is( 'documentSelection' ) ) {
				return;
			}

			const typeAroundSelectionAttributeValue = documentSelection.getAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE );

			if ( !typeAroundSelectionAttributeValue ) {
				return;
			}

			evt.stop();

			return model.change( writer => {
				const selectedElement = documentSelection.getSelectedElement();
				const position = model.createPositionAt( selectedElement, typeAroundSelectionAttributeValue );
				const selection = writer.createSelection( position );

				const result = model.insertContent( content, selection );

				writer.setSelection( selection );

				return result;
			} );
		}, { priority: 'high' } );
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
		injectFakeCaret( wrapperDomElement );

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
function injectFakeCaret( wrapperDomElement ) {
	const caretTemplate = new Template( {
		tag: 'div',
		attributes: {
			class: [
				'ck',
				'ck-widget__type-around__fake-caret'
			]
		}
	} );

	wrapperDomElement.appendChild( caretTemplate.render() );
}

// Returns the ancestor of an element closest to the root which is empty. For instance,
// for `<baz>`:
//
//		<foo>abc<bar><baz></baz></bar></foo>
//
// it returns `<bar>`.
//
// @param {module:engine/model/schema~Schema} schema
// @param {module:engine/model/element~Element} element
// @returns {module:engine/model/element~Element|null}
function getDeepestEmptyElementAncestor( schema, element ) {
	let deepestEmptyAncestor = element;

	for ( const ancestor of element.getAncestors( { parentFirst: true } ) ) {
		if ( ancestor.childCount > 1 || schema.isLimit( ancestor ) ) {
			break;
		}

		deepestEmptyAncestor = ancestor;
	}

	return deepestEmptyAncestor;
}
