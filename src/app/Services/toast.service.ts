import { Injectable } from "@angular/core"

@Injectable({
  providedIn: "root",
})
export class ToastService {
  constructor() { }

  showSuccess(message: string): void {
    // Implementación del toast de éxito
    console.log("Success:", message)
    // Aquí iría la lógica para mostrar un toast de éxito
  }

  showError(message: string): void {
    // Implementación del toast de error
    console.error("Error:", message)
    // Aquí iría la lógica para mostrar un toast de error
  }

  showInfo(message: string): void {
    // Implementación del toast informativo
    console.info("Info:", message)
    // Aquí iría la lógica para mostrar un toast informativo
  }
}

