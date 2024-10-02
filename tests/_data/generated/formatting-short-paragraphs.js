// Creates 800 paragraphs, each with a 50 of text nodes, each text node is wrapped in an HTML tag that will be converted to text attribute.
// This test how text formatting affects the editor loading speed.
export default function makeData() {
	let initialData = '';

	for ( let i = 0; i < 800; i++ ) {
		initialData += '<p>';

		for ( let j = 0; j < 50; j++ ) {
			if ( j % 3 === 0 ) {
				initialData += '<strong>Lorem ipsum</strong>';
			} else if ( j % 3 === 1 ) {
				initialData += '<em> dolor sit </em>';
			} else {
				initialData += '<s>amet. </s>';
			}
		}

		initialData += '</p>';
	}

	return initialData;
}
