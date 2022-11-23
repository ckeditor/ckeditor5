/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/fullpage
 */

import { Plugin } from 'ckeditor5/src/core';
import { UpcastWriter } from 'ckeditor5/src/engine';
import HtmlPageDataProcessor from './htmlpagedataprocessor';

/**
 * TODO
 *
 * @extends module:core/plugin~Plugin
 */
export default class FullPage extends Plugin {
	/**
	 * @inheritDoc
	 */
	static get pluginName() {
		return 'FullPage';
	}

	/**
	 * @inheritDoc
	 */
	init() {
		const editor = this.editor;
		const properties = [ '$fullPageDocument', '$fullPageDocType', '$fullPageXmlDeclaration' ];

		editor.data.processor = new HtmlPageDataProcessor( editor.data.viewDocument );

		editor.model.schema.extend( '$root', {
			allowAttributes: properties
		} );

		editor.data.on( 'toModel', ( evt, [ viewElementOrFragment ] ) => {
			const root = editor.model.document.getRoot();

			editor.model.change( writer => {
				for ( const name of properties ) {
					const value = viewElementOrFragment.getCustomProperty( name );

					if ( value ) {
						writer.setAttribute( name, value, root );
					}
				}
			} );
		}, { priority: 'low' } );

		editor.data.on( 'toView', ( evt, [ modelElementOrFragment ] ) => {
			if ( !modelElementOrFragment.is( 'rootElement' ) ) {
				return;
			}

			const root = modelElementOrFragment;
			const viewFragment = evt.return;

			if ( !root.hasAttribute( '$fullPageDocument' ) ) {
				return;
			}

			const writer = new UpcastWriter( viewFragment.document );

			for ( const name of properties ) {
				const value = root.getAttribute( name );

				if ( value ) {
					writer.setCustomProperty( name, value, viewFragment );
				}
			}
		}, { priority: 'low' } );

		editor.data.on( 'get', ( evt, args ) => {
			if ( !args[ 0 ] ) {
				args[ 0 ] = {};
			}

			args[ 0 ].trim = false;
		}, { priority: 'high' } );
	}
}
