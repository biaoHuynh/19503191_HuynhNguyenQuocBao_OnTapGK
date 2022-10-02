const express = require('express');
const multer = require('multer')

const data = require('./store')
const app = express();
const upload = multer();

app.use(express.static('./templates'));
app.set('view engine', 'ejs');
app.set('views', './templates')

const { request, response } = require('express');

//config aws dynamodb
const AWS = require('aws-sdk');
const config = new AWS.Config({
    accessKeyId: 'AKIA3TU4PEA3EYUB756L',
    secretAccessKey: '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',
    region: 'us-west-1'
});

AWS.config = config;

const docClient = new AWS.DynamoDB.DocumentClient();

const tableName = 'BaiBao';

app.get('/', (request, response) => {
    const params = {
        TableName: tableName,
    };

    docClient.scan(params, (err, data) => {
        console.log(123, data);
        if (err) {
            response.send('Internal server Error');
        } else {
            return response.render('index', { baiBaos: data.Items });
        }
    });
})

app.post('/', upload.fields([]), (req, res) => {
    const { ID, ISBN, NamXuatBan, SoTrang, TenBaiBao, TenNhomTacGia } = req.body;

    const params = {
        TableName: tableName,
        Item: {
            'ID': ID,
            'ISBN': ISBN,
            'NamXuatBan': NamXuatBan,
            'SoTrang': SoTrang,
            'TenBaiBao': TenBaiBao,
            'TenNhomTacGia': TenNhomTacGia,

        }
    }
    docClient.put(params, (err, data) => {
        if (err) {
            return res.send('Server Error')
        } else {
            return res.redirect('/')
        }
    })
})



// app.get('/', (req, res) => {
//     return res.render('index', { data: data });
// });

// app.post('/', upload.fields([]), (req, res) => {
//     data.push(req.body)
//     return res.redirect('/')
// });

app.post('/deleteBaiBao', upload.fields([]), (req, res) => {
    const baiBao = req.body
    const duplicateIndex = data.findIndex(ele => ele.ID === baiBao.ID)
    data.splice(duplicateIndex, 1)
    const params = {
        TableName: tableName,
        Key: {
            ID: baiBao.ID,
        }
    }

    docClient.delete(params, (err, data) => {

        if (err) {
            return res.send('Server Error')
        }
        return res.redirect('/')
    })

})

app.listen(4000, () => {
    console.log('server is running on port 4000');
});