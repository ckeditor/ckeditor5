https://blowstack.com/blog/create-ckeditor-5-custom-build

Create CKEditor 5 custom build
Last update 7.2020

 15 min.
How to create a custom build of CKEditor 5.
Choosing the editor type.
Forking the official repo.
Adding plugins.
Testing the build and commiting the changes.
How to use the CKEditor 5 custom build?
Updating custom build.
Using a ready custom build.


This post if focused on creation of a custom build and to follow it you should already have implemented any standard build in your app. If you haven't implemented such build yet please refer to the following posts which explain how to integrate the classic build in some javascript frameworks:

Ckeditor nuxt integration




How to create a custom build of CKEditor 5


After implementing CKEditor into your app you will notice that it lacks a lot of basic funtions. There are even no alignment or font color options. So the basic build is not very useful at the moment. The only way to extend its capability is by adding new plugins. And the only way to add new plugins is to create a custom build. The process troubles a lot of developers.

CKEditor team came up with a partial solution by introducing an online builder. The web tool can help you make a custom build in a minute but it has a huge flaw which make it quite impractical to use on the production. Your build created that way cannot be updated through git. This means that you won’t be able to follow changes made to the editor by the authors.

To sum up you shouldn’t just create a build with this tool. Instead I show you how to connect your custom build with the official production branch and to ease some things up I will refer a few times to the online builder.





Choosing the editor type


The first step you have to make is to decide what type of editor you want. There are five official different types (builds):

Classic (classic build)
Inline
Ballon
Ballon block
Decouple document

CKEditor 5 custom build editor types

If you don't know which one represent what, the best way to find out is to visit online builder. We will use this tool later so for now just choose the editor type or just go for the classic one which suits requirements most of the people. This step has nothing to do with the possibility to add plugins, it's just related to how your editor will look and behave.




Forking the official repo


Knowing the editor type you can visit the official GitHub repo and proceed to the packages folder. There are all official plugins and builds available in the framework. Let's say you chose the classic build so the folder you want to fork is named ckeditor5-build-classic. You will notice that it's not possible to fork just a single package. For now you will have to fork the whole framework.

On your local machine clone the forked repo.

git clone <your-forked-repo.git>


After cloning go to the root folder of the framework. It's time to separate your editor type from the rest of the framework. I chose classic one so I am going to separate ckeditor5-build-classic. In order to do that just change current directory to the chosen build.

 cd ./packages/ckeditor5-build-classic


All the subsequent changes of the forked repo will be done in this folder and it's super important that you stick with this folder anytime working on your build. Before making any changes remember to create and checkout into your branch named for example mycustombuild. Then you can start making customisations.

git checkout -b mycustombuild


Adding plugins


The best way to find out what is available and how to add specific packages to your build is by using the official CKEditor 5 online builder. This tool will generate a customised build for you. Go there and choose your desired build starting from the editor type. Then add all needed plugins. Finally generate your build, download it and open it's content in your IDE. Unfortunatelly you can't use it in production environment because it's not connected with official CKEditor repository.

After generating build with the online builder find ckeditor.js file in the src folder. Copy all the import statements to your your local forked repository. Then register them and add to the toolbar in your repo. For example if you want to implement the Alignment plugin you have to add three lines of code to the ckeditor.js file and install the plugin files through npm or yarn.

...
import Alignment from '@ckeditor/ckeditor5-alignment/src/alignment.js';


ClassicEditor.builtinPlugins = [
   Alignment,
   ... some other plugins


When adding a plugin to the toolbar stick with camel case format (i.e. for the fontcolor plugin it will be fontColor)

ClassicEditor.defaultConfig = {
toolbar: {
   items: [
      'alignment',


npm install @ckeditor/ckeditor5-alignment


You have to follow the above steps for any additonal plugin you are going to include in your build.

You can also make other changes. Maybe you want to delete some default package from your stating build or maybe you wan't to add some of your own plugin or programable button? If so you can do this before committing the changes.

When you finish install all dependencies from package.json.

npm install


Testing the build


Time to create your build. The command below generates build folder with essentials files which are basically your whole customised editor.

npm run build


Now go to your application where you want to use your just created custom build. I assume that you already use some CKEditor build there. All you have to do is to replace ckeditor.js file from the just built version of your forked repo with the same file in node_modules in your target application where ckeditor is installed.

You have just replaced the content of the offical build so it will work only until the first update of your project packages. During update npm or Yarn will overwrite it's content with the orginal one. That's why you should create your own npm package which can be installed and updated with your custom changes without overwriting.

If everything works as expected commit your changes to your repo.

git add .
git commit -m "alignment plugin added"
git push origin mycustombuild


How to use the CKEditor 5 custom build?


You have to install it in the node_modules in your app. There are two options how to do it which won't overwrite your changes made to the editor. No matter which option you chose you have to work on the specific packge/build folder no tthe whole forked framework.



a) Local install

The super fast but also harder to maintain and rather with purpose to use by a one developer is to install it locally. Copy the custom build files into your app (anywhere convenient for you but not into the node__modules folder!). Then use npm to install it in the node__modules by specifying the folder path.

npm install /path_to_your_buid_files


Then once again install npm dependencies.

npm install


From now one you can import your custom build using the name from the local module registered in package.json.



b) NPM package

I recommend creating your own npm package with this build. It's a very easy process and give you all the benefits of using npm module like easier maintenance, portability and easier cooperation. After creating account in NPM go to the specific package folder of CKEditor where you made changes and type:

npm login


Change package.json file so in the name value instead of @ckeditor will be your npm name with @ prefix sign. The name after slash can be any descriptive for your.

{
  "name": "@your-npm-name/your-custom-build-name",
  ...


After successfull logging publish your custom build.

npm publish --access=public


In your target project where you want to use your newly created build just install it through npm by typing:

npm install @your-npm-name/your-custom-build-name


Now you can use it in the same way as you did with any standrad build for the framework of your choice. So if you happen to use the classic build just find the line importing this build in your code (import ClassicEditor from '@ckeditor/ckeditor5-build-classic') and replace it with your build (import ClassicEditor from 'yourBuildName').


Updating your custom build


In order to keep up with changes made to the official CKEditor 5 framework add an additional remote upstream poitning to the official repo and update your custom branch by merging the stable or the master branch.

git remote add upstream https://github.com/ckeditor/ckeditor5.git


I am going to update with stable branch which is the most recommended one but you can also pick the master branch and get the most up to date changes.

git fetch upstream


git merge upstream/stable


There maybe some conflicts to resolve.

Finally remember to make a build of the new updated version using:

npm run build


When ready just commit your changes into your forked repo and optionally publish your updated version with npm.

Now in your app you can update npm packages to get the new version of your custom build.

npm update


Using a ready custom build


If you happen to use CKEditor mainly on the backend and the size of the package doesn't matter you can use a ready build with all free possible plugins. It's avaialble as a npm package and you can install it by typing:

npm install --save @blowstack/ckeditor5-full-free-build


On some SSR frameworks there is a problem with JavaScript DOM API using window or document objects not available in server application process. In such situation the build should be implemented in a way that ensure accessing these variables only on the client side.

If you happen to use Vue.js with SSR , you are lucky there is CKEditor 5 custom build for Nuxt.js with all free plugins included. Notice that it's quite heavy due to a lot of plugins implemented.

npm install --save @blowstack/ckeditor-nuxt
