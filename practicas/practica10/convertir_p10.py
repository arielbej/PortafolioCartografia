import folium
import rasterio
import numpy as np
import matplotlib.pyplot as plt
from matplotlib import cm
from rasterio.enums import Resampling

# --- CONFIGURACIÓN ---
input_tif = "MarcVilagrosaCaturla (2).tif" # Asegúrate que el nombre coincida exactamente
output_html = "practica10.html"
titulo_mapa = "Práctica 10: Índice NDWI (Google Earth Engine)"

def generar_mapa_ndwi(input_file, output_file):
    print(f"Procesando {input_file}...")

    with rasterio.open(input_file) as src:
        # 1. Optimización: Leer con 'decimation' para reducir resolución si es muy grande
        # Factor de reducción (1 = tamaño original, 2 = mitad, 4 = cuarto...)
        # Si el TIF pesa más de 10MB, sube esto a 2 o 4.
        factor_reduccion = 2 
        
        data = src.read(
            1,
            out_shape=(
                src.count,
                int(src.height / factor_reduccion),
                int(src.width / factor_reduccion)
            ),
            resampling=Resampling.bilinear
        )
        
        # Actualizar la transformación (georeferencia) para la nueva resolución
        transform = src.transform * src.transform.scale(
            (src.width / data.shape[1]),
            (src.height / data.shape[0])
        )
        
        # Obtener los límites geográficos (bounds)
        bounds = rasterio.transform.array_bounds(data.shape[0], data.shape[1], transform)
        min_lon, min_lat, max_lon, max_lat = bounds

        # 2. Manejo de datos (NDWI suele ir de -1 a 1, o valores cercanos)
        # Enmascarar valores 'NoData' o nulos
        if src.nodata is not None:
            data = np.ma.masked_equal(data, src.nodata)
        
        # A veces GEE devuelve nans, los enmascaramos
        data = np.ma.masked_invalid(data)

        # 3. Normalización y Paleta de Color (Azules)
        # NDWI: Valores altos (positivos) son agua, bajos (negativos) tierra.
        # Ajustamos vmin y vmax para resaltar el agua.
        norm = plt.Normalize(vmin=-0.5, vmax=0.5) 
        cmap = cm.Blues  # Paleta azul solicitada
        
        # Convertir datos a imagen RGBA (coloreada)
        image_colored = cmap(norm(data))
        
        # Hacer transparentes los valores vacíos (donde estaba la máscara)
        image_colored[..., 3] = np.where(data.mask, 0, 0.8) # 0.8 es la opacidad general

        # Guardar imagen temporalmente para Folium
        plt.imsave('overlay_ndwi.png', image_colored, cmap=cmap)

    # 4. Crear el mapa base
    # Calculamos el centro
    center_lat = (min_lat + max_lat) / 2
    center_lon = (min_lon + max_lon) / 2

    m = folium.Map(
        location=[center_lat, center_lon],
        zoom_start=11,
        tiles='CartoDB positron', # Fondo limpio
        control_scale=True
    )

    # Añadir título
    title_html = f'''
        <h3 align="center" style="font-size:16px"><b>{titulo_mapa}</b></h3>
    '''
    m.get_root().html.add_child(folium.Element(title_html))

    # 5. Superponer la imagen
    folium.raster_layers.ImageOverlay(
        image='overlay_ndwi.png',
        bounds=[[min_lat, min_lon], [max_lat, max_lon]],
        opacity=0.7,
        name="NDWI (Agua)"
    ).add_to(m)

    # Añadir control de capas
    folium.LayerControl().add_to(m)

    # Guardar
    m.save(output_file)
    print(f"¡Mapa guardado como {output_file}!")
    print("Recuerda mover 'index.html' y 'overlay_ndwi.png' a tu carpeta 'practicas/p10_video/'")

if __name__ == "__main__":
    generar_mapa_ndwi(input_tif, output_html)