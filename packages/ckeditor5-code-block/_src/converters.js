/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

/**
 * @module code-block/converters
 */

import { getPropertyAssociation } from './utils';

/**
 * A model-to-view (both editing and data) converter for the `codeBlock` element.
 *
 * Sample input:
 *
 *		<codeBlock language="javascript">foo();<softBreak></softBreak>bar();</codeBlock>
 *
 * Sample output (editing):
 *
 *		<pre data-language="JavaScript"><code class="language-javascript">foo();<br />bar();</code></pre>
 *
 * Sample output (data, see {@link module:code-block/converters~modelToDataViewSoftBreakInsertion}):
 *
 *		<pre><code class="language-javascript">foo();\nbar();</code></pre>
 *
 * @param {module:engine/model/model~Model} model
 * @param {Array.<module:code-block/codeblock~CodeBlockLanguageDefinition>} languageDefs The normalized language
 * configuration passed to the feature.
 * @param {Boolean} [useLabels=false] When `true`, the `<pre>` element will get a `data-language` attribute with a
 * human–readable label of the language. Used only in the editing.
 * @returns {Function} Returns a conversion callback.
 */
export function modelToViewCodeBlockInsertion( model, languageDefs, useLabels = false ) {
	// Language CSS classes:
	//
	//		{
	//			php: 'language-php',
	//			python: 'language-python',
	//			javascript: 'js',
	//			...
	//		}
	const languagesToClasses = getPropertyAssociation( languageDefs, 'language', 'class' );

	// Language labels:
	//
	//		{
	//			php: 'PHP',
	//			python: 'Python',
	//			javascript: 'JavaScript',
	//			...
	//		}
	const languagesToLabels = getPropertyAssociation( languageDefs, 'language', 'label' );

	return ( evt, data, conversionApi ) => {
		const { writer, mapper, consumable } = conversionApi;

		if ( !consumable.consume( data.item, 'insert' ) ) {
			return;
		}

		const codeBlockLanguage = data.item.getAttribute( 'language' );
		const targetViewPosition = mapper.toViewPosition( model.createPositionBefore( data.item ) );
		const preAttributes = {};

		// Attributes added only in the editing view.
		if ( useLabels ) {
			preAttributes[ 'data-language' ] = languagesToLabels[ codeBlockLanguage ];
			preAttributes.spellcheck = 'false';
		}

		const code = writer.createContainerElement( 'code', {
			class: languagesToClasses[ codeBlockLanguage ] || null
		} );

		const pre = writer.createContainerElement( 'pre', preAttributes, code );

		writer.insert( targetViewPosition, pre );
		mapper.bindElements( data.item, code );
	};
}

/**
 * A model-to-data view converter for the new line (`softBreak`) separator.
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
 * A view-to-model converter for `<pre>` with the `<code>` HTML.
 *
 * Sample input:
 *
 *		<pre><code class="language-javascript">foo();bar();</code></pre>
 *
 * Sample output:
 *
 *		<codeBlock language="javascript">foo();bar();</codeBlock>
 *
 * @param {module:engine/view/view~View} editingView
 * @param {Array.<module:code-block/codeblock~CodeBlockLanguageDefinition>} languageDefs The normalized language
 * configuration passed to the feature.
 * @returns {Function} Returns a conversion callback.
 */
