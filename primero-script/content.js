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

        var url = 'https://api.zendrive.com/v3/drivers?apikey=Mf8ZOERWLnwUuRLKLw4fnUhOsJChMbW9&start_date=2019-09-01&end_date=2020-03-23&offset=' + next_offset

        console.log(url)

        var r = await axios.get(url)

        //var r = await axios.get('https://api.zendrive.com/v3/drivers?apikey=Mf8ZOERWLnwUuRLKLw4fnUhOsJChMbW9&start_date=2019-09-01&end_date=2020-03-23&offset=0')
        // req.data = { ...req.data, ...r.data}



        req.data.zenResp = r.data

        //drivers = r.data.drivers

        console.log("drivers= " + drivers)

        if (drivers == '') {
            console.log("ARRIBA " + r.data.drivers[1].driver_id)
            drivers = r.data.drivers
            console.log("TIPO de dato: " + typeof r.data.drivers);
        } else {
            console.log("CONCATENANDO " + r.data.drivers[1].driver_id)
            // drivers.concat(r.data.drivers)
            Array.prototype.push.apply(drivers, r.data.drivers);
        }

        console.log("drivers [1]= " + drivers[1].driver_id)

        console.log("PARCIAL: " + req.data.zenResp)

        next_offset = r.data.next_offset

        console.log("NEXT OFFSET = " + r.data.next_offset)

    }
    while (next_offset)

    console.log("TOTAL: " + JSON.stringify(drivers))

    req.data.drivers = drivers

    // Ahora voy a intentar traer desde Firebase el nombre y apellido de cada uno

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

    let driverRef = db.collection('boards').doc('ARTTTAAAFABA');

    let tmp = ""

    let getDoc = await driverRef.get()
        .then(doc => {
            if (!doc.exists) {
                console.log('No such document!');
            } else {
                console.log('Document data:', doc.data().ConductorID);
                tmp = doc.data().ConductorID;
            }
        })
        .catch(err => {
            console.log('Error getting document', err);
        });

    req.data.unDriver = ' algo'
    req.data.check = tmp

    console.log("Llegué al final")

    console.log(tmp)

}