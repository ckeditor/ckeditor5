/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/* globals console, window, document */

import ClassicEditor from '@ckeditor/ckeditor5-editor-classic/src/classiceditor';
import Essentials from '@ckeditor/ckeditor5-essentials/src/essentials';
import Paragraph from '@ckeditor/ckeditor5-paragraph/src/paragraph';
import Heading from '@ckeditor/ckeditor5-heading/src/heading';
import List from '@ckeditor/ckeditor5-list/src/list';
import Bold from '@ckeditor/ckeditor5-basic-styles/src/bold';
import Italic from '@ckeditor/ckeditor5-basic-styles/src/italic';
import findAttributeRange from '@ckeditor/ckeditor5-typing/src/utils/findattributerange';

import { CS_CONFIG } from '@ckeditor/ckeditor5-cloud-services/tests/_utils/cloud-services-config';

import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import Command from '@ckeditor/ckeditor5-core/src/command';

import ButtonView from '@ckeditor/ckeditor5-ui/src/button/buttonview';
import { ContextualBalloon, clickOutsideHandler } from '@ckeditor/ckeditor5-ui';
import FormView from '../_utils/abbreviationView';
import { toMap } from '@ckeditor/ckeditor5-utils';

class AbbreviationUI extends Plugin {
	static get requires() {
		return [ ContextualBalloon ];
	}
	static get pluginName() {
		return 'AbbreviationUI';
	}

	init() {
		const editor = this.editor;
		this._createToolbarAbbreviationButton();
		this._balloon = editor.plugins.get( ContextualBalloon );
		this.formView = this._createFormView();
	}

	_createFormView() {
		const editor = this.editor;

		const formView = new FormView( editor.locale );

		// Execute link command after clicking the "Save" button.
		this.listenTo( formView, 'submit', () => {
			const value = {
				abbr: formView.abbrInputView.fieldView.element.value,
				title: formView.titleInputView.fieldView.element.value
			};
			editor.execute( 'addAbbreviation', value );

			// Focus the editing view after inserting the abbreviation so the user can start typing the content
			// right away and keep the editor focused.
			editor.editing.view.focus();

			this._hideUI();
		} );

		// Hide the panel after clicking the "Cancel" button.
		this.listenTo( formView, 'cancel', () => {
			this._hideUI();
		} );

		clickOutsideHandler( {
			emitter: formView,
			activator: () => this._balloon.visibleView === formView,
			contextElements: [ this._balloon.view.element ],
			callback: () => this._hideUI()
		} );

		return formView;
	}

	_createToolbarAbbreviationButton() {
		const editor = this.editor;
		const t = editor.t;

		editor.ui.componentFactory.add( 'abbreviation', locale => {
			const button = new ButtonView( locale );

			button.isEnabled = true;
			button.label = t( 'Abbreviation' );
			button.tooltip = true;
			button.withText = true;

			// Show the panel on button click.
			this.listenTo( button, 'execute', () => {
				this._showUI();
			} );

			return button;
		} );
	}

	_showUI() {
		const selection = this.editor.model.document.selection;
		const commandValue = this.editor.commands.get( 'addAbbreviation' ).value;

		this._balloon.add( {
			view: this.formView,
			position: this._getBalloonPositionData()
		} );

		// If the selection is not collapsed, it's hard to change the text of the abbreviation because
		// the selection could span multiple paragraphs. Disable the input in this case.
		this.formView.abbrInputView.isEnabled = this.editor.model.document.selection.getFirstRange().isCollapsed;

		// Fill the form using the state (value) of the command.
		if ( commandValue ) {
			this.formView.abbrInputView.fieldView.value = commandValue.abbr;
			this.formView.titleInputView.fieldView.value = commandValue.title;
		}
		// If the command has no value, it means the selection is not collapsed or collapsed but not
		// in an existing abbreviation. Put the currently selected text (not collapsed) in the
		// first field and empty the second in that case.
		else {
			const selectedText = getRangeText( selection.getFirstRange() );

			this.formView.abbrInputView.fieldView.value = selectedText;
			this.formView.titleInputView.fieldView.value = '';
		}

		// If the abbreviation text field is enabled, focus it straight away to allow the user to type.
		if ( this.formView.abbrInputView.isEnabled ) {
			this.formView.abbrInputView.focus();
		}
		// Focus the abbreviation title field if the former is disabled.
		else {
			this.formView.titleInputView.focus();
		}
	}

	_hideUI() {
		// Reset the state of the form when it hides.
		this.formView.abbrInputView.fieldView.value = '';
		this.formView.titleInputView.fieldView.value = '';
		this.formView.element.reset();

		this._balloon.remove( this.formView );
	}

	_getBalloonPositionData() {
		const view = this.editor.editing.view;
		const viewDocument = view.document;
		let target = null;

		target = () => view.domConverter.viewRangeToDom( viewDocument.selection.getFirstRange() );

		return {
			target
		};
	}
}

