import React from 'react';
import { CKEditor } from '@ckeditor/ckeditor5-react';
import ClassicEditor from './ckeditor';

/**
 * @see https://ckeditor.com/docs/ckeditor5/latest/builds/guides/integration/frameworks/react.html#component-properties
 */
export default function TaskworldCKEditor( props ) {
	return React.createElement( CKEditor, { ...props, editor: ClassicEditor } );
}
