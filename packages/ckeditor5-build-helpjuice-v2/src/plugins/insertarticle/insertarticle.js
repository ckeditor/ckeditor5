import InsertArticleEditing from './insertarticleediting';
import InsertArticleUI from './insertarticleui';
import Plugin from '@ckeditor/ckeditor5-core/src/plugin';
import "./styles.css";

export default class InsertArticle extends Plugin {
	static get requires() {
		return [InsertArticleEditing, InsertArticleUI];
	}
}
