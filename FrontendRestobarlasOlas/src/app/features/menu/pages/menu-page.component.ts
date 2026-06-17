import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-menu-page',
  standalone: true,
  imports: [MatIconModule, MatButtonModule],
  template: `
    <div class="coming-soon-shell">
      <div class="coming-soon-content">
        <mat-icon class="big-icon">menu_book</mat-icon>
        <p class="eyebrow">Menú completo</p>
        <h1 class="coming-title">Próximamente</h1>
        <p class="coming-sub">Estamos preparando la carta completa con todos nuestros platos y bebidas.<br>Por ahora puedes ver y pedir desde la página de inicio.</p>
        <a href="/" mat-flat-button color="primary" class="back-btn">Ver carta en inicio</a>
      </div>
    </div>
  `,
  styles: [`
    :host { display: block; font-family: 'Inter', sans-serif; }
    .coming-soon-shell {
      min-height: calc(100vh - 72px);
      background: linear-gradient(160deg, var(--color-primary-dark, #003f5c) 0%, var(--color-primary, #005f87) 60%, var(--color-secondary-dark, #005f56) 100%);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 48px 24px;
      text-align: center;
      color: #fff;
    }
    .coming-soon-content { max-width: 520px; }
    .big-icon {
      font-size: 72px;
      width: 72px;
      height: 72px;
      color: var(--color-secondary-light, #4db6ac);
      margin-bottom: 24px;
    }
    .eyebrow {
      text-transform: uppercase;
      letter-spacing: 0.18em;
      font-size: 0.72rem;
      font-weight: 600;
      color: var(--color-secondary-light, #4db6ac);
      margin: 0 0 12px;
    }
    .coming-title {
      font-family: 'Fraunces', serif;
      font-size: clamp(2rem, 5vw, 3.2rem);
      font-weight: 700;
      margin: 0 0 20px;
      line-height: 1.1;
    }
    .coming-sub {
      font-size: 1.05rem;
      color: rgba(232,244,249,0.85);
      line-height: 1.6;
      margin: 0 0 32px;
    }
    .back-btn { border-radius: 999px !important; padding: 10px 28px !important; font-size: 1rem !important; font-weight: 600 !important; }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class MenuPageComponent {}
