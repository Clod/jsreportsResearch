const axios = require('axios')
const path = require('path')
const admin = require("firebase-admin");

// curl https://api.zendrive.com/v3/drivers?apikey=Mf8ZOERWLnwUuRLKLw4fnUhOsJChMbW9



async function beforeRender(req, res) {
    console.log("***********   En beforeRender **********************")

    var next_offset = 0

    var drivers = ''

    // req.data.zenResp.drivers = ''

    // Me traigo de Zendrive el listado de drivers.

    do {

        // Leo de Zendrive
        var url = 'https://api.zendrive.com/v3/drivers?apikey=Mf8ZOERWLnwUuRLKLw4fnUhOsJChMbW9&start_date=2019-09-01&end_date=2020-03-23&offset=' + next_offset

        console.log(url)

        // Leo de Zendrive
        var r = await axios.get(url)

        //var r = await axios.get('https://api.zendrive.com/v3/drivers?apikey=Mf8ZOERWLnwUuRLKLw4fnUhOsJChMbW9&start_date=2019-09-01&end_date=2020-03-23&offset=0')
        // req.data = { ...req.data, ...r.data}

        req.data.zenResp = r.data

        //drivers = r.data.drivers

        console.log("drivers= " + drivers)

        if (drivers == '') {
            console.log("Primera lectura: " + r.data.drivers[1].driver_id)
            // Transfiero lo leído a un array local
            drivers = r.data.drivers
            console.log("TIPO de dato: " + typeof r.data.drivers);
        } else {
            console.log("CONCATENANDO " + r.data.drivers[1].driver_id)
            // Concateno los nuevos drivers que traje de Zendrive a los ya leídos.
            Array.prototype.push.apply(drivers, r.data.drivers);
        }

        console.log("drivers [1]= " + drivers[1].driver_id)

        console.log("PARCIAL: " + req.data.zenResp)

        next_offset = r.data.next_offset

        console.log("NEXT OFFSET = " + r.data.next_offset)

    }
    while (next_offset > 0) // Voy a buscar la página siguiente si la hay (next_offset > 0)

    // logueo por consola lo leído de Zendrive
    console.log("TOTAL: " + JSON.stringify(drivers))

    // Ahora voy a intentar traer desde Firebase el nombre y apellido de cada uno

    // Inicializo la conexión a Firestore si es necesario
    if (admin.apps.length === 0) {

        console.log("Inicializando base");

        console.log("Directorio APP" + __appDirectory);

        // https://jsreport.net/blog/using-local-scripts-and-other-resources
        var key = path.join(__appDirectory, 'serviceAccountKey.json')

        // Cargo el archivo de clave
        // let serviceAccount = require("./serviceAccountKey.json");
        let serviceAccount = require(key);


        admin.initializeApp({
            credential: admin.credential.cert(serviceAccount)
        });

    }

    db = admin.firestore();

    ///////////////////////////////////////////////////////////////////////

    console.log("Buscando datos de uno: " + drivers[8].driver_id);

    let driverRef = db.collection('boards').doc(drivers[8].driver_id);

    console.log("driverRef: " + JSON.stringify(driverRef));

    let getDoc = await driverRef.get()
        .then(doc => {
            console.log('En el then');
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                console.log('Document data:', doc.data().ConductorID + "  " + doc.data().Nombre + "  " + doc.data().Apellido);
                tmp = doc.data().ConductorID;
            }
        })
        .catch(err => {
            console.log('Error getting document', err);
        });

    ///////////////////////////////////////////////////////////////////////


    for (i = 0; i < drivers.length; i++) {

        console.log("Buscando datos: " + drivers[i].driver_id);

        let driverRef = db.collection('boards').doc(drivers[i].driver_id);

        // console.log("driverRef: " + JSON.stringify(driverRef));

        let getDoc = await driverRef.get()
            .then(doc => {
                console.log('En el then');
                if (!doc.exists) {
                    console.log('No such document!');
                    drivers[i].info.attributes.last_name = 'Cadorna';
                    drivers[i].info.attributes.first_name = 'Luigi';
                } else {
                    console.log('Document data:', doc.data().ConductorID + "  " + doc.data().Nombre + "  " + doc.data().Apellido);
                    drivers[i].info.attributes.last_name = doc.data().Apellido;
                    drivers[i].info.attributes.first_name = doc.data().Nombre;
                    //tmp = doc.data().ConductorID;
                }
            })
            .catch(err => {
                console.log('Error getting document', err);
            });

    };

    req.data.drivers = drivers

    req.data.unDriver = ' algo'
    //req.data.check = tmp

    console.log("Llegué al final")

    // console.log(tmp)

}