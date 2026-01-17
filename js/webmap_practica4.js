
        // Inicializa el mapa
        const map = L.map('map', {
            center: [41.5, -4],
            zoom: 7
        });

        // Capas base
        const baseLight = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CartoDB contributors',
            subdomains: 'abcd'
        });

        const baseDark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '&copy; CartoDB contributors',
            subdomains: 'abcd'
        });

        const baseSatellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: 'Tiles &copy; Esri'
        });

        baseLight.addTo(map);


        // Funciones para cambiar mapa base
        function changeBaseMap(style) {
            map.eachLayer(layer => {
                if (layer === baseLight || layer === baseDark || layer === baseSatellite) {
                    map.removeLayer(layer);
                }
            });

            if (style === 'light') baseLight.addTo(map);
            else if (style === 'dark') baseDark.addTo(map);
            else if (style === 'satellite') baseSatellite.addTo(map);
            
            toggleMenu();
        }

        function toggleMenu() {
            const menu = document.getElementById('basemapMenu');
            menu.style.display = menu.style.display === 'block' ? 'none' : 'block';
        }

        // CARGAR GEOJSON CON LÓGICA CORREGIDA
        fetch('../webmaps/ZONAS_VALIDAS.geojson')
            .then(response => {
                if (!response.ok) throw new Error('No se pudo cargar el archivo GeoJSON');
                return response.json();
            })
            .then(data => {
                console.log('GeoJSON cargado correctamente');

                const geojsonLayer = L.geoJSON(data, {
                    style: function(feature) {
                        // Detectamos el valor DN independientemente de si es mayúscula o minúscula
                        const props = feature.properties || {};
                        const dn = props.DN !== undefined ? props.DN : props.dn;

                        // Usamos == para comparar por si el valor viene como texto "3" o número 3
                        return {
                            fillColor: dn == 3 ? '#2ca25f' : 
                                       dn == 4 ? '#ffdd33' : 
                                       dn == 5 ? '#de2d26' : '#cccccc',
                            weight: 1,
                            color: 'black',
                            fillOpacity: 0.7
                        };
                    },
                    onEachFeature: function(feature, layer) {
                        const props = feature.properties || {};
                        const dn = props.DN !== undefined ? props.DN : props.dn;
                        
                        const categoria = dn == 3 ? 'ALTO' :
                                          dn == 4 ? 'MEDIO' :
                                          dn == 5 ? 'BAJO' : 'DESCONOCIDO';

                        let popupContent = `<div style="font-family: Arial;">`;
                        popupContent += `<strong>Categoría:</strong> ${categoria}<br>`;
                        popupContent += `<strong>Valor DN:</strong> ${dn || 'N/A'}<br>`;
                        
                        // Añadir área si existe
                        const area = props.Area_km || props.area || props.AREA;
                        if (area) {
                            popupContent += `<strong>Área:</strong> ${area} km²<br>`;
                        }

                        // Debug: Muestra todas las propiedades si el popup dice "Desconocido"
                        if (categoria === 'DESCONOCIDO') {
                            popupContent += `<hr><small>Campos detectados:<br>`;
                            for (let key in props) {
                                popupContent += `${key}: ${props[key]}<br>`;
                            }
                            popupContent += `</small>`;
                        }
                        
                        popupContent += `</div>`;
                        layer.bindPopup(popupContent);
                    }
                }).addTo(map);

                // Ajustar vista automáticamente a los datos
                if (geojsonLayer.getBounds().isValid()) {
                    map.fitBounds(geojsonLayer.getBounds());
                }
                
                document.getElementById('loading').style.display = 'none';
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('loading').innerHTML = 
                    'Error al cargar los datos.<br><small>' + error.message + '</small>';
            });

        // Pantalla completa
        document.getElementById('fullscreen-btn').addEventListener('click', () => {
            const mapContainer = document.getElementById('map');
            if (!document.fullscreenElement) {
                if (mapContainer.requestFullscreen) {
                    mapContainer.requestFullscreen();
                }
                document.getElementById('fullscreen-btn').innerHTML = '<i class="fas fa-compress"></i>';
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                }
                document.getElementById('fullscreen-btn').innerHTML = '<i class="fas fa-expand"></i>';
            }
        });