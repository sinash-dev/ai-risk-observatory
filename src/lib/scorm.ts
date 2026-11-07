/**
 * SCORM 1.2 package for one quiz: imsmanifest.xml at the root and one SCO (index.html).
 * Manifest structure follows the ADL SCORM 1.2 content packaging model.
 */
import type { Quiz } from '../data/quizzes';
import { SITE } from '../data/site';
import { order } from './quizStore';
import { BASE, url } from './util';
import { SCO_CSS, SCO_SCRIPT } from './scormRuntime';
import { zip } from './zip';

const xml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const html = xml;
/** absolute link back to the site, for "read more" */
const abs = (to: string) => SITE.url + url(to).slice(BASE.length);

/** quiz data as the SCO sees it: options already in the order the site shows them */
export function scoData(quiz: Quiz) {
  return {
    id: quiz.id,
    title: quiz.title,
    questions: quiz.questions.map((q) => {
      const perm = order(quiz.id + q.q);
      return { q: q.q, options: perm.map((k) => q.options[k]), answer: perm.indexOf(q.answer), explain: q.explain, link: abs(q.link) };
    }),
  };
}

export function manifest(quiz: Quiz) {
  const id = `are-quiz-${quiz.id}`;
  return `<?xml version="1.0" encoding="UTF-8"?>
<manifest identifier="MANIFEST-${id}" version="1.0"
  xmlns="http://www.imsproject.org/xsd/imscp_rootv1p1p2"
  xmlns:adlcp="http://www.adlnet.org/xsd/adlcp_rootv1p2"
  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
  xsi:schemaLocation="http://www.imsproject.org/xsd/imscp_rootv1p1p2 imscp_rootv1p1p2.xsd http://www.imsglobal.org/xsd/imsmd_rootv1p2p1 imsmd_rootv1p2p1.xsd http://www.adlnet.org/xsd/adlcp_rootv1p2 adlcp_rootv1p2.xsd">
  <metadata>
    <schema>ADL SCORM</schema>
    <schemaversion>1.2</schemaversion>
  </metadata>
  <organizations default="ORG-${id}">
    <organization identifier="ORG-${id}">
      <title>${xml(`Quiz: ${quiz.title} (AI Risk Explorer)`)}</title>
      <item identifier="ITEM-${id}" identifierref="RES-${id}" isvisible="true">
        <title>${xml(`Quiz: ${quiz.title}`)}</title>
        <adlcp:masteryscore>80</adlcp:masteryscore>
      </item>
    </organization>
  </organizations>
  <resources>
    <resource identifier="RES-${id}" type="webcontent" adlcp:scormtype="sco" href="index.html">
      <file href="index.html"/>
    </resource>
  </resources>
</manifest>
`;
}

export function scoHtml(quiz: Quiz) {
  // "</" is escaped so quiz text can never close the script tag
  const data = JSON.stringify(scoData(quiz)).replace(/</g, '\\u003c');
  return `<!doctype html>
<html lang="en-GB">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${html(`Quiz: ${quiz.title}`)}</title>
<style>${SCO_CSS}</style>
</head>
<body>
<main id="app"><noscript>This quiz needs JavaScript.</noscript></main>
<footer><p>From AI Risk Explorer (${html(SITE.url)}), CC BY 4.0. A learning aid, not legal advice.</p></footer>
<script>window.QUIZ = ${data};</script>
<script>${SCO_SCRIPT}</script>
</body>
</html>
`;
}

export function scormFiles(quiz: Quiz) {
  return [{ path: 'imsmanifest.xml', content: manifest(quiz) }, { path: 'index.html', content: scoHtml(quiz) }];
}

export function scormZip(quiz: Quiz, when = new Date()) {
  return zip(scormFiles(quiz), when);
}
