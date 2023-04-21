/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/htmlpagedataprocessor
 */

import { HtmlDataProcessor, UpcastWriter, type ViewDocumentFragment } from 'ckeditor5/src/engine';

/**
 * The full page HTML data processor class.
 * This data processor implementation uses HTML as input and output data.
 */
export default class HtmlPageDataProcessor extends HtmlDataProcessor {
	/**
	 * @inheritDoc
	 */
	public override toView( data: string ): ViewDocumentFragment {
		// Ignore content that is not a full page source.
		if ( !data.match( /<(?:html|body|head|meta)(?:\s[^>]*)?>/i ) ) {
			return super.toView( data );
		}

		// Store doctype and xml declaration in a separate properties as they can't be stringified later.
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
		const viewFragment = this.domConverter.domToView(
			domFragment,
			{ skipComments: this.skipComments }
		) as ViewDocumentFragment;

		const writer = new UpcastWriter( viewFragment.document );

		// Using the DOM document with body content extracted as a skeleton of the page.
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
	 * @inheritDoc
	 */
	public override toData( viewFragment: ViewDocumentFragment ): string {
		let data = super.toData( viewFragment );

		const page = viewFragment.getCustomProperty( '$fullPageDocument' ) as string | undefined;
		const docType = viewFragment.getCustomProperty( '$fullPageDocType' );
		const xmlDeclaration = viewFragment.getCustomProperty( '$fullPageXmlDeclaration' );

		if ( page ) {
			data = page.replace( /<\/body\s*>/, data + '$&' );

			if ( docType ) {
				data = docType + '\n' + data;
			}

			if ( xmlDeclaration ) {
				data = xmlDeclaration + '\n' + data;
			}
		}

		return data;
	}
}
