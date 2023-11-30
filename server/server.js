const express = require('express');
const multer = require('multer');
const fs = require('fs');
require('dotenv').config();
const cors = require('cors');
const Tesseract = require('tesseract.js');
const Jimp = require('jimp');

const imagePath = 'images/image.png';
const enhancedImagePath = 'images/enhanced_image.png';

const app = express();
const port = process.env.PORT || 3001;

app.use(cors());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

const enhanceImageContrast = async (imageBuffer, outputPath) => {
    try {
        const image = await Jimp.read(imageBuffer);
        await image.contrast(0).write(outputPath);
    } catch (error) {
        console.error('Error enhancing image contrast:', error.message);
        throw error;
    }
};

const performOCR = async (imagePath) => {
    try {
        Tesseract.recognize(
            imagePath,
            'eng',
            {
                logger: (info) => console.log(info),
                config: {
                    tessedit_pageseg_mode: '6', // Assume a single uniform block of text
                    dpi: 3000, // Set DPI (adjust the value as needed)
                },
            }
        ).then(({ data: { text } }) => {
            console.log('Recognized Text: /n', text);
        });
    } catch (error) {
        console.error('Error performing OCR:', error.message);
    }
};

app.get('/', (req, res) => {
    res.status(200).json('Server working fine.');
});

const imagesFolder = './images';
if (!fs.existsSync(imagesFolder)) {
    fs.mkdirSync(imagesFolder);
}

app.post('/api/upload', upload.single('image'), async (req, res) => {
    try {
        console.log('File received:', req.file);
        fileBuffer = req.file.buffer;
        const fileName = `image_${Date.now()}.png`;
        const filePath = `${imagesFolder}/${fileName}`;

        fs.writeFileSync(filePath, fileBuffer);

        // await enhanceImageContrast(fileBuffer, enhancedImagePath);

        // Execute OCR on the enhanced image
        performOCR(imagePath);

        res.status(200).json({ success: true, message: 'File uploaded successfully', imagePath: filePath });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
    }
});

// performOCR('images/image_1701342167833.png');
// server\

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
