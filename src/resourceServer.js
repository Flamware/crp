const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = 8080;
const IMAGE_DIR = path.join(__dirname, 'data', 'pic');

// Enable static file serving
app.use('/pic', express.static(IMAGE_DIR));

// Generate an index page listing all images
app.get('/pic', (req, res) => {
    fs.readdir(IMAGE_DIR, (err, files) => {
        if (err) {
            return res.status(500).send("Error reading image directory.");
        }

        // Filter only image files (optional)
        const imageFiles = files.filter(file => /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(file));

        // Generate HTML response
        const html = `
            <html>
            <head>
                <title>Image Gallery</title>
                <style>
                    body { font-family: Arial, sans-serif; text-align: center; }
                    .gallery { display: flex; flex-wrap: wrap; justify-content: center; gap: 10px; margin-top: 20px; }
                    .gallery img { width: 200px; height: auto; border-radius: 8px; box-shadow: 2px 2px 5px rgba(0, 0, 0, 0.2); }
                </style>
            </head>
            <body>
                <h1>Available Images</h1>
                <div class="gallery">
                    ${imageFiles.map(file => `<a href="/pic/${file}" target="_blank"><img src="/pic/${file}" alt="${file}"></a>`).join('')}
                </div>
            </body>
            </html>
        `;

        res.send(html);
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
