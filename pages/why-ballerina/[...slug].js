import fs from "fs";
import matter from "gray-matter";
import React from "react";
import ReactMarkdown from "react-markdown";
import { Container, Col, Button, Offcanvas } from "react-bootstrap";
import MarkdownNavbar from "markdown-navbar";
import remarkGfm from "remark-gfm";
import Image from "next-image-export-optimizer";
import rehypeRaw from "rehype-raw";
import Head from "next/head";
import { getHighlighter, setCDN } from "shiki";

setCDN("https://unpkg.com/shiki/");

import Layout from "../../layouts/LayoutDocs";
import LeftNav from "../../components/common/left-nav/LeftNav";
import { prefix } from "../../utils/prefix";
import LearnToc from "../../utils/learn-lm.json";
import Toc from "../../components/common/pg-toc/toc";

var traverseFolder = function (dir) {
  var results = [];
  var list = fs.readdirSync(dir);
  list.forEach(function (file) {
    var filex = dir + "/" + file;
    var stat = fs.statSync(filex);
    if (stat && stat.isDirectory()) {
      /* Recurse into a subdirectory */
      results = results.concat(traverseFolder(filex));
    } else {
      /* Is a file */
      filex = filex.replace(/swan-lake\/why-ballerina\//g, "");
      results.push(filex);
    }
  });
  return results;
};

export async function getStaticPaths() {
  // Retrieve all our slugs
  const files = traverseFolder("swan-lake/why-ballerina");
  const paths = files.map((fileName) => ({
    params: {
      slug: fileName.replace(".md", "").split("/"),
    },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const id = slug[slug.length - 1];
  slug = slug.join("/");
  const fileName = fs.readFileSync(
    `swan-lake/why-ballerina/${slug}.md`,
    "utf-8"
  );
  const { data: frontmatter, content } = matter(fileName);

  return {
    props: {
      frontmatter,
      content,
      id,
      slug,
    },
  };
}

export default function PostPage({ frontmatter, content, id, slug }) {
  // Synatax highlighting
  const HighlightSyntax = (code, language) => {
    const [codeSnippet, setCodeSnippet] = React.useState([]);

    React.useEffect(() => {
      async function fetchData() {
        getHighlighter({
          theme: "github-light",
          langs: [
            "bash",
            "ballerina",
            "toml",
            "yaml",
            "sh",
            "json",
            "graphql",
            "sql",
          ],
        }).then((highlighter) => {
          setCodeSnippet(highlighter.codeToHtml(code, language));
        });
      }
      fetchData();
    }, [code, language]);
    return [codeSnippet];
  };

  // Show mobile left nav
  const [show, setShow] = React.useState(false);
  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  // Add id attributes to headings
  const extractText = (value) => {
    if (typeof value === "string") {
      return value;
    } else {
      return value.props.children;
    }
  };

  const scanArray = (array) => {
    const newArray = array.map(extractText);
    let newId = newArray
      .join("")
      .replace(/[&\/\\#,+()!$~%.'":*?<>{}]/g, "")
      .toLowerCase();
    newId = newId.replace(/ /g, "-");
    return newId;
  };

  // Show page toc
  const [showToc, setShowToc] = React.useState(false);

  return (
    <>
      <Head>
        <meta name="description" content={frontmatter.description} />
        <meta name="keywords" content={frontmatter.keywords} />

        <title>{frontmatter.title}</title>

        {/* <!--FB--> */}
        <meta property="og:type" content="article" />
        <meta
          property="og:title"
          content={`Ballerina - ${frontmatter.title}`}
        />
        <meta
          property="og:description"
          content={frontmatter.description}
        ></meta>

        {/* <!--LINKED IN  --> */}
        <meta property="og:description" content={frontmatter.description} />

        {/* <!--TWITTER--> */}
        <meta
          property="twitter:description"
          content={frontmatter.description}
        />
        <meta
          property="twitter:text:description"
          content={frontmatter.description}
        />
      </Head>
      <Layout>
        <Col sm={3} xxl={2} className="leftNav d-none d-sm-block">
          <LeftNav
            launcher="why-bal"
            id={id}
            mainDir="why-ballerina"
            Toc={LearnToc}
          />
        </Col>
        <Col xs={12} className="d-block d-sm-none">
          <Button className="learnMob" onClick={handleShow}>
            Why Ballerina
          </Button>
          <Offcanvas show={show} onHide={handleClose}>
            <Offcanvas.Header closeButton></Offcanvas.Header>
            <Offcanvas.Body>
              <LeftNav
                launcher="why-bal"
                id={id}
                mainDir="why-ballerina"
                Toc={LearnToc}
              />
            </Offcanvas.Body>
          </Offcanvas>
        </Col>
        <Col xs={12} sm={7} xxl={7} className="mdContent">
          <Container>
            <div className="topRow">
              <Col xs={11}>
                <h1>{frontmatter.title}</h1>
              </Col>
              <Col xs={1} className="gitIcon">
                <a
                  href={`${process.env.gitHubPath}swan-lake/why-ballerina/${slug}.md`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Image
                    src={`${prefix}/images/github.svg`}
                    height={20}
                    width={20}
                    alt="Edit in github"
                  />
                </a>
              </Col>
            </div>

            <p className="intro">{frontmatter.intro}</p>

            <ReactMarkdown
              components={{
                h2({ node, inline, className, children, ...props }) {
                  let id = "";
                  setShowToc(true);
                  if (children.length === 1) {
                    id = children[0].toLowerCase().replace(/ /g, "-");
                  } else {
                    id = scanArray(children);
                  }
                  return <h2 id={id}>{children}</h2>;
                },
                h3({ node, inline, className, children, ...props }) {
                  let id = "";
                  setShowToc(true);
                  if (children.length === 1) {
                    id = children[0].toLowerCase().replace(/ /g, "-");
                  } else {
                    id = scanArray(children);
                  }
                  return <h3 id={id}>{children}</h3>;
                },
                h4({ node, inline, className, children, ...props }) {
                  let id = "";
                  setShowToc(true);
                  if (children.length === 1) {
                    id = children[0].toLowerCase().replace(/ /g, "-");
                  } else {
                    id = scanArray(children);
                  }
                  return <h4 id={id}>{children}</h4>;
                },
                h5({ node, inline, className, children, ...props }) {
                  let id = "";
                  setShowToc(true);
                  if (children.length === 1) {
                    id = children[0].toLowerCase().replace(/ /g, "-");
                  } else {
                    id = scanArray(children);
                  }
                  return <h5 id={id}>{children}</h5>;
                },
                h6({ node, inline, className, children, ...props }) {
                  let id = "";
                  setShowToc(true);
                  if (children.length === 1) {
                    id = children[0].toLowerCase().replace(/ /g, "-");
                  } else {
                    id = scanArray(children);
                  }
                  return <h6 id={id}>{children}</h6>;
                },
                code({ node, inline, className, children, ...props }) {
                  const match = /language-(\w+)/.exec(className || "");
                  return inline ? (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  ) : match ? (
                    <div
                      dangerouslySetInnerHTML={{
                        __html: HighlightSyntax(
                          String(children).replace(/\n$/, ""),
                          match[1].toLowerCase()
                        ),
                      }}
                    />
                  ) : (
                    <pre className="default">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  );
                },
              }}
              remarkPlugins={[remarkGfm]}
              rehypePlugins={[rehypeRaw]}
            >
              {content}
            </ReactMarkdown>
          </Container>
        </Col>
        <Col sm={2} className="pageToc d-none d-sm-block">
          {showToc ? (
            <>
              <h6>On this page</h6>
              <Toc source={content} />
            </>
          ) : null}
        </Col>
      </Layout>
    </>
  );
}
