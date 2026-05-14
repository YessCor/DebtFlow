# TODO - Sidebar Ingresos/Deudas/Préstamos independiente

- [ ] Leer `components/layout/app-sidebar.tsx` y confirmar estructura actual (ya leído).
- [ ] Decidir rutas destino para los 3 botones (probable: /dashboard/my-incomes, /dashboard/my-debts, /dashboard/loans-given) y dejarlas como botones simples.
- [x] Actualizar `app-sidebar.tsx`: eliminar `children` para Ingresos/Deudas/Préstamos y usar `href` directo.

- [ ] Asegurar que los registros se hacen dentro de las páginas destino (ver: `new-income`, `new-debt`, `new-loan-given`).
- [ ] Refactor mínimo: convertir `my-incomes/page.tsx`, `my-debts/page.tsx`, `loans-given/page.tsx` para que el botón "Registrar/Agregar" abra el formulario dentro de la misma página (o redirija a una nueva ruta integrada si se prefiere).
- [ ] Ejecutar build para validar (ya en curso en terminal).
- [ ] Revisar errores de compilación y corregir.

