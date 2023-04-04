export default class InsertArticle extends Plugin {
    static get requires(): (typeof InsertArticleEditing | typeof InsertArticleUI)[];
}
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import InsertArticleEditing from "./insertarticleediting";
import InsertArticleUI from "./insertarticleui";
