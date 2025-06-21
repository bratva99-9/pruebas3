import React from 'react';
import { Helmet } from 'react-helmet';

const Page2 = () => {
    return (
        <>
            <Helmet>
                <title>Night Club Game - More Fun</title>
                <meta name="description" content="Discover more features and content in the Night Club Game." />
            </Helmet>
            <div>
                <h1>Page 2</h1>
                <p>This is page 2!</p>
            </div>
        </>
    );
};

export default Page2;