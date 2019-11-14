/**
 * @license Copyright (c) 2003-2019, CKSource - Frederico Knabben. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/converters
 */

import { rawSnippetTextToModelDocumentFragment } from './utils';

/**
 * A model → view (both editing and data) converter for the `codeBlock` element.
 *
 * Sample input:
 *
 *		<codeBlock language="javascript">foo();<softBreak></softBreak>bar();</codeBlock>
 *
 * Sample output (editing):
 *
 *		<pre data-language="JavaScript"><code class="javascript">foo();<br />bar();</code></pre>
 *
 * Sample output (data, see {@link module:code-block/converters~modelToDataViewSoftBreakInsertion}):
 *
 *		<pre><code class="javascript">foo();\nbar();</code></pre>
 *
 * @param {module:engine/model/model~Model} model
 * @param {Object.<String,String>} [languageLabels={}] An object associating a programming language
 * classes with human–readable labels (as in the editor config). Labels are used in the editing
 * view only.
 * @returns {Function} Returns a conversion callback.
 */
export function modelToViewCodeBlockInsertion( model, languageLabels = {} ) {
	return ( evt, data, conversionApi ) => {
		const { writer, mapper, consumable } = conversionApi;

		if ( !consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const codeBlockLanguage = data.item.getAttribute( 'language' );
		const targetViewPosition = mapper.toViewPosition( model.createPositionBefore( data.item ) );
		const pre = writer.createContainerElement( 'pre', {
			// This attribute is only in the editing view.
			'data-language': languageLabels[ codeBlockLanguage ] || null
		} );
		const code = writer.createContainerElement( 'code', {
			class: codeBlockLanguage
		} );

		writer.insert( writer.createPositionAt( pre, 0 ), code );
		writer.insert( targetViewPosition, pre );
		mapper.bindElements( data.item, code );
	};
}

/**
 * A model → data-view converter for the new line (`softBreak`) separator.
 *
 * Sample input:
 *
 *		<codeBlock ...>foo();<softBreak></softBreak>bar();</codeBlock>
 *
 * Sample output:
 *
 *		<pre><code ...>foo();\nbar();</code></pre>
 *
 * @param {module:engine/model/model~Model} model
 * @returns {Function} Returns a conversion callback.
 */
export function modelToDataViewSoftBreakInsertion( model ) {
	return ( evt, data, conversionApi ) => {
		if ( data.item.parent.name !== 'codeBlock' ) {
			return;
		}

		const { writer, mapper, consumable } = conversionApi;

		if ( !consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const position = mapper.toViewPosition( model.createPositionBefore( data.item ) );

		writer.insert( position, writer.createText( '\n' ) );
	};
}

/**
 * A view → model converter for `<pre>` with `<code>` html.
 *
 * Sample input:
 *
 *		<pre><code class="javascript">foo();\nbar();</code></pre>
 *
 * Sample output:
 *
 *		<codeBlock language="javascript">foo();<softBreak></softBreak>bar();</codeBlock>
 *
 * @param {module:engine/controller/datacontroller~DataController} dataController
 * @param {Array.<String>} languageClasses An array of valid (as in the editor config) CSS classes
 * associated with code languages.
 * @returns {Function} Returns a conversion callback.
 */
export function dataViewToModelCodeBlockInsertion( dataController, languageClasses ) {
	return ( evt, data, conversionApi ) => {
		const viewItem = data.viewItem;
		const viewChild = viewItem.getChild( 0 );

		if ( !viewChild || !viewChild.is( 'code' ) ) {
			return;
		}

		const { consumable, writer } = conversionApi;

		if ( !consumable.test( viewItem, { name: true } ) || !consumable.test( viewChild, { name: true } ) ) {
			return;
		}

		const codeBlock = writer.createElement( 'codeBlock' );

		// Figure out if any of the <code> element's class names is a valid programming
		// language class. If so, use it on the model element (becomes the language of the entire block).
		for ( const className of viewChild.getClassNames() ) {
			if ( languageClasses.includes( className ) ) {
				writer.setAttribute( 'language', className, codeBlock );
				break;
			}
		}

		// If no language value was set, use the default language from the config.
		if ( !codeBlock.hasAttribute( 'language' ) ) {
			writer.setAttribute( 'language', languageClasses[ 0 ], codeBlock );
		}

		const stringifiedElement = dataController.processor.toData( viewChild );
		const textData = extractDataFromCodeElement( stringifiedElement );
		const fragment = rawSnippetTextToModelDocumentFragment( writer, textData );

		writer.append( fragment, codeBlock );

		// Let's see if the codeBlock can be inserted the current modelCursor.
		const splitResult = conversionApi.splitToAllowedParent( codeBlock, data.modelCursor );

		// When there is no split result it means that we can't insert element to model tree,
		// so let's skip it.
		if ( !splitResult ) {
			return;
		}

		// Insert element on allowed position.
		writer.insert( codeBlock, splitResult.position );

		consumable.consume( viewItem, { name: true } );
		consumable.consume( viewChild, { name: true } );

		const parts = conversionApi.getSplitParts( codeBlock );

		// Set conversion result range.
		data.modelRange = writer.createRange(
			conversionApi.writer.createPositionBefore( codeBlock ),
			conversionApi.writer.createPositionAfter( parts[ parts.length - 1 ] )
		);

		// If we had to split parent to insert our element then we want to continue conversion inside
		// the split parent.
		//
		// before split:
		//
		//		<allowed><notAllowed>[]</notAllowed></allowed>
		//
		// after split:
		//
		//		<allowed>
		//			<notAllowed></notAllowed>
		//			<converted></converted>
		//			<notAllowed>[]</notAllowed>
		//		</allowed>
		if ( splitResult.cursorParent ) {
			data.modelCursor = writer.createPositionAt( splitResult.cursorParent, 0 );
		} else {
			// Otherwise just continue after the inserted element.
			data.modelCursor = data.modelRange.end;
		}
	};
}

// Returns content of `<pre></pre>` with unescaped html inside.
//
// @param {String} stringifiedElement
function extractDataFromCodeElement( stringifiedElement ) {
	const data = new RegExp( /^<code[^>]*>([\S\s]*)<\/code>$/ ).exec( stringifiedElement )[ 1 ];

	return data
		.replace( /&lt;/g, '<' )
		.replace( /&gt;/g, '>' );
}
