const fs = require('fs');
const axios = require('axios');
const express = require('express');
const multer = require('multer');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Provide your username and license code
const licenseCode = '7A8E3419-481C-4535-8655-00F7B4DAD65B';
const userName = 'kapalikkhanal';

// Specify OCR settings
const requestUrl = 'http://www.ocrwebservice.com/restservices/processDocument?gettext=true';

async function performOCR(imageBuffer) {
    try {
        const response = await axios.post(requestUrl, imageBuffer, {
            auth: {
                username: userName,
                password: licenseCode,
            },
            headers: {
                'Content-Type': 'application/octet-stream',
            },
        });

        if (response.status === 401) {
            // Unauthorized request
            console.log('Unauthorized request');
            return { success: false, error: 'Unauthorized request' };
        }

        const data = response.data;

        // Decode Output response
        const ocrError = data.ErrorMessage;

        if (ocrError !== '') {
            // Error occurs during recognition
            console.log('Recognition Error: ' + ocrError);
            return { success: false, error: 'Recognition Error: ' + ocrError };
        }

        // Task description
        console.log('Task Description: ' + data.TaskDescription);

        // Available pages
        console.log('Available Pages: ' + data.AvailablePages);

        // Processed pages
        console.log('Processed Pages: ' + data.ProcessedPages);

        // Extracted text from the first or single page
        console.log('Extracted Text: ' + data.OCRText[0][0]);

        // Get extracted text from the First zone for each page
        console.log('Zone 1 Page 1 Text: ' + data.OCRText[0][0]);
        console.log('Zone 1 Page 2 Text: ' + data.OCRText[0][1]);

        return {
            success: true,
            message: 'OCR performed successfully',
            ocrText: data.OCRText[0][0], // Adjust this line based on your requirements
        };
    } catch (error) {
        console.error('Error during OCR:', error.message);
        return { success: false, error: 'Error during OCR: ' + error.message };
    }
}


app.get('/', (req, res) => {
    res.status(200).json('Server working fine.');
});

app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        console.log('File received:', req.file);
        const imageBuffer = req.file.buffer;

        // Execute OCR on the image buffer
        const ocrResult = await performOCR(imageBuffer);

        res.status(200).json(ocrResult);
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});


app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
