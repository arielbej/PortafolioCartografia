import folium
import rasterio
import numpy as np
import matplotlib.pyplot as plt
from matplotlib import cm
from rasterio.enums import Resampling
import os

# --- CONFIGURACIÓN ---
tif_landsat = "MarcVilagrosaCaturla.tif" 
tif_sentinel = "Sentinel.tif"  # Cambia por tu archivo real
output_html = "practica10_interactiva.html"
titulo_mapa = "Practica 10 - Mapas Interactivos con Folium"

def procesar_tif_a_png(input_file, output_png_name, factor_reduccion=2):
    if not os.path.exists(input_file):
        print(f"Error: No se encuentra {input_file}")
        return None, None

    with rasterio.open(input_file) as src:
        data = src.read(1, out_shape=(src.count, int(src.height/factor_reduccion), int(src.width/factor_reduccion)), resampling=Resampling.bilinear)
        transform = src.transform * src.transform.scale((src.width / data.shape[1]), (src.height / data.shape[0]))
        bounds = rasterio.transform.array_bounds(data.shape[0], data.shape[1], transform)
        # Leaflet usa [[lat_min, lon_min], [lat_max, lon_max]]
        folium_bounds = [[bounds[1], bounds[0]], [bounds[3], bounds[2]]]

        if src.nodata is not None:
            data = np.ma.masked_equal(data, src.nodata)
        data = np.ma.masked_invalid(data)

        norm = plt.Normalize(vmin=-0.5, vmax=0.5) 
        image_colored = cm.Blues(norm(data))
        image_colored[..., 3] = np.where(data.mask, 0, 0.8)
        plt.imsave(output_png_name, image_colored)
        
        return folium_bounds, output_png_name

def generar_mapa():
    bounds_l, png_l = procesar_tif_a_png(tif_landsat, "overlay_landsat.png")
    bounds_s, png_s = procesar_tif_a_png(tif_sentinel, "overlay_sentinel.png")

    if not bounds_l or not bounds_s: return

    # Crear mapa
    m = folium.Map(location=[bounds_l[0][0], bounds_l[0][1]], zoom_start=11, tiles='CartoDB positron')

    # Añadir capas
    folium.raster_layers.ImageOverlay(image=png_l, bounds=bounds_l, name="Landsat", opacity=0.7).add_to(m)
    folium.raster_layers.ImageOverlay(image=png_s, bounds=bounds_s, name="Sentinel-2", opacity=0.7).add_to(m)

    # --- INYECCIÓN DE BOTONES DE NAVEGACIÓN ---
    # Usamos JS para decirle al mapa: "Ajusta la vista a estos límites"
    botones_html = f'''
    <div style="position: fixed; 
                top: 100px; left: 10px; width: 160px; height: auto; 
                z-index:9999; background-color: white;
                padding: 10px; border: 2px solid #3388ff; border-radius: 8px;
                font-family: sans-serif; box-shadow: 2px 2px 5px rgba(0,0,0,0.2);">
        <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: bold; color: #333;">IR A MODELO:</p>
        <button onclick="{m.get_name()}.fitBounds({bounds_l})" 
                style="width: 100%; margin-bottom: 5px; cursor: pointer; background: #e7f0ff; border: 1px solid #3388ff; border-radius: 4px;">
            🛰️ Landsat
        </button>
        <button onclick="{m.get_name()}.fitBounds({bounds_s})" 
                style="width: 100%; cursor: pointer; background: #e7f0ff; border: 1px solid #3388ff; border-radius: 4px;">
            🛰️ Sentinel-2
        </button>
    </div>
    '''
    m.get_root().html.add_child(folium.Element(botones_html))

    folium.LayerControl(collapsed=False).add_to(m)
    m.save(output_html)
    print(f"Mapa generado con botones en: {output_html}")

if __name__ == "__main__":
    generar_mapa()