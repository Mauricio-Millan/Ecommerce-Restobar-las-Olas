import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2026 Restobar Las Olas. Todos los derechos reservados.</p>
        <p class="footer-subtitle">Sabores marinos, cocina de barrio y atención cercana.</p>
      </div>
    </footer>
  `,
  styles: [`
    .footer {
      background: linear-gradient(120deg, #0e2a36, #1f6f8b);
      color: #f6f4ef;
      padding: 24px 20px;
      text-align: center;
      box-shadow: 0 -4px 20px rgba(12, 22, 24, 0.1);
      font-family: 'Source Sans 3', sans-serif;
    }
    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
    }
    .footer p {
      margin: 0;
      font-weight: 500;
    }
    .footer-subtitle {
      font-size: 0.85rem;
      opacity: 0.8;
      margin-top: 8px !important;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppFooterComponent {}
