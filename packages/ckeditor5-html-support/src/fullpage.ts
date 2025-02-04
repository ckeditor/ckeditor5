/**
 * @license Copyright (c) 2003-2025, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-licensing-options
 */

/**
 * @module html-support/fullpage
 */

import { Plugin, type Editor } from 'ckeditor5/src/core.js';
import { global } from 'ckeditor5/src/utils.js';
import {
	UpcastWriter,
	type DataControllerToModelEvent,
	type DataControllerToViewEvent
} from 'ckeditor5/src/engine.js';

import HtmlPageDataProcessor from './htmlpagedataprocessor.js';

/**
 * The full page editing feature. It preserves the whole HTML page in the editor data.
 */
export default class FullPage extends Plugin {
	/**
	 * @inheritDoc
	 */
	public static get pluginName() {
		return 'FullPage' as const;
	}

	/**
	 * @inheritDoc
	 */
	public static override get isOfficialPlugin(): true {
		return true;
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

			const allowRenderStylesFromHead = isAllowedRenderStylesFromHead( editor );

			if ( allowRenderStylesFromHead ) {
				const fullPageData = root.getAttribute( '$fullPageDocument' ) as string;

				this._removeStyleElementsFromDom();
				this._renderStyleElementsInDom( fullPageData );
			}
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

	/**
	 * Checks if in the document exists any `<style>` elements injected by the plugin and removes them,
	 * so these could be re-rendered later.
	 * There is used `data-full-page-style-id` attribute to recognize styles injected by the feature.
	 */
	private _removeStyleElementsFromDom(): void {
		const existingStyleElements = Array.from(
			global.document.querySelectorAll( `[data-full-page-style-id="${ this.editor.id }"]` )
		);

		for ( const style of existingStyleElements ) {
			style.remove();
		}
	}

	/**
	 *
	 * @param fullPageData Represents the full page data passed to the editor as a string.
	 */
	private _renderStyleElementsInDom( fullPageData: string ): void {
		// Use DOMParser for easier elements extraction and unwanted code execution prevention.
		const domParser = new DOMParser();
		const doc = domParser.parseFromString( fullPageData, 'text/html' );

		// Extract `<style>` elements from the `<head>` from the full page data.
		const styleElements = Array.from( doc.querySelectorAll( 'head style' ) );

		// Add `data-full-page-style` attribute to the `<style>` element and render it in `<head>` in the main document.
		for ( const style of styleElements ) {
			style.setAttribute( 'data-full-page-style-id', this.editor.id );

			global.document.head.append( style );
		}
	}
}

/**
 * Normalize the Full page configuration option `allowRenderStylesFromHead`.
 */
function isAllowedRenderStylesFromHead( editor: Editor ): boolean {
	const allowRenderStylesFromHead = editor.config.get( 'fullPage.allowRenderStylesFromHead' );

	// When not defined, option `allowRenderStylesFromHead` by default is set to `false`.
	return allowRenderStylesFromHead !== undefined ? allowRenderStylesFromHead : false;
}
