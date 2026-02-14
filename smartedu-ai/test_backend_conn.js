import http from 'http';

const options = {
    hostname: 'backend',
    port: 8000,
    path: '/health',
    method: 'GET'
};

const req = http.request(options, res => {
    print(`STATUS: ${res.statusCode}`);
    res.on('data', d => {
        process.stdout.write(d);
    });
});

req.on('error', error => {
    console.error('Error connecting to backend:', error);
});

req.end();
