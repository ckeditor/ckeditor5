/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module core/editor/editorui
 */

/* globals console */

import ComponentFactory from '@ckeditor/ckeditor5-ui/src/componentfactory';
import FocusTracker from '@ckeditor/ckeditor5-utils/src/focustracker';

import ObservableMixin from '@ckeditor/ckeditor5-utils/src/observablemixin';
import mix from '@ckeditor/ckeditor5-utils/src/mix';
import isVisible from '@ckeditor/ckeditor5-utils/src/dom/isvisible';
import { isElement } from 'lodash-es';

/**
 * A class providing the minimal interface that is required to successfully bootstrap any editor UI.
 *
 * @mixes module:utils/emittermixin~EmitterMixin
 */
export default class EditorUI {
	/**
	 * Creates an instance of the editor UI class.
	 *
	 * @param {module:core/editor/editor~Editor} editor The editor instance.
	 */
	constructor( editor ) {
		/**
		 * The editor that the UI belongs to.
		 *
		 * @readonly
		 * @member {module:core/editor/editor~Editor} #editor
		 */
		this.editor = editor;

		/**
		 * An instance of the {@link module:ui/componentfactory~ComponentFactory}, a registry used by plugins
		 * to register factories of specific UI components.
		 *
		 * @readonly
		 * @member {module:ui/componentfactory~ComponentFactory} #componentFactory
		 */
		this.componentFactory = new ComponentFactory( editor );

		/**
		 * Stores the information about the editor UI focus and propagates it so various plugins and components
		 * are unified as a focus group.
		 *
		 * @readonly
		 * @member {module:utils/focustracker~FocusTracker} #focusTracker
		 */
		this.focusTracker = new FocusTracker();

		/**
		 * Stores viewport offsets from every direction.
		 *
		 * Viewport offset can be used to constrain balloons or other UI elements into an element smaller than the viewport.
		 * This can be useful if there are any other absolutely positioned elements that may interfere with editor UI.
		 *
		 * Example `editor.ui.viewportOffset` returns:
		 *
		 * ```js
		 * {
		 * 	top: 50,
		 * 	right: 50,
		 * 	bottom: 50,
		 * 	left: 50
		 * }
		 * ```
		 *
		 * This property can be overriden after editor already being initialized:
		 *
		 * ```js
		 * editor.ui.viewportOffset = {
		 * 	top: 100,
		 * 	right: 0,
		 * 	bottom: 0,
		 * 	left: 0
		 * };
		 * ```
		 *
		 * @observable
		 * @member {Object} #viewportOffset
		 */
		this.set( 'viewportOffset', this._readViewportOffsetFromConfig() );

		/**
		 * Stores all editable elements used by the editor instance.
		 *
		 * @private
		 * @member {Map.<String,HTMLElement>}
		 */
		this._editableElementsMap = new Map();

		/**
		 * TODO
		 *
		 * @private
		 */
		this._focusableToolbars = [];

		/**
		 * A set of all the available focusable editing areas (editor domRoots, sourceEditing area).
		 *
		 * @type {Set}
		 * @private
		 */
		this._focusableEditingAreas = new Set();

		// Informs UI components that should be refreshed after layout change.
		this.listenTo( editor.editing.view.document, 'layoutChanged', () => this.update() );

		this._initFocusTracking();
	}

	/**
	 * The main (outermost) DOM element of the editor UI.
	 *
	 * For example, in {@link module:editor-classic/classiceditor~ClassicEditor} it is a `<div>` which
	 * wraps the editable element and the toolbar. In {@link module:editor-inline/inlineeditor~InlineEditor}
	 * it is the editable element itself (as there is no other wrapper). However, in
	 * {@link module:editor-decoupled/decouplededitor~DecoupledEditor} it is set to `null` because this editor does not
	 * come with a single "main" HTML element (its editable element and toolbar are separate).
	 *
	 * This property can be understood as a shorthand for retrieving the element that a specific editor integration
	 * considers to be its main DOM element.
	 *
	 * @readonly
	 * @member {HTMLElement|null} #element
	 */
	get element() {
		return null;
	}

