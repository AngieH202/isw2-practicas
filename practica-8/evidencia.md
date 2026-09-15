# Práctica 8 - Pipeline verde + URL viva

## Pipeline

El workflow de GitHub Actions se encuentra en:

`.github/workflows/ci.yml`

El pipeline ejecuta automáticamente los tests de las prácticas 4 y 5 cada vez que se realiza un push o un Pull Request.

## Run verde

El pipeline se ejecutó correctamente y los tests de las prácticas 4 y 5 finalizaron exitosamente.

![Run verde] (image.png)

## URL pública
 
https://angieh202.github.io/isw2-practicas/


## ¿Qué corre mi pipeline?

El pipeline descarga el repositorio, configura Node.js y ejecuta los tests de las prácticas 4 y 5.

## ¿Qué agregaría después?

Después agregaría un proceso de lint para detectar problemas de estilo y calidad del código.

También agregaría pruebas E2E para comprobar el funcionamiento completo de la aplicación desde el punto de vista del usuario.

## Branch protection

La rama main tendrá protección para exigir que el check del pipeline sea exitoso antes de aceptar cambios.