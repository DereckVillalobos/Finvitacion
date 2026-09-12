# Invitación Secreta · Solo para Fabi

Experiencia de pantalla completa en React y TypeScript: un sobre de papel se abre con GSAP, su carta se convierte en agua y revela un océano procedural. Un tiburón rosa recorre una curva Catmull–Rom y trae la invitación.

## Desarrollo

- `npm install`
- `npm run dev` — vista local en http://localhost:3000
- `npm run build` — exportación estática en `dist/client`
- `npm run typecheck`
- `npm test`

Node 22.13 o superior. El lockfile fija las dependencias. No requiere variables de entorno, claves ni servicios de terceros para funcionar.

## Arquitectura y narrativa

`ExperienceController` coordina el estado, la carga diferida, el sonido y el foco. `SecretEnvelope` construye las capas físicas del papel; `EnvelopeAnimation` contiene la coreografía GSAP. El mundo 3D se importa de forma diferida y se precarga después de mostrar el sobre.

`OceanWorld` encapsula Canvas y el fallback. `SunsetEnvironment` y `WaterSurface` comparten un cielo procedural, lo que mantiene coherentes los colores del cielo y sus reflejos. El agua combina ondas geométricas, normales analíticas, Fresnel, refracción estilizada, reflejos solares, profundidad y niebla. No es una simulación física de refracción de la escena ni un reflejo planar.

`PinkShark` modela cuerpo, vientre, ojos y aletas; `SharkController` maneja la trayectoria, proximidad del puntero y vuelta de revelación. `BubbleParticles` usa una sola malla instanciada. `InvitationCard` revela el texto en secuencia. `AudioManager` sintetiza los siete efectos con Web Audio.

Estados: `LOCKED → OPENING → TRANSITIONING → OCEAN → SHARK_DISCOVERED → INVITATION → COMPLETE`. Los saltos y eventos repetidos se ignoran. Reiniciar vuelve a `LOCKED`. Para depurar, añadir `?debug=1`; el estado también está en `main[data-state]` y en el evento `experience:state`.

## Rendimiento y accesibilidad

- DPR inicial máximo 1.35 en móvil y 1.75 en escritorio; reducción automática hasta 0.85 si el rendimiento cae.
- El agua reduce subdivisiones; las burbujas pasan de 24 a 12 instancias.
- Geometrías, cielo, texturas de papel y sonido se generan localmente. No se descargan vídeos, texturas raster ni modelos: GLB/Draco/KTX2 no son necesarios para estos recursos procedurales. Si se sustituye el tiburón por un modelo externo, comprimir ese GLB e incorporar los decodificadores solo en el módulo 3D.
- Vectores, uniforms y objetos auxiliares se reutilizan. React Three Fiber libera las geometrías y materiales al desmontar.
- Render y audio se suspenden cuando la pestaña está oculta. GSAP y los temporizadores se limpian al reiniciar o desmontar.
- `prefers-reduced-motion` elimina el vuelo de cámara, natación, giro y burbujas; conserva una revelación breve.
- El sonido se desbloquea al abrir el sello y puede silenciarse.
- Botones semánticos, foco por teclado, alternativa textual al tiburón y mensajes de estado accesibles.
- Sin WebGL2, al perder el contexto o fallar la importación, la invitación continúa con un océano simplificado.

## Verificación y límites

TypeScript y exportación de producción comprobados. Cinco pruebas automatizadas cubren la secuencia de los siete estados, transiciones inválidas, reinicio, bloqueo y ciclo de vida del audio, y ausencia de soporte de audio.

El recorrido completo fue verificado en el navegador publicado: abrir el sello con clic y teclado, transición papel/agua, océano WebGL, clic directo sobre el tiburón, aparición progresiva de todos los textos, estado final, control de sonido y reinicio con restauración del foco. También se comprobó a 400×843 que no hay scroll vertical ni desborde horizontal y que la tarjeta permanece dentro de la pantalla.

React Three Fiber emite una advertencia de obsolescencia interna para `THREE.Clock`; no afecta el funcionamiento y no proviene del código de la experiencia. Los 60 FPS siguen siendo un objetivo, no una medición: falta medir en teléfonos físicos. También queda pendiente repetir el recorrido con WebGL deshabilitado y con la preferencia de movimiento reducido activada en el sistema.
