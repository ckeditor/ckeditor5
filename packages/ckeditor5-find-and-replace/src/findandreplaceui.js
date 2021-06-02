import { Plugin } from 'ckeditor5/src/core';
import { createDropdown, ButtonView, SplitButtonView, LabeledFieldView, createLabeledInputText, View } from 'ckeditor5/src/ui';
import 'ckeditor5/packages/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import 'ckeditor5/packages/ckeditor5-media-embed/theme/mediaform.css';

/**
 * Example Find & Replace UI that uses FindAndReplace plugin API.
 *
 * It demonstrates how to use that API form outside the editor (except UI buttons).
 */
export default class FindAndReplaceUI extends Plugin {
	constructor( editor ) {
		super( editor );

		this.set( 'searchText' );
	}
	init() {
		this.activeSearch = null;

		this.addToolbarDropdown();
		// this.on( 'change:searchText', ( event, propertyName, newValue, oldValue ) => {
		// console.log( propertyName, newValue, oldValue );
		// } );
	}
	addToolbarDropdown() {
		const editor = this.editor;
		const t = editor.t;
		const componentFactory = editor.ui.componentFactory;

		componentFactory.add( 'findAndReplace', locale => {
			const dropdown = createDropdown( locale, SplitButtonView );

			// Configure dropdown's button properties:
			dropdown.buttonView.set( {
				withText: true,
				label: t( 'Find and replace' ),
				tooltip: true
			} );

			dropdown.buttonView.on( 'execute', () => {

			} );

			dropdown.buttonView.on( 'open', () => {

			} );

			dropdown.render();

			const childView = new View();

			const findNextInputView = this._createButton( t( '>' ), 'ck-button-next', 'submit' );
			const findPrevInputView = this._createButton( t( '<' ), 'ck-button-prev', 'submit' );
			const findInputView = this._createInputField();

			childView.setTemplate( {
				tag: 'form',
				attributes: {
					class: [
						'ck',
						'ck-media-form',
						'ck-responsive-form'
					],
					tabindex: '-1'
				},
				children: [
					findInputView,
					findPrevInputView,
					findNextInputView
				]
			} );

			dropdown.panelView.children.add( childView );

			return dropdown;
		} );
	}
	_createInputField() {
		const labeledInput = new LabeledFieldView( this.locale, createLabeledInputText );
		const inputView = labeledInput.fieldView;

		inputView.on( 'input', () => {
			this.searchText = inputView.element.value;
		} );

		labeledInput.label = 'Find';
		labeledInput.infoText = 'Search for something you\'d like to find';
		labeledInput.render();

		return labeledInput.element;
	}
	_createButton( label, icon, className ) {
		const button = new ButtonView( this.locale );

		button.set( {
			label,
			withText: true,
			tooltip: true
		} );
		button.extendTemplate( {
			attributes: {
				class: className
			}
		} );
		// button.type = 'submit';

		return button;
	}
}
