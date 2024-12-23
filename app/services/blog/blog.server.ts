import fs from "fs";
import matter from "gray-matter";
import path from "path";
import { remark } from "remark";
import html from "remark-html";

import type { BlogPostFileProps } from "~/services/blog/types";

const blogPostsDir = path.join(process.cwd(), "app", "blog");

export const getPosts = async (): Promise<BlogPostFileProps[]> => {
  const fileNames = fs.readdirSync(blogPostsDir);
  const posts = [];
  for (const fileName of fileNames) {
    const id = fileName.replace(/\.md$/, "");
    const data = await getPostData(id);
    posts.push({
      id,
      contentRaw: data.contentRaw,
      contentHtml: data.contentHtml,
      title: data.title,
      date: data.date,
      description: data.description,
      category: data.category,
      tags: data.tags,
    });
  }
  return posts;
};

export const getPostData = async (id: string): Promise<BlogPostFileProps> => {
  const fullPath = path.join(blogPostsDir, `${id}.md`);
  const fileContents = fs.readFileSync(fullPath, "utf8");

  // Use gray-matter to parse the post metadata section
  const matterResult = matter(fileContents);

  // Use remark to convert markdown into HTML string
  const processedContent = await remark()
    .use(html)
    .process(matterResult.content);
  const contentHtml = processedContent.toString();

  // Combine the data with the id and contentHtml
  return {
    id: id,
    contentHtml,
    contentRaw: matterResult.content,
    title: matterResult.data.title,
    date: matterResult.data.date,
    description: matterResult.data.description,
    category: matterResult.data.category,
    tags: matterResult.data.tags,
  };
};
