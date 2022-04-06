const axios = require('axios');
const fs = require('fs');
const path = require('path')

let searchAllTracks = async (name, callback) => {

    let band_name = name.toLowerCase();
    let url_itunes_service = `https://${process.env.HOST_API_ITUNES}/search`;

    let config = {
        method: 'get',
        url: `${url_itunes_service}?term=${band_name}`
    };

    axios(config)
        .then(response => {
            console.log('method searchAllTracks response', response);
            let canciones = 
                response.data.results
                    .filter(item => item.artistName.toLowerCase() === band_name)
                    .map(item => { 
                            return {
                                cancion_id: item.trackId,
                                nombre_album: item.collectionName,
                                nombre_tema: item.trackName,
                                preview_url: item.previewUrl,
                                fecha_lanzamiento: item.releaseDate.substring(0,10),
                                precio: {
                                    valor: item.trackPrice,
                                    moneda: item.currency
                                }
                            }
                        }
                    );
            callback({
                canciones,
                error: {}
            });
        })
        .catch(error => {
            console.log('Error in method searchAllTracks', error);
            callback({
                canciones: [],
                error
            });
        });

}

module.exports = {

    /**
     * Busca la información de la banda y retorna álbumes y canciones (los primeros 25 registros)
     * */ 
    searchTracks: async (req, res) => {

        console.log('searchTracks req', req);

        let name = req.params.name;
        
        searchAllTracks(name, response => {
            let canciones = response.canciones.slice(0, 25);
            let albumes =
                canciones.reduce((accum, currentItem) => {
                    if(accum.indexOf(currentItem.nombre_album) < 0){
                        accum.push(currentItem.nombre_album);
                    } 
                    return accum;
                }, []);
            let resObj = {
                total_albumes: albumes.length,
                total_canciones: canciones.length,
                albumes,
                canciones
            }
            res.send(resObj);
        });
        

    },

    saveFavorite: async(req, res) => {
        
        let nombre_banda = req.body.nombre_banda;
        let cancion_id = req.body.cancion_id;
        let usuario = req.body.usuario;
        let ranking = req.body.ranking;

        searchAllTracks(nombre_banda, response => {
            let canciones_id = response.canciones.filter(item => item.cancion_id === cancion_id);
            if(canciones_id.length > 0) {
                const filePath = path.resolve(__dirname, '..', 'files', 'favorites.json');
                console.log('filePath', filePath);
                fs.readFile(filePath, (error, data) => {
                    let dataJSON = JSON.parse(data);
                    dataJSON.favorites.push({ nombre_banda, cancion_id, usuario, ranking });
                    fs.writeFile(filePath, JSON.stringify(dataJSON), () => {
                        res.send({ resultado: "OK" });
                    });
                });
            } else {
                res.send({ resultado: "NOK" });
            }
        });

    }

};