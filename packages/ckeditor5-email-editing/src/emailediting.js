import PlainTableOutput from '@ckeditor/ckeditor5-table/src/plaintableoutput';
import ImageInline from '@ckeditor/ckeditor5-image/src/imageinline';
import InlineStyles from './inlinestyles';

import { Plugin } from 'ckeditor5/src/core';

import {
	addClassToTableElement,
	addBgColorAttributeToElement
} from './normalizers/table';
import normalizeStylesForPlainTableOutput from './normalizers/plaintableoutput';

import getContentStyles from './normalizers/utils';

const IMAGE_TOOLBAR_CONFIG = [
	'imageTextAlternative',
	'imageStyle:alignLeft',
	'imageStyle:inline',
	'imageStyle:alignRight'
];

const CUSTOM_COLOR_PALETTE = [
	{
		color: 'rgb(244, 64, 52)',
		label: 'Red'
	},
	{
		color: 'rgb(233, 32, 99)',
		label: 'Pink'
	}
];

/*
 * This plugin introduces support for e-mail editing. It processes the data returned by the editor
 * to make sure that e-mail clients will render it properly, e.g. by inlining styles.
 */

export default class EmailEditing extends Plugin {
	static get pluginName() {
		return 'EmailEditing';
	}

	static get requires() {
		return [ ImageInline, PlainTableOutput, InlineStyles ];
	}

	init() {
		const editor = this.editor;

		editor.config.set( 'image.toolbar', IMAGE_TOOLBAR_CONFIG );
		editor.config.set( 'table.tableProperties.borderColors', CUSTOM_COLOR_PALETTE );
		editor.config.set( 'table.tableProperties.backgroundColors', CUSTOM_COLOR_PALETTE );
		editor.config.set( 'table.tableCellProperties.borderColors', CUSTOM_COLOR_PALETTE );
		editor.config.set( 'table.tableCellProperties.backgroundColors', CUSTOM_COLOR_PALETTE );

		this._setupConverters();
	}

	getDataForEmail() {
		const editor = this.editor;
		const inlineStylesPlugin = editor.plugins.get( 'InlineStyles' );

		const data = `<div class="ck-content">${ editor.getData() }</div>`;
		const contentStylesArray = getContentStyles( { returnArray: true } );

		const normalizedContentStyles = contentStylesArray
			.map( cssText => this._normalizeStyles( cssText ) )
			.join( ' ' )
			.trim();

		const dataWithInlineStyles = inlineStylesPlugin.getDataWithInlineStyles( data, normalizedContentStyles );

		const editorWidth = editor.ui.view.editable.element.offsetWidth;

		return { dataWithInlineStyles, editorWidth };
	}

	_setupConverters() {
		const conversion = this.editor.conversion;

		// Preserve the .table class on the <table> element to get the correct dimensions.
		addClassToTableElement( conversion );
		addBgColorAttributeToElement( conversion );
	}

	/*
	 * Normalizes specific content styles to make sure Juice inlines them properly.
	 */

	_normalizeStyles( cssText ) {
		cssText = normalizeStylesForPlainTableOutput( cssText );

		return cssText;
	}
}