	/**
	 * Fires the {@link module:core/editor/editorui~EditorUI#event:update `update`} event.
	 *
	 * This method should be called when the editor UI (e.g. positions of its balloons) needs to be updated due to
	 * some environmental change which CKEditor 5 is not aware of (e.g. resize of a container in which it is used).
	 */
	update() {
		this.fire( 'update' );
	}

	/**
	 * Destroys the UI.
	 */
	destroy() {
		this.stopListening();

		this.focusTracker.destroy();

		// Clean–up the references to the CKEditor instance stored in the native editable DOM elements.
		for ( const domElement of this._editableElementsMap.values() ) {
			domElement.ckeditorInstance = null;
		}

		this._editableElementsMap = new Map();
	}

	/**
	 * Store the native DOM editable element used by the editor under
	 * a unique name. Register that DOM element as a focusable editing area.
	 *
	 * @param {String} rootName The unique name of the editable element.
	 * @param {HTMLElement} domElement The native DOM editable element.
	 */
	setEditableElement( rootName, domElement ) {
		this._editableElementsMap.set( rootName, domElement );

		// Put a reference to the CKEditor instance in the editable native DOM element.
		// It helps 3rd–party software (browser extensions, other libraries) access and recognize
		// CKEditor 5 instances (editing roots) and use their API (there is no global editor
		// instance registry).
		if ( !domElement.ckeditorInstance ) {
			domElement.ckeditorInstance = this.editor;
		}

		this.registerFocusableEditingArea( domElement );
	}

	/**
	 * Returns the editable editor element with the given name or null if editable does not exist.
	 *
	 * @param {String} [rootName=main] The editable name.
	 * @returns {HTMLElement|undefined}
	 */
	getEditableElement( rootName = 'main' ) {
		return this._editableElementsMap.get( rootName );
	}

	/**
	 * Returns array of names of all editor editable elements.
	 *
	 * @returns {Iterable.<String>}
	 */
	getEditableElementsNames() {
		return this._editableElementsMap.keys();
	}

	/**
	 * Registers all focusable toolbars in the editor.
	 *
	 * @param {module:ui/toolbar/toolbarview~ToolbarView} toolbarView
	 * @param {Object} options
	 * @param {Boolean} options.isContextual Marks the higher priority toolbar. For example when there are 2 visible toolbars,
	 * it allows to distinguish which toolbar should be focused first after the `alt+f10` keystroke
	 * @param {Function} [options.beforeFocus] A callback executed before the `toolbarView` gains focus
	 * upon the `Alt+F10` keystroke.
	 * @param {Function} [options.afterBlur] A callback executed after `toolbarView` loses focus upon
	 * `Esc` keystroke but before the focus goes back to the `origin`.
	 */
	registerFocusableToolbar( toolbarView, options = {} ) {
		console.log( this.editor.constructor.name, `Registering toolbar ${ logToolbar( toolbarView ) }` );

		if ( toolbarView.isRendered ) {
			this.focusTracker.add( toolbarView.element );
			this.editor.keystrokes.listenTo( toolbarView.element );
		} else {
			toolbarView.once( 'render', () => {
				this.focusTracker.add( toolbarView.element );
				this.editor.keystrokes.listenTo( toolbarView.element );
			} );
		}

		this._focusableToolbars.push( { toolbarView, options } );
	}

