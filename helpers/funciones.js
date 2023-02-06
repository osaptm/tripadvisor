const axios = require('axios');
async function checkURL(url) {
    await axios.get(url).then((response) => {
      return true;
    }).catch((error) => {
      return false;
    });
  }

  
    // Usar los proxys para evitar baneos en scrapear
    // await useProxy(page, newProxyUrl); --> Para usar proxy por pagina
    // await page.setRequestInterception(true);
    // page.on('request', async request => {
    //   await useProxy(request, newProxyUrl);
    // });


    // Esperar 5 segundos para revidar la pagina
    // await new Promise((resolve, reject) => {
    //   try {
    //     setTimeout(() => resolve(), 5000);
    //   } catch (error) {
    //     console.log('Error en tiempo de espera');
    //   }
    // })