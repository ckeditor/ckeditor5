import CommentsEditing from './commentsediting';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import './styles.css'

export default class Comments extends Plugin {
	static get requires() {
		return [CommentsEditing];
	}

	static get pluginName() {
		return 'Comments';
	}
}
