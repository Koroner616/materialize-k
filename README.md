<p align="center">
    <img src="https://materializeweb.com/images/materialize.svg" width="200"/>
</p>

<h3 align="center">Materialize-K</h3>

<p align="center">
  Fork privado de Materialize CSS adaptado para uso interno.
</p>

<p align="center">
  <!-- Badges dinámicos de GitHub Actions -->
  <img src="https://github.com/Koroner616/materialize-k/actions/workflows/build.yml/badge.svg" alt="build status"/>
  <img src="https://img.shields.io/github/package-json/v/Koroner616/materialize-k" alt="version"/>
</p>

---

## Getting started

- Clona el repositorio:  
```bash
git clone git@github.com:Koroner616/materialize-k.git
```
Instala dependencias con PNPM:

```bash
pnpm install
pnpm approve-builds
```
Compila la librería:

```bash
pnpm build
```
Levanta entorno de desarrollo (si añades dev server):

```bash
pnpm dev
```
Incluye los archivos compilados en tu proyecto:

```javascript
// JS
import Materialize from '@Koroner616/materialize-k';

// CSS
import '@Koroner616/materialize-k/dist/css/materialize.css';
```

## Testing
Para correr tests locales:

```bash
pnpm test
```
Para debug y ejecución interactiva en el navegador:

```bash
npx jasmine-browser-runner
# luego abrir http://localhost:8888
```

## Development
Este proyecto incluye todos los componentes originales de Materialize adaptados a un entorno privado.
Puedes editar SCSS/JS y compilar cambios con pnpm build o pnpm dev.

### Recommended workflow
Edita SCSS en sass/ o JS en src/.

Compila cambios con pnpm build.

Ejecuta tests con pnpm test.

Haz commit y push a tu fork privado.

## Supported Browsers
Chrome 35+

Firefox 31+

Safari 9+

Opera

Edge

## License
MIT, uso privado.

---