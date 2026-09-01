const fs = require('fs');
const path = require('path');

const folder = __dirname;

async function testImages() {
  const files = fs.readdirSync(folder)
    .filter(file =>
      /\.(jpg|jpeg|png|webp)$/i.test(file)
    );

  console.log(`Found ${files.length} images\n`);

  for (const file of files) {

    const filePath = path.join(folder, file);

    try {
      const blob = new Blob([
        fs.readFileSync(filePath)
      ]);

      const formData = new FormData();

      formData.append(
        'image',
        blob,
        file
      );

      const response = await fetch(
        'http://localhost:5000/api/analyze',
        {
          method: 'POST',
          body: formData
        }
      );

      const data = await response.json();

      console.log('-----------------------------------');
      console.log('File:', file);
      console.log('Prediction:', data.disease);
      console.log(
        'Confidence:',
        data.confidence_percent + '%'
      );

    } catch (error) {

      console.error(
        'Error processing:',
        file
      );

      console.error(error.message);
    }
  }

  console.log('\nTesting completed.');
}

testImages();