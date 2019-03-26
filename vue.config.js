module.exports = {
    lintOnSave: false,
    devServer: {
        proxy: {
            '/VueNativeSock': {
                target: 'http://localhost:9002',
                ws: true,
                changeOrigin: true,
            },
        },
    },
};