	/**
	 * Registers focusable element in the focus tracker, adds it to the keystroke handler as well as updates the
	 * `_focusableEditingAreas` set.
	 *
	 * @param {module:engine/view/element~Element|HTMLElement} viewOrElement
	 */
	registerFocusableEditingArea( viewOrElement ) {
		// TODO: Move it somewhere else.
		const isDomRootElement = element => {
			return Array.from( this._editableElementsMap.values() ).includes( element );
		};

		if ( isElement( viewOrElement ) ) {
			this.focusTracker.add( viewOrElement );

			// The Editor class is already listening to the editing view (KeyObserver). Do not duplicate listeners.
			if ( !isDomRootElement( viewOrElement ) ) {
				console.log( 'adding', viewOrElement, 'to KH' );
				this.editor.keystrokes.listenTo( viewOrElement );
			}
		}
		// TODO: When the source editing plugin is rewritten to use UI View, this will prove handy. For now, probably could be removed.
		else {
			if ( viewOrElement.isRendered ) {
				this.focusTracker.add( viewOrElement.element );

				// The Editor class is already listening to the editing view (KeyObserver). Do not duplicate listeners.
				if ( !isDomRootElement( viewOrElement.element ) ) {
					this.editor.keystrokes.listenTo( viewOrElement.element );
				}
			} else {
				viewOrElement.once( 'render', () => {
					this.focusTracker.add( viewOrElement.element );

					// The Editor class is already listening to the editing view (KeyObserver). Do not duplicate listeners.
					if ( !isDomRootElement( viewOrElement.element ) ) {
						this.editor.keystrokes.listenTo( viewOrElement.element );
					}
				} );
			}
		}

		this._focusableEditingAreas.add( viewOrElement );
	}

	/**
	 * Stores all editable elements used by the editor instance.
	 *
	 * @protected
	 * @deprecated
	 * @member {Map.<String,HTMLElement>}
	 */
	get _editableElements() {
		/**
		 * The {@link module:core/editor/editorui~EditorUI#_editableElements `EditorUI#_editableElements`} property has been
		 * deprecated and will be removed in the near future. Please use {@link #setEditableElement `setEditableElement()`} and
		 * {@link #getEditableElement `getEditableElement()`} methods instead.
		 *
		 * @error editor-ui-deprecated-editable-elements
		 * @param {module:core/editor/editorui~EditorUI} editorUI Editor UI instance the deprecated property belongs to.
		 */
		console.warn(
			'editor-ui-deprecated-editable-elements: ' +
			'The EditorUI#_editableElements property has been deprecated and will be removed in the near future.',
			{ editorUI: this } );

		return this._editableElementsMap;
	}

	/**
	 * Returns viewport offsets object:
	 *
	 * ```js
	 * {
	 * 	top: Number,
	 * 	right: Number,
	 * 	bottom: Number,
	 * 	left: Number
	 * }
	 * ```
	 *
	 * Only top property is currently supported.
	 *
	 * @private
	 * @return {Object}
	 */
	_readViewportOffsetFromConfig() {
		const editor = this.editor;
		const viewportOffsetConfig = editor.config.get( 'ui.viewportOffset' );

		if ( viewportOffsetConfig ) {
			return viewportOffsetConfig;
		}

		const legacyOffsetConfig = editor.config.get( 'toolbar.viewportTopOffset' );

		// Fall back to deprecated toolbar config.
		if ( legacyOffsetConfig ) {
			/**
			 * The {@link module:core/editor/editorconfig~EditorConfig#toolbar `EditorConfig#toolbar.viewportTopOffset`}
			 * property has been deprecated and will be removed in the near future. Please use
			 * {@link module:core/editor/editorconfig~EditorConfig#ui `EditorConfig#ui.viewportOffset`} instead.
			 *
			 * @error editor-ui-deprecated-viewport-offset-config
			 */
			console.warn(
				'editor-ui-deprecated-viewport-offset-config: ' +
				'The `toolbar.vieportTopOffset` configuration option is deprecated. ' +
				'It will be removed from future CKEditor versions. Use `ui.viewportOffset.top` instead.'
			);

			return { top: legacyOffsetConfig };
		}

		// More keys to come in the future.
		return { top: 0 };
	}

