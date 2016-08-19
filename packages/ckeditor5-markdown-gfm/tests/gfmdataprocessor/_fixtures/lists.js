export default [
	{
		name: 'tight asterisks',
		md: '*	item 1\n*	item 2\n*	item 3',
		html: '<ul><li>item 1</li><li>item 2</li><li>item 3</li></ul>'
	},
	{
		name: 'loose asterisks',
		md: '*	item 1\n\n*	item 2\n\n*	item 3',
		html: '<ul><li><p>item 1</p></li><li><p>item 2</p></li><li><p>item 3</p></li></ul>'
	},
	{
		name: 'tight pluses',
		md: '+	item 1\n+	item 2\n+	item 3',
		html: '<ul><li>item 1</li><li>item 2</li><li>item 3</li></ul>'
	},
	{
		name: 'loose pluses',
		md: '+	item 1\n\n+	item 2\n\n+	item 3',
		html: '<ul><li><p>item 1</p></li><li><p>item 2</p></li><li><p>item 3</p></li></ul>'
	},
	{
		name: 'tight minuses',
		md: '-	item 1\n-	item 2\n-	item 3',
		html: '<ul><li>item 1</li><li>item 2</li><li>item 3</li></ul>'
	},
	{
		name: 'loose minuses',
		md: '-	item 1\n\n-	item 2\n\n-	item 3',
		html: '<ul><li><p>item 1</p></li><li><p>item 2</p></li><li><p>item 3</p></li></ul>'
	},
	{
		name: 'ordered list with tabs',
		md: '1.	item 1\n2.	item 2\n3.	item 3',
		html: '<ol><li>item 1</li><li>item 2</li><li>item 3</li></ol>'
	},
	{
		name: 'ordered list with spaces',
		md: '1. item 1\n2. item 2\n3. item 3',
		html: '<ol><li>item 1</li><li>item 2</li><li>item 3</li></ol>'
	},
	{
		name: 'loose ordered list with tabs',
		md: '1.	item 1\n\n2.	item 2\n\n3.	item 3',
		html: '<ol><li><p>item 1</p></li><li><p>item 2</p></li><li><p>item 3</p></li></ol>'
	},
	{
		name: 'loose ordered list with spaces',
		md: '1. item 1\n\n2. item 2\n\n3. item 3',
		html: '<ol><li><p>item 1</p></li><li><p>item 2</p></li><li><p>item 3</p></li></ol>'
	},
	{
		name: 'multiple paragraphs',
		md: '1.	Item 1, graf one.\n\n	Item 2. graf two. The quick brown fox jumped over the lazy dogs\n	back.\n	\n2.	Item 2.\n\n3.	Item 3.',
		html: '<ol><li><p>Item 1, graf one.</p><p>Item 2. graf two. The quick brown fox jumped over the lazy dogs<br></br>back.</p></li><li><p>Item 2.</p></li><li><p>Item 3.</p></li></ol>'
	},
	{
		name: 'nested',
		md: '*	Tab\n	*	Tab\n		*	Tab',
		html: '<ul><li>Tab<ul><li>Tab<ul><li>Tab</li></ul></li></ul></li></ul>'
	},
	{
		name: 'nested and mixed',
		md: '1. First\n2. Second:\n	* Fee\n	* Fie\n	* Foe\n3. Third',
		html: '<ol><li>First</li><li>Second:<ul><li>Fee</li><li>Fie</li><li>Foe</li></ul></li><li>Third</li></ol>'
	},
	{
		name: 'nested and mixed loose',
		md: '1. First\n\n2. Second:\n	* Fee\n	* Fie\n	* Foe\n\n3. Third',
		html: '<ol><li><p>First</p></li><li><p>Second:</p><ul><li>Fee</li><li>Fie</li><li>Foe</li></ul></li><li><p>Third</p></li></ol>'
	},
	{
		name: 'edge case - error in Markdown 1.0.1',
		md: '*	this\n\n	*	sub\n\n	that',
		html: '<ul><li><p>this</p><ul><li>sub</li></ul><p>that</p></li></ul>'
	}
];
