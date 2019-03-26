module.exports = {
    lintOnSave: false,
    devServer: {
        proxy: {
<<<<<<< HEAD
            '/socket.io': {
                target: 'http://localhost:8080',
=======
            '/VueNativeSock': {
                target: 'http://192.168.43.17:9002',
>>>>>>> fusion
                ws: true,
                changeOrigin: true,
            },
        },
    },
};