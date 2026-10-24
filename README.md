# Portafolio · Jerson Giraldo

Estudio Administración de Empresas, así que mi portafolio es, literalmente, un portafolio.

**Ver en vivo:** https://jersonflo.github.io

Una persona de traje camina entre la niebla, presenta un maletín y lo abre. Cada objeto de adentro es una sección: las carpetas son los proyectos, la tarjeta es "Sobre mí", la hoja de vida es la experiencia y el sobre es el contacto.

## Cómo está hecho

- **Three.js** para la escena: el maletín, los objetos y las texturas se generan por código.
- **Personaje de Mixamo** con animaciones reales (caminar con maletín, estar de pie), unido en un solo `persona.glb` con Blender (`tools/build_persona.py`).
- **Cinemática inversa** propia sobre los huesos de los brazos, para que las manos tomen el asa, sostengan el maletín y abran la tapa.
- **GSAP** para las animaciones de cámara, la interfaz y los expedientes.
- **Web Audio API** para los sonidos del maletín.

## Probarlo en local

```bash
python tools/serve.py 5510
```

y abrir http://localhost:5510
