
'use client';

import Giscus from '@giscus/react';

export default function GiscusComments() {
    return (
        <div className="mt-10">
            <Giscus
                id="comments"
                repo="jackyecho1029/potatoblog"
                repoId="R_kgDOQzPBRw"
                category="Announcements"
                categoryId="DIC_kwDOQzPBR84C0ipA"
                mapping="pathname"
                term="Welcome to PotatoEcho!"
                reactionsEnabled="1"
                emitMetadata="0"
                inputPosition="top"
                theme="light"
                lang="en"
                loading="lazy"
            />
        </div>
    );
}
