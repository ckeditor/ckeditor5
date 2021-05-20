import { Plugin } from 'ckeditor5/src/core';
import { ButtonView } from 'ckeditor5/src/ui';
import { createElement, ElementReplacer } from 'ckeditor5/src/utils';

// TODO: create icon
// import sourceEditingIcon from '../theme/icons/sourceediting.svg';

const COMMAND_FORCE_DISABLE_ID = 'SourceEditingMode';

export default class SourceEditingUI extends Plugin {
	static get pluginName() {
		return 'SourceEditingUI';
	}

	constructor( editor ) {
		super( editor );

		this.set( 'isSourceEditingMode', false );

		this._elementReplacer = new ElementReplacer();

		this._replacedRoots = new Map();
	}

	init() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'sourceEditing', locale => {
			const buttonView = new ButtonView( locale );

			buttonView.set( {
				label: t( 'Edit source' ),
				// TODO: use icon
				// icon: sourceEditingIcon,
				tooltip: true,
				withText: true
			} );

			buttonView.bind( 'isOn' ).to( this, 'isSourceEditingMode' );

			this.listenTo( buttonView, 'execute', () => {
				this.isSourceEditingMode = !this.isSourceEditingMode;

				this.fire( 'sourceEditing', { isSourceEditingMode: this.isSourceEditingMode } );
			} );

			return buttonView;
		} );

		if ( this._isAllowedToHandleSourceEditingMode() ) {
			this.on( 'sourceEditing', ( evt, { isSourceEditingMode } ) => {
				if ( isSourceEditingMode ) {
					this._showSourceEditing();
					this._disableCommands();
				} else {
					this._hideSourceEditing();
					this._enableCommands();
				}
			} );
		}
	}

	_showSourceEditing() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		for ( const [ rootName, domRootElement ] of editingView.domRoots ) {
			const data = editor.data.get( { rootName } );

			const domSourceEditingElementTextarea = createElement( domRootElement.ownerDocument, 'textarea', { rows: '1' } );

			const domSourceEditingElementWrapper = createElement( domRootElement.ownerDocument, 'div', {
				class: 'source-editing',
				'data-value': data
			}, [ domSourceEditingElementTextarea ] );

			domSourceEditingElementTextarea.value = data;

			domSourceEditingElementTextarea.addEventListener( 'input', () => {
				domSourceEditingElementWrapper.dataset.value = domSourceEditingElementTextarea.value;
			} );

			this._replacedRoots.set( rootName, domSourceEditingElementWrapper );

			this._elementReplacer.replace( domRootElement, domSourceEditingElementWrapper );

			editingView.change( writer => {
				const viewRoot = editingView.document.getRoot( rootName );

				writer.addClass( 'ck-hidden', viewRoot );
			} );
		}
	}

	_hideSourceEditing() {
		const editor = this.editor;
		const editingView = editor.editing.view;

		for ( const [ rootName, domSourceEditingElementWrapper ] of this._replacedRoots ) {
			editor.data.set( { [ rootName ]: domSourceEditingElementWrapper.dataset.value } );

			editingView.change( writer => {
				const viewRoot = editingView.document.getRoot( rootName );

				writer.removeClass( 'ck-hidden', viewRoot );
			} );
		}

		this._elementReplacer.restore();

		this._replacedRoots.clear();
	}

	_disableCommands() {
		const editor = this.editor;

		for ( const [ , command ] of editor.commands ) {
			command.forceDisabled( COMMAND_FORCE_DISABLE_ID );
		}
	}

	_enableCommands() {
		const editor = this.editor;

		for ( const [ , command ] of editor.commands ) {
			command.clearForceDisabled( COMMAND_FORCE_DISABLE_ID );
		}
	}

	_isAllowedToHandleSourceEditingMode() {
		const editor = this.editor;
		const editable = editor.ui.view.editable;

		return editable && !editable._hasExternalElement;
	}
}
