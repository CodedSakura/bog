import * as handlebars from "handlebars";
import { marked } from "marked";
import assert from "node:assert";
import { cp, mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import * as path from "node:path";

const outputDir = process.env.OUT_DIR ?? "./out";
const pubDir = process.env.PUB_DIR ?? "./public";
const postsDirName = process.env.POSTS_DIR_NAME ?? "posts";
const templateFile = process.env.TEMPLATE_FILE ?? "./template.handlebars";
const landingFile = process.env.LANDING_FILE ?? "./landing.handlebars";

const postsOutput = path.join(outputDir, postsDirName);


interface _Base_MetaData {
  author: string,
  number: number,
  projects: string[],
  started_on: Date,
  published: boolean,
  last_updated_on: Date,
  tags: string[],
  permalink: string,
  [key: string]: any,
}

type MetaData = _Base_MetaData | ({ published: true, published_on: Date } & { published: false });

interface ExtraData {
  title: string,
  description?: string,
}


marked.use({
  async: true,
  renderer: {
    heading(text, level, raw) {
      const escapedText = raw.toLowerCase().replace(/\W+/g, '-');

      return `<h${level} id="${escapedText}">\n` +
        `    <a href="#${escapedText}" class="anchor">${text}</a>\n` +
        `</h${level}>\n`;
    },
    link(href, title, text) {
      const internal = /^#|^\.?\/|^https:\/\/bog\.codedsakura\.dev/.test(href);
      const titleProp = title ? ` title=${title}` : "";
      if (internal) {
        return `<a href="${href}"${titleProp}>${text}</a>`;
      }
      return `<a href="${href}"${titleProp} class="external" target="_blank">${text}</a>`;
    }
  },
});


handlebars.registerHelper("join", (joiner, list) => {
  if (Array.isArray(list)) {
    return list.join(joiner);
  }
  return list;
});
handlebars.registerHelper("eachSeparated", function (separator, list, options) {
  return list.map(options.fn).join(separator);
});


function extractMetadata(mdFile: string): MetaData {
  assert(/^(?:\[.+\n)+/.test(mdFile));
  const tags = /^(?:\[.+\n)+/.exec(mdFile)![0];
  const raw = [ ...tags.matchAll(/\[meta:(\w+)].+?'(.+)'/g) ]
        .reduce((acc, [ , k, v ]) => ({ ...acc, [k!]: v }), {} as Record<string, string>);

  const published = [ "yes", "true", "y" ].includes(raw.published);
  return {
    ...raw,
    author: raw.author,
    number: Number(raw.number),
    projects: raw.projects.split(";"),
    started_on: new Date(raw.started_on),
    published: published,
    published_on: published ? new Date(raw.published_on) : undefined,
    last_updated_on: new Date(raw.last_updated_on),
    tags: raw.tags.split(";"),
    permalink: raw.permalink,
  };
}

function extractExtra(mdFile: string): ExtraData {
  const [ , title, description ] = /^[\w\W]+?\n#\s*(.+)\s*(?:([\w\W]+?)\s*?\n#)?/.exec(mdFile) ?? [];

  return {
    title,
    description: description?.replace(/\n/g, " "),
  };
}


async function main() {
  await mkdir(postsOutput, { recursive: true });

  await Promise.all((await readdir(pubDir)).map(f => {
    return cp(
      path.join(pubDir, f),
      path.join(outputDir, f),
      { recursive: true },
    );
  }));

  const template = handlebars.compile(await readFile(templateFile, { encoding: "utf-8" }));

  const directories = (await readdir("./", { withFileTypes: true }))
    .filter(v => v.isDirectory())
    .map(v => v.name)
    .filter(v => /^\d+$/.test(v));

  await Promise.all(directories.map(d => {
    return cp(d, path.join(postsOutput, d), { recursive: true });
  }));

  const posts = await Promise.all(directories.flatMap(async d => {
    const files = (await readdir(path.join(postsOutput, d)))
      .filter(v => /\.md$/.test(v));

    const pages = await Promise.all(files.map(async f => {
      const contents = await readFile(path.join(postsOutput, d, f), { encoding: "utf-8" });
      const meta = extractMetadata(contents);
      const extra = extractExtra(contents);
      const content = await marked.parse(contents);
      const html = template({ meta, extra, content });
      await writeFile(
        path.join(postsOutput, d, path.basename(f, ".md") + ".html"),
        html,
        { encoding: "utf-8" },
      );
      return { name: f, meta, extra };
    }));

    return pages.find(v => v.name === "index.md")!;
  }));

  const landingTemplate = handlebars.compile(await readFile(landingFile, { encoding: "utf-8" }));
  const landingContent = landingTemplate({
    posts: posts.sort((a, b) => a.meta.numbe - b.meta.number),
  });
  await writeFile(path.join(outputDir, "index.html"), landingContent, { encoding: "utf-8" });
}

main().catch(console.error);
