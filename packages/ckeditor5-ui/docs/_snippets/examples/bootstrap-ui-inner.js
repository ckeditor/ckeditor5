/**
 * @license Copyright (c) 2003-2018, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md.
 */

/* globals $, window, console:false */

// Basic classes to create an editor.
import Editor from '@ckeditor/ckeditor5-core/src/editor/editor';
import InlineEditableUIView from '@ckeditor/ckeditor5-ui/src/editableui/inline/inlineeditableuiview';
import HtmlDataProcessor from '@ckeditor/ckeditor5-engine/src/dataprocessor/htmldataprocessor';
import ElementReplacer from '@ckeditor/ckeditor5-utils/src/elementreplacer';

// Interfaces to extend basic Editor API.
import DataApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/dataapimixin';
import ElementApiMixin from '@ckeditor/ckeditor5-core/src/editor/utils/elementapimixin';

// Helper function for adding interfaces to the Editor class.
import mix from '@ckeditor/ckeditor5-utils/src/mix';

// Helper function that binds editor with HTMLForm element.
import attachToForm from '@ckeditor/ckeditor5-core/src/editor/utils/attachtoform';

// Basic features that every editor should enable.
import Clipboard from '@ckeditor/ckeditor5-clipboard/src/clipboard';
import Enter from '@ckeditor/ckeditor5-enter/src/enter';
import Typing from '@ckeditor/ckeditor5-typing/src/typing';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import UndoEditing from '@ckeditor/ckeditor5-undo/src/undoediting';

// Basic features to associated with the edited content.
import BoldEditing from '@ckeditor/ckeditor5-basic-styles/src/bold/boldediting';
import ItalicEditing from '@ckeditor/ckeditor5-basic-styles/src/italic/italicediting';
import UnderlineEditing from '@ckeditor/ckeditor5-basic-styles/src/underline/underlineediting';
import HeadingEditing from '@ckeditor/ckeditor5-heading/src/headingediting';

// EasyImage
import EasyImage from '@ckeditor/ckeditor5-easy-image/src/easyimage';
import { TOKEN_URL } from '@ckeditor/ckeditor5-cloudservices/tests/_utils/cloudservices-config';

// Extending the Editor, which brings base editor API.
export default class BootstrapEditor extends Editor {
	constructor( element, config ) {
		super( config );

		this.element = element;

		// Create the ("main") root element of the model tree.
		this.model.document.createRoot();

		// Use the HTML data processor in this editor.
		this.data.processor = new HtmlDataProcessor();

		// This editor uses a single editable view in DOM.
		this.editable = new InlineEditableUIView( this.locale );

		// A helper to easily replace the editor#element with editor.editable#element.
		this._elementReplacer = new ElementReplacer();

		// When editor#element is a textarea inside a form element
		// then content of this textarea will be updated on form submit.
		attachToForm( this );
	}

	destroy() {
		// When destroyed, editor sets the output of editor#getData() into editor#element...
		this.updateElement();

		// ...and restores editor#element.
		this._elementReplacer.restore();

		return super.destroy();
	}

	static create( element, config ) {
		return new Promise( resolve => {
			const editor = new this( element, config );
			const editable = editor.editable;

			resolve(
				editor.initPlugins()
					// Render the editable view in DOM first.
					.then( () => editable.render() )
					// Replace the editor#element with editor.editable#element.
					.then( () => editor._elementReplacer.replace( element, editable.element ) )
					// Handle the UI of the editor.
					.then( () => {
						// Create an editing root in the editing layer. It will correspond with the
						// document root created in the constructor().
						const editingRoot = editor.editing.createRoot( 'div' );

						// Bind the basic attributes of the editable in DOM with the editing layer.
						editable.bind( 'isReadOnly' ).to( editingRoot );
						editable.bind( 'isFocused' ).to( editor.editing.view );
						editable.name = editingRoot.rootName;

						// Setup the external Bootstrap UI so it works with the editor.
						setupButtons( editor );
						setupHeadingDropdown( editor );

						// Tell the world that the UI of the editor is ready to use.
						editor.fire( 'uiReady' );
					} )
					// Bind the editor editing layer to the editable in DOM.
					.then( () => editor.editing.view.attachDomRoot( editable.element ) )
					.then( () => editor.loadDataFromElement() )
					// Fire the events that announce that the editor is complete and ready to use.
					.then( () => {
						editor.fire( 'dataReady' );
						editor.fire( 'ready' );
					} )
					.then( () => editor )
			);
		} );
	}
}

