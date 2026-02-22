import process from 'node:process';
import { defineConfig } from 'vitepress';
import { getPlausibleScripts } from './plausible';
import { githubIcon, linkedinIcon, xIcon } from './theme/icons';

const basePath = process.env.DOCS_BASE_PATH; // undefined for root /

const createAbsoluteUrl = (path: string) => `https://shh.tofi.pro/${path.replace(/(^\/$)/g, '')}`;

// https://vitepress.dev/reference/site-config
export default defineConfig({
    title: 'shh.io',
    description: 'Send private and secure notes',
    base: basePath,
    lang: 'en-US',
    lastUpdated: true,
    srcDir: './src',
    outDir: './dist',
    cleanUrls: true,

    markdown: {
        theme: {
            dark: 'github-dark',
            light: 'github-light',
        },
    },

    head: [
        ['meta', { name: 'author', content: 'geomena' }],
        ['meta', { name: 'keywords', content: 'shh.io, notes, secure, private, encrypted, self-hosted' }],
        ['link', { rel: 'icon', href: '/favicon.ico' }],
        ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
        ['link', { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon-32x32.png' }],
        ['link', { rel: 'icon', type: 'image/png', sizes: '16x16', href: '/favicon-16x16.png' }],

        ['meta', { name: 'theme-color', content: '#ffffff' }],

        ['meta', { name: 'og:title', content: 'shh.io documentation' }],
        ['meta', { name: 'og:description', content: 'Send private and secure notes' }],
        ['meta', { name: 'og:image', content: createAbsoluteUrl('og-image.png') }],
        ['meta', { name: 'og:url', content: 'https://shh.tofi.pro' }],
        ['meta', { name: 'og:type', content: 'website' }],
        ['meta', { name: 'og:site_name', content: 'shh.io' }],
        ['meta', { name: 'og:locale', content: 'en_US' }],

        ['meta', { name: 'twitter:card', content: 'summary' }],
        ['meta', { name: 'twitter:site', content: '@cthmsst' }],
        ['meta', { name: 'twitter:creator', content: '@cthmsst' }],
        ['meta', { name: 'twitter:title', content: 'shh.io documentation' }],
        ['meta', { name: 'twitter:description', content: 'Send private and secure notes' }],
        ['meta', { name: 'twitter:image', content: createAbsoluteUrl('og-image.png') }],

        ...getPlausibleScripts(),
    ],

    themeConfig: {

        logo: {
            light: '/icon-dark.png',
            dark: '/icon-light.png',
            alt: 'Logo',
        },

        siteTitle: 'shh.io Docs',

        // https://vitepress.dev/reference/default-theme-config
        nav: [
            { text: 'shh.io App', link: 'https://shh.tofi.pro' },
        ],

        sidebar: [
            {
                text: 'shh.io',
                items: [
                    { text: 'Introduction', link: '/' },
                    { text: 'How it works?', link: '/how-it-works' },
                    { text: 'Secret Sharing', link: '/secret-sharing' },
                ],
            },
            {
                text: 'Self hosting',
                items: [
                    { text: 'Using Docker', link: '/self-hosting/docker' },
                    { text: 'Using Docker Compose', link: '/self-hosting/docker-compose' },
                    { text: 'Deploy on other platforms', link: '/self-hosting/other-platforms' },
                    { text: 'Configuration', link: '/self-hosting/configuration' },
                    { text: 'Troubleshooting', link: '/self-hosting/troubleshooting' },
                ],
            },
            {
                text: 'Integrations',
                items: [
                    { text: 'CLI', link: '/integrations/cli' },
                    { text: 'NPM package', link: '/integrations/npm-package' },
                    { text: 'Versioning', link: '/integrations/versioning' },
                ],
            },
            {
                text: 'Resources',
                items: [
                    { text: 'Languages and i18n', link: '/resources/i18n' },
                    { text: 'Brand kit', link: '/resources/brand-kit' },
                ],
            },
        ],

        footer: {
            copyright: 'Copyright © 2024-present geomena',
        },

        editLink: {
            pattern: 'https://github.com/geo-mena/shh.io/edit/main/packages/docs/src/:path',
            text: 'Edit this page on GitHub',
        },

        socialLinks: [
            { icon: { svg: githubIcon }, link: 'https://github.com/geo-mena/shh.io', ariaLabel: 'GitHub' },
            { icon: { svg: linkedinIcon }, link: 'https://www.linkedin.com/in/geomena', ariaLabel: 'LinkedIn' },
        ],

        search: {
            provider: 'local',

            options: {
                detailedView: true,

                miniSearch: {
                    /**
                     * @type {Pick<import('minisearch').Options, 'extractField' | 'tokenize' | 'processTerm'>}
                     */
                    options: {
                    },
                    /**
                     * @type {import('minisearch').SearchOptions}
                     */
                    searchOptions: {
                        fuzzy: 0.3,
                        prefix: true,
                        boost: { title: 4, text: 2, titles: 1 },
                    },
                },
            },
        },
    },
});
