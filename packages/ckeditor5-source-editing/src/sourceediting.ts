/**
 * @license Copyright (c) 2003-2024, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module source-editing/sourceediting
 */

/* global console */

import { type Editor, Plugin, PendingActions } from 'ckeditor5/src/core.js';
import { ButtonView, MenuBarMenuListItemButtonView, type Dialog } from 'ckeditor5/src/ui.js';
import { CKEditorError, createElement, ElementReplacer } from 'ckeditor5/src/utils.js';
import { formatHtml } from './utils/formathtml.js';

import '../theme/sourceediting.css';
import sourceEditingIcon from '../theme/icons/source-editing.svg';

const COMMAND_FORCE_DISABLE_ID = 'SourceEditingMode';

/**
 * The source editing feature.
 *
 * It provides the possibility to view and edit the source of the document.
 *
 * For a detailed overview, check the {@glink features/source-editing source editing feature documentation} and the
 * {@glink api/source-editing package page}.
 */
export default class SourceEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'SourceEditing' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static get requires() {
		return [ PendingActions ] as const;
	}

	/**
	 * Flag indicating whether the document source mode is active.
	 *
	 * @observable
	 */
	declare public isSourceEditingMode: boolean;

	/**
	 * The element replacer instance used to replace the editing roots with the wrapper elements containing the document source.
	 */
	private _elementReplacer: ElementReplacer;

	/**
	 * Maps all root names to wrapper elements containing the document source.
	 */
	private _replacedRoots: Map<string, HTMLElement>;

	/**
	 * Maps all root names to their document data.
	 */
	private _dataFromRoots: Map<string, string>;

	/**
	 * @inheritDoc
	 */
	constructor( editor: Editor ) {
		super( editor );

		this.set( 'isSourceEditingMode', false );
		this._elementReplacer = new ElementReplacer();
		this._replacedRoots = new Map();
		this._dataFromRoots = new Map();

		editor.config.define( 'sourceEditing.allowCollaborationFeatures', false );
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		this._checkCompatibility();

		const editor = this.editor;
		const t = editor.locale.t;

		editor.ui.componentFactory.add( 'sourceEditing', () => {
			const buttonView = this._createButton( ButtonView );

			buttonView.set( {
				label: t( 'Source' ),
				icon: sourceEditingIcon,
				tooltip: true,
				class: 'ck-source-editing-button'
			} );

			return buttonView;
		} );

		editor.ui.componentFactory.add( 'menuBar:sourceEditing', () => {
			const buttonView = this._createButton( MenuBarMenuListItemButtonView );

			buttonView.set( {
				label: t( 'Show source' ),
				role: 'menuitemcheckbox'
			} );

			return buttonView;
		} );

		// Currently, the plugin handles the source editing mode by itself only for the classic editor. To use this plugin with other
		// integrations, listen to the `change:isSourceEditingMode` event and act accordingly.
		if ( this._isAllowedToHandleSourceEditingMode() ) {
			this.on( 'change:isSourceEditingMode', ( evt, name, isSourceEditingMode ) => {
				if ( isSourceEditingMode ) {
					this._hideVisibleDialog();
					this._showSourceEditing();
					this._disableCommands();
				} else {
					this._hideSourceEditing();
					this._enableCommands();
				}
			} );

			this.on( 'change:isEnabled', ( evt, name, isEnabled ) => this._handleReadOnlyMode( !isEnabled ) );

			this.listenTo( editor, 'change:isReadOnly', ( evt, name, isReadOnly ) => this._handleReadOnlyMode( isReadOnly ) );
		}

		// Update the editor data while calling editor.getData() in the source editing mode.
		editor.data.on( 'get', () => {
			if ( this.isSourceEditingMode ) {
				this.updateEditorData();
			}
		}, { priority: 'high' } );
	}

	/**
	 * Updates the source data in all hidden editing roots.
	 */
	public updateEditorData(): void {
		const editor = this.editor;
		const data: Record<string, string> = {};

		for ( const [ rootName, domSourceEditingElementWrapper ] of this._replacedRoots ) {
			const oldData = this._dataFromRoots.get( rootName );
			const newData = domSourceEditingElementWrapper.dataset.value!;

			// Do not set the data unless some changes have been made in the meantime.
			// This prevents empty undo steps after switching to the normal editor.
			if ( oldData !== newData ) {
				data[ rootName ] = newData;
				this._dataFromRoots.set( rootName, newData );
			}
		}

		if ( Object.keys( data ).length ) {
			editor.data.set( data, { batchType: { isUndoable: true }, suppressErrorInCollaboration: true } );
		}
	}

	private _checkCompatibility() {
		const editor = this.editor;
		const allowCollaboration = editor.config.get( 'sourceEditing.allowCollaborationFeatures' );

		if ( !allowCollaboration && editor.plugins.has( 'RealTimeCollaborativeEditing' ) ) {
			/**
			 * Source editing feature is not fully compatible with real-time collaboration,
			 * and using it may lead to data loss. Please read
			 * {@glink features/source-editing#limitations-and-incompatibilities source editing feature guide} to learn more.
			 *
			 * If you understand the possible risk of data loss, you can enable the source editing
			 * by setting the
			 * {@link module:source-editing/sourceeditingconfig~SourceEditingConfig#allowCollaborationFeatures}
			 * configuration flag to `true`.
			 *
			 * @error source-editing-incompatible-with-real-time-collaboration
			 */
			throw new CKEditorError( 'source-editing-incompatible-with-real-time-collaboration', null );
		}

		const collaborationPluginNamesToWarn = [
			'CommentsEditing',
			'TrackChangesEditing',
			'RevisionHistory'
		];

		// Currently, the basic integration with Collaboration Features is to display a warning in the console.
		//
		// If `allowCollaboration` flag is set, do not show these warnings. If the flag is set, we assume that the integrator read
		// appropriate section of the guide so there's no use to spam the console with warnings.
		//
		if ( !allowCollaboration && collaborationPluginNamesToWarn.some( pluginName => editor.plugins.has( pluginName ) ) ) {
			console.warn(
				'You initialized the editor with the source editing feature and at least one of the collaboration features. ' +
				'Please be advised that the source editing feature may not work, and be careful when editing document source ' +
				'that contains markers created by the collaboration features.'
			);
		}

		// Restricted Editing integration can also lead to problems. Warn the user accordingly.
		if ( editor.plugins.has( 'RestrictedEditingModeEditing' ) ) {
			console.warn(
				'You initialized the editor with the source editing feature and restricted editing feature. ' +
				'Please be advised that the source editing feature may not work, and be careful when editing document source ' +
				'that contains markers created by the restricted editing feature.'
			);
		}
	}

	/**
	 * Creates source editing wrappers that replace each editing root. Each wrapper contains the document source from the corresponding
	 * root.
	 *
	 * The wrapper element contains a textarea and it solves the problem, that the textarea element cannot auto expand its height based on
	 * the content it contains. The solution is to make the textarea more like a plain div element, which expands in height as much as it
	 * needs to, in order to display the whole document source without scrolling. The wrapper element is a parent for the textarea and for
	 * the pseudo-element `::after`, that replicates the look, content, and position of the textarea. The pseudo-element replica is hidden,
	 * but it is styled to be an identical visual copy of the textarea with the same content. Then, the wrapper is a grid container and both
	 * of its children (the textarea and the `::after` pseudo-element) are positioned within a CSS grid to occupy the same grid cell. The
	 * content in the pseudo-element `::after` is set in CSS and it stretches the grid to the appropriate size based on the textarea value.
	 * Since both children occupy the same grid cell, both have always the same height.
	 */
	private _showSourceEditing(): void {
		const editor = this.editor;
		const editingView = editor.editing.view;
		const model = editor.model;

		model.change( writer => {
			writer.setSelection( null );
			writer.removeSelectionAttribute( model.document.selection.getAttributeKeys() );
		} );

		// It is not needed to iterate through all editing roots, as currently the plugin supports only the Classic Editor with a single
		// main root, but this code may help understand and use this feature in external integrations.
		for ( const [ rootName, domRootElement ] of editingView.domRoots ) {
			const data = formatSource( editor.data.get( { rootName } ) );

			const domSourceEditingElementTextarea = createElement( domRootElement.ownerDocument, 'textarea', {
				rows: '1',
				'aria-label': 'Source code editing area'
			} );

			const domSourceEditingElementWrapper = createElement( domRootElement.ownerDocument, 'div', {
				class: 'ck-source-editing-area',
				'data-value': data
			}, [ domSourceEditingElementTextarea ] );

			domSourceEditingElementTextarea.value = data;

			// Setting a value to textarea moves the input cursor to the end. We want the selection at the beginning.
			domSourceEditingElementTextarea.setSelectionRange( 0, 0 );

			// Bind the textarea's value to the wrapper's `data-value` property. Each change of the textarea's value updates the
			// wrapper's `data-value` property.
			domSourceEditingElementTextarea.addEventListener( 'input', () => {
				domSourceEditingElementWrapper.dataset.value = domSourceEditingElementTextarea.value;

				editor.ui.update();
			} );

			editingView.change( writer => {
				const viewRoot = editingView.document.getRoot( rootName )!;

				writer.addClass( 'ck-hidden', viewRoot );
			} );

			// Register the element so it becomes available for Alt+F10 and Esc navigation.
			editor.ui.setEditableElement( 'sourceEditing:' + rootName, domSourceEditingElementTextarea );

			this._replacedRoots.set( rootName, domSourceEditingElementWrapper );

			this._elementReplacer.replace( domRootElement, domSourceEditingElementWrapper );

			this._dataFromRoots.set( rootName, data );
		}

		this._focusSourceEditing();
	}

	/**
	 * Restores all hidden editing roots and sets the source data in them.
	 */
	private _hideSourceEditing(): void {
		const editor = this.editor;
		const editingView = editor.editing.view;

		this.updateEditorData();

		editingView.change( writer => {
			for ( const [ rootName ] of this._replacedRoots ) {
				writer.removeClass( 'ck-hidden', editingView.document.getRoot( rootName )! );
			}
		} );

		this._elementReplacer.restore();

		this._replacedRoots.clear();
		this._dataFromRoots.clear();

		editingView.focus();
	}

	/**
	 * Focuses the textarea containing document source from the first editing root.
	 */
	private _focusSourceEditing(): void {
		const editor = this.editor;
		const [ domSourceEditingElementWrapper ] = this._replacedRoots.values();
		const textarea = domSourceEditingElementWrapper.querySelector( 'textarea' )!;

		// The FocusObserver was disabled by View.render() while the DOM root was getting hidden and the replacer
		// revealed the textarea. So it couldn't notice that the DOM root got blurred in the process.
		// Let's sync this state manually here because otherwise Renderer will attempt to render selection
		// in an invisible DOM root.
		editor.editing.view.document.isFocused = false;

		textarea.focus();
	}

	/**
	 * Disables all commands.
	 */
	private _disableCommands(): void {
		const editor = this.editor;

		for ( const command of editor.commands.commands() ) {
			command.forceDisabled( COMMAND_FORCE_DISABLE_ID );
		}

		// Comments archive UI plugin will be disabled manually too.
		if ( editor.plugins.has( 'CommentsArchiveUI' ) ) {
			( editor.plugins.get( 'CommentsArchiveUI' ) as Plugin ).forceDisabled( COMMAND_FORCE_DISABLE_ID );
		}
	}

	/**
	 * Clears forced disable for all commands, that was previously set through {@link #_disableCommands}.
	 */
	private _enableCommands(): void {
		const editor = this.editor;

		for ( const command of editor.commands.commands() ) {
			command.clearForceDisabled( COMMAND_FORCE_DISABLE_ID );
		}

		// Comments archive UI plugin will be enabled manually too.
		if ( editor.plugins.has( 'CommentsArchiveUI' ) ) {
			( editor.plugins.get( 'CommentsArchiveUI' ) as Plugin ).clearForceDisabled( COMMAND_FORCE_DISABLE_ID );
		}
	}

	/**
	 * Adds or removes the `readonly` attribute from the textarea from all roots, if document source mode is active.
	 *
	 * @param isReadOnly Indicates whether all textarea elements should be read-only.
	 */
	private _handleReadOnlyMode( isReadOnly: boolean ): void {
		if ( !this.isSourceEditingMode ) {
			return;
		}

		for ( const [ , domSourceEditingElementWrapper ] of this._replacedRoots ) {
			domSourceEditingElementWrapper.querySelector( 'textarea' )!.readOnly = isReadOnly;
		}
	}

	/**
	 * Checks, if the plugin is allowed to handle the source editing mode by itself. Currently, the source editing mode is supported only
	 * for the {@link module:editor-classic/classiceditor~ClassicEditor classic editor}.
	 */
	private _isAllowedToHandleSourceEditingMode(): boolean {
		const editor = this.editor;
		const editable = editor.ui.view.editable;

		// Checks, if the editor's editable belongs to the editor's DOM tree.
		return editable && !editable.hasExternalElement;
	}

	/**
	 * If any {@link module:ui/dialog/dialogview~DialogView editor dialog} is currently visible, hide it.
	 */
	private _hideVisibleDialog(): void {
		if ( this.editor.plugins.has( 'Dialog' ) ) {
			const dialogPlugin: Dialog = this.editor.plugins.get( 'Dialog' );

			if ( dialogPlugin.isOpen ) {
				dialogPlugin.hide();
			}
		}
	}

	private _createButton<T extends typeof ButtonView>( ButtonClass: T ): InstanceType<T> {
		const editor = this.editor;
		const buttonView = new ButtonClass( editor.locale ) as InstanceType<T>;

		buttonView.set( {
			withText: true,
			isToggleable: true
		} );

		buttonView.bind( 'isOn' ).to( this, 'isSourceEditingMode' );

		// The button should be disabled if one of the following conditions is met:
		buttonView.bind( 'isEnabled' ).to(
			this, 'isEnabled',
			editor, 'isReadOnly',
			editor.plugins.get( PendingActions ), 'hasAny',
			( isEnabled, isEditorReadOnly, hasAnyPendingActions ) => {
				// (1) The plugin itself is disabled.
				if ( !isEnabled ) {
					return false;
				}

				// (2) The editor is in read-only mode.
				if ( isEditorReadOnly ) {
					return false;
				}

				// (3) Any pending action is scheduled. It may change the model, so modifying the document source should be prevented
				// until the model is finally set.
				if ( hasAnyPendingActions ) {
					return false;
				}

				return true;
			}
		);

		this.listenTo( buttonView, 'execute', () => {
			this.isSourceEditingMode = !this.isSourceEditingMode;
		} );

		return buttonView;
	}
}

/**
 * Formats the content for a better readability.
 *
 * For a non-HTML source the unchanged input string is returned.
 *
 * @param input Input string to check.
 */
function formatSource( input: string ): string {
	if ( !isHtml( input ) ) {
		return input;
	}

	return formatHtml( input );
}

/**
 * Checks, if the document source is HTML. It is sufficient to just check the first character from the document data.
 *
 * @param input Input string to check.
 */
function isHtml( input: string ): boolean {
	return input.startsWith( '<' );
}
