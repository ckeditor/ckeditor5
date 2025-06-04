/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module widget/widgettypearound/widgettypearound
 */

import { Plugin } from '@ckeditor/ckeditor5-core';
import { IconReturnArrow } from '@ckeditor/ckeditor5-icons';
import { Template } from '@ckeditor/ckeditor5-ui';

import {
	Enter,
	type ViewDocumentEnterEvent
} from '@ckeditor/ckeditor5-enter';

import {
	Delete,
	type ViewDocumentDeleteEvent,
	type ViewDocumentInsertTextEvent
} from '@ckeditor/ckeditor5-typing';

import {
	env,
	isForwardArrowKeyCode,
	type BaseEvent,
	type Emitter,
	type GetCallback,
	type GetCallbackOptions,
	type ObservableChangeEvent,
	type KeystrokeInfo
} from '@ckeditor/ckeditor5-utils';

import type {
	BubblingEventInfo,
	DocumentChangeEvent,
	DomEventData,
	DowncastInsertEvent,
	DowncastSelectionEvent,
	DowncastWriter,
	Element,
	Schema,
	SelectionChangeRangeEvent,
	ViewDocumentArrowKeyEvent,
	ViewDocumentCompositionStartEvent,
	ViewDocumentKeyDownEvent,
	ViewDocumentMouseDownEvent,
	ViewElement,
	ModelDeleteContentEvent,
	ModelInsertContentEvent,
	ModelInsertObjectEvent
} from '@ckeditor/ckeditor5-engine';

import {
	isTypeAroundWidget,
	getClosestTypeAroundDomButton,
	getTypeAroundButtonPosition,
	getClosestWidgetViewElement,
	getTypeAroundFakeCaretPosition,
	TYPE_AROUND_SELECTION_ATTRIBUTE
} from './utils.js';

import { isWidget } from '../utils.js';
import type Widget from '../widget.js';

// @if CK_DEBUG_TYPING // const { _buildLogMessage } = require( '@ckeditor/ckeditor5-engine/src/dev-utils/utils.js' );

import '../../theme/widgettypearound.css';

const POSSIBLE_INSERTION_POSITIONS = [ 'before', 'after' ] as const;

// Do the SVG parsing once and then clone the result <svg> DOM element for each new button.
const RETURN_ARROW_ICON_ELEMENT = new DOMParser().parseFromString( IconReturnArrow, 'image/svg+xml' ).firstChild!;

const PLUGIN_DISABLED_EDITING_ROOT_CLASS = 'ck-widget__type-around_disabled';

/**
 * A plugin that allows users to type around widgets where normally it is impossible to place the caret due
 * to limitations of web browsers. These "tight spots" occur, for instance, before (or after) a widget being
 * the first (or last) child of its parent or between two block widgets.
 *
 * This plugin extends the {@link module:widget/widget~Widget `Widget`} plugin and injects the user interface
 * with two buttons into each widget instance in the editor. Each of the buttons can be clicked by the
 * user if the widget is next to the "tight spot". Once clicked, a paragraph is created with the selection anchored
 * in it so that users can type (or insert content, paste, etc.) straight away.
 */
