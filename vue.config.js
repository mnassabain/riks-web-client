module.exports = {
    lintOnSave: false,
    devServer: {
        proxy: {
            '/socket.io': {
                target: 'http://192.168.43.17:9002',
                ws: true,
                changeOrigin: true,
            },
        },
    },
};