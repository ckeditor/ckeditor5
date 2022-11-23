/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/htmlpagedataprocessor
 */

import { HtmlDataProcessor, UpcastWriter } from 'ckeditor5/src/engine';

/**
 * TODO
 *
 * @implements module:engine/dataprocessor/dataprocessor~DataProcessor
 */
export default class HtmlPageDataProcessor extends HtmlDataProcessor {
	/**
	 * TODO
	 *
	 * @param {String} data TODO
	 * @returns {module:engine/view/documentfragment~DocumentFragment} The converted view element.
	 */
	toView( data ) {
		let docType = '';
		let xmlDeclaration = '';

		data = data.replace( /<!DOCTYPE[^>]*>/i, match => {
			docType = match;

			return '';
		} );

		data = data.replace( /<\?xml\s[^?]*\?>/i, match => {
			xmlDeclaration = match;

			return '';
		} );

		// Convert input HTML data to DOM DocumentFragment.
		const domFragment = this._toDom( data );

		// Convert DOM DocumentFragment to view DocumentFragment.
		const viewFragment = this.domConverter.domToView( domFragment, { skipComments: this.skipComments } );

		const writer = new UpcastWriter( viewFragment.document );

		writer.setCustomProperty( '$fullPageDocument', domFragment.ownerDocument.documentElement.outerHTML, viewFragment );

		if ( docType ) {
			writer.setCustomProperty( '$fullPageDocType', docType, viewFragment );
		}

		if ( xmlDeclaration ) {
			writer.setCustomProperty( '$fullPageXmlDeclaration', xmlDeclaration, viewFragment );
		}

		return viewFragment;
	}

	/**
	 * TOODO
	 *
	 * @param {module:engine/view/documentfragment~DocumentFragment} viewFragment
	 * @returns {String} TODO
	 */
	toData( viewFragment ) {
		let data = super.toData( viewFragment );

		const page = viewFragment.getCustomProperty( '$fullPageDocument' );
		const docType = viewFragment.getCustomProperty( '$fullPageDocType' );
		const xmlDeclaration = viewFragment.getCustomProperty( '$fullPageXmlDeclaration' );

		if ( page ) {
			data = page.replace( /<\/body\s*>/, data + '$&' );

			if ( xmlDeclaration ) {
				data = xmlDeclaration + '\n' + data;
			}

			if ( docType ) {
				data = docType + '\n' + data;
			}
		}

		return data;
	}
}
