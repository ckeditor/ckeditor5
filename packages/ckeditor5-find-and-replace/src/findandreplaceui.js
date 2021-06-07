import { Plugin } from 'ckeditor5/src/core';
import { createDropdown, SplitButtonView } from 'ckeditor5/src/ui';
import 'ckeditor5/packages/ckeditor5-ui/theme/components/responsive-form/responsiveform.css';
import '../theme/findandreplaceform.css';
import FindAndReplaceFormView from './ui/findandreplaceformview';

/**
 * Example Find & Replace UI that uses FindAndReplace plugin API.
 *
 * It demonstrates how to use that API form outside the editor (except UI buttons).
 */
export default class FindAndReplaceUI extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FindAndReplaceUI';
	}

	constructor( editor ) {
		super( editor );

		this.set( 'searchText' );
		this.set( 'replaceText' );
	}
	init() {
		this.activeSearch = null;
		this.findAndReplacePlugin = this.editor.plugins.get( 'FindAndReplace' );

		const editor = this.editor;

		editor.ui.componentFactory.add( 'findAndReplace', locale => {
			const dropdown = createDropdown( locale, SplitButtonView );

			const formView = new FindAndReplaceFormView( editor.locale );

			formView.delegate( 'findNext' ).to( this );
			formView.delegate( 'replaceAll' ).to( this );

			this._createToolbarDropdown( dropdown );

			dropdown.panelView.children.add( formView );

			return dropdown;
		} );
	}

	/**
	 * @private
	 * @param {module:ui/dropdown/dropdownview~DropdownView} dropdown
	 */
	_createToolbarDropdown( dropdown ) {
		const editor = this.editor;
		const t = editor.t;

		// Configure dropdown's button properties:
		dropdown.buttonView.set( {
			withText: true,
			label: t( 'Find and replace' ),
			tooltip: true
		} );
	}
}
