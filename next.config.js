module.exports = {
    async redirects() {
        return [
            {
                source: '/',
                destination: '/slo/alerts/errors',
                permanent: true,
            },
        ]
    },
}
