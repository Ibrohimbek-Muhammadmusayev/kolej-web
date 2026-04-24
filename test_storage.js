const { getStorageStats } = require('./controllers/storageController');

const req = {};
const res = {
  json: (data) => console.log('JSON:', data),
  status: (code) => ({
    json: (data) => console.log('STATUS:', code, 'JSON:', data)
  })
};

getStorageStats(req, res).catch(console.error);
