Para desplegar el sitio local en tu computadora tenes que tener instalado nodeJs de manera global.

Clonas el repo y abris 2 terminales, en una de las terminales te paras en soporte/front y ejecutas "npm install", en la otra terminal te paras en soporte/back y ejecutas npm install.

Luego en front ejecutas "npm run dev" y en back ejecutas "nodemon" (uso nodemon porque start con watch me falló varias veces).

Me pedis el archivo .env y guardarlo en soporte/back.

Abrir en un navegador la direccion http://lohalhost:5173 y ahi deberias ver desplegado el sitio funcionando.

En el archivo soporte/front/src/componentes/Index.tsx está el front y las modificaciones las tenes que hacer en el return que esta en la parte inferior (está comentado para que lo encuentres fácil). Arriba de ese comentario es todo logica, ahi no modifiques porque se rompe.

Mayormente los estilos que tiene estan el en archivo soporte/front/src/styles.css, pero tiene algunos en el soporte/front/src/index.css, quizas quieras borrar index y trabajarlo desde styles.

