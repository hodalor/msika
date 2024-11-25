const fs = require('fs');
const https = require('https');
const path = require('path');

const images = {
  categories: {
    'supermarket.png': 'https://gh.jumia.is/cms/2024/W02/CP/Categories/Supermarket.png',
    'fashion.png': 'https://gh.jumia.is/cms/2024/W02/CP/Categories/Fashion.png',
    'electronics.png': 'https://gh.jumia.is/cms/2024/W02/CP/Categories/Computing.png',
    'home-office.png': 'https://gh.jumia.is/cms/2024/W02/CP/Categories/Home-Office.png',
    'health-beauty.png': 'https://gh.jumia.is/cms/2024/W02/CP/Categories/Health-Beauty.png',
    'phones.png': 'https://gh.jumia.is/cms/2024/W02/CP/Categories/Phones.png'
  },
  products: {
    'samsung-a24.jpg': 'https://gh.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/82/8756001/1.jpg',
    'nasco-tv.jpg': 'https://gh.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/56/558176/1.jpg',
    'binatone-blender.jpg': 'https://gh.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/97/380176/1.jpg',
    'nike-shoes.jpg': 'https://gh.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/31/6775001/1.jpg',
    'oraimo-pods.jpg': 'https://gh.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/31/6775001/1.jpg',
    'tecno-spark.jpg': 'https://gh.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/82/8756001/1.jpg',
    'nexus-fan.jpg': 'https://gh.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/97/380176/1.jpg',
    'polystar-tv.jpg': 'https://gh.jumia.is/unsafe/fit-in/300x300/filters:fill(white)/product/56/558176/1.jpg'
  },
  banners: {
    'main-banner.jpg': 'https://gh.jumia.is/cms/2024/W02/HP/Sliders/GH_W2_HP_S1_Clearance.jpg',
    'banner1.jpg': 'https://gh.jumia.is/cms/2024/W02/HP/Sliders/GH_W2_HP_S2_Phones.jpg',
    'banner2.jpg': 'https://gh.jumia.is/cms/2024/W02/HP/Sliders/GH_W2_HP_S3_Computing.jpg'
  }
};

function downloadImage(url, filepath) {
  return new Promise((resolve, reject) => {
    https.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}: ${response.statusCode}`));
        return;
      }

      const fileStream = fs.createWriteStream(filepath);
      response.pipe(fileStream);

      fileStream.on('finish', () => {
        fileStream.close();
        console.log(`Downloaded: ${filepath}`);
        resolve();
      });

      fileStream.on('error', (err) => {
        fs.unlink(filepath, () => reject(err));
      });
    }).on('error', reject);
  });
}

async function downloadAllImages() {
  // Create directories if they don't exist
  const directories = ['categories', 'products', 'banners'];
  directories.forEach(dir => {
    const dirPath = path.join('public', 'images', dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
  });

  // Download all images
  for (const [category, categoryImages] of Object.entries(images)) {
    for (const [filename, url] of Object.entries(categoryImages)) {
      const filepath = path.join('public', 'images', category, filename);
      try {
        await downloadImage(url, filepath);
      } catch (error) {
        console.error(`Error downloading ${filename}:`, error.message);
      }
    }
  }
}

// Run the download
downloadAllImages().then(() => {
  console.log('All images downloaded successfully!');
}).catch(error => {
  console.error('Error downloading images:', error);
}); 