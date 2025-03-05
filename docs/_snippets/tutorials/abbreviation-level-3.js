/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

import {
	ClassicEditor,
	Bold,
	Italic,
	Essentials,
	Heading,
	List,
	Paragraph,
	findAttributeRange,
	Command,
	Plugin,
	ButtonView,
	ContextualBalloon,
	clickOutsideHandler,
	toMap
} from 'ckeditor5';
import {
	CS_CONFIG,
	getViewportTopOffsetConfig,
	attachTourBalloon,
	findToolbarItem
} from '@snippets/index.js';
import FormView from './abbreviationView-level-3.js';

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

		// Execute the command after clicking the "Save" button.
		this.listenTo( formView, 'submit', () => {
			const value = {
				abbr: formView.abbrInputView.fieldView.element.value,
				title: formView.titleInputView.fieldView.element.value
			};
			editor.execute( 'addAbbreviation', value );

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

		// Close the panel on esc key press when the **form has focus**.
		formView.keystrokes.set( 'Esc', ( data, cancel ) => {
			this._hideUI();
			cancel();
		} );

		return formView;
	}

	_createToolbarAbbreviationButton() {
		const editor = this.editor;

		editor.ui.componentFactory.add( 'abbreviation', () => {
			const button = new ButtonView();

			button.isEnabled = true;
			button.label = 'Abbreviation';
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
		this.formView.abbrInputView.isEnabled = selection.getFirstRange().isCollapsed;

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

		this.formView.focus();
	}

	_hideUI() {
		// Reset the state of the form when it hides.
		this.formView.abbrInputView.fieldView.value = '';
		this.formView.titleInputView.fieldView.value = '';
		this.formView.element.reset();

		this._balloon.remove( this.formView );

		// Focus the editing view after inserting the abbreviation so the user can start typing the content
		// right away and keep the editor focused.
		this.editor.editing.view.focus();
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

		// When the selection is collapsed, the command has a value if the caret is in an abbreviation.
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
		}
		// When the selection is not collapsed, the command has a value if the selection contains a subset of a single abbreviation
		// or an entire abbreviation.
		else {
			if ( selection.hasAttribute( 'abbreviation' ) ) {
				const attributeValue = selection.getAttribute( 'abbreviation' );

				// Find the entire range containing the abbreviation under the caret position.
				const abbreviationRange = findAttributeRange( selection.getFirstPosition(), 'abbreviation', attributeValue, model );

				if ( abbreviationRange.containsRange( firstRange, true ) ) {
					this.value = {
						abbr: getRangeText( firstRange ),
						title: attributeValue,
						range: firstRange
					};
				} else {
					this.value = null;
				}
			} else {
				this.value = null;
			}
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
					console.log( positionAfter );
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
				attributes: [ 'title' ]
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
		ui: {
			viewportOffset: {
				top: getViewportTopOffsetConfig()
			}
		},
		plugins: [ Essentials, Bold, Italic, Heading, List, Paragraph, Abbreviation ],
		toolbar: [ 'heading', '|', 'bold', 'italic', 'numberedList', 'bulletedList', '|', 'abbreviation' ]
	} )
	.then( editor => {
		window.editor = editor;

		attachTourBalloon( {
			target: findToolbarItem( editor.ui.view.toolbar,
				item => item.label && item.label === 'Abbreviation' ),
			text: 'Click here to create an abbreviation',
			editor
		} );
	} )
	.catch( err => {
		console.error( err );
	} );