	/**
	 * TODO docs and code refactoring.
	 */
	_initFocusTracking() {
		const editor = this.editor;

		let lastFocusedEditingArea;

		// Focus the toolbar on the keystroke, if not already focused.
		editor.keystrokes.set( 'Alt+F10', ( data, cancel ) => {
			// console.clear();
			console.group( 'Pressed Alt+F10' );

			if ( !this.focusTracker.isFocused ) {
				return;
			}

			console.log( this._focusableEditingAreas, this.focusTracker.focusedElement );
			if ( this._focusableEditingAreas.has( this.focusTracker.focusedElement ) ) {
				lastFocusedEditingArea = this.focusTracker.focusedElement;
			}

			const toolbarDefinitions = this._getFocusableToolbarDefinitions();

			this._focusNextFocusableToolbarDefinition( this._getCurrentFocusedToolbarDefinition( toolbarDefinitions ), toolbarDefinitions );

			cancel();

			console.groupEnd( 'Pressed Alt+F10' );
		} );

		// Blur the toolbar and bring the focus back to origin.
		editor.keystrokes.set( 'Esc', ( data, cancel ) => {
			console.group( 'Esc was pressed' );
			const toolbarDefinitions = this._getFocusableToolbarDefinitions();
			const focusedToolbarDef = this._getCurrentFocusedToolbarDefinition( toolbarDefinitions );

			if ( !focusedToolbarDef ) {
				console.log( 'No toolbar was focused. No action needed.' );
				console.groupEnd( 'Esc was pressed' );

				return;
			}

			// Bring focus back to where it came from before focusing the toolbar.
			if ( lastFocusedEditingArea ) {
				console.log( 'Moving focus back where it came from', lastFocusedEditingArea );
				lastFocusedEditingArea.focus();
				lastFocusedEditingArea = null;
			}
			// It could be the focus went straight to the toolbar before even focusing the editing area.
			// Focus the first visible editing area then.
			else {
				console.log( 'Looks like the focus went straight to the toolbar.' );

				for ( const focusableEditingArea of this._focusableEditingAreas ) {
					if ( isVisible( focusableEditingArea ) ) {
						console.log( 'Focusing the first visible focusable editing area', focusableEditingArea );
						focusableEditingArea.focus();

						break;
					}
				}
			}

			// Clean up after the toolbar if there is anything to do there.
			if ( focusedToolbarDef.options.afterBlur ) {
				focusedToolbarDef.options.afterBlur();
			}

			cancel();

			console.groupEnd( 'Esc was pressed' );
		} );
	}

	/**
	 * TODO
	 *
	 * @private
	 */
	_getToolbarDefinitionWeight( toolbarDef ) {
		const { toolbarView, options } = toolbarDef;
		let weight = 10;

		// Prioritize already visible toolbars. They should get focused first.
		if ( isVisible( toolbarView.element ) ) {
			weight--;
		}

		// Prioritize contextual toolbars. They are displayed at the selection.
		if ( options.isContextual ) {
			weight--;
		}

		return weight;
	}

	/**
	 * TODO
	 * Focusable toolbars are either already visible or have beforeFocus() that promises that they might show up.
	 * Other toolbars are certainly not accessible for the current selection.
	 *
	 * @private
	 */
	_getFocusableToolbarDefinitions() {
		console.group( 'getFocusableToolbarDefinitions()' );

		const definitions = [];

		for ( const toolbarDef of this._focusableToolbars ) {
			const { toolbarView, options } = toolbarDef;

			// TODO: Duplication because of logging.
			if ( isVisible( toolbarView.element ) ) {
				console.log( `${ logToolbar( toolbarView ) }: because already visible.` );

				definitions.push( toolbarDef );
			} else if ( options.beforeFocus ) {
				console.log( `${ logToolbar( toolbarView ) }: because has beforeFocus() (looks promising, might show up).` );

				definitions.push( toolbarDef );
			}
		}

		// Contextual and already visible toolbars have higher priority. If both are true, the toolbar will always focus first.
		// For instance, a selected widget toolbar vs inline editor toolbar: both are visible but the widget toolbar is contextual.
		definitions.sort( ( toolbarDefA, toolbarDefB ) =>
			this._getToolbarDefinitionWeight( toolbarDefA ) - this._getToolbarDefinitionWeight( toolbarDefB ) );

		console.groupEnd( 'getFocusableToolbarDefinitions()' );

		return definitions;
	}

