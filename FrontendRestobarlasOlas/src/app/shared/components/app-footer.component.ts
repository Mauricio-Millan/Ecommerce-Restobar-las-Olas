import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <div class="wave-divider" aria-hidden="true">
      <svg viewBox="0 0 1440 40" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <path d="M0,20 C360,40 1080,0 1440,20 L1440,40 L0,40 Z" fill="#003f5c"/>
      </svg>
    </div>
    <footer class="footer">
      <div class="footer-content">
        <p>&copy; 2026 Restobar Las Olas. Todos los derechos reservados.</p>
        <p class="footer-subtitle">Sabores marinos, cocina de barrio y atención cercana.</p>
      </div>
    </footer>
  `,
  styles: [`
    .wave-divider {
      display: block;
      line-height: 0;
      margin-bottom: -2px;
    }
    .wave-divider svg {
      display: block;
      width: 100%;
      height: 40px;
    }
    .footer {
      background: var(--color-primary-dark, #003f5c);
      color: #e8f4f9;
      padding: 28px 20px 24px;
      text-align: center;
      font-family: 'Inter', sans-serif;
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
      color: var(--sidebar-text, #a8c4d5);
      margin-top: 8px !important;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AppFooterComponent {}
