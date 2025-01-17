const fs = require('fs');
const path = require('path');
import Error from 'next/error';
import Breadcrumb from '../components/Breadcrumb';
import { markdownClasses } from '../components/MarkdownClasses';
import { marked } from 'marked';

const index = ({ urlSegments, content, errorCode, type }) => {

    // set title from <h1> or first line with # in markdowns
    // include disqus maybe

    if (errorCode) {
        return <Error statusCode={errorCode} />
    }

    return <>
        {
            urlSegments.length === 0
                ?
                null
                :
                <Breadcrumb urlSegments={urlSegments} />
        }
        <div className={type + (type === 'markdown' ? markdownClasses : '')} dangerouslySetInnerHTML={{ __html: content }}></div>
    </>
}

export async function getServerSideProps({ params, res }) {
    //console.time('time');
    const urlSegments = params.path || [];
    const diskSegments = [process.cwd(), 'contents'].concat(urlSegments);
    var filePath = path.join.apply(null, [...diskSegments, 'index.html']);
    if (!fs.existsSync(filePath)) {
        filePath = path.join.apply(null, [...diskSegments, 'index.md']);
    }
    if (!fs.existsSync(filePath)) {
        filePath = path.join.apply(null, [...diskSegments]) + '.md';
    }
    if (!fs.existsSync(filePath)) {
        filePath = path.join.apply(null, [...diskSegments]) + '.html';
    }
    console.log(filePath);
    if (!fs.existsSync(filePath)) {
        res.statusCode = 404;
        const result = { props: { urlSegments: urlSegments, errorCode: 404 } }
        return result;
    }
    else {
        var type = 'html';
        try {
            var content = fs.readFileSync(filePath, 'utf8');
            if (filePath.endsWith('.md')) {
                type = 'markdown';
            }
            if (content.charCodeAt(0) == 65279) {
                content = content.slice(1);
            }
            content = content.replace('markdownClasses', markdownClasses);
            content = marked.parse(content);
            const result = { props: { urlSegments: urlSegments, content: content, type } };
            //console.timeEnd('time');
            return result;
        } catch (e) {
            console.log(e);
            res.statusCode = 500;
            const result = { props: { urlSegments: urlSegments, errorCode: 500 } }
            return result;
        }
    }
}

export default index;

// algabra => 