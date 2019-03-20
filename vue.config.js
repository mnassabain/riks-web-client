module.exports = {
    lintOnSave: false,
    devServer: {
        proxy: {
            '/VueNativeSock': {
                target: 'http://192.168.43.17:9002',
                ws: true,
                changeOrigin: true,
            },
        },
    },
};