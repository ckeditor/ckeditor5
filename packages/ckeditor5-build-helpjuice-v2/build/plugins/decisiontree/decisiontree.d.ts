export default class DecisionTree extends Plugin {
    static get requires(): (typeof DecisionTreeUI)[];
}
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import DecisionTreeUI from "./decisiontreeui";
