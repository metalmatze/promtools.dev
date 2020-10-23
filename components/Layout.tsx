import React from "react";
import Head from "next/head";
import Link from "next/link";

const Layout = ({children, title = 'PromTools'}) => {
    return (
        <>
            <Head>
                <title>{title}</title>
                <link rel="stylesheet" href=""/>
                <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.1/css/bulma.min.css"/>
            </Head>

            <nav className="navbar is-promtools" role="navigation" aria-label="main navigation">
                <div className="container">
                    <div className="navbar-brand">
                        <Link href="/"><a className="navbar-item">PromTools</a></Link>
                    </div>
                    <div className="navbar-menu">
                        <div className="navbar-start">
                            <Link href="/slo/alerts/errors"><a className="navbar-item">SLO Errors</a></Link>
                            <Link href="/slo/alerts/latencies"><a className="navbar-item">SLO Latencies</a></Link>
                            <Link href="/slo/calculator"><a className="navbar-item">SLO Calculator</a></Link>
                        </div>
                    </div>
                </div>
            </nav>

            {children}

            <footer className="footer mt-6">
                <div className="content has-text-centered">
                    <p>
                        This project is based on the <a
                        href="https://github.com/metalmatze/slo-libsonnet">SLO-libsonnet</a> project to generate
                        the YAML with jsonnet.<br/>
                        The Web UI is built with <a href="https://nextjs.org/">NextJS</a> and <a
                        href="https://golang.org">Go</a> and the <a href="https://github.com/metalmatze/promtools.dev">source
                        is on GitHub</a> too.
                    </p>
                    <p>
                        Built by <a href="https://twitter.com/metalmatze">MetalMatze</a>.<br/>
                        Feel free to reach out for feedback or questions.
                    </p>
                </div>
            </footer>
            <style jsx global>{`
                .navbar.is-promtools {
                    background-color: #e6522c;
                }
                .navbar.is-promtools .navbar-item {
                    color: white;
                }
                .button.is-promtools {
                    background-color: #e6522c;
                    color: white;
                }
            `}</style>
        </>
    )
}

export default Layout
