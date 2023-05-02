export default function getContentStyles( options = {} ) {
	const editorStyles = [];

	for ( const styleSheet of Array.from( document.styleSheets ) ) {
		const ownerNode = styleSheet.ownerNode;

		if ( ownerNode.hasAttribute( 'data-cke' ) ) {
			for ( const rule of Array.from( styleSheet.cssRules ) ) {
				if ( rule.cssText.indexOf( '.ck-content' ) !== -1 ) {
					editorStyles.push( rule.cssText );
				}
			}
		}
	}

	if ( !editorStyles.length ) {
		console.warn(
			'The editor stylesheet could not be found in the document. ' +
				'Check your webpack config – style-loader should use data-cke=true attribute for the editor stylesheet.'
		);
	}

	// We want to trim the returned value in case of `[ "", "", ... ]`.
	return options.returnArray ? editorStyles : [ ...editorStyles ].join( ' ' ).trim();
}
