---
category: self-hosted
meta-title: Using CKEditor 5 with Spring Boot from ZIP archive | CKEditor 5 Documentation
meta-description: Integrate CKEditor 5 with Spring Boot using a ZIP archive.
order: 130
menu-title: Spring Boot
modified_at: 2025-05-06
---

# Integrating CKEditor&nbsp;5 with Spring Boot from ZIP

As a pure JavaScript/TypeScript application, CKEditor&nbsp;5 will work inside any environment that supports such components. While we do not offer official integrations for any non-JavaScript frameworks, you can include a custom configuration of CKEditor&nbsp;5 in a non-JS framework of your choice, for example, the Java-based [Spring Boot](https://spring.io/projects/spring-boot).

{@snippet getting-started/use-builder}

## Setting up the project

This guide assumes you already have a Spring Boot project. You can create a basic Spring Boot project using [Spring Initializr](https://start.spring.io/). Refer to the [Spring Boot documentation](https://docs.spring.io/spring-boot/docs/current/reference/html/getting-started.html) to learn how to set up a project in this framework.

This guide is using the "Spring Web" and "Thymeleaf" dependencies selected in the Spring Initializr. Here is the list of dependencies used in the demo project:

```xml
<dependencies>
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-web</artifactId>
	</dependency>
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-test</artifactId>
		<scope>test</scope>
	</dependency>
	<dependency>
		<groupId>org.springframework.boot</groupId>
		<artifactId>spring-boot-starter-thymeleaf</artifactId>
	</dependency>
</dependencies>
```

## Integrating using ZIP

After downloading and unpacking the ZIP archive, copy the `ckeditor5.js` and `ckeditor5.css` files into the `src/main/resources/static/ckeditor5/` directory. The folder structure of your app should resemble this one.

```plain
├── src
│   ├── main
│   │   ├── java
│   │   │   └── com
│   │   │       └── example
│   │   │           └── demo
│   │   │               └── DemoApplication.java
│   │   └── resources
│   │       ├── static
│   │       │   ├── ckeditor5
│   │       │   │   ├── ckeditor5.js
│   │       │   │   └── ckeditor5.css
│   │       │   └── ...
│   │       ├── templates
│   │       │   ├── ckeditor5.html
│   │       │   └── ...
│   │       └── application.properties
│   └── test
├── pom.xml
└── ...
```

Having all the dependencies of CKEditor&nbsp;5, create or modify the `index.html` file in the `src/main/resources/templates` directory to import them. All the necessary markup is in the `index.html` file from the ZIP archive. You can copy and paste it into your template. Pay attention to the paths of the import map and CSS link &ndash; they should reflect your folder structure. The template should look similar to the one below:

<info-box info>
	Starting from version 44.0.0, the `licenseKey` property is required to use the editor. If you use a self-hosted editor from ZIP:

	* You must either comply with the GPL or
	* Obtain a license for {@link getting-started/licensing/license-key-and-activation self-hosting distribution}.

	You can set up [a free trial](https://portal.ckeditor.com/checkout?plan=free) to test the editor and evaluate the self-hosting.
</info-box>

```html
<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="UTF-8">
		<meta name="viewport" content="width=device-width, initial-scale=1.0">
		<title>CKEditor 5 - Spring Boot Integration</title>
		<link rel="stylesheet" href="/assets/vendor/ckeditor5.css">
		<style>
			.main-container {
				width: 795px;
				margin-left: auto;
				margin-right: auto;
			}
		</style>
	</head>
	<body>
		<div class="main-container">
			<div id="editor">
				<p>Hello from CKEditor 5!</p>
			</div>
		</div>
		<script type="importmap">
			{
				"imports": {
					"ckeditor5": "./ckeditor5/ckeditor5.js",
					"ckeditor5/": "./ckeditor5/"
				}
			}
		</script>
		<script type="module">
			import {
				ClassicEditor,
				Essentials,
				Paragraph,
				Bold,
				Italic,
				Font
			} from 'ckeditor5';

			ClassicEditor
				.create( document.querySelector( '#editor' ), {
					licenseKey: '<YOUR_LICENSE_KEY>', // Or 'GPL'.
					plugins: [ Essentials, Paragraph, Bold, Italic, Font ],
					toolbar: [
						'undo', 'redo', '|', 'bold', 'italic', '|',
						'fontSize', 'fontFamily', 'fontColor', 'fontBackgroundColor'
					]
				} )
				.then( editor => {
					window.editor = editor;
				} )
				.catch( error => {
					console.error( error );
				} );
		</script>
	</body>
</html>
```

To make this work with Spring Boot, you need to create a controller to serve the HTML page. Create a file named `HomeController.java` in your project's main package:

```java
package com.example.demo;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;

@Controller
public class HomeController {

	@GetMapping("/")
	public String home() {
		return "index";
	}
}
```

Finally, run your Spring Boot application using `./mvnw spring-boot:run` (or `mvnw.cmd spring-boot:run` on Windows) and navigate to `http://localhost:8080` to see the editor in action.

## Next steps

* See how to manipulate the editor's data in the {@link getting-started/setup/getting-and-setting-data Getting and setting data} guide.
* Refer to further guides in the {@link getting-started/setup/configuration setup section} to see how to customize your editor further.
* Check the {@link features/index features category} to learn more about individual features.
