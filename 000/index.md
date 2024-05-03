[meta:author]:# 'CodedSakura'
[meta:number]:# '000'
[meta:projects]:# 'Bog;Website'
[meta:started_on]:# '2023-10-20'
[meta:published]:# 'true'
[meta:published_on]:# '2024-05-03'
[meta:last_updated_on]:# '2024-04-30'
[meta:tags]:# 'Blog;WebSite;Markdown'
[meta:permalink]:# 'https://bog.codedsakura.dev/posts/000'


# CodedSakura's Blog - #000

One occasionally wants to publish their thought to the internet. A blog is a
common solution to this problem. I've decided to call my blog "Bog" (and theme
it appropriately).


## Problem definition

I want to put my thoughts and projects into a Markdown file and create 
decent-looking webpages from those files.

I want to be able to add tags and other metadata to the posts.

I want to write my own service for handling this, except for parsing the 
Markdown into HTML.


## Problem 1 - metadata

Markdown has no official support for adding metadata to a file, but there are
industry solutions to this. [Jekyll has Front Matter][1], which allows adding
YAML metadata to any text file, which has to be at the start of the file and
surrounded in `---`. There is also [MultiMarkdown Metadata][2], but that 
differs heavily with parsers.

[1]: https://jekyllrb.com/docs/front-matter/
[2]: https://fletcher.github.io/MultiMarkdown-5/metadata.html

There is also a way to get metadata in a regular Markdown file that would be
compile-able with pretty much any Markdown processor -- using link references:

```md
[meta:author]:# 'CodedSakura'
[meta:number]:# '000'
[meta:projects]:# 'Bog;Website'
...
```

These link references do not get rendered directly, instead their link and title
is placed into locations where the reference is used
(`[1]: https://some.site` can be used like so: `[Some site][1]`).

This is the solution I've decided to go with, as it will mean I do not have to
alter the files before handing them off to a processor.

The labels I've chosen to use are these:

* `meta:author` - author of the post
* `meta:number` - number of the post
* `meta:projects` - what projects the post relates to
* `meta:started_on` - when work on the post was started
* `meta:published` - whether the post is published
* `meta:published_on` - when was the post published
* `meta:last_updated_on` - when was the post last updated
* `meta:tags` - tags
* `meta:permalink` - permalink to the post

In JS to get these in a nice format from a file contents string I'm using this 
code:
```js
function extractMetadata(mdFile) {
  const tags = /^(?:\[.+\n)+/.exec(mdFile)[0];
  return [...tags.matchAll(/\[meta:(\w+)].+?'(.+)'/g)]
    .reduce((acc, [ , k, v ]) => ({ ...acc, [k]: v }), {});
}
```


## Problem 2 - compiling markdown

There are hundreds of different markdown compilers of all different sizes and 
shapes and choosing one with zero restrictions is not easy.

But I _do_ have some restrictions:

* The compiler has to compile to HTML
* It has to allow `<head>` overrides for CSS, lang and charset
* It has to allow custom header and footer
* Allow placing metadata (author, date) under top-level heading
* It should allow making all headings links to themselves

### [Marked](https://github.com/markedjs/marked)

_Marked_ is the first project I looked at, and immediately it looks very much
suitable for my requirements.

It is available as a Node.js package though the NPM package registry, which 
means I won't have to learn a new language or framework to effectively use it.

It generates only the contents that would go into the `<body>` tag, meaning I
can use a template for the `<head>` and header/footer. It also has pretty decent
extensibility -- it is possible to write custom parsers for different components,
for example, the headings.


## Problem 3 - serving

Having chosen a way to compile markdown, I have to decide whether to compile the
files once (static-serve) or on each request (dynamic-serve).

Pros of static-serve:

* I can use a well tested backend for serving ([nginx](https://nginx.org/en/))
* Smaller container size
* Faster serve time

Pros of dynamic-serve:

* More customizability (dark/light theme override without JS)

As the static-serve has smaller container size, I will be using that as I can
leave that dark/light theme to by dynamic from the system theme.

### File layout

I also need to decide on file layout, but I already have a pretty clear picture
on what I want:

```
bog.codedsakura.dev/
|-- index.html -- blog homepage, list all blogs
|-- style.css -- stylesheets
\-- posts/
    |-- 000/
    |   |-- index.html -- compiled blog post
    |   \-- index.md -- original markdown
    \-- 001/
        |-- index.html -- compiled blog post
        |-- index.md -- original markdown
        |-- page2.html -- compiled extra page
        |-- page2.md -- original of compiled page
        |-- 001.png -- extra files
        \-- code/ -- and folders
```

This means copying all the blog posts into `out/posts` and compiling them there.


### Problem 4 - Tags and projects

As visible in [problem 1](#problem-1---metadata), I'm intending to have tags
for blog posts, as well as grouping by project.

The initial implementation of the blog engine will not do anything with these
but in later updates I plan to add a `/tags` and `/projects` directories,
which would get populated with lists of articles.

Similar to this, the main index page for now will be very plain.