	/**
	 * TODO
	 *
	 * @private
	 */
	_getCurrentFocusedToolbarDefinition( toolbarDefs ) {
		for ( const toolbarDef of toolbarDefs ) {
			const { toolbarView } = toolbarDef;

			if ( toolbarView.element.contains( this.focusTracker.focusedElement ) ) {
				return toolbarDef;
			}
		}

		return null;
	}

	/**
	 * TODO
	 *
	 * @private
	 */
	_getNextFocusableToolbarDef( relativeDef, toolbarDefinitions ) {
		console.group( 'getNextFocusableToolbarDef()' );

		if ( !relativeDef ) {
			console.log( `No toolbar focused. Selecting the first one: ${ logToolbar( toolbarDefinitions[ 0 ].toolbarView ) }` );

			console.groupEnd( 'getNextFocusableToolbarDef()' );
			return toolbarDefinitions[ 0 ];
		}

		const focusedToolbarIndex = toolbarDefinitions.findIndex( ( { toolbarView } ) => toolbarView === relativeDef.toolbarView );
		let nextFocusableToolbar;

		if ( focusedToolbarIndex === toolbarDefinitions.length - 1 ) {
			nextFocusableToolbar = toolbarDefinitions[ 0 ];
		} else {
			nextFocusableToolbar = toolbarDefinitions[ focusedToolbarIndex + 1 ];
		}

		console.log( `The next focusable toolbar is: ${ logToolbar( nextFocusableToolbar.toolbarView ) }` );
		console.groupEnd( 'getNextFocusableToolbarDef()' );

		return nextFocusableToolbar;
	}

	/**
	 * TODO
	 *
	 * @private
	 */
	_focusNextFocusableToolbarDefinition( relativeDef, toolbarDefinitions ) {
		const candidateToolbarDefToFocus = this._getNextFocusableToolbarDef( relativeDef, toolbarDefinitions );

		if ( !candidateToolbarDefToFocus ) {
			console.log( '😔 No focusable toolbar found.' );

			return;
		}

		console.log( `The toolbar candidate to focus is ${ logToolbar( candidateToolbarDefToFocus.toolbarView ) }.` );

		const { toolbarView, options: { beforeFocus } } = candidateToolbarDefToFocus;

		if ( beforeFocus ) {
			console.log( 'The candidate has beforeFocus(). Calling beforeFocus()' );

			beforeFocus();
		}

		if ( !isVisible( toolbarView.element ) ) {
			console.log(
				`😔 The candidate ${ logToolbar( candidateToolbarDefToFocus.toolbarView ) } turned out invisible. ` +
				'Looking for another one.'
			);

			// (!!!) TODO. This might cause infinite loop. A mechanism to prevent this is required.
			this.focusNextFocusableToolbarDefinition( candidateToolbarDefToFocus, toolbarDefinitions );

			return;
		}

		toolbarView.focus();

		console.log( `✅ Finally focused ${ logToolbar( candidateToolbarDefToFocus.toolbarView ) }.` );
	}

	/**
	 * Fired when the editor UI is ready.
	 *
	 * Fired before {@link module:engine/controller/datacontroller~DataController#event:ready}.
	 *
	 * @event ready
	 */

	/**
	 * Fired whenever the UI (all related components) should be refreshed.
	 *
	 * **Note:**: The event is fired after each {@link module:engine/view/document~Document#event:layoutChanged}.
	 * It can also be fired manually via the {@link module:core/editor/editorui~EditorUI#update} method.
	 *
	 * @event update
	 */
}

mix( EditorUI, ObservableMixin );

// TODO: To be removed in prod.
function logToolbar( toolbarView ) {
	return `"${ toolbarView.ariaLabel }"`;
}
