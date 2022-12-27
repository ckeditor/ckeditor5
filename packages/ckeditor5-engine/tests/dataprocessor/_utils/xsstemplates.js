/**
 * @license Copyright (c) 2003-2022, CKSource Holding sp. z o.o. All rights reserved.
 * For licensing, see LICENSE.md or https://ckeditor.com/legal/ckeditor-oss-license
 */

export default {
	'img onerror': '<p><img onerror="%xss%" src="produce404" /></p>',
	'video onerror': '<p><video onerror="%xss%">foo</video></p>',
	'video onerror + src': '<p><video onerror="%xss%" src="produce404">foo</video></p>',
	'video with source onerror': '<p><video><source onerror="%xss%" /></video></p>',
	'video with source onerror 2': '<p><video><source onerror="%xss%" src="produce404" /></video></p>',
	'script': '<script>%xss%</script>'
};
