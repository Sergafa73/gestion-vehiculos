import { LayoutDashboard, Fuel, Gauge, Wrench, ClipboardCheck, Receipt, FileText, History, BarChart3, Car } from 'lucide-react';

// movil: aparece en la barra inferior del móvil. El resto va en "Más".
// pendiente: apartado que se construye en próximas entregas.
export const NAVEGACION = [
  { ruta: '/', etiqueta: 'Panel', icono: LayoutDashboard, movil: true },
  { ruta: '/repostajes', etiqueta: 'Repostajes', icono: Fuel, movil: true, pendiente: true },
  { ruta: '/kilometros', etiqueta: 'Kilómetros', icono: Gauge, pendiente: true },
  { ruta: '/reparaciones', etiqueta: 'Reparaciones', icono: Wrench, pendiente: true },
  { ruta: '/mantenimientos', etiqueta: 'Mantenimientos', icono: ClipboardCheck, pendiente: true },
  { ruta: '/gastos', etiqueta: 'Gastos', icono: Receipt, movil: true, pendiente: true },
  { ruta: '/documentos', etiqueta: 'Documentos', icono: FileText, pendiente: true },
  { ruta: '/historial', etiqueta: 'Historial', icono: History, pendiente: true },
  { ruta: '/informes', etiqueta: 'Informes', icono: BarChart3, pendiente: true },
  { ruta: '/vehiculos', etiqueta: 'Vehículos', icono: Car, movil: true }
];
