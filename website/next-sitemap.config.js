/* eslint-disable prettier/prettier */
// TODO: fix the auto-linter it's just not working correctly for me for some reason
/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://applicantatlas.com',
    sitemapSize: 7000,
    exclude: ['/user/*'],
    generateRobotsTxt: true,
    robotsTxtOptions: {
        policies: [
            { userAgent: '*', allow: '/' },
            // Disallow all user pages, right now just settings and dashboard. If we add more user pages, we should update this
            { userAgent: '*', disallow: '/user/*' },
            // Disallow all form pages
            { userAgent: '*', disallow: '/*/form/*' }
        ]
    }
}