export default class WidgetTypeAround extends Plugin {
	/**
	 * A reference to the model widget element that has the fake caret active
	 * on either side of it. It is later used to remove CSS classes associated with the fake caret
	 * when the widget no longer needs it.
	 */
	private _currentFakeCaretModelElement: Element | null = null;

	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'WidgetTypeAround' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ Enter, Delete ] as const;
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const editingView = editor.editing.view;

		// Set a CSS class on the view editing root when the plugin is disabled so all the buttons
		// and lines visually disappear. All the interactions are disabled in individual plugin methods.
		this.on<ObservableChangeEvent<boolean>>( 'change:isEnabled', ( evt, data, isEnabled ) => {
			editingView.change( writer => {
				for ( const root of editingView.document.roots ) {
					if ( isEnabled ) {
						writer.removeClass( PLUGIN_DISABLED_EDITING_ROOT_CLASS, root );
					} else {
						writer.addClass( PLUGIN_DISABLED_EDITING_ROOT_CLASS, root );
					}
				}
			} );

			if ( !isEnabled ) {
				editor.model.change( writer => {
					writer.removeSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE );
				} );
			}
		} );

		this._enableTypeAroundUIInjection();
		this._enableInsertingParagraphsOnButtonClick();
		this._enableInsertingParagraphsOnEnterKeypress();
		this._enableInsertingParagraphsOnTypingKeystroke();
		this._enableTypeAroundFakeCaretActivationUsingKeyboardArrows();
		this._enableDeleteIntegration();
		this._enableInsertContentIntegration();
		this._enableInsertObjectIntegration();
		this._enableDeleteContentIntegration();
	}

	/**
	 * @inheritDoc
	 */
	public override destroy(): void {
		super.destroy();

		this._currentFakeCaretModelElement = null;
	}

	/**
	 * Inserts a new paragraph next to a widget element with the selection anchored in it.
	 *
	 * **Note**: This method is heavily user-oriented and will both focus the editing view and scroll
	 * the viewport to the selection in the inserted paragraph.
	 *
	 * @param widgetModelElement The model widget element next to which a paragraph is inserted.
	 * @param position The position where the paragraph is inserted. Either `'before'` or `'after'` the widget.
	 */
	private _insertParagraph( widgetModelElement: Element, position: 'before' | 'after' ) {
		const editor = this.editor;
		const editingView = editor.editing.view;

		const attributesToCopy = editor.model.schema.getAttributesWithProperty( widgetModelElement, 'copyOnReplace', true );

		editor.execute( 'insertParagraph', {
			position: editor.model.createPositionAt( widgetModelElement, position ),
			attributes: attributesToCopy
		} );

		editingView.focus();
		editingView.scrollToTheSelection();
	}

	/**
	 * A wrapper for the {@link module:utils/emittermixin~Emitter#listenTo} method that executes the callbacks only
	 * when the plugin {@link #isEnabled is enabled}.
	 *
	 * @param emitter The object that fires the event.
	 * @param event The name of the event.
	 * @param callback The function to be called on event.
	 * @param options Additional options.
	 */
	private _listenToIfEnabled<TEvent extends BaseEvent>(
		emitter: Emitter,
		event: TEvent[ 'name' ],
		callback: OmitThisParameter<GetCallback<TEvent>>,
		options?: GetCallbackOptions<TEvent>
	): void {
		this.listenTo( emitter, event, ( ...args ) => {
			// Do not respond if the plugin is disabled.
			if ( this.isEnabled ) {
				callback( ...args );
			}
		}, options );
	}

	/**
	 * Similar to {@link #_insertParagraph}, this method inserts a paragraph except that it
	 * does not expect a position. Instead, it performs the insertion next to a selected widget
	 * according to the `widget-type-around` model selection attribute value (fake caret position).
	 *
	 * Because this method requires the `widget-type-around` attribute to be set,
	 * the insertion can only happen when the widget's fake caret is active (e.g. activated
	 * using the keyboard).
	 *
	 * @returns Returns `true` when the paragraph was inserted (the attribute was present) and `false` otherwise.
	 */
	private _insertParagraphAccordingToFakeCaretPosition() {
		const editor = this.editor;
		const model = editor.model;
		const modelSelection = model.document.selection;
		const typeAroundFakeCaretPosition = getTypeAroundFakeCaretPosition( modelSelection );

		if ( !typeAroundFakeCaretPosition ) {
			return false;
		}

		// @if CK_DEBUG_TYPING // if ( ( window as any ).logCKETyping ) {
		// @if CK_DEBUG_TYPING // 	console.info( ..._buildLogMessage( this, 'WidgetTypeAround',
		// @if CK_DEBUG_TYPING // 		'Fake caret -> insert paragraph',
		// @if CK_DEBUG_TYPING // 	) );
		// @if CK_DEBUG_TYPING // }

		const selectedModelElement = modelSelection.getSelectedElement()!;

		this._insertParagraph( selectedModelElement, typeAroundFakeCaretPosition );

		return true;
	}

	/**
	 * Creates a listener in the editing conversion pipeline that injects the widget type around
	 * UI into every single widget instance created in the editor.
	 *
	 * The UI is delivered as a {@link module:engine/view/uielement~UIElement}
	 * wrapper which renders DOM buttons that users can use to insert paragraphs.
	 */
	private _enableTypeAroundUIInjection() {
		const editor = this.editor;
		const schema = editor.model.schema;
		const t = editor.locale.t;
		const buttonTitles = {
			before: t( 'Insert paragraph before block' ),
			after: t( 'Insert paragraph after block' )
		};

		editor.editing.downcastDispatcher.on<DowncastInsertEvent<Element>>( 'insert', ( evt, data, conversionApi ) => {
			const viewElement = conversionApi.mapper.toViewElement( data.item );

			if ( !viewElement ) {
				return;
			}

			// Filter out non-widgets and inline widgets.
			if ( isTypeAroundWidget( viewElement, data.item, schema ) ) {
				injectUIIntoWidget( conversionApi.writer, buttonTitles, viewElement! );

				const widgetLabel = viewElement.getCustomProperty( 'widgetLabel' ) as Array<string | ( () => string )>;

				widgetLabel.push( () => {
					return this.isEnabled ? t( 'Press Enter to type after or press Shift + Enter to type before the widget' ) : '';
				} );
			}
		}, { priority: 'low' } );
	}

	/**
	 * Brings support for the fake caret that appears when either:
	 *
	 * * the selection moves to a widget from a position next to it using arrow keys,
	 * * the arrow key is pressed when the widget is already selected.
	 *
	 * The fake caret lets the user know that they can start typing or just press
	 * <kbd>Enter</kbd> to insert a paragraph at the position next to a widget as suggested by the fake caret.
	 *
	 * The fake caret disappears when the user changes the selection or the editor
	 * gets blurred.
	 *
	 * The whole idea is as follows:
	 *
	 * 1. A user does one of the 2 scenarios described at the beginning.
	 * 2. The "keydown" listener is executed and the decision is made whether to show or hide the fake caret.
	 * 3. If it should show up, the `widget-type-around` model selection attribute is set indicating
	 *    on which side of the widget it should appear.
	 * 4. The selection dispatcher reacts to the selection attribute and sets CSS classes responsible for the
	 *    fake caret on the view widget.
	 * 5. If the fake caret should disappear, the selection attribute is removed and the dispatcher
	 *    does the CSS class clean-up in the view.
	 * 6. Additionally, `change:range` and `FocusTracker#isFocused` listeners also remove the selection
	 *    attribute (the former also removes widget CSS classes).
	 */
	private _enableTypeAroundFakeCaretActivationUsingKeyboardArrows() {
		const editor = this.editor;
		const model = editor.model;
		const modelSelection = model.document.selection;
		const schema = model.schema;
		const editingView = editor.editing.view;

		// This is the main listener responsible for the fake caret.
		// Note: The priority must precede the default Widget class keydown handler ("high").
		this._listenToIfEnabled<ViewDocumentArrowKeyEvent>( editingView.document, 'arrowKey', ( evt, domEventData ) => {
			this._handleArrowKeyPress( evt, domEventData );
		}, { context: [ isWidget, '$text' ], priority: 'high' } );

		// This listener makes sure the widget type around selection attribute will be gone from the model
		// selection as soon as the model range changes. This attribute only makes sense when a widget is selected
		// (and the "fake horizontal caret" is visible) so whenever the range changes (e.g. selection moved somewhere else),
		// let's get rid of the attribute so that the selection downcast dispatcher isn't even bothered.
		this._listenToIfEnabled<SelectionChangeRangeEvent>( modelSelection, 'change:range', ( evt, data ) => {
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
		this._listenToIfEnabled<DocumentChangeEvent>( model.document, 'change:data', () => {
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
		this._listenToIfEnabled<DowncastSelectionEvent>( editor.editing.downcastDispatcher, 'selection', ( evt, data, conversionApi ) => {
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

			const typeAroundFakeCaretPosition = getTypeAroundFakeCaretPosition( data.selection );

			if ( !typeAroundFakeCaretPosition ) {
				return;
			}

			writer.addClass( positionToWidgetCssClass( typeAroundFakeCaretPosition ), selectedViewElement! );

			// Remember the view widget that got the "fake-caret" CSS class. This class should be removed ASAP when the
			// selection changes
			this._currentFakeCaretModelElement = selectedModelElement;
		} );

		this._listenToIfEnabled<ObservableChangeEvent<boolean>>( editor.ui.focusTracker, 'change:isFocused', ( evt, name, isFocused ) => {
			if ( !isFocused ) {
				editor.model.change( writer => {
					writer.removeSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE );
				} );
			}
		} );

		function positionToWidgetCssClass( position: 'before' | 'after' ) {
			return `ck-widget_type-around_show-fake-caret_${ position }`;
		}
	}

	/**
	 * A listener executed on each "keydown" in the view document, a part of
	 * {@link #_enableTypeAroundFakeCaretActivationUsingKeyboardArrows}.
	 *
	 * It decides whether the arrow keypress should activate the fake caret or not (also whether it should
	 * be deactivated).
	 *
	 * The fake caret activation is done by setting the `widget-type-around` model selection attribute
	 * in this listener, and stopping and preventing the event that would normally be handled by the widget
	 * plugin that is responsible for the regular keyboard navigation near/across all widgets (that
	 * includes inline widgets, which are ignored by the widget type around plugin).
	 */
	private _handleArrowKeyPress( evt: BubblingEventInfo<'arrowKey'>, domEventData: DomEventData & KeystrokeInfo ) {
		const editor = this.editor;
		const model = editor.model;
		const modelSelection = model.document.selection;
		const schema = model.schema;
		const editingView = editor.editing.view;

		const keyCode = domEventData.keyCode;
		const isForward = isForwardArrowKeyCode( keyCode, editor.locale.contentLanguageDirection );
		const selectedViewElement = editingView.document.selection.getSelectedElement()!;
		const selectedModelElement = editor.editing.mapper.toModelElement( selectedViewElement )!;
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
		// Handle collapsing a non-collapsed selection that is wider than on a single widget.
		else if ( !domEventData.shiftKey ) {
			shouldStopAndPreventDefault = this._handleArrowKeyPressWhenNonCollapsedSelection( isForward );
		}

		if ( shouldStopAndPreventDefault ) {
			domEventData.preventDefault();
			evt.stop();
		}
	}

	/**
	 * Handles the keyboard navigation on "keydown" when a widget is currently selected and activates or deactivates
	 * the fake caret for that widget, depending on the current value of the `widget-type-around` model
	 * selection attribute and the direction of the pressed arrow key.
	 *
	 * @param isForward `true` when the pressed arrow key was responsible for the forward model selection movement
	 * as in {@link module:utils/keyboard~isForwardArrowKeyCode}.
	 * @returns Returns `true` when the keypress was handled and no other keydown listener of the editor should
	 * process the event any further. Returns `false` otherwise.
	 */
	private _handleArrowKeyPressOnSelectedWidget( isForward: boolean ) {
		const editor = this.editor;
		const model = editor.model;
		const modelSelection = model.document.selection;
		const typeAroundFakeCaretPosition = getTypeAroundFakeCaretPosition( modelSelection );

		return model.change( writer => {
			// If the fake caret is displayed...
			if ( typeAroundFakeCaretPosition ) {
				const isLeavingWidget = typeAroundFakeCaretPosition === ( isForward ? 'after' : 'before' );

				// If the keyboard arrow works against the value of the selection attribute...
				// then remove the selection attribute but prevent default DOM actions
				// and do not let the Widget plugin listener move the selection. This brings
				// the widget back to the state, for instance, like if was selected using the mouse.
				//
				// **Note**: If leaving the widget when the fake caret is active, then the default
				// Widget handler will change the selection and, in turn, this will automatically discard
				// the selection attribute.
				if ( !isLeavingWidget ) {
					writer.removeSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE );

					return true;
				}
			}
			// If the fake caret wasn't displayed, let's set it now according to the direction of the arrow
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
	 * to one and upon the fake caret should become active for this widget upon arrow keypress
	 * (AKA entering/selecting the widget).
	 *
	 * **Note**: This code mirrors the implementation from the widget plugin but also adds the selection attribute.
	 * Unfortunately, there is no safe way to let the widget plugin do the selection part first and then just set the
	 * selection attribute here in the widget type around plugin. This is why this code must duplicate some from the widget plugin.
	 *
	 * @param isForward `true` when the pressed arrow key was responsible for the forward model selection movement
	 * as in {@link module:utils/keyboard~isForwardArrowKeyCode}.
	 * @returns Returns `true` when the keypress was handled and no other keydown listener of the editor should
	 * process the event any further. Returns `false` otherwise.
	 */
	private _handleArrowKeyPressWhenSelectionNextToAWidget( isForward: boolean ) {
		const editor = this.editor;
		const model = editor.model;
		const schema = model.schema;
		const widgetPlugin: Widget = editor.plugins.get( 'Widget' );

		// This is the widget the selection is about to be set on.
		const modelElementNextToSelection = widgetPlugin._getObjectElementNextToSelection( isForward )!;
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
	 * Handles the keyboard navigation on "keydown" when a widget is currently selected (together with some other content)
	 * and the widget is the first or last element in the selection. It activates or deactivates the fake caret for that widget.
	 *
	 * @param isForward `true` when the pressed arrow key was responsible for the forward model selection movement
	 * as in {@link module:utils/keyboard~isForwardArrowKeyCode}.
	 * @returns Returns `true` when the keypress was handled and no other keydown listener of the editor should
	 * process the event any further. Returns `false` otherwise.
	 */
	private _handleArrowKeyPressWhenNonCollapsedSelection( isForward: boolean ) {
		const editor = this.editor;
		const model = editor.model;
		const schema = model.schema;
		const mapper = editor.editing.mapper;
		const modelSelection = model.document.selection;

		const selectedModelNode = isForward ?
			modelSelection.getLastPosition()!.nodeBefore :
			modelSelection.getFirstPosition()!.nodeAfter;

		const selectedViewNode = mapper.toViewElement( selectedModelNode as any );

		// There is a widget at the collapse position so collapse the selection to the fake caret on it.
		if ( isTypeAroundWidget( selectedViewNode, selectedModelNode as any, schema ) ) {
			model.change( writer => {
				writer.setSelection( selectedModelNode!, 'on' );
				writer.setSelectionAttribute( TYPE_AROUND_SELECTION_ATTRIBUTE, isForward ? 'after' : 'before' );
			} );

			return true;
		}

		return false;
	}

	/**
	 * Registers a `mousedown` listener for the view document which intercepts events
	 * coming from the widget type around UI, which happens when a user clicks one of the buttons
	 * that insert a paragraph next to a widget.
	 */
	private _enableInsertingParagraphsOnButtonClick() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		this._listenToIfEnabled<ViewDocumentMouseDownEvent>( editingView.document, 'mousedown', ( evt, domEventData ) => {
			const button = getClosestTypeAroundDomButton( domEventData.domTarget );

			if ( !button ) {
				return;
			}

			const buttonPosition = getTypeAroundButtonPosition( button );
			const widgetViewElement = getClosestWidgetViewElement( button, editingView.domConverter );
			const widgetModelElement = editor.editing.mapper.toModelElement( widgetViewElement );

			this._insertParagraph( widgetModelElement!, buttonPosition );

			domEventData.preventDefault();
			evt.stop();
		} );
	}

	/**
	 * Creates the <kbd>Enter</kbd> key listener on the view document that allows the user to insert a paragraph
	 * near the widget when either:
	 *
	 * * The fake caret was first activated using the arrow keys,
	 * * The entire widget is selected in the model.
	 *
	 * In the first case, the new paragraph is inserted according to the `widget-type-around` selection
	 * attribute (see {@link #_handleArrowKeyPress}).
	 *
	 * In the second case, the new paragraph is inserted based on whether a soft (<kbd>Shift</kbd>+<kbd>Enter</kbd>) keystroke
	 * was pressed or not.
	 */
	private _enableInsertingParagraphsOnEnterKeypress() {
		const editor = this.editor;
		const selection = editor.model.document.selection;
		const editingView = editor.editing.view;

		this._listenToIfEnabled<ViewDocumentEnterEvent>( editingView.document, 'enter', ( evt, domEventData ) => {
			// This event could be triggered from inside the widget but we are interested
			// only when the widget is selected itself.
			if ( evt.eventPhase != 'atTarget' ) {
				return;
			}

			const selectedModelElement = selection.getSelectedElement()!;
			const selectedViewElement = editor.editing.mapper.toViewElement( selectedModelElement );

			const schema = editor.model.schema;
			let wasHandled;

			// First check if the widget is selected and there's a type around selection attribute associated
			// with the fake caret that would tell where to insert a new paragraph.
			if ( this._insertParagraphAccordingToFakeCaretPosition() ) {
				wasHandled = true;
			}
			// Then, if there is no selection attribute associated with the fake caret, check if the widget
			// simply is selected and create a new paragraph according to the keystroke (Shift+)Enter.
			else if ( isTypeAroundWidget( selectedViewElement, selectedModelElement, schema ) ) {
				this._insertParagraph( selectedModelElement, domEventData.isSoft ? 'before' : 'after' );

				wasHandled = true;
			}

			if ( wasHandled ) {
				domEventData.preventDefault();
				evt.stop();
			}
		}, { context: isWidget } );
	}

	/**
	 * Similar to the {@link #_enableInsertingParagraphsOnEnterKeypress}, it allows the user
	 * to insert a paragraph next to a widget when the fake caret was activated using arrow
	 * keys but it responds to typing instead of <kbd>Enter</kbd>.
	 *
	 * Listener enabled by this method will insert a new paragraph according to the `widget-type-around`
	 * model selection attribute as the user simply starts typing, which creates the impression that the fake caret
	 * behaves like a real one rendered by the browser (AKA your text appears where the caret was).
	 *
	 * **Note**: At the moment this listener creates 2 undo steps: one for the `insertParagraph` command
	 * and another one for actual typing. It is not a disaster but this may need to be fixed
	 * sooner or later.
	 */
	private _enableInsertingParagraphsOnTypingKeystroke() {
		const editor = this.editor;
		const viewDocument = editor.editing.view.document;

		// Note: The priority must precede the default Input plugin insertText handler.
		this._listenToIfEnabled<ViewDocumentInsertTextEvent>( viewDocument, 'insertText', ( evt, data ) => {
			if ( this._insertParagraphAccordingToFakeCaretPosition() ) {
				// The view selection in the event data contains the widget. If the new paragraph
				// was inserted, modify the view selection passed along with the insertText event
				// so the default event handler in the Input plugin starts typing inside the paragraph.
				// Otherwise, the typing would be over the widget.
				data.selection = viewDocument.selection;
			}
		}, { priority: 'high' } );

		if ( env.isAndroid ) {
			// On Android with English keyboard, the composition starts just by putting caret
			// at the word end or by selecting a table column. This is not a real composition started.
			// Trigger delete content on first composition key pressed.
			this._listenToIfEnabled<ViewDocumentKeyDownEvent>( viewDocument, 'keydown', ( evt, data ) => {
				if ( data.keyCode == 229 ) {
					this._insertParagraphAccordingToFakeCaretPosition();
				}
			} );
		} else {
			// Note: The priority must precede the default Input plugin compositionstart handler (to call it before delete content).
			this._listenToIfEnabled<ViewDocumentCompositionStartEvent>( viewDocument, 'compositionstart', () => {
				this._insertParagraphAccordingToFakeCaretPosition();
			}, { priority: 'highest' } );
		}
	}

	/**
	 * It creates a "delete" event listener on the view document to handle cases when the <kbd>Delete</kbd> or <kbd>Backspace</kbd>
	 * is pressed and the fake caret is currently active.
	 *
	 * The fake caret should create an illusion of a real browser caret so that when it appears before or after
	 * a widget, pressing <kbd>Delete</kbd> or <kbd>Backspace</kbd> should remove a widget or delete the content
	 * before or after a widget (depending on the content surrounding the widget).
	 */
	private _enableDeleteIntegration() {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const model = editor.model;
		const schema = model.schema;

		this._listenToIfEnabled<ViewDocumentDeleteEvent>( editingView.document, 'delete', ( evt, domEventData ) => {
			// This event could be triggered from inside the widget but we are interested
			// only when the widget is selected itself.
			if ( evt.eventPhase != 'atTarget' ) {
				return;
			}

			const typeAroundFakeCaretPosition = getTypeAroundFakeCaretPosition( model.document.selection );

			// This listener handles only these cases when the fake caret is active.
			if ( !typeAroundFakeCaretPosition ) {
				return;
			}

			const direction = domEventData.direction;
			const selectedModelWidget = model.document.selection.getSelectedElement();

			const isFakeCaretBefore = typeAroundFakeCaretPosition === 'before';
			const isDeleteForward = direction == 'forward';
			const shouldDeleteEntireWidget = isFakeCaretBefore === isDeleteForward;

			if ( shouldDeleteEntireWidget ) {
				editor.execute( 'delete', {
					selection: model.createSelection( selectedModelWidget!, 'on' )
				} );
			} else {
				const range = schema.getNearestSelectionRange(
					model.createPositionAt( selectedModelWidget!, typeAroundFakeCaretPosition ),
					direction
				);

				// If there is somewhere to move selection to, then there will be something to delete.
				if ( range ) {
					// If the range is NOT collapsed, then we know that the range contains an object (see getNearestSelectionRange() docs).
					if ( !range.isCollapsed ) {
						model.change( writer => {
							writer.setSelection( range );
							editor.execute( isDeleteForward ? 'deleteForward' : 'delete' );
						} );
					} else {
						const probe = model.createSelection( range.start );
						model.modifySelection( probe, { direction } );

						// If the range is collapsed, let's see if a non-collapsed range exists that can could be deleted.
						// If such range exists, use the editor command because it it safe for collaboration (it merges where it can).
						if ( !probe.focus!.isEqual( range.start ) ) {
							model.change( writer => {
								writer.setSelection( range );
								editor.execute( isDeleteForward ? 'deleteForward' : 'delete' );
							} );
						}
						// If there is no non-collapsed range to be deleted then we are sure that there is an empty element
						// next to a widget that should be removed. "delete" and "deleteForward" commands cannot get rid of it
						// so calling Model#deleteContent here manually.
						else {
							const deepestEmptyRangeAncestor = getDeepestEmptyElementAncestor( schema, range.start.parent as Element );

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
		}, { context: isWidget } );
	}

	/**
	 * Attaches the {@link module:engine/model/model~Model#event:insertContent} event listener that, for instance, allows the user to paste
	 * content near a widget when the fake caret is first activated using the arrow keys.
	 *
	 * The content is inserted according to the `widget-type-around` selection attribute (see {@link #_handleArrowKeyPress}).
	 */
	private _enableInsertContentIntegration() {
		const editor = this.editor;
		const model = this.editor.model;
		const documentSelection = model.document.selection;

		this._listenToIfEnabled<ModelInsertContentEvent>( editor.model, 'insertContent', ( evt, [ content, selectable ] ) => {
			if ( selectable && !( selectable as any ).is( 'documentSelection' ) ) {
				return;
			}

			const typeAroundFakeCaretPosition = getTypeAroundFakeCaretPosition( documentSelection );

			if ( !typeAroundFakeCaretPosition ) {
				return;
			}

			evt.stop();

			return model.change( writer => {
				const selectedElement = documentSelection.getSelectedElement();
				const position = model.createPositionAt( selectedElement!, typeAroundFakeCaretPosition );
				const selection = writer.createSelection( position );

				const result = model.insertContent( content, selection );

				writer.setSelection( selection );

				return result;
			} );
		}, { priority: 'high' } );
	}

	/**
	 * Attaches the {@link module:engine/model/model~Model#event:insertObject} event listener that modifies the
	 * `options.findOptimalPosition`parameter to position of fake caret in relation to selected element
	 * to reflect user's intent of desired insertion position.
	 *
	 * The object is inserted according to the `widget-type-around` selection attribute (see {@link #_handleArrowKeyPress}).
	 */
	private _enableInsertObjectIntegration() {
		const editor = this.editor;
		const model = this.editor.model;
		const documentSelection = model.document.selection;

		this._listenToIfEnabled<ModelInsertObjectEvent>( editor.model, 'insertObject', ( evt, args ) => {
			const [ , selectable, options = {} ] = args;

			if ( selectable && !( selectable as any ).is( 'documentSelection' ) ) {
				return;
			}

			const typeAroundFakeCaretPosition = getTypeAroundFakeCaretPosition( documentSelection );

			if ( !typeAroundFakeCaretPosition ) {
				return;
			}

			options.findOptimalPosition = typeAroundFakeCaretPosition;
			args[ 3 ] = options;
		}, { priority: 'high' } );
	}

	/**
	 * Attaches the {@link module:engine/model/model~Model#event:deleteContent} event listener to block the event when the fake
	 * caret is active.
	 *
	 * This is required for cases that trigger {@link module:engine/model/model~Model#deleteContent `model.deleteContent()`}
	 * before calling {@link module:engine/model/model~Model#insertContent `model.insertContent()`} like, for instance,
	 * plain text pasting.
	 */
	private _enableDeleteContentIntegration() {
		const editor = this.editor;
		const model = this.editor.model;
		const documentSelection = model.document.selection;

		this._listenToIfEnabled<ModelDeleteContentEvent>( editor.model, 'deleteContent', ( evt, [ selection ] ) => {
			if ( selection && !selection.is( 'documentSelection' ) ) {
				return;
			}

			const typeAroundFakeCaretPosition = getTypeAroundFakeCaretPosition( documentSelection );

			// Disable removing the selection content while pasting plain text.
			if ( typeAroundFakeCaretPosition ) {
				evt.stop();
			}
		}, { priority: 'high' } );
	}
}

/**
 * Injects the type around UI into a view widget instance.
 */
function injectUIIntoWidget(
	viewWriter: DowncastWriter,
	buttonTitles: { before: string; after: string },
	widgetViewElement: ViewElement ) {
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

/**
 * FYI: Not using the IconView class because each instance would need to be destroyed to avoid memory leaks
 * and it's pretty hard to figure out when a view (widget) is gone for good so it's cheaper to use raw
 * <svg> here.
 */
function injectButtons( wrapperDomElement: HTMLElement, buttonTitles: { before: string; after: string } ) {
	for ( const position of POSSIBLE_INSERTION_POSITIONS ) {
		const buttonTemplate = new Template( {
			tag: 'div',
			attributes: {
				class: [
					'ck',
					'ck-widget__type-around__button',
					`ck-widget__type-around__button_${ position }`
				],
				title: buttonTitles[ position ],
				'aria-hidden': 'true'
			},
			children: [
				wrapperDomElement.ownerDocument.importNode( RETURN_ARROW_ICON_ELEMENT, true )
			]
		} );

		wrapperDomElement.appendChild( buttonTemplate.render() );
	}
}

function injectFakeCaret( wrapperDomElement: HTMLElement ) {
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

/**
 * Returns the ancestor of an element closest to the root which is empty. For instance,
 * for `<baz>`:
 *
 * ```
 * <foo>abc<bar><baz></baz></bar></foo>
 * ```
 *
 * it returns `<bar>`.
 */
function getDeepestEmptyElementAncestor( schema: Schema, element: Element ) {
	let deepestEmptyAncestor = element;

	for ( const ancestor of element.getAncestors( { parentFirst: true } ) ) {
		if ( ( ancestor as any ).childCount > 1 || schema.isLimit( ancestor ) ) {
			break;
		}

		deepestEmptyAncestor = ancestor as Element;
	}

	return deepestEmptyAncestor;
}