export function dataViewToModelCodeBlockInsertion( editingView, languageDefs ) {
	// Language names associated with CSS classes:
	//
	//		{
	//			'language-php': 'php',
	//			'language-python': 'python',
	//			js: 'javascript',
	//			...
	//		}
	const classesToLanguages = getPropertyAssociation( languageDefs, 'class', 'language' );
	const defaultLanguageName = languageDefs[ 0 ].language;

	return ( evt, data, conversionApi ) => {
		const viewCodeElement = data.viewItem;
		const viewPreElement = viewCodeElement.parent;

		if ( !viewPreElement || !viewPreElement.is( 'element', 'pre' ) ) {
			return;
		}

		// In case of nested code blocks we don't want to convert to another code block.
		if ( data.modelCursor.findAncestor( 'codeBlock' ) ) {
			return;
		}

		const { consumable, writer } = conversionApi;

		if ( !consumable.test( viewCodeElement, { name: true } ) ) {
			return;
		}

		const codeBlock = writer.createElement( 'codeBlock' );
		const viewChildClasses = [ ...viewCodeElement.getClassNames() ];

		// As we're to associate each class with a model language, a lack of class (empty class) can be
		// also associated with a language if the language definition was configured so. Pushing an empty
		// string to make sure the association will work.
		if ( !viewChildClasses.length ) {
			viewChildClasses.push( '' );
		}

		// Figure out if any of the <code> element's class names is a valid programming
		// language class. If so, use it on the model element (becomes the language of the entire block).
		for ( const className of viewChildClasses ) {
			const language = classesToLanguages[ className ];

			if ( language ) {
				writer.setAttribute( 'language', language, codeBlock );
				break;
			}
		}

		// If no language value was set, use the default language from the config.
		if ( !codeBlock.hasAttribute( 'language' ) ) {
			writer.setAttribute( 'language', defaultLanguageName, codeBlock );
		}

		conversionApi.convertChildren( viewCodeElement, codeBlock );

		// Let's try to insert code block.
		if ( !conversionApi.safeInsert( codeBlock, data.modelCursor ) ) {
			return;
		}

		consumable.consume( viewCodeElement, { name: true } );

		conversionApi.updateConversionResult( codeBlock, data );
	};
}

/**
 * A view-to-model converter for new line characters in `<pre>`.
 *
 * Sample input:
 *
 *		<pre><code class="language-javascript">foo();\nbar();</code></pre>
 *
 * Sample output:
 *
 *		<codeBlock language="javascript">foo();<softBreak></softBreak>bar();</codeBlock>
 *
 * @returns {Function} Returns a conversion callback.
 */
export function dataViewToModelTextNewlinesInsertion() {
	return ( evt, data, { consumable, writer } ) => {
		let position = data.modelCursor;

		// When node is already converted then do nothing.
		if ( !consumable.test( data.viewItem ) ) {
			return;
		}

		// When not inside `codeBlock` then do nothing.
		if ( !position.findAncestor( 'codeBlock' ) ) {
			return;
		}

		consumable.consume( data.viewItem );

		const text = data.viewItem.data;
		const textLines = text.split( '\n' ).map( data => writer.createText( data ) );
		const lastLine = textLines[ textLines.length - 1 ];

		for ( const node of textLines ) {
			writer.insert( node, position );
			position = position.getShiftedBy( node.offsetSize );

			if ( node !== lastLine ) {
				const softBreak = writer.createElement( 'softBreak' );

				writer.insert( softBreak, position );
				position = writer.createPositionAfter( softBreak );
			}
		}

		data.modelRange = writer.createRange(
			data.modelCursor,
			position
		);
		data.modelCursor = position;
	};
}

/**
 * A view-to-model converter that handles orphan text nodes (white spaces, new lines, etc.)
 * that surround `<code>` inside `<pre>`.
 *
 * Sample input:
 *
 *		// White spaces
 *		<pre> <code>foo()</code> </pre>
 *
 *		// White spaces
 *		<pre>      <code>foo()</code>      </pre>
 *
 *		// White spaces
 *		<pre>			<code>foo()</code>			</pre>
 *
 *		// New lines
 *		<pre>
 *			<code>foo()</code>
 *		</pre>
 *
 *		// Redundant text
 *		<pre>ABC<code>foo()</code>DEF</pre>
 *
 * Unified output for each case:
 *
 *		<codeBlock language="plaintext">foo()</codeBlock>
 *
 * @returns {Function} Returns a conversion callback.
 */
export function dataViewToModelOrphanNodeConsumer() {
	return ( evt, data, { consumable } ) => {
		const preElement = data.viewItem;

		// Don't clean up nested pre elements. Their content should stay as it is, they are not upcasted
		// to code blocks.
		if ( preElement.findAncestor( 'pre' ) ) {
			return;
		}

		const preChildren = Array.from( preElement.getChildren() );
		const childCodeElement = preChildren.find( node => node.is( 'element', 'code' ) );

		// <code>-less <pre>. It will not upcast to code block in the model, skipping.
		if ( !childCodeElement ) {
			return;
		}

		for ( const child of preChildren ) {
			if ( child === childCodeElement || !child.is( '$text' ) ) {
				continue;
			}

			// Consuming the orphan to remove it from the input data.
			// Second argument in `consumable.consume` is discarded for text nodes.
			consumable.consume( child, { name: true } );
		}
	};
}
