const { db_tripadvisor_x_ciudad } = require('./database/config');
const mongo = require('./models/tripadvisor_x_ciudad');
const { ObjectId } = require('mongoose').Types;

(async () => {

    try {
        // NUEVA CONEXION MONGO
        await db_tripadvisor_x_ciudad();
        // INSERTAMOS LAS CIUDADES AL PAIS CORRESPONDIENTE, IMPORTANTE ES EL ID_PAIS
         await mongo.Ciudad.create([
        {nombre: "Bahía Blanca"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312744-Activities-Bahia_Blanca_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Banfield"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g8838820-Activities-Banfield_Lomas_de_Zamora_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Bariloche"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312848-Activities-oa0-San_Carlos_de_Bariloche_Province_of_Rio_Negro_Patagonia.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Berazategui"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g2008835-Activities-Berazategui_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Bernal"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g12188399-Activities-Bernal_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Buenos Aires"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312741-Activities-oa0-Buenos_Aires_Capital_Federal_District.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Castelar"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g8827289-Activities-Castelar_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Comodoro Rivadavia"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312829-Activities-Comodoro_Rivadavia_Province_of_Chubut_Patagonia.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Concordia"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312798-Activities-Concordia_Province_of_Entre_Rios_Litoral.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Córdoba"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312768-Activities-oa0-Cordoba_Province_of_Cordoba_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Corrientes"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312794-Activities-Corrientes_Province_of_Corrientes_Litoral.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "El Calafate"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312851-Activities-oa0-El_Calafate_Province_of_Santa_Cruz_Patagonia.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Federacion"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g1135315-Activities-Federacion_Province_of_Entre_Rios_Litoral.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Florencio Varela"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g2008840-Activities-Florencio_Varela_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Formosa"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312802-Activities-Formosa_Province_of_Formosa_Litoral.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Godoy Cruz"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g2135826-Activities-oa0-Godoy_Cruz_Mendoza_Province_of_Mendoza_Cuyo.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "González Catan"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g5866136-Activities-Gonzalez_Catan_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Gregorio de Laferrere"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g18898232-Activities-Gregorio_de_Laferrere_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Guaymallén"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g12011632-Activities-Guaymallen_Province_of_Mendoza_Cuyo.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Isidro Casanova"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g2616990-Activities-Isidro_Casanova_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Ituzaingó"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g1961730-Activities-Ituzaingo_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "José C. Paz"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g2590200-Activities-Jose_C_Paz_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "La Plata"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312747-Activities-oa0-La_Plata_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "La Rioja"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312779-Activities-La_Rioja_Province_of_La_Rioja_Cuyo.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Lanús"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g2199826-Activities-Lanus_Capital_Federal_District.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Las Heras"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g3364428-Activities-oa0-Las_Heras_Province_of_Mendoza_Cuyo.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Libertad"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g2056257-Activities-Puerto_Libertad_Province_of_Misiones_Litoral.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Lomas de Zamora"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g1172344-Activities-Lomas_de_Zamora_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Mar del Plata"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312749-Activities-oa0-Mar_del_Plata_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Mendoza"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312781-Activities-oa0-Mendoza_Province_of_Mendoza_Cuyo.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Merlo"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312787-Activities-Merlo_Province_of_San_Luis_Cuyo.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Monte Grande"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g1436015-Activities-Monte_Grande_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Moreno"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g8341703-Activities-Moreno_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Neuquén"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312842-Activities-Neuquen_Province_of_Neuquen_Patagonia.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Paraná"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312800-Activities-Parana_Province_of_Entre_Rios_Litoral.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Pilar"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312754-Activities-Pilar_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Pinamar"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312755-Activities-Pinamar_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Posadas"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312805-Activities-oa0-Posadas_Province_of_Misiones_Litoral.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Puerto Madryn"	, url_tripadvisor:"https://www.tripadvisor.com.ar/Attractions-g312832-Activities-oa0-Puerto_Madryn_Province_of_Chubut_Patagonia.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Quilmes"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g815526-Activities-Quilmes_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Rafael Castillo"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g23204566-Activities-Rafael_Castillo_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Resistencia"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312792-Activities-Resistencia_Province_of_Chaco_Litoral.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Río Cuarto"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g1028492-Activities-Rio_Cuarto_Province_of_Cordoba_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Rosario"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312809-Activities-oa0-Rosario_Province_of_Santa_Fe_Litoral.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Salta"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312821-Activities-oa0-Province_of_Salta_Northern_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "San Fernando del Valle de Catamarca"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312813-Activities-San_Fernando_del_Valle_de_Catamarca_Province_of_Catamarca_Northern_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "San Juan"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312785-Activities-oa0-San_Juan_Province_of_San_Juan_Cuyo.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "San Justo"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g2616992-Activities-San_Justo_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "San Luis"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312788-Activities-San_Luis_Province_of_San_Luis_Cuyo.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "San Martin de los Andes"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312843-Activities-oa0-San_Martin_de_los_Andes_Province_of_Neuquen_Patagonia.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "San Miguel"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g8601089-Activities-San_Miguel_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "San Miguel de Tucumán"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312826-Activities-oa0-San_Miguel_de_Tucuman_Province_of_Tucuman_Northern_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "San Nicolás de los Arroyos"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312758-Activities-oa0-San_Nicolas_de_los_Arroyos_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "San Rafael"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312782-Activities-oa0-San_Rafael_Province_of_Mendoza_Cuyo.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "San Salvador de Jujuy"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g303178-Activities-oa0-San_Salvador_de_Jujuy_Province_of_Jujuy_Northern_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Santa Fe"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312810-Activities-Santa_Fe_Province_of_Santa_Fe_Litoral.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Santa Rosa"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312837-Activities-Santa_Rosa_Province_of_La_Pampa_Patagonia.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Santiago del Estero"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312819-Activities-Santiago_del_Estero_Province_of_Santiago_del_Estero_Northern_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Tandil"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312761-Activities-oa0-Tandil_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Temperley"	, url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g2399688-Activities-Temperley_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Trelew", url_tripadvisor:"https://www.tripadvisor.com.pe/Attractions-g312835-Activities-oa0-Trelew_Province_of_Chubut_Patagonia.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Ushuaia"	, url_tripadvisor:"https://www.tripadvisor.com.ar/Attractions-g312855-Activities-oa0-Ushuaia_Province_of_Tierra_del_Fuego_Patagonia.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Villa Carlos Paz"	, url_tripadvisor:"https://www.tripadvisor.com.ar/Attractions-g312774-Activities-oa0-Villa_Carlos_Paz_Province_of_Cordoba_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Villa General Belgrano"	, url_tripadvisor:"https://www.tripadvisor.com.ar/Attractions-g312776-Activities-oa0-Villa_General_Belgrano_Province_of_Cordoba_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
        {nombre: "Villa Gesell"	, url_tripadvisor:"https://www.tripadvisor.com.ar/Attractions-g312764-Activities-Villa_Gesell_Province_of_Buenos_Aires_Central_Argentina.html", id_pais:ObjectId('63deb7095e81d9a288bbb606') },
         ]);
         

        process.exit();
    } catch (error) {
        console.log("FINALIZAMOS TAREAS" + error);
        process.exit();
    }

})();