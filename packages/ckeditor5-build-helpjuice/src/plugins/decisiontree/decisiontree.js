import DecisionTreeEditing from "./decisiontreeediting";
import DecisionTreeUI from "./decisiontreeui";
import Plugin from "@ckeditor/ckeditor5-core/src/plugin";
import "./styles.css";

export default class DecisionTree extends Plugin {
	static get requires() {
		return [DecisionTreeEditing, DecisionTreeUI];
	}
}
