/**
 * @license Copyright (c) 2003-2021, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module source-editing/sourceediting
 */

/* global console */

import { Plugin, PendingActions } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';
import { createElement, ElementReplacer } from 'ckeditor5/src/utils';
import { formatHtml } from './utils/formathtml';

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
 *
 * @extends module:core/plugin~Plugin
 */
export default class SourceEditing extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'SourceEditing';
	}

	/**
	 * @inheritDoc
	 */
	static get requires() {
		return [ PendingActions ];
	}

	/**
	 * @inheritDoc
	 */
	constructor( editor ) {
		super( editor );

		/**
		 * Flag indicating whether the document source mode is active.
		 *
		 * @observable
		 * @member {Boolean}
		 */
		this.set( 'isSourceEditingMode', false );

		/**
		 * The element replacer instance used to replace the editing roots with the wrapper elements containing the document source.
		 *
		 * @private
		 * @member {module:utils/elementreplacer~ElementReplacer}
		 */
		this._elementReplacer = new ElementReplacer();

		/**
		 * Maps all root names to wrapper elements containing the document source.
		 *
		 * @private
		 * @member {Map.<String,HTMLElement>}
		 */
		this._replacedRoots = new Map();

		/**
		 * Maps all root names to their document data.
		 *
		 * @private
		 * @member {Map.<String,String>}
		 */
		this._dataFromRoots = new Map();
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'sourceEditing', locale => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: t( 'Source' ),
				icon: sourceEditingIcon,
				tooltip: true,
				withText: true,
				class: 'ck-source-editing-button'
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
		} );

		// Currently, the plugin handles the source editing mode by itself only for the classic editor. To use this plugin with other
		// integrations, listen to the `change:isSourceEditingMode` event and act accordingly.
		if ( this._isAllowedToHandleSourceEditingMode() ) {
			this.on( 'change:isSourceEditingMode', ( evt, name, isSourceEditingMode ) => {
				if ( isSourceEditingMode ) {
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
				this._updateEditorData();
			}
		}, { priority: 'high' } );
	}

	/**
	 * @inheritDoc
	 */
	afterInit() {
		const editor = this.editor;

		const collaborationPluginNamesToWarn = [
			'RealTimeCollaborativeEditing',
			'CommentsEditing',
			'TrackChangesEditing',
			'RevisionHistory'
		];

		// Currently, the basic integration with Collaboration Features is to display a warning in the console.
		if ( collaborationPluginNamesToWarn.some( pluginName => editor.plugins.has( pluginName ) ) ) {
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
	 *
	 * @private
	 */
	_showSourceEditing() {
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

			const domSourceEditingElementTextarea = createElement( domRootElement.ownerDocument, 'textarea', { rows: '1' } );

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
			} );

			editingView.change( writer => {
				const viewRoot = editingView.document.getRoot( rootName );

				writer.addClass( 'ck-hidden', viewRoot );
			} );

			this._replacedRoots.set( rootName, domSourceEditingElementWrapper );

			this._elementReplacer.replace( domRootElement, domSourceEditingElementWrapper );

			this._dataFromRoots.set( rootName, data );
		}

		this._focusSourceEditing();
	}

	/**
	 * Restores all hidden editing roots and sets the source data in them.
	 *
	 * @private
	 */
	_hideSourceEditing() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		this._updateEditorData();

		editingView.change( writer => {
			for ( const [ rootName ] of this._replacedRoots ) {
				writer.removeClass( 'ck-hidden', editingView.document.getRoot( rootName ) );
			}
		} );

		this._elementReplacer.restore();

		this._replacedRoots.clear();
		this._dataFromRoots.clear();

		editingView.focus();
	}

	/**
	 * Updates the source data in all hidden editing roots.
	 *
	 * @private
	 */
	_updateEditorData() {
		const editor = this.editor;
		const data = {};

		for ( const [ rootName, domSourceEditingElementWrapper ] of this._replacedRoots ) {
			const oldData = this._dataFromRoots.get( rootName );
			const newData = domSourceEditingElementWrapper.dataset.value;

			// Do not set the data unless some changes have been made in the meantime.
			// This prevents empty undo steps after switching to the normal editor.
			if ( oldData !== newData ) {
				data[ rootName ] = newData;
			}
		}

		if ( Object.keys( data ).length ) {
			editor.data.set( data, { batchType: 'default' } );
		}
	}

	/**
	 * Focuses the textarea containing document source from the first editing root.
	 *
	 * @private
	 */
	_focusSourceEditing() {
		const [ domSourceEditingElementWrapper ] = this._replacedRoots.values();

		const textarea = domSourceEditingElementWrapper.querySelector( 'textarea' );

		textarea.focus();
	}

	/**
	 * Disables all commands.
	 *
	 * @private
	 */
	_disableCommands() {
		const editor = this.editor;

		for ( const command of editor.commands.commands() ) {
			command.forceDisabled( COMMAND_FORCE_DISABLE_ID );
		}
	}

	/**
	 * Clears forced disable for all commands, that was previously set through {@link #_disableCommands}.
	 *
	 * @private
	 */
	_enableCommands() {
		const editor = this.editor;

		for ( const command of editor.commands.commands() ) {
			command.clearForceDisabled( COMMAND_FORCE_DISABLE_ID );
		}
	}

	/**
	 * Adds or removes the `readonly` attribute from the textarea from all roots, if document source mode is active.
	 *
	 * @param {Boolean} isReadOnly Indicates whether all textarea elements should be read-only.
	 */
	_handleReadOnlyMode( isReadOnly ) {
		if ( !this.isSourceEditingMode ) {
			return;
		}

		for ( const [ , domSourceEditingElementWrapper ] of this._replacedRoots ) {
			domSourceEditingElementWrapper.querySelector( 'textarea' ).readOnly = isReadOnly;
		}
	}

	/**
	 * Checks, if the plugin is allowed to handle the source editing mode by itself. Currently, the source editing mode is supported only
	 * for the {@link module:editor-classic/classiceditor~ClassicEditor classic editor}.
	 *
	 * @private
	 * @returns {Boolean}
	 */
	_isAllowedToHandleSourceEditingMode() {
		const editor = this.editor;
		const editable = editor.ui.view.editable;

		// Checks, if the editor's editable belongs to the editor's DOM tree.
		return editable && !editable._hasExternalElement;
	}
}

// Formats the content for a better readability.
//
// For a non-HTML source the unchanged input string is returned.
//
// @param {String} input Input string to check.
// @returns {Boolean}
function formatSource( input ) {
	if ( !isHtml( input ) ) {
		return input;
	}

	return formatHtml( input );
}

// Checks, if the document source is HTML. It is sufficient to just check the first character from the document data.
//
// @param {String} input Input string to check.
// @returns {Boolean}
function isHtml( input ) {
	return input.startsWith( '<' );
}
