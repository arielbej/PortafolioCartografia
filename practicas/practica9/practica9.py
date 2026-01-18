import folium
import rasterio
import numpy as np
from matplotlib import cm

# 1. Creamos el mapa base
mapa_p9 = folium.Map(location=[39.4, -0.4], zoom_start=9, tiles='OpenStreetMap')

# Función auxiliar para añadir cada TIF como una capa
def agregar_capa(archivo_tif, nombre_capa, color_map):
    try:
        with rasterio.open(archivo_tif) as ds:
            bounds = ds.bounds
            data = ds.read(1)
            
            # Limpiamos valores raros (Infinitos o Nulos)
            data = np.where(np.isinf(data), np.nan, data)
            
            # Definimos los límites para Folium
            imagen_bounds = [[bounds.bottom, bounds.left], [bounds.top, bounds.right]]
            
            # Añadimos la capa
            folium.raster_layers.ImageOverlay(
                image=data,
                name=nombre_capa,
                bounds=imagen_bounds,
                opacity=0.7,
                colormap=color_map, # Usamos la paleta de colores que le pasemos
                origin='upper'
            ).add_to(mapa_p9)
            
            # Centramos el mapa en la primera imagen que carguemos
            if nombre_capa == "Indice SAVI":
                mapa_p9.fit_bounds(imagen_bounds)
                
            print(f"Capa {nombre_capa} añadida correctamente.")
            
    except Exception as e:
        print(f"Error al cargar {archivo_tif}: {e}")

# 2. Añadimos las dos capas
# Usamos 'RdYlGn' (Red-Yellow-Green) porque es lo típico para vegetación:
# Rojo = Poca vegetación, Verde = Mucha vegetación
agregar_capa("SAVI_Post.tif", "Indice SAVI", cm.RdYlGn)
agregar_capa("EVI_post.tif", "Indice EVI", cm.RdYlGn)

# 3. Añadimos el control para activar/desactivar capas
folium.LayerControl().add_to(mapa_p9)

# 4. Guardamos el resultado
mapa_p9.save("index.html")
print("¡Hecho! Archivo index.html creado en la carpeta.")