class AbbreviationCommand extends Command {
	refresh() {
		const model = this.editor.model;
		const selection = model.document.selection;
		const firstRange = selection.getFirstRange();

		// The command has a value when the selection is collapsed and the caret is in an abbreviation.
		if ( firstRange.isCollapsed ) {
			if ( selection.hasAttribute( 'abbreviation' ) ) {
				const attributeValue = selection.getAttribute( 'abbreviation' );

				// Find the entire range containing the abbreviation under the caret position.
				const abbreviationRange = findAttributeRange( selection.getFirstPosition(), 'abbreviation', attributeValue, model );

				this.value = {
					abbr: getRangeText( abbreviationRange ),
					title: attributeValue,
					range: abbreviationRange
				};
			} else {
				this.value = null;
			}
		} else {
			this.value = null;
		}

		// The command is enabled when the "abbreviation" attribute can be set on the current model selection.
		this.isEnabled = model.schema.checkAttributeInSelection( selection, 'abbreviation' );
	}

	execute( { abbr, title } ) {
		const model = this.editor.model;
		const selection = model.document.selection;

		model.change( writer => {
			// If selection is collapsed then update the selected abbreviation or insert a new one at the place of caret.
			if ( selection.isCollapsed ) {
				// When a collapsed selection is inside text with the "abbreviation" attribute, update its text and title.
				if ( this.value ) {
					const { end: positionAfter } = model.insertContent(
						writer.createText( abbr, { abbreviation: title } ),
						this.value.range
					);

					// Put the selection at the end of the inserted abbreviation.
					writer.setSelection( positionAfter );
				}
				// If the collapsed selection is not in an existing abbreviation, insert a text node with the "abbreviation" attribute
				// in place of the caret. Because the selection is collapsed, the attribute value will be used as a data for text.
				// If the abbreviation is empty, do not do anything.
				else if ( abbr !== '' ) {
					const firstPosition = selection.getFirstPosition();

					// Collect all attributes of the user selection (could be "bold", "italic", etc.)
					const attributes = toMap( selection.getAttributes() );

					// Put the new attribute to the map of attributes.
					attributes.set( 'abbreviation', title );

					// Inject the new text node with the abbreviation text with all selection attributes.
					const { end: positionAfter } = model.insertContent( writer.createText( abbr, attributes ), firstPosition );

					// Put the selection at the end of the inserted abbreviation. Using an end of a range returned from
					// insertContent() just in case nodes with the same attributes were merged.
					writer.setSelection( positionAfter );
				}

				// Remove the "abbreviation" attribute attribute from the selection. It stops adding a new content into the abbreviation
				// if the user starts to type.
				writer.removeSelectionAttribute( 'abbreviation' );
			} else {
				// If the selection has non-collapsed ranges, change the attribute on nodes inside those ranges
				// omitting nodes where the "abbreviation" attribute is disallowed.
				const ranges = model.schema.getValidRanges( selection.getRanges(), 'abbreviation' );

				for ( const range of ranges ) {
					writer.setAttribute( 'abbreviation', title, range );
				}
			}
		} );
	}
}

// A helper function that retrieves and concatenates all (raw) text within the model range.
function getRangeText( range ) {
	return Array.from( range.getItems() ).reduce( ( rangeText, node ) => {
		if ( !( node.is( 'text' ) || node.is( 'textProxy' ) ) ) {
			return rangeText;
		}

		return rangeText + node.data;
	}, '' );
}

class AbbreviationEditing extends Plugin {
	init() {
		this._defineSchema();
		this._defineConverters();

		this.editor.commands.add( 'addAbbreviation', new AbbreviationCommand( this.editor ) );
	}
	_defineSchema() {
		const schema = this.editor.model.schema;
		schema.extend( '$text', {
			allowAttributes: [ 'abbreviation' ]
		} );
	}
	_defineConverters() {
		const conversion = this.editor.conversion;
		conversion.for( 'downcast' ).attributeToElement( {
			model: 'abbreviation',
			view: ( modelAttributeValue, conversionApi ) => {
				const { writer } = conversionApi;
				return writer.createAttributeElement( 'abbr', {
					title: modelAttributeValue
				} );
			}
		} );

		conversion.for( 'upcast' ).elementToAttribute( {
			view: {
				name: 'abbr',
				attributes: {
					title: true
				}
			},
			model: {
				key: 'abbreviation',
				value: viewElement => {
					const title = viewElement.getAttribute( 'title' );
					return title;
				}
			}
		} );
	}
}

class Abbreviation extends Plugin {
	static get requires() {
		return [ AbbreviationEditing, AbbreviationUI ];
	}
}

ClassicEditor
	.create( document.querySelector( '#snippet-abbreviation-plugin' ), {
		cloudServices: CS_CONFIG,
		plugins: [ Essentials, Bold, Italic, Heading, List, Paragraph, Abbreviation ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'abbreviation' ]
	} )
	.then( editor => {
		window.editor = editor;
	} )
	.catch( err => {
		console.error( err );
	} );

