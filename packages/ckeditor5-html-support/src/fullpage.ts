/**
 * @license Copyright (c) 2003-2023, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module html-support/fullpage
 */

import { Plugin } from 'ckeditor5/src/core';
import { UpcastWriter, type DataControllerToModelEvent, type DataControllerToViewEvent } from 'ckeditor5/src/engine';
import HtmlPageDataProcessor from './htmlpagedataprocessor';

/**
 * The full page editing feature. It preserves the whole HTML page in the editor data.
 */
export default class FullPage extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName(): 'FullPage' {
		return 'FullPage';
	}

	/**
	 * @inheritDoc
	 */
	public init(): void {
		const editor = this.editor;
		const properties = [ '$fullPageDocument', '$fullPageDocType', '$fullPageXmlDeclaration' ];

		editor.data.processor = new HtmlPageDataProcessor( editor.data.viewDocument );

		editor.model.schema.extend( '$root', {
			allowAttributes: properties
		} );

		// Apply custom properties from view document fragment to the model root attributes.
		editor.data.on<DataControllerToModelEvent>( 'toModel', ( evt, [ viewElementOrFragment ] ) => {
			const root = editor.model.document.getRoot()!;

			editor.model.change( writer => {
				for ( const name of properties ) {
					const value = viewElementOrFragment.getCustomProperty( name );

					if ( value ) {
						writer.setAttribute( name, value, root );
					}
				}
			} );
		}, { priority: 'low' } );

		// Apply root attributes to the view document fragment.
		editor.data.on<DataControllerToViewEvent>( 'toView', ( evt, [ modelElementOrFragment ] ) => {
			if ( !modelElementOrFragment.is( 'rootElement' ) ) {
				return;
			}

			const root = modelElementOrFragment;
			const viewFragment = evt.return!;

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

		// Clear root attributes related to full page editing on editor content reset.
		editor.data.on( 'set', () => {
			const root = editor.model.document.getRoot()!;

			editor.model.change( writer => {
				for ( const name of properties ) {
					if ( root.hasAttribute( name ) ) {
						writer.removeAttribute( name, root );
					}
				}
			} );
		}, { priority: 'high' } );

		// Make sure that document is returned even if there is no content in the page body.
		editor.data.on( 'get', ( evt, args ) => {
			if ( !args[ 0 ] ) {
				args[ 0 ] = {};
			}

			args[ 0 ].trim = false;
		}, { priority: 'high' } );
	}
}
