export interface IncidentData {
  title: string;
  operation: string;
  department: string;
  location: string; // "Where"
  company: string;
  date: string;
  time: string;
  classification: string;
  fatal_risk: string;
  severity: string;
  summary: string;
  how_it_happened: string;
  actions: string;
  image_caption: string;
  box_2d?: number[]; // [ymin, xmin, ymax, xmax] on 0-1000 scale
}

export enum AppState {
  UPLOAD,
  PROCESSING,
  RESULT,
  ERROR
}