// Mixing interfaces, which extends basic editor API.
mix( BootstrapEditor, DataApiMixin );
mix( BootstrapEditor, ElementApiMixin );

// This function activates Bold, Italic, Underline, Undo and Redo buttons in the toolbar.
function setupButtons( editor ) {
	[ 'bold', 'italic', 'underline', 'undo', 'redo' ].forEach( commandName => {
		// Retrieve the editor command corresponding with the id of the button in DOM.
		const command = editor.commands.get( commandName );

		// Retrieve the jQuery object corresponding with the button in DOM.
		const button = $( `#${ commandName }` );

		// Clicking on the buttons should execute the editor command...
		button.click( () => editor.execute( commandName ) );

		// ...but it should not steal the focus so the editing is uninterrupted.
		button.mousedown( evt => evt.preventDefault() );

		// Commands can become disabled, e.g. when the editor is read-only.
		// Make sure the buttons reflect this state change.
		command.on( 'change:isEnabled', onIsEnabledChange );
		onIsEnabledChange();

		// Bold, Italic and Underline commands have a value that changes
		// when the selection starts in an element the command creates.
		// The button should indicate that e.g. editing text which is already bold.
		if ( !new Set( [ 'undo', 'redo' ] ).has( commandName ) ) {
			command.on( 'change:value', onValueChange );
			onValueChange();
		}

		function onValueChange() {
			button.toggleClass( 'active', command.value );
		}

		function onIsEnabledChange() {
			button.attr( 'disabled', () => !command.isEnabled );
		}
	} );
}

// This function activates the headings dropdown in the toolbar.
function setupHeadingDropdown( editor ) {
	const menu = $( '.ck-editor .dropdown-menu' );
	const button = $( '.ck-editor .dropdown-toggle' );

	// Create a dropdown menu entry for each heading configuration option.
	editor.config.get( 'heading.options' ).map( option => {
		// Retrieve the editor command corresponding with the configuration option.
		const command = editor.commands.get( option.modelElement );

		// Create the menu item DOM element.
		const menuItem = $(
			`<a href="#" class="dropdown-item heading-item_${ option.modelElement }">` +
				`${ option.title }` +
			'</a>' );

		// Upon click, the dropdown menua item should execute the command and focus
		// the editing view to keep the editing process uninterrupted.
		menuItem.click( () => {
			editor.execute( option.modelElement );
			editor.editing.view.focus();
		} );

		menu.append( menuItem );

		// Make sure the dropdown and its items reflect the state of the
		// currently active command.
		command.on( 'change:value', onValueChange );
		onValueChange();

		// Heading commands can become disabled, e.g. when the editor is read-only.
		// Make sure the UI reflects this state change.
		command.on( 'change:isEnabled', onIsEnabledChange );
		onIsEnabledChange();

		function onValueChange() {
			if ( command.value ) {
				button.children( ':first' ).text( option.title );
			}

			menuItem.toggleClass( 'active', command.value );
		}

		function onIsEnabledChange() {
			button.attr( 'disabled', () => !command.isEnabled );
		}
	} );
}

// Finally, create the BootstrapEditor instance with a selected set of features.
BootstrapEditor
	.create( $( '#editor' ).get( 0 ), {
		plugins: [
			Clipboard, Enter, Typing, Paragraph, EasyImage,
			BoldEditing, ItalicEditing, UnderlineEditing, HeadingEditing, UndoEditing,
		],
		cloudServices: {
			tokenUrl: TOKEN_URL
		}
	} )
	.then( editor => {
		window.editor = editor;

		$( '#toggle-readonly' ).on( 'click', () => {
			editor.isReadOnly = !editor.isReadOnly;
		} );
	} )
	.catch( err => {
		console.error( err.stack );
